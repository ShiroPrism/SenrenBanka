---
name: Frost — Materials & Depth
description: 以材料与层次为骨架的个人主页：极光底上的双层毛玻璃、iOS 系统色与 17px 型阶、胶囊控件与弹簧动效。
colors:
  accent: "#0071E3"
  accent-dark: "#0A84FF"
  accent-solid: "#0071E3"
  canvas: "#F2F2F7"
  canvas-dark: "#000000"
  label: "#1C1C1E"
  label-dark: "#FFFFFF"
  secondary: "#636366"
  secondary-dark: "#A1A1A6"
  tertiary: "#6E6E73"
  tertiary-dark: "#8E8E93"
  separator: "#C6C6C8"
  separator-dark: "#38383A"
  glass-nav: "rgba(250, 250, 250, 0.6)"
  glass-nav-dark: "rgba(22, 22, 24, 0.55)"
  glass-card: "rgba(255, 255, 255, 0.78)"
  glass-card-dark: "rgba(28, 28, 30, 0.72)"
  aurora-blue: "rgba(122, 184, 255, 0.5)"
  aurora-purple: "rgba(196, 165, 255, 0.42)"
  aurora-teal: "rgba(123, 224, 214, 0.4)"
  aurora-pink: "rgba(255, 183, 201, 0.34)"
  aurora-blue-dark: "rgba(36, 106, 199, 0.5)"
  aurora-purple-dark: "rgba(104, 76, 190, 0.45)"
  aurora-teal-dark: "rgba(22, 122, 114, 0.4)"
  aurora-pink-dark: "rgba(158, 64, 106, 0.34)"
  tint: "rgba(0, 122, 255, 0.12)"
  tint-dark: "rgba(10, 132, 255, 0.18)"
  fill: "rgba(120, 120, 128, 0.12)"
  fill-dark: "rgba(120, 120, 128, 0.24)"
typography:
  large-title:
    fontFamily: "Inter Variable, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.015em"
  title2:
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.27
  headline:
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.29
  body:
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.47
  subhead:
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.33
  footnote:
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.38
  caption:
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  group-label:
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.38
    textTransform: "uppercase"
    letterSpacing: "0.04em"
  # 切换页预览层（`Preview.astro`）的缩略档位；不并入正式页阶梯（2026-10-19）。
  preview-body:
    fontSize: "0.55rem"
    fontWeight: 400
    lineHeight: 1.4
  preview-pill:
    fontSize: "0.48rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "10px"
  md: "16px"
  lg: "22px"
  full: "9999px"
spacing:
  gutter: "1.25rem"
  section: "2rem"
motion:
  spring: "cubic-bezier(0.32, 1.25, 0.5, 1)"
  enter: "500ms"
  reveal: "450ms"
  hover: "200ms"
components:
  nav:
    material: "{colors.glass-nav}"
    blur: "blur(20px) saturate(180%)"
    height: "52px"
  card:
    material: "{colors.glass-card}"
    radius: "{rounded.md}"
    padding: "1rem"
  button-filled:
    background: "{colors.accent}"
    textColor: "#FFFFFF"
    radius: "{rounded.full}"
    padding: "0.75rem 1.5rem"
  button-fill:
    background: "{colors.fill}"
    textColor: "{colors.label}"
    radius: "{rounded.full}"
  chip:
    background: "{colors.fill}"
    textColor: "{colors.secondary}"
    radius: "{rounded.full}"
    typography: "{typography.caption}"
  group-label:
    textColor: "{colors.secondary}"
    typography: "{typography.group-label}"
---

# Design System: Frost — Materials & Depth

## Overview

**Creative North Star: "Materials & Depth（材料与层次）"**

把主页当作 iOS 的一屏设置页：柔彩极光铺在底层，**功能层（导航）与内容层（分组卡片）用两种不同"厚度"的半透明材料**浮在其上；内容在滚动时会从导航玻璃下透出。文字是系统三档灰阶（label / secondaryLabel / tertiaryLabel），控件是胶囊，动效是弹簧的。
材料是本设计的唯一装饰语言——没有第二种纹理、没有渐变字、没有线条装饰；"深度"完全由材料的透明度与模糊表达。

