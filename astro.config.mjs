// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { parse as parseYaml } from 'yaml';
import { localFontDefinitions } from './src/fonts/generated.ts';
import dns from 'node:dns';

// dev 进程内让 localhost 解析 IPv4 优先：本机 Windows 下 localhost 常解析为仅 ::1，
// Vite 会只监听 ::1，导致 http://127.0.0.1:4321 拒绝连接。ipv4first 后 Vite 会在
// 127.0.0.1 与 ::1 双栈监听，两个回环地址都可访问。
dns.setDefaultResultOrder('ipv4first');

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/**
 * @template T
 * @param {ReadonlyArray<T>} values
 * @returns {[T, ...T[]]}
 */
function requireNonEmpty(values) {
  if (values.length === 0) throw new Error('generated font definition has no variants');
  return /** @type {[T, ...T[]]} */ ([...values]);
}

/**
 * Astro's npm provider resolves package CSS locally but rewrites every font URL
 * to jsDelivr. The build fetcher still downloads those URLs even when remote
 * resolution is disabled, which breaks offline builds. Wrap the same provider
 * and map only its package URLs back to installed node_modules files.
 *
 * @returns {ReturnType<typeof fontProviders.npm>}
 */
function localNpmProvider() {
  const provider = fontProviders.npm({ remote: false });
  /** @type {URL | undefined} */
  let projectRoot;
  return {
    name: provider.name,
    config: { remote: false, localFiles: true },
    async init(context) {
      projectRoot = context.root;
      await provider.init?.(context);
    },
    async listFonts() {
      return provider.listFonts?.();
    },
    async resolveFont(options) {
      const result = await provider.resolveFont(options);
      if (!result || !projectRoot) return result;
      const nodeModules = path.join(fileURLToPath(projectRoot), 'node_modules');
      const fonts = await Promise.all(
        result.fonts.map(async (font) => ({
          ...font,
          src: await Promise.all(
            font.src.map(async (source) => {
              if (!('url' in source) || typeof source.url !== 'string') return source;
              const match =
                /^https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/]+\/)?[^@/]+)@[^/]+\/(.+)$/.exec(
                  source.url,
                );
              if (!match) {
                if (/^https?:/i.test(source.url)) {
                  throw new Error(
                    `npm provider returned an external font URL that is not mapped to node_modules: ${source.url}`,
                  );
                }
                return source;
              }
              const localPath = path.resolve(
                nodeModules,
                ...decodeURIComponent(match[1]).split('/'),
                ...decodeURIComponent(match[2]).split('/'),
              );
              if (!localPath.startsWith(`${nodeModules}${path.sep}`)) {
                throw new Error(`npm font path escapes node_modules: ${source.url}`);
              }
              await fs.promises.access(localPath);
              return { ...source, url: localPath };
            }),
          ),
        })),
      );
      return { ...result, fonts };
    },
  };
}

/**
 * 从 site.config.yaml 读 i18n / design 配置。
 * 这里只做**最小过滤**（路由生成需要知道有哪些语言、manualSwitch 是否开启）；
 * 完整契约校验由构建期注册表与 Zod schema 负责（SPEC §5.5）。
 */
function readSiteConfig() {
  const configPath = path.join(projectRoot, 'src', 'data', 'site.config.yaml');
  /** @type {{ locales: Array<{ code: string, path: string }>, manualSwitch: boolean, exclude: string[] }} */
  const fallback = { locales: [{ code: 'zh-CN', path: 'zh-cn' }], manualSwitch: true, exclude: [] };
  if (!fs.existsSync(configPath)) return fallback;
  const raw = parseYaml(fs.readFileSync(configPath, 'utf8'));
  /** @type {unknown} */
  const declared = raw?.i18n?.locales;
  const locales = Array.isArray(declared)
    ? declared
        .map((/** @type {any} */ locale) => ({ code: locale?.code, path: locale?.path }))
        .filter(
          (/** @type {any} */ locale) =>
            typeof locale.code === 'string' &&
            locale.code.length > 0 &&
            typeof locale.path === 'string' &&
            locale.path.length > 0,
        )
    : [];
  const declaredExclude = raw?.design?.exclude;
  const exclude = Array.isArray(declaredExclude)
    ? declaredExclude.filter((/** @type {unknown} */ id) => typeof id === 'string' && id.length > 0)
    : [];
  return {
    locales: locales.length > 0 ? locales : fallback.locales,
    manualSwitch: raw?.design?.manualSwitch !== false,
    exclude,
  };
}

/**
 * 多语言设计路由（SPEC §5.5 / §10.4）：
 * - src/designs/<id>/ 的 Page.astro 被注册到**每种语言**的固定路径：
 *   `/<locale.path>/<id>` → `./src/designs/<id>/Page.astro`。同一 entrypoint 多路由，
 *   页面在构建期按路径解析当前语言，无需动态 import。
 * - 使用显式注入而不是动态 `[design]` 路由，是为了保证"每套设计页只加载自己的 CSS"：
 *   动态 import 会把所有设计的样式文件注入到所有页面的 <link>（本机已实测）。
 * - 语言根入口 `/<locale.path>/` 走共享入口页，沿用既有 random / fixed 选择机制。
 * - manualSwitch !== false 时注入 `/<locale.path>/designs`；否则不构建（404）。
 * - 旧的无语言前缀路径 `/<design>/` 与 `/designs/` 保留为**默认语言兼容入口**
 *   （静态 meta refresh + canonical + noindex，不做真 301——静态托管无法在代码内实现）。
 * - `site.config.yaml` 的 `design.exclude` 是部署级打包排除：被排除设计不注入任何路由。
 * - 新增/删除设计目录后需重启 dev 服务器；构建（CI）总是重新读取目录。
 */
