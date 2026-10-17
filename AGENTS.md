# AGENTS.md — 项目级实现约定

本文件是编码 Agent 的强制约定（对应 SPEC §9），只承载**通用**设计规则（不点名任何单一设计）；各设计的具体采用情况、适配记录与偏差见 `docs/README.md` 索引（`docs/verification/`、`docs/designs/*/ADAPTATION.md`、`change-log/`）。新增 / 修改设计前必读。

## 数据接口

- 每个设计页面在 frontmatter 取数：`const view = await loadDesignView('<自己的 id>', Astro.url.pathname)`（`src/lib/site.ts`）。**第二个参数是当前请求路径**——语言由它统一解析，页面**不得**各自实现语言判断逻辑
- **多语言同屏**的设计（如 receipt 三联票）：改用 `loadDesignStrips('<自己的 id>', Astro.url.pathname)`——与 `loadDesignView` 同一数据源与构建期校验，额外返回全部语言的资料条（`strips: { locale, profile, isCurrent }[]`）；页面仍不接触文件路径、不自行判断语言
- `view` 结构：
  - `profile`：核心字段 `name` / `headline` / `bio` / `links` **必须全部渲染**；
    `avatar` / `location` 可选；扩展区块 `projects` / `experience` / `skills` / `contact` 由设计按自身风格**自行取舍**（取舍结果写进该设计的 DESIGN.md）。资料**按当前语言**选取，页面不需要关心文件路径
  - `locale`：当前语言条目（`code` / `path` / `label` / `title` / `description`）；`locales` 为全部语言
  - `messages`：当前语言的共享文案（共享操作菜单 / 切换页 / 404 / 语言选择器）
  - `site`：manualSwitch
  - `design`：id / displayName / description / isDefault
  - `head`：**必须原样传给 `HeadMeta`**（title / description / canonical / robots / lang / alternates 由框架统一计算，robots 索引策略不可自行更改）
  - `contextMenu`：共享操作菜单的构建期配置（`context` 页面上下文 / 目标池 / storageKey / `languages` / `designActionsEnabled` 等，含随机与固定模式的存储语义）。页面**无条件**接入共享组件 `<ContextMenu config={view.contextMenu} />`（见下节；v0.10.0 起无 `enabled` 开关）
- `<html lang>` 必须用 `view.head.lang`（即当前语言的 BCP 47 code），**不得**使用固定的 `zh-CN`
- 所有内部链接必须经 `withBase()`（`src/lib/urls.ts`）拼接 base 前缀，或用 `localeDesignHref()` / `localeHref()`（`src/lib/site.ts`）生成**带语言前缀**的地址；禁止硬编码绝对路径
- 禁止虚构个人事实

## 多语言（i18n）

- 语言清单**只在一处维护**：`src/data/site.config.yaml` 的 `i18n.locales`（`code` / `path` / `label` / `title` / `description`）。不得在其他文件重复列出语言
- 每种语言必须有 `src/data/profiles/<locale.path>.yaml`，字段契约与 `zh-CN` **完全一致**（同一套 `profileSchema`）
- 站点 SEO 元数据按语言提供（`i18n.locales[].title/description`）；**不再**保留全局 `site.title` / `site.description` / `site.lang`
- **每套设计必须提供 `src/designs/<id>/messages.ts`**，导出 `messages`，为 `i18n.locales` 声明的**每种语言 code** 各给一份文案（缺文件或缺键在构建期报错）。文案必须遵循该设计的视觉语言，**不得**把所有设计统一翻译成相同表述
- 不翻译的文本（命令、ASCII 装饰、刻意的双语标识、品牌专有名词、法律署名）**必须在该设计 `messages.ts` 的文件注释中写明理由**，否则视为漏译
- 用户可见静态文案**不得**留在 `Page.astro` 的模板字面量里；也包括运行时生成的提示（菜单 Toast 等）——后者由 `view.messages` 注入
- **翻译纪律（重要）**：翻译**只处理已有文案**，不得为"显得完整"而新增解释性、说明性或自我描述的句子。原页面没有的句子，译文里也不该有。
  - 典型反例：`built from a single profile` 译成「由同一份资料生成」——中文读者无法从中获得信息，只会觉得莫名其妙。
  - 若某句原文本身语义不清、拿不准，**先问项目所有者**，不要自行"润色"或保留。
  - 译文必须**能被该语言的读者读懂并获得与原文等量的信息**；做不到就说明原文该删，而不是硬译。
