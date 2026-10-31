# 仓库调研：Web 1.0 与 HTML Only 双主题

> 2026-10-28 基于当前 `main` 的代码、构建产物与 Trellis 配置核查。此文件只记录事实与决策依据；实施要求见父/子任务 PRD 与技术设计。

## 1. 设计发现、注册与路由

- 路由发现只看 `src/designs/<id>/Page.astro`，不读取 `design.json` 或 `enabled`；新增目录在下次构建自动出现，dev server 需重启。
- 注册表 eager glob `src/designs/*/design.json`，再强制检查 `DESIGN.md`、`style.css`、`Page.astro`、`messages.ts`。当前 `style.css` 是强制文件，不是页面自动加载的资源。
- `design.json` schema 为 strict：必填 `displayName` / `description` / `enabled` / `source`；可选 `accent` / `generatedBy`；id 由目录名派生。
- `source.type` 为 `official-vendor` / `official-docs-derived` / `third-party-analysis` / `self-produced`；非自产必须提供 `url`、`fetchedAt`、`license`。
- `enabled: false` 只移出随机池和切换页；页面直链仍构建并可加载。
- `src/designs/descriptions.ts` 是独立的切换页本地化说明索引，缺条目时回退 `design.json.description`；两套新设计都需增加三语条目。
- `Preview.astro`、`tokens.css`、私有组件和 assets 均为可选，没有全局注册校验。

## 2. 页面数据与共享资源

- 每页调用 `loadDesignView(id, Astro.url.pathname)`；locale 由请求路径首段与 `i18n.locales[].path` 精确匹配。
- `view` 提供当前语言 profile、locale 列表、共享 chrome 文案、design 元信息、统一 head 与操作菜单配置。
- `HeadMeta` 输出 charset、viewport、title、description、canonical、alternate、robots 与 favicon；不输出 CSS/JS，但 favicon 会产生资源请求。
- `Font` 每次调用会生成内联 `<style>` 与 `@font-face`；`Reveal` 生成两个脚本；`ContextMenu` 生成内联 `<style>`、两份菜单 DOM、JSON script 与模块 script；`InfraStyles` 生成内联全局样式。
- 页面 CSS 由各自 `Page.astro` 显式 `import './style.css'` 后生成 `<link rel="stylesheet">`，注册表本身不建立 CSS 依赖。
- `dist/zh-cn/terminal/index.html` 实测：2 个 `<style>`、4 个 `<script>`、1 个 stylesheet link、0 preload/modulepreload。

## 3. 主题、随机、缓存与语言

- 存储键不含 locale，格式为 `{ designId, expiresAt }`；随机池只取 `enabled` 设计。
- 入口脚本负责首访随机、24 小时缓存与避免立即重复；直接访问设计 URL 不写存储。
- 切换页卡片是普通 `<a>`，无 JS 仍可导航；其脚本只负责记录选择和标记当前项。
- 操作菜单的随机动作在 design 页排除当前设计，在 switcher / 404 走全池。
- 语言切换保持页面上下文：design → 同 id，switcher → switcher，404 → 入口；切换语言不改主题、不重置随机窗口。
- `BASE` 始终归一化为带尾斜杠，内部链接必须使用 `withBase()` / `localeHref()` / `localeDesignHref()`。
- HTML-only 页面可被入口随机选中、可在切换页手动选择；静态页面自身无法实现“随机一个设计”或写入 localStorage。

## 4. 严格 HTML-only 的兼容边界

- 可复用：`loadDesignView`、`HeadMeta`、普通 `<a>`、profile 与 messages 数据、三语路由、SEO 与 base 处理。
- 必须避开：页面 `style.css` import、`Font`、`Reveal`、`ContextMenu`、`InfraStyles`、内联 style/script。
- 允许：`<link rel="canonical">`、`<link rel="alternate">`、`<link rel="icon">`、meta 与语义 HTML。
- 页面内主题切换通过普通链接进入 `/{locale}/designs/`，语言切换通过同主题三语链接；`manualSwitch: false` 时不渲染设计切换链接。
- 验收范围是该 HTML-only 页面、其直接加载资源及链接正确性；离开该主题后的目标页仍可正常使用 CSS/JS。

## 5. 构建与测试现状

- `npm run check` 仅运行 `astro check`；`npm run build` 为 `check + astro build`。
- GitHub Actions 只执行 `npm ci` 与 `npm run build`，没有独立测试、Playwright 或视觉回归。
- 当前 16 套设计 × 3 语言共 73 页；新增两套预计 79 页。
- 没有最终 HTML 的资源禁令测试，因此 HTML-only 必须新增产物级验证器并纳入 `npm run build`。
- `messages.ts` 目前只校验文件存在；其 locale 覆盖依赖各页面手写固定 union + `astro check`，不是注册表按 `i18n.locales` 动态校验。

## 6. 已知既有缺陷（本次不修）

- `ContextMenu.astro` 的桌面菜单、移动面板、悬浮球初始均带 `hidden`，其 CSS 又强制隐藏 `[hidden]`；设计页无 `<noscript>` 语言回退。因此 `AGENTS.md` 中“移动面板静态 DOM 充当无 JS 语言切换回退”的现有表述不成立。
- `messages.ts` 的 locale 完整性没有注册表级强校验；新增 locale 时可能只在运行时暴露缺失。
- `_draft` 目录在路由扫描中被跳过，但注册表 glob 未跳过，目录内若有 `design.json` 仍会触发无效 id 错误。

这些缺陷应在本次任务文档与验证记录中如实登记，不在两个新主题的实现中顺带重构。

## 7. 现成可复用先例

- `govuk` 证明系统字体与完全静止设计可以合法存在：页面不渲染 `<Font>` / `<Reveal>`，只保留浏览器原生按钮运动。
- `terminal` / `archive` / `material3` 展示完整常规主题壳：`loadDesignView` → `HeadMeta` → 可选字体/动效 → 私有 CSS → `ContextMenu`。
- `SwitcherPage` 对预览 eager glob、按族去重字体，并在缺失预览时回退 accent 色点。
- `design-page-verify` 已覆盖构建、产物隔离、多语言、a11y、桌面/触控、降级、检测器和验证记录。
