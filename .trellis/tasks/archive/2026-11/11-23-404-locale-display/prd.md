# 404 页面按 Locale 展示多语言内容

## Goal

让单份静态 404 在运行时按「请求路径 → 语言偏好 → 浏览器语言 → 默认 Locale」解析展示语言，
预渲染所有已配置 Locale 的内容区块，并让共享操作菜单同步使用同一 Locale；无 JavaScript 时
保持默认 Locale 内容与语言入口回退。不新增每语言 404 页面。

## Requirements

- R1 **单份产物**：仍只构建一份 `dist/404.html`；不得为每种 Locale 新增 404 页面或依赖托管
  平台的按路径 404 路由。
- R2 **预渲染全部 Locale**：同一份 HTML 预渲染 `site.config.yaml` 中全部 Locale 的 404 正文、
  返回入口链接、全部设计链接与默认设计链接；默认 Locale 区块在无 JavaScript 时可见。
- R3 **展示语言解析**：运行时先取请求路径首段并精确匹配 `i18n.locales[].path`；未命中时读取
  Locale preference；再按 `navigator.languages`（缺失时 `navigator.language`）最长标签匹配；
  最后回退默认 Locale。未配置的路径语言视为无路径语言。
- R4 **首屏一致**：内联解析脚本在首屏绘制前设置 `html[lang]`、`data-404-locale`（值为 Locale
  path）与本地化 `<title>`；CSS 只显示对应 Locale 区块，不得先显示默认语言再闪切。
- R5 **无 JavaScript 回退**：无 JS 时固定显示默认 Locale 的 404 内容，并保留现有 `<noscript>`
  语言切换链接；不得出现空白页或隐藏全部内容。
- R6 **共享菜单一致**：404 的共享操作菜单只保留一份 DOM；运行时按解析出的 Locale 同步菜单
  标签、分组标题、Toast、无障碍名称、当前语言标记、随机目标池、全部设计链接与分享标题。
- R7 **语言切换语义**：404 菜单中的语言项仍指向目标 Locale 的入口页；用户显式点击语言项时
  仍按既有契约写入 Locale preference。
- R8 **不写入偏好**：404 页面加载、路径解析、浏览器语言回退均不得写入或清除 Locale preference。
- R9 **既有行为不变**：404 继续 `noindex, follow`；继续使用 `context.kind = 'not-found'`；
  随机在 404 走全池；`manualSwitch`、设计打包范围、语言数量、base 前缀与 `ContextMenu`
  的键盘 / 触控行为不得回归。
- R10 **单语言 fork**：只配置一种 Locale 时仍可构建；404 只渲染一个区块，菜单语言组不渲染，
  不产生空链接或空选择器。

## Non-goals

- 不新增每 Locale 的 404 HTML 文件、Hosting rewrite/edge function 或服务端语言检测。
- 不改变 404 语言切换「进入目标 Locale 入口页」的既有目标。
- 不为 404 新增解释性文案或重写现有翻译。
- 不改变设计页、切换页、入口页与旧路径跳转页的语言行为。

## Acceptance Criteria

- [x] A1 `npm test`、`npm run test:locale`、`npx astro build` 与独立 `check` 门禁通过；新增 404
  语言解析的 Node 回归测试覆盖路径优先、偏好优先、浏览器最长匹配、默认回退、base 前缀、非法偏好
  忽略与不写偏好。`npm run build` 包装脚本仅因既有 10 个 `.trellis/**` worktree CRLF 在 `check:eol`
  停止，与本任务无关。
- [x] A2 `dist/404.html` 只有一份；包含全部 Locale 的 `[data-404-panel]` 与默认区块；原始 HTML
  不设置 `data-404-locale`，因此无 JS 时默认区块可见。
- [x] A3 内联脚本在真实静态服务器保留错误 URL 的场景下按 `/en/nonexistent/`、`/ja/nonexistent/`、
  `/zh-tw/nonexistent/`、`/ko/nonexistent/` 设置正确 `html[lang]`、`data-404-locale` 与标题；
  路径优先于已存偏好与浏览器语言。
- [x] A4 无路径 Locale 时，已存 Locale preference 优先于浏览器语言；非法偏好被忽略且不被删除；
  浏览器 `zh-Hant-HK` 命中 `zh-TW`，`en-US` 命中 `en`，未支持语言回退默认 Locale。
- [x] A5 404 页面加载不写/不删 Locale preference；菜单中显式点击语言项写入目标 Locale path，
  并导航到 `/<target-locale>/`。
- [x] A6 解析为 `en` / `ja` / `zh-TW` / `ko` 时，正文、返回入口、全部设计、默认设计链接、`<title>`、
  `html[lang]` 与隐藏区块选择均一致；默认设计 card 的目标带当前 Locale 前缀。
- [x] A7 404 共享菜单在解析 Locale 后整组标签、Toast、`aria-label`、当前语言勾选、随机目标、
  全部设计 href 与分享标题正确；`manualSwitch:false` 时仍无设计组；只有一个菜单 DOM。
- [x] A8 无 JavaScript 时默认 Locale 内容可见，`<noscript>` 语言链接存在且目标为各 Locale 入口；
  桌面 / 移动菜单行为保持既有验证结论。
- [x] A9 `BASE_PATH=/demo` 构建下，404 面板链接、脚本路径解析与菜单目标均带 `/demo`；路径语言
  识别不会把 `demo` 误当 Locale。
- [x] A10 单语言配置构建通过：一个 404 区块、无语言组、无空菜单项；测试完成后恢复示例配置。
- [x] A11 `docs/verification/shared.md` 与 `docs/verification/action-menu.md` 更新为实际实测状态；
  `CONTEXT.md`、ADR、`SPEC.md`、`README.md`、规则文档与 `change-log/0.22.1.md` 已同步。
- [x] A12 版本号与变更日志同步为 `0.22.1`；未修改设计页视觉或字体。

## Notes

- 技术设计见 `design.md`，执行顺序与验证命令见 `implement.md`。
- 这是共享机制改动，必须按 `design-page-verify` 执行并更新验证记录。
- 当前验证摘要：`npm test` 116/116、`npm run test:locale` 24/24、`npm run check:docs` 8/8；
  `npx astro build` 175 页；`dist/404.html` 42,970 B / 5 个 Locale panel；`dist` 7,920,458 B；
  `verify:html-only` 5 页、`verify:sections` 135 页 / 760 分区、`fonts:audit` 0 孤儿。
