---
name: Lexicon — The Trilingual Dictionary Page
description: 一张中日英三语辞典的跨页：书眉、双栏词条、拉丁对应词、参照箭头与页边索引签，牛血红只落在词条头。
colors:
  back: "#2a251f"
  paper: "#f4eee0"
  ink: "#2a251d"
  dim: "#675c48"
  line: "#c8bda4"
  oxblood: "#7c2f2a"
typography:
  display:
    fontFamily: "'Sorts Mill Goudy', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(1.75rem, 5.5vw, 2.125rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.04em"
  display-compact:
    fontFamily: "同 display"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.04em"
  lemma:
    fontFamily: "同 display"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
  lemma-compact:
    fontFamily: "同 display"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
  body:
    fontFamily: "同 display"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
  note:
    fontFamily: "同 display"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.85
  latin-caps:
    fontFamily: "'Sorts Mill Goudy', Georgia, 'Times New Roman', serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.18em"
  pos:
    fontFamily: "'Sorts Mill Goudy', Georgia, 'Times New Roman', serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.4
    letterSpacing: "0.04em"
  running:
    fontFamily: "'Sorts Mill Goudy', Georgia, 'Times New Roman', serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.2em"
  meta:
    fontFamily: "同 display"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.08em"
  role:
    fontFamily: "同 display"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.85
  tally:
    fontFamily: "'Sorts Mill Goudy', Georgia, 'Times New Roman', serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  finis:
    fontFamily: "同 display"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.32em"
  micro:
    fontFamily: "同 display"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "0.16em"
rounded:
  all: "0（书页与索引签均为直角）"
spacing:
  page: "min(46rem, 100%)"
  column-gap: "2.6rem"
  entry: "1.6rem"
  block: "1.5rem"
  line: "1.85"
motion:
  rule: "620ms cubic-bezier(0.22, 0.68, 0.24, 1)，scaleX 自左生长，只播一次"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    underline: "1px {colors.dim}，offset 3px"
  link-hover:
    underline: "1px dotted {colors.ink}"
  dim:
    textColor: "{colors.dim}"
  entry-head:
    textColor: "{colors.oxblood}"
    typography: "{typography.lemma}"
  entry-latin:
    textColor: "{colors.oxblood}"
    typography: "{typography.latin-caps}"
  rule:
    borderColor: "{colors.line}"
  tab:
    textColor: "{colors.oxblood}"
    borderColor: "{colors.line}"
    backgroundColor: "{colors.paper}"
---

# Design System: Lexicon — The Trilingual Dictionary Page

## Overview

**Creative North Star: "The Trilingual Dictionary Page（中日英混排辞书）"**

主页是一张摊开的辞典书页：书眉在顶端报出辞书名与这一页的词条范围，正文分成两栏，
每个分区都是一条**词条**——中文词落在朱雀仿宋上，旁边跟着 Goudy 的拉丁小大写字与文法缩写，
释义用正文排，链接收在「→ 参照项」里，页边的索引签像书口上的小签条。
整页没有卡片、没有栅格、没有背景噪声：层级只由**字号、字距、墨的明度与一条 1px 细线**表达。

这不是"网页做成复古风"，而是把**辞书的阅读秩序**直接搬进浏览器：书眉 → 主词条 → 双栏词条流 →
「— 终 —」。可读性优先（Read 模式）：正文 1rem / 行高 1.85，词条之间靠细规线分隔而不是盒子。

材质是纸与墨：暖白书页压在深棕桌面上，牛血红只出现在**词条头、参照箭头、索引签**（以及文本选区）。
拉丁与中文不是两套风格，而是同一页上的两个声部——Goudy 的老式衬线配朱雀仿宋的书写笔形，
两者都以"读"为唯一目的。

