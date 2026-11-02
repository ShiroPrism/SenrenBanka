# 下一批风格扩展 — 技术设计

> 父任务技术设计。三套设计共享契约与验证口径；各子任务在自己的 `design.md` 里展开实现细节。本文件只定边界、数据流、共享决策与风险。

## 0. 设计原则

1. **三条新轴，不是三套换色**：Aero 补 2000s 时代轴，Transit 补信息姿态/环境图形轴，Zine 补 Riso 材料/态度轴。
2. **不新增运行时**：纯 CSS + 共享 Reveal；无设计专属 JS、无第三方图标库、无图片、无新字体。
3. **不改共享机制**：设计目录存在即注册；路由、菜单、Reveal、字体管线、数据加载均复用现状。
4. **每套先写规范再实现**：`DESIGN.md` 是唯一设计源；实现与规范不一致时先改规范。
5. **可回滚**：每套设计是独立目录；失败时删除该目录与验证记录即可，不影响现有 27 套。

## 1. 架构与文件布局

每套设计一个独立目录，遵循 `docs/rules/design-contract.md`：

```text
src/designs/<id>/
  DESIGN.md          # 设计规范（隐喻、色板、字体、版式、组件、动效、响应式、无障碍、映射、Do/Don't、验证）
  design.json        # displayName / description / enabled / locales / accent / source
  Page.astro         # 完整文档；<HeadMeta>、共享 <ContextMenu>、<Reveal>、<Font>
  messages.ts        # 5 语言界面文案；纯数据，不 import CSS/Page
  style.css          # 入口：@import "tailwindcss" source(none); @source "./"; @source not "./Preview.astro";
  tokens.css         # 可选但三套都提供；:is(.id, .id-pv) 命名空间，禁止 :root
  Preview.astro      # 自包含切换页缩略；不 import style.css，无可聚焦元素
```

- 新目录会被 `src/designs/registry.ts` 的 `import.meta.glob('./*/design.json')` 自动发现；`astro.config.mjs` 按目录注入 `/<locale.path>/<id>` 路由。**不需要改共享注册表或路由**。
- `enabledDesigns` 进入切换页；`Preview.astro` 缺失时回退 accent 色点，但三套都提供预览。
- 页面数据只用 `loadDesignView('<id>', Astro.url.pathname)`；不自行解析 locale、不读文件路径。
- 内部链接统一 `withBase()` / `localeHref()` / `localeDesignHref()`；外部资料链接直接使用 `link.url`。

## 2. 共享契约

| 契约 | 要求 |
|---|---|
| 渲染模式 | `styled`；必须有 `style.css` |
| 字体 | 只用现有 npm/local family；不新增字体文件；CJK 核心变量必须保留在每个字体栈 |
| 图片 | 不新增；纹理用 CSS，图标用内联 SVG/Unicode |
| JS | 无设计专属 JS；只使用共享 `Reveal` |
| 菜单 | `<ContextMenu config={view.contextMenu} />` 无条件渲染；设计内不再放切换入口 |
| 可见性 | 内容默认可见；隐藏态只由 `html[data-reveal-ready]` 门控 |
| CSS 隔离 | `style.css` 只 `@source "./"`；不 import 共享 CSS；`tokens.css` 不用 `:root` |
| 链接 | 内部链接必须经 `withBase()` / locale 辅助函数；禁止硬编码绝对路径 |
| 资料 | `name` / `headline` / `bio` / `links` 必须渲染；不虚构个人事实 |
| 语言 | 5 个 locale 全部有 `messages.ts` 键；`design.json.locales` 全量声明 |
| 体积 | 不新增字体/图片；新增 3 套后 dist 目标 ≤ 8.2 MiB，硬门禁 10 MiB |

### 2.1 字体路由

- 三套都复用现有 family，不新增 `@font-face`。
- 拉丁角色：
  - Aero：`Inter`（正文）+ `Fredoka`（展示/编号）+ `Roboto Flex`（可选，替代 Inter 的展示位）
  - Transit：`Inter` / `Roboto Flex`（正文与展示）+ `JetBrains Mono`（站码/时刻）
  - Zine：`League Gothic` / `Blackout`（masthead）+ `Courier Prime`（标签）+ `Handjet` / `UglyTypist`（手写点缀）
