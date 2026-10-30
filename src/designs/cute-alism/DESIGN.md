---
name: Cute-alism — The Hard-Candy Collage Wall
description: 一整面硬糖色切纸拼贴：不对称巨幅姓名、粗黑 keyline、无模糊偏移阴影、标签链接轨、项目拼贴网格、阶梯经历带、贴纸技能与糖果包装背板。
colors:
  ink: "#111111"
  paper: "#fff8e8"
  paper-bright: "#fffdf5"
  red: "#ff5a5f"
  yellow: "#ffe14d"
  mint: "#59e3b2"
  sky: "#67c8ff"
  pink: "#ff92cf"
typography:
  display:
    fontFamily: "'Fredoka Variable', 'LXGW WenKai GB', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(3rem, 10.7vw, 7.4rem)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.045em"
  section:
    fontFamily: "'Fredoka Variable', 'LXGW WenKai GB', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  item:
    fontFamily: "'Fredoka Variable', 'LXGW WenKai GB', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Inter Variable', 'LXGW WenKai GB', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.65
    letterSpacing: "normal"
  lede:
    fontFamily: "'Fredoka Variable', 'LXGW WenKai GB', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(1.05rem, 1.7vw, 1.3rem)"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  micro:
    fontFamily: "'League Mono', 'Inter Variable', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.08em"
  location:
    fontFamily: "同 display"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1.45
  section-index:
    fontFamily: "'League Mono', 'Inter Variable', sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.04em"
  section-count:
    fontFamily: "同 display"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1
  link-label:
    fontFamily: "同 display"
    fontSize: "clamp(1.15rem, 2.2vw, 1.55rem)"
    fontWeight: 600
    lineHeight: 1.15
  step-index:
    fontFamily: "同 display"
    fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)"
    fontWeight: 700
    lineHeight: 1
  org:
    fontFamily: "同 display"
    fontSize: "clamp(1.25rem, 2.4vw, 1.7rem)"
    fontWeight: 700
    lineHeight: 1.08
  role:
    fontFamily: "同 body"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.45
  badge:
    fontFamily: "同 display"
    fontSize: "clamp(1rem, 1.9vw, 1.25rem)"
    fontWeight: 600
    lineHeight: 1.2
  email:
    fontFamily: "同 body"
    fontSize: "clamp(1rem, 1.8vw, 1.15rem)"
    fontWeight: 700
    lineHeight: 1.45
  footer:
    fontFamily: "同 display"
    fontSize: "clamp(1rem, 2vw, 1.3rem)"
    fontWeight: 600
    lineHeight: 1.25
  name-tablet:
    fontFamily: "同 display"
    fontSize: "clamp(3rem, 9.5vw, 6.4rem)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.045em"
  name-mobile:
    fontFamily: "同 display"
    fontSize: "clamp(3.2rem, 15vw, 5.4rem)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.045em"
  name-narrow:
    fontFamily: "同 display"
    fontSize: "clamp(3.15rem, 16vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.045em"
  section-mobile:
    fontFamily: "同 display"
    fontSize: "clamp(2.15rem, 8vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  preview-frame:
    fontFamily: "同 body"
    fontSize: "0.55rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-name:
    fontFamily: "同 display"
    fontSize: "clamp(1.6rem, 6vw, 2.7rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.035em"
  preview-body:
    fontFamily: "同 body"
    fontSize: "0.54rem"
    fontWeight: 700
    lineHeight: 1.35
  preview-micro:
    fontFamily: "同 micro"
    fontSize: "0.42rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.05em"
rounded:
  cut: "1.15rem 0 1.15rem 0"
  cut-mirror: "0 1.15rem 0 1.15rem"
  preview-card: "0.65rem 0 0.65rem 0"
  pill: "999px"
  circle: "50%（只用于圆形几何贴纸 / 编号章）"
spacing:
  world-width: "min(calc(100% - clamp(1.5rem, 5vw, 4.5rem)), 78rem)"
  section-space: "clamp(3.5rem, 8vw, 7rem)"
  gap: "clamp(1rem, 2.4vw, 1.75rem)"
