---
name: Poster — The Screenprint Poster
description: 一张贴在看片灯上的双色丝网印刷海报：巨幅窄体标题、镂空分区字、套准标记与粗规线。
colors:
  paper: "#f1ebdc"
  paper-2: "#e7dfcc"
  ink: "#111110"
  flare: "#ff4d1f"
  muted: "#5f5a4d"
  shadow: "rgba(17, 17, 16, 0.22)"
  paper-print: "#ffffff"
typography:
  display:
    fontFamily: "'League Gothic Variable', 'Zhuque Fangsong', 'Arial Narrow', 'Songti SC', 'SimSun', sans-serif"
    fontSize: "clamp(2.6rem, 11vw, 6rem)"
    fontWeight: 400
    fontStretch: "82%"
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  display-count:
    fontFamily: "'League Gothic Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3.25rem)"
    fontWeight: 400
    fontStretch: "78%"
    lineHeight: 0.85
    letterSpacing: "-0.01em"
  display-imprint:
    fontFamily: "'League Gothic Variable', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)"
    fontWeight: 400
    fontStretch: "85%"
    lineHeight: 1.05
    letterSpacing: "0.06em"
  stencil:
    fontFamily: "'Blackout 2AM', 'League Gothic Variable', 'Arial Black', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  lede:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.01em"
  body:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  section-name:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.18em"
  item-title:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "normal"
  skills:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(1.0625rem, 1.8vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
  period:
    fontFamily: "'League Gothic Variable', 'Zhuque Fangsong', 'Arial Narrow', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    fontStretch: "100%"
    lineHeight: 1.4
    letterSpacing: "0.08em"
  num:
    fontFamily: "'League Gothic Variable', 'Arial Narrow', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    fontStretch: "86%"
    lineHeight: 1.4
    letterSpacing: "0.08em"
  log-role:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.04em"
  total-unit:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
  tags:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
  total-label:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.22em"
  meta:
    fontFamily: "'League Gothic Variable', 'Zhuque Fangsong', 'Arial Narrow', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    fontStretch: "90%"
    lineHeight: 1.5
    letterSpacing: "0.16em"
  url:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.04em"
  label:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.18em"
  micro:
    fontFamily: "'Prociono', 'Zhuque Fangsong', Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.18em"
rounded:
  paper: "0（纸张没有圆角）"
  registration: "50%（套准标记的细线圆）"
spacing:
  sheet-width: "min(60rem, 100%)"
  pad: "clamp(1.6rem, 4.4vw, 3.25rem)"
  gutter: "clamp(1rem, 2.6vw, 2.25rem)"
  row: "clamp(1.9rem, 4vw, 3rem)"
components:
  link:
    textColor: "{colors.ink}"
    textDecorationColor: "{colors.muted}"
    typography: "{typography.body}"
  link-hover:
    textDecorationColor: "{colors.flare}"
  link-focus:
    outlineColor: "{colors.ink}"
    backgroundColor: "{colors.flare}"
  muted:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
  section-mark:
    textColor: "{colors.ink}"
    typography: "{typography.stencil}"
  rule-heavy:
    backgroundColor: "{colors.ink}"
  rule-fine:
    borderColor: "{colors.muted}"
  registration:
    borderColor: "{colors.ink}"
  crop-mark:
    borderColor: "{colors.ink}"
  halftone:
    dotColor: "{colors.flare}"
  total:
    textColor: "{colors.ink}"
    typography: "{typography.display-count}"
---

# Design System: Poster — The Screenprint Poster

## Overview

**Creative North Star: "The Screenprint Poster（丝网印刷海报）"**

主页是一张刚印好、还贴在看片灯上的双色海报。纸是暖白（`#f1ebdc`），压在更暗一层纸（`#e7dfcc`）上，
四角有裁切角线、四边有套准标记、顶部一条 10px 粗规线把报头与栏目切开。信息不是"排"成网页，
而是"印"成海报栏目：巨幅窄体标题、镂空拉丁分区字 + 本地语言的分区名、粗规线分栏、细线分隔条目。

两色油墨：**墨**（`#111110`）承担全部文字与规线；**荧光橙**（`#ff4d1f`）是唯一的套印色，
只出现在三处——半调网点的一小块、链接 hover 的粗下划线、焦点 / 选区底。它从不单独承担语义。

**Key Characteristics:**

- **一张纸，一个流**：没有卡片、没有阴影层级、没有圆角。全页只有纸与油墨，唯一的深度是纸被看片灯托起的那层软阴影。
- **报头即海报**：h1 是姓名，`clamp()` 上限 6rem、`font-stretch: 82%`；下方是副标（headline）与印刷附注（印刷方式 + 地点）。
- **12 栏两组**：备注 7 + 明细 5 / 订单 5 + 纪录 7 / 技能 7 + 结账 5；每行两栏之间一条 6px 竖规线，栏上各一条 6px 横规线。
- **两套字面**：League Gothic（可变窄体）打大字与数字，Blackout 2AM 只打镂空短词，Prociono 承载正文，中文回落 Zhuque Fangsong。
- **动效只有一个作者时刻**：油墨辊压过标题（`clip-path` 从左展开一次）+ 规线画出（`scaleX`）。印完即静止。

## Colors

两色油墨、两张纸、一条淡墨——四档材料，加一层纸影。

### Primary

- **Ink（墨）`#111110`**: 标题、正文、粗规线、裁切角线、套准标记。纸面对比 **15.9:1**。
- **Flare（荧光橙）`#ff4d1f`**: 全页唯一彩色，只作套印色：半调网点、链接 hover 下划线、`::selection` 与 `:focus-visible` 的底色。
  与纸的非文本对比 **2.9:1**——因此**从不单独承载语义**：hover 前链接已有淡墨下划线（5.9:1），焦点同时有 2px 墨色 outline（15.9:1）。

### Neutral

- **Paper（纸）`#f1ebdc`**: 海报本体。所有文字都印在它上面。
- **Paper-2（纸暗）`#e7dfcc`**: 看片灯的台面（页面底色）——纸贴在另一层纸上，不是贴在深色台面上；海报的"纸边"由此可读。
- **Muted（淡墨）`#5f5a4d`**: 次级文本（编号、URL、分区本地名、附注、示例声明）与 1px 细线。纸面对比 **5.9:1**，纸暗面对比 **5.3:1**——两档都过 AA。
- **Shadow（纸影）`rgba(17, 17, 16, 0.22)`**: 唯一阴影的颜色（墨的 22%），见「Elevation & Depth」。
- **Paper-Print（打印底）`#ffffff`**: 仅 `@media print` 使用，不进屏幕呈现。

### Named Rules

**The Two-Ink Rule.** 只有两支油墨：墨与荧光橙。不许出现第三个色相，也不许用荧光橙"强调"任何文字（它没有正文级对比度）。
**The Nothing-Alone Rule.** 荧光橙不得是某条信息的唯一载体：它出现的地方必须同时有墨色文字、墨色 outline 或既有下划线。
**The Paper-Edge Rule.** 页面底色必须是纸暗（`#e7dfcc`）而不是深色台面——海报贴在看片灯上，纸边靠明度差读出来，不靠投影。

## Typography

**Display / Numerals:** League Gothic Variable（`--font-league-gothic`，wdth 可变轴 75%–100%）
**Section Marks:** Blackout 2AM（`--font-blackout`，镂空 stencil，仅拉丁短词）
**Body / Lede:** Prociono（`--font-prociono`，旧式衬线）
**CJK:** Zhuque Fangsong（`--font-zhuque`，仿宋骨架）

**Character:** 海报的字面是"窄、大、断笔"。拉丁大字被压到 82% 宽度、行高 0.86——像把整块字当图形用；
分区前是 Blackout 2AM 的镂空短词（MEMO / INDEX / ORDERS / RECORD / SKILLS / CHECKOUT），
笔画缺口就是丝网漏印的砂眼；正文换回 Prociono 的旧式衬线，保证 1rem/1.65 的长读；
中文（姓名、分区名、正文）一律落在 Zhuque Fangsong——巨幅中文标题不是"窄体"，而是"大字距的书写骨架"。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）

1. **隐喻与特征**: 丝网印刷海报 → 需要**巨幅可压缩的展示字**（宽度能压、笔画能当图形）、
   **断笔的短标题声部**（漏印感）、**能长读的衬线正文**，以及能与拉丁共处的中文书写体。
2. **角色分配**: 展示 / 数字 = League Gothic Variable；分区短标题 = Blackout 2AM（仅拉丁词，不排正文）；
   副标 / 正文 / 附注 = Prociono；中文（姓名、分区名、CJK 正文）= Zhuque Fangsong。
3. **为什么是它而非其他**: League Gothic 是字体池里唯一带 **wdth 可变轴**的窄体展示字——真窄体骨架，
   本设计取 78%–100% 五档（标题 82%、数字 78%/86%/100%、附注 85%/90%），而不是把常规宽度硬压（假窄会糊笔画）。
   Format 1452 同为窄体但单宽度、气质偏工程图；Blackout 2AM 的断笔只能当"印章式短词"，撑不起标题。
   正文用 Prociono 而非像素字（Silkscreen / Handjet / Ark Pixel）：像素声部属于屏幕与热敏纸（见 receipt），
   海报要的是纸上的阅读灰度。中文用 Zhuque Fangsong 而非 Ark Pixel：仿宋的书写笔形与丝网手绘感同源。
4. **实际覆盖与回退**: League Gothic 覆盖拉丁（ASCII 大小写 + 数字 + 常用标点）；Blackout 2AM 覆盖拉丁大写与数字
   （本设计只用 MEMO / INDEX / ORDERS / RECORD / SKILLS / CHECKOUT 六个词）；Prociono 覆盖拉丁 95/95；
   Zhuque 子集覆盖站内全部中文用字（含假名）。中文回退 Songti SC / SimSun；拉丁展示回退 Arial Narrow / Arial Black；正文回退 Georgia。
5. **字重 / 轴 / 体积 / 许可**: 四款均为单一 400 字重；仅 League Gothic 带 wdth 轴（75%–100%）。
   体积：League Gothic 18.2KB、Blackout 2AM 8.7KB、Prociono 11.6KB、Zhuque 子集 246KB。
   许可均为 **OFL-1.1**（本地 npm provider、`remote: false`）；Blackout 带 RFN「Blackout」——本项目原样分发、未改名未修改。
6. **缺失回退顺序**:
   - 展示 / 数字：`League Gothic Variable → Zhuque Fangsong → Arial Narrow → Songti SC / SimSun → sans-serif`
   - 分区短标题：`Blackout 2AM → League Gothic Variable → Arial Black → sans-serif`
   - 正文 / 副标：`Prociono → Zhuque Fangsong → Georgia → Songti SC / SimSun → serif`

### Hierarchy

- **Display / 姓名**（400, `clamp(2.6rem, 11vw, 6rem)`, 0.86, `-0.03em`, 82%）：h1，全页唯一的最大字面。
- **Display-count / 合计**（400, `clamp(2.4rem, 5vw, 3.25rem)`, 0.85, `-0.01em`, 78%）：结账栏的数字。
- **Display-imprint / 页脚署名**（400, `clamp(1.1rem, 2.2vw, 1.5rem)`, 1.05, `0.06em`, 85%）。
- **Stencil / 分区名**（400, 1.75rem, 0.04em）：Blackout 2AM 的镂空短词。
- **Lede / 副标**（400, `clamp(1.05rem, 1.8vw, 1.25rem)`, 1.55）：headline。
- **Body / 正文**（400, 1rem, **1.65**）：简介、项目描述、经历描述、联络附注——一律 1rem，不缩水。
- **Item title**（400, 1.0625rem, 1.35）：项目名、机构名。
- **Label / Meta**（400, 0.75–0.9375rem, 字距 0.04–0.22em）：分区本地名、编号、URL、合计标签、印刷附注。
- **Micro**（400, 0.6875rem, 0.18em）：页脚示例声明。

### Named Rules

**The No-Fake-Weight Rule.** 只用 400 一档字重：层级由字号、字距与墨的明度表达；`strong` / `em` 若引入需先改本规范。
**The Tracking Floor Rule.** 字距下限 `-0.04em`，本设计最紧只到 `-0.03em`（姓名）——窄体已经收紧了字面，不再靠负字距"做效果"。
**The Body-Stays-Visible Rule.** 海报可以"大声"，但正文永远是 1rem / 1.65 的 Prociono；任何分区都不得把正文降到 1rem 以下。

### 字面值登记（CSS 中出现的全部字面量）

| 令牌 | 值 | 用在哪 |
|---|---|---|
| paper | `#f1ebdc` | 纸张 |
| paper-2 | `#e7dfcc` | 页面底色 / 看片灯 |
| ink | `#111110` | 文字、粗规线、裁切角线、套准标记 |
| flare | `#ff4d1f` | 半调点、hover 下划线、选区底、焦点底 |
| muted | `#5f5a4d` | 次级文本、1px 细线 |
| shadow | `rgba(17, 17, 16, 0.22)` | 纸张的唯一阴影 |
| paper-print | `#ffffff` | 仅 `@media print` |
| font-size | `1rem` `0.6875rem` `0.75rem` `0.8125rem` `0.875rem` `0.9375rem` `1.0625rem` `1.75rem` | 正文 / 微字 / 标签 / 项目标题 / 镂空字 |
| font-size (fluid) | `clamp(2.6rem, 11vw, 6rem)` `clamp(2.4rem, 5vw, 3.25rem)` `clamp(1.1rem, 2.2vw, 1.5rem)` `clamp(1.05rem, 1.8vw, 1.25rem)` `clamp(1.0625rem, 1.8vw, 1.3125rem)` | 姓名 / 合计 / 页脚署名 / 副标 / 技能 |
| letter-spacing | `-0.03em` `-0.01em` `0.01em` `0.02em` `0.04em` `0.06em` `0.08em` `0.12em` `0.16em` `0.18em` `0.22em` | 见 Hierarchy 各档 |
| font-stretch | `78%` `82%` `85%` `86%` `90%` `100%` | 合计 / 姓名 / 页脚署名 / 编号 / 印刷附注 / 日期 |
| line-height | `0.85` `0.86` `1` `1.05` `1.35` `1.4` `1.5` `1.55` `1.65` | 同上 |
| font-weight | `400` | 全部 |
| 维度 | `min(60rem, 100%)` 纸宽；`clamp(1.6rem, 4.4vw, 3.25rem)` 纸边；`clamp(1rem, 2.6vw, 2.25rem)` 栏距；`clamp(1.9rem, 4vw, 3rem)` 行距 | Layout |
| 间距 / 偏移（rem） | `0.1rem` `0.15rem` `0.2rem` `0.3rem` `0.35rem` `0.4rem` `0.5rem` `0.55rem` `0.6rem` `0.65rem` `0.7rem` `0.8rem` `0.9rem` `1.15rem` `1.2rem` `1.6rem` `1.9rem` `2rem` `2.2rem` `2.5rem` `2.6rem` `3rem` `3.2rem` `5.5rem` `22rem` `60rem` | 套准 / 裁切偏移、附注行间距、规线与标题的节奏、条目分隔、页脚与纸边 |
| 下划线偏移 | `0.22em`（链接默认下划线） | Links |
| 页面留白 | `clamp(0.75rem, 3vw, 2.5rem)` 上 / `clamp(0.5rem, 2.5vw, 1.5rem)` 左右 / `clamp(1.5rem, 5vw, 3.5rem)` 下 | body 的纸外边距 |
| 线宽 | `10px`（报头粗规线）`6px`（分区 / 竖 / 页脚粗规线）`1px`（细线、裁切角线、套准圆、十字） | Shapes |
| 装饰尺寸 | 套准圆 `0.8rem`（窄屏 `0.65rem`）+ 十字外伸 `0.4rem`（窄屏 `0.3rem`）；裁切角线 `0.9rem`；半调网点阵 `6px`、点径 `0.9px`、块 `5.5rem × 3rem` | Shapes |
| 浏览器表面 | `color-scheme: light`；`scrollbar-color: #5f5a4d #e7dfcc`（= muted / paper-2，写在 `html:has(.ps)` 上——视口滚动条属于根元素） | Links |

## Layout

- **纸**：`width: min(60rem, 100%)`；纸边（内边距）`clamp(1.6rem, 4.4vw, 3.25rem)`——套准标记与裁切角线都活在这条纸边里。
- **报头**：h1 → 副标（`flex: 1 1 22rem`，`max-width: 40ch`）+ 印刷附注 + 半调块（同为 flex 行）→ 10px 粗规线（向两侧出血到纸边）。
- **12 栏网格**：`repeat(12, minmax(0, 1fr))`，栏距 `clamp(1rem, 2.6vw, 2.25rem)`，行距 `clamp(1.9rem, 4vw, 3rem)`。
  三段两栏：**备注 7 + 明细 5** → **订单 5 + 纪录 7** → **技能 7 + 结账 5**（宽窄交替）。
- **规线**：每栏上方 6px 横规线；同一行两栏之间 6px 竖规线（落在栏距中线上，`top:0; bottom:0` 与整行等高）；条目之间 1px 淡墨细线。
- **明细行**：编号（窄体数字）+ 链接 + 短 URL（右对齐、省略号，≤52% 宽）。
- **页脚**：6px 粗规线（flex 首行占满宽度）+ 左署名 / 右示例声明。
- **响应式**：≤880px 收成单栏（`grid-column: auto`）、竖规线与左右两枚套准标记退场、套准圆缩到 0.65rem；
  ≤600px 隐藏半调块与 URL（行只留编号与标签）；姓名靠 `clamp()` 自然落到 ~2.6rem（375px 时 11vw < 2.6rem）。
- 桌面端内容区永不贴边：纸宽上限 60rem + 页面左右 padding（≥1280px 时有明显留白）。

## Elevation & Depth

**只有一层深度：纸与看片灯。** `box-shadow: 0 18px 44px rgba(17, 17, 16, 0.22)` 把整张纸从纸暗色的台面上托起
（带偏移与软模糊，不是硬偏移投影，也不是零偏移光晕）。纸内任何元素不得再有阴影——
规线、套准标记、半调块都是**平面印刷**，不是浮起的卡片。

## Shapes

- **裁切角线**：四角各一个 `0.9rem` 的 L 形直角（1px 墨色 border 两邻边），离纸边 `0.35rem`。
- **套准标记**：细线圆 `0.8rem`（border 1px + `border-radius: 50%`）+ 十字（两条 1px 线各外伸 `0.4rem`）。
  桌面 4 枚（上 / 下 / 左 / 右边缘中点），≤880px 只留上下 2 枚并缩到 `0.65rem`。
- **粗规线**：报头 10px、分区 / 竖 / 页脚 6px——都是纯色矩形，没有渐变、没有圆角。
- **细线**：1px 淡墨，用于条目分隔、链接默认下划线（offset `0.22em`）。
- **半调网点**：`radial-gradient(flare 0.9px, transparent 1px)` + `background-size: 6px 6px`，
  `mix-blend-mode: multiply`，一块 `5.5rem × 3rem`——全页唯一的"印刷材质"，且只有一小块。
- **圆角**：纸张 0；唯一的 50% 是套准标记的圆。

## Components

### Masthead（报头）
- **h1**：姓名，`clamp(2.6rem, 11vw, 6rem)`、`font-stretch: 82%`、行高 0.86、字距 `-0.03em`、大写（CJK 无效，仅拉丁）。
  允许换行；`overflow-wrap: break-word` + `hyphens: auto` 保证 375px 不横向溢出。
- **副标**：headline，Prociono，`clamp(1.05rem, 1.8vw, 1.25rem)`，`max-width: 40ch`。
- **印刷附注**：`{印刷方式} {地点}`，League Gothic 90%、0.75rem、`0.16em`、淡墨、大写。
- **半调块**：荧光橙点阵，位于附注行右端（≤600px 隐藏）。
- **粗规线**：10px、出血到纸边；载入时 `scaleX` 画出（见 Motion）。

### Grid & Rules（12 栏与规线）
- 每个分区是一个 `<section data-reveal>`，`aria-labelledby` 指向自身可见的 `<h2>`。
- 分区标题 = 镂空拉丁词（Blackout 2AM，1.75rem，大写）+ 本地语言名（Prociono/Zhuque，0.9375rem，`0.18em`，淡墨）。
- 分区上方 6px 横规线、两栏之间 6px 竖规线都由 CSS 生成；竖规线为纯装饰（`::after`，无文本）。
- **关于 h2 数量**：报头与页脚是**地标**（`header` / `footer`），不设 h2——h1 已经承担报头，
  在 h1 上方再放一行小字就是常见的 kicker/eyebrow，本设计拒绝。六个内容分区各有一枚可见 h2。

### Items（明细 / 订单 / 纪录 / 技能）
- **明细**：编号（`aria-hidden`）+ 链接 + 短 URL（显示去协议地址，可读，不隐藏于无障碍树）。
- **订单**：编号 + 标题（有 url 则为链接）+ 描述（1rem/1.65）+ 标签行（`/` 分隔，大写，淡墨）。
- **纪录**：日期（League Gothic 100%）+ 机构；角色与描述各占一行（角色淡墨 0.875rem，描述 1rem）。
- **技能**：一行流式列表，条目之间由伪元素 `/` 分隔（装饰，不计入可访问名）。

### Total & Contact（合计 / 结账）
- 合计 = `profile.links.length`（明细件数，真实数据）；数字用 League Gothic 78%、`clamp(2.4rem, 5vw, 3.25rem)`。
- 联络：`contact.email` → `mailto:` 链接（`word-break: break-all`）；缺失时显示 `noMail` 文案（淡墨）。
- `contact.note` 作为附注排在最后（`max-width: 40ch`）。

### Links
- **Style:** 墨色文字 + 1px 淡墨下划线（offset `0.22em`）。
- **Hover:** 仅 `@media (hover: hover) and (pointer: fine)`：下划线变荧光橙 3px——"橙色粗下划线"是本设计的链接语法；
  它是既有下划线的加强，不是唯一指示。
- **Touch:** `pointer: coarse` 时 `padding-block: 0.5rem`（命中高度 ≈ 44px）。
- **Focus:** 2px 墨色 outline、offset 3px + 荧光橙底色（墨字压在橙底上 5.7:1）；荧光橙永不是唯一的焦点指示。

### Footer
- 6px 粗规线 + `SENRENBANKA · PRINTED MATTER`（League Gothic 85%、`clamp(1.1rem, 2.2vw, 1.5rem)`）+ 示例声明（0.6875rem、`0.18em`、淡墨）。
- 语气是海报的印刷署名，不是网页页脚。

### Motion（动效）
- **一个作者时刻：油墨辊压过标题。** h1 用 `clip-path: inset(-14% 100% -14% 0) → inset(-14% 0 -14% 0)` 从左展开一次，
  860ms、`cubic-bezier(0.16, 1, 0.3, 1)`（快起慢落，像辊子一次推过）；负的上下 inset 防止裁掉字形。
- **规线画出一次。** 报头 10px 粗规线在 200ms 后以 `scaleX(0)→1` 画出（720ms）；六个分区的 6px 横规线与页脚规线
  在同一条 `scaleX` 上，由共享 `IntersectionObserver` 触发——进入视口时画一次（640ms），`transform-origin: left`。
- **隐藏态只藏装饰**：`html[data-reveal-ready]` 门控下，未显现分区的规线 `scaleX(0)`——**正文从不隐藏**。
  因此无 JS / 无 IO / 减动态时页面与最终态逐像素一致。
- **持续动效：无。** 论证：海报是印出来的纸，印完就该静止；屏幕上的"呼吸/闪烁"会把海报变成装置屏。
  全页的动配额都花在"油墨压上去"这一件事上。
- `prefers-reduced-motion: reduce`：全部动画不生成（媒体查询 `no-preference` 包住整段），标题与规线原样可见。

## Do's and Don'ts

### Do:
- **Do** 把字号当图形用：姓名 6rem 上限、82% 窄体、行高 0.86；但正文一律 1rem/1.65。
- **Do** 用粗规线（6–10px）切版：一条线就是一次分栏决定，别用卡片代替。
- **Do** 让两色油墨各司其职：墨写字与线，荧光橙只做套印（半调块、hover 线、选区/焦点底）。
- **Do** 保留纸边：套准标记、裁切角线活在 padding 里，不压正文。
- **Do** 分区语义交给可见 h2（+ `aria-labelledby`）；编号、裁切线、套准标记、半调块、分隔 `/` 全部装饰化。
- **Do** 保持 375px 无横向溢出：网格 `minmax(0,1fr)`、长词 `break-word`、URL 与半调块在窄屏退场。

### Don't:
- **Don't** 引入第二个色相或第三种"材料"（无渐变、无玻璃、无卡片、无硬偏移投影）。
- **Don't** 用 Blackout 2AM 排正文或 CJK——它是镂空短词，缺字会掉到 Impact / Arial Black。
- **Don't** 把荧光橙用在正文文字上（2.9:1）或让它是某个状态的唯一指示。
- **Don't** 给每个分区做黑底白字；纸面必须留出呼吸，"大声"只在标题与规线上。
- **Don't** 做持续动画、扫描线、glitch；也不要用逐字打字效果。
- **Don't** 在 h1 上方加 kicker / eyebrow 行——报头只有姓名、副标与印刷附注。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name`（h1）/ `headline`（副标）/ `bio`（备注）/ `links`（明细，全部条目）。
- **取数**：`loadDesignView('poster', Astro.url.pathname)`（`src/lib/site.ts`）——语言由路径统一解析，页面不判断语言。
- **扩展区块取舍**：四个全部渲染——`projects`（订单）、`experience`（纪录）、`skills`（技能）、
  `contact`（结账 + 合计，合计 = `links.length`）。`avatar` 不使用（海报不印头像）。
- **多语言**：全部界面文案来自 `./messages.ts`（zh-CN / ja / en）；分区前的镂空拉丁词、`SENRENBANKA`
  与页脚 `PRINTED MATTER` 署名是三语共用的排印装置 / 品牌，理由写在 `messages.ts` 文件头。
- `<HeadMeta {...view.head} />` 原样引入；页面操作、主题切换与语言切换由**共享操作菜单**承担
  （`<ContextMenu config={view.contextMenu} />` 放于 `<body>` 末尾）——本页没有任何可见切换入口。
- 字体：`--font-league-gothic` / `--font-blackout` / `--font-prociono` / `--font-zhuque`
  （`astro.config.mjs` 注册 → 页面 `<Font>`（不 preload）→ 本文件 `@theme inline`）；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- 动效接共享 `Reveal`（`<Reveal />` 置于 `<head>`，隐藏态以 `html[data-reveal-ready]` 为唯一门控）。