- 共享 chrome 文案集中在 `src/i18n/messages.ts`；该模块与各设计 `messages.ts` **都是纯数据，不得 import 任何 CSS / `Page.astro` / `style.css`**
- **语言切换入口 = 共享操作菜单内的语言分组**（`ContextMenu.astro` 内渲染，`.cm-lang`）：各设计页**不再**单独渲染可见的语言切换器，也**不需要**在自己的 `style.css` 中排版语言切换（v0.9.0 修订：消除 8 套设计的重复排版成本）。语言项是普通 `<a>`，逐个带 `hreflang` / `lang`，当前语言标 `aria-current="page"` 并附勾选标记。**桌面与移动端都可达**（v0.10.0 修订）。
- **语言项的呈现按输入环境分叉**（ADR 0007）：
  - **桌面**：收在二级子菜单里，**不得平铺进主菜单**——语言数量由配置决定且可能很多，平铺会让主菜单长到超出视口。契约：主菜单高度与语言数量**无关**；子菜单自身限高并可滚动。
  - **移动**：在底部动作面板内**平铺**（触屏没有 hover 二级菜单的心智模型，用户会滑到列表底部而不是"点开子菜单去看语言"）。限高与滚动由面板容器承担，语言再多也不会顶出视口。
  - **两种形态都不得依赖 hover**：桌面子菜单必须支持点击 / `→` / Enter 打开；移动端平铺项本身即入口。
- **`manualSwitch` 只控制菜单内的主题切换项**（随机 / 切换设计…）：`designActionsEnabled` 为 false 时这两项不渲染，但**菜单与语言分组仍渲染**——语言切换不受 `manualSwitch` 影响
- 切换语言时**保持页面上下文**（`context.kind` 派生，ADR 0007）：主题页 → 目标语言的同一主题；切换页 → 目标语言的切换页；404 → 目标语言的入口页
- 切换语言只改 locale，**不改当前主题、不重置随机窗口**；`storageKey` 不含 locale（主题偏好跨语言共享）
- 语言识别只认路径**首段**并与 `locales[].path` 精确匹配，部署 base 不得被当作语言代码

## 每套设计必须满足

1. 四件套齐备：`DESIGN.md`、`design.json`、`Page.astro`、`style.css`，**加** `messages.ts`（见「多语言（i18n）」节）
2. `Page.astro` 是完整文档（含 `<html>`），`<head>` 中必须包含 `<HeadMeta {...view.head} />`
3. `style.css` 首两行必须为：

   ```css
   @import "tailwindcss" source(none);
   @source "./";
   ```

   （如 import 了共享组件且其含工具类，追加 `@source` 指向共享目录）
4. 必须接入共享操作菜单（`<ContextMenu config={view.contextMenu} />`，放于 `<body>` 末尾，**无条件**渲染）；**不得**再放任何可见的「切换设计 / Switch design」链接、按钮或导航项，也不得留下隐藏但可聚焦的旧入口
5. 字体：在 `astro.config.mjs` 的 `fonts` 注册（npm provider、`remote: false` 离线优先）→ 页面内 `<Font cssVariable ...>`（`astro:assets`）→ `style.css` 里用 `@theme inline` 注册进 Tailwind；**新增主题的字体选型必须先走 `docs/fonts/selection-guide.md` 流程（先隐喻、后样张目检、过许可闸门），见「字体（Typography & Fonts）」节**
6. `design.json` 的 `source`：非自产（`official-vendor` / `official-docs-derived` / `third-party-analysis`）必须填 `url` / `fetchedAt` / `license`，否则构建失败；许可要求保留声明时附 `SOURCE-LICENSE.txt`（汇编为逐来源许可合集）
7. `DESIGN.md` 定义该设计的动效语言（Motion 章节；可极简，决定静止须论证）；采用共享滚动显现时必须接入 `<Reveal />`（见「动效（Motion）」节）
8. **多语言接入**：主题的界面文案全部来自本设计 `messages.ts`；语言切换由共享操作菜单承担，设计页**不渲染** `<LanguageSwitcher />`（它是基础设施页的无 JS 回退，见下节）

## 页面级操作入口：共享操作菜单（Action menu · ADR 0007）

术语：菜单本体叫**共享操作菜单**（`Action menu`），**桌面形态**叫 `Context menu`，**移动形态**叫**底部动作面板**，**移动端入口**叫**悬浮球**（`Launcher`）。`CONTEXT.md` 有完整定义。