**Key Characteristics:**
- 一张书页、一条阅读流；没有卡片、没有投影层级、没有圆角。
- **双栏只在 ≥900px 出现**（`column-rule: 1px`），窄屏收成单栏；两档之间没有第三种栏数。
- 每个词条 = 细规线 + 词条头（编号 + 中文词 + 拉丁小大写 + 词性）+ 释义 / 参照项。
- 全页一个彩色（牛血红），一个动效（细规线自左生长），其余静态。
- 页边索引签是桌面的装饰（`aria-hidden`），不是导航。

## Colors

纸、墨、一枚牛血红，外加深棕桌面——六个色值，全量列在 frontmatter 与本节的表里。

### Primary
- **Oxblood（牛血红 `#7c2f2a`）**: 全页唯一彩色。只用于词条头（中文词 + 拉丁小大写）、参照箭头 `→`、
  页边索引签，以及 `::selection` 底色。**不用于正文、链接、焦点环、按钮**。纸面对比度 **7.9:1**。

### Neutral
- **Paper（书页 `#f4eee0`）**: 书页底色；亚光暖白，无渐变（Read 模式不要背景噪声）。
- **Back（桌面 `#2a251f`）**: 深棕桌面，书页之外的全部背景；平涂，不做径向渐变。
- **Ink（墨 `#2a251d`）**: 正文、标题、页脚、焦点环；纸面对比度 **13.2:1**。
- **Dim（淡墨 `#675c48`）**: 书眉、编号、词性、注释、日期、单位、示例声明；纸面对比度 **5.68:1**
  （超过 AA 的 4.5:1）。
- **Line（细线 `#c8bda4`）**: 1px 规线、书眉下缘、页脚上缘、栏间线与索引签边框。**非文本**，
  纸面对比度 1.6:1——它只负责分隔，不承载信息（链接下划线另用淡墨）。

### Named Rules
**The Oxblood Margin Rule.** 牛血红是"辞书的红字"，只标词条头、参照箭头、索引签与选区。
任何新元素要强调时，先用墨的明度与字号，不要动红。
**The Six-Value Rule.** 颜色总数是六个（含桌面）；不得新增第二个色相、第二个纸色或任何透明度叠色。
**The No-Tint Rule.** 不使用阴影、渐变、蒙层来表达层级——书页与桌面之间只有一道硬边。

## Typography

**Latin / Display / Italic:** Sorts Mill Goudy（`--font-sorts-mill-goudy`；Goudy 老式衬线，含真斜体）
**CJK / Body:** Zhuque Fangsong（`--font-zhuque`；朱雀仿宋，站内用字子集）

**Character:** 一页两声部。拉丁字母走 Goudy 的旧式衬线：书眉的全大写、词条的拉丁对应词（NOTA / NEXVS /
OPERA / CHRONICA / ARTES / RATIO）、文法缩写（`n.` / `n. pl.` / `n. prop.`）与斜体词性标记；
汉字与假名落到朱雀仿宋——仿宋的横细竖粗与书卷气正是辞书正文该有的密度。
英文页面上，Goudy 同时承担"英文界面语言"与"拉丁对应词"两层——这正是三语辞典的版面事实，
不需要第三套字体去区分它们。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: 中日英三语辞典的一张书页 → 需要**阅读型中文衬线**（长文、仿宋骨架）+
   **旧式拉丁衬线**（全大写书眉、拉丁对应词、真斜体文法缩写）。不需要等宽（那不是书）、
   不需要几何无衬线（会破坏书页的书写气）、不需要像素字（辞书不是屏幕终端）。
2. **角色分配**: 中文词条 / 正文 / 释义词 / 页脚 = Zhuque Fangsong；
   拉丁展示 / 书眉 / 词条拉丁对应词 / 文法缩写 / 词性斜体 / 数字（编号、合计）= Sorts Mill Goudy。
3. **为什么是它而非其他**: 站内已注册的中文字体只有 Zhuque Fangsong 与 Ark Pixel 两条开放路径；
   像素黑体属于 pager / terminal 的语言，与纸墨世界冲突，故中文只能且应当走朱雀。
   拉丁候选里，Courier Prime / Cutive Mono 是打字机声部（receipt 已占用），
   League Gothic 是海报窄体（poster 已占用），Prociono 是纪念性展示衬线；Goudy 是唯一
   **带真斜体、字面偏小、灰度安静**的旧式衬线，适合书页正文与书眉。不新增字体族：两套足够，
   第三套只会把"一页两声部"拆成拼贴。
