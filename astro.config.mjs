// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { parse as parseYaml } from 'yaml';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/**
 * 设计路由注入（SPEC §10.4）：
 * - src/designs/<id>/ 每个目录注入一条真实路由（Page.astro 即页面）。
 *   使用注入路由而不是动态 [design] 路由，是为了保证"每套设计页只加载自己的 CSS"：
 *   动态 import 会把所有设计的样式文件注入到所有页面的 <link>。
 * - manualSwitch !== false 时注入切换页 '/designs'；否则该路径不构建（404）。
 * - 新增/删除设计目录后需重启 dev 服务器；构建（CI）总是重新读取目录。
 * - 任何非法设计（缺文件、id 非法等）由构建期注册表校验报错，这里只做最小过滤。
 */
/** @type {import('astro').AstroIntegration} */
const designRoutes = {
  name: 'senrenbanka-design-routes',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      const designsDir = path.join(projectRoot, 'src', 'designs');
      if (fs.existsSync(designsDir)) {
        const ids = fs
          .readdirSync(designsDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
          .map((entry) => entry.name)
          .filter((id) => id !== 'designs')
          .filter((id) => fs.existsSync(path.join(designsDir, id, 'Page.astro')));
        for (const id of ids) {
          injectRoute({ pattern: `/${id}`, entrypoint: `./src/designs/${id}/Page.astro` });
        }
      }

      let manualSwitch = true;
      const configPath = path.join(projectRoot, 'src', 'data', 'site.config.yaml');
      if (fs.existsSync(configPath)) {
        const raw = parseYaml(fs.readFileSync(configPath, 'utf8'));
        if (raw?.design?.manualSwitch === false) {
          manualSwitch = false;
        }
      }
      if (manualSwitch) {
        injectRoute({ pattern: '/designs', entrypoint: './src/infra/SwitcherPage.astro' });
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