- **唯一实现**：`src/components/ContextMenu.astro`（标记 / 样式 / 配置注入）+ `src/lib/context-menu.ts`（运行时）。**禁止**每套设计复制菜单实现或自建切换入口；数据来自 `view.contextMenu`（设计页）或 `buildActionMenuConfig()`（基础设施页），构建期都在 `src/lib/site.ts` 派生。
- **一份数据，两种容器形态**：SSR 同时输出两份 DOM（`.cm` 桌面浮层 / `.cm-sheet` 移动面板），运行时按输入能力把不需要的那份设为 `hidden`——**必须用 `hidden` 属性**（它同时移出无障碍树，不会被重复朗读），不要用 `display: none` 类。两份共享同一批 `<a href>` / `<button data-cm-action>` / Toast 容器与事件委托。被摘除的移动面板那份静态 DOM 顺带充当无 JS 时的语言切换回退。
- **触发方式**（与菜单本体解耦）：
  - 桌面：非交互区域右键 / `Shift+F10`，门控 `(hover: hover) and (any-pointer: fine)`。
  - 移动：点击悬浮球，门控 `(any-pointer: coarse)`。
  - **原生右键保留规则在两种环境下都不变**：链接、图片、输入控件、可编辑区、已选中文字、触屏来源（混合设备长按）一律交还浏览器原生菜单——**不得对全页无条件 `preventDefault()`**。移动端**不靠长按打开**，也不拦截原生长按与文本选择。
  - **混合输入设备按真实输入能力处理**：媒体查询只做初判，收到真实 `pointerdown` 的 `pointerType`（`touch` / `mouse`）即切换形态并记入**会话级 `sessionStorage`**（键 `senrenbanka.input.v1`）。该键**不得**与 `storageKeyFor()` 的主题偏好混用，也不得写入 `localStorage`。
- **页面上下文（`context`，判别联合）**：`design` / `switcher` / `not-found` 三值，**不得**假设每页都存在"当前主题"。它决定：身份条是否渲染（仅 `design`）、随机抽选是否排除当前（仅 `design`）、「切换设计…」是否隐藏（`switcher` 上是重复动作，构建期就不渲染）、语言项目的标 URL。
- **菜单项**：页面操作（重新加载 / 回到顶部 / 复制当前页面链接 / 打印 / 分享页面）+ 主题操作（随机一个设计 / 切换设计…）；`navigator.share` 不可用时移除「分享页面」；复制 / 分享结果以 Toast（`role="status"`）反馈，三语言各有文案。
- **随机语义**（与 `/designs/` 切换页、根脚本一致）：复用 `storageKey` 与 `{ designId, expiresAt }` 格式；**`design` 页**必须排除当前设计（保证确实切换），**`switcher` / `not-found`** 没有当前主题，走**全池**（绝不能排除一个不存在的"当前"）；`avoidRepeat` 时再尽量排除上次；仅一套启用设计时该项 `aria-disabled`（不得假装切换）；写入后直接导航目标设计的固定 URL；打开菜单 / 页面加载均不写存储。**随机主题在所有页面可用**。
- **键盘 / 焦点**：菜单 `role="menu"`，项为 `role="menuitem"`；↑↓/Home/End 移动、Enter/Space 激活、Esc 关闭并归还焦点、Tab 关闭不困住焦点；鼠标打开不预高亮首项，键盘打开才显示焦点环（`data-cm-key`）。
  - **子菜单层级判据是「焦点实际所在处」，不是「子菜单是否已展开」**：`↑↓` 移到语言触发项会自动展开子菜单但焦点仍留在触发项，此时 `→` 必须能进入；焦点进入子菜单后 `↑↓` 必须在子菜单内循环。这是 v0.10.0 实测修正的既有缺陷。