4. **实际覆盖与回退**: Goudy 覆盖 ASCII 95/95 + latin-ext（`latin` / `latin-ext` 两个 `@font-face`
   以 unicodeRange 区隔）；无 CJK。Zhuque 子集覆盖 GB2312 6763/6763 与假名 189 枚（站内用字已核），
   日文汉字由同一子集承接。中文回退 `Songti SC` → `SimSun` → `serif`；
   拉丁回退 `Georgia` → `Times New Roman` → `serif`。
5. **字重 / 轴 / 体积 / 许可**: 两者均为单字重、无可变轴。Goudy 四个 WOFF2：
   latin 22.8KB（正）/ 24.7KB（斜）、latin-ext 10.2KB（正）/ 10.7KB（斜）；
   Zhuque 子集 246KB。许可均为 **OFL-1.1**；Zhuque 无 Reserved Font Name，
   Goudy 版权行随许可文件保留（`src/assets/fonts/*/LICENSE.txt`）。
6. **缺失回退顺序**: 拉丁 / 数字 `Sorts Mill Goudy → Georgia → Times New Roman → Zhuque Fangsong →
   Songti SC / SimSun → serif`；中文 `Zhuque Fangsong → Songti SC → SimSun → serif`。
   断网或无 JS 时版式与阅读顺序不变。

### 字号 / 行高 / 字距登记（与 `style.css` 逐条对应）

| 选择器 | font-size | line-height | letter-spacing |
|---|---|---|---|
| `.lx` | `1rem` | `1.85` | — |
| `.lx-running` | `0.6875rem` | `1.85`（继承） | `0.2em` |
| `.lx-running`（≤560px） | 同上 | 同上 | `0.14em` |
| `.lx-title` | — | `1.25` | — |
| `.lx-title-lemma` | `clamp(1.75rem, 5.5vw, 2.125rem)` | `1.25` | `0.04em` |
| `.lx-title-lemma`（≤560px） | `1.6rem` | `1.25` | `0.04em` |
| `.lx-title-latin` | `0.6875rem` | `1.25` | `0.28em` |
| `.lx-title-pos` | `0.75rem` | `1.25` | `0.06em`（italic） |
| `.lx-headline` | `1rem`（继承） | `1.85` | — |
| `.lx-origin` | `0.75rem` | `1.85` | `0.08em` |
| `.lx-origin-label` | `0.6875rem` | `1.85` | `0.14em` |
| `.lx-entry-head` | — | `1.4` | — |
| `.lx-num` | `0.6875rem` | `1.4` | `0.14em` |
| `.lx-lemma` | `1.125rem` | `1.4` | `0.06em` |
| `.lx-lemma`（≤560px） | `1.0625rem` | `1.4` | `0.06em` |
| `.lx-latin` | `0.6875rem` | `1.4` | `0.18em` |
| `.lx-pos` | `0.6875rem` | `1.4` | `0.04em`（italic） |
| `.lx-bio::first-letter` | `3.4em` | `1` | — |
| `.lx-note` | `0.9375rem` | `1.85` | — |
| `.lx-arrow` | `0.9375rem` | `1.85`（继承） | — |
| `.lx-work-title` | `1rem` | `1.65` | — |
| `.lx-tags` | `0.75rem` | `1.85` | `0.06em` |
| `.lx-period` | `0.75rem` | `1.85` | `0.1em` |
| `.lx-org` | `1rem` | `1.85` | — |
| `.lx-role` | `0.875rem` | `1.85` | — |
| `.lx-skill` | `0.9375rem` | `1.85` | — |
| `.lx-field-label` | `0.6875rem` | `1.85` | `0.18em` |
| `.lx-tally-label` | `0.6875rem` | `1.85` | `0.2em` |
| `.lx-tally-num` | `1.5rem` | `1` | `0.04em` |
| `.lx-tally-unit` | `0.75rem` | `1.85` | `0.1em` |
| `.lx-finis` | `0.8125rem` | `1.85` | `0.32em` |
| `.lx-sample` | `0.625rem` | `1.85` | `0.16em` |
| `.lx-tab`（≥900px） | `0.625rem` | `1` | `0.06em` |

