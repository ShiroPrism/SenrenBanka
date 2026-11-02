---
name: Radio — The Shortwave Receiver
description: 一台 1970s 短波收信机的正面板：刻度盘上的呼号、琥珀段码读数、刻线分区的模块与上电时扫过的一根指针。
colors:
  back: "#171a17"
  panel: "#232724"
  panel-deep: "#1b1f1b"
  cream: "#e9e3d2"
  dim: "#a9ad98"
  amber: "#e0a13f"
  needle: "#c14b32"
  line: "#3c413a"
  groove: "#0e110e"
  highlight: "rgba(233, 227, 210, 0.14)"
  shade: "rgba(0, 0, 0, 0.55)"
  glow: "rgba(224, 161, 63, 0.45)"
typography:
  name:
    fontFamily: "'Share Tech Mono', 'Ark Pixel 12px', 'PingFang SC', 'Microsoft YaHei', monospace"
    fontSize: "clamp(1.75rem, 6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "同 name"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  title:
    fontFamily: "同 name"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.14em"
  note:
    fontFamily: "同 name"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
  meta:
    fontFamily: "同 name"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.08em"
  label:
    fontFamily: "同 name"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.14em"
  plate:
    fontFamily: "'Format 1452', 'Share Tech Mono', 'Ark Pixel 12px', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.24em"
  micro:
    fontFamily: "'DSEG14 Classic', 'Share Tech Mono', monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.08em"
  digits:
    fontFamily: "同 micro"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.08em"
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontFamily: "同 name"
    fontSize: "0.52rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-body-lg:
    fontFamily: "同 name"
    fontSize: "0.56rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-label:
    fontFamily: "同 name"
    fontSize: "0.4rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  preview-display:
    fontFamily: "同 name"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.1
  preview-micro:
    fontFamily: "同 micro"
    fontSize: "0.38rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
  preview-label-sm:
    fontFamily: "同 name"
    fontSize: "0.44rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  screw: "50%（螺钉头与灯罩是物理圆形）"
  panel: "0"
  module: "0"
  tag: "0"
  glass: "0"
spacing:
  panel: "min(56rem, 100%)"
  module-gap: "clamp(0.65rem, 1.8vw, 1rem)"
  stagger: "60ms（模块上台）"
  sweep: "700ms（指针扫动）"
components:
  link:
    textColor: "{colors.cream}"
    typography: "{typography.body}"
  link-hover:
    textColor: "{colors.amber}"
  dim:
    textColor: "{colors.dim}"
  module:
    backgroundColor: "{colors.panel}"
    borderColor: "{colors.line}"
  glass:
    backgroundColor: "{colors.panel-deep}"
  readout-label:
    textColor: "{colors.amber}"
    typography: "{typography.plate}"
  digits:
    textColor: "{colors.amber}"
    typography: "{typography.micro}"
  tag:
    textColor: "{colors.dim}"
    borderColor: "{colors.line}"
---

# Design System: Radio — The Shortwave Receiver

## Overview

**Creative North Star: "The Shortwave Receiver（短波收信机）"**

整页是一台 1970s 短波收信机的正面板：四角螺钉把一块机面板拧在桌上，顶部是压印的品牌条与三枚指示灯，
下面是一扇内凹的刻度盘玻璃——**表盘上的当前读数就是你的名字**（h1 是呼号，headline 是这条频道的节目单）。
盘下是一排模块：备注、频道、节目、日志、技能、联络（ja 交信），每块都是一枚独立的面板色块，
靠刻线、编号牌与内阴影分层，不靠圆角卡片。

素材只有三样：**面板、丝印、琥珀光**。深度靠凹槽（内阴影）与 1px 高光，不靠投影；
圆角只出现在螺钉头与灯罩这类物理圆形上。红色不是"强调色"，它是仪表的**过载**：
只出现在指针端、警示灯镜片与 VU 表红区。

**Key Characteristics:**
- 一块面板、一扇玻璃、一排模块；直角世界，零圆角卡片、零柔和外投影。
- 数字是机器的第一声部：编号、刻度、合计全部走 14 段段码（DSEG14）。
- 琥珀是唯一暖色；红只表示过载；其余全是同一块灰绿面板的明度档。
- 动效只有一次：**上电**。指针扫到刻度，指示灯两段点亮，然后机器安静下来。
- 滚动显现是机械推进：模块按 60ms 顺序上台，不做位移彩蛋。