- **移动面板打开时锁背景滚动**：给 `<html>` 加 `overflow: hidden`（锁 `<html>` 本身不丢滚动位置，**无需** `position: fixed` 技巧）+ 面板 `overscroll-behavior: contain`（防 iOS 从面板底部继续上滑时**穿透**到背景）。两者解决不同问题，缺一不可。
- **移动形态是 action sheet，不是桌面菜单的等比放大**（`cm-sheet-bar` / `cm-sheet-body` / `cm-sheet-foot` 三段结构）：
  - **两端动作清单在 `ContextMenu.astro` 里显式分开**（`desktopActions` 5 项 / `sheetActions` **2 项**，**构建期裁剪**而非运行时 `hidden`——产物里移动面板根本不含被裁动作的标记）：
    - **判断标准只有一条：移动端浏览器 / 系统是否已经原生提供这个动作？** 提供了就不该在页面里再放一个入口——那不是"方便"，是让用户多点一次去换一个他已经有的东西。
    | 动作 | 桌面 | 移动 | 依据 |
    |---|---|---|---|
    | 复制当前页面链接 | ✅ | ✅ | 原生路径是「长按地址栏 → 系统文本菜单 → 拷贝」（iOS 还要先进编辑态），2~3 步且把用户带离页面；面板里一次点击。属于**缩短路径**而非重复 |
    | 分享页面 | ✅ | ✅ | `navigator.share()` 唤起的**就是系统原生分享表单本身**，不是自制社交按钮列表。CSS-Tricks 论证"自制分享按钮冗余"针对的是后者；本项省掉"去浏览器 chrome 找分享按钮"这层认知成本（iOS Safari 按钮位置随版本变） |
    | 重新加载 | ✅ | ❌ | 移动浏览器在页首内置**下拉刷新**。且本项目上一轮明确把 `touch-action: none` 从面板移除、主动把这条通道还给浏览器——保留「重新加载」等于刚把刷新能力还回去、又要求用户开面板去找它，**自相矛盾** |
    | 回到页面顶部 | ✅ | ❌ | NNGroup：4 屏以内属于 overkill，直接滑回去不费力；iOS 还有"点屏幕顶端回顶"的原生手势 |
    | 打印 / 保存为 PDF | ✅ | ❌ | iOS Safari（16+）**完全忽略** `window.print()`——不报错不弹窗；Android Chrome 默认隐藏打印入口。放一个必然静默失败的项是在浪费用户注意力 |
    - **不得因为"桌面有"就给移动端照搬**；新增动作时按上面那条标准分别判断两端是否成立。
    - **移动端面板项数少于桌面是正常的**，不要为"看起来对称"补项。少一项胜过让用户多点一次换一个他已有的能力。
  - **必须提供面板内可见的关闭控件**。桌面菜单的全部出口是「点外面 + Esc」——桌面有指针、有 hover、有 Esc；触屏全都没有，只有「点一块没有可点击暗示的暗色遮罩」。因此面板自带：头部 **✕ 按钮**（`[data-cm-close]`，44×44）、底部**取消条**（`[data-cm-close]`，≥48px）。遮罩只是兜底，**不得作为唯一关闭路径**。
  - **不得实现下拉关闭手势**（2026-10-13 项目所有者裁定，曾实现又移除）。实现它必须给面板头部加 `touch-action: none` 抢占触屏手势，代价是**整站页面顶部的下拉刷新同时被禁用**——移动浏览器把"在页首下拉"理解为用户要求重新加载。为"少点一次 ✕"牺牲刷新能力，方向反了。抓手因此降级为纯装饰（`.cm-sheet-grip`，4px 短横），**不得暗示可拖动**。
  - 取消条与具体动作之间留物理间隙 + 分隔线（iOS action sheet 约定）：「退出」不是一个动作项。
  - **操作项按「页面 / 设计 / 语言」三组分组**，组标题显性化；不得把所有项排成同优先级的一坨。`manualSwitch: false` 时「设计」整组消失。
  - 触屏打开面板时给首项的焦点是**程序性聚焦**，不得画任何视觉标记（`data-cm-key` 不预置）——触屏没有"当前项"，预高亮会被读成误选。
- **同一个能力不得在页面里出现两个入口**：上一轮刚论证「下拉刷新比下拉手势重要」、把面板上的 `touch-action: none` 移除以还给浏览器，下一轮却在同一块面板里留了「重新加载」——两处互相打脸。裁剪动作项时要从**整个平台的既有能力**出发检查，不是从「桌面菜单里有什么」出发。**移动端面板只有 2 项（复制链接 / 分享）是对的，不要为了对称把重新加载加回来。**
- **全站不得出现 `touch-action: none`**（除确有需要的元素）：它会一并禁掉该元素所在滚动链的**下拉刷新**。项目 chrome 一律 `auto`，靠 `overscroll-behavior` 控制滚动传递，两者职责不同（见 `m2.material.io` 与 `apostleacademy` 的对照）。
- **「点在面板外」的判定必须用 `contains()`，不能用 `=== 元素`**：点在按钮**内部的 `<svg>` 图标**上时 `event.target` 是图标而不是按钮，`===` 会漏判，后果是悬浮球刚打开面板就被同一笔点击的冒泡立刻关掉（v0.10.0 实测踩坑）。图标另外加 `pointer-events: none` 作为第二道保险。
- **接入范围**：8 套主题 × 3 语言、`/{locale}/designs/`、404。**四类"立即跳转"页不接**（`/`、`/{locale}/`、`/{design}/`、`/designs/`）——它们在 `<head>` 内同步跳转、停留不足一帧，挂菜单自相矛盾；其自带的 `<noscript>` 链接列表本身就是回退。
- **`manualSwitch: false`**：主题组整体不渲染（`designActionsEnabled: false`），`/designs/` 不构建（404）；**菜单本体与语言分组照常渲染**，页面操作与语言切换不受影响。配置中**没有** `enabled` 字段（v0.10.0 已删除——它恒为 `true`，无信息量，且与 `designActionsEnabled` 职责重复）。

## 动效（Motion）