### Hierarchy
- **Display**（Goudy / Zhuque，`clamp(1.75rem, 5.5vw, 2.125rem)`，字距 0.04em）：姓名（主词条）。
- **Lemma**（1.125rem，字距 0.06em，牛血红）：六条分区词条的中文词 / 对应界面词。
- **Body**（1rem，行高 1.85）：headline、bio、词条释义。
- **Note**（0.9375rem，行高 1.85，淡墨）：项目与经历描述、联系方式注解。
- **Meta / Label**（0.6875–0.75rem，字距 0.06–0.2em）：书眉、编号、拉丁对应词、词性、日期、单位。

### Named Rules
**The Two-Voice Rule.** 拉丁只走 Goudy，汉字只走 Zhuque；不在同一元素里再混第三套字体。
斜体只属于 Goudy（文法缩写、页脚例外不使用斜体）。
**The Reading-First Rule.** 正文不得小于 0.9375rem、行高不得小于 1.85；字距只加在 0.75rem 以下的标签上，
正文与释义保持 0 字距。
**The Small-Caps Rule.** "拉丁小大写" = Goudy 全大写 + 0.18em 字距 + 0.6875rem；不用 `font-variant` 伪小体，
也不把拉丁对应词做成第二种强调色。

## Layout

- **书页**：`width: min(46rem, 100%)`，居中于深棕桌面；内边距 `clamp(1.5rem, 4vw, 2.7rem)`
  上、`clamp(1.15rem, 3.2vw, 2.3rem)` 右、`clamp(1.5rem, 4vw, 2.2rem)` 下、`clamp(1.5rem, 4.5vw, 3.3rem)` 左
  ——左右不对称（装订侧略大），书页不是卡片。
- **书眉**：一行两端对齐——左 `SENRENBANKA`，右 `LEXICON · 第 1–6 条`（词条范围由实际渲染条数派生）；
  下缘 1px 细线。≤560px 只收紧字距与下边距，两端结构不变。
- **主词条**：`h1` 内联排列「中文姓名（clamp 展示号）+ `SENRENBANKA` 拉丁小大写 + `n. prop.` 斜体词性」，
  下行 headline 与地点行（`所在 …`）。
- **双栏（≥900px）**：`.lx-columns { columns: 2; column-gap: 2.6rem; column-rule: 1px }`；
  窄屏单栏。分区 = 词条，`break-inside: avoid` 保证一条词条不被栏断开。
- **词条结构**：细规线（1px）→ 词条头（编号 `I`–`VI` + 中文词 + 拉丁对应词 + 词性）→ 释义 / 参照项 / 列表。
  词条间距 1.6rem，词条头下 0.6rem，正文起点 0.55rem。
- **桌面端内容留白**：46rem 书页在 1280–1536px 下四周均有明显桌面留白（书页不贴边）。
- **移动端**：单栏；索引签隐藏；书页边距收至 1.5rem / 1.15rem；375px 无横向溢出。

## Elevation & Depth

**没有投影层级。** 书页与桌面之间只有颜色硬边，不加 `box-shadow`、不加渐变、不加边框。
深度感来自"纸比桌面亮"这一件事；任何元素（词条、索引签、合计）都不得再叠阴影或浮层。

## Shapes

- 全部直角：书页、索引签、细线、链接下划线均无圆角。
- 线只有一种：**1px 实线**（`--lx-line`）。书眉下缘、页脚上缘、栏间线、词条细规线同一粗细。
- 参照箭头是文本字符 `→`（Goudy），不是 SVG 图标。
- 索引签是页边上的直角小矩形，左缘与书页边重合、右缘探出 0.95rem。
- 链接下划线 1px、offset 3px；hover 变成点线（`text-decoration-style: dotted`），不加背景、不反白。