components:
  link-strip:
    textColor: "{colors.ink}"
    backgroundColor: "{colors.red}"
    borderColor: "{colors.ink}"
    boxShadow: "7px 7px 0 {colors.ink}"
  link-strip-alt:
    backgroundColor: "{colors.sky}"
  link-strip-third:
    backgroundColor: "{colors.yellow}"
  focus:
    outlineColor: "{colors.ink}"
    backgroundColor: "{colors.yellow}"
  bio:
    backgroundColor: "{colors.mint}"
    borderColor: "{colors.ink}"
    boxShadow: "11px 11px 0 {colors.ink}"
  project:
    backgroundColor: "{colors.red}"
    borderColor: "{colors.ink}"
    boxShadow: "10px 10px 0 {colors.ink}"
  contact:
    backgroundColor: "{colors.paper-bright}"
    borderColor: "{colors.ink}"
    boxShadow: "10px 10px 0 {colors.ink}"
---

# Design System: Cute-alism — The Hard-Candy Collage Wall

## Overview

**Creative North Star: “Cut, paste, shout.”**

Cute-alism 是一整面正在被排版、被贴满的硬糖拼贴墙，而不是一张放进页边距里的海报。
暖纸底只用一种颜色；糖果红、柠檬黄、薄荷绿、天蓝与亮粉像切好的彩纸，被粗黑 keyline
收边，再用固定方向的零模糊阴影顶离墙面。所有区块沿同一套 12 栏拼贴坐标排布，但允许
宽度、错位、阶梯和旋转制造张力。

首屏用一个近乎填满栏宽的姓名色块承担主视觉：它是“最大的那张纸”，不是报头；
headline 是斜贴上去的胶囊标签；头像是一张带硬阴影的证物卡。往下，简介是大块薄荷切角板，
链接是三段错位标签轨，项目是 7 / 5 / 12 的拼贴网格，经历是逐级向右的色带，
技能是一把可歪斜的贴纸，联系则是糖果包装背板 + 条码。

### Key Characteristics

- **One wall, not cards on a wall**：区块之间由相同的 keyline、硬偏移、切角与色彩语法连接；
  没有玻璃面板、纸纹、渐变或柔和投影。
- **Display as material**：姓名与分区标题用圆胖但有骨架的 Fredoka；中文自然落到 LXGW WenKai。
- **Candy flat + black edge**：五种高亮色都配墨色文字；不使用浅色正文，不依赖颜色单独传意。
- **Asymmetric but readable**：桌面视觉错位，DOM 始终按 name → bio → links → projects →
  experience → skills → contact 顺序阅读。
- **Micro-label tension**：League Mono 只做编号、单位与短标签，不承载正文。

### Non-goals / Anti-Poster audit

Cute-alism 与同站 `poster` 刻意不共享以下任一特征：

| Poster 特征 | Cute-alism 的反向约束 |
|---|---|
| 一张居中的纸、四周看片灯留白 | 无纸张外框；版面是贯穿全页的拼贴墙 |
| League Gothic 窄体 + Blackout 镂空字 | Fredoka + LXGW WenKai；完全不用这两款 Poster 字体 |
| 两色油墨、粗规线、套准 / 裁切标记 | 五色糖果纸、硬偏移、切角 / 胶囊、贴纸与包装背板 |
| 单屏海报式 12 栏排印 | 纵向多章节拼贴，项目 / 经历 / 技能各自有不同几何行为 |
| 半调点阵、纸影、油墨辊动效 | 无纹理渐变、无柔和阴影；几何 snap 与错位显现 |
| 安静、档案化的印刷署名 | 高饱和、贴纸化、标签条与包装条码的流行图形语气 |

## Colors

### Tokens

| Token | Value | Role |
|---|---|---|
| `--cal-ink` | `#111111` | 全部 keyline、文字、硬阴影、编号章 |
| `--cal-paper` | `#fff8e8` | 页面底色 / 深色文字的高对比承载面 |
| `--cal-paper-bright` | `#fffdf5` | 头像卡、标签内片、包装背板 |
| `--cal-red` | `#ff5a5f` | 主拼贴、姓名背片、项目 1 |
| `--cal-yellow` | `#ffe14d` | 姓名块、地点、项目 3、焦点底 |
| `--cal-mint` | `#59e3b2` | 简介板、技能贴纸、注释卡 |
| `--cal-sky` | `#67c8ff` | headline、链接 2、项目 2 |
| `--cal-pink` | `#ff92cf` | 头像窗、项目 4、技能贴纸 |

