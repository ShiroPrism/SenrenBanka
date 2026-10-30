---
name: Tape — The Cassette & J-Card
description: 一盘卡式磁带与它的 J 卡内页：手写贴标、双卷轴窗、螺钉壳身，右栏是 A 面曲目单。
colors:
  back: "#241f1b"
  back-rise: "#2e2822"
  back-deep: "#17120f"
  label: "#efe6d0"
  label-2: "#e6dabf"
  ink: "#2c241b"
  dim: "#6d5c45"
  faint: "#b3a58a"
  shell: "#1d1c1a"
  shell-hi: "#2a2724"
  shell-edge: "#0f0e0d"
  shell-ink: "#9c8f7a"
  window: "#3a3228"
  window-hi: "#4a4034"
  window-lo: "#2b251e"
  hub: "#6b5a44"
  orange: "#c2642d"
  rec: "#a63b2f"
  shadow-shell: "rgba(0, 0, 0, 0.55)"
  shadow-card: "rgba(0, 0, 0, 0.52)"
  shadow-label: "rgba(0, 0, 0, 0.35)"
  shadow-reel: "rgba(0, 0, 0, 0.72)"
  highlight-shell: "rgba(255, 255, 255, 0.06)"
  highlight-reel: "rgba(255, 255, 255, 0.05)"
  highlight-screw: "rgba(255, 255, 255, 0.14)"
  tape-corner: "rgba(239, 230, 208, 0.34)"
  screw-slot: "#0e0d0c"
typography:
  display:
    fontFamily: "'UglyTypist', 'Zhuque Fangsong', 'Songti SC', serif"
    fontSize: "clamp(1.9rem, 5.5vw, 2.6rem)"
    fontWeight: 400
    letterSpacing: "0.02em"
    lineHeight: 1.15
  display-compact:
    fontFamily: "同 display"
    fontSize: "clamp(1.7rem, 9vw, 2rem)"
    fontWeight: 400
    letterSpacing: "0.02em"
    lineHeight: 1.15
  label-name:
    fontFamily: "同 display"
    fontSize: "clamp(1.05rem, 2.4vw + 0.6rem, 1.5rem)"
    fontWeight: 400
    letterSpacing: "0.02em"
    lineHeight: 1.2
  body:
    fontFamily: "'League Mono', 'Zhuque Fangsong', Consolas, 'Courier New', 'Songti SC', 'SimSun', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    letterSpacing: "normal"
    lineHeight: 1.75
  headline:
    fontFamily: "同 body"
    fontSize: "0.9375rem"
    fontWeight: 400
    letterSpacing: "0.02em"
    lineHeight: 1.6
  track-title:
    fontFamily: "同 body"
    fontSize: "0.9375rem"
    fontWeight: 400
    letterSpacing: "0.02em"
    lineHeight: "inherit (1.75)"
  note:
    fontFamily: "同 body"
    fontSize: "0.8125rem"
    fontWeight: 400
    letterSpacing: "normal"
    lineHeight: 1.7
  meta:
    fontFamily: "同 body"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.06em"
    lineHeight: "inherit (1.75)"
  label:
    fontFamily: "同 body"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.22em"
    lineHeight: "inherit (1.75)"
  micro:
    fontFamily: "同 body"
    fontSize: "0.625rem"
    fontWeight: 400
    letterSpacing: "0.18em"
    lineHeight: "inherit (1.75)"
  total:
    fontFamily: "同 body"
    fontSize: "2.4rem"
    fontWeight: 700
    letterSpacing: "0.02em"
    lineHeight: 1
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontFamily: "同 body"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-label:
    fontFamily: "同 body"
    fontSize: "0.56rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-meta:
    fontFamily: "同 body"
    fontSize: "0.38rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-micro:
    fontFamily: "同 body"
    fontSize: "0.36rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  shell: "10px"
  label: "3px"
  card: "2px"
  tape-corner: "1px"
  # 缩略外壳按卡宽等比收敛（2026-10-19）。
  preview-shell: "0.45rem"
