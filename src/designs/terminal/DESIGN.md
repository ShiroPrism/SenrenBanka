---
name: Terminal — The Amber Terminal
description: 一台老式琥珀磷光终端：等宽字符网格、命令与输出的信息组织、扫描线与内发光。
colors:
  shell: "#0a0703"
  shell-raise: "#0d0903"
  phosphor: "#ffb000"
  phosphor-soft: "#ffcf70"
  phosphor-dim: "#c68a1a"
  phosphor-deep: "#5c4413"
  scanline: "rgba(255, 176, 0, 0.035)"
  halo: "rgba(255, 176, 0, 0.07)"
typography:
  display:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.6rem, 5vw, 2.4rem)"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  screen: "12px"
  none: "0"
spacing:
  char: "1ch"
  line: "1.6em"
  pad: "clamp(1.25rem, 4vw, 2.5rem)"
components:
  link:
    textColor: "{colors.phosphor}"
    typography: "{typography.body}"
  link-hover:
    backgroundColor: "{colors.phosphor}"
    textColor: "{colors.shell}"
  command-line:
    textColor: "{colors.phosphor-dim}"
    typography: "{typography.body}"
  dim:
    textColor: "{colors.phosphor-dim}"
    typography: "{typography.body}"
  cursor:
    backgroundColor: "{colors.phosphor}"
    width: "0.6em"
    height: "1em"
  chrome-title:
    textColor: "{colors.phosphor-dim}"
    typography: "{typography.label}"
---

# Design System: Terminal — The Amber Terminal

## Overview

**Creative North Star: "The Amber Terminal（琥珀终端机）"**

主页是一台开机中的老式终端：访客自上而下敲过 `whoami → ls links/ → cat experience.log → ls -l projects/ → cat skills.txt → mail`。
信息不是"排"出来的，是"跑"出来的——每块内容都由一行命令与它的输出组成，缩进表达层级，注释以 `#` 开头。

材质是一块琥珀磷光屏：近黑暖底、单一琥珀色相、微弱的扫描线与内发光、圆角只存在于屏幕外框。
单色系统不允许第二色相：层级只能靠明度档位（phosphor / phosphor-soft / phosphor-dim / phosphor-deep）与缩进表达。
字符网格是硬约束：等宽、行高 1.6、ASCII 装饰的字符间距为 0，否则图形会"斜切"。

**Key Characteristics:**
- 单色相琥珀荧光 + 4 档明度，禁止第二色相。
- 命令 → 输出的阅读顺序；小写、`$` 前缀、`└─` 列表符号。
- 唯一圆角是屏幕外框（12px）；内部零圆角、零投影。
- 唯一动效是块状光标闪烁（1.1s steps）。

## Colors

一块屏、一种磷光。层级由明度档位表达，而不是色相或面积。

### Primary
- **Amber Phosphor（琥珀磷光）**: 命令、输出、链接的基准色；屏幕唯一的信息色。
- **Soft Phosphor（亮琥珀）**: headline 一行高亮（`tm-headline`），仅此一处。

### Neutral
- **Shell（屏底）**: 近黑暖调页面底色；屏幕机身。
- **Shell Raise（屏心）**: 屏幕内自上而下的微亮渐变上沿。
- **Dim Phosphor（暗琥珀）**: 命令前缀、注释、次级元信息（对屏底对比度 ≈6.7:1；2026-10-10 自 5.0:1 提亮）。
- **Deep Phosphor（深琥珀）**: 屏幕边框、chrome 分隔线与圆点的描边色。

### Materials
- **Scanline（扫描线）**: 2.5% 琥珀、1px 线 + 2px 空隙——绘制在**屏幕背景层**（文字之下），dim 档在最亮扫描行仍 ≥5:1（2026-10-10 自全屏叠加层迁入背景层）。
- **Halo（内发光）**: 屏幕 inset shadow 的 7% 琥珀光。

