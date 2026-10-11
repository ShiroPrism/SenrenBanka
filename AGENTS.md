# AGENTS.md — 项目级实现约定

本文件是编码 Agent 的强制约定（对应 SPEC §9）。新增 / 修改设计前必读。

## 数据接口

- 每个设计页面在 frontmatter 取数：`const view = await loadDesignView('<自己的 id>')`（`src/lib/site.ts`）
- `view` 结构：
  - `profile`：核心字段 `name` / `headline` / `bio` / `links` **必须全部渲染**；
    `avatar` / `location` 可选；扩展区块 `projects` / `experience` / `skills` / `contact` 由设计按自身风格**自行取舍**（取舍结果写进该设计的 DESIGN.md）
  - `site`：title / description / lang / manualSwitch
  - `design`：id / displayName / description / isDefault
  - `head`：**必须原样传给 `HeadMeta`**（title / description / canonical / robots 由框架统一计算，robots 索引策略不可自行更改）
  - `contextMenu`：桌面右键快捷操作菜单的构建期配置（`enabled` / 当前设计 / 目标池 / storageKey 等，含随机与固定模式的存储语义）。`enabled` 为 `true` 时页面接入共享组件 `<ContextMenu config={view.contextMenu} />`（见下节）
- 所有内部链接必须经 `withBase()`（`src/lib/urls.ts`）拼接 base 前缀，禁止硬编码绝对路径
- 禁止虚构个人事实；允许装饰性文案（如 "Selected Works"、"Elsewhere"）

## 每套设计必须满足

1. 四件套齐备：`DESIGN.md`、`design.json`、`Page.astro`、`style.css`
2. `Page.astro` 是完整文档（含 `<html>`），`<head>` 中必须包含 `<HeadMeta {...view.head} />`
3. `style.css` 首两行必须为：

   ```css
   @import "tailwindcss" source(none);
   @source "./";
   ```

   （如 import 了共享组件且其含工具类，追加 `@source` 指向共享目录）
4. `manualSwitch` 开启时必须接入共享右键菜单（`{view.contextMenu.enabled && <ContextMenu config={view.contextMenu} />}`，放于 `<body>` 末尾）；**不得**再放任何可见的「切换设计 / Switch design」链接、按钮或导航项，也不得留下隐藏但可聚焦的旧入口
5. 字体：在 `astro.config.mjs` 的 `fonts` 注册（npm provider、`remote: false` 离线优先）→ 页面内 `<Font cssVariable ...>`（`astro:assets`）→ `style.css` 里用 `@theme inline` 注册进 Tailwind
6. `design.json` 的 `source`：非自产（官方 / 第三方）必须填 `url` / `fetchedAt` / `license`，否则构建失败；许可要求保留声明时附 `SOURCE-LICENSE.txt`

## 设计切换入口：共享桌面右键快捷操作菜单

- **唯一实现**：`src/components/ContextMenu.astro`（标记 / 样式 / 配置注入）+ `src/lib/context-menu.ts`（运行时）。**禁止**每套设计复制菜单实现或自建切换入口；数据来自 `view.contextMenu`（构建期在 `src/lib/site.ts` 派生）。
- **触发**：仅桌面鼠标环境（`(hover: hover) and (pointer: fine)`）在非交互区域右键/`Shift+F10` 打开；链接、图片、输入控件、可编辑区、已选中文字、触屏来源（混合设备长按）一律保留浏览器原生菜单——**不得对全页无条件 `preventDefault()`**。
- **菜单项**：页面操作（重新加载 / 回到顶部 / 复制当前页面链接 / 打印 / 分享页面）+ 设计操作（随机一个设计 / 切换设计…）；`navigator.share` 不可用时移除「分享页面」；复制 / 分享结果以 Toast（`role="status"`）反馈。
- **随机语义**（与 `/designs/` 切换页、根脚本一致）：复用 `storageKey` 与 `{ designId, expiresAt }` 格式；必须排除当前设计（保证确实切换）、`avoidRepeat` 时再尽量排除上次；仅一套启用设计时该项 `aria-disabled`（不得假装切换）；写入后直接导航目标设计的固定 URL；打开菜单 / 页面加载均不写存储。
- **键盘 / 焦点**：菜单 `role="menu"`，项为 `role="menuitem"`；↑↓/Home/End 移动、Enter/Space 激活、Esc 关闭并归还焦点、Tab 关闭不困住焦点；鼠标打开不预高亮首项，键盘打开才显示焦点环（`data-cm-key`）。
- **移动端（项目决策）**：触屏设备不提供菜单、不模拟长按、**不加载运行时**（内联能力检测 + 动态 `import()`，见「已知坑」）；设计页不保留任何移动端替代入口。
- `manualSwitch: false` 时：`view.contextMenu.enabled` 为 `false` → 页面不渲染该组件（零标记 / 零脚本），`/designs/` 不构建（404）；各设计固定 URL 不受影响。

