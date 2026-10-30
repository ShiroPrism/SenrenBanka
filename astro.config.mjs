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

// fontsource 标准子集码位（本地 provider 的同族多文件必须用 unicodeRange 区隔，
// 否则后声明的 @font-face 会遮蔽前者；范围与 @fontsource 的 latin / latin-ext 文件一致）。
/** @type {[string, ...string[]]} */
const LATIN_RANGE = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2191',
  'U+2193',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
];
/** @type {[string, ...string[]]} */
const LATIN_EXT_RANGE = [
  'U+0100-02BA',
  'U+02BD-02C5',
  'U+02C7-02CC',
  'U+02CE-02D7',
  'U+02DD-02FF',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+1D00-1DBF',
  'U+1E00-1E9F',
  'U+1EF2-1EFF',
  'U+2020',
  'U+20A0-20AB',
  'U+20AD-20C0',
  'U+2113',
  'U+2C60-2C7F',
  'U+A720-A7FF',
];

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
  // 字体（SPEC §8.5）：既有六套设计沿用 npm provider（首次取件后离线可构建）；
  // 拟物方向新字体一律经 fontProviders.local() 从 src/assets/fonts/ 读取（构建期零网络）。
  // 各设计在自己页面内用 <Font cssVariable> 引入。
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Fraunces Variable',
      cssVariable: '--font-fraunces',
      fallbacks: ['Georgia', 'Songti SC', 'SimSun', 'Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
      options: { package: '@fontsource-variable/fraunces' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'JetBrains Mono Variable',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Consolas',
        'Segoe UI Symbol',
        'Apple Symbols',
        'PingFang SC',
        'Microsoft YaHei',
        'Hiragino Sans',
        'Yu Gothic UI',
        'monospace',
      ],
      options: { package: '@fontsource-variable/jetbrains-mono' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Roboto Flex Variable',
      cssVariable: '--font-roboto-flex',
      fallbacks: [
        'Roboto',
        'system-ui',
        '-apple-system',
        'Arial',
        'PingFang SC',
        'Microsoft YaHei',
        'Hiragino Sans',
        'Yu Gothic UI',
        'sans-serif',
      ],
      options: { package: '@fontsource-variable/roboto-flex' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Geist Variable',
      cssVariable: '--font-geist',
      fallbacks: [
        'system-ui',
        '-apple-system',
        'PingFang SC',
        'Microsoft YaHei',
        'Hiragino Sans',
        'Yu Gothic UI',
        'sans-serif',
      ],
      options: { package: '@fontsource-variable/geist' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Geist Mono Variable',
      cssVariable: '--font-geist-mono',
      fallbacks: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Consolas',
        'Segoe UI Symbol',
        'Apple Symbols',
        'PingFang SC',
        'Microsoft YaHei',
        'Hiragino Sans',
        'Yu Gothic UI',
        'monospace',
      ],
      options: { package: '@fontsource-variable/geist-mono' },
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Inter Variable',
      cssVariable: '--font-inter',
      fallbacks: [
        'system-ui',
        '-apple-system',
        'PingFang SC',
        'Microsoft YaHei',
        'Hiragino Sans',
        'Yu Gothic UI',
        'sans-serif',
      ],
      options: { package: '@fontsource-variable/inter' },
    },
    // ════════ 拟物方向新主题字体（2026-10-17 起接入）════════
    // 机制：npm 包取件入库 + CJK 子集 → fontProviders.local() 读取。
    //      构建期零网络、全平台可复现。
    // 原因（2026-10-17 实测）：npm provider 构建期取件依赖 cdn.jsdelivr.net，且 provider
    //      选项在配置管线中不生效；在本机受限网络下并发取件不可靠（大量 ECONNRESET）。
    // 来源 / 许可 / 子集说明：src/assets/fonts/README.md；选型依据：docs/fonts/selection-guide.md。

    // —— 拉丁正文 / 技术 ——
    {
      provider: fontProviders.local(),
      name: 'Cutive Mono',
      cssVariable: '--font-cutive-mono',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/cutive-mono/cutive-mono-latin-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/cutive-mono/cutive-mono-latin-ext-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_EXT_RANGE },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Courier Prime',
      cssVariable: '--font-courier-prime',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-400-italic.woff2'], weight: '400', style: 'italic', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-700-normal.woff2'], weight: '700', style: 'normal', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-700-italic.woff2'], weight: '700', style: 'italic', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-ext-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_EXT_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-ext-400-italic.woff2'], weight: '400', style: 'italic', unicodeRange: LATIN_EXT_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-ext-700-normal.woff2'], weight: '700', style: 'normal', unicodeRange: LATIN_EXT_RANGE },
          { src: ['./src/assets/fonts/courier-prime/courier-prime-latin-ext-700-italic.woff2'], weight: '700', style: 'italic', unicodeRange: LATIN_EXT_RANGE },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Sorts Mill Goudy',
      cssVariable: '--font-sorts-mill-goudy',
      fallbacks: ['Georgia', 'Times New Roman'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/sorts-mill-goudy/sorts-mill-goudy-latin-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/sorts-mill-goudy/sorts-mill-goudy-latin-400-italic.woff2'], weight: '400', style: 'italic', unicodeRange: LATIN_RANGE },
          { src: ['./src/assets/fonts/sorts-mill-goudy/sorts-mill-goudy-latin-ext-400-normal.woff2'], weight: '400', style: 'normal', unicodeRange: LATIN_EXT_RANGE },
          { src: ['./src/assets/fonts/sorts-mill-goudy/sorts-mill-goudy-latin-ext-400-italic.woff2'], weight: '400', style: 'italic', unicodeRange: LATIN_EXT_RANGE },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Share Tech Mono',
      cssVariable: '--font-share-tech-mono',
      fallbacks: ['Consolas', 'Courier New', 'monospace'],
      options: {
        variants: [{ src: ['./src/assets/fonts/share-tech-mono/share-tech-mono-latin-400-normal.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'League Mono',
      cssVariable: '--font-league-mono',
      fallbacks: ['Consolas', 'Courier New'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/league-mono/league-mono-latin-400-normal.woff2'], weight: '400', style: 'normal' },
          { src: ['./src/assets/fonts/league-mono/league-mono-latin-700-normal.woff2'], weight: '700', style: 'normal' },
        ],
      },
    },

    // —— 显示 / 特色 ——
    {
      provider: fontProviders.local(),
      name: 'Silkscreen',
      cssVariable: '--font-silkscreen',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/silkscreen/silkscreen-latin-400-normal.woff2'], weight: '400', style: 'normal' },
          { src: ['./src/assets/fonts/silkscreen/silkscreen-latin-700-normal.woff2'], weight: '700', style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Prociono',
      cssVariable: '--font-prociono',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/prociono/prociono-latin-400-normal.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Handjet Variable',
      cssVariable: '--font-handjet',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [{ src: ['./src/assets/fonts/handjet/handjet-latin-full-normal.woff2'], weight: '100 900', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'League Gothic Variable',
      cssVariable: '--font-league-gothic',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/league-gothic/league-gothic-latin-wdth-normal.woff2'], weight: '400', style: 'normal', stretch: '75% 100%' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Blackout 2AM',
      cssVariable: '--font-blackout',
      fallbacks: ['Impact', 'Arial Black', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/blackout/Blackout2AM.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'UglyTypist',
      cssVariable: '--font-uglytypist',
      fallbacks: ['Segoe Print', 'Comic Sans MS'],
      options: {
        variants: [{ src: ['./src/assets/fonts/uglytypist/UglyTypist.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Format 1452',
      cssVariable: '--font-format-1452',
      fallbacks: ['Arial Narrow', 'Helvetica', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/format-1452/Format_1452.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Fredoka Variable',
      cssVariable: '--font-fredoka',
      fallbacks: ['system-ui', 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans', 'Yu Gothic UI', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/fredoka/fredoka-latin-wght-normal.woff2'],
            weight: '300 700',
            style: 'normal',
            unicodeRange: LATIN_RANGE,
          },
          {
            src: ['./src/assets/fonts/fredoka/fredoka-latin-ext-wght-normal.woff2'],
            weight: '300 700',
            style: 'normal',
            unicodeRange: LATIN_EXT_RANGE,
          },
        ],
      },
    },

    // —— 数字 / 段码 ——
    {
      provider: fontProviders.local(),
      name: 'DSEG7 Classic',
      cssVariable: '--font-dseg7',
      fallbacks: ['Consolas', 'monospace'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/dseg/DSEG7Classic-Regular.woff2'], weight: '400', style: 'normal' },
          { src: ['./src/assets/fonts/dseg/DSEG7Classic-Bold.woff2'], weight: '700', style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'DSEG14 Classic',
      cssVariable: '--font-dseg14',
      fallbacks: ['Consolas', 'monospace'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/dseg/DSEG14Classic-Regular.woff2'], weight: '400', style: 'normal' },
          { src: ['./src/assets/fonts/dseg/DSEG14Classic-Bold.woff2'], weight: '700', style: 'normal' },
        ],
      },
    },

    // —— 打字机 ——
    {
      provider: fontProviders.local(),
      name: 'TT2020 Base',
      cssVariable: '--font-tt2020',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/tt2020/TT2020Base-Regular.woff2'], weight: '400', style: 'normal' },
          { src: ['./src/assets/fonts/tt2020/TT2020Base-Italic.woff2'], weight: '400', style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'TT2020 Style D',
      cssVariable: '--font-tt2020-styled',
      fallbacks: ['Courier New', 'Courier'],
      options: {
        variants: [{ src: ['./src/assets/fonts/tt2020/TT2020StyleD-Regular-subset.woff2'], weight: '400', style: 'normal' }],
      },
    },

    // —— 中文（子集：站内用字，见 src/assets/fonts/README.md）——
    {
      provider: fontProviders.local(),
      name: 'Zhuque Fangsong',
      cssVariable: '--font-zhuque',
      fallbacks: ['Songti SC', 'SimSun', 'serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/zhuque-fangsong/ZhuqueFangsong-Regular-subset.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Ark Pixel 12px',
      cssVariable: '--font-ark-pixel',
      fallbacks: ['SimSun', 'monospace'],
      options: {
        variants: [{ src: ['./src/assets/fonts/ark-pixel-12px/ark-pixel-12px-monospaced-zh_hans-subset.woff2'], weight: '400', style: 'normal' }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'LXGW WenKai GB',
      cssVariable: '--font-lxgw',
      fallbacks: ['PingFang SC', 'Microsoft YaHei', 'Hiragino Sans', 'Yu Gothic UI', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/lxgw-wenkai/LXGWWenKaiGB-Medium-subset.woff2'],
            weight: '500',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
