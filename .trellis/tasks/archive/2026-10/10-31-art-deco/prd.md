# Art Deco / 暗黑奢华设计（`deco`）

## Goal

在 `src/designs/deco/` 新增一套完整的 `styled` 设计：id `deco`、displayName `Deco`，隐喻「Art Deco 剧院节目单 / 暗黑奢华」。纯 CSS、无设计脚本，完整承载资料契约与三语言，交付 Preview 与验证记录。

## Requirements

### 交付物与文件边界

- 只写 `src/designs/deco/**`、`.trellis/tasks/10-31-art-deco/**`、`docs/verification/deco.md`；不改共享组件、`src/lib/**`、`preview.ts` / `registry.ts` / `descriptions.ts`、其它设计、ADR、数据契约、`fonts.config.json` 与字体生成/校验脚本。
- 交付 7 个文件：`DESIGN.md`、`design.json`、`messages.ts`、`tokens.css`、`style.css`、`Page.astro`、`Preview.astro`。
- `DESIGN.md` 先于实现定稿，包含：定位、隐喻、色板（每色值用途 + 计算对比度）、字体六项记录、版式、组件、Motion、响应式、无障碍、内容映射与取舍、Do/Don't；数值必须与最终 CSS 一致。

### 视觉语言

- 隐喻：剧院节目单 / 夜场售票厅；墨黑台面 + 黄铜双线框 + 金色扇形/放射/菱形/阶梯角 + Didone 衬线大标题 + 宽字距对称版式。
- 金色只用于大字号、标题、编号、装饰与焦点环；正文与描述只用米白 / 纸白。
- 对称中轴构图；窄屏降级为单列但保留双线框、菱形、阶梯角语言。
- 每个分区有装饰性英文/中文栏目语（版面标签），但可见文案全部来自 `messages.ts`。

### 字体（不得新增）

- 展示 `--font-fraunces`、正文 `--font-inter`、CJK `--font-zhuque`；不引用其它 family。
- 每个含 `var(--font-*)` 的 `font` / `font-family` 必须带完整显式回退，`var(--font-zhuque)` 必须排在系统中文之前；`--font-*` 只暴露主 face。
- 正式页与 `Preview.astro` 受同一 `fonts:typography` 门禁。

### 内容契约

- `name` / `headline` / `bio` / `links` 四字段全部渲染；`name` 做 monogram 但**完整姓名必须同时渲染**。
- `projects` / `experience` / `skills` / `contact` 条件渲染，不渲染空区块，不虚构个人事实。
- 映射：name=monogram、headline=副题、bio=序言、links=剧目表、projects=幕次、experience=演出单、skills=演职员表、contact=售票处。

### 无障碍、动效、响应式

- 姓名是唯一 `h1`，层级 `h1 → h2 → h3` 不跳级；每个 `<section>` 有可访问名；装饰件全部 `aria-hidden`。
- 正文 ≥ 4.5:1、大字号 ≥ 3:1，实测记录进 `DESIGN.md`；`:focus-visible` 在黑底上可见；`pointer: coarse` 命中区 ≥ 44px；hover 由 `(hover: hover) and (pointer: fine)` 门控。
- 动效为纯 CSS 一次性（金线展开 / 扇形展开 / 幕布分开）+ 共享 `Reveal`；`html[data-reveal-ready]` 是唯一隐藏门控；减动态时内容自然可见；无无限循环、无滚动劫持、无设计 JS。
- 1440 / 768 / 375×812 均成立，375px 无横向溢出；长 URL / 长词 `overflow-wrap: anywhere`。
- 内链（若有）必须经 `localeDesignHref()` / `localeHref()` / `withBase()`；本设计无站内链接，外链直接用 `link.url`。

### 并行纪律（本次实现阶段）

- 不运行 `npm run build` / `astro build` / `astro check` / `npm run check` / `npm run fonts:*` / `npm test`，不启动 dev / preview，不 commit。
- 只做设计目录内的静态检查（读文件、grep、一次性 `node -e` 计算与编译器静态解析）。

## Acceptance Criteria

- [ ] 7 个文件齐备，`design.json` 为 `displayName: "Deco"`、`enabled: true`、`accent: "#d4af37"`（登记在 `DESIGN.md` 色板）、`source: { "type": "self-produced" }`，无多余字段。
- [ ] `style.css` 首两行精确为 `@import "tailwindcss" source(none);` / `@source "./";`，第 3 行为 `@source not "./Preview.astro";`，字体角色经 `@theme inline` 注册。
- [ ] `tokens.css` 作用域仅 `:is(.deco, .deco-pv)`，无 `:root`，无 Tailwind 指令，只放调色板与量值。
- [ ] `Page.astro` 为完整 `<html>` 文档：`HeadMeta {...view.head}`、每个实际使用的字体一个 `<Font>`、`<Reveal />`、`<body class="deco">`、`<html lang={view.head.lang}>`、末尾无条件 `<ContextMenu config={view.contextMenu} />`。
- [ ] `Preview.astro` 自包含（只 import `tokens.css` + `messages` + `type PreviewProps`），导出 `fonts`，无 `<Font>` / `:root` / `style.css` / 可聚焦元素，体积 1–8 KB。
- [ ] 四字段必现 + 四个扩展区块条件渲染；`name` 的 monogram 与完整姓名同时存在。
- [ ] 对比度表写入 `DESIGN.md`，所有正文组合 ≥ 4.5:1，金色不用于正文。
- [ ] 字体栈静态门禁 0 findings（本地以 `inspectTypographyCss` 预跑）。
- [ ] 每个 `<section>` 有可访问名；装饰件 `aria-hidden`；无 `<LanguageSwitcher>`；无设计 JS。
- [ ] 375px 无横向溢出（设计层面：`overflow-x: clip` + `overflow-wrap: anywhere` + 单列降级）。
- [ ] `docs/verification/deco.md` 记录静态自审结果 + 对比度 + 字体栈 + 未测项；未测项不得写成通过。
- [ ] 构建与浏览器验收由主代理在并行阶段结束后补做（见下「移交项」）。

## 移交项（不属于本任务文件所有权）

- `scripts/fonts/typography.mjs` 的 `styledCount !== 24` 断言需按最终 `styled` 套数更新（`deco` 加入后为 25；若同批还有 `ink` 需一并计入），并同步 `scripts/fonts/typography.test.mjs` 与 `npm test`。
- `docs/verification/shared.md` 的预览数量、`docs/README.md` 的设计计数需在批次收口时刷新。
- `impeccable detect`、完整 `design-page-verify` 流程、截图归档、`change-log/<version>.md`。

## Notes

- 设计方向与正交性依据：父任务 `.trellis/tasks/10-31-next-design-batch-3/prd.md`。
- 三套新设计并行实现；本任务只对 `deco` 目录与自有验证文件负责。
