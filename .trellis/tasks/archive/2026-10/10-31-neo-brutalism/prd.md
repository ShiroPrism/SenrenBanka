# 新粗野设计（`brutal`）PRD

## Goal

新增一套 `styled` 设计 `brutal`：以新粗野主义/反设计为视觉语言，把同一份个人资料做成一组高对比、硬边、可读的个人标牌。它是现有 24 套之外「反精致 / web-native」轴的补齐，不替代任何现有设计。

## 设计方向（已定）

- **隐喻**：抗议海报 + 货运标签 + 贴纸板；不是 90s 网页，也不是印刷海报。
- **色板**：暖纸白、墨黑、橙红、电蓝、酸性黄；所有文字组合必须过 WCAG AA。
- **字体角色**：展示 = League Gothic（拉丁）/ Zhuque Fangsong（CJK）；正文 = Inter / Zhuque；标签与数字 = JetBrains Mono / Zhuque。四族均为现有生产字体，不新增字体。
- **版式**：4px 粗黑边、硬偏移阴影、可见网格、超大姓名、编号分区、旋转贴纸标签；桌面最大宽度约 72rem，375px 单列无横向溢出。
- **资料映射**：`name` = 巨型标牌；`headline` = 标签；`bio` = 告示；`links` = 硬边按钮；`projects` = 硬阴影卡片；`experience` = 台账行；`skills` = 贴纸 chips；`contact` = 联系框；`avatar` / `location` 按设计取舍可选呈现。
- **动效**：一次性 snap / 位移；hover 抬起、active 压回；共享 `Reveal` 只做区块显现；无无限循环、无 JS、减动态静止。

## Requirements

- R1 必交文件：`DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`；可选 `tokens.css`、`Preview.astro`。
- R2 `Page.astro` 是完整文档，`<head>` 原样包含 `<HeadMeta {...view.head} />`；`<body>` 末尾无条件接入 `<ContextMenu config={view.contextMenu} />`；接入 `<Reveal />`。
- R3 取数只用 `loadDesignView('brutal', Astro.url.pathname)`；不自行解析语言/路径；三语言完整。
- R4 `name` / `headline` / `bio` / `links` 全部渲染；`projects` / `experience` / `skills` / `contact` 按设计取舍；不虚构个人事实；所有内部链接经 `withBase()` 或 `localeDesignHref()`。
- R5 字体走现有生产管线；`style.css` 用 `@theme inline` 注册变量；每个 `font` / `font-family` 有显式完整回退链，CJK 栈按 `Zhuque → 系统中文 → 通用族` 排序。
- R6 `style.css` 首两行必须是 Tailwind `@import "tailwindcss" source(none);` + `@source "./";`；加 `@source not "./Preview.astro";`；`tokens.css` 作用域为 `:is(.bt, .bt-pv)`，禁止 `:root`。
- R7 `Preview.astro` 自包含、不 import `style.css`、不声明 `<Font>`、不聚焦、`fonts` 导出实际用到的四个 family。
- R8 无设计专属 JS；无第三方运行时；无图片素材；不新增依赖。
- R9 通过 `design-page-verify` 并更新 `docs/verification/brutal.md`；构建体积记录到该文件。

## Acceptance Criteria

- [x] 三语言页面均渲染四字段与按设计取舍的扩展区块，无未翻译硬编码文案。
- [x] 1440 / 768 / 375px 无横向溢出；375px 下正文可读、触控目标 ≥44px。
- [x] 键盘可 Tab 到所有真实链接；焦点可见；装饰标签 `aria-hidden`。
- [x] 正文/低强度文本对比度 ≥4.5:1；酸性黄只与墨黑搭配。
- [x] 无 JS / 减动态 / Reveal 失败时内容完整可见。
- [x] `npm run build` 全绿；`dist` 体积增量 +161,130 B（约 0.154 MiB），在预估范围内。
- [x] `docs/verification/brutal.md` 记录构建、浏览器、768/375px、减动态、无 JS、对比度与体积。
- [x] 不修改其他设计、共享组件、ADR 或数据契约；仅更新字体门禁计数与 shared/brutal 验证记录。

## Out of Scope

- 设计专属 JS / 交互运行时。
- 新字体、新图片、新依赖。
- 修改现有 24 套的视觉语言。
- 容量优化；若 10 MiB 门禁超限，另开容量任务。
