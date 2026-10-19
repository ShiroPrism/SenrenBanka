---
name: Editorial — The Issue
description: 一期特刊式的个人主页：暖纸底上的衬线排版、不对称网格、发丝线与单一焦赭强调。
colors:
  paper: "#f7f4ef"
  ink: "#1c1917"
  ink-muted: "#57534e"
  accent: "#9a3412"
  rule: "#d6cfc4"
typography:
  display:
    fontFamily: "Fraunces Variable, Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(2.75rem, 8vw, 5.5rem)"
    fontWeight: 560
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "clamp(1.1rem, 2vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Fraunces Variable, Georgia, 'Songti SC', serif"
    fontSize: "clamp(1.5rem, 3vw, 2.125rem)"
    fontWeight: 560
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  work-title:
    fontFamily: "Fraunces Variable, Georgia, 'Songti SC', serif"
    fontSize: "1.35rem"
    fontWeight: 560
    lineHeight: 1.25
  body:
    fontFamily: "Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.18em"
  # 切换页预览层（`Preview.astro`）的缩略档位。预览是卡片的缩微引述，不是正式页；
  # 这些档位只为 320–384px 卡宽登记，不并入上面的正式页阶梯（2026-10-19）。
  preview-micro:
    fontFamily: "同 label"
    fontSize: "0.5rem"
    fontWeight: 400
    lineHeight: 1.5
  preview-meta:
    fontFamily: "同 label"
    fontSize: "0.5625rem"
    fontWeight: 400
    lineHeight: 1.5
  preview-body:
    fontFamily: "Georgia, 'Songti SC', 'SimSun', serif"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.45
  preview-number:
    fontFamily: "同 label"
    fontSize: "0.45rem"
    fontWeight: 400
    lineHeight: 1.5
  preview-display:
    fontFamily: "Fraunces Variable, Georgia, 'Songti SC', serif"
    fontSize: "1.8rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.015em"
rounded:
  none: "0"
spacing:
  hairline: "1px"
  section: "clamp(3rem, 9vh, 5.5rem)"
  gutter: "clamp(1.5rem, 6vw, 5rem)"
components:
  link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  link-mark:
    textColor: "{colors.ink-muted}"
  work-ext:
    textColor: "{colors.ink-muted}"
  section-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  label:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
  work-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "1.75rem 0"
  tag:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
---

# Design System: Editorial — The Issue

## Overview

**Creative North Star: "The Issue（一期特刊）"**

把主页当作一期只做一次的特刊：有期号（第 01 期）、有栏目（Selected Works / Elsewhere）、有选辑逻辑。
页面不是简历的容器，而是一次编辑行为——什么进入这一期、以什么顺序、占多少版面，全部是编辑决定。

材质是纸与油墨：单一暖纸底、无卡片无投影，分区只靠 1px 发丝线；唯一彩色（焦赭）像编辑的红笔批注，
出现得少且总是有理由。排版是第一主角：Fraunces 衬线大字负责声音，Georgia/宋体负责长文阅读，
系统无衬线只留给 ≤11px 的大写标签做元信息。

**Key Characteristics:**
- 暖纸底 + 深墨字，零圆角、零阴影、零底色块。
- 不对称首屏（3fr / 2fr），正文测量宽度 ≤34em。
- 焦赭色一屏内 ≤3 处：期号前缀、链接下划线、作品序号。
- 衬线与无衬线严格分工，永不对调。
- 动效是"印刷"的：墨色渗入 + 发丝线从左绘制；不移动版面、不回弹（2026-10-10 v0.4.0）。

## Colors

只为"纸、墨、一支红笔"服务：中性色承担全部版面，焦赭承担全部强调。

### Primary
- **Editorial Sienna（焦赭）**: 唯一强调色。用于：期号前缀、链接下划线、作品序号（01/02/03）。不用于大面积填充。

### Neutral
- **Warm Paper（暖纸）**: 页面底色。永远不出现第二层"卡片底色"。
- **Deep Ink（深墨）**: 标题与正文的基准色。
- **Muted Ink（灰墨）**: 简介、地点、标签、页脚等次级文字。
- **Hairline（发丝线）**: 1px 分隔线的唯一颜色，用于分区与列表行。

### Named Rules
**The One Accent Rule.** 按栏目计数：每个栏目内静态焦赭 ≤3 处（期号、作品序号）；链接 hover 下划线、文本选中底色与插入符属交互态，不受静态配额限制。其余一切皆是墨与纸。它的稀有就是它的力量。
**The No-Tint Rule.** 禁止用底色块分区——分区只能由发丝线与留白完成。

## Typography

**Display Font:** Fraunces Variable（回退 Georgia / Songti SC / SimSun）
**Body Font:** Georgia（回退 Songti SC / SimSun）
**Label Font:** 系统无衬线（system-ui / -apple-system）

