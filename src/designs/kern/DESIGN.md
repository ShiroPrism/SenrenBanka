---
name: Kern — Monochrome Grid
description: 纯黑白高对比的个人主页：发丝线网格骨架、Geist 无衬线 + 等宽双声部、零阴影平面、反转式主行动。
colors:
  bg: "#000000"
  surface: "#111111"
  surface-hover: "#1a1a1a"
  line: "#262626"
  line-strong: "#666666"
  cross: "#555555"
  fg: "#ffffff"
  fg-body: "#ededed"
  fg-muted: "#a1a1a1"
  fg-faint: "#888888"
  invert-hover: "#e5e5e5"
  ring: "#ffffff"
  selection-bg: "#ffffff"
  selection-fg: "#000000"
typography:
  display:
    fontFamily: "Geist Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Geist Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(1.125rem, 2.2vw, 1.375rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Geist Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
  button:
    fontFamily: "Geist Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  mono-label:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  mono-meta:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.01em"
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-meta:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.5rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  preview-label:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.5625rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  preview-body:
    fontFamily: "Geist Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-display:
    fontFamily: "Geist Variable, system-ui, -apple-system, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.02em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  hairline: "1px"
  gutter: "clamp(1.25rem, 4vw, 3rem)"
  hero: "clamp(3.5rem, 9vh, 5.5rem)"
  section: "clamp(2.5rem, 7vh, 4rem)"
motion:
  curve: "cubic-bezier(0.22, 1, 0.36, 1)"
  enter: "260ms"
  reveal: "300ms"
  hover: "140ms"
components:
  button-ghost:
    background: "transparent"
    borderColor: "{colors.line-strong}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    radius: "{rounded.sm}"
    padding: "0.625rem 1.125rem"
  button-primary:
    background: "{colors.fg}"
    textColor: "{colors.bg}"
    radius: "{rounded.sm}"
    padding: "0.625rem 1.125rem"
  chip:
    borderColor: "{colors.line}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.mono-label}"
    radius: "{rounded.xs}"
  cell:
    borderColor: "{colors.line}"
    titleTypography: "{typography.title}"
    bodyTypography: "{typography.body}"
  section-label:
    textColor: "{colors.fg-faint}"
    typography: "{typography.mono-label}"
---

# Design System: Kern — Monochrome Grid

## Overview

**Creative North Star: "Monochrome Grid（单色网格）"**

把主页当作一块工程感的坐标底板：整体由**发丝线网格骨架**圈定——容器两侧各一条贯穿全页的竖引导线、每
个分区一条横规则线、交点处一枚 `+` 十字号；内容（声明文字）与元数据（等宽小字）在该骨架内各就各位。
页面只有黑、白、灰三个声部：没有第二个颜色、没有阴影、没有渐变，深度与分区全部由 1px 线与留白表达。

字体是一套双声部：**Geist 无衬线负责"声音"**（姓名、定位、正文），**Geist Mono 负责"仪表"**（分区标签、
日期、标签、页脚）——两种声音永不对调。主行动用**反转**表达：白底黑字，一页里 scarcity 到只出现一次。

**Key Characteristics:**
- 纯黑白：黑画布 + 白前景 + 六级灰阶（正文 #ededed / 次级 #a1a1a1 / 微标注 #888888 / 发丝线 #262626 / 交互边界 #666666 / 组件底 #111111）。
- 网格骨架：竖引导线 ×2（容器两侧）、横规则线 ×分区、交点 `+` 十字号；项目为共享边界的单元网格。
- 零阴影、零渐变、零彩色；深度 = 线与留白。
- 圆角极小族：4 / 6 / 8 / 12px，无胶囊。
- 动效是"仪表"的：快出发、平滑落定，只服务反馈与进场；无持续动效。
- 等人比例：正文 15px / 1.65，分隔标签 11px 等宽大写。

## Colors

单色系统，语义按"底 / 线 / 字"三层编号（背景 1、组件底、边框、高对比底、文字——开发者工具式角色的单色演绎）。

### Background
- **Canvas（#000000）**: 全页画布。页面上唯一的纯黑底。
- **Surface（#111111）**: 组件默认底（行悬停、幽灵按钮悬停）。
- **Surface Hover（#1a1a1a）**: 组件次级悬停。

### Lines
- **Hairline（#262626）**: 结构性发丝线——网格骨架、单元边框、行分隔。**装饰性分隔**，不承担可识别性。
- **Line Strong（#666666）**: 交互边界——幽灵按钮描边；对 #000000 对比度 ≥3:1。

### Foreground
- **Foreground（#ffffff）**: 标题、反转底、焦点环。
- **Body（#ededed）**: 正文默认色。
- **Muted（#a1a1a1）**: 简介、描述、标签文字。
- **Faint（#888888）**: 等宽微标注（分区标签、日期、页脚）。