### Measured contrast

屏幕文字只用墨色或纸色，配对如下（WCAG 相对亮度计算）：

| Text / surface | Ratio |
|---|---:|
| Ink / paper `#111111` on `#fff8e8` | **17.84:1** |
| Ink / paper-bright `#111111` on `#fffdf5` | **18.54:1** |
| Ink / red `#111111` on `#ff5a5f` | **6.19:1** |
| Ink / yellow `#111111` on `#ffe14d` | **14.50:1** |
| Ink / mint `#111111` on `#59e3b2` | **11.74:1** |
| Ink / sky `#111111` on `#67c8ff` | **10.15:1** |
| Ink / pink `#111111` on `#ff92cf` | **9.23:1** |
| Paper / ink `#fff8e8` on `#111111` | **17.84:1** |

**The Ink-Always Wins Rule.** 彩色表面不承载纸色正文；除黑色页脚外，全部文字为墨色。
焦点同时使用 4px 墨色 outline 与黄色底，不依赖色相差异。

## Typography

### Roles

- **Display / section / item title:** Fredoka Variable，中文回退 LXGW WenKai GB。
- **Body / description:** Inter Variable，中文回退 LXGW WenKai GB。
- **Micro-label / count / URL / period:** League Mono，中文回退 Inter → LXGW。

### Ladder

| Role | Size | Weight / line height | Tracking |
|---|---|---|---|
| Name | `clamp(3rem, 10.7vw, 7.4rem)` | 700 / 0.86 | `-0.045em` |
| Section | `clamp(2.3rem, 5vw, 4rem)` | 700 / 0.95 | `-0.035em` |
| Project title | `clamp(1.4rem, 2.8vw, 2.1rem)` | 700 / 1.06 | `-0.03em` |
| Headline | `clamp(1.05rem, 1.7vw, 1.3rem)` | 700 / 1.45 | `-0.01em` |
| Bio lede | `clamp(1.08rem, 1.9vw, 1.42rem)` | 500 / 1.72 | `-0.012em` |
| Body | `1rem` | 500 / 1.65 | normal |
| Link label | `clamp(1.15rem, 2.2vw, 1.55rem)` | 600 / 1.15 | normal |
| Location | `0.9rem` | 700 / 1.45 | normal |
| Section index | `0.8rem` | 700 / 1 | `0.04em` |
| Section count | `1.3rem` | 700 / 1 | normal |
| Experience index | `clamp(1.3rem, 2.5vw, 1.9rem)` | 700 / 1 | normal |
| Experience org | `clamp(1.25rem, 2.4vw, 1.7rem)` | 700 / 1.08 | normal |
| Experience role | `0.95rem` | 700 / 1.45 | normal |
| Skill badge | `clamp(1rem, 1.9vw, 1.25rem)` | 600 / 1.2 | normal |
| Contact email | `clamp(1rem, 1.8vw, 1.15rem)` | 700 / 1.45 | normal |
| Footer mark | `clamp(1rem, 2vw, 1.3rem)` | 600 / 1.25 | normal |
| Micro | `0.75rem` | 700 / 1.35 | `0.05–0.08em` |
| Name at `<=64rem` | `clamp(3rem, 9.5vw, 6.4rem)` | 700 / 0.86 | `-0.045em` |
| Name at `<=48rem` | `clamp(3.2rem, 15vw, 5.4rem)` | 700 / 0.86 | `-0.045em` |
| Name at `<=30rem` | `clamp(3.15rem, 16vw, 4.6rem)` | 700 / 0.86 | `-0.045em` |
| Section at `<=48rem` | `clamp(2.15rem, 8vw, 3.25rem)` | 700 / 0.95 | `-0.035em` |
| Preview frame | `0.55rem` | 400 / 1.4 | normal |
| Preview name | `clamp(1.6rem, 6vw, 2.7rem)` | 700 / 0.88 | `-0.035em` |
| Preview body | `0.54rem` | 700 / 1.35 | normal |
| Preview micro | `0.42rem` | 700 / 1.25 | `0.05em` |

