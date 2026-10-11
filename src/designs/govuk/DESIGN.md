# GOV.UK Design System — 官方文档汇编（GOV.UK Design System）

> 本规范是 GOV.UK Design System 官方指南（design-system.service.gov.uk，OGL v3）与官方源码 govuk-frontend（MIT，© Crown copyright / GDS）的**整合汇编**（`source.type: official-docs-derived`）。
> 自有行文组织，不移植上游原文长段；仅规则性短句与事实性数据（token 名 / 数值 / 表格）保留并逐节标注来源。
> 2026-10-11 整合完成即冻结（按当日上游「2025 品牌刷新」后的现行状态）；上游更新不触发修订（跟随上游 = 新一次整合，记 changelog）。
> 本文件只读；项目实现的适配与偏差见 `docs/designs/govuk/ADAPTATION.md`；逐节来源与许可见文末附录。
> 整合范围：色彩 / 字体与型阶 / 布局 / 间距 / 形状与边框 / 层级 / 焦点与交互态 / 本页采用组件（button、tag、inset text、summary list、header、footer、links 等）/ 无障碍。GDS Transport 字体、皇家纹章与官方标识资产不在使用范围（见 ADAPTATION）。

## 设计意图（Design intent）

一套**公共服务的"内容优先"语言**：让服务一眼可被信任、任何人（设备与能力各异）都能使用；装饰被系统性排除，颜色只承担识别与状态。

- **内容第一**：没有阴影、渐变、圆角与装饰图形；版面由文字、1px 分隔线与粗左侧边框构成。
- **可预期的识别**：页眉品牌蓝幅、黄黑焦点、绿按钮、蓝标签——每个功能色都绑定固定用途（上游明确"不要直接复制 hex，用功能色函数"）。
- **直角与实体感**：全系统直角（border-radius 为 0；tag 为 1px 例外）；按钮以下缘 2px 硬阴影与按压位移制造"实体按键"触感，取代投影层次。
- **两个硬性承诺**：对比度达到 WCAG 2.2 AA；焦点状态在任意背景上都醒目（黄 + 黑组合）。
- **可读性基线**：正文 19px / 行高 25px，行宽 ≤75 字符；移动优先、单列起步。

## 色彩（Color）

### 功能色（functional colours，现行 2026-10-11）

上游以用途绑定颜色（"functional colours"）：**不要按 hex 使用，按语义使用**。

| 用途 | 值 |
|---|---|
| brand | `#1D70B8` |
| text | `#0B0C0C` |
| secondary-text | `#484949` |
| inverse-text | `#FFFFFF` |
| link | `#1A65A6` |
| link-hover | `#0F385C` |
| link-visited | `#54319F` |
| link-active | `#0B0C0C` |
| border | `#CECECE` |
| input-border | `#0B0C0C` |
| hover | `#CECECE` |
| focus | `#FFDD00` |
| focus-text | `#0B0C0C` |
| error | `#CA3535` |
| success | `#0F7A52` |
| template-background | `#F4F8FB` |
| body-background | `#FFFFFF` |
| surface-background | `#F4F8FB` |
| surface-text | `#0B0C0C` |
| surface-border | `#8EB8DC` |

### 网络调色板（GOV.UK web palette）

11 个色组，每组含 primary /  tints（25/50/80/95）/ shades（25/50）。关键组全变体：

| 组 | primary | tint-25 | tint-50 | tint-80 | tint-95 | shade-25 | shade-50 |
|---|---|---|---|---|---|---|---|
| blue | `#1D70B8` | `#5694CA` | `#8EB8DC` | `#D2E2F1` | `#F4F8FB` | `#16548A` | `#0F385C` |
| green | `#0F7A52` | `#4B9B7D` | `#87BCA8` | `#CFE4DC` | `#F3F8F6` | `#0B5C3E` | `#083D29` |
| red | `#CA3535` | `#D76868` | `#E59A9A` | `#F4D7D7` | `#FCF5F5` | `#982828` | `#651B1B` |
| yellow | `#FFDD00` | `#FFE640` | `#FFEE80` | `#FFF8CC` | `#FFFDF2` | `#BFA600` | `#806F00` |
| black | `#0B0C0C` | `#484949` | `#858686` | `#CECECE` | `#F3F3F3` | — | — |

其余组 primary：teal `#158187`（另有 accent `#00FFE0`）、purple `#54319F`、magenta `#CA357C`、orange `#F47738`、brown `#99704A`；white `#FFFFFF`。

### 规则

- **对比度**：文字与交互元素须满足 WCAG 2.2 AA（1.4.3）；焦点状态以「黄 + 黑」组合在任意背景满足 1.4.11（黄对深底、黑对浅底）。
- 功能色与调色板分工：组件按下表语义取色；调色板用于插图与自定义组件的辅助元素。

