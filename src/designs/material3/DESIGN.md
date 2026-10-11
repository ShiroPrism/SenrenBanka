# Material 3 — 官方文档汇编（Google Material 3）

> 本规范是 Google Material 3 官方指南（m3.material.io）与官方开源 token 源码（material-components/material-web）的**整合汇编**（`source.type: official-docs-derived`）。
> 自有行文组织，不移植上游原文长段；仅规则性短句与事实性数据（token 名 / 数值 / 表格）保留并逐节标注来源。
> 2026-10-11 整合完成即冻结；上游更新不触发修订（跟随上游 = 新一次整合，记 changelog）。
> 本文件只读；项目实现的适配与偏差见 `docs/designs/material3/ADAPTATION.md`；逐节来源与许可见文末附录。
> 整合范围：**baseline（M3 基础版）**——色彩 / 型阶 / 形状 / 层级 / 动效 / 图标 / 交互态 / 布局 / 无障碍 / 内容。不含组件级规范；**M3 Expressive**（2025 扩展：弹动式物理动效、emphasized 型阶、扩展形状库与形态变形等）不在汇编内，仅在相关章节注明边界。

## 设计意图（Design intent）

一套**算法化、可个性化**的设计语言：色彩、型阶、形状、动效都是"系统"，不是一次性选择。

- **个性化的色彩系统**：由算法从单一源色生成整套可访问色彩（dynamic color），也提供静态 baseline 方案；26+ 色彩角色按强调度与容器类型分工。
- **tonal 面层**：surface 角色由中性调色板的 tone 分档定义、与仰角解耦（取代早期"面层 = 仰角 +1…+5"的模型），可支撑动态色与用户对比度档位。
- **表达性的型阶**：display / headline / title / body / label 五类角色、15 档 baseline 样式；型阶 = 角色 + 尺寸的组合，便于按用途匹配。
- **形状与文字同源**：形状圆润度与型阶呼应；全圆角由 `full` 表达；允许方 / 圆对比制造张力。
- **克制的层级**：仅 0–5 级（0/1/3/6/8/12dp）；默认以 tonal 色表达深度，阴影只在需要分隔背景或提示交互时使用。
- **标志性动效**：emphasized 曲线族——快速起步、极柔和落地；过渡面积与进出场决定时长。

## 色彩（Color）

### 系统构成（官方指南）

- **26+ 色彩角色（color roles）**：按强调度与容器分工（primary / secondary / tertiary 三组强调色 + error + surface / outline 等组）；角色间关系（surface 配 on-surface 等）内建对比度保障。
- **baseline 静态方案**：默认静态色彩方案，含浅色与深色两套基线（本规范数值取此）。
- **dynamic color（动态色）**：从用户壁纸（user-generated）或应用内内容（content-based）取单一源色，算法生成整套可访问方案；用户可选择对比度。
- **三层对比度**：标准 / 中等 / 高（2025 更新）；角色与对比度均已 token 化。
- **fixed 色组**：primary / secondary / tertiary 各有一组"固定色"——在深浅主题中保持同值（区别于随主题换 tone 的常规容器色）。

### baseline 方案关键角色值（浅色 / 深色）

| 角色 | 浅色 | 深色 |
|---|---|---|
| primary | `#6750A4` | `#D0BCFF` |
| on-primary | `#FFFFFF` | `#381E72` |
| primary-container | `#EADDFF` | `#4F378B` |
| on-primary-container | `#21005D` | `#EADDFF` |
| secondary | `#625B71` | `#CCC2DC` |
| secondary-container | `#E8DEF8` | `#4A4458` |
| on-secondary-container | `#1D192B` | `#E8DEF8` |
| tertiary | `#7D5260` | `#EFB8C8` |
| tertiary-container | `#FFD8E4` | `#633B48` |
| error | `#B3261E` | `#F2B8B5` |
| error-container | `#F9DEDC` | `#8C1D18` |
| surface | `#FEF7FF` | `#141218` |
| on-surface | `#1D1B20` | `#E6E0E9` |
| surface-variant | `#E7E0EC` | `#49454F` |
| on-surface-variant | `#49454F` | `#CAC4D0` |
| outline | `#79747E` | `#938F99` |
| outline-variant | `#CAC4D0` | `#49454F` |
| surface-container-lowest | `#FFFFFF` | `#0F0D13` |
| surface-container-low | `#F7F2FA` | `#1D1B20` |
| surface-container | `#F3EDF7` | `#211F26` |
| surface-container-high | `#ECE6F0` | `#2B2930` |
| surface-container-highest | `#E6E0E9` | `#36343B` |
| inverse-surface | `#322F35` | `#E6E0E9` |
| inverse-on-surface | `#F5EFF7` | `#322F35` |

