---
name: Pager — The Belt Pager
description: 一台别在腰上的寻呼机：深灰塑料机身、单色偏绿 LCD、信号 / 电池 / MSG 状态栏，收件箱里一条条编号消息，屏底一行屏显收尾。
colors:
  back: "#141613"
  back-rise: "#1b1e19"
  shell: "#3b403a"
  shell-2: "#2c302b"
  shell-hi: "#565c53"
  preview-shell-shadow: "rgba(0, 0, 0, 0.48)"
  preview-shell-highlight: "rgba(255, 255, 255, 0.14)"
  lcd: "#b9c6a6"
  lcd-2: "#a9b795"
  ink: "#20281c"
  dim: "#46503c"
  green: "#7fae4e"
typography:
  display:
    fontFamily: "'Silkscreen', 'Ark Pixel 12px', 'Songti SC', 'SimSun', monospace"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.02em"
  display-compact:
    fontFamily: "同 display"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.02em"
  body:
    fontFamily: "同 display"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  note:
    fontFamily: "同 display"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  meta:
    fontFamily: "同 display"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.08em"
  message-title:
    fontFamily: "同 display"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  label:
    fontFamily: "同 display"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  micro:
    fontFamily: "同 display"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.26em"
  digit-lg:
    fontFamily: "'Handjet Variable', 'Silkscreen', 'Ark Pixel 12px', 'Songti SC', 'SimSun', monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
    fontVariationSettings: "'wght' 700, 'ELGR' 1, 'ELSH' 8"
  digit-lg-compact:
    fontFamily: "同 digit-lg"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  digit-md:
    fontFamily: "同 digit-lg"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  digit-sm:
    fontFamily: "同 digit-lg"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
    fontVariationSettings: "'wght' 700, 'ELGR' 1, 'ELSH' 8"
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontFamily: "同 body"
    fontSize: "0.55rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-label:
    fontFamily: "同 display"
    fontSize: "0.42rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
  preview-label-lg:
    fontFamily: "同 display"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
  preview-micro:
    fontFamily: "同 body"
    fontSize: "0.36rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-digits:
    fontFamily: "同 digit-lg"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  device: "1.15rem（机壳；窄屏 0）"
  screen: "0.4rem"
  status: "0.2rem"
  key: "0.4rem"
  wheel: "0.31rem（胶囊的一半）"
  led: "50%"
  # 缩略机壳按卡宽等比收敛（2026-10-19）。
  preview-device: "0.8rem"
  preview-screen: "0.25rem"
spacing:
  device-gutter: "clamp(0.75rem, 3vw, 1.5rem)"
  device-width: "min(27rem, 100%)"
  shell-padding: "0.8rem 0.8rem 0.65rem"
  screen-padding: "0.65rem 0.85rem 0.9rem"
  message-gap: "0.7rem（上边距 + 1px 点线）"
  step: "70ms（消息载入步进，上限 8 步）"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    textDecorationColor: "{colors.dim}"
  link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lcd}"
  link-focus:
    outlineColor: "{colors.green}"
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lcd}"
  dim:
    textColor: "{colors.dim}"
  section-rule:
    borderColor: "{colors.dim}"
  status-bar:
    backgroundColor: "{colors.lcd-2}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
  brand-line:
    textColor: "{colors.lcd}"
    typography: "{typography.micro}"
  power-led:
    backgroundColor: "{colors.green}"
    boxShadow: "0 0 6px rgba(127, 174, 78, 0.7)"
  selection:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
---

# Design System: Pager — The Belt Pager

## Overview

**Creative North Star: "The Belt Pager（寻呼机）"**

主页是一台别在腰上的寻呼机（Motorola Advisor 的气质）：深灰塑料机壳，顶部一条扬声器开缝与一枚常亮的电源灯，
下面是一块偏橄榄绿的单色 LCD，底部一行按键与滚轮。整块屏幕只有一个用途——**收件箱**：
状态栏（信号格 / 电池 / MSG 计数）永远在顶上，消息一条压一条下来，最后用一行 `-- END OF MESSAGES --` 收尾。