## Components

### Running Head（书眉）
- 两端布局：左品牌（墨）+ 右 `LEXICON · 第 1–6 条`（淡墨、`white-space: nowrap`）。
- 词条范围是**真实条数**：`link + bio + contact` 加可选的 `projects / experience / skills`，构建期计算。
- 下缘 1px 细线；不是 sticky，不随滚动固定（这是一页纸，不是工具条）。

### Entry Head（词条头，签名组件）
- 组成：编号（Goudy，淡墨，`I`–`VI`）+ 中文词（1.125rem，牛血红）+ 拉丁对应词
  （Goudy 全大写 0.6875rem / 0.18em，牛血红）+ 词性（Goudy 斜体 0.6875rem，淡墨）。
- 编号与拉丁对应词、词性均 `aria-hidden`：分区的可访问名就是那枚可见的中文 / 对应界面词。
- 主词条（h1）复用同一结构：姓名 + `SENRENBANKA` + `n. prop.`。

### Entry Rule（词条细规线）
- 每条词条顶端的 1px 细线，`transform-origin: left center`。
- 动效唯一载体（见 Motion）；静息态就是一条实线，没有渐变、没有虚线。

### References（参照项）
- `ul` 逐条：`→`（牛血红、`aria-hidden`）+ 链接标签（墨色下划线）。`url` 只作为 `href`，不在版面上重复。
- 参照箭头是辞书的指引符号，不是列表项目符号；不换成图标。

### Works / Record（订单 / 纪录）
- 标题（可点击）+ 描述（0.9375rem 淡墨）+ 标签行（`·` 分隔，0.75rem 淡墨）。
- 纪录 = 日期（Goudy 0.75rem 淡墨）+ 机构 + 角色（0.875rem 淡墨），描述另起一行。

### Skills
- Run-in 列表：`li` 弹性换行，`・` 作条间分隔（生成内容，纯标点）。

### Tally（结账 / 合计）
- 字段标签 `参照数`（0.6875rem / 0.2em 淡墨）+ 数字（Goudy 1.5rem，行高 1）+ 单位（0.75rem 淡墨）。
- 数值 = `profile.links.length`（真实数据），与书眉的词条数不是同一个量。

### Index Tabs（页边索引签）
- 仅 ≥900px 显示；`aria-hidden`、`pointer-events: none`——纯装饰，不做锚点导航。
- 位置按 12% / 26% / 40% / 54% / 68% / 82% 等分（多栏流式无法在构建期得知断栏几何，
  因此签条是**版面记号**而非几何对齐的锚点）；数字 1–6，竖排（`writing-mode: vertical-rl`）。

### Links
- **Style:** 继承墨色；1px 淡墨下划线、offset 3px（不用 1px 细线色——那是分隔线，不是文字标记）。
- **Hover:** 仅 `(hover: hover) and (pointer: fine)` 下把下划线变成点线（墨色），无背景、无位移。
- **Touch:** `pointer: coarse` 时纵向 padding 0.5rem，扩大命中区。
- **Focus:** 2px 墨色 outline、offset 2px——**不用牛血红**。

### Footer
- 上缘 1px 细线；居中「— 终 —」（0.8125rem / 0.32em）+ 示例声明（0.625rem / 0.16em 淡墨）。
- 语言不同终记号不同（`— 终 —` / `— 終 —` / `— FINIS —`），但始终是这页书的收尾。

## Motion

**动效语言 = 辞书的"划线"：词条细规线从左边生长出来。**

- **唯一动作**：`.lx-rule` 用 `scaleX(0 → 1)` 从左端长出，620ms、`cubic-bezier(0.22, 0.68, 0.24, 1)`，
  每条词条只播一次（由共享 `IntersectionObserver` 的 `data-reveal-in` 触发）。