## Colors

一块机身、一块面板、一扇玻璃，加三种"光"。

### Primary
- **Cream（丝印白）**: 正文、标题、链接的基准色——面板丝印油墨的米白，不是纯白。
- **Amber（琥珀）**: 刻度、指针、读数、编号、焦点环。机器唯一的暖色，也是"通电"的证据。
- **Needle Red（指针红）**: 只用于指针端、警示灯镜片与 VU 表红区。**不承载文本**（对比度 3.11:1 < 4.5:1，见下表）。

### Neutral
- **Back（机身外）**: 场景底色；顶部受光的弱径向渐变让面板浮在机身上。
- **Panel（面板）**: 模块与整机的面板色，所有色块的基准。
- **Panel-Deep（凹槽）**: 刻度盘玻璃、螺钉内侧、最深的内阴影档。
- **Dim（刻线灰字）**: 次级信息（URL、序号、描述、铭牌）——两档底色上均 ≥6.5:1。
- **Line（刻线）**: 1px 分区线与刻度线，**非文本**。
- **Groove（最深槽）**: 只在 1px 内阴影与螺钉内圈出现，制造"缝"。
- **Highlight / Shade / Glow**: 三档"光"——顶部 1px 高光、玻璃内阴影、灯与指针的琥珀辉光。

### Contrast（实测，WCAG 2.1 相对亮度）

| 前景 | 背景 | 比值 | 用途 | 结论 |
|---|---|---|---|---|
| cream `#e9e3d2` | panel `#232724` | **11.81:1** | 正文 / 标题 / 链接 | AA+ |
| cream `#e9e3d2` | panel-deep `#1b1f1b` | **13.02:1** | 呼号 h1（玻璃上） | AA+ |
| dim `#a9ad98` | panel `#232724` | **6.57:1** | 描述 / 铭牌 / 刻线灰字 | AA |
| dim `#a9ad98` | panel-deep `#1b1f1b` | **7.25:1** | headline（玻璃上） | AA |
| amber `#e0a13f` | panel `#232724` | **6.73:1** | 编号 / 焦点环 / hover | AA |
| amber `#e0a13f` | panel-deep `#1b1f1b` | **7.42:1** | 刻度数字 / 读数标签 | AA |
| back `#171a17` | amber `#e0a13f` | **7.81:1** | 文本选区（反白） | AA |
| needle `#c14b32` | panel `#232724` | 3.11:1 | 指针端 / 警示灯 / VU 红区 | **仅装饰**，不做文本 |

### Named Rules
**The One Warm Color Rule.** 琥珀只属于"电"：刻度、读数、编号、指针、焦点、hover。别再引入第二个暖色。
**The Overload Red Rule.** 红只表示过载（指针端、警示灯、VU 红区），永不承载文本、永不作强调色。
**The Engraved Ink Rule.** 层级先由明度档决定（cream / dim / line），再考虑字号与字距；
`line` 档不得用于文本。

## Typography

**Label / Body Font:** Share Tech Mono（工程等宽，单字重；回退 Consolas / Courier New）
**Plate Font:** Format 1452（压缩几何无衬线，只用于大写短铭牌）
**Digits Font:** DSEG14 Classic（14 段段码：编号、刻度、合计）
**CJK Font:** Ark Pixel 12px（12px 网格像素黑体，作为中文 / 假名声部）

**Character:** 面板丝印是"小而硬"的大写压缩字母，读数窗是段码，中文落在 12px 网格的方点阵里。
三者共用一条骨架（方、直、等宽），但**分工严格**：数字归 DSEG14、大写铭牌归 Format 1452、
标签与正文归 Share Tech Mono、汉字归 Ark Pixel——正文不做满屏等宽堆砌。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**：1970s 短波收信机正面板 → 需要"工程等宽"的标签声部、压缩大写丝印声部、
   段码读数声部，以及一个能与拉丁共处的中文点阵声部；正文要有呼吸，不做全页等宽密排。