### 关键调色板（tone 10 / 20 / 30 / 40 / 80 / 90）

| 调色板 | 10 | 20 | 30 | 40 | 80 | 90 |
|---|---|---|---|---|---|---|
| primary | `#21005D` | `#381E72` | `#4F378B` | `#6750A4` | `#D0BCFF` | `#EADDFF` |
| secondary | `#1D192B` | `#332D41` | `#4A4458` | `#625B71` | `#CCC2DC` | `#E8DEF8` |
| tertiary | `#31111D` | `#492532` | `#633B48` | `#7D5260` | `#EFB8C8` | `#FFD8E4` |
| neutral | `#1D1B20` | `#322F35` | `#48464C` | `#605D64` | `#CAC5CD` | `#E6E0E9` |
| neutral-variant | `#1D1A22` | `#322F37` | `#49454F` | `#605D66` | `#CAC4D0` | `#E7E0EC` |
| error | `#410E0B` | `#601410` | `#8C1D18` | `#B3261E` | `#F2B8B5` | `#F9DEDC` |

### 面层规则

- surface 角色不与仰角绑定；浅色方案 surface = neutral tone 98（2023 由 99 调整），深色 surface = tone 6；neutral 调色板 chroma 由 4 调至 6（对齐系统 UI 色彩）。
- 面层集合：`surface-container-lowest → low →（默认）→ high → highest` 逐级"抬升"；`surface-dim` / `surface-bright` 供整屏明暗调节。
- 深色主题是方案的内建组成（低光环境），不是单独的设计。

### 交互态与状态层（States & state layers）

- **状态层（state layer）**：覆盖在容器之上、使用内容色（on 色）的半透明层，表达 hover / focus / press / drag 状态；同一时刻只允许一层。
- 不透明度：**hover 8% / focus 10% / press 10% / drag 16%**（官方指南现值）；disabled 状态层 38%。`md.sys.state` tokens（v0.192）中 focus / pressed 为 12%——项目实现按指南现值（见 `ADAPTATION.md`）。
- 状态层尺寸 40dp，交互目标（target）48dp——两者不同。
- 态语义：hover 低强调、淡入淡出；focus 高强调（Web 上为键盘焦点指示环）；press 高强调（涟漪）；drag 低强调。
- disabled：色彩与层级弱化，**不要求满足对比度**；不继承 hover / focus / press / drag。

## 字体（Typography）

字体族：**Roboto**（ref-typeface 的 plain / brand 均为 Roboto；字重 regular 400 / medium 500 / bold 700）。可变字体 Roboto Flex 用于更自由的编辑性表达（上游说明其尚未纳入 M3 型阶）。

### baseline 型阶（15 档）

| 样式 | 字号 / 行高（px） | 字距 | 字重 |
|---|---|---|---|
| display-large | 57 / 64 | -0.25px | 400 |
| display-medium | 45 / 52 | 0 | 400 |
| display-small | 36 / 44 | 0 | 400 |
| headline-large | 32 / 40 | 0 | 400 |
| headline-medium | 28 / 36 | 0 | 400 |
| headline-small | 24 / 32 | 0 | 400 |
| title-large | 22 / 28 | 0 | 400 |
| title-medium | 16 / 24 | +0.15px | 500 |
| title-small | 14 / 20 | +0.1px | 500 |
| body-large | 16 / 24 | +0.5px | 400 |
| body-medium | 14 / 20 | +0.25px | 400 |
| body-small | 12 / 16 | +0.4px | 400 |
| label-large | 14 / 20 | +0.1px | 500 |
| label-medium | 12 / 16 | +0.5px | 500 |
| label-small | 11 / 16 | +0.5px | 500 |

- 五类角色与尺寸范围：display（57–36）、headline（32–24）、title（22–14）、body（16–12）、label（14–11）。
- label 有 prominent 变体（bold 700）。
- 注：M3 Expressive 另增 15 档 emphasized 样式，不在本汇编内。

## 形状（Shape）

### 圆角标尺

| token | 值 | 典型用途 |
|---|---|---|
| corner-none | 0 | 直角 |
| corner-extra-small | 4px | 小元件 |
| corner-small | 8px | 芯片 / 菜单项等小容器 |
| corner-medium | 12px | 卡片等 medium 容器 |
| corner-large | 16px | 大卡片 / FAB |
| corner-extra-large | 28px | 大型面块（对话框、大容器） |
| corner-full | 9999px | 全圆角（按钮、芯片等 fully rounded） |