spacing:
  scene: "clamp(1.5rem, 4vw, 3rem)（两栏间距）"
  track: "1.9rem（分区上边距）"
  row: "0.5rem（曲目行间距）"
  line: "1.75"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.label}"
  dim:
    textColor: "{colors.dim}"
  leader:
    borderColor: "{colors.faint}"
  section-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  section-index:
    textColor: "{colors.dim}"
    typography: "{typography.micro}"
  total:
    textColor: "{colors.ink}"
    typography: "{typography.total}"
---

# Design System: Tape — The Cassette & J-Card

## Overview

**Creative North Star: "The Cassette & J-Card（磁带与内页）"**

桌面摊着两样东西：左边一盘卡式磁带，右边它自己的 J 卡内页。

磁带是**纯 CSS 几何**做出来的物件——深色塑料壳、四角螺钉、一块略歪的浅色贴标（顶部一条橙边、
右上一点 REC 红），壳身下半部两个圆卷轴窗，六根辐条咬住一个轴心。它不承载信息：姓名、面别、
`C-60 / TYPE II` 在 J 卡里都有对应，所以整块 `aria-hidden`，只是一件"被放在这里的东西"。

J 卡是**全部信息**的所在：手写姓名（一盘磁带只有一支笔写得下这么多）、一行副标题、收录地点，
然后是 A 面曲目单——备注、曲目、企划、纪录、技能、结算，每个分区是一首曲目（A1…A6），
每行是"编号 + 标题 + 点引导 + 走带计数"。末尾是物件标记与一句"请翻面"。

两栏的关系不是"图 + 文"，而是**同一件物品的两面**：左边是它的外壳，右边是它包着的纸。
宽屏（≥900px）左 5 / 右 7，磁带随滚动轻微跟随（sticky）；窄屏收成单列，壳体在上、内页在下。

**Key Characteristics:**
- 两种材料：深色塑料（壳）+ 浅色标签纸（J 卡）。没有第三种表面。
- 只有一处彩色（橙）与一处红点；其余层级全部由墨的明度、字号、字距表达。
- 手写只出现在**短标签位**（姓名、贴标）；正文一律等宽 + 中文仿宋——手写体不做正文。
- 一个作者时刻：磁带落桌、贴标展开（一次性）；卷轴只在指针 / 焦点进入时缓慢转。
- 所有分隔都是"制版画上去的线"：1px 发丝线 + 点引导线，不是 UI 分隔符。

## Colors

塑料、纸、墨，加一层桌面。

### Primary
- **Orange（橙）**：全页唯一彩色，只做两件事——贴标顶部边条（5px）与播放键三角。**不做文本**
  （橙对纸仅 3.3:1，达不到正文 4.5:1）。
- **REC Red（REC 红）**：贴标右上一点红 + `REC` 字样，全页仅此一处（红对纸 5.1:1，可作小字）。

### Neutral（纸与墨）
- **Label / Label-2（贴标纸）**: J 卡底色与贴标；自上而下极缓的明度衰减（`#efe6d0 → #e6dabf`）模拟纸受光。
- **Ink（墨）**: 正文、标题、链接基准色；对纸 12.3:1。
- **Dim（淡墨）**: 次级信息（编号、计数、URL、注释、字段标签）；对贴标纸 5.2:1、对 Label-2 4.6:1（均 ≥4.5:1）。
- **Faint（发丝线）**: 分区发丝线、页脚分割线、点引导线；**非文本**（对纸约 1.9:1，仅作装饰线）。

### Neutral（壳体）
- **Shell / Shell-Hi / Shell-Edge**: 磁带塑料壳的三档明度（受光面 / 壳身 / 边缘），壳身边框 1px。
- **Shell Ink（丝印灰）**: 壳身丝印（`C-60 / TYPE II`）；对壳 5.4:1，但整块装饰，不进无障碍树。
- **Window / Window-Hi / Window-Lo**: 卷轴窗的凹面径向渐变（三档）。
- **Hub（轴心铜）**: 辐条与轴心环——磁带的机械部分唯一"非黑"的暖色。

