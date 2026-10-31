# pager（寻呼机 / 单色 LCD）

> 父任务：`10-17-skeuo-theme-queue`（拟物主题实施队列）。本子任务只负责一套设计。
> 实施简报与决策依据见本目录 `design.md`；统一约束与验收见下。

## Goal

实现 `src/designs/pager/` 一套拟物主题设计页（一台寻呼机：深灰机身、单色偏绿 LCD、状态栏、消息列表与按键），三语言可访问、构建通过、视觉与 receipt distinctly different。

## 背景

- 字体池、机制契约、七套映射与决策缘由：父任务 `.trellis/tasks/10-17-skeuo-theme-queue/design.md`。
- 实施模板：`src/designs/receipt/`（Page.astro / style.css / messages.ts / DESIGN.md / design.json）。
- 数据层：`loadDesignView('<id>', Astro.url.pathname)`（`src/lib/site.ts`）。

## 统一约束（每套必须遵守）

- **文件范围**：只新建/修改 `src/designs/<id>/` 下的五个文件（design.json / DESIGN.md / Page.astro / style.css / messages.ts）。**不要**改 `astro.config.mjs`、`src/designs/registry.ts`、`src/designs/descriptions.ts`、其他设计目录或任何共享组件；不要运行 git。
- **机制模板**：以 `src/designs/receipt/` 为接线模板（Page.astro 结构、`<Font cssVariable>`、`Reveal`、`ContextMenu`、`loadDesignView`、`@theme inline`、`@import "tailwindcss" source(none); @source "./";`）。
- **数据**：`const { view } = ...`；`view.profile` = name / headline / bio / location / links[] / projects[] / experience[] / skills[] / contact{email?, note?}；`view.head` 与 `view.contextMenu` 原样传给 HeadMeta / ContextMenu。页面不判断语言。
- **字体**：只能用 `astro.config.mjs` 已注册的 18 款（见父任务 design.md §2 的 cssVariable 清单）；<Font cssVariable> 按实际使用引入；中文必须落在 Zhuque（`--font-zhuque`）或 Ark Pixel（`--font-ark-pixel`）上，回退链含 Songti SC/SimSun。
- **文案**：messages.ts 三语（zh-CN / ja / en）齐全；品牌名 SENRENBANKA 不翻译；装饰符号不进无障碍树（伪元素或 aria-hidden）。
- **无障碍**：h1 ×1（姓名）；每个分区 h2 可见并 `aria-labelledby`；装饰 aria-hidden；焦点环用主题色；对比度 正文 ≥4.5:1、大字 ≥3:1。
- **动效**：遵循共享 Reveal 契约（门控 `html[data-reveal-ready]`；reduced-motion / 无 IO / 无 JS 全部内容可见）。只做一个「作者时刻」，不做每段相同的入场；不做持续闪烁。
- **浏览器表面**：::selection、:focus-visible、scrollbar（若出现）都要从主题调色板取值。
- **禁用**：图片、外部请求、emoji 图标、渐变文字、卡片堆砌、硬偏移阴影、装饰性玻璃模糊。
- **自检**：可在自己目录上运行 `.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/<id>`，迭代到 0 条（DESIGN.md 必须登记 CSS 中出现的色值/字号等字面量）。**不要运行 npm run build / check**（由编排方统一执行）。


## 验收标准（父任务 A1–A7 的子集）

- [ ] 五件套齐备且可构建（由编排方统一 build 验证）
- [ ] `docs/verification/<id>.md` 由编排方统一生成
- [ ] impeccable detect = 0（自检）
- [ ] 视觉：隐喻清晰、版式与 receipt 不同构、移动端不破版
- [ ] 三语页面均有内容（zh-CN / ja / en）

## Out of Scope

- 其他 6 套设计、receipt 修改、字体注册、descriptions.ts、共享组件、构建与提交（编排方统一处理）。