顶角 / 端角变体：`extra-small-top`（顶部 4px）、`large-top`（顶部 16px）、`extra-large-top`（顶部 28px）、`large-start` / `large-end`（单侧 16px）。

### 原则（官方指南）

- **形状是表达工具，不是语义**：不给某个形状赋予字面功能含义。
- **方 / 圆张力**：圆润为主旋律，可用直角形成对比、制造张力与记忆点。
- **抽象形状节制**：有理由才用；装饰性场景（图片裁切、头像遮罩）最自由。
- **形状与文字呼应**：与型阶共享圆润度视觉属性。
- **2.5D**：形状 + 动效可给 2D 图形体积感。
- 注：M3 Expressive 扩展形状库（35 形状、shape morph；large 20 / XL 32 / XXL 48）不在本汇编内。

## 层级（Elevation）

- 定义：两个表面在 z 轴上的距离（dp）。层级 = 0–5 共 6 级：**0 / 1 / 3 / 6 / 8 / 12 dp**。
- 表达：**tonal surface 色**（首选）或**阴影**（需要与背景分隔或提示可交互时）；token 只定义 dp，不含阴影与颜色——各平台自定。
- 静息 vs 交互：元素静息可处 0–3 级；**4 / 5 级保留给交互态**（hover / dragged）；hover 时层级 +1（如 FAB 3 → 4）。
- 约束：不改动组件默认层级；层级种类保持克制。

## 动效（Motion）

### 缓动（Easing）

| 曲线名 | 值 | 用途 |
|---|---|---|
| emphasized | `cubic-bezier(0.2, 0, 0, 1)` | 起止都在屏内；临时离场 |
| emphasized-decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 入场（起于峰值速度、柔和落定） |
| emphasized-accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 永久离场 |
| standard | `cubic-bezier(0.2, 0, 0, 1)` | 小型工具型过渡；不支持 emphasized 的平台兜底 |
| standard-decelerate | `cubic-bezier(0, 0, 0, 1)` | 标准集入场 |
| standard-accelerate | `cubic-bezier(0.3, 0, 1, 1)` | 标准集离场 |

（另有 legacy 集 `cubic-bezier(0.4, 0, 0.2, 1)` 等为旧版兼容，不在规范使用范围内。）

选型按"相对屏幕的运动"：起止均在屏内 / 临时离场 → emphasized；入场 → emphasized-decelerate；永久离场 → emphasized-accelerate。气质：快速起步、极柔和落地（比 M2 更长、更柔）。

### 建议配对（指南）

| 场景 | 缓动 | 时长 |
|---|---|---|
| 起止均在屏内 | emphasized | 500ms |
| 入场 | emphasized-decelerate | 400ms |
| 永久离场 | emphasized-accelerate | 200ms |
| 起止均在屏内（工具型） | standard | 300ms |
| 入场（工具型） | standard-decelerate | 250ms |
| 离场（工具型） | standard-accelerate | 200ms |

### 时长 token

| 档 | 值 |
|---|---|
| short1–4 | 50 / 100 / 150 / 200ms |
| medium1–4 | 250 / 300 / 350 / 400ms |
| long1–4 | 450 / 500 / 550 / 600ms |
| extra-long1–4 | 700 / 800 / 900 / 1000ms |

选时长：过渡面积越大时长越长；入场 / 持续比离场长（离场更快，注意力已移向下一任务）。

- 注：M3 Expressive 引入弹簧物理系统（springs）用于组件动效，官方建议迁移；缓动 + 时长系统仍用于过渡。本汇编按缓动 + 时长系统记载。

## 图标（Icons）

- **Material Symbols** 为默认图标集，三种风格：**outlined / rounded / sharp**（legacy Material Icons 无可变字体能力）。
- 可变字体四轴：
  - **weight** 100–700（常规 400；24dp 图标最低 200）；
  - **fill** 0–1（可表达选中 / 过渡态）；
  - **grade**：比 weight 更细的粗细微调；补偿"视觉渗出"（浅色底上的深色图标默认 0，深色底上的浅色图标默认 -25）；
  - **optical size** 20–48dp：随尺寸自动调整描边，避免放大后过重。
- 与文字搭配：同尺寸、同视觉重量；符号基线相对文字下移 ≈ 文字的 11.5%。
- 无障碍：图标优先配文字标签；<20dp 或含义复杂 / 承载关键动作的符号必须有标签；24dp 符号默认 48dp 触控目标，20dp 符号 40dp；鼠标键盘为主的界面可压缩。

## 布局（Layout）