信息不是「排版」出来的，是「收到」的：每条消息有编号（`01`…）、一个屏显短标题（备注 / 链接 / 项目…）和正文，
用 1px 点线切开，靠像素字与点阵数字维持一台 1990 年代设备的秩序感。
屏幕外的一切——机壳、扬声器槽、按键、滚轮——都是这台机器的**器具**，全部 `aria-hidden`，不参与任何语义。

与同项目的小票机（receipt）刻意不同构：那是**一张纸**（撕边、虚线分栏、章、无限长），这是一**台机器**
（机壳厚度、固定视窗、状态栏、按键）；纸是印刷品，机器是通电的——所以本套唯一的动效时刻是「开机」。

**Key Characteristics:**
- 一个视窗、一条竖流；没有卡片、没有栅格、没有投影层级（唯一投影是把机器从台面托起的柔影 + 屏幕的内凹阴影）。
- 屏上只有两档墨（ink / dim）与一条点线；块与块之间只有点线，没有第二种分隔。
- 全页只有一个彩色：背光绿（电源灯 / 电池填充 / 选区 / 焦点描边），面积以像素计。
- 中文落在 12px 网格的像素字上，拉丁落在 Silkscreen，数字（编号 / 计数 / 状态 / 日期）落在 Handjet 的可变点阵上。
- 动效 = 「通电」：屏幕两段亮度跳变开机，消息逐条两段跳变载入；没有扫描线、没有持续闪烁。

## Colors

材料只有三样：塑料机壳、LCD 玻璃、屏上的墨。再加一层桌面。

### Primary
- **Ink（像素墨）** `#20281c`：屏上正文、标题、链接的基准色；LCD 面上 8.46:1，状态条面上 7.16:1。
- **Backlight Green（背光绿）** `#7fae4e`：全页唯一彩色。仅四处：电源灯、电池填充、`::selection`、焦点描边。
  与墨互为 5.84:1（反白块上的绿色描边、绿底上的墨字都达标）。

### Neutral
- **LCD（屏底）** `#b9c6a6`：屏面基色，所有文本都落在这一档上。
- **LCD-2（屏底暗档）** `#a9b795`：只做**状态条底色**与屏幕内凹阴影的边缘；上面只放墨色文本（7.16:1），
  不放淡墨（4.00:1，不达标）。
- **Dim（淡墨）** `#46503c`：次级信息（地点、注释、URL、收尾声明）与所有点线。LCD 面上 4.73:1。
- **Shell / Shell-2（机壳）** `#3b403a` / `#2c302b`：机壳自上而下的塑料渐变（上受光、下暗）。
- **Shell-Hi（塑料高光）** `#565c53`：扬声器开缝、按键三角、滚轮棱线；**非文本**，1.95:1 仅作形体暗示。
- **Back / Back-Rise（桌面）** `#141613` / `#1b1e19`：深色台面与其顶部受光的径向渐变。

### Named Rules
**The One Green Rule.** 绿只表达「通电 / 选中 / 焦点」。任何新元素不得用绿表达「强调」或「成功」。
**The Two-Ink Rule.** 屏上墨只有两档：ink（正文）与 dim（次级 + 点线）。dim 不得上状态条，ink 不得上机壳。
**The Glass Rule.** 文本只允许落在 `--pg-lcd` 上（唯一例外：状态条的墨色文本落在 `--pg-lcd-2`）。
机壳上只有一档浅色屏幕印字（`--pg-lcd`），机身细节一律用 `--pg-shell-hi` 且不得承载信息。

## Typography

**Display / Body / Label Font:** Silkscreen（像素屏字；回退 Courier New / Courier）
**CJK Font:** Ark Pixel 12px（12px 网格像素黑体；回退 Songti SC / SimSun）
**Digits Font:** Handjet Variable（点阵可变：`wght` 100–900、`ELGR` 1–2、`ELSH` 0–16）