### Shadow & Translucency（阴影与半透明）
- 壳：`0 22px 40px rgba(0,0,0,0.55)` + 顶部 `inset 0 1px 0 rgba(255,255,255,0.06)`。
- 贴标：`0 3px 7px rgba(0,0,0,0.35)`；胶带角：`rgba(239,230,208,0.34)`。
- 卷轴窗：`inset 0 3px 8px rgba(0,0,0,0.72)` + `inset 0 -1px 0 rgba(255,255,255,0.05)`；螺钉高光 `rgba(255,255,255,0.14)`，槽 `#0e0d0c`。
- J 卡：`0 24px 46px rgba(0,0,0,0.52)`——纸从桌面托起的唯一阴影，纸内不再有投影。
- 桌面：`radial-gradient(115% 85% at 50% -12%, #2e2822, #241f1b 58%, #17120f)`。

### Named Rules
**The One Orange Rule.** 橙只属于贴标边条与播放键；不得用于文本、焦点环、链接 hover 或任何"强调"。
**The One Red Dot Rule.** 红只有一个 REC 点（连字一起）；不得复制到别处，也不得参与状态语义。
**The Two-Material Rule.** 只有塑料（壳）与纸（J 卡）两种表面；不得引入第三种材质、第三套圆角或玻璃模糊。
**The Ink-Only Text Rule.** 文本只用墨的两档（ink / dim）；faint 只画线，橙与红不做正文。

## Typography

**Display / 手写声部:** UglyTypist（`--font-uglytypist`）——只用于 h1 姓名、贴标姓名、贴标面别。
**Body / 技术声部:** League Mono（`--font-league-mono`，400/700）——正文、曲目编号、走带计数、字段标签、物件标记。
**CJK 声部:** Zhuque Fangsong（`--font-zhuque`）——中文正文自动落在仿宋；中文"手写"不可得，
批注体由仿宋承担（字号缩小 + 轻度斜置，见 `.tp-label-note`）。

**Character:** 一盘手写贴标的磁带——有人用马克笔在贴标上写了名字（歪、连笔、不齐），
而内页是印好的曲目单（等宽、对齐、编号在左、计数在右）。手写与等宽的分工就是"人写的"与"机器印的"的分工；
中文落在仿宋上，是因为中文手写字体在本项目的许可闸门里没有可用项，而仿宋的书写骨架最接近"手写批注"。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**：卡式磁带 + J 卡内页 → 需要①一支"写得下"的手写声部（只出现在贴标与姓名这种短标签位，
   长篇不可读）；②一个技术等宽声部负责曲目编号、走带计数、`C-60 / TYPE II` 这类机身标记（数字必须等宽）；
   ③一个中文声部承接正文与批注。磁带不是印刷品，磨损感不属于这里。
2. **角色分配**：标题 / 贴标 = UglyTypist；正文 / 编号 / 标记 = League Mono（400 正文、700 机构名与合计数字）；
   中文 = Zhuque Fangsong。
3. **为什么是它而非其他**：UglyTypist 的档案定位就是"懒惰手写 · 磁带贴标"（Font Library，OFL），
   比 Typefesse Claire-Obscure 更贴"随手写"而非"封面设计"；Yomogi / Caveat / Permanent Marker
   停留在"未下载 / 许可未核验"，不得进生产；华康手札 / 硬笔行书等中文手写属"商用线索"，许可未核实即排除。
   等宽声部选 League Mono 而非 Share Tech Mono（工业丝印感留给 radio）、TT2020 / Special Elite / Cutive Mono
   （磨损打字机与"打印感"分别属于 fax 与 receipt）：League Mono 是池内唯一多字重技术等宽（400/700），
   数字等高、无 RFN，正好承担"编号 + 计数"的对齐职责。
4. **实际覆盖与回退**（实测，来自外部字体目录 package manifest 与完整 cmap）：
   UglyTypist —— ASCII 95/95、Latin-1 **0/62**、GB2312 0/6763、假名 0/176（因此只用于中文/ASCII 短标签，
   带变音符的拉丁会落回下一个声部）；League Mono —— ASCII 95/95、Latin-1 62/62、GB2312 0、假名 0；
   Zhuque Fangsong —— 外部 core-cjk 完整 cmap 的 12,882 个映射码位，其中 GB2312 6763/6763；
   2026-10-30 `fonts:audit` 对本页三语无缺字警告。
   回退：拉丁 → `Consolas / Courier New`；中文 → `Songti SC / SimSun`；字体加载失败 → 系统日文栈。