- CJK：优先使用现有核心 `Zhuque Fangsong` / `LXGW WenKai` / `Ark Pixel`，保证简中/日文覆盖；`zh-TW` 可用 `Noto Sans TC` / `Noto Serif TC` / `LXGW WenKai TC`，`ko` 可用 `Gothic A1` / `Gowun Batang` / `Dongle`。每个字体栈必须保留核心 CJK 变量，系统 CJK 排在核心变量之后。
- Aero 的 CJK 若用 sans（`Noto Sans TC` / `Gothic A1`），仍需保留 `Zhuque`/`LXGW` 作为缺字回退；不为了纯 sans 外观新增简体 sans CJK。
- 最终角色在子任务 `DESIGN.md` 的「六项记录」中锁定，并跑 `npm run fonts:typography` / `fonts:coverage`。

### 2.2 动效

- 只动 `opacity` / `transform`；交互态允许颜色/下划线过渡。
- 入场动画包在 `@media (prefers-reduced-motion: no-preference)`；减动态关闭位移/动画，内容可见。
- 不使用 `filter` / `clip-path` 动画；静态 `clip-path` 只做形状，不参与动画。
- 不做无限循环、滚动劫持、光标替换、自动播放声音、逐字打印。
- 每套只允许一个小范围、有视觉价值的持续装饰（若有），必须在 `DESIGN.md` 论证；默认不做。

### 2.3 无障碍与响应式

- 每页唯一 `h1` = 姓名；分区 `h2`；卡片标题 `h3`；不跳级。
- 每个 `<section>` 有 `aria-labelledby` 指向可见标题。
- 装饰（气泡、线路装饰、印章、胶带、编号）一律 `aria-hidden` 或伪元素；链接可访问名只由文本承担。
- 焦点环 2px + offset，颜色对相邻底色 ≥3:1；触控目标 ≥44px（Aero/Transit 建议 48px）。
- 正文对比 ≥4.5:1；大字号 ≥3:1；非文字线条 ≥3:1；不以颜色单独传达状态。
- 375px 无横向滚动；长 URL/长词 `overflow-wrap: anywhere`；图表/线路在窄屏重排为纵向。
- 响应式断点沿用项目口径：≥1024 桌面、761–1023 平板、≤760 手机、375 最小验证。

## 3. Aero — 2000s 科技乐观

### 3.1 隐喻

不是 90s 个人主页，也不是 Apple 玻璃。它是 **2007 年一台个人设备刚开机时的桌面**：明亮天空、草绿色、白色塑料与玻璃、凝胶按钮、气泡和镜头光晕；信息像窗口和图标一样被摆在一个友好的设备面板里。

必须与 `homepage99`（90s 表格/像素/彩虹）和 `frost`（Apple HIG 毛玻璃/系统色）区分：Aero 用**饱和天蓝/草绿 + 强高光 + 凝胶质感 + 自然元素**，不靠大面积模糊。

### 3.2 色板（候选，实施时实测登记）

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--ae-sky` | `#bfe9ff` | 页面天空底 | 墨 `#123247` **10.37:1** |
| `--ae-sky-deep` | `#0f6f9e` | 深色玻璃/状态条 | 白 `#f7fdff` **5.40:1** |
| `--ae-grass` | `#7fcf6a` | 草绿强调面 | 墨 **7.02:1** |
| `--ae-paper` | `#f7fdff` | 窗口/卡片底 | 墨 **13.00:1** |
| `--ae-ink` | `#123247` | 主文字 | 天空 **10.37:1**；纸白 **13.00:1** |
| `--ae-ink-soft` | `#2c536b` | 次级正文 | 天空约 **6.3:1**（实施时复算） |
| `--ae-accent` | `#2f9fe0` | 签名天空蓝/装饰 | 不承载正文 |
| `--ae-accent-ink` | `#0b6fa4` | 链接/焦点环 | 纸白 **5.35:1** |
| `--ae-gloss` | `linear-gradient(...)` | 凝胶高光 | 装饰 |

- 正文只用 `--ae-ink` / `--ae-ink-soft`；白色只用于深色底上的大字号/按钮，且实测 ≥4.5:1。
- 天空蓝/草绿不单独承载链接或状态；链接始终带下划线或文字标签。
- 任何新增色值先算对比度并登记到 `DESIGN.md` 色板表。

### 3.3 版式与组件

- `--ae-shell: 74rem`；页面背景为天空渐变 + 两枚极淡径向高光；不铺位图。
- 顶部状态条：设备名/地点/时间感标签；等宽小字，深色底。
- Hero：设备面板（24–32px 圆角、内高光、外阴影）+ 姓名（h1）+ headline + 一枚玻璃球装饰（`aria-hidden`）。
- links：桌面图标网格/工具栏；每个链接是 44px+ 的凝胶按钮，带文字标签。
- projects：窗口卡片（标题栏 + 内容区 + 三个装饰点，`aria-hidden`）；不伪造可交互窗口控件。
- experience：系统时间线；skills：功能徽章；contact：发送消息面板；缺失时整块不渲染。
- 装饰：气泡、镜头光晕、玻璃球只用 CSS 径向渐变；全部 `aria-hidden`。