### Named Rules
**The Monochrome Rule.** 没有第二个颜色。强调只用两种手段：纯白，或底色反转（白底黑字）。选中态即反转（白底黑字），插入符为白色。
**The Flat Guide Rule.** 禁止阴影、渐变、彩色底块；深度与分区只能由 1px 发丝线、单元边框与留白表达。

## Typography

**Display / Body Font:** Geist Variable（回退 system-ui / PingFang SC / Microsoft YaHei）
**Instrument Font:** Geist Mono Variable（回退 ui-monospace / SFMono-Regular）

**Character:** 一套几何无衬线做主声音（姓名到正文），一套等宽做仪表（分区标签、日期、标签、页脚）。
中文回退苹方 / 微软雅黑；等宽场景仅用于 ASCII 元数据。

### Hierarchy
- **Display**（600, `clamp(2.75rem, 6vw, 4.5rem)`, 1.04, -0.02em）：姓名，唯一的超大字号；`text-wrap: balance`。
- **Lede**（500, `clamp(1.125rem, 2.2vw, 1.375rem)`, 1.5）：一句话定位，位于姓名下方。
- **Title**（500, 1.0625rem, 1.45）：项目标题、经历机构名。
- **Body**（400, 0.9375rem, 1.65）：正文；简介限宽 56ch，描述限宽 60ch。
- **Mono Label**（500, 0.6875rem, 字距 0.08em, 大写）：分区标签、芯片文字。
- **Mono Meta**（400, 0.75rem）：日期、地点、页脚。

### Named Rules
**The Split Rule.** 无衬线负责声音，等宽负责仪表；两种声音永不互换角色。等宽字号永远小于它旁边的无衬线。

## Layout

- 骨架容器：`max-width: 68rem`，两侧 1px 竖引导线贯穿全页；内容内边距 `clamp(1.25rem, 4vw, 3rem)`。
- 十字号 `+` 采用骑线定位（向骨架外溢出 5px）：**仅在视口 ≥ 69rem（骨架不触屏缘）时显示**，窄屏隐藏以避免横向溢出——骨架由竖线 + 横线继续承担。
- 顶栏（骨架顶盖）：等宽左"Portfolio"、右地点；底部一条横规则线，线端两枚 `+`。
- 首屏：姓名 → 定位 → 简介 → 链接按钮组；上下留白 `clamp(3.5rem, 9vh, 5.5rem)` / 2.5rem。
- 分区：`grid-template-columns: 10rem 1fr`（左等宽标签、右内容）；分区顶部横规则线横贯骨架，两端 `+`；间距 `clamp(2.5rem, 7vh, 4rem)`。≤768px 收为单列（标签在上）。
- 项目网格：共享边界的单元网格——容器左上边线 + 每单元右 / 下边线；≥840px 三列，以下单列。
- 经历：行分隔发丝线，首行无线（由分区规则线承担）；行距 1.5rem。
- 页脚（骨架底盖）：横规则线 + 等宽单行。

## Elevation & Depth

**零阴影系统。** 没有投影、没有卡片抬升、没有模糊。层级只来自：网格骨架线、反转（白底黑字）、字号与留白。

### Named Rules
**The Flat Guide Rule（重申）.** 任何元素都不许带 `box-shadow` 或渐变；"浮起来"的需求一律改由线与留白解决。

## Shapes

- 小圆角族：`4px`（芯片）/ `6px`（按钮）/ `8px`（单元）/ `12px`（大幅面块——本页暂未使用）。
- 无胶囊、无全圆角；几何语言以直线与直角为主，圆角仅用于软化可点击边。
- 网格骨架的十字号 `+` 是形状系统的一部分（装饰线端标记，9px 线框，`#555555`）。
- 链接下划线：1px、`text-underline-offset: 4px`；hover 保持 1px（靠颜色与底色反馈，不靠加粗）。

## Components

### Buttons
- **Ghost（默认）:** 透明底 + 1px `#666666` 描边 + 白色文字，圆角 6px；hover 底色 #111111、描边提亮到 #8a8a8a；`active` 缩放 0.985。
- **Primary（反转）:** 白底黑字（Button 档 0.875rem / 500），全页每屏 **≤1 处**（Contact 的邮箱行动）；hover 底转 `#e5e5e5`。
- **Size / Touch:** 桌面 padding 0.625rem 1.125rem（≈40px 高）；`pointer: coarse` 下命中高度 ≥44px。
- **Icon:** 按钮内标记（品牌 / 功能图标）1em、`aria-hidden`，颜色随按钮文字。