5. **字重 / 轴 / 体积 / 许可**：UglyTypist 单字重 400、无可变轴、27KB woff2、OFL（Font Library 页面声明）；
   League Mono 静态 400 + 700、无轴、两个文件合计 51KB、OFL-1.1（无 RFN）；Zhuque 单字重 400、
   核心包 161 个 WOFF2 分片 / 5,927,616 B、OFL。三者均允许网站嵌入与再分发；
   许可全文随外部 package 的 `licenses/` 提供，主仓不再复制。
6. **缺失回退顺序**：
   - 手写位：`--font-uglytypist → --font-zhuque → 'Songti SC' → serif`（中文姓名落仿宋，拉丁落系统手写感的 `Segoe Print / Comic Sans MS`，由 astro.config 的 fallbacks 兜底）。
   - 正文位：`--font-league-mono → --font-zhuque → Consolas → 'Courier New' → 'Songti SC' → 'SimSun' → monospace`。

### Hierarchy
- **Display**（UglyTypist 400，`clamp(1.9rem, 5.5vw, 2.6rem)`，ls 0.02em）：J 卡姓名（h1）。
- **Label Name**（UglyTypist 400，`clamp(1.05rem, 2.4vw + 0.6rem, 1.5rem)`）：贴标上的手写姓名。
- **Headline / Track Title**（League Mono 400，0.9375rem，ls 0.02em）：副标题、曲目名、企划名。
- **Body**（League Mono 400，0.875rem，lh 1.75）：简介与正文段落。
- **Meta**（0.75rem，ls 0.06em）：收录地点、URL、档期、字段标签、翻面提示。
- **Label**（0.6875rem，ls 0.22em，大写）：分区标题、行编号、走带计数、标签行。
- **Micro**（0.625rem）：分区曲目号 / 计数、贴标面别、REC、丝印、物件标记、样例声明。
- **Total**（League Mono 700，2.4rem，ls 0.02em，lh 1）：结算区的合计数。

### Named Rules
**The Handwritten-Short-Only Rule.** UglyTypist 只出现在姓名与贴标这类短标签位；正文、注释、列表一律等宽 / 仿宋。
**The Mono-Figures Rule.** 所有编号、计数、档期走 `font-variant-numeric: tabular-nums`——它们要对齐，不对齐就不是曲目单。
**The No-Bold-Body Rule.** 正文字重恒为 400；700 只给机构名与合计数字（Sheet 上唯一的两处）。

## Layout

- 场景：`width: min(52rem, 100%)`，居中；桌面 `grid-template-columns: 5fr 7fr`，间距 `clamp(1.5rem, 4vw, 3rem)`。
- **左栏（磁带）**：网格项撑满行高，内层 `.tp-deck-inner` 在 ≥900px 时 `position: sticky; top: clamp(1.25rem, 4vh, 2.5rem)`——滚动时壳体轻微跟随，不离开桌面。
- 壳体几何：`aspect-ratio: 1.58`（真实卡带比例），圆角 10px，1px 边；贴标 `inset: 10% 8% 47% 8%`、
  轻歪斜 `-1.2deg`（顶边为变换原点）；卷轴窗 `inset: auto 12% 8% 12%`、各占 31%；四角螺钉 9px。
- **右栏（J 卡）**：纸内边距 `clamp(1.4rem, 3.4vw, 2.2rem) clamp(1.2rem, 3.2vw, 2rem)`；单列流式，
  分区上边距 1.9rem，曲目行间距 0.5rem。
- 曲目行 = 编号（0.6875rem 淡墨）+ 标题（0.9375rem）+ 点引导线（`1px dotted`，居中）+ 走带计数（`01/03`）。
- 分区头 = 曲目号 + 名称 + 发丝线 + 计数（后两者装饰，`aria-hidden`）。
- **响应式**：<900px 单列，壳体在上（`min(19rem, 88%)` 居中）、J 卡在下；≤420px 收紧 h1、隐藏 URL 列。
  两档之间不混搭（没有"半双栏"）。
- 桌面端内容区左右留白来自 body 的 `clamp(0.9rem, 3.5vw, 2rem)` + 场景 `min(52rem, 100%)`。

## Elevation & Depth