2. **角色分配**：标签 / 正文 = Share Tech Mono；大写短铭牌（品牌行、呼号标签、合计标签、波段）= Format 1452；
   数字与编号 = DSEG14 Classic；中文 / 假名 = Ark Pixel 12px。
3. **为什么是它而非其他**：DSEG14 而非 DSEG7——14 段是仪表读数的字形，7 段（DSEG7）已归小票机（receipt），
   两套拟物主题的数字声部因此不会互相串味。Format 1452 是压缩几何无衬线，比 Arial Narrow 更接近
   70s 面板丝印的硬边大写，且只有 12.9KB。Share Tech Mono 是三者中骨架最"工程"的单字重等宽
   （Silkscreen 的像素味留给别的主题；League Mono 更偏现代 UI）。中文候选 Zpix 因官方仓库无许可文件
   被排除，改用许可核验通过的 Ark Pixel。
4. **实际覆盖（用项目自带 fontkitten 读 woff2 cmap 实测，2026-10-17）**：
   - Share Tech Mono：217 字形，ASCII **95/95**，假名 0/96，无 CJK；`·` 有。
   - Format 1452：656 字形，ASCII **95/95**，假名 0/96，无 CJK。
   - DSEG14 Classic：94 字形，ASCII 89/95（缺 `·` 等少量标点），数字 **10/10**。
   - Ark Pixel 12px：由外部 catalog v1.0.0 提供完整 `core-cjk` cmap（55 个
     `unicode-range` 分片，家族包 1,371,013 B），不再使用旧站内 1,992 字子集。
   回退：中文 → Ark Pixel → PingFang SC / Microsoft YaHei（日文另有 Hiragino / Yu Gothic）；
   拉丁 → Consolas / Courier New（铭牌 → Arial Narrow / Helvetica）。
5. **字重 / 轴 / 体积 / 许可**：四者均为单字重 400 静态字体（无可变轴）。体积（woff2）：
   Share Tech Mono 13.5KB、Format 1452 12.9KB、DSEG14 Classic 5.8KB；Ark Pixel
   家族包 1,371,013 B / 55 分片。
   许可：四者均 **OFL-1.1**；Share Tech Mono 与 DSEG 带 Reserved Font Name（'Share' / 'DSEG'），
   本项目原样格式分发、未改名未修改。
6. **缺失回退顺序**：
   - 数字 `--font-dseg14 → Share Tech Mono → Ark Pixel → Consolas / monospace`
   - 标签与正文 `--font-share-tech-mono → Ark Pixel → PingFang SC / Microsoft YaHei → monospace`
   - 铭牌 `--font-format-1452 → Share Tech Mono → Ark Pixel → Arial Narrow → sans-serif`
   - 中文与假名各行统一先落 Ark Pixel，再落系统中文字体；断网 / 无 JS 时版式仍成立。

### Hierarchy
- **Name**（400, `clamp(1.75rem, 6vw, 2.5rem)`, 1.2, 0.02em）：呼号（h1），刻度盘读数窗里唯一的"大字"。
- **Title**（400, 1.0625rem, 1.6, 0.14em）：六枚模块 h2——丝印标签牌，字距把它拉成"刻上去的"。
- **Body**（400, 0.9375rem, 1.75）：headline、简介、链接标签。
- **Note**（400, 0.8125rem, 1.75）：节目 / 日志描述。
- **Meta**（400, 0.75rem, 1.6, 0.08em）：URL、序号、合计单位。
- **Label**（400, 0.6875rem, 1.6, 0.14em）：蚀刻标签、页脚铭牌。
- **Plate**（Format 1452, 0.6875rem, 0.24em）：品牌行、呼号标签、合计标签。
- **Digits**（DSEG14）：合计 1.75rem；模块编号 / 序号 0.75rem；刻度数字 0.625rem。

### Named Rules
**The No-Bold Rule.** 不用字重与斜体分层——明度档 + 字号 + 字距就是全部手段（`strong` / `em` 需先改本规范）。
**The Digits-Only-DSEG Rule.** DSEG14 只排数字与编号，不排单词；14 段字形排字母会立刻变成"仪表故障"。