**Character:** 一台单色 LCD 设备的字面是「格子里的字」：拉丁被切进 Silkscreen 的像素格，
汉字落在 12px 方点阵里，数字（消息编号、MSG 计数、合计、日期）则用 Handjet 的**点阵元素**拼出来——
`font-variation-settings: "wght" 700, "ELGR" 1, "ELSH" 8` 让元素聚成实心方格，读起来像屏上真的点了灯。
（实测：`ELSH 0` 元素退化为零面积 → 数字完全不显；`ELSH 2` 是字体默认的细笔画；`ELSH 8` 才是实物屏的实心点阵。）
**Silkscreen 是 unicase**：小写字形与大字同高，拉丁在任何语速下都呈现大写骨架——这正好是设备屏的字面，
因此除标题外不再叠加 `text-transform`。像素字在 15px 上并非栅格整数倍，边缘会轻微软化——这是低分辨率屏的质感，
不做修正（可读性优先）。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: 单色 LCD 寻呼机 → 需要「格子里的字」：小字号像素标签（状态栏 / 标题）、
   点阵数字（编号 / 计数 / 日期）、以及与拉丁共处的 12px 网格中文。需要**锐利、干燥、无磨损**——
   磨损属于传真机（fax），打字机属于小票机（receipt）。
2. **角色分配**: 拉丁标签 / 标题 / 正文 = Silkscreen（400，必要时 700）；数字 = Handjet Variable（可调轴）；
   中文 = Ark Pixel 12px。
3. **为什么是它而非其他**: Silkscreen 是池内唯一「为屏显设计」的像素字（4×8 骨架、字距天然宽、unicase），
   在 10–12px 上仍锐利；Handjet 是池内唯二可变字体之一，且是唯一带点阵轴（ELGR / ELSH）的一款，
   正好对应 LCD 的「元素网格」——`ELSH 8` 经真实样张对比后选定（0 = 元素消失，2 = 细笔画，8 = 实心点阵）；
   中文只有两条开放路径，像素网格这一侧只能是 Ark Pixel（Zpix 因官方无许可文件被排除）。
   DSEG7 / DSEG14 留给 receipt / radio（段码是收据与仪表的读数语言，寻呼机的数字是点阵而不是七段）。
4. **实际覆盖与回退**: Silkscreen 仅拉丁（ASCII 与常用标点，约 200 字形）；Ark Pixel 由外部
   catalog v1.0.0 提供完整 `core-cjk` cmap（55 个 `unicode-range` 分片，家族包 1,371,013 B），
   当前页面文案不再受旧站内 1,992 字子集限制；Handjet latin-full 覆盖 0-9 与拉丁。中文回退
   Songti SC / SimSun，拉丁回退 Courier New / Courier，通用兜底 monospace。
5. **字重 / 轴 / 体积 / 许可**: Silkscreen 400 + 700 静态（16KB）；Handjet 单文件可变 100–900 +
   ELGR / ELSH 轴（18KB）；Ark Pixel 家族包 1,371,013 B / 55 分片。三者均 OFL-1.1，
   无 RFN 义务（字体文件原样分发、未修改）。
6. **缺失回退顺序**: 数字 `--font-handjet → Silkscreen → Ark Pixel → Songti SC / SimSun → monospace`；
   标签 / 正文 `--font-silkscreen → Ark Pixel → Songti SC / SimSun → monospace`（汉字逐字落到第二档）。

### Hierarchy
- **Display**（400, 1.5rem / 窄屏 1.25rem, 字距 0.02em）：姓名（`h1`，屏头唯一的大字）。
- **Body**（400, 0.9375rem, 行高 1.7）：简介、消息正文、技能、联系行。
- **Note**（400, 0.875rem, 行高 1.7, dim）：项目 / 经历描述、未配置联系方式的提示。
- **Meta**（400, 0.75rem, 字距 0.08em, dim）：URL、标签行。
- **Message Title**（400, 0.75rem, 字距 0.14em, 大写）：每条消息的屏显标题（`h2`）。
- **Label / Micro**（400, 0.6875rem / 0.625rem）：地点行、合计标签、状态栏、机壳品牌行、收尾声明。
- **Digits**（Handjet 700, `ELGR` 1 / `ELSH` 8）：消息编号 2.25rem（窄屏 1.875rem）、合计 1.75rem、
  MSG 计数与日期 1.125rem。Handjet 的字面高度约为 0.67em，故字号比同高的拉丁字大两档。