只有两处深度，各自只属于一件东西：

- **磁带**：`0 22px 40px rgba(0,0,0,0.55)`——塑料壳从桌面托起；壳内只有凹陷（卷轴窗 inset 阴影）与螺钉高光。
- **J 卡**：`0 24px 46px rgba(0,0,0,0.52)`——一页纸从桌面托起；纸内零投影、零浮层。
- 两者都带 y 偏移与柔和模糊；不存在硬的零模糊方块阴影（那不是这套世界的语言）。

## Shapes

- 壳：10px 圆角矩形 + 1px 边 + 四角螺钉（9px 圆 + 45° 槽）。
- 贴标：3px 圆角纸片，顶边 5px 橙条，右上 5px REC 红点，一条旋转 -4° 的半透明胶带角。
- 卷轴窗：正圆、径向渐变凹面；内部三根 2px 辐条（旋转 0° / 60° / 120° = 六齿）+ 30% 轴心环。
- 播放键：CSS 三角（7×8px，橙色）——不是字符、不是图标库。
- 分区 / 页脚：1px 实线发丝线；行内引导线 2px 点线。
- 链接：1px 下划线、faint 色、offset 3px。

## Components

### Cassette Shell（签名组件）
- **Geometry:** 壳身 + 贴标 + 双卷轴窗 + 四角螺钉 + 中缝丝印，全部 CSS 几何，无图片、无 SVG。
- **A11y:** 整块 `aria-hidden="true"`——姓名 / 面别 / `C-60 / TYPE II` 在 J 卡内均有对应文本，重复朗读无收益；
  壳内无任何可聚焦元素。
- **Motion:** 落桌（620ms）+ 贴标展开（560ms，延迟 90ms），只播一次；卷轴 hover / focus-within 时 60s 一周。
  因壳内当前没有可聚焦元素，`:focus-within` 分支是"未来加控件即生效"的预留（今天由 hover 触发）。

### J-Card（右栏）
- **Header:** h1 姓名（手写，-0.6° 轻微歪斜）→ 副标题 → 收录地点（大写字段标签 + 值）。
- **Sections:** 六个具名 `<h2>`（备注 / 曲目 / 企划 / 纪录 / 技能 / 结算），各自 `aria-labelledby`；
  曲目号与计数在 h2 内但 `aria-hidden`，可访问名只留分区名。
- **Track rows:** `01` + 链接 + 点引导 + `01/03`（走带计数 = 行位置 / 本面总数，真实数据，不虚构时长）。
- **Projects / Logs:** 编号 + 标题（有 url 则链接，右随去协议短 URL）+ 描述（淡墨，≤46ch）+ 标签（`[ … ]` 由伪元素承担）。
- **Skills:** 一行以 ` · ` 分隔（真数据，不补写）。
- **Checkout:** 合计 = `links.length`（曲目数）；联络方式（mailto 或"未配置"）+ 备注。

### Links
- **Style:** 墨色 + faint 下划线（offset 3px）；无边框、无背景。
- **Hover:** 仅 `(hover: hover) and (pointer: fine)` 下反白（背景→墨、文字→纸），瞬变无过渡。
- **Touch:** `pointer: coarse` 时纵向 padding 0.65rem（14px × 1.75 行高 + 两侧 10.4px ≈ 45px 命中高）。
- **Focus:** 2px 墨色 outline、offset 3px——**不是橙色**（橙只属于贴标边条与播放键）。
- **Selection:** 墨底纸字（与反白同一套语言）。

### Motion（动效）
- **一个作者时刻 = 磁带落桌（`tp-drop` 620ms）+ 贴标以顶边为铰链展开（`tp-unfold` 560ms / 延迟 90ms）**，
  曲线 `cubic-bezier(0.16, 1, 0.3, 1)`（快出、平滑落定），只播一次；两段共享同一条时间线，读作"放下一盘带子、贴标弹平"。
- **滚动显现**：共享 `IntersectionObserver`（机制见 `docs/adr/0001`）；六个分区 + 页脚
  `opacity 0→1 / translateY(10px→0)`，320ms，`cubic-bezier(0.22, 1, 0.36, 1)`；隐藏态只以
  `html[data-reveal-ready]` 为门控，无 JS / 无 IO / 减动态时内容始终可见。