**Key Characteristics:**
- 极光底（装饰层）+ 双层玻璃材料（导航功能玻璃 / 内容标准材料）。
- iOS 系统色：单强调蓝 + 三档灰 + 红仅语义；深浅双模随系统（`prefers-color-scheme`）。
- iOS 型阶：**17px 正文基线**（项目现行设计中的唯一）+ Large Title 34。
- 胶囊控件（按钮 / 芯片）+ 10 / 16 / 22px 圆角族（同心圆角：外层大、内层小）。
- 弹簧动效：轻微过冲、快速落定；无持续动效（论证见 Motion）。
- 尊重 `prefers-reduced-transparency`：关闭玻璃转为实底。

## Colors

### 系统声部
- **Label（`#1C1C1E` / 深色 `#FFFFFF`）**：主文本。
- **Secondary Label（`#636366` / `#A1A1A6`）**：次级文本（描述 / 副标 / 组标题）。
- **Tertiary Label（浅色 `#6E6E73` / 深色 `#8E8E93`）**：最低档（页脚）。
- **Accent Blue（浅色 `#0071E3` / 深色 `#0A84FF`）**：唯一强调色——链接、选中、焦点、tint 文本。（浅色档取比 iOS 系统蓝 `#007AFF` 深一档的 `#0071E3`：系统蓝在 17px 小字下不达项目 AA 硬底线；深色档即系统蓝。）
- **Accent Solid（`#0071E3`，深浅同值）**：Filled 胶囊的填充底——白字在深色档系统蓝 `#0A84FF` 上仅 3.65:1，填充底固定在过线的一档。
- **Separator（`#C6C6C8` / `#38383A`）**：行分隔线（左缩进 16px，iOS 惯用法）。

### 材料（Materials）
- **Canonical 画布**：`#F2F2F7`（浅）/ `#000000`（深）——材料之下的底。
- **极光层**（装饰，浅色 `aurora-blue / purple / teal / pink`，深色各取 `*-dark`）：低透明度蓝 / 紫 / 青 / 粉的柔彩大色斑，只作为玻璃的"背景内容"存在（值见 frontmatter）。
- **导航玻璃（功能层）**：`rgba(250,250,250,.60)` / `rgba(22,22,24,.55)` + `blur(20px) saturate(180%)`。
- **卡片材料（内容层）**：`rgba(255,255,255,.78)` / `rgba(28,28,30,.72)` + 同参数模糊——**更厚、更实**，保证文字对比。
- **Tint 填充**：accent 12%（深色 18%）——tinted 控件底色。
- **Fill 填充**：中性 12%（深色 24%）——灰色胶囊底。

### Named Rules
**The Two-Thickness Rule.** 只有两层材料，灰度不许有第三层：功能层（导航）更透，内容层（卡片）更实；不得互换。
**The One Blue Rule.** 一屏内 accent 蓝只出现在需要行动或需要指向的地方（链接、填充按钮、tint 控件）；其余一切是三档灰。

## Typography

**字体：Inter Variable**（SF Pro 的不可内嵌替代，见 ADAPTATION；回退 system-ui / PingFang SC）。

### 字体选型记录（六项，依据 docs/fonts/selection-guide.md 流程）
1. **隐喻与特征**: iOS 材料与层次 → 字体必须接近系统 UI 的中性人文主义骨架，正文在 17px 有稳定灰度，标题在 34px 仍保持克制；它不能抢走玻璃、圆角与系统色的主角地位，也不能像展示字体那样把页面变成品牌海报。
2. **角色分配**: Large Title、Title 2、Headline、Body、Subheadline、Footnote、Caption 与 Group Label 全部 = Inter Variable；层级由 iOS 型阶的字号 / 行高 / 字重承担，不引入第二字体族。
3. **为什么是它而非其他**:
   - Inter 而非 SF Pro：SF Pro 受 Apple 平台字体许可限制，不能随站点再分发；Inter 是开放许可、可在构建期自托管的中性替代，字面比例与系统 UI 接近，17px 正文样张灰度稳定。
   - Inter 而非 Roboto Flex：Roboto 的几何骨架与 Android / Material 的视觉记忆更强，会与 frost 的 Apple 材料语言错位；Inter 更接近系统 UI 的紧凑字形。
   - 保留单一族而非再加展示字体：iOS 的层级来自型阶而非换族；加入展示衬线或无衬线会破坏系统感，也会增加切换页字体并集。