### Named Rules
**The No-Bold-Body Rule.** 正文不使用 700（像素字加粗在小字号上糊成一块）；层级靠字号、字距、墨的明度。
700 只出现在 Handjet 数字上（那是点阵元素，不是字重）。

## Layout

- 机器：`width: min(27rem, 100%)`，居中；机壳内边距 `0.8rem 0.8rem 0.65rem`；桌面四周留白由 body 的
  `clamp(1.1rem, 4vw, 2.4rem)` / `clamp(0.75rem, 3vw, 1.5rem)` 提供。
- 机壳自上而下三段：**顶栏**（扬声器开缝 + 品牌行 + 电源灯）→ **LCD**（状态栏 / 屏头 / 消息 / 收尾）→ **按键行 + 滚轮**。
- 屏幕内边距 `0.65rem 0.85rem 0.9rem`；状态条是一条内嵌的暗档条（`--pg-lcd-2` 底、`0.2rem` 圆角），
  贴在屏头之上，作为「屏上的系统条」而不是第二个分区。
- 一条消息 = 头行（编号 + 标题 + 点线拉到行尾）+ 正文；消息之间以 `1px dotted` 上边距 `0.7rem` 切开。
- 屏头：`h1` 姓名 → headline → 地点行；紧接着第一条消息（备注 / bio）。首屏不出现卡片、不出现按钮。
- 页脚：点线切出，屏显收尾居中（字距 0.2em）+ 示例声明（dim、字距 0.08em）。
- 响应式：≤560px 机器满宽（贴边）、机壳减薄、屏幕内边距收至 `0.5rem 0.6rem 0.75rem`，
  姓名 1.25rem、编号 1.875rem、行尾 URL 隐藏；375px 无横向溢出（URL 与邮箱 `overflow-wrap: anywhere`）。

## Elevation & Depth

深度只有两件事，都由**内凹**表达，因为这是一台机器而不是一叠纸：

1. **机壳**：外柔影 `0 24px 50px rgba(0, 0, 0, 0.55), 0 6px 14px rgba(0, 0, 0, 0.35)` 把机器从台面托起，
   内高光 `inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -3px 0 rgba(0, 0, 0, 0.32)` 交代塑料的厚度。
2. **屏幕**：`inset 0 2px 7px rgba(0, 0, 0, 0.34), inset 0 0 0 1px rgba(0, 0, 0, 0.36)`——玻璃沉在机壳里，
   屏幕**不**向外投影。按键与滚轮各有一层 `inset` 高光 + 1–2px 下方实影，模拟塑料键帽。
   全部阴影收在 `--pg-shadow-*` 令牌里（见「令牌登记」）。

机壳内任何元素不得再有外投影；屏幕内不得出现 blur / 玻璃拟态。

## Shapes

- 机壳圆角 1.15rem（窄屏 0，满宽贴边时直角更硬）；屏幕 0.4rem；状态条 0.2rem；键帽 0.4rem；滚轮 0.31rem（胶囊）。
- 分隔只有一种：`1px dotted` 的淡墨点线（消息之间、标题拉到行尾、屏底收尾）。
- 信号格 = 4 根 2px 竖条（3 实 + 1 描边空格）；电池 = 1px 描边矩形 + 绿色填充 + 右侧电极凸点。
- 方向键三角用 `clip-path: polygon()` 剪出（不用单侧粗边框——那是「卡片侧边条」的形状语言）。
- 滚轮 = 竖向棱线的 `repeating-linear-gradient`。
- 链接下划线：1px、淡墨色、offset 3px——像屏上的字符下划线，不是 UI 装饰。

## Components

### Shell & Top Rail
- **Style:** 深灰渐变塑料 + 内高光；顶部一条 `repeating-linear-gradient` 扬声器开缝（3.4rem × 0.6rem，opacity 0.85）。
- **品牌行:** `SENRENBANKA`（Silkscreen 0.625rem、字距 0.26em、`--pg-lcd` 屏幕印字色，机身塑料上 5.90:1）。
  品牌名不翻译（站名），三语言同形——见 `messages.ts` 文件头。