- **持续动效：卷轴**。只在 `:hover` / `:focus-within` 时以 `60s linear` 转一周；指针离开即停。
  论证：卷轴是这套物件里唯一"本来就会转"的零件，它的动只属于"被拨动"，不是环境装饰；静止时不转。
- `prefers-reduced-motion: reduce`：落桌 / 展开 / 卷轴全部不生成，贴标停在 -1.2°、卷轴纹丝不动，内容原样呈现。

### Footer
- 发丝线切出：`C-60 · TYPE II · NR ON`（物件标记）→ 翻面提示 → `SENRENBANKA · 内页名 · 样例声明`。
- 语气是"这盘带的结尾"，不是网页页脚。

## CSS 字面量登记（与 style.css 一一对应）

### 色值
| 令牌 | 值 | 用途 |
|---|---|---|
| `--tp-back` | `#241f1b` | 桌面中间调 |
| `--tp-back-rise` | `#2e2822` | 桌面受光档（渐变顶） |
| `--tp-back-deep` | `#17120f` | 桌面最深档 / 底色 |
| `--tp-label` | `#efe6d0` | J 卡 / 贴标纸主色 |
| `--tp-label-2` | `#e6dabf` | 纸的第二档（渐变尾 / 页脚区） |
| `--tp-ink` | `#2c241b` | 正文墨 |
| `--tp-dim` | `#6d5c45` | 淡墨（次级信息） |
| `--tp-faint` | `#b3a58a` | 发丝线 / 点引导线（非文本） |
| `--tp-shell` | `#1d1c1a` | 壳身 |
| `--tp-shell-hi` | `#2a2724` | 壳身受光 / 螺钉面 |
| `--tp-shell-edge` | `#0f0e0d` | 壳边 / 渐变暗端 |
| `--tp-shell-ink` | `#9c8f7a` | 壳身丝印（装饰） |
| `--tp-window` | `#3a3228` | 卷轴窗中档 |
| `--tp-window-hi` | `#4a4034` | 卷轴窗受光 |
| `--tp-window-lo` | `#2b251e` | 卷轴窗暗端 |
| `--tp-hub` | `#6b5a44` | 辐条 / 轴心环 |
| `--tp-orange` | `#c2642d` | 贴标边条 + 播放键（不做文本） |
| `--tp-red` | `#a63b2f` | REC 点 + REC 字（全页一处） |
| 阴影 / 半透明 | `rgba(0,0,0,0.55)` `rgba(0,0,0,0.52)` `rgba(0,0,0,0.35)` `rgba(0,0,0,0.72)` | 壳 / 卡 / 贴标 / 卷轴窗阴影 |
| 高光 / 胶带 | `rgba(255,255,255,0.06)` `rgba(255,255,255,0.05)` `rgba(255,255,255,0.14)` `rgba(239,230,208,0.34)` | 壳顶 / 窗底 / 螺钉 / 胶带角 |
| 螺钉槽 | `#0e0d0c` | `.tp-screw::before` |

### 字号
| 值 | 用途 |
|---|---|
| `0.875rem`（14px） | body 基准、正文段落 |
| `0.9375rem`（15px） | 副标题、曲目名、企划名 |
| `0.8125rem`（13px） | 描述注释、技能行 |
| `0.75rem`（12px） | 收录地点、URL、档期、字段标签、翻面提示 |
| `0.6875rem`（11px） | 分区标题、行编号、走带计数、标签行 |
| `0.625rem`（10px） | 分区曲目号 / 计数、贴标面别、批注、REC、丝印、物件标记、样例声明 |
| `clamp(1.05rem, 2.4vw + 0.6rem, 1.5rem)` | 贴标手写姓名 |
| `clamp(1.9rem, 5.5vw, 2.6rem)` | h1 姓名（≤420px 档：`clamp(1.7rem, 9vw, 2rem)`） |
| `2.4rem` | 合计数 |