## 动效（Motion）

- 机制见 `docs/adr/0001-motion-reveal-mechanism.md`（基础触发）与 `docs/adr/0003-differentiated-motion-enhancement.md`（差异化增强），术语见 `CONTEXT.md`。
- **入场动画**：各设计私有纯 CSS `@keyframes`（无 JS 依赖），整体包在 `@media (prefers-reduced-motion: no-preference)` 内；减动态时不生成动画、元素保持自然可见态。
- **滚动显现**：共享 `src/lib/reveal.ts`（`IntersectionObserver`）只负责触发；目标加 `data-reveal`，首次进入视口置 `data-reveal-in` 并取消观察（只播一次）。时长 / 缓动 / 位移 / 错落顺序由各设计 `style.css` 自行维护。
- **滚动进度**：仅 oxide 顶部装饰线使用 CSS Scroll-Driven Animations（`animation-timeline: scroll()`；`animation` 简写会重置 timeline，必须后置声明）；`@supports` 门控 + 不支持 / 减动态时整条隐藏；**不得用于内容显隐**。
- **可见性契约（不可违反）**：内容默认可见；CSS 隐藏态必须以 `html[data-reveal-ready]` 为唯一门控，该属性只由 `src/components/Reveal.astro` 的内联 boot 在「非 reduced-motion 且支持 `IntersectionObserver`」时写入。无 JS / 脚本失败 / 无 IO / 减动态时内容必须始终可见。
- 运动只动 `opacity` / `transform`（交互态允许短促的颜色 / 下划线过渡）；避免过长延迟与影响阅读节奏；**核心内容不等待**——首屏动画必须秒级内落定，正文不做逐字打印。
- 持续动效（无限循环）仅限小范围、有明确视觉价值的元素（oxide 波形流动 / terminal 光标与状态灯 / oxide 进度线）；其余一律只播一次。
- 采用动效的设计在 `<head>` 放一次 `<Reveal />`：**当前四套设计均引入**；新增设计若按规范保持静止则不引入，并在验证记录中显式注明。
- `src/lib/reveal.ts` 与 `Reveal.astro` **不得 import 任何 CSS**（会触发下文"已知坑"的 CSS 聚合）。
- 自产规范（editorial / terminal）的 Motion 章节必须与实现一致，改动前先修订规范；oxide / fast 的 `DESIGN.md` 是厂商原始快照，**不得修改**，偏差记录在 `SPEC §18` 与 `change-log/`。

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
- **接线**：`links[].icon` 为可选 slug；slug → 标记的映射写在各设计 `Page.astro`（私有、条件渲染）；未映射 / 缺省渲染该设计的通用功能图标（Globe）。links 列表面内「要么不用，要么全用」——现行选择为全用、不留裸链接；列表面之外的页脚 / CTA 保留各设计原生 affordance；装饰性标记一律 `aria-hidden`（可访问名由文本标签承担）。
- **品牌标志**：vendored 至 `src/assets/brand/`（simple-icons / CC0、单色 `currentColor`）；逐品牌核对商标规范，provenance（url / 日期 / 许可 / 核对结论）记入 `SPEC §18`。
- **样式归属**：尺寸 / 描边 / 颜色 / 间距 / hover 由各设计 `style.css` 控制；不建共享图标封装组件（隔离约束见"已知坑"）。**唯一例外**：右键菜单组件（项目级 chrome，见「设计切换入口」节）统一使用 `@lucide/astro`、单一中性外观，不属于任何设计的图标系统，也不受各设计图标规范约束；各设计内容区的图标语言不受其影响。
- **现行语言**：各设计图标语言见各自 `DESIGN.md`；厂商快照（oxide / fast）的适配记录见 `SPEC §18`。

## 已知坑（均已实测，勿重复踩）

- **不要让任何多页共享的模块对设计页面 / CSS 建立动态导入边**：
  `import.meta.glob('./*/Page.astro')`（非 eager）这类写法会把它触达的所有 `style.css` 聚合进**每个**引用方的 `<link>`。
  文件存在性检查请用 `node:fs`（见 `src/designs/registry.ts`）。