/** @type {import('astro').AstroIntegration} */
const designRoutes = {
  name: 'senrenbanka-design-routes',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      const designsDir = path.join(projectRoot, 'src', 'designs');
      const ids = fs.existsSync(designsDir)
        ? fs
            .readdirSync(designsDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
            .map((entry) => entry.name)
            .filter((id) => id !== 'designs')
            .filter((id) => fs.existsSync(path.join(designsDir, id, 'Page.astro')))
        : [];

      const { locales, manualSwitch, exclude } = readSiteConfig();
      // design.exclude 是部署级打包范围：路由与旧路径跳转只注入未排除的设计。
      const packagedIds = ids.filter((id) => !exclude.includes(id));

      // design.json 的 locales 是页面生成白名单；缺失时按全量处理，由注册表在构建期给出明确错误。
      const designs = packagedIds.map((id) => {
        const meta = JSON.parse(fs.readFileSync(path.join(designsDir, id, 'design.json'), 'utf8'));
        return { id, locales: Array.isArray(meta.locales) ? meta.locales : null };
      });

      for (const locale of locales) {
        for (const design of designs) {
          if (design.locales && !design.locales.includes(locale.code)) continue;
          injectRoute({
            pattern: `/${locale.path}/${design.id}`,
            entrypoint: `./src/designs/${design.id}/Page.astro`,
          });
        }
        injectRoute({
          pattern: `/${locale.path}`,
          entrypoint: './src/infra/LocaleIndex.astro',
        });
        if (manualSwitch) {
          injectRoute({
            pattern: `/${locale.path}/designs`,
            entrypoint: './src/infra/SwitcherPage.astro',
          });
        }
      }

      // 旧路径兼容入口（无 JavaScript 依赖的静态跳转页）
      for (const id of packagedIds) {
        injectRoute({ pattern: `/${id}`, entrypoint: './src/infra/LegacyRedirect.astro' });
      }
      if (manualSwitch) {
        injectRoute({ pattern: '/designs', entrypoint: './src/infra/LegacyRedirect.astro' });
      }
    },
  },
};

// site / base 由环境变量驱动（SPEC §10.4）：
// - GitHub Actions 自动注入 SITE_URL / BASE_PATH（fork 后零配置）
// - CF Pages / Vercel 默认根路径；如需 canonical 绝对地址，在平台面板设置 SITE_URL
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH ?? '/',
  integrations: [designRoutes],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: 'localhost',
      watch: {
        // dev 启动慢 / fetchModule 60s 超时的根因：默认 watcher 会为项目内每个目录
        // 建立监听句柄（.cache 约 1.7k、.local-fonts 约 3.8k、.astro 约 1.1k 个目录，
        // 其中 .cache/fonts 含 5.5k 字体文件），初始化期间长时间占住主线程，
        // module-runner 的 fetchModule invoke（60s 超时）无法被应答，触发
        // "transport invoke timed out" 与 server app 创建失败。
        // dev 只需感知 src / public / 根配置的变更，生成物与缓存树一律不监听。
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.cache/**',
          '**/.local-fonts/**',
          '**/.astro/**',
          '**/dist/**',
          '**/.trellis/**',
        ],
      },
    },
  },
  // 字体（SPEC §8.5）：六个 npm provider family 保留 Fontsource 包；
  // 20 个项目自有 family 由 fonts.config.json → fonts.lock.json →
  // src/fonts/generated.ts 生成后经 local provider 读取 .cache/fonts/。
  // 各设计仍只在自己页面内用 <Font cssVariable> 引入。
  // registration 的 fallbacks 会封进 --font-*，因此这里只暴露主 face；
  // 完整系统/CJK 回退顺序由各设计 style.css 拥有。
  fonts: [
    {
      provider: localNpmProvider(),
      name: 'Fraunces Variable',
      cssVariable: '--font-fraunces',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/fraunces' },
    },
    {
      provider: localNpmProvider(),
      name: 'JetBrains Mono Variable',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/jetbrains-mono' },
    },
    {
      provider: localNpmProvider(),
      name: 'Roboto Flex Variable',
      cssVariable: '--font-roboto-flex',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/roboto-flex' },
    },
    {
      provider: localNpmProvider(),
      name: 'Geist Variable',
      cssVariable: '--font-geist',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/geist' },
    },
    {
      provider: localNpmProvider(),
      name: 'Geist Mono Variable',
      cssVariable: '--font-geist-mono',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/geist-mono' },
    },
    {
      provider: localNpmProvider(),
      name: 'Inter Variable',
      cssVariable: '--font-inter',
      fallbacks: [],
      optimizedFallbacks: false,
      options: { package: '@fontsource-variable/inter' },
    },
    ...localFontDefinitions.map((definition) => ({
      provider: fontProviders.local(),
      name: definition.name,
      cssVariable: definition.cssVariable,
      fallbacks: [],
      optimizedFallbacks: false,
      options: { variants: requireNonEmpty(definition.variants) },
    })),
  ],
});