## 字体与型阶（Typography）

**字体：GDS Transport**（官方品牌字体，仅 GOV.UK 服务可用；回退 `arial, sans-serif`）。权重仅 regular 400 与 bold 700；根字号 16px（rem 基准）。

### 响应式型阶（px；mobile → tablet）

| 档 | mobile | tablet | 用途 |
|---|---|---|---|
| 80 | 53 / 55 | 80 / 80 | 超大头版（本汇编最上限） |
| 48 | 32 / 35 | 48 / 50 | h1（heading-xl） |
| 36 | 27 / 30 | 36 / 40 | h2（heading-l） |
| 27 | 21 / 25 | 27 / 30 | caption-xl |
| 24 | 21 / 25 | 24 / 30 | h3（heading-m）、body-l、start 按钮 |
| 19 | 19 / 25 | 19 / 25 | **正文基线**（body-m）、标签、按钮、表格 |
| 16 | 16 / 20 | 16 / 20 | 小字（body-s、页眉/页脚基础） |

（line-height 以像素给出，输出为相对值；行宽建议 ≤75 字符，二分之三栏布局。）

## 布局（Layout）

- **页面宽度**：默认最大 1020px（内容 960px + 两侧各 30px 边距）；移动边距 15px（gutter 的一半）。
- **移动优先、单列起步**；桌面推荐"two-thirds"（2/3 栏）或"2/3 + 1/3"布局控制行宽。
- **网格**：1/4、1/3、1/2、2/3、3/4、full 六档；gutter **30px**。
- 主内容容器与页眉/页脚的通栏背景分离（背景通栏、内容居中）。

## 间距（Spacing）

单值标尺（`govuk-spacing`）：**0 / 5 / 10 / 15 / 20 / 25 / 30 / 40 / 50 / 60**（points 0–9）。

响应式标尺（mobile → tablet 整阶跳档）：point4 15→20；point5 15→25；point6 20→30；point7 25→40；point8 30→50；point9 40→60。所有区块间距、组件内边距与页边距均取自该标尺。

## 形状与边框（Shape & Borders）

- **直角**：全系统 border-radius **0**；唯一例外是 tag（1px）。
- **无投影**：层次不用 box-shadow（按钮下缘 2px 硬阴影是"按键实体"签名，不是 elevation）。
- 边框标尺：standard **5px** / wide **10px**（inset text 左界）/ narrow **4px** / form element **2px**；焦点宽 **3px**。

## 层级（Depth）

无 elevation 层级系统；层次只由：1px 分隔线（`#CECECE`）、粗左边框面块、通栏色幅（蓝页眉 / 浅蓝页脚）与留白表达。

## 焦点（Focus）

三种焦点样式（上游 mixin 对应）：

| 场景 | 实现 |
|---|---|
| 文本 / 链接（focused-text） | `outline: 3px solid transparent`；黄底 `#FFDD00` + 黑字 `#0B0C0C`；`box-shadow: 0 -2px 黄, 0 4px 黑`（黑为"下划线"）；去下划线 |
| 内容块（focused-box） | `box-shadow: 0 0 0 4px 黄, 0 0 0 8px 黑` |
| 表单输入（focused-form-input） | 3px 黄色 outline（offset 0）+ 内 shadow 加粗至 input-border 黑 |

链接装饰：下划线 `max(1px, .0625rem)`、offset `0.1578em`；**hover 加粗到 `max(3px, .1875rem, .12em)` 并关闭 ink-skip**。hover 色 `#0F385C`，visited `#54319F`，active 黑。

## 本页采用的组件（Components used）

（个人主页不引入组件库；以下为按上游数值手写的复刻范围。）

### Button（govuk-button）
- 绿底 `#0F7A52` 白字；19px / 行高 19px；直角；padding 8px 10px 7px；`box-shadow: 0 2px 0 #083D29`。
- hover：`#0B5C3E`；`:active`：整体下移 2px（压入阴影，唯一动效）；focus：非悬停时黄底黑字 + 黑 2px 底阴影，否则黄边 + 内 1px 黄描边；移动端按钮全宽、桌面 auto。
- start 变体：24px bold（本页不使用箭头图标资产）。

### Tag（govuk-tag）
- 语义 = **状态**（非交互，不用于链接/按钮）；渲染为 `<strong>`：19px bold、句子大小写。
- 默认蓝：字 `blue shade-50 #0F385C`、底 `blue tint-80 #D2E2F1`；padding 2px 8px 3px；radius 1px；上下负外边距（不撑大行距）；最大宽 160px。
- 色组变体：green / purple / red / orange / teal / magenta 同构（shade-50 字 + tint-80 底）；yellow 用 orange shade-50 字 + yellow tint-50 底；grey 用黑字 + black tint-80 底。