### Named Rules
**The One Phosphor Rule.** 只有一个色相：琥珀。任何新元素只能从 4 档明度里取色，不许引入彩色。
**The Dim-First Rule.** 默认文字用暗档或基准档；亮档（Soft Phosphor）一屏只允许一次高亮。

## Typography

**Display Font:** JetBrains Mono Variable（回退 ui-monospace / Menlo / Consolas）
**Body Font:** 同上——全站单一等宽声部
**Label Font:** 同上（字号区分，不换族）

**Character:** 终端没有排版花活：一个等宽族、三条字号（24–38px 显示 / 15px 正文 / 12px chrome），
层级由颜色档位与缩进承担，weight 几乎不动（仅 display 一处 500）。中文直接落在等宽网格中，不翻译内容。

### Hierarchy
- **Display**（500, `clamp(1.6rem, 5vw, 2.4rem)`, 1.3）：`whoami` 输出的姓名，后随块状光标。
- **Body**（400, 0.9375rem, 1.6）：命令、输出、列表、正文的唯一档位。
- **Label**（400, 0.75rem, 1.6）：窗口 chrome 标题条。
- **Prompt（样式而非字号）**：命令行整行取 Dim 档；输出行取基准琥珀。

### Named Rules
**The Weightless Rule.** 不用字重区分层级；weight 500 只属于 display 一处。层级=颜色档位 + 缩进。

## Layout

- 屏幕：`width: min(52rem, 100%)`，居中；机身内边距 `clamp(1.25rem, 4vw, 2.5rem)`。
- 单列流式：无栅格、无卡片；块与块之间 2.25rem，块内行距 1.6。
- 每块 = 一行 `$ 命令` + 若干输出行；列表符号 `└─`（链接）或两位序号 `01`（项目）。
- 首屏 `whoami` 输出：姓名 → headline → bio → `# based in …`（profile.location，2026-10-10 补）。
- 页脚以 52 字符 ASCII 横线分段，行字距 0（`white-space: pre`），窄屏允许裁切。
- 响应式：仅调整 padding 与字号 clamp；结构不变（终端没有"移动版"）。

## Elevation & Depth

**没有投影层级。** 深度由三件材料表达：屏幕外框（1px Deep Phosphor）、内发光（Halo）、扫描线（Scanline）。
屏幕外浮着一层 24px 扩散的黑色阴影，只为把"机器"从页面背景里托起——这是全站唯一的 shadow。

### Named Rules
**The Single Shadow Rule.** 只允许屏幕外框那一处投影；屏幕内部任何元素不得再有 shadow。

## Shapes

- 唯一圆角：屏幕外框 12px；除此之外全部直角。
- chrome 三个圆点：1px 描边圆（非实心），表现"机器指示灯"。
- 分隔线是 ASCII 字符重复（`─`），不是 CSS 边框——保持字符网格完整（letter-spacing 0）。
- 光标是一个 0.6em × 1em 的实心矩形，与字符基线对齐。

## Components

### Links
- **Style:** 琥珀色 + 暗琥珀下划线（offset 3px）；无边框、无背景。URL 显示为去协议短形式（`github.com/example`）。
- **External marker:** 去向用 `→` 指路——链接行 `label → url`、项目行 `title → url`（`ls -l` 的符号链接语言）；Dim 档、`aria-hidden`，位于链接外（不参与反白）。
- **Hover:** 仅在 `@media (hover: hover) and (pointer: fine)` 下反白（背景→基准琥珀、文字→屏底），无过渡动画（终端不做补间）。
- **Touch:** `pointer: coarse` 时纵向 padding 0.75rem（命中区 ≈44px）；inline padding 不改变行高节奏。
- **Focus:** 2px 琥珀 outline、offset 3px。