- **电源灯:** 0.4rem 圆点，背光绿 + `0 0 6px rgba(127, 174, 78, 0.7)` 辉光；`aria-hidden`（装饰，不代表真实电源状态）。

### Status Bar（状态栏）
- **结构:** 左信号格（4 条）· 中电池 · 右 `MSG 03`；整条 `aria-hidden`——屏上的机器状态是 chrome，
  链接条数在「链接」消息里本来就逐条列出，读屏不损失信息。
- **数据:** `MSG` 后的两位数是 `profile.links.length`（真实数据，不是装饰数字），与「联系」消息的「合计」同源。
- **Style:** `--pg-lcd-2` 底、墨色字、Micro 字距 0.14em；数字走 Handjet 1.125rem。

### Messages（消息 = 分区）
- **头行:** 编号（Handjet 2.25rem，`aria-hidden`）+ `h2` 标题（Silkscreen 大写、0.75rem、字距 0.14em）+ 点线拉到行尾。
- **编号连续:** 编号在渲染时按 DOM 顺序递增，缺区块（projects / experience / skills）时不留空号。
- **正文:** 0.9375rem / 1.7；次级说明 0.875rem / 1.7 且 dim。
- **Semantics:** 六个消息各有一枚**可见** `<h2>`（备注 / 链接 / 项目 / 经历 / 技能 / 联系），
  section 以 `aria-labelledby` 指向它；编号、点线、URL、滚轮、按键、状态栏一律 `aria-hidden`。
- **屏头:** `<header>` 持有全页唯一 `h1`（姓名），它不需要 h2——页面标题就是它的名字。

### Links
- **Style:** 墨色 + 淡墨下划线（offset 3px）；无边框、无背景。
- **Hover:** 仅 `@media (hover: hover) and (pointer: fine)` 下反白（背景→墨、文字→LCD），瞬变无过渡。
- **Touch:** `pointer: coarse` 时 `padding-block: 0.6rem`（15px × 1.7 + 2 × 9.6px ≈ 44px 命中区）。
- **Focus:** 反白块（墨底 + LCD 字）+ 2px 背光绿描边（offset 2px）。绿在 LCD 上单独只有 1.4:1，
  不能单独承担焦点指示——反白块先把状态拉到 8.46:1，绿只是「通电」的签名。

### Keys & Wheel
- 两枚键帽（左 / 右三角）+ 右侧滚轮，`aria-hidden`；不属于任何交互（这是装饰性器具，页面不假装有翻页功能）。
- 键帽 `2.6rem × 1.05rem`，滚轮 `2.2rem × 0.62rem`。

### Motion（动效）
- 动效语言 = **通电**。机器只有一件事会动：开机与收信。没有扫描线、没有光标呼吸、没有持续循环。
- **开机（首屏一次）**：一层关机帘（`--pg-ink`）在屏上做两段亮度跳变：`0.94 → 0.45 → 0`
  （`380ms`，`steps(1, end)`）。起点是 0.94 而不是 1——即使动画未推进，屏幕内容仍然可读。
- **消息载入**：每一行（`.pg-line`）做一次两段跳变 `0 → 0.45 → 1`（`180ms`，`steps(1, end)`），
  按 `--d` 逐行错开 70ms（上限 8 步）。**不是淡入**：像素屏的亮起是台阶，不是渐变。
- **首屏节奏**：姓名 140ms → headline 210ms → 地点 280ms → 备注消息头 350ms → 正文 420ms，0.5s 内落定。
- **滚动进入视口**（共享 `IntersectionObserver`，只播一次；机制见 `docs/adr/0001`、`docs/adr/0003`）：
  消息头先亮，行随后按 70ms 节奏载入；隐藏态以 `html[data-reveal-ready]` 为唯一门控。
- **持续动效：无。** 论证：寻呼机的屏是静态的——它只在收到消息时闪一下；扫描线、光标呼吸都是 CRT 的语言，
  属于终端（terminal），不属于 LCD 寻呼机。全页的「动」配额都花在开机这一次上。