### 3.4 动效

- 开机：状态条淡入 + 面板 `translateY(10px) → 0`，700ms，只播一次。
- 图标/窗口：`opacity + translateY` 520ms，错落 60ms，上限 3 个。
- 气泡：一次性上浮 8px + 淡出，或完全静止；不做无限漂浮。
- 交互：凝胶按钮 hover 高光位移 2px、active 压回；只动 transform/颜色。
- 减动态：全部关闭，内容直接可见。

### 3.5 内容映射

| 字段 | 角色 | 呈现 |
|---|---|---|
| `name` | 设备名/开机标识 | `h1` + 状态条 |
| `headline` | 产品标语 | Hero 副题 |
| `bio` | About this device | 面板正文 |
| `links` | 桌面图标/工具栏 | 凝胶按钮组 |
| `projects` | 窗口/相册 | 窗口卡片 |
| `experience` | 系统时间线 | 时间线 |
| `skills` | 功能徽章 | 徽章 |
| `contact` | 发送消息 | 消息面板 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 状态条地点 | 缺失时省略 |

### 3.6 风险

- 低对比光泽：正文永远放在实色/高不透明底上；渐变只做背景。
- 滑向 `frost`：限制 `backdrop-filter` 使用；用高光/饱和色/自然元素建立差异。
- 滑向 `homepage99`：不用表格边框、像素字、彩虹分隔线、闪烁 GIF 语汇。
- 商标：不用 Windows/Apple 商标、真实系统截图、开始菜单/任务栏复刻。
- 伪交互：窗口装饰点、状态条不得看起来像可点击控件；不加入 focusable 假按钮。

## 4. Transit — 交通导视

### 4.1 隐喻

不是政务网页，也不是工业仪表。它是 **一张城市轨道网络图 + 站台导视**：线路色带、站点圆点、换乘节点、方向箭头、站台牌和时刻表。个人资料被组织成一张可读的网络。

必须与 `govuk`（政务表单/蓝幅/黄 focus）和 `oxide`（深色工业 HUD/ASCII）区分：Transit 是**浅色环境图形**，靠线路、站点、方向和信息层级，不靠暗色面板或数据仪表。

### 4.2 色板（候选，实施时实测登记）

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--tr-paper` | `#f5f4ef` | 页面底 | 墨 **16.80:1** |
| `--tr-ink` | `#101418` | 主文字 | 纸 **16.80:1** |
| `--tr-ink-soft` | `#3b4248` | 次级正文 | 纸约 **10:1**（实施时复算） |
| `--tr-muted` | `#5d646b` | 弱化标签 | 纸约 **6:1**（实施时复算） |
| `--tr-line` | `#0b7a5c` | 主线（绿） | 纸 **4.82:1**；白字 **5.31:1** |
| `--tr-line-2` | `#d7263d` | 第二线（红） | 纸 **4.50:1**；白字 **4.96:1** |
| `--tr-line-3` | `#f2b705` | 第三线（黄） | 纸约 **1.9:1**，**只做非文字** |
| `--tr-rule` | `#c9c7bd` | 网格/分隔线 | 装饰，≥3:1 非文字 |

- 线路色只用于色带/圆点/边框；正文与线路名用 ink。
- 黄色线永不承载文字；线路名/编号始终可见。
- 白字 on 线路色只用于 ≥18.66px bold 或 ≥24px 大字号；小字用 ink on paper。

### 4.3 版式与组件

- `--tr-shell: 72rem`；页面为浅色网格纸 + 1px 线路骨架。
- 顶部网络条：线路徽章 + 终点站 + 地点/日期；线路徽章用色带 + 白字/ink 字。
- Hero：姓名作为“线路名/终点站”（h1），headline 作为服务说明，bio 作为网络公告。
- links：线路/换乘列表；每个链接有线路色块 + 线路名 + 方向箭头。
- projects：站点卡片（站点码 + 标题 + 描述 + 标签）；experience：时刻表（机构/角色/期间）；skills：线路徽章；contact：售票处。
- Pictogram：少量自绘内联 SVG（列车、换乘、出口、信息），24px、2px stroke、`currentColor`；装饰性图标 `aria-hidden`，有语义的图标配文字标签。
- 线路图：用 CSS grid + 伪元素画线路；装饰性线路 `aria-hidden`，站点信息用真实列表/表格承载。

### 4.4 动效