- 机制见 `docs/adr/0001-motion-reveal-mechanism.md`（基础触发）与 `docs/adr/0003-differentiated-motion-enhancement.md`（差异化增强），术语见 `CONTEXT.md`；各设计当前采用情况见 `docs/verification/`。
- **定位：设计语言维度**。目标不是给所有元素增加动画，而是让每套设计拥有更丰富、更有辨识度的动态表现，同时保持各自的设计语言。每套设计必须在 `DESIGN.md` 中定义自己的动效语言（形态 / 节奏 / 参数）；允许极简（单一过渡、单动作），决定静止必须给出论证。
- **入场动画**：各设计私有纯 CSS `@keyframes`（无 JS 依赖），整体包在 `@media (prefers-reduced-motion: no-preference)` 内；减动态时不生成动画、元素保持自然可见态。
- **滚动显现**：共享 `src/lib/reveal.ts`（`IntersectionObserver`）只负责触发；目标加 `data-reveal`，首次进入视口置 `data-reveal-in` 并取消观察（只播一次）。时长 / 缓动 / 位移 / 错落顺序由各设计 `style.css` 自行维护。采用共享机制的设计在 `<head>` 放一次 `<Reveal />`；不用共享机制的设计必须在 `DESIGN.md` 说明替代触发方式，且仍须满足下文可见性契约。
- **装饰性滚动进度**：CSS Scroll-Driven Animations（`animation-timeline: scroll()`）仅允许用于装饰性进度指示，**不得用于内容显隐**；`@supports` 门控 + 不支持 / 减动态时整条隐藏；注意压缩器可能把 `animation-timeline` 合并进 `animation` 简写（产物中该简写在当前 Chromium 不被接受、整条失效），须以 `var()` 传入 timeline 阻断合并（本机已实测；记录见 `docs/verification/`）。
- **可见性契约（不可违反）**：内容默认可见；CSS 隐藏态必须以 `html[data-reveal-ready]` 为唯一门控，该属性只由 `src/components/Reveal.astro` 的内联 boot 在「非 reduced-motion 且支持 `IntersectionObserver`」时写入。无 JS / 脚本失败 / 无 IO / 减动态时内容必须始终可见。
- **运动约束**：只动 `opacity` / `transform`（交互态允许短促的颜色 / 下划线过渡）；避免过长延迟与影响阅读节奏；**核心内容不等待**——首屏动画必须秒级内落定，正文不做逐字打印。
- **持续动效（无限循环）**：仅限小范围、有明确视觉价值的形态类装饰（如流动波形、光标呼吸、进度指示），且必须在 `DESIGN.md` 中论证；其余一律只播一次；减动态时持续动效静止。
- `src/lib/reveal.ts` 与 `Reveal.astro` **不得 import 任何 CSS**（会触发下文"已知坑"的 CSS 聚合）。
- **规范与实现同步**：自撰规范（`self-produced` / `third-party-analysis` 复刻）的 Motion 章节必须与实现一致，改动前先修订规范；厂商来源（`official-vendor` 快照 / `official-docs-derived` 汇编——汇编为"整合完成即冻结"）的 `DESIGN.md` **不得修改**，适配方式与偏差记录在 `docs/designs/<id>/ADAPTATION.md` 与 `change-log/`。

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
- **品牌标志**：vendored 至 `src/assets/brand/`（simple-icons / CC0、单色 `currentColor`）；逐品牌核对商标规范，provenance（url / 日期 / 许可 / 核对结论）记入 `docs/verification/shared.md`。
- **样式归属**：尺寸 / 描边 / 颜色 / 间距 / hover 由各设计 `style.css` 控制；不建共享图标封装组件（隔离约束见"已知坑"）。**唯一例外**：共享操作菜单组件（项目级 chrome，见「页面级操作入口」节）统一使用 `@lucide/astro`、单一中性外观，不属于任何设计的图标系统，也不受各设计图标规范约束；各设计内容区的图标语言不受其影响。
- **现行语言**：各设计图标语言见各自 `DESIGN.md`；厂商来源（快照 / 汇编 / 复刻）的适配记录与各设计当前采用情况见 `docs/designs/*/ADAPTATION.md` 与 `docs/verification/`。

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