- `prefers-reduced-motion: reduce`：不生成任何动画，内容原样呈现（无 JS / 无 IO 时同样如此）。

## Do's and Don'ts

### Do:
- **Do** 把每条消息做成「编号 + 屏显短标题 + 正文」的收信条目，用 1px 点线切分。
- **Do** 用字号 / 字距 / 两档墨表达层级；绿色只出现在状态、选区与焦点。
- **Do** 让数字走 Handjet（编号、计数、合计、日期），让汉字落在 12px 网格上。
- **Do** 保持「玻璃沉在机壳里」这一个深度关系（屏幕只有内凹阴影）；机壳内零外投影。
- **Do** hover 反白瞬变、focus 反白 + 绿描边；触屏命中区 ≥44px。
- **Do** 让 `MSG` 计数与「合计」都来自 `links.length`（真实数据），不编造未读数。

### Don't:
- **Don't** 引入第二个色相（绿是唯一的彩色）、第二种分隔线（只有点线）、第二套圆角。
- **Don't** 画扫描线、加 glitch、做持续闪烁或光标呼吸——那是 CRT / 终端的语言。
- **Don't** 把按键 / 滚轮做成可点击的假控件：它们是 `aria-hidden` 的器具，不承担任何功能。
- **Don't** 用卡片、外投影、玻璃模糊堆层级——屏里只有墨与点线。
- **Don't** 在状态栏用淡墨（`--pg-lcd-2` 上只有 4.00:1）；状态栏只允许墨色文本。
- **Don't** 让 700 字重进入正文（像素字加粗在小字号上糊）。

## 令牌登记（CSS 字面量 ↔ 本文件）

`style.css` 里出现的每个色值 / 字号 / 字距 / 行高都在此登记，新增前先改本节。

### 色值
| 令牌 | 值 | 用途 | 对比度（实测） |
|---|---|---|---|
| `--pg-back` | `#141613` | 桌面底色 | — |
| `--pg-back-rise` | `#1b1e19` | 桌面顶部受光（径向渐变） | — |
| `--pg-shell` | `#3b403a` | 机壳上段（受光） | lcd 印字 5.90:1 |
| `--pg-shell-2` | `#2c302b` | 机壳下段 / 键帽底 | lcd 印字 7.47:1 |
| `--pg-shell-hi` | `#565c53` | 扬声器开缝 / 按键三角 / 滚轮棱线（**非文本**） | 对 shell-2 1.95:1（形体暗示，不承载信息） |
| `--pg-lcd` | `#b9c6a6` | 屏底（全部文本的落点） | ink 8.46:1 / dim 4.73:1 |
| `--pg-lcd-2` | `#a9b795` | 状态条底色（只放墨色文本） | ink 7.16:1（dim 4.00:1 → 禁用） |
| `--pg-ink` | `#20281c` | 像素墨：正文 / 标题 / 链接 | 见上 |
| `--pg-dim` | `#46503c` | 淡墨：次级文本 + 全部点线 | 4.73:1（LCD 上） |
| `--pg-green` | `#7fae4e` | 背光绿：电源灯 / 电池 / 选区 / 焦点 | 对 ink 5.84:1；对 back 6.99:1 |
| `transparent` | — | 信号第 4 格（空格）/ 渐变过渡 | 非文本 |

> **偏差**：简报给的淡墨是 `#4a5540`，实测在 LCD 上仅 **4.39:1**（低于正文 4.5:1 硬底线），
> 故下调一档为 `#46503c`（4.73:1）。两档纸／屏底都没有更暗的落点可选，只能改墨。