4. **实际覆盖与回退**:
   - Inter Variable：latin 95/95 ASCII、latin-ext；无 CJK / 假名。英文、数字与系统 UI 标点实测命中；中文与日文回退系统字体。
   - 中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`，通用族 `sans-serif` 收尾；日文页面不依赖 Inter 提供假名字形。
5. **字重 / 轴 / 体积 / 许可**: Inter Variable 使用 400 / 600 / 700 `wght`；latin normal 约 48,256 B、italic 约 51,832 B；OFL-1.1（无 RFN 障碍，原样分发）。站点不 preload，按 `unicode-range` 惰性加载。
6. **缺失回退顺序**: `--font-inter → system-ui → -apple-system → PingFang SC → Microsoft YaHei → Hiragino Sans → Yu Gothic UI → sans-serif`。字体加载失败时仍保留系统 UI 的字号与行高，正文可读。

### iOS 型阶（本页子集）

| 样式 | 字号 / 行高 | 字重 | 用途 |
|---|---|---|---|
| Large Title | 34 / 1.18, -0.015em | 700 | 姓名（h1） |
| Title 2 | 22 / 1.27 | 600 | 定位语 |
| Headline | 17 / 1.29 | 600 | 行标题 / 姓名（导航） |
| Body | **17 / 1.47** | 400 | 正文基线 |
| Subheadline | 15 / 1.33 | 400 | 次级行（描述 / 日期） |
| Footnote | 13 / 1.38 | 400 | 芯片文字 |
| Caption | 12 / 1.33 | 400 | 页脚 |
| Group Label | 13, 大写, 0.04em | 400 | 分组标题（h2） |

### Named Rules
**The 17 Rule.** 正文基线是 17px（iOS body）；描述与元数据降到 15 / 13，不再下探。

## Layout

- 内容列：**max-width 720px** 居中；侧边距 20px。
- 导航：通栏玻璃（sticky 置顶），内层与内容列对齐；高 52px。
- 分组：`组标签（Group Label）→. 玻璃卡片`；组间距 2rem。
- 卡片内行：分隔线**左缩进 16px**（最后一行无线）；行内边距 12–16px。
- 移动优先；桌面仅加宽留白（内容列不变）——iOS 的"单列阅读"立场。

## Materials & Depth

- **两层材料**（来源：HIG materials 的两种材料教义 → 本设计映射）：
  - 功能层（导航）＝浮在滚动内容之上的玻璃——内容滚动时从其下透出；
  - 内容层（卡片）＝更厚的标准材料——用于内容分组与阅读对比。
- **极光层**是玻璃的"背景内容"：固定全屏、`z-index: -1`、纯装饰（`aria-hidden`）、无动画。
- **回退**：
  - `@supports not (backdrop-filter: blur(1px))` → 玻璃升为近实底（不透明度 0.97）+ 保留描边；
  - `prefers-reduced-transparency: reduce` → 同上传实底策略；
  - 两者都保文字对比（核算见验证记录）。
- 深度不使用 box-shadow（卡片靠材料与圆角分层）；导航在滚动时不加投影。

## Shapes

- 圆角族：**10px**（行内小元素）/ **16px**（分组卡片）/ **22px**（大幅面：hero 卡、contact）/ **full**（胶囊：按钮、芯片）。
- 同心圆角：外层 22 时内层 10–16（视觉平行）。
- 无描边盒：卡片可以 1px 半透明描边（rgba 黑白 8–10%）收敛边缘，不用实色边框。

## Components

### Navigation Bar（功能玻璃层）
- sticky；`blur(20px) saturate(180%)`；左：姓名（Headline 档），右：地点（Subheadline 档、secondary）；底部 1px separator（30% 透明）。
- 不参与滚动动画；无 hover 态（非交互）。

### Grouped Cards（内容材料层）
- 组标签（Group Label 档、secondary、大写）+ 16px 圆角卡片 + 16px 内边距；卡片内行距 0、行间 1px 左缩进分隔线。

### Rows
- 标题行：Headline 档（含外链箭头 0.8em，内联）；副行：Subheadline 档 secondary；多行间距 4px。

### Capsule Buttons
- **Fill（默认）**：中性 12% 底 + Label 文本（hero 链接、灰色胶囊）。
- **Filled（强调）**：`accent-solid #0071E3` 底 + 白字（contact 邮箱，一屏一处）。
- **Tinted**：accent 12% 底 + accent 文本（备用；本页未用）。
- 高度 44px（`pointer: coarse` 命中达标）；`:active` 缩放 0.97 + 亮度 95%。