Preview 的 `0.54rem` / `0.42rem` 是切换页 16:10 缩略画幅的登记档位，不进入正式页阶梯。
正式页没有任何小于 `0.75rem` 的屏幕文字。

### Font selection record

1. **Metaphor and required voice:** 硬糖切纸拼贴需要“圆、厚、能当大图形”的拉丁展示声部，
   一个保留书写温度但长读稳定的中日文声部，一个不抢戏的阅读正文，以及短小的技术标签声部。
2. **Role assignment:** Fredoka → name / section / item / count；LXGW WenKai GB → CJK display 与
   body fallback；Inter → Latin body；League Mono → index / unit / URL / period。
3. **Why these faces:** Fredoka 的圆润骨架与粗黑 keyline、胶囊标签同属玩具包装语气；
   LXGW WenKai 让中文不是机械的几何无衬线，保留手贴纸的温度；Inter 保证长简介清晰；
   League Mono 的窄小标签与糖果包装批号相称。明确否决 League Gothic / Blackout：
   它们会把本主题拖回 Poster 的窄体 screenprint 语言。
4. **Actual coverage and fallback:** Fredoka 实测 ASCII 95/95、Latin-1 字母 62/62，
   GB2312 0/6763、假名 0/176；LXGW WenKai GB 实测 ASCII 95/95、Latin-1 62/62、
   GB2312 6763/6763、假名 176/176。Inter 与 League Mono 是既有 Latin 生产声部，
   本主题不声称其 CJK 覆盖；所有 CJK 字符落到 LXGW / 系统中日文字体。
5. **Weight, axis, size and license:** Fredoka 为 wght 300–700 可变字体，latin 29,784 B +
   latin-ext 4,576 B，OFL-1.1；LXGW WenKai GB Medium 为 500，由外部 catalog v1.0.0 提供
   完整 `core-cjk` cmap（328 个 `unicode-range` 分片，家族包 13,841,062 B），OFL-1.1；
   Inter / League Mono 复用既有生产资源。
6. **Missing-font order:** Display `Fredoka → LXGW → PingFang SC / Microsoft YaHei → Hiragino Sans /
   Yu Gothic UI → sans-serif`；Body `Inter → LXGW → PingFang SC / Microsoft YaHei → Hiragino Sans /
   Yu Gothic UI → sans-serif`；Micro `League Mono → Inter → LXGW → system CJK → sans-serif`。
   字体全部 `display: swap`，不 preload CJK。

## Layout

- **World:** `min(calc(100% - clamp(1.5rem, 5vw, 4.5rem)), 78rem)`，桌面左右始终有可见留白。
- **Hero:** 桌面 `1.6fr / 0.58fr`；姓名块占满左栏，headline 下压，头像与地点在右栏形成证物卡。
  无头像时 hero 自动变成单栏，页面不以头像成立。
- **Bio:** 宽 `min(64rem, 94%)`，靠左，为右侧留下墙面和圆形贴纸。
- **Links:** 宽 `min(70rem, 100%)` 靠右；三件一组按 94% / 88% + 10% 偏移 / 97% + 2% 偏移排列。
- **Projects:** 12 栏，`7 + 5` 首行（第 2 项下沉 2.5rem），第三项横向 12 栏；第四项及以后用 8 栏粉色块，
  继续以同一规则流式拼贴。
- **Experience:** 右对齐 70rem 色带阶梯；前四项依次下沉 0 / 2 / 4 / 5.5rem，每条只改变宽度而非遮挡内容。
- **Lower grid:** 技能约 1.18fr，联系约 0.82fr；联系板拉伸等高，但正文不裁切。
- **Footer:** 黑底纸字条，右侧是示例声明胶囊；红硬阴影把它从墙面抬起。
- **Responsive:** `<=64rem` 保留两栏结构并压缩错位；`<=48rem` hero、项目、lower 全部单列，
  链接与经历恢复满宽；`<=30rem` 缩小描边 / 阴影并隐藏可见 URL 辅助行。