- **选型顺序（强制）**：新增主题必须先确定**设计隐喻与信息结构**（标题 / 正文 / 数字·技术标记的角色划分），再到本地字体库发现候选、经**真实文件样张目检**、过**许可闸门**后接入生产。**不得**按字体名关键词或审美形容词直接指定字体；**不得**跳过样张目检（名称含 `CJK` / `Japanese` 等词不代表实际覆盖）。完整流程与工具见 `docs/fonts/selection-guide.md`。
- **本地字体库（本机工作台）**：唯一入口 `.local-fonts/library/`（Windows 目录联接），唯一扫描工具 `.local-fonts/tools/scan-fonts.mjs`；扫描清单、样张工具与候选记录**只存 `.local-fonts/`**（已被 `.gitignore` 的 `.*/` 规则排除，**勿重复添加规则**），**不得**写入公开文档。
- **在线候选（补充通道）**：本地库不能满足设计意图时，可从不限于 Google Fonts 的开源来源补充候选——**先核验官方许可（OFL 注意 RFN）、再下载**，存 `.local-fonts/online-candidates/`（许可文件同目录），用同一扫描器与样张工具（第二实例）验证；清单见 `.local-fonts/online-font-candidates.json`。未核验许可**不得下载、不得预览、不得进入生产**；不得因站名含 Free / Open / Fonts 假定可再分发；CJK 优先子集 / 分片分发，禁止为少数字符引入超大字体。
- **本地 ≠ 生产（硬隔离）**：`.local-fonts/` 与 `F:\Fonts` 等本机路径**不得**被 `astro.config.mjs` / `src/` / `public/` 引用；字体库文件**不得**进入 `dist/`；扫描 / 预览工具**不得**引入新依赖（深解析复用 Astro 自带的 `fontkitten` / `fontace`）。
- **许可闸门**：只有**确认允许网站嵌入与再分发**的字体才能进入正式字体资源管线（字体内嵌许可字段与 `fsType` 嵌入位只作线索，必须人工核实；未核实 = 不可用，只能停留在本地候选）。需要保留声明的字体随该设计附 `SOURCE-LICENSE.txt`。
- **记录（强制）**：每次选型的六项记录（隐喻 → 角色分配 → 取舍理由 → 简中 / 日 / 英实际覆盖与回退 → 字重 / 可变轴 / 体积 / 许可 → 缺失回退顺序）写入：自产与复刻 → 该设计 `DESIGN.md`；厂商来源 → 该主题 `ADAPTATION.md`（`DESIGN.md` 只读）。
- **生产接线（现状不变）**：`astro.config.mjs` 的 `fonts` 注册（npm provider、`remote: false`）→ 页面 `<Font cssVariable ...>`（`astro:assets`）→ `style.css` 用 `@theme inline` 注册进 Tailwind；**回退栈必须包含系统中文**（推荐链见指南 §4）。
- 字体不能替代对布局、信息架构与交互的独立设计；不得为显得专业机械增加字体数量。

## 无障碍与响应式（Accessibility & Responsive）

- 页面每个分区必须有可访问名称（`aria-labelledby` 指向同区可见标签，或 `aria-label`）；装饰性符号 / 图形一律 `aria-hidden`，不得进入链接或控件的可访问名（可访问名由文本标签承担）。
- 纯图标交互控件必须提供可访问名称；不得仅通过颜色或图标形状传达关键状态，必要时配合文字或其他语义提示。
- 对比度硬底线为 WCAG AA（正文与低强度文本 ≥ 4.5:1）；设计自设更严档位（如 dim 档）时以更严者为准；每次新增 / 调整色值必须实测并记录数值。
- 触控目标在 `pointer: coarse` 环境下命中高度 ≥ 44px（以 padding 等不破坏桌面节奏的方式扩展）；hover 类交互必须由 `(hover: hover) and (pointer: fine)` 门控，触屏不得依赖 hover 触发。**共享操作菜单移动形态实测**：关闭 ✕ 44px、取消条 48px、抓手条 56px、操作项 50px、悬浮球 52×52px（ADR 0007）。
- 375px 宽无横向溢出、正文可读；跨视口布局保持 DOM 顺序与视觉层级一致，不得倒置。**固定定位元素（悬浮球 / 面板 / 桌面菜单）同样不得引入横向溢出**，且必须让开 `env(safe-area-inset-*)`。
- 键盘可达：交互元素可聚焦且焦点可见；新增交互组件须核对键盘操作路径。
- 桌面端内容区不得贴边：常见桌面宽度（约 1280–1536px）下，正文 / 卡片等内容须有可见的左右留白（内容 max-width 或侧边距至少其一显著生效）；满幅背景与装饰不受此限（2026-10-11 反馈沉淀）。

## 已知坑（均已实测，勿重复踩）

- **不要让任何多页共享的模块对设计页面 / CSS 建立动态导入边**：
  `import.meta.glob('./*/Page.astro')`（非 eager）这类写法会把它触达的所有 `style.css` 聚合进**每个**引用方的 `<link>`。
  文件存在性检查请用 `node:fs`（见 `src/designs/registry.ts`）。
