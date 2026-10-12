// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { parse as parseYaml } from 'yaml';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/**
 * 从 site.config.yaml 读 i18n / design 配置。
 * 这里只做**最小过滤**（路由生成需要知道有哪些语言、manualSwitch 是否开启）；
 * 完整契约校验由构建期注册表与 Zod schema 负责（SPEC §5.5）。
 */
function readSiteConfig() {
  const configPath = path.join(projectRoot, 'src', 'data', 'site.config.yaml');
  /** @type {{ locales: Array<{ path: string }>, manualSwitch: boolean }} */
  const fallback = { locales: [{ path: 'zh-cn' }], manualSwitch: true };
  if (!fs.existsSync(configPath)) return fallback;
  const raw = parseYaml(fs.readFileSync(configPath, 'utf8'));
  /** @type {unknown} */
  const declared = raw?.i18n?.locales;
  const paths = Array.isArray(declared)
    ? declared
        .map((/** @type {any} */ locale) => locale?.path)
        .filter((/** @type {any} */ value) => typeof value === 'string' && value.length > 0)
    : [];
  return {
    locales: paths.length > 0 ? paths.map((/** @type {any} */ value) => ({ path: value })) : fallback.locales,
    manualSwitch: raw?.design?.manualSwitch !== false,
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

      const { locales, manualSwitch } = readSiteConfig();

      for (const locale of locales) {
        for (const id of ids) {
          injectRoute({
            pattern: `/${locale.path}/${id}`,
            entrypoint: `./src/designs/${id}/Page.astro`,
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
      for (const id of ids) {
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
  },
  // 字体：构建期从已安装的 @fontsource 包自托管（remote: false → 离线可构建），
  // 运行时零第三方请求；各设计在自己页面内用 <Font cssVariable> 引入（SPEC §8.5）。
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Fraunces Variable',
      cssVariable: '--font-fraunces',
      fallbacks: ['Georgia', 'Songti SC', 'serif'],
      options: { package: '@fontsource-variable/fraunces' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'JetBrains Mono Variable',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      options: { package: '@fontsource-variable/jetbrains-mono' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Roboto Flex Variable',
      cssVariable: '--font-roboto-flex',
      fallbacks: ['Roboto', 'system-ui', 'Arial', 'sans-serif'],
      options: { package: '@fontsource-variable/roboto-flex' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Geist Variable',
      cssVariable: '--font-geist',
      fallbacks: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      options: { package: '@fontsource-variable/geist' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Geist Mono Variable',
      cssVariable: '--font-geist-mono',
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      options: { package: '@fontsource-variable/geist-mono' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Inter Variable',
      cssVariable: '--font-inter',
      fallbacks: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      options: { package: '@fontsource-variable/inter' },
    },
  ],
});