## Elevation & Depth

深度只有一种：**零模糊的固定偏移阴影**。

- 小标签 / 徽章：`3px 3px 0` 至 `5px 5px 0` 墨色。
- 链接、地点、头像、项目、板块：`6px 6px 0` 至 `12px 12px 0` 墨色。
- 页脚是唯一反向强调：墨色块 + `8px 8px 0` 糖果红。
- 阴影从不带 blur / spread 柔化；不使用 `filter: blur`、`backdrop-filter`、玻璃透明度或渐变。
- 任何阴影都不覆盖正文：所有文字拿完整的 padding 与 line-height。

## Shapes

- **Cut corner:** `1.15rem 0 1.15rem 0` 作为主切角；镜像 `0 1.15rem 0 1.15rem` 用于错位区块。
- **Pill:** 链接、标签、count、badge 与 cue 的外轮廓。
- **Circle:** 只用作编号章、圆点、圆环、头像卡的小标记与预览贴纸，不混入随机圆角。
- **Keystone:** 6px 姓名描边、4–5px 区块描边、3–4px 标签描边；边界始终为实线墨色。
- **Decoration:** 背景中的 slab / dot / ring / triangle / stripe 全是纯色 CSS 几何，
  `aria-hidden="true"`、`pointer-events:none`；窄屏主动退场。

## Components and field mapping

### Identity / avatar / location

- `name` → 唯一 `h1`，放在黄色切角巨块中；背后有红色错位片。
- `headline` → 天蓝胶囊条。
- `avatar` → 存在时渲染为 4:5 证物卡；`alt` 使用主题 `portraitLabel` + `name`。
- `location` → 黄色坐标标签，带主题 `locationLabel`。

### Bio

- `bio` → 薄荷切角大板；h2 `bioTitle` 通过 `aria-labelledby` 命名分区。
- 右上 / 右下圆点只作墙面固定件，不进入无障碍树。

### Links

- `links[]` → 全宽自适应标签轨；每条显示真实 `label`，短 URL 仅作视觉辅助并 `aria-hidden`。
  可选 `links[].icon` 仅映射 `tv` / `video` / `coffee` 为 Lucide 内联 SVG 标记，
  标记 `aria-hidden`、不替代文本；未知 slug 不补图标、不留空占位。
- 三个相邻标签轮换红 / 天蓝 / 黄；顺序与 hover / focus / press 位移固定，不随机。
- 命中高度 ≥ 4.35rem；焦点为墨色 outline + 黄色底。

### Projects

- `projects[]` → 12 栏拼贴；全部 `title` / `description` / `url` / `tags` 呈现。
- 有 URL 时 title 本体是链接；没有 URL 时保持纯文本，不伪造按钮。
- 标签是真实信息，不冒充互动控件；每个项目有可见 h3。

### Experience

- `experience[]` → 色带阶梯；`org` 为 h3，`period` / `role` / `description` 均在存在时呈现。
- 位移只改变色带左边缘，不改变 DOM 顺序，不遮盖前一条正文。

### Skills

- `skills[]` → 胶囊贴纸；六种底色与 0.5–2.5deg 的静态倾斜循环，文字仍保持水平可读。

### Contact / footer

- `contact.email` → 可见 `mailto:` 链接，`emailLabel` 标明字段。
- `contact.note` → 薄荷注释卡。
- 两者均缺失时显示 `contactMissing`，不把空白伪装成联系方式。
- 条码、包装顶条是装饰；`footerMark` / `sampleNote` 来自 messages。

## Motion

**Motion language: “sticker snap.”** 快速、分段、只落一次，像纸片被拍到墙上。

- Name / headline / cue 在 `prefers-reduced-motion: no-preference` 下用 110 / 150 / 180ms
  的 `steps()` 从 2–12px 错位落位；不改变布局尺寸，不做淡入。
- 共享 Reveal 的分区各有 120–180ms 的位移 / 轻微旋转，0–45ms 错峰；全部只动 opacity / transform。
- 默认内容完全可见；隐藏态只存在于 `html[data-reveal-ready]` 下。无 JS、无 IO、脚本失败或减少动态时
  分区保持自然终态。