## 令牌登记（Token Register）

`style.css` 里出现的**每一个色值、字号、字距**都在下表中；新增值必须先在此登记。

**颜色（9 个 hex + 3 个 rgba）**

| 令牌 | 值 | 用在哪 |
|---|---|---|
| `--rd-back` | `#171a17` | 机身底色、选区文字色 |
| `--rd-panel` | `#232724` | 面板与模块底色、机身径向渐变起点 |
| `--rd-panel-deep` | `#1b1f1b` | 刻度盘玻璃、螺钉深端、灯罩深端 |
| `--rd-cream` | `#e9e3d2` | 正文 / 标题 / 链接 |
| `--rd-dim` | `#a9ad98` | 次级文本、未通电灯芯的基色 |
| `--rd-amber` | `#e0a13f` | 刻度、读数、编号、指针、焦点、选区底色、VU 条 |
| `--rd-needle` | `#c14b32` | 指针端、警示灯镜片、VU 红区 |
| `--rd-line` | `#3c413a` | 1px 分区线 / 刻线 / 点线 / 标签框 / 链接下划线 |
| `--rd-groove` | `#0e110e` | 1px 内阴影槽、螺钉内圈 |
| `--rd-highlight` | `rgba(233, 227, 210, 0.14)` | 顶部 1px 高光、灯罩内高光 |
| `--rd-shade` | `rgba(0, 0, 0, 0.55)` | 玻璃内阴影（凹槽） |
| `--rd-glow` | `rgba(224, 161, 63, 0.45)` | 指示灯与指针的琥珀辉光 |

**字号（8 档）**

| 值 | 用在哪 |
|---|---|
| `0.625rem` | 刻度数字（DSEG14 micro） |
| `0.6875rem` | 品牌行、呼号标签、合计标签、元信息键、蚀刻标签、页脚铭牌、可选站点声明 |
| `0.75rem` | 模块编号、频道序号、URL、波段行、合计单位、盘下读数条 |
| `0.8125rem` | 节目 / 日志 / 联络描述 |
| `0.9375rem` | 根字号（正文、headline、简介） |
| `1.0625rem` | 模块 h2 |
| `1.75rem` | 合计数字（DSEG14）、VU 表高 |
| `clamp(1.75rem, 6vw, 2.5rem)` | 呼号 h1 |

**字距（5 档）**

| 值 | 用在哪 |
|---|---|
| `0.02em` | 呼号 h1（大字只需极轻的正字距） |
| `0.08em` | 全部段码数字、URL、序号 |
| `0.14em` | 模块 h2、蚀刻标签、波段 / 示例铭牌、合计单位 |
| `0.24em` | 品牌行、呼号标签、合计标签、元信息键（丝印大写字距） |
| `0.34em` | 呼号标签（读数窗内唯一的大字距） |

**行高（4 档）**：`1`（合计数字）、`1.2`（呼号）、`1.6`（标签 / 铭牌 / 元信息）、`1.75`（正文 / 描述）。

**其它固定值**：圆角仅 `50%`（螺钉头、灯罩）；装饰性不透明度 `0.08 / 0.24 / 0.72 / 0.9`；
VU 条高度比例 `0.26–0.92`；指针停位 `62%`（起点 `-62%`，即刻度左端）。

## Layout

- 面板：`width: min(56rem, 100%)`，机身内边距 `clamp(0.9rem, 3vw, 2.25rem) …`；四角螺钉内缩 7px。
- 面板头：品牌行（Format 1452 大写）+ 三枚指示灯，右对齐；底部 1px 刻线。
- 刻度盘：内凹玻璃块，内含呼号读数（标签 + h1 + headline）与刻度尺；刻度尺 61 格、每 10 格标数字（6–12），
  两端标签改为贴边对齐（`is-first` / `is-last`），避免被玻璃裁切。