### Chips
- Caption 档文字 + Fill 底 + 胶囊（项目标签、技能）。

### Contact
- 22px 大幅面卡：note（Body 档）+ Filled 胶囊邮箱按钮（Mail 图标 1em、`aria-hidden`）。

### Footer
- Caption 档 tertiary 居中；`{name} · built from a single profile`。

### Motion
- **弹簧语言**：曲线 `cubic-bezier(0.32, 1.25, 0.5, 1)`（轻微过冲 + 快速落定，模拟 iOS 弹簧阻尼）。
- **进场**（首屏逐项）：上浮 16px + 缩放 0.98→1，500ms，40ms 错落。
- **显现**（滚动，共享 `Reveal`）：450ms；行错落 50ms、卡片组错落 70ms。
- **反馈**：`hover` 200ms（材料 / 颜色变化）、`:active` 缩放 130ms。
- **无持续动效**（论证：材料的"深度"由透明与模糊表达；极光是静止的底——循环运动会与"安静的系统界面"立场冲突）。
- `prefers-reduced-motion: reduce` 全部关闭；无 JS / 脚本失败时内容原样呈现（隐藏态以 `html[data-reveal-ready]` 为唯一门控，契约见 `AGENTS.md`）。

## Do's and Don'ts

### Do:
- **Do** 维持两层材料（导航更透、卡片更实）；极光只作为它们的背景内容。
- **Do** 用 17px 正文基线与三档灰阶；accent 蓝只给行动。
- **Do** 胶囊用于一切可点击控件；卡片用 16 / 22 圆角。
- **Do** 尊重 `prefers-reduced-transparency` 与 `prefers-reduced-motion`。

### Don't:
- **Don't** 引入第三种材料 / 第三层深度（无投影、无第二强调色）。
- **Don't** 给极光加动画，或把材料用在文字阅读层（玻璃不叠玻璃）。
- **Don't** 用 16px 或更大的行高惯例改写 17px 基线。
- **Don't** 给表单 / 占位元素发明与 iOS 系统不同的控件形态。

## Project Contract（本项目契约）

- **核心字段必须渲染**：`name`（Large Title h1 + 导航 Headline）/ `headline`（Title 2）/ `bio`（Body 档 secondary）/ `links`（Fill 胶囊组，含映射标记）。
- **扩展区块取舍**：四类全取——`projects`（分组卡 · 行 + 芯片）、`experience`（分组卡 · 行）、`skills`（芯片组）、`contact`（大幅面卡 + Filled 胶囊）。
- `<HeadMeta {...view.head} />` 必须原样引入；页面操作、主题切换与语言切换由**全站共享操作菜单**承担（无条件接入 `<ContextMenu config={view.contextMenu} />`；桌面为右键 / `Shift+F10` 打开的浮层菜单，移动端为悬浮球打开的底部动作面板——项目级 chrome、中性外观，不属于本设计视觉系统）——本页不保留任何可见切换入口。
- 字体：`--font-inter`（astro.config 的 fonts 注册 + 页面 `<Font>` + 本文件 `@theme inline`）；CSS 入口保持 `@import "tailwindcss" source(none); @source "./";`。
- 本设计为**第三方分析复刻**（`third-party-analysis`）：规范与实现均为自有产出，不含上游文本 / 素材 / 品牌资产；来源定性见 `design.json` 与 `docs/designs/frost/ADAPTATION.md`。