**Character:** 两档衬线声音（Fraunces 做标题、Georgia 做正文）+ 一支极小的无衬线做标签。
中文回退宋体系，与西文衬线气韵一致；混排时全角标点。

### Hierarchy
- **Display**（560, `clamp(2.75rem, 8vw, 5.5rem)`, 1.02）：姓名，唯一一次出现的最大字号；`text-wrap: balance`。
- **Headline**（400, `clamp(1.1rem, 2vw, 1.4rem)`, 1.5）：一句话定位，斜体。
- **Title**（560, `clamp(1.5rem, 3vw, 2.125rem)`, 1.1）：栏目名。
- **Work Title**（560, 1.35rem, 1.25）：作品行标题——区别于栏目 Title 的一档小标题。
- **Body**（400, 1.0625rem, 1.75）：正文；简介与描述分别限宽 34em / 46em。
- **Label**（400, 0.6875rem, 字距 0.18em, 大写）：期号、栏目副标、标签、页脚。
- **Index**（400，Fraunces 斜体, 1.5rem, oldstyle-nums）：作品序号，旧式数字 + 焦赭。

### Named Rules
**The Two-Voice Rule.** 衬线负责标题与正文，无衬线只出现在 ≤11px 的大写标签；两个声音永不互换角色。

## Layout

- 容器：`max-width: 72rem`，水平留白 `clamp(1.5rem, 6vw, 5rem)`。
- 首屏 masthead 行：左 kicker（≤560px 仅中文）、右 Label 档导航「本期导航」（精选作品 / 外部链接）；其下为姓名 → 不对称双栏（定位 3fr / 右栏简介+地点 2fr，**两栏同顶对齐**——保证定位语先于简介、与 DOM 顺序一致；≤720px 收为单栏）。
- 栏目：`padding: clamp(3rem, 9vh, 5.5rem) 0` + 底部发丝线；栏目头为"名称（左）/ 大写副标（右）"的基线两端对齐。
- 作品行：`grid-template-columns: 3.5rem minmax(0, 1fr)`，行距 `1.75rem 0`，行间发丝线（首行无）。
- 页脚两段式：先"邀请"段（contact.note 斜体衬线 + 邮箱 CTA），再 meta 行（colophon 右对齐）——以对人的邀请收尾（2026-10-10 Peak-End 修正；v0.5.0 移除页脚切换入口后 meta 行仅剩 colophon）。

## Elevation & Depth

**零阴影系统。** 深度只由留白与发丝线表达：没有投影、没有卡片抬升、没有渐变。
页面是一张平铺的纸，层级来自字号、字重与空间分配。

### Named Rules
**The Flat Sheet Rule.** 任何元素都不许带 `box-shadow` 或背景色块；如果你想要"浮起来"，请改用留白。

## Shapes

- 直角语言：全部元素圆角为 0（`rounded.none`）。
- 没有边框盒：唯一允许的线是 1px 水平发丝线（分区与列表行）。
- 视觉锚点是斜体衬线序号与双侧基线对齐，而不是任何几何装饰。
- 链接下划线是形状系统的一部分：1px（hover 2px）、offset 5px、默认墨色、hover 转焦赭。

## Components

### Links
- **Style:** 墨色文字 + 墨色下划线（1px, offset 5px）；无背景、无圆角。
- **Hover / Focus:** hover 下划线转焦赭并加粗到 2px（颜色+粗细各 120ms）；focus-visible 为 2px 焦赭 outline、offset 3px。
- **Selection / Caret:** 文本选中为焦赭底 + 暖纸文字；插入符为焦赭——"红笔批注"延伸到浏览器原生界面。
- **Touch:** `pointer: coarse` 时纵向 padding 0.78rem（命中区 ≈44px）；桌面保持紧凑。

### Marks & External Indicators（标志与外链标识）
- **Brand mark:** `links[].icon === "github"` 的链接在标签前渲染 GitHub 品牌 mark（本地 SVG，来源 simple-icons / CC0；灰墨、0.85em、静态，不参与 hover 变色）。
- **Functional icons:** `mail` → Mail（`@lucide/astro`、1.5 描边、灰墨、0.85em，与品牌 mark 同槽同尺寸）；**未配置 / 未映射的链接不渲染任何标记**——按配置逐条标记（2026-10-11 修订，旧「Globe 回退 / 100% 标记」被项目所有者否决）。
- **External indicator:** Selected Works 中带 `url` 的作品标题后渲染外链箭头（`ArrowUpRight`，lucide、1.5 描边、0.8em、灰墨）。它是语义标识（指出"去向外部"），不是装饰。
- **A11y:** 以上皆 `aria-hidden`；可访问名由既有文本标签承担。
- **来源与规则:** 唯一图标库 `@lucide/astro` + simple-icons 资产，见 `docs/adr/0002-icon-and-brand-mark-strategy.md`。