- 盘下读数条：`CH 03`（= links 条数，真实数据）+ `QTH …`（location，可选），1px 刻线分隔。
- 模块栅格：`repeat(2, minmax(0, 1fr))`、间距 `clamp(0.65rem, 1.8vw, 1rem)`；≤720px 单列。
- 模块内部：编号（DSEG14，琥珀）+ h2 标签牌 + 1px 刻线 + 内容；两枚 6px 小螺钉在右上 / 左下。
- 页脚：左侧 VU 表（装饰），右侧波段铭牌 + 可选站点声明；1px 刻线切分，`≤560px` 时左对齐。
- 移动：单列堆叠；URL 列在 `≤560px` 隐藏（行只留序号与标签）；正文不因窄屏改字号（clamp 已覆盖）。

## Elevation & Depth

**没有投影层级，只有凹槽。** 深度实现只有四种手段：
1. **1px 高光**（`--rd-highlight`）画在面板 / 模块上缘——受光的刀刃边；
2. **1px 深槽**（`--rd-groove`）画在下缘与螺钉内圈——缝；
3. **内阴影**（`--rd-shade`，仅刻度盘玻璃）——玻璃凹进面板；
4. **1px 刻线**（`--rd-line`）——分区。

品牌行额外用一道 `text-shadow: 0 1px 0 var(--rd-groove)` 做**压印**（丝印敲进面板的深槽），
它不是投影：位移 1px、无模糊、颜色是槽色而不是黑。
面板与模块**不得**出现外投影、模糊投影或"悬浮卡片"感；机身外唯一的柔和渐变是页面本身的环境光。

## Shapes

- 面板、模块、玻璃、标签、按钮：**直角**（`border-radius: 0`）。
- 螺钉头与灯罩：`border-radius: 50%` + 径向高光——物理圆形，不是 UI 圆角。
- 指针：1px 琥珀竖线 + 6×6px 红色端块（直角），与主刻度等高（1.1rem）。
- 刻度：5px 次刻度 / 1.1rem 主刻度，全部 1px 宽；刻度数字紧贴主刻度下方。
- 行内引导线：1px 点线（`dotted`），不是卡片边框。
- 蚀刻标签（tags）：1px 刻线方框 + 无底色 + 无圆角。

## Components

### Panel（面板）
- **结构**：`main.rd-panel`，四角螺钉为独立 `aria-hidden` 元素；`aria-label` = 品牌 + 本语言的机型名。
- **材质**：面板色 + 上缘 1px 高光 + 下缘 1px 深槽 + 1px 刻线边框，无外投影。

### Dial（刻度盘）
- **读数窗**：琥珀 `CALL SIGN / 呼号 / コールサイン` 标签 → h1 呼号 → headline。
- **刻度尺**：61 格、7 个数字，`aria-hidden`——量程是机面装饰，**不是**个人数据。
- **指针**：固定在 62% 刻度；上电时从左端扫到该点（一次性）。指针端 6px 红块是唯一红色文本外用途之一。
- **Semantics**：h1 只有一个，就在读数窗里；刻度、指针、螺钉、灯全部 `aria-hidden`。

### Modules（六枚模块）
- **编号**：`01`–`06` 是**机面铭牌编号**（固定顺序：备注 / 频道 / 节目 / 日志 / 技能 / 联络），
  不随区块是否存在而重排；编号 `aria-hidden`。
- **频道**：序号（段码）+ 链接 + 点线引导 + URL（去协议，`aria-hidden`，`≤560px` 隐藏）。
- **节目**：标题（有 url 即链接）+ 描述 + 蚀刻标签行。
- **日志**：段码时段 + 机构 + 角色（dim）+ 描述。
- **技能**：蚀刻标签栅格（与节目标签同一形制）。
- **联络**：合计 = `links.length`（**真实数据**，段码大字）+ 单位；邮件链接或"未配置"文案；备注。
- **Semantics**：六个分区各有一枚可见 `<h2>`；`aria-labelledby` 指向它；页脚用波段铭牌作可访问名。

### Lamps & VU（指示灯 / VU 表）
- 三枚 9px 灯：一枚琥珀亮（POWER）、一枚暗红镜片（WARN）、一枚未通电。全部 `aria-hidden`。
- VU 表：12 根竖条（4px），末两根为红区；高度比例写在 CSS `nth-child` 里，是装饰读数。
- 两者都不传达状态语义——机器"看起来在工作"即可，不宣称任何真实状态。