- **设计路由用 `astro.config.mjs` 的 `injectRoute`**：`getStaticPaths` 不能引用页面 frontmatter 顶层的 glob 变量（构建拆包后报 `pages is not defined`）。副作用：新增 / 删除设计目录后需重启 `npm run dev`。
- **多语言不得改成动态 `[design]` / `[locale]` 路由**：那会把所有设计的 CSS 聚合进每个页面。正解是 `injectRoute` 把同一 entrypoint 注册到多个语言前缀（见 `docs/adr/0006-multilingual-static-routing.md`）。
- **Astro 原生 `i18n` 对本项目零增益**：实测开关两种配置的产物完全相同（37 页 `diff` 一致），唯一作用是让 `Astro.currentLocale` 有值——不配时它为 `UNDEFINED`。语言一律由 `resolveLocale(model, Astro.url.pathname)` 自解析。
- **拼接 locale 前缀必须带斜杠**：`base + localePrefix + '/' + target + '/'`。漏掉中间的 `/` 会产出 `/zh-cnfrost/` 这种废路径（2026-10-12 实测踩坑）。
- **`site.config.yaml` 里整段注释掉的键会解析成 `null` 而不是"缺失"**：`site:` 下全部注释时 `raw.site === null`，直接 `.default({})` 会构建失败；需 `z.preprocess((v) => v ?? {}, schema)`（用 `transform` 会把输出类型擦成 `{}`）。
- **多语言的资料条目 id 带目录前缀**：glob loader 对 `profiles/*.yaml` 产出的 id 是 `profiles/zh-cn`，匹配 locale 时取 `id.split('/').pop()`。
- **子菜单的导航层级按「焦点实际所在处」判定**：`items()` 必须按**当前层级**取项，否则子菜单项会混进主菜单的 `↑↓` 序列。判据是 `submenu.contains(document.activeElement)`，**不是** `subOpen`（子菜单是否已展开）——`↑↓` 移到触发项会自动展开子菜单但焦点仍留在触发项，若按 `subOpen` 判定则 `→` 进不去子菜单；反过来若按焦点判定但 `↑↓` 仍沿用 `subOpen` 同步收起，焦点进子菜单后每按一次 `↓` 都会把子菜单收起来、焦点随即丢失（2026-10-12 首记，v0.10.0 实测修正）。
- **`hidden` 属性必须有一条自己的 CSS 兜底**：作者样式表的优先级高于 UA 样式表的 `[hidden] { display: none }`，任何容器一旦声明了 `display: flex`（面板、悬浮球都声明了）就会**无视 `hidden` 恒常可见**——表现为「面板一直开着、点关闭无效、看不到悬浮球」。因此组件样式里必须显式写 `[hidden] { display: none }` 兜底（ADR 0007）。
- **两份 DOM 中被摘除的一方必须用 `hidden` 属性**，不要用 `display: none` / `visibility: hidden` 类——只有 `hidden` 会同时移出无障碍树，两份并存时否则会被读屏重复朗读（ADR 0007）。
- **面板的显隐只能由 open 状态驱动，绝不能写成 `sheet.hidden = !inTouchMode()`**：那等于「移动端永远打开面板」。形态切换时全部容器先收起，悬浮球是移动端唯一常驻入口。
- **入场动画不得让「动画未推进」等价于「元素不可见」**：面板动画起点若为 `translateY(100%)`，在后台标签页 / rAF 被节流 / 减动态切换等情况下动画可能全程不推进，面板就永远停在视口外，用户点悬浮球像没反应。两条纪律：① 起点用**部分**位移（本项目 `translateY(14%)`），保证退化时仍有相当部分在视口内可点；② **不用 `both` / `forwards` 等会把起始帧固化的 fill-mode**，并在 `animationend` 后摘掉触发属性让它回到无动画的自然终态（ADR 0007）。
- **`applyMode()` 落定形态时浮层菜单必须显式隐藏**：不要写成 `root.hidden = touchMode`（那会让桌面菜单常驻可见）；两份容器初始都 `hidden`，由 `applyMode()` 依据形态分别摘除（v0.10.0 实测踩坑）。
- **测量移动面板的位置必须等入场动画播完**：面板用 `translateY(100%)` 入场，动画未结束时 `getBoundingClientRect()` 返回的是动画中途位置（会看到 `bottom` 远超视口高度），容易被误判为 `position: fixed` 定位失败（v0.10.0 实测踩坑）。
- **内容层 glob loader 会归一化条目 id**（`site.config.yaml` → `"siteconfig"`）：取数用 `getCollection()` 取唯一条目，不要猜 id（见 `src/lib/site.ts`）。
- **Tailwind 不识别动态拼接的类名**（如 `border-${color}` 不会被扫描到）；需要安全列表时用 `@source inline("...")`。
- **`@astrojs/tailwind` 已弃用**，勿引入；Tailwind 4 官方集成 = `@tailwindcss/vite`（已配置）。
- 切换页 `/designs/` 在 `manualSwitch: false` 时**不构建**（404）；任一设计页不得留可见 / 可聚焦的切换入口（入口即共享操作菜单的**主题组**，与切换页同受 `manualSwitch` 门控——菜单本体与语言分组不受影响）。
- **Tailwind Preflight 把 `svg` 置为 `display: block`**：行内语境中的 svg 图标（文本旁的品牌 mark / 外链箭头）会折到下一行——必须显式 `display: inline-block`（flex 语境不受影响）。2026-10-10 由图标改动验证期 rect 实测暴露。
- **菜单运行时必须按能力门控动态加载**：`ContextMenu.astro` 用内联 `matchMedia` + 动态 `import()`（Vite 不给该 chunk 生成 `modulepreload`，dist 实测）；**不要改成静态 import**，否则纯文本浏览器会白白下载菜单逻辑。门控是「桌面鼠标 **或** 触控能力任一命中」（ADR 0007 修订——移动端也需要该运行时）。菜单样式用 `<style is:inline>`：不新增 `<link>`（"每设计页只链接自己的 CSS" 仍成立）。
- **`document.execCommand` 必须保持以 `document` 为 `this` 调用**：解构出的裸方法引用会抛 `Illegal invocation`（2026-10-10 降级复制路径实测踩坑）；该 API 虽被废弃，仍是 Clipboard API 不可用时的唯一同步降级路径，经自定义类型引用以避开 TS 废弃告警。
- **新增字体族的首次构建需联网**：npm provider（unifont）即使 `remote: false` 也把字体文件 URL 重写为 jsdelivr 地址；构建期 fallback metrics 会拉取该字体的二进制并缓存于 `node_modules/.astro/fonts/`（缓存后离线构建成立）。受限网络下先联网构建一次即可（本机 Node fetch 走代理需 `NODE_USE_ENV_PROXY=1`；2026-10-11 新字体族接入实测，SPEC §3.2 第 13 条）。