### TOC / Anchor Nav（masthead 锚点目录）
- **Style:** Label 档大写、灰墨、无下划线；hover 转墨色 + 焦赭下划线；锚点目标 `scroll-margin-top: 2rem`。
- **Touch:** `pointer: coarse` 时导航项与作品标题链接均在 0.78rem 命中区内。

### Work Rows（作品行）
- **Structure:** `[序号 3.5rem] [标题 / 描述 / 标签]` 两列网格；行间 1px 发丝线，首行无。
- **Title:** Title 档衬线；带链接时整串下划线（hover 加粗）。
- **Tags:** Label 档大写，以 1.5rem 列距横排。

### Section Head（栏目头）
- Title 档栏目名 + Label 档大写副标，`align-items: baseline` 两端对齐；`white-space: nowrap` 保护副标。

### Tag
- Label 档大写、灰墨；无边框、无底色——它们只是版面上的小字。

### Footer
- 两段式：上段"邀请"（contact.note 斜体衬线 + 邮箱链接），下段 meta 行（colophon 右对齐）。Elsewhere 列表**全量渲染 `links[]`**（2026-10-11 修订：移除 mailto distill 去重，链接列表与配置一一对应；邀请段照旧，优先 contact.email）。

### Motion
- 页面语言是"印刷"：动效只有两个动作——**墨色渗入**（仅 opacity 渐显，无位移）与**发丝线从左绘出**（`transform: scaleX` 展开）；不做大于 10px 的位移、不做回弹、不做持续动画。
- **首屏入场**（纯 CSS，无 JS 依赖）：眉标 → 姓名 → 定位/简介以 90ms 错落渗入（340ms 档）；hero 发丝线于 220ms 起从左绘出（520ms）——约 0.8s 内全部落定，核心内容不等待。
- **滚动显现**（复用共享 `IntersectionObserver`，只播一次；机制见 `docs/adr/0001`、`docs/adr/0003`）：栏目头两端就位（标题自左 10px、副标自右 10px 且慢 80ms）；作品行渗入 + 该行发丝线上墨绘制（420ms，滞后 40ms）；Elsewhere 链接以 70ms 错落渗入；页脚整体渗入。
- 链接下划线/颜色的交互态过渡保持 120ms；`prefers-reduced-motion: reduce` 时全部关闭；无 JS / 脚本失败时内容原样呈现（隐藏态以 `html[data-reveal-ready]` 为唯一门控，契约见 `AGENTS.md`）。

## Do's and Don'ts

### Do:
- **Do** 保持正文测量宽度 ≤34em（简介）/ ≤46em（描述行）。
- **Do** 用 1px 发丝线分区，栏目间距用 `clamp(3rem, 9vh, 5.5rem)`。
- **Do** 链接标记（品牌 mark / 外链箭头）保持灰墨与静态；强调仍只交给焦赭下划线的交互态。
- **Do** 静态焦赭只出现在期号与作品序号（每栏目 ≤3 处）；链接 hover 下划线、文本选中底色与插入符为交互态强调；链接静态下划线保持墨色（2026-10-10 依 The One Accent Rule 收权并厘清计数口径）。
- **Do** 标题用 `text-wrap: balance`，正文左对齐（不两端对齐）。
- **Do** 中文回退宋体系；大写标签保持 0.18em 字距。
- **Do** 有意保留两处"类别默认"反射：暖纸底与追踪字距的大写眉标是"一期特刊"的产品意图（impeccable 检测器的 `cream-palette` / `hero-eyebrow-chip` 信号属**有意为之**，不视为缺陷；2026-10-10 经项目所有者确认）。

### Don't:
- **Don't** 使用圆角、阴影、渐变、底色块中的任何一种。
- **Don't** 让无衬线进入正文或标题（它只属于大写标签）。
- **Don't** 用焦赭做大面积填充或第二个彩色。
- **Don't** 发明超出两级的字号跳跃；序号保持斜体旧式数字。
- **Don't** 给同屏安排两处以上的强调元素。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name` / `headline` / `bio` / `links`。
- **扩展区块取舍（编辑决定）**：渲染 `projects`（Selected Works）与 `contact`（Elsewhere 联系段）；
  **不渲染** `experience` / `skills`——杂志式"精选作品"叙事取代履历清单，这是本设计的编辑立场。
- `<HeadMeta {...view.head} />` 必须原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担（无条件接入 `<ContextMenu config={view.contextMenu} />`；桌面为右键 / `Shift+F10` 打开的浮层菜单，移动端为悬浮球打开的底部动作面板——项目级 chrome、中性外观，不属于本设计视觉系统）——本页不保留任何可见切换入口。
- 字体：`--font-fraunces`（astro.config 的 fonts 注册 + 页面 `<Font>` + 本文件 `@theme inline`）；
  CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