- **窗口尺寸类**（window size classes，五种）：compact < 600dp；medium 600–839dp；expanded 840–1199dp；large 1200–1599dp；extra-large ≥ 1600dp；布局按尺寸类分别设计。
- **边距（margin）**：每类窗口定义固定或缩放值；屏幕越大可用越大边距。
- **间隔（spacer）**：双窗格之间 24dp。
- **内间距（padding）**：以 4dp 递增。
- **分组**：显式（描边 / 分隔线 / 阴影）与隐式（邻近性 + 留白）。
- 新布局从 canonical layout 出发（上游 2023 后口径），不鼓励从栅格起步。
- 术语：pane（窗格）/ column / margin / spacer / drag handle / fold。

## 无障碍（Accessibility）

- **对比度**：以 WCAG AA 为底线（正文 ≥ 4.5:1，大字与图形 ≥ 3:1）。M3 的色彩角色算法内建可访问配对；对比度分三档（标准 / 中等 / 高）供用户选择；**disabled 豁免对比度要求**（上游明确）。
- **焦点**：所有可交互元素有聚焦态；Web 端使用键盘焦点指示环（focus ring）；聚焦叠加更高强调的状态层。
- **触控目标**：24dp 符号 → 48dp 目标；20dp → 40dp；状态层 40dp ≠ 目标 48dp。
- **图标语义**：图标配标签；小尺寸 / 复杂图标必须配标签。

## 内容（Content）

- **大小写**：sentence case——标题、标题行、标签、菜单、按钮等一律句首大写（专有名词除外）。
- **扫描友好**：用具体、描述性的标题与子标题分组信息。
- **后果表达**：以中性、直接的语言说明操作结果（含如何撤销）；不恐吓、不说教。
- **缩写克制**：能写全就写全；避免 e.g. / etc. 等拉丁缩写。

---

## 来源与许可（Sources & License）

> 整合自以下 Google 官方开放来源。2026-10-11 获取；本汇编为自有行文整合、非逐字快照；整合完成即冻结。
> 许可全文（CC BY 4.0 + Apache-2.0）见同目录 `SOURCE-LICENSE.txt`。

**A. m3.material.io（官方指南正文；CC BY 4.0，© Google LLC）** — 前缀 `https://m3.material.io/`：

| 本规范章节 | 来源页面 |
|---|---|
| 设计意图 / 许可声明 | `get-started` |
| 色彩（角色 / dynamic color / 对比度档 / fixed 色 / tonal 面层沿革） | `styles/color/system/overview` |
| 交互态与状态层 | `foundations/interaction/states/applying-states`、`foundations/interaction/states/state-layers` |
| 字体（五角色 / 15+15 档说明 / Roboto Flex 边界） | `styles/typography/overview` |
| 形状（原则 / Expressive 边界） | `styles/shape/overview-principles` |
| 层级 | `styles/elevation/overview` |
| 动效（缓动 / 时长 / 配对 / 选型） | `styles/motion/easing-and-duration` |
| 图标（风格 / 四轴 / 搭配 / 目标尺寸） | `styles/icons/applying-icons` |
| 布局（尺寸类 / margin / spacer / padding / 分组） | `foundations/layout/understanding-layout/overview`、`foundations/layout/understanding-layout/spacing` |
| 内容 | `foundations/content-design/style-guide` |

**B. material-components/material-web（token 数值；Apache-2.0，Copyright 2018–2023 Google, Inc.）** — 前缀 `https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/`：

| 数据 | 来源文件 |
|---|---|
| 色板 tone 值 | `_md-ref-palette.scss` |
| 色彩角色 → tone 映射（浅 / 深） | `_md-sys-color.scss` |
| 型阶数值 / 字重 / 字族 | `_md-sys-typescale.scss`、`_md-ref-typeface.scss` |
| 圆角值 | `_md-sys-shape.scss` |
| 层级 dp 值 | `_md-sys-elevation.scss` |
| 动效时长 / 缓动值 | `_md-sys-motion.scss` |
| 状态层不透明度 | `_md-sys-state.scss` |

**C. google/material-design-icons（vendored 图标 SVG；Apache-2.0）**：

| 资产 | 来源路径（`https://github.com/google/material-design-icons/`） |
|---|---|
| `assets/mail_24px.svg`、`assets/arrow_outward_24px.svg` | `symbols/web/{mail,arrow_outward}/materialsymbolsoutlined/*_24px.svg` |

整合声明：本规范非 Google 官方发布；不使用 Google / Material 商标资产（logo、wordmark），"Material 3" 仅作指示性描述；引用仅限规则性短句与事实性数据。项目侧适配（字体打包、图标接入、阴影配方、深浅双模等）记录于 `docs/designs/material3/ADAPTATION.md`。