### 阴影 / 辉光（全部收在令牌里，避免散落 rgba）
| 令牌 | 值 |
|---|---|
| `--pg-shadow-device` | `0 24px 50px rgba(0, 0, 0, 0.55), 0 6px 14px rgba(0, 0, 0, 0.35)` |
| `--pg-shadow-shell` | `inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -3px 0 rgba(0, 0, 0, 0.32)` |
| `--pg-shadow-screen` | `inset 0 2px 7px rgba(0, 0, 0, 0.34), inset 0 0 0 1px rgba(0, 0, 0, 0.36)` |
| `--pg-shadow-key` | `inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 0 rgba(0, 0, 0, 0.48)` |
| `--pg-shadow-wheel` | `inset 0 0 0 1px rgba(0, 0, 0, 0.35)` |
| `--pg-glow-led` | `0 0 6px rgba(127, 174, 78, 0.7)` |

### 字号
| 值 | px | 用途 |
|---|---|---|
| `2.25rem` | 36 | 消息编号（`.pg-msg-no`，桌面；Handjet 字面高度 ≈ 0.67em） |
| `1.875rem` | 30 | 窄屏消息编号 |
| `1.75rem` | 28 | 合计数字（`.pg-total-num`） |
| `1.5rem` | 24 | 姓名 `h1`（桌面） |
| `1.25rem` | 20 | 窄屏姓名 |
| `1.125rem` | 18 | MSG 计数（`.pg-digit`）、日期（`.pg-period`） |
| `0.9375rem` | 15 | 正文（`.pg-body` / `.pg` / `.pg-screen` 基准）、headline |
| `0.875rem` | 14 | 注释（`.pg-note`） |
| `0.75rem` | 12 | 消息标题、URL、项目 meta、标签行、屏显收尾 |
| `0.6875rem` | 11 | 地点行、合计标签、示例声明 |
| `0.625rem` | 10 | 状态栏、机壳品牌行 |

### 字距
| 值 | 用途 |
|---|---|
| `0.02em` | 姓名、Handjet 数字（编号 / 合计 / 计数） |
| `0.08em` | 地点行、URL、meta、标签行、示例声明、日期 |
| `0.14em` | 消息标题、状态栏、屏显小标签（`.pg-k`）、合计标签 |
| `0.2em` | 屏显收尾行 |
| `0.26em` | 机壳品牌行 |

### 行高
| 值 | 用途 |
|---|---|
| `1.7` | 正文 / 注释 / 屏幕基准（像素字可读性优先） |
| `1.25` | 姓名 `h1` |
| `1.4` | 标签 / 状态栏 / 标题 / meta / 收尾 |
| `1` | Handjet 大数字（编号、合计） |

### 动效参数
| 参数 | 值 |
|---|---|
| 开机 | `pg-boot 380ms steps(1, end)`；关键帧 `0% .94 → 34% .45 → 68% 0` |
| 行载入 | `pg-load 180ms steps(1, end)`；关键帧 `0% 0 → 42% .45 → 86% 1` |
| 步进 | `70ms` / 行，上限 8 步（`--d`） |
| 首屏时刻 | 140 / 210 / 280 / 350 / 420ms |

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **取数**：`loadDesignView('pager', Astro.url.pathname)`（`src/lib/site.ts`）；语言由路径统一解析，页面不自行判断。
- **扩展区块取舍**：`projects`（项目）、`experience`（经历）、`skills`（技能）、`contact`（联系 + 合计）
  全部渲染；`location` 进屏头；合计 = `links.length`（与状态栏 `MSG` 同源，真实数据）。
- `<HeadMeta {...view.head} />` 原样引入；`<html lang>` 用 `view.head.lang`；
  页面操作、主题切换与语言切换由**全站共享操作菜单**承担（无条件接入 `<ContextMenu config={view.contextMenu} />`），
  本页不保留任何可见切换入口。
- 字体：`--font-silkscreen` / `--font-handjet` / `--font-ark-pixel`（astro.config 的 fonts 注册 →
  页面 `<Font>`（不 preload）→ 本文件 `@theme inline`）；CSS 入口
  `@import "tailwindcss" source(none); @source "./";`；类前缀 `pg-`。
- **无图片、无外部请求、无 emoji**；装饰性器具（机壳、开缝、键帽、滚轮、状态栏、编号）一律 `aria-hidden`。
- 对比度与动效的实测口径维护在 `docs/verification/pager.md`（由编排方统一生成并更新）。
