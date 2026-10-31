# design.md — lexicon（中日英混排 / 辞书）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/lexicon/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：lexicon — 中日英混排 / 辞书

**世界**：一部中日英三语辞典的跨页。整页是一张书页：书眉（词条范围）、页边索引签、双栏词条、词条头（中文词 + 拉丁转写/对应词）、释义、参照项（→ 参见）。优雅、安静、以排版为主角。

**版式（桌面）**：书页 `min(46rem, 100%)` 居中，左右书边不对称（内边距略大）；书眉 = 左侧「SENRENBANKA」+ 右侧「LEXICON · 第 X 条」；双栏（≥900px，column-rule 1px），分区 = 词条；词条头 = 中文词（Zhuque）+ 拉丁小大写字（Goudy）+ 词性标记；释义 = 正文；链接 = 参照项（→ label, url）。
**版式（移动）**：单栏，书眉简化，索引签隐藏。

**配色**
- 书页 paper: `#f4eee0`，纸背 back: `#2a251f`（深棕桌面）
- 墨 ink: `#2a251d`，淡墨 dim: `#675c48`，细线 line: `#c8bda4`
- 唯一彩色：牛血红 oxblood `#7c2f2a`（词条头/参照箭头/索引签）

**字体**
- 中文正文/词条：Zhuque Fangsong（`--font-zhuque`）
- 拉丁/展示/斜体：Sorts Mill Goudy（`--font-sorts-mill-goudy`）

**分区映射**：书眉（name / headline / location）→ 备注（bio 作首条释义）→ 明细（links 作参照项列表）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计 = 参照数）→ 页脚（「— 终 —」+ 样例声明）。
**细节**：词条编号（Ⅰ Ⅱ Ⅲ 或 1.）用 Goudy 小大寫；首字下沉（drop cap）仅用于 bio 首段且不超过 3 行高；索引签 = 页边竖排小标签（装饰，aria-hidden）；链接 hover = 词组下加细点线。
**动效（一个作者时刻）**：词条间的细规线从左端生长（scaleX，一次性）；其余静态。
**注意**：这是「Read」模式——可读性优先；行高 1.85，正文 0.9375–1rem；不要用卡片、不要加背景噪声。

## 分区清单（h2 层级，按序）

1. 书眉（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/lexicon/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/lexicon/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/lexicon/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/lexicon/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `le-`）
- `src/designs/lexicon/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