### Command Lines
- **Style:** 整行 Dim 档（`phosphor-dim`）；`$` 前缀与行尾注释标签（`# 简介/链接/经历/项目/技能/联系`）是视觉语法的一部分，对辅助技术为装饰（`aria-hidden`）。
- **Output:** 基准琥珀；注释行（`# …`）与次级信息回到 Dim 档（`#` 同样 `aria-hidden`）。experience 的注释独立成行、缩进 3ch（`.tm-note`），与主行形成两档对比。
- **Semantics:** 六个分区各有一个 sr-only `<h2>`（Links/Experience/Projects/Skills/Contact + Intro 用 `aria-label`）承担无障碍标题；装饰横线 `aria-hidden`。

### Cursor（签名组件）
- **Style:** 实心琥珀块，位于姓名末尾（`aria-hidden`）。
- **Motion:** `1.1s steps(1)` 闪烁；`prefers-reduced-motion: reduce` 时静止常亮。

### List Rows
- **Style:** `└─ marker`（Dim 档）+ 链接（琥珀）+ `→ URL`（Dim 档，外链标识）；项目行以序号列开头，带 `url` 的标题后接 `→ url`。
- **≤560px:** 链接列表改为 `grid-template-columns: 3ch 1fr`——marker 固定列、换行的 URL 与链接左缘对齐。
- **Density:** 行距 0.3rem；项目行 0.65rem。

### Screen Chrome
- **Style:** 三个描边圆点 + `guest@senrenbanka: ~` 标题条；底边 1px Deep Phosphor。
- **Role:** 让页面像一台"正在运行的机器"，而不是一条聊天记录。
- **Entry:** 右侧 `[switch design]` 入口（2026-10-10 增加；页脚保留同目的入口作收尾）。

### Footer
- 52 字符 ASCII 横线（Dim 档）→ 切换设计入口（`[switch design] ./designs/`）→ 结束语。
- 页脚刻意保留"session ends"语气：访问是一次会话，不是一次浏览。

## Do's and Don'ts

### Do:
- **Do** 保持"命令 → 输出"顺序；层级用缩进与颜色档位表达。
- **Do** 让 ASCII 装饰用等宽字符重复（`─` `└─` `01`），字距 0、行高 1.6。
- **Do** 外链去向用 `→` 指路（`label → url` / `title → url`），Dim 档、`aria-hidden`。
- **Do** 全站小写；`$` 前缀、`#` 注释是文案语法的一部分。
- **Do** 把中文原文直接放进输出行（等宽网格天然支持 CJK 宽度）。
- **Do** hover 用反白块，而不是颜色渐变。
- **Do** 分区语义由 sr-only `<h2>` 承担；`$`、`└─`、`#` 与装饰横线一律 `aria-hidden`；dim 档对屏底保持 ≥6:1（扫描行最坏处 ≥5:1）。
- **Do** 有意保留两处"类别默认"反射：闪烁块光标与扫描线条纹是"琥珀终端机"的产品意图（impeccable 检测器的 `blinking-cursor` / `repeating-stripes-gradient` 信号属**有意为之**，不视为缺陷；2026-10-10 经项目所有者确认）。

### Don't:
- **Don't** 引入第二个色相或第二个字族。
- **Don't** 引入 SVG 图标或图标库——终端的全部标记都是字符（`└─` `→` `─`）。
- **Don't** 使用卡片、圆角、投影——唯一的例外是屏幕外框。
- **Don't** 用粗体区分层级（Weightless Rule）。
- **Don't** 做 glitch / 打字机 / 闪烁大面积元素等炫技动画；光标是唯一动效。
- **Don't** 让扫描线绘制在文字层之上或参与交互。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **扩展区块取舍**：终端可以承载密集输出，四个扩展区块全部渲染——
  `experience`（`cat experience.log`）、`projects`（`ls -l projects/`）、`skills`（`cat skills.txt`）、`contact`（`mail`）。
- `<HeadMeta {...view.head} />` 必须原样引入；`manualSwitch` 时页脚保留 `[switch design]` 入口。
- 字体：`--font-jetbrains-mono`（astro.config 的 fonts 注册 + 页面 `<Font>`（不 preload，子集过多）+ 本文件 `@theme inline`）；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。