### 字距
| 值 | 用途 |
|---|---|
| `0.02em` | 姓名、副标题、曲目名、机构名、技能行、合计数 |
| `0.06em` | 收录地点、贴标批注、行编号、档期 |
| `0.1em` | 走带计数、标签行、合计单位 |
| `0.14em` | 分区曲目号、翻面提示、样例声明 |
| `0.18em` | 字段标签、REC、分区计数、丝印 |
| `0.22em` | 分区标题、合计标签、物件标记 |
| `0.3em` | 贴标面别 |

### 行高 / 圆角 / 线
| 值 | 用途 |
|---|---|
| `1.75` | body 与正文继承 |
| `1.6` / `1.7` | 副标题 / 注释 |
| `1.15` / `1.2` / `1` / `1.3` | 姓名 / 贴标姓名 / 合计数 / 丝印 |
| `10px` / `3px` / `2px` / `1px` | 壳 / 贴标 / J 卡 / 胶带角圆角 |
| `5px` / `9px` / `2px` / `1px` | 贴标橙条高 / 螺钉直径 / 辐条宽 / 发丝线与边框 |

### 动效参数
| 参数 | 值 |
|---|---|
| 落桌 | `620ms cubic-bezier(0.16, 1, 0.3, 1)`，`both`，一次性 |
| 贴标展开 | `560ms cubic-bezier(0.16, 1, 0.3, 1)`，`90ms` 延迟，`both`，一次性 |
| 卷轴 | `60s linear infinite`，仅 `:hover` / `:focus-within` |
| 滚动显现 | `320ms cubic-bezier(0.22, 1, 0.36, 1)`，位移 `10px` |

## Do's and Don'ts

### Do:
- **Do** 让手写只出现在姓名与贴标：短、少、可辨认；正文永远等宽 + 仿宋。
- **Do** 用墨的两档 + 字号 + 字距表达层级；橙只画边条与播放键，红只点 REC。
- **Do** 让编号 / 计数走等宽对照（`tabular-nums`）——曲目单的第一性要求是对齐。
- **Do** 保持两件物件的唯一深度关系（各自一条柔和阴影）；纸内零投影、壳内只有凹陷。
- **Do** 用 CSS 几何做机械细节（螺钉、辐条、轴心、播放键三角），不引入图标库或图片。
- **Do** 分区语义由可见 `<h2>` 承担；曲目号 / 计数 / 引导线 / 壳体 / 胶带一律 `aria-hidden`。
- **Do** hover 反白瞬变、focus 用墨色 outline、触屏命中区 ≥44px。

### Don't:
- **Don't** 把 UglyTypist 用于正文、注释或长句——可读性是硬约束，手写只做标签。
- **Don't** 引入第二种彩色、第二种材质、第二个红点或第二套圆角。
- **Don't** 让卷轴常转或加扫描线 / 闪烁 / 逐字打印——持续动效只属于"被拨动的卷轴"。
- **Don't** 给贴标加渐变文字、给壳体加硬偏移阴影或玻璃模糊。
- **Don't** 虚构时长 / 曲目数：走带计数用真实行位置，合计用 `links.length`。
- **Don't** 用 emoji、图片或外部请求装饰——这盘带子里没有这些东西。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：`loadDesignView('tape', Astro.url.pathname)`（`src/lib/site.ts`）——页面不接触文件路径、不自行判断语言。
- **扩展区块取舍**：`projects`（企划）、`experience`（纪录）、`skills`（技能）、`contact`（结算 + 合计）全部渲染；
  曲目号按分区实际出现顺序顺延（缺区块不留空号）。
- `<HeadMeta {...view.head} />` 原样引入；操作 / 主题 / 语言切换全部由共享操作菜单承担
  （无条件接入 `<ContextMenu config={view.contextMenu} />`），本页不保留任何可见切换入口。
- 字体：`--font-uglytypist` / `--font-league-mono` / `--font-zhuque`（astro.config 注册 → 页面 `<Font>`（不 preload）
  → 本文件 `@theme inline { --font-tape-hand / --font-tape-mono }`）；CSS 入口保持
  `@import "tailwindcss" source(none); @source "./";`。
- 类前缀：`tp-`（本套全部选择器）；无运行时脚本、无图片、无外部请求。
- 对比度维护：墨 12.3:1、淡墨 5.2:1 / 4.6:1（两档纸）；橙 3.3:1 仅作装饰、红 5.1:1 仅一处小字。