### Links & Marks
- **Inline links:** 白色文字 + 1px 下划线；hover 下划线转 `#a1a1a1`（文字不变）。
- **Brand / functional marks:** `github` → GitHub 品牌 mark（simple-icons / CC0 本地资产）；`mail` → Mail（`@lucide/astro`，1.5 描边）；**未配置 / 未映射的链接不渲染任何标记**。
- **External indicator:** 项目标题外链渲染 `ArrowUpRight`（lucide），0.85em，`aria-hidden`。
- **A11y:** 全部装饰标记 `aria-hidden`；可访问名由文本承担；唯一图标库 `@lucide/astro`（ADR 0002）。

### Section Label
- 分区标题 = 等宽大写微标签（Mono Label 档，`#888888`），左列顶部对齐；是分区唯一的标题元素（h2）。

### Cells（项目单元网格）
- 共享边界：容器左上 1px 线 + 每单元右下 1px 线；单元内边距 1.5rem。
- 内容：Title 档标题（外链带箭头）→ Body 档描述（`#a1a1a1`）→ 芯片标签行。
- hover（真悬停设备）：单元底转 #111111；标题下划线由标题链接自身承担。

### Chips（标签 / 技能）
- 等宽大写、11px、`#a1a1a1` 文字 + 1px `#262626` 描边、4px 圆角、无底色。

### Experience Rows
- 机构（Title 档白色）与日期（Mono Meta 档 `#888888`）两端对齐；角色与描述依次 `#a1a1a1`。
- 行间 1px 发丝线，首行无线。

### Contact
- 声明文本（Body 档 `#ededed`，可放大到 1.125rem）+ 反转主按钮（邮箱）。
- 位于骨架右列，与分区规则线构成最后一格。

### Motion
- 语言是"仪表"：**快出发、平滑落定**——曲线 `cubic-bezier(0.22, 1, 0.36, 1)`（motion.curve），只有三个动作：
  **进场**（首屏逐项淡入 + 10px 上浮，260ms，40ms 错落）、**显现**（滚动进入视口，300ms，单元 60ms / 经历行 50ms 错落）、**反馈**（hover / active 140ms 颜色与描边过渡）。
- **无持续动效**（论证：静止是默认状态；装饰性循环运动会与"工程仪表"的克制立场冲突——独有表现力来自网格骨架与反转，不需要动画背书）。
- 滚动显现复用共享 `IntersectionObserver`（机制见 `docs/adr/0001`、`docs/adr/0003`）；`prefers-reduced-motion: reduce` 时全部关闭；无 JS / 脚本失败时内容原样呈现（隐藏态以 `html[data-reveal-ready]` 为唯一门控，契约见 `AGENTS.md`）。

### Footer
- 骨架底盖：横规则线 + 等宽单行 `{name} · built from a single profile`。

## Do's and Don'ts

### Do:
- **Do** 让网格骨架（竖引导线 / 横规则线 / 十字号）成为页面最强的识别元素；规则线连同内边距横贯全宽。
- **Do** 保持单色三声部：白、黑、灰；强调只用纯白或反转。
- **Do** 无衬线 15px / 1.65 起步做正文；等宽永远小于同级无衬线。
- **Do** 项目单元共享边界（容器左上 + 单元右下），像一块坐标网格的一部分。
- **Do** 主行动反转（白底黑字）每屏 ≤1 处。

### Don't:
- **Don't** 引入任何彩色、阴影、渐变、模糊。
- **Don't** 使用胶囊或大圆角；圆角族上限 12px。
- **Don't** 把等宽字用于正文或标题；它是仪表，不是声音。
- **Don't** 给网格添加平铺背景底纹（骨架线是结构，不是纹理）。
- **Don't** 安排持续循环动画。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name`（Display 档 h1）/ `headline`（Lede）/ `bio` / `links`（幽灵按钮组，含映射标记）。
- **扩展区块取舍**：四类全取——`projects`（单元网格）/ `experience`（规则线行）/ `skills`（等宽芯片）/ `contact`（声明 + 反转主按钮）。
- `<HeadMeta {...view.head} />` 必须原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担（无条件接入 `<ContextMenu config={view.contextMenu} />`；桌面为右键 / `Shift+F10` 打开的浮层菜单，移动端为悬浮球打开的底部动作面板——项目级 chrome、中性外观，不属于本设计视觉系统）——本页不保留任何可见切换入口。
- 字体：`--font-geist` / `--font-geist-mono`（astro.config 的 fonts 注册 + 页面 `<Font>` + 本文件 `@theme inline`）；CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- 本设计为**第三方分析复刻**（`third-party-analysis`）：规范与实现均为自有产出，不含上游文本 / 素材 / 品牌资产；来源定性见 `design.json` 与 `docs/designs/kern/ADAPTATION.md`。
