# 视觉语言

> **适用范围**：动效、图标、视觉素材、字体选型与生产接线规则。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`docs/adr/0001-motion-reveal-mechanism.md`](../../docs/adr/0001-motion-reveal-mechanism.md), [`docs/adr/0002-icon-and-brand-mark-strategy.md`](../../docs/adr/0002-icon-and-brand-mark-strategy.md), [`docs/adr/0003-differentiated-motion-enhancement.md`](../../docs/adr/0003-differentiated-motion-enhancement.md), [`docs/adr/0008-local-font-library-isolation.md`](../../docs/adr/0008-local-font-library-isolation.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 动效（Motion）

- 机制见 `../adr/0001-motion-reveal-mechanism.md`（基础触发）与 `../adr/0003-differentiated-motion-enhancement.md`（差异化增强），术语见 `CONTEXT.md`；各设计当前采用情况见 `../verification/`。
- **定位：设计语言维度**。目标不是给所有元素增加动画，而是让每套设计拥有更丰富、更有辨识度的动态表现，同时保持各自的设计语言。每套设计必须在 `DESIGN.md` 中定义自己的动效语言（形态 / 节奏 / 参数）；允许极简（单一过渡、单动作），决定静止必须给出论证。`html-only` 必须完全静止且不接入下列样式 / 脚本机制。
- **入场动画**：各设计私有纯 CSS `@keyframes`（无 JS 依赖），整体包在 `@media (prefers-reduced-motion: no-preference)` 内；减动态时不生成动画、元素保持自然可见态。
- **滚动显现**：共享 `src/lib/reveal.ts`（`IntersectionObserver`）只负责触发；目标加 `data-reveal`，首次进入视口置 `data-reveal-in` 并取消观察（只播一次）。时长 / 缓动 / 位移 / 错落顺序由各设计 `style.css` 自行维护。采用共享机制的设计在 `<head>` 放一次 `<Reveal />`；不用共享机制的设计必须在 `DESIGN.md` 说明替代触发方式，且仍须满足下文可见性契约。
- **装饰性滚动进度**：CSS Scroll-Driven Animations（`animation-timeline: scroll()`）仅允许用于装饰性进度指示，**不得用于内容显隐**；`@supports` 门控 + 不支持 / 减动态时整条隐藏；注意压缩器可能把 `animation-timeline` 合并进 `animation` 简写（产物中该简写在当前 Chromium 不被接受、整条失效），须以 `var()` 传入 timeline 阻断合并（本机已实测；记录见 `../verification/`）。
- **可见性契约（不可违反）**：内容默认可见；CSS 隐藏态必须以 `html[data-reveal-ready]` 为唯一门控，该属性只由 `src/components/Reveal.astro` 的内联 boot 在「非 reduced-motion 且支持 `IntersectionObserver`」时写入。无 JS / 脚本失败 / 无 IO / 减动态时内容必须始终可见。
- **运动约束**：只动 `opacity` / `transform`（交互态允许短促的颜色 / 下划线过渡）；避免过长延迟与影响阅读节奏；**核心内容不等待**——首屏动画必须秒级内落定，正文不做逐字打印。
- **持续动效（无限循环）**：仅限小范围、有明确视觉价值的形态类装饰（如流动波形、光标呼吸、进度指示），且必须在 `DESIGN.md` 中论证；其余一律只播一次；减动态时持续动效静止。
- **设计专属 JavaScript**：只有纯 CSS 对某设计隐喻的核心交互存在具体表达缺口时，才允许接入设计目录私有的客户端脚本（ADR 0011）。每套最多一个入口、无第三方交互依赖、≤12KB gzip；脚本不得门控核心内容或真实链接，必须提供无 JS / 加载失败 / 减动态终态、键盘路径与停止条件。禁止滚动劫持、光标替代、Canvas-only 文本、WebGL、自动播放声音和主题级无限循环；切换页预览不得执行设计脚本。
- `src/lib/reveal.ts` 与 `Reveal.astro` **不得 import 任何 CSS**（会触发 [`pitfalls.md`](./pitfalls.md) 的 CSS 聚合陷阱）。
- **规范与实现同步**：自撰规范（`self-produced` / `third-party-analysis` 复刻）的 Motion 章节必须与实现一致，改动前先修订规范；厂商来源（`official-vendor` 快照 / `official-docs-derived` 汇编——汇编为"整合完成即冻结"）的 `DESIGN.md` **不得修改**，适配方式与偏差记录在 `../designs/<id>/ADAPTATION.md` 与 `change-log/`。

## Iconography & Icon Library Rules

### 1. Design-first

- 每套设计的图标选择必须遵循对应 `DESIGN.md` 的视觉规范。
- 如果 `DESIGN.md` 明确指定图标库、图标格式或绘制风格，优先遵循原规范，不得默认替换为 Lucide。
- 如果规范没有指定图标库，由实现 Agent 根据该设计的视觉语言选择合适的图标方案。
- 图标不是必需品。允许使用 ASCII / Unicode 符号、原生 SVG、CSS 几何图形，或完全不使用图标。
- 不得为了增加视觉元素而给所有标题、列表和段落机械地添加图标。

### 2. Library compatibility

- 使用设计规范指定的图标库前，先核实其实际 API、框架要求、构建方式、许可证及资源输出形式。
- 优先选择与当前 Astro 静态页面兼容的方案：Astro 图标组件、静态 SVG、SVG Sprite 或经过许可核实的本地 SVG 资源。
- 不得仅为了使用 React 图标组件而引入 React、React 集成或其他大型依赖；只有存在明确且合理的需求时才考虑。
- 如果指定的图标库与当前技术栈不兼容，优先评估其官方提供的非 React 接入方式或静态资源格式。确实不可行时，选择视觉上最接近且兼容的替代方案，并记录原因。
- Lucide 仅作为候选通用图标库，不是项目的强制依赖。不得在已有方案满足需求时，为少量图标重复引入多个相似库。
- 不得仅因某个图标库流行，就忽略设计规范指定的尺寸、描边、填充方式与图形比例。

### 3. Dependencies and build output

- 优先复用项目已有依赖与设计自带资源。
- 新增依赖前，确认其是否确有必要，并检查安装、构建和维护成本。
- 图标应优先在构建阶段输出为 SVG 或其他适合的静态资源，不依赖运行时 CDN，也不应为了普通图标引入不必要的客户端 JavaScript。
- 不得因图标导入方式破坏各设计的 Tailwind CSS 4 样式隔离或让未使用的设计资源进入其他页面。
- 品牌 Logo 必须使用对应品牌的合法资源，并单独核实商标及授权要求。

### 4. Styling and accessibility

- 图标的尺寸、颜色、描边、填充、间距和交互状态由对应设计控制，不建立强制统一的全局图标视觉风格。
- 装饰性图标应避免被辅助技术重复朗读；仅有图标的交互控件必须提供可访问名称。
- 不得仅通过颜色或图标形状传达关键状态；必要时配合文字或其他语义提示。
- 新增或更换图标后，检查桌面端、移动端、对比度及图标与相邻文字的对齐情况。

### 5. Source design documents

- 厂商官方 `DESIGN.md` 快照遵守项目既有的只读约定，不得擅自修改原始内容。
- 如果原始规范的图标方案需要针对 Astro 做适配，将适配方式及原因记录在项目规格或变更日志中。
- 自产的 `DESIGN.md` 则应同步记录实际采用的图标风格与实现约定，确保规范与代码一致。

### 6. Project conventions（本项目现行约定）

- **当前实现**：通用功能图标库采用 `@lucide/astro`（构建期内联 SVG、零客户端 JS）；复用既有方案，不重复引入相似库。
- **接线**：`links[].icon` 为可选 slug；slug → 标记的映射写在各设计 `Page.astro`（私有、条件渲染）；**仅当映射存在时才渲染标记——未配置 / 未映射一律不打图标**（2026-10-11 修订：按配置逐条标记；旧「Globe 回退 / 列表 100% 标记」被项目所有者否决）。列表面之外的页脚 / CTA 保留各设计原生 affordance；装饰性标记一律 `aria-hidden`（可访问名由文本标签承担）。
- **品牌标志**：vendored 至 `src/assets/brand/`（simple-icons / CC0、单色 `currentColor`）；逐品牌核对商标规范，provenance（url / 日期 / 许可 / 核对结论）记入 `../verification/shared.md`。
- **样式归属**：`styled` 设计的尺寸 / 描边 / 颜色 / 间距 / hover 由其 `style.css` 控制；`html-only` 不设置样式，采用浏览器默认呈现。不建共享图标封装组件（隔离约束见 [`pitfalls.md`](./pitfalls.md)）。**唯一例外**：共享操作菜单组件（项目级 chrome，见 [`action-menu.md`](./action-menu.md)）统一使用 `@lucide/astro`、单一中性外观，不属于任何设计的图标系统，也不受各设计图标规范约束；各设计内容区的图标语言不受其影响。
- **现行语言**：各设计图标语言见各自 `DESIGN.md`；厂商来源（快照 / 汇编 / 复刻）的适配记录与各设计当前采用情况见 `../designs/*/ADAPTATION.md` 与 `../verification/`。

## Visual Assets & Cursor Rules

- 新增图片或自定义鼠标指针前，必须先阅读对应设计的 `DESIGN.md`，确认设计确实需要该素材。不得为了填补留白或追求视觉丰富而随意加入图片。
- 优先使用设计已有的排版、CSS、ASCII / Unicode 图形、内联 SVG 和实际项目截图。素材不是必需项。
- 获取远程素材时，必须核实原始来源、许可、署名要求及是否允许将素材随开源仓库再分发。不得把"允许网页使用"等同于"允许原样打包再分发"（合规策略见 `SPEC §4`）。
- 不得直接依赖不稳定的第三方图片 URL。允许入库的素材应保存到对应设计的 `assets/`，共享品牌资产按现有约定存放，并记录必要的 provenance。
- 图片应有合理的尺寸、格式、替代文本和加载策略。需要图片优化时，优先使用 Astro 支持的构建期资源处理方式（`astro:assets`）。
- profile 头像由数据层统一解析（`src/data/assets/` 本地文件或外部 URL → 类型化图片引用），各设计不得自建头像管线；裁切、比例与呈现风格由设计自控。
- 默认使用标准 CSS `cursor` 值表达常规交互。只有设计规范明确需要自定义指针时，才创建或获取小型本地光标素材。
- 自定义光标必须提供标准 CSS 回退，并限制在适合桌面鼠标的环境使用（`(hover: hover) and (pointer: fine)`）；不得影响触屏浏览、文本选择、可访问性或正常点击。
- 不得用跟随鼠标的 JavaScript 特效替代普通 CSS 光标，除非该效果是明确的设计需求且经过性能与交互评估。
- 不论使用图片还是光标素材，都必须遵循对应设计的视觉规范，并在新增设计验证中检查移动端、构建产物和许可记录。

## 字体（Typography & Fonts）

- **选型顺序（`styled` 强制）**：新增 `styled` 主题必须先确定**设计隐喻与信息结构**（标题 / 正文 / 数字·技术标记的角色划分），再到本地字体库发现候选、经**真实文件样张目检**、过**许可闸门**后接入生产。**不得**按字体名关键词或审美形容词直接指定字体；**不得**跳过样张目检（名称含 `CJK` / `Japanese` 等词不代表实际覆盖）。完整流程与工具见 `../fonts/selection-guide.md`。`html-only` 不进入字体选型或生产管线。
- **本地字体库（本机工作台）**：唯一入口 `.local-fonts/library/`（Windows 目录联接），唯一扫描工具 `.local-fonts/tools/scan-fonts.mjs`；扫描清单、样张工具与候选记录**只存 `.local-fonts/`**（已被 `.gitignore` 的 `.*/` 规则排除，**勿重复添加规则**），**不得**写入公开文档。
- **在线候选（补充通道）**：本地库不能满足设计意图时，可从不限于 Google Fonts 的开源来源补充候选——**先核验官方许可（OFL 注意 RFN）、再下载**，存 `.local-fonts/online-candidates/`（许可文件同目录），用同一扫描器与样张工具（第二实例）验证；清单见 `.local-fonts/online-font-candidates.json`。未核验许可**不得下载、不得预览、不得进入生产**；不得因站名含 Free / Open / Fonts 假定可再分发；CJK 优先子集 / 分片分发，禁止为少数字符引入超大字体。
- **本地 ≠ 生产（硬隔离）**：`.local-fonts/` 与 `F:\Fonts` 等本机路径**不得**被 `astro.config.mjs` / `src/` / `public/` 引用；字体库文件**不得**进入 `dist/`；扫描 / 预览工具**不得**引入新依赖（深解析复用 Astro 自带的 `fontkitten` / `fontace`）。
- **许可闸门**：只有**确认允许网站嵌入与再分发**的字体才能进入正式字体资源管线（字体内嵌许可字段与 `fsType` 嵌入位只作线索，必须人工核实；未核实 = 不可用，只能停留在本地候选）。需要保留声明的字体随该设计附 `SOURCE-LICENSE.txt`。
- **记录（强制）**：每次选型的六项记录（隐喻 → 角色分配 → 取舍理由 → 简中 / 日 / 英实际覆盖与回退 → 字重 / 可变轴 / 体积 / 许可 → 缺失回退顺序）写入：自产与复刻 → 该设计 `DESIGN.md`；厂商来源 → 该主题 `ADAPTATION.md`（`DESIGN.md` 只读）。
- **生产接线（`styled`，现状不变）**：`astro.config.mjs` 的 `fonts` 注册（项目内 `local` provider；既有 npm provider 必须 `remote: false`）→ 页面 `<Font cssVariable ...>`（`astro:assets`）→ `style.css` 用 `@theme inline` 注册进 Tailwind；**回退栈必须包含系统中文**（推荐链见指南 §4）。`html-only` 不进入字体管线，使用浏览器用户默认字体。
- 字体不能替代对布局、信息架构与交互的独立设计；不得为显得专业机械增加字体数量。