- **错落**：同屏多条时按 70ms 步进（上限 350ms），仍然只是一次划线动作，不是逐条入场。
- **其余全部静态**：正文不淡入、不位移、不逐字打印；链接只在下划线样式上瞬变；无持续动效。
- **可见性契约**：隐藏态（`transform: scaleX(0)`）只由 `html[data-reveal-ready]` 门控；
  动画不填终帧，动画未推进时线保持自然可见态（`transform: none`）——无 JS / 减动态时线始终在。
- **`prefers-reduced-motion: reduce`**：不生成任何动画与隐藏态，全部内容原样、静态呈现。
- 采用共享机制，因此在 `<head>` 放一次 `<Reveal />`；不自行实现滚动监听。

## Do's and Don'ts

### Do:
- **Do** 把每个分区当成一条辞典词条来排：编号 + 词 + 拉丁对应词 + 词性 + 释义。
- **Do** 让中文落在朱雀仿宋、拉丁落在 Goudy；英文页面同样保留拉丁对应词这一层。
- **Do** 用 1px 细线、字号、字距与墨的明度建立层级；正文行高 1.85。
- **Do** 只在 ≥900px 开双栏，窄屏老老实实单栏；分区标题始终是可见的 `<h2>`。
- **Do** 保留页边索引签的装饰身份（`aria-hidden` + `pointer-events: none`），不做假导航。
- **Do** 让 hover 只改下划线样式、focus 用墨色 outline；触屏扩大命中区。

### Don't:
- **Don't** 引入卡片、投影、圆角、渐变或第二层背景——书页只有纸与桌面。
- **Don't** 让牛血红参与焦点、正文、按钮或警告；它只属于词条头、箭头、索引签与选区。
- **Don't** 用图片、外部请求、emoji 或图标库；本设计的全部记号是字符（`→` `・` `·` `—`）与 Goudy 编号。
- **Don't** 给正文做淡入 / 位移 / 逐字打印；全页只有一个作者时刻（细规线生长）。
- **Don't** 为了"更词典"而加解释性文案：分区名之外不新增说明句。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：`loadDesignView('lexicon', Astro.url.pathname)`（`src/lib/site.ts`）；语言由路径统一解析。
- **扩展区块取舍**：全部渲染——`projects`（订单）、`experience`（纪录）、`skills`（技能）、
  `contact`（结账 + 合计 = `links.length`）。
- **语义结构**：`h1` 一枚（主词条姓名）；六个分区各一枚可见 `<h2>`（备注 / 明细 / 订单 / 纪录 / 技能 / 结账）
  并由 `aria-labelledby` 命名；书眉是 `<header>`（其标题即 `h1`），不另设 `h2`。
  编号、拉丁对应词、词性、参照箭头、索引签一律 `aria-hidden`。
- **多语言**：全部界面文案来自 `./messages.ts`（三语齐全：`zh-CN` / `ja` / `en`）；拉丁对应词与文法缩写
  三语共用（辞书的拉丁声部，不翻译）；`SENRENBANKA` 为品牌标识，不翻译。语言切换由共享操作菜单承担。
- **菜单**：无条件接入 `<ContextMenu config={view.contextMenu} />`；页面不放任何可见切换入口。
- **字体接线**：`--font-zhuque` / `--font-sorts-mill-goudy`（`astro.config.mjs` 已注册）→
  `<Font>`（不 preload）→ `@theme inline { --font-lexicon: var(--font-sorts-mill-goudy) }`；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- **偏差记录**：
  - `design.json` 不写 `id` 字段——注册表 schema 为 `.strict()`，设计 id 由目录名派生（`lexicon`）。
  - 书眉按 brief 属于"分区清单"第一条，但它在语义上是文档标题，因此落在 `h1` / `<header>` 而非 `h2`。
  - 索引签等分布局，不与词条几何对齐（多栏流式无法构建期预知断栏位置）。
- **验证**：对比度实测值见本节 Colors（墨 13.2:1 / 淡墨 5.68:1 / 牛血红 7.9:1）；
  impeccable 检测器对本目录输出 0 条。