- **设计路由用 `astro.config.mjs` 的 `injectRoute`**：`getStaticPaths` 不能引用页面 frontmatter 顶层的 glob 变量（构建拆包后报 `pages is not defined`）。副作用：新增 / 删除设计目录后需重启 `npm run dev`。
- **内容层 glob loader 会归一化条目 id**（`site.config.yaml` → `"siteconfig"`）：取数用 `getCollection()` 取唯一条目，不要猜 id（见 `src/lib/site.ts`）。
- **Tailwind 不识别动态拼接的类名**（如 `border-${color}` 不会被扫描到）；需要安全列表时用 `@source inline("...")`。
- **`@astrojs/tailwind` 已弃用**，勿引入；Tailwind 4 官方集成 = `@tailwindcss/vite`（已配置）。
- 切换页 `/designs/` 在 `manualSwitch: false` 时**不构建**（404）；任一设计页不得留可见 / 可聚焦的切换入口（入口即桌面右键菜单，与切换页同受 `manualSwitch` 门控）。
- **Tailwind Preflight 把 `svg` 置为 `display: block`**：行内语境中的 svg 图标（文本旁的品牌 mark / 外链箭头）会折到下一行——必须显式 `display: inline-block`（flex 语境不受影响）。2026-10-10 由图标改动验证期 rect 实测暴露。
- **右键菜单运行时必须按能力门控动态加载**：`ContextMenu.astro` 用内联 `matchMedia('(hover: hover) and (pointer: fine)')` + 动态 `import()`（Vite 不给该 chunk 生成 `modulepreload`，dist 实测）；**不要改成静态 import**，否则触屏设备会白白下载菜单逻辑。菜单样式用 `<style is:inline>`：不新增 `<link>`（"每设计页只链接自己的 CSS" 仍成立）。
- **`document.execCommand` 必须保持以 `document` 为 `this` 调用**：解构出的裸方法引用会抛 `Illegal invocation`（2026-10-10 降级复制路径实测踩坑）；该 API 虽被废弃，仍是 Clipboard API 不可用时的唯一同步降级路径，经自定义类型引用以避开 TS 废弃告警。

## 新增设计评审清单

- [ ] 四件套 + provenance（来源类型 / URL / 日期 / 许可）完整
- [ ] 核心字段全部渲染；扩展区块取舍与理由写进 DESIGN.md
- [ ] 若使用图标 / 品牌标志：符合「Iconography & Icon Library Rules」（设计规范优先 / 库与技术栈兼容 / 列表面 100% 标记、无裸链接 / 资产 vendored + 商标核对 / `aria-hidden`）
- [ ] `<HeadMeta {...view.head} />` 原样引入；`manualSwitch` 时接入共享 `<ContextMenu config={view.contextMenu} />`（**不得**自建切换入口或复制菜单实现）
- [ ] 移动端 375px 宽无横向溢出、正文可读
- [ ] `npm run build` 通过（含 `astro check`）
- [ ] 抽查 `dist/`：该设计页面只链接自己的 CSS；根页 / 切换页 / 404 不链接任何设计 CSS

## 构建

- `npm run check`：`astro check`（TS / .astro 类型）
- `npm run build`：check + 构建；设计注册表校验失败时会以 `[senrenbanka]` 前缀明确报错
- 新设计页完成、或任一设计页/样式/构建配置改动后：按 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）执行完整验证流程
- 临时调整 `site.config.yaml`（如切 `mode: fixed`）验证行为后，请恢复示例配置再提交

## 版本与变更日志

- 变更日志在 `change-log/` 下**一个版本一个文件，以版本号命名**（如 `change-log/0.1.0.md`）
- 版本规则：**大功能更新 `+0.1`**（0.1.0 → 0.2.0）；**小功能补丁 `+0.0.1`**（0.1.0 → 0.1.1）；与 `package.json` 的 `version` 保持同步
- 每次版本更新**新增**对应版本号的日志文件，不在旧文件上累积

## 入库范围（git）

- skill 只入库**仓库定制化**的 `.agents/skills/design-page-verify/`；通用 skill（impeccable、grill-me 等）不入库
- `.trae/`、`.codex/`、`.impeccable/` 等本地工具目录不入库（规则见 `.gitignore`）
- 通用 skill 由使用者自行安装（如 impeccable：用于设计文档化 / 检测器 / 评审；`design-page-verify` 流程中的检测器步骤依赖它）