- 线路展开：伪元素 `scaleX(0) → 1`，600ms，只播一次；不用 `stroke-dashoffset`（违反只动 opacity/transform 的约束）。
- 站点点亮：`opacity 0 → 1` + `scale(.8) → 1`，240ms，错落 40ms。
- 时刻表：行淡入，180ms；不做翻牌无限循环。
- 交互：链接 hover 只变颜色/下划线；线路色块不弹跳。
- 减动态：线路直接显示，站点点亮关闭。

### 4.5 内容映射

| 字段 | 角色 | 呈现 |
|---|---|---|
| `name` | 线路/终点站 | `h1` + 网络条 |
| `headline` | 服务说明 | Hero 副题 |
| `bio` | 网络公告 | 公告板 |
| `links` | 线路/换乘 | 线路列表 |
| `projects` | 站点 | 站点卡片 |
| `experience` | 时刻表 | 表格 |
| `skills` | 线路徽章 | 徽章 |
| `contact` | 售票处 | 联系面板 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 网络条地点 | 缺失时省略 |

### 4.6 风险

- 图标依赖：只用少量自绘 SVG/几何符号；不引入整套图标库；图标必须有文字标签或 `aria-hidden`。
- 滑向 dashboard：不做图表、KPI、数据卡片；线路图是导航隐喻，不是数据可视化。
- 颜色单载：线路色必须配线路名/编号；色盲安全。
- 窄屏：线路图在 ≤760px 改为纵向线路，不能横向滚动；触控 ≥44px。
- 商标：不伪造真实地铁/公交机构品牌、线路编号或 Logo。

## 5. Zine — Riso / 复印朋克

### 5.1 隐喻

不是丝网印刷海报，也不是热敏小票。它是一本 ** photocopied 地下小杂志**：2–3 个专色、错位套印、颗粒、低墨条纹、剪贴标题、手写圈注、胶带和邮购回执。信息可以粗糙，但阅读顺序必须清楚。

必须与 `poster`（丝网印刷/套准标记/巨幅窄体）、`receipt`（热敏纸/点引导线/段码）、`fax` / `tape`（硬件）区分：Zine 是**复印/错版/剪贴**，不是干净的印刷品或设备外壳。

### 5.2 色板（候选，实施时实测登记）

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--zn-paper` | `#f3efe6` | 纸底 | 墨 **16.46:1** |
| `--zn-ink` | `#111111` | 主文字 | 纸 **16.46:1** |
| `--zn-ink-soft` | `#2b2b2b` | 次级正文 | 纸约 **13:1**（实施时复算） |
| `--zn-red` | `#ff3b5c` | 荧光红：装饰/大面积专色 | 纸 **3.03:1**，**只做装饰/大字** |
| `--zn-red-ink` | `#c81e3a` | 深红：链接/小字 | 纸 **4.94:1**；白字 **5.67:1** |
| `--zn-blue` | `#1f4bff` | 第二专色：装饰/链接 | 纸 **5.22:1** |
| `--zn-pink` | `#ff8fb1` | 可选第三专色：装饰 | 只做装饰 |

- 荧光红/粉永远不写正文；正文用 `--zn-ink`。
- 深红可做链接/小字（4.94:1）；蓝色可做链接（5.22:1），但同页只保留一个链接色。
- 任何新增色值先算对比度并登记。

### 5.3 版式与组件

- `--zn-sheet: 72rem`；纸底 + 复印条纹 + 颗粒；页面像一张对折的 zine。
- Masthead：刊名（姓名）+ 期号 + 地点/日期；`League Gothic`/`Blackout`。
- Cover line：headline；Manifesto：bio；Classifieds：links；Spreads：projects；Contributor notes：experience；Stamps：skills；Mail-in coupon：contact。
- 错位套印：标题/标签用 1–2px 偏移的伪元素或 text-shadow 做第二色；不复制正文。
- 剪贴/胶带：静态 `clip-path` 或伪元素色块；不新增图片。
- 复印条纹：`repeating-linear-gradient` 低透明度；颗粒：多层 radial-gradient 或 CSS noise（无位图）。
- 手写圈注：`Handjet` / `UglyTypist` 少量用于标签；不用于长文。

### 5.4 动效

- 印章落下：`scale(1.25) rotate(-4deg) → scale(1) rotate(-2deg)`，180ms，`steps(2, end)`，只播一次。
- 复印扫描：一条低透明度色带 `translateX` 一次，300ms；不无限循环。
- 滚动显现：共享 Reveal，180–240ms，位移 ≤12px；卡片错落 40–60ms。
- 交互：链接 hover 只变颜色/下划线；不做抖动/闪烁。
- 减动态：印章不旋转、扫描带隐藏，内容可见。