- 链接 hover / press 只做 1–3px 固定位移与阴影收紧；没有持续循环、视差、滚动劫持或主题脚本。
- `prefers-reduced-motion: reduce` 下所有 keyframes / transition 关闭。

## Accessibility and responsive

- 唯一 h1；每个内容分区都有可见 h2 和 `aria-labelledby`；项目 / 经历内标题为 h3。
- 装饰几何、编号、计数、短 URL、条码、包装顶条均 `aria-hidden="true"`；链接可访问名由真实 label 承担。
- 全部正文对比度按上表 ≥ 6.19:1；大标题最低也在红底 6.19:1。
- 键盘焦点为 4px 墨色 outline + 4px offset + 黄色底。
- `pointer: coarse` 链接至少 44px；邮箱链接扩展纵向命中。
- 375px 与 320px 采用单列 / 满宽链接 / 零阶梯偏移 / 零项目旋转；长姓名与地址 `overflow-wrap:anywhere`，
  `overflow-x: clip` 防止装饰贴纸造成页面横向滚动。
- 桌面 1280–1536px 下 78rem 世界宽度与页面侧留白同时生效，内容不贴边。

## Preview specification

- `Preview.astro` 是 16:10 装饰片段，根类 `.cal-pv`，只 import `tokens.css` 与 `messages.ts`；
  不 import `style.css`，不含 `<Font>`、链接或可聚焦元素。
- 画面：薄荷背景 slab、黄色切角姓名卡、天蓝 kicker、两枚链接标签、红色星形与粉色圆片、黑色联系胶囊。
- 导出四个真实使用的字体：`--font-fredoka`、`--font-lxgw`、`--font-inter`、`--font-league-mono`。
- 预览字号 `2.7rem / 0.54rem / 0.42rem` 是缩略档位，登记在 Typography ladder；
  阴影 2–5px，与正式页同为硬偏移，不使用正式页 layout。

## Do / Don't

### Do

- **Do** 让每个分区都参与同一条 12 栏 / 错位 / keyline / 硬阴影规则。
- **Do** 把颜色当切纸，不把它们变成全页统一底色；保持暖纸呼吸。
- **Do** 让真实数据决定条目数量；号码与计数只是索引，不是虚构内容。
- **Do** 用语义 DOM 保持视觉错位下的阅读顺序。
- **Do** 在 375px 主动收回旋转、阶梯和辅助 URL。

### Don't

- **Don't** 做成居中纸张、单张海报、套准标记或窄体全大写排印。
- **Don't** 使用 League Gothic / Blackout，或任何“Poster 字体组合”的回声。
- **Don't** 使用渐变、玻璃、透明叠层、柔软阴影、纹理图片或 UI 图标代替资料。
- **Don't** 用 Emoji、图标、等级 / HP / 虚构进度替代真实字段。
- **Don't** 给每个 section 一张同规格的卡片；项目、经历、技能必须有不同几何行为。
- **Don't** 将颜色作为唯一状态指示；焦点与 hover 同时改变轮廓 / 位移 / 下划线。

## Project contract

- 数据：`loadDesignView('cute-alism', Astro.url.pathname)`；全部界面文案来自 `./messages.ts`，
  三语完整；品牌名 `SENRENBANKA` 是唯一保持原文的名称。
- 页面：完整 `<html>`，`<head>` 原样 `<HeadMeta {...view.head} />`；四款 `<Font>`；共享 `<Reveal />`；
  `<body>` 末尾无条件 `<ContextMenu config={view.contextMenu} />`。
- 字体：`--font-fredoka` / `--font-lxgw` / `--font-inter` / `--font-league-mono`；
  `@theme inline` 只建立此设计的角色映射。
- 样式：`style.css` 前 3 行为 Tailwind 入口 / source / preview exclusion，随后 import `tokens.css`；
  全部颜色 token 位于 `:is(.cal, .cal-pv)`，不写 `:root`。
- 脚本：**无 design script**。只有共享 Reveal 与 ContextMenu 的既有机制。
- 当前取舍：avatar、location、projects、experience、skills、contact 六类可选资料全部呈现；
  缺失的 contact.email / note 由本地化空态文案承担。
