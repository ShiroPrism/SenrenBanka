# 宋式 / 侘寂设计（`ink`）

## Goal

新增一套 `styled` 设计 `ink`（displayName `Ink`，accent `#a13c2c`），把个人资料呈现为一张宋式册页：宣纸、墨色、青瓷细线、朱砂小印；桌面端右缘一列竖排题署，其余为横排可读正文。纯 CSS、无设计专属 JS、三语言完整、含 `Preview.astro` 与验证记录。

父任务：`10-31-next-design-batch-3`（第二个子任务，旗舰方向）。

## Requirements

### 交付文件（仅 `src/designs/ink/**`）

- `DESIGN.md`：自产规范——一句话定位、隐喻、色板（含每个色值用途与实测对比度）、字体六项记录、版式尺度表、组件、Motion、响应式、无障碍、内容映射、Do/Don't、预览缩略档位。
- `design.json`：`displayName: "Ink"`、中文一句话 `description`、`enabled: true`、`accent: "#a13c2c"`、`source.type: "self-produced"`、`generatedBy`；字段与 `designMetaSchema`（strict）完全一致，不加多余键。
- `messages.ts`：`zh-CN` / `ja` / `en` 三份完整文案，语域为册页题跋（小引 / 印谱 / 卷帙 / 年表 / 笔触 / 落款），文件头注明不翻译项与理由；纯数据，不 import CSS。
- `tokens.css`：纯 CSS、无 Tailwind 指令、作用域 `:is(.ink, .ink-pv)`、**无 `:root`**；只放调色板与尺寸 / 时长，不放字体角色。
- `style.css`：首两行精确为 `@import "tailwindcss" source(none);` 与 `@source "./";` + `@source not "./Preview.astro";`；`@theme inline` 注册字体角色；`html` 等祖先选择器消费令牌时写字面量；拥有完整回退链。
- `Page.astro`：完整 `<html>` 文档，`loadDesignView('ink', Astro.url.pathname)`、`<HeadMeta {...view.head} />`、四个实际使用字体的 `<Font>`、`<Reveal />`、`<body class="ink">`、`<body>` 末尾无条件 `<ContextMenu config={view.contextMenu} />`、`<html lang={view.head.lang}>`。
- `Preview.astro`：自包含碎片，只 import `./tokens.css` 与 `./messages` + `PreviewProps` 类型；`export const fonts` 列出实际使用的 `CssVariable`；无 `<Font>` / `:root` / 可聚焦元素 / `style.css` import。

### 字体（不新增 family）

- 只用 `--font-sorts-mill-goudy`、`--font-prociono`、`--font-lxgw`、`--font-zhuque`。
- 展示 = Sorts Mill Goudy + LXGW（次选 Zhuque）；正文 = Prociono + Zhuque（次选 LXGW）；题签 = Sorts Mill Goudy + LXGW。
- 每个含 `var(--font-*)` 的 `font` / `font-family`（含预览）都带完整显式回退，系统中文排在核心 CJK 变量之后，且每个栈都保留 `var(--font-lxgw)`。

### 视觉与内容

- 宣纸底 + 墨 + 一枚朱砂印；青瓷只做 1px 线与底纹。不对称留白、界栏细线、题签、页次、卷帙、年表。
- 桌面（≥1024px）`writing-mode: vertical-rl` 只用于题署（引首标签 / 姓名 / 题 / 印）；**1024px 以下必须降级横排**，375px 无横向溢出。
- 内容映射：`name`=署名 / 印，`headline`=题，`bio`=小引，`links`=印谱题签，`projects`=卷帙，`experience`=年表，`skills`=笔触，`contact`=落款。
- `name` / `headline` / `bio` / `links` 四字段必现；`projects` / `experience` / `skills` / `contact` 按存在与否条件渲染，不渲染空区块；不虚构个人事实。
- 姓名是唯一 `h1`；每个 `<section>` 用 `aria-labelledby` 指向同区可见标题；层级 h1 → h2 → h3 不跳级；装饰（印章、引首编号、方点、短划、界线）一律 `aria-hidden` 或伪元素。
- 焦点环 `2px` 朱砂、`outline-offset: 4px`；`pointer: coarse` 下题签链接、落款邮箱、卷帙标题链接 ≥44px；hover 由 `(hover: hover) and (pointer: fine)` 门控。
- 对比度：正文 ≥10.36:1、弱化解 ≥4.87:1、大字号 ≥13:1（数值写入 `DESIGN.md` §2）。
- 动效：`ink-rise`（墨色渗入 520ms）、`ink-press`（钤印落下 420ms）、`ink-draw`（细线展开 620ms），全部一次性、包在 `@media (prefers-reduced-motion: no-preference)`；滚动显现经共享 `Reveal`，`html[data-reveal-ready]` 是唯一隐藏门控；无设计 JS、无无限循环、无滚动劫持。
- 页面可见文案全部来自 `messages.ts`；不渲染 `<LanguageSwitcher>`；无内链硬编码（仅用 `link.url` 与 `mailto:`）。

### 并行纪律（本任务执行时）

- 不运行 `npm run build` / `astro build` / `astro check` / `npm run check` / `npm run fonts:*` / `npm test`，不启动 dev / preview。
- 只做设计目录内的静态检查（读文件、grep、`node -e` 对比度与 CSS 解析）。
- 不修改 `src/designs/ink/**`、`.trellis/tasks/10-31-song-wabi/**`、`docs/verification/ink.md` 之外的任何文件；不 git commit。

## Acceptance Criteria

- [x] 六个交付文件齐备且满足 `docs/rules/design-contract.md`（渲染模式、`style.css` 首两行、`@source not`、`HeadMeta` / `Reveal` / `ContextMenu`、`tokens.css` 作用域）。
- [x] 字体契约通过 `scripts/fonts/typography.mjs` 的静态检查逻辑（本地以一次性脚本调用 `inspectTypographyCss` 复算，0 findings）。
- [x] 三语言 `messages.ts` 完整；不翻译项在文件头注明理由。
- [x] 四字段必现、可选区块条件渲染、无虚构事实；每分区有可访问名称；唯一 `h1`。
- [x] 无设计专属 JS、无图片、无第三方依赖；纯 CSS 动效 + 减动态降级。
- [x] 色板对比度实算并写入 `DESIGN.md`（正文 15.17 / 次级 10.36 / 弱化 5.53 / 朱砂 5.68）。
- [x] `Preview.astro` 自包含、导出 4 个字体变量、无可聚焦元素、无 `:root`。
- [ ] `npm run build` 通过（**并行阶段未运行**，由主代理执行）。
- [ ] `scripts/fonts/typography.mjs` 与 `typography.test.mjs` 的 styled / core-CJK 计数需 24→25、15→16（**本任务不拥有该文件**，由主代理改）。
- [ ] 浏览器实测 1440 / 768 / 375×812、键盘、减动态、无 JS、检测器与截图（主代理执行，见 `docs/verification/ink.md`）。

## Notes

- 竖排只作用于题署，正文永远横排：长文竖排会同时破坏可读性与 375px 布局。
- 桌面 Hero 用 `grid-template-areas: "prose tiers"`，DOM 首个区块（h1）落在最右列——竖排右起阅读方向下这是顺序一致而非倒置；<1024px 恢复单列后与 DOM 完全一致。
- `src/designs/descriptions.ts`（切换页本地化描述）没有 `ink` 键，切换页会回退 `design.json.description`；该文件不在本任务所有权内。