### Inset text（govuk-inset-text）
- 左侧 **10px** 边框（`border #CECECE`）+ 15px 内边距；text 色；上/下 20→30px（响应式 point6）。

### Summary list（govuk-summary-list）
- 行底边 1px `#CECECE`；桌面为 table：单元格 padding 10px 20px 10px（右 20px），key 占 30% 且 bold；移动端行块状堆叠（行距 15px、key 下 5px）。
- summary card 变体：1px `#CECECE` 外框；标题条底 `black tint-95 #F3F3F3`。

### Header / Footer
- Header：**brand 蓝 `#1D70B8` 通栏**（2025 刷新的现行口径）+ 白字；品牌链接 30px、hover 下划线 3px（进场下移 3px 抵消）、focus 黄底黑字；容器竖向 padding 16px / 12px。
- Footer：**10px brand 蓝顶边** + `surface-background #F4F8FB` 底 + `surface-text` 文本（19px）；内部 1px `surface-border #8EB8DC` 分隔。

### Links / Skip link
- 正文链接：蓝 `#1A65A6` 常显下划线（hover 加粗、visited 紫）——下划线是链接的默认外观而非可选装饰。
- Skip link：默认移出可视区；聚焦时出现在页首，采用焦点文本样式（黄底黑字）。

## 无障碍（Accessibility）

- **WCAG 2.2 AA 为明文硬性要求**（上游指南：文本与交互元素对比度达标）。
- 焦点永远可见（黄黑组合在任意背景醒目）；不使用 outline: none 类处理。
- 分词与行宽：19px/25px 正文、≤75 字符行宽、移动优先。
- 语义标记与键盘路径遵循原生元素（button 用按钮语义、tag 是 strong 不是按钮）。

## 内容（Content）

本汇编不展开内容与写作风格（属 GDS 写作指南与内容设计范畴，不在当前整合范围）；页面文案按项目契约（核心字段必须渲染）与既有示例资料。

---

## 来源与许可（Sources & License）

> 整合自以下 GOV.UK 官方开放来源。2026-10-11 获取；本汇编为自有行文整合、非逐字快照；整合完成即冻结。
> 许可全文（OGL v3 + MIT）与 OGL 署名句式见同目录 `SOURCE-LICENSE.txt`。

**A. GOV.UK Design System 官方指南（OGL v3，© Crown copyright）** — 前缀 `https://design-system.service.gov.uk/`：

| 本规范章节 | 来源页面 |
|---|---|
| 色彩（功能色 / 调色板 / 对比度要求 / 使用规则） | `styles/colour/` |
| 字体与型阶（字体回退、标题/段落用法） | `styles/typography/` |
| 布局（1020 / 960 宽容器、二分之三栏、75 字符） | `styles/layout/` |
| 焦点（黄黑双色焦点与三种场景） | `get-started/focus-states/` |
| Tag（语义、句子大小写、`<strong>` 渲染） | `components/tag/` |

**B. govuk-frontend 源码数值（MIT，Copyright (C) 2017 Crown Copyright, Government Digital Service）** — 前缀 `https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/`：

| 数据 | 来源文件 |
|---|---|
| 功能色映射 | `settings/_colours-functional.scss` |
| 调色板与变体 | `settings/_colours-palette--internal.scss` |
| 字族 / 权重 | `settings/_typography-font.scss` |
| 响应式型阶 | `settings/_typography-responsive.scss` |
| 页面宽度 / 边框 / 焦点宽 | `settings/_measurements.scss` |
| 间距标尺（单值 / 响应式） | `settings/_spacing.scss` |
| 链接装饰（厚度 / offset / hover） | `settings/_links.scss`、`helpers/_links.scss` |
| 焦点三式 | `helpers/_focused.scss` |
| 标题与段落 | `core/_typography.mixin.scss` |
| Button | `components/button/_mixin.scss`、`components/button/_settings.scss` |
| Tag | `components/tag/_mixin.scss` |
| Inset text / Summary list | `components/inset-text/_mixin.scss`、`components/summary-list/_mixin.scss` |
| Header / Footer / Generic header | `components/header/_mixin.scss`、`components/footer/_mixin.scss`、`components/generic-header/_mixin.scss` |

整合声明：本规范非 GOV.UK 官方发布；未使用皇家纹章、政府徽标或 GOV.UK 标识（OGL v3 明确豁免 logos / crests / Royal Arms；含非背书条款）。署名：**Contains public sector information licensed under the Open Government Licence v3.0.** 项目侧适配（字体回退、手写组件、单模式浅色、静态动效取舍等）记录于 `docs/designs/govuk/ADAPTATION.md`。