### 5.5 内容映射

| 字段 | 角色 | 呈现 |
|---|---|---|
| `name` | Masthead 刊名 | `h1` |
| `headline` | Cover line | 封面副题 |
| `bio` | Manifesto | 宣言块 |
| `links` | Classifieds | 分类广告列表 |
| `projects` | Spreads | 跨页卡片 |
| `experience` | Contributor notes | 贡献者注记 |
| `skills` | Stamps | 印章/标签 |
| `contact` | Mail-in coupon | 邮购回执 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 期号/地点行 | 缺失时省略 |

### 5.6 风险

- 可读性：错位/颗粒只做背景与标题装饰；正文保持高对比、无偏移。
- 对比度：荧光红 3.03:1 不能写正文；用深红 4.94:1 做小字链接。
- 廉价 grunge：限制纹理层数；避免全页噪点导致阅读疲劳；不做闪烁/无限 marquee。
- 商标/版权：不抄真实杂志刊头、品牌 Logo、版权页；不伪造 ISBN/条码。
- 纸家族已密：Zine 与 poster/receipt/fax/tape 的差异必须写进 `DESIGN.md` 的 Do/Don't；如果评审认为正交性不足，可把第三套换成 Broadsheet/LaTeX。

## 6. 体积与性能

- 当前基线：7.28 MiB / 175 HTML / 45 WOFF2；新增 3 套预期 +15 HTML 页面、+3 CSS 入口，不新增字体/图片。
- 目标：≤ 8.2 MiB；硬门禁 10 MiB。每套完成后记录 dist 增量；三套完成后写 `docs/verification/shared.md`。
- 每套只加载自身需要的字体 face；不请求未使用字重；CJK 核心变量不得被系统 CJK 替代。
- 预览 1–8 KB/套；预览 CSS 在切换页聚合为单一样式表，不新增请求数。
- 不引入共享 CSS 聚合；`@source not "./Preview.astro";` 防止预览样式污染正式页。

## 7. 风险与缓解（跨套）

| 风险 | 影响 | 缓解 |
|---|---|---|
| Aero 与 frost/homepage99 混淆 | 视觉重复，矩阵失效 | 明确 Do/Don't；Aero 用饱和天空/草绿/凝胶高光，限制模糊；不用 90s 表格/像素 |
| Transit 变成 dashboard | 信息姿态重复 | 只做线路/站点/时刻表；不做 KPI/图表/数据卡 |
| Zine 可读性/对比度 | 无障碍失败 | 荧光色只做装饰；正文 ink；小字链接用深红/蓝；实测对比度 |
| 字体覆盖不足 | CJK 缺字/回退难看 | 复用核心 CJK；每栈保留核心变量；跑 `fonts:coverage` |
| CSS 隔离破坏 | 其他设计页面被污染 | `@source "./"`；tokens 命名空间；不 import 共享 CSS；检查动态 import 边 |
| 体积超预算 | 10 MiB 门禁失败 | 无新字体/图片；CSS 精简；每套记录增量；必要时先裁剪装饰 |
| 过多样式/动效 | 维护成本与性能 | 每套最多 1 个持续装饰；优先一次性动效；共用现有组件模式 |

## 8. 交付与回滚

- 每套：目录 + `docs/verification/<id>.md`；父任务最后统一更新 SPEC 批次记录与总体积。
- 回滚单套：删除 `src/designs/<id>/` 与对应验证记录；注册表/路由自动消失，不影响其他设计。
- 回滚 SPEC：恢复 §4.4.1 与批次记录；不影响设计目录。
- 提交：子 agent 不 commit；父任务集成复核后，由用户确认再提交。

## 9. 验证矩阵

| 验证 | Aero | Transit | Zine |
|---|---|---|---|
| 构建 + 5 语言路由 | ✓ | ✓ | ✓ |
| 1440 / 768 / 375×812 | ✓ | ✓ | ✓ |
| 键盘 / 焦点可见 | ✓ | ✓ | ✓ |
| 对比度（正文/大字/非文字） | ✓ | ✓ | ✓ |
| 减动态 / 无 JS / 无 IO | ✓ | ✓ | ✓ |
| 预览（切换页） | ✓ | ✓ | ✓ |
| CSS 隔离 / 无共享聚合 | ✓ | ✓ | ✓ |
| 内部链接 `withBase()` | ✓ | ✓ | ✓ |
| 共享菜单唯一入口 | ✓ | ✓ | ✓ |
| dist 增量 / 10 MiB | ✓ | ✓ | ✓ |