## 构建

- `npm run check`：`astro check`（TS / .astro 类型）
- `npm run build`：check + 构建；设计注册表校验失败时会以 `[senrenbanka]` 前缀明确报错
- 新设计页完成、或任一设计页 / 样式 / 构建配置 / 共享机制改动后：按 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）执行完整验证流程（步骤与通过标准以 skill 为准，本文件不重复维护清单）；验证状态更新至 `docs/verification/`（见「文档维护」节）
- 临时调整 `site.config.yaml`（如切 `mode: fixed`）验证行为后，请恢复示例配置再提交

## 文档维护（强制）

- 文档职责与引用关系见 `docs/README.md`（索引）；修改任何文档前先在该索引与既有记录中查找同一事实，避免重复维护。
- 新信息写入职责对应的既有文档，不因内容增加而随意新建文件：跨主题规则 → 本文件；单主题例外 / 适配 → `docs/designs/<id>/ADAPTATION.md`（仅确有例外时创建）；当前验证状态 → `docs/verification/`；版本历史 → `change-log/`；长期决策 → `docs/adr/`。
- 验证记录维护**最新完整状态**（更新式，不追加历史快照——历史由 Git 保留）；`change-log` 概括成果 / 修复 / 验证结论，不写逐次调试流水账。
- 官方原始 `DESIGN.md` **不得被改写成项目适配版本**（只读；偏差记入该主题 `ADAPTATION.md`）。
- 修改文档边界 / 章节位置后，必须同步更新全仓库引用（含 skill、ADR、change-log、源码注释），不留过期路径。

## 版本与变更日志

- 变更日志在 `change-log/` 下**一个版本一个文件，以版本号命名**（如 `change-log/0.1.0.md`）
- 版本规则：**大功能更新 `+0.1`**（0.1.0 → 0.2.0）；**小功能补丁 `+0.0.1`**（0.1.0 → 0.1.1）；与 `package.json` 的 `version` 保持同步
- 每次版本更新**新增**对应版本号的日志文件，不在旧文件上累积
- 日志内容概括该版本的重要成果、修复与验证结论；验证的**当前完整状态**在 `docs/verification/`，不在 change-log 重复维护

## 入库范围（git）

- skill 只入库**仓库定制化**的 `.agents/skills/design-page-verify/`；通用 skill（impeccable、grill-me 等）不入库
- `.trae/`、`.codex/`、`.impeccable/` 等本地工具目录不入库（规则见 `.gitignore`）
- 通用 skill 由使用者自行安装（如 impeccable：用于设计文档化 / 检测器 / 评审；`design-page-verify` 流程中的检测器步骤依赖它）
<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