### Links
- **Style:** 米白文字 + `line` 色 1px 下划线（offset 3px），无边框无底色。
- **Hover:** 仅 `(hover: hover) and (pointer: fine)` 下转为琥珀（颜色 + 下划线，无位移）。
- **Touch:** `pointer: coarse` 时纵向 padding 0.55rem（命中区 ≈44px）。
- **Focus:** 2px 琥珀 outline、offset 3px——**不是红色**。

### Motion（动效）
- 动效语言 = **上电（Power-on）**：机器接通的唯一一次动作，其余时间静止。
- **指针扫动**：`translateX(-62%) → translateX(62%)`，700ms，`cubic-bezier(0.2, 0.72, 0.24, 1)`，只播一次。
- **指示灯两段点亮**：琥珀灯芯在 `opacity 0.08 → 0.5 → 1` 之间以 `steps(1, end)` 跳变，180ms 起、300ms 内完成——
  两次"咔哒"，不是呼吸。
- **持续动效：无。** 论证：收信机的表盘在锁定后就是静止的读数；闪烁 = 故障，不是设计。
- **滚动显现**：共享 `IntersectionObserver`（页头放一次 `<Reveal />`），模块按 60ms 依次上台（220ms linear，
  `opacity` + `translateY(8px)`）。隐藏态以 `html[data-reveal-ready]` 为唯一门控（契约见 `docs/rules/visual-language.md`）。
- `prefers-reduced-motion: reduce`：不生成任何动画，指针停在 62%、灯保持点亮，内容原样可见。

## Do's and Don'ts

### Do:
- **Do** 用凹槽表达深度：内阴影、1px 高光、1px 刻线——这三样就够。
- **Do** 让数字归 DSEG14、铭牌归 Format 1452、标签正文归 Share Tech Mono、汉字归 Ark Pixel。
- **Do** 用 `dim` 档承担全部次级信息；两档底色上都在 6.5:1 以上。
- **Do** 把中文原文直接放进 12px 像素网格，不翻译内容。
- **Do** 保持"一块面板"的整体感：模块是同色的独立色块，不是卡片。
- **Do** 装饰一律 `aria-hidden`；分区语义由可见 h2 承担，页脚由波段铭牌承担。

### Don't:
- **Don't** 引入圆角卡片、柔和投影、玻璃拟态或渐变按钮——这是直角工业面板。
- **Don't** 让红参与文本、焦点或强调；它只表示过载。
- **Don't** 用 DSEG14 排单词（14 段排字母会读成故障码）。
- **Don't** 做扫描线、CRT 辉光、glitch 或任何持续闪烁/呼吸——那是别的主题的语言。
- **Don't** 把刻度数字接上真实数据：量程是机面印刷，不是统计。
- **Don't** 引入图片、外部请求或 emoji 图标；全部标记由字符、CSS 几何与段码构成。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`；`location` 进盘下读数条（QTH）。
- **取数**：`loadDesignView('radio', Astro.url.pathname)`（`src/lib/site.ts`）——语言由路径统一解析，
  页面不接触文件路径、不自行判断语言。
- **扩展区块取舍**：四个区块全部渲染——`projects`（节目）、`experience`（日志）、`skills`（技能）、
  `contact`（联络 + 合计）；合计 = `links.length`（真实数据）。
- `<HeadMeta {...view.head} />` 原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担
  （无条件接入 `<ContextMenu config={view.contextMenu} />`）——本页不保留任何可见切换入口。
  菜单的 lucide 图标属项目级 chrome，不受本规范「Don't 引入图标」约束。
- 字体：`--font-share-tech-mono` / `--font-format-1452` / `--font-dseg14` / `--font-ark-pixel`
  （`astro.config.mjs` 注册 → 页面 `<Font>`（不 preload）→ `@theme inline`）；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- 类前缀：`rd-`（Radio Dial）；BEM 修饰位一律用 `is-*`（避免 `--` 在正文里被读成破折号）。
- 文案：全部界面文案来自本设计 `messages.ts`（三语言）；`SENRENBANKA`、`BAND: 41m · SW`、`CH` 与段码数字
  为不翻译项，理由写在 `messages.ts` 文件头。
