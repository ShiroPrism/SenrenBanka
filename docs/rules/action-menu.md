# 共享操作菜单

> **适用范围**：共享操作菜单的数据、触发方式、桌面与移动形态、键盘与状态语义。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0007-action-menu-site-wide-with-touch-launcher.md`](../adr/0007-action-menu-site-wide-with-touch-launcher.md)、[`../adr/0015-externalized-action-menu-css.md`](../adr/0015-externalized-action-menu-css.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 页面级操作入口：共享操作菜单（Action menu · ADR 0007）

术语：菜单本体叫**共享操作菜单**（`Action menu`），**桌面形态**叫 `Context menu`，**移动形态**叫**底部动作面板**，**移动端入口**叫**悬浮球**（`Launcher`）。`CONTEXT.md` 有完整定义。

- **唯一实现（`styled` 页面）**：`src/components/ContextMenu.astro`（标记 / 样式 / 配置注入）+ `src/lib/context-menu.ts`（运行时）。**禁止**每套 `styled` 设计复制菜单实现或自建切换入口；数据来自 `view.contextMenu`（设计页）或 `buildActionMenuConfig()`（基础设施页），构建期都在 `src/lib/site.ts` 派生。`html-only` 不渲染菜单，使用契约规定的原生链接导航。
- **样式分发**：菜单样式构建为单一共享 hash CSS（`_astro/ContextMenu.<hash>.css`），所有含菜单的页面链接它；不得退回逐页 `is:inline`，也不得把菜单样式复制进任何设计 `style.css`。`html-only` 不链接该 CSS。详见 [`../adr/0015-externalized-action-menu-css.md`](../adr/0015-externalized-action-menu-css.md)。
- **菜单链接项必须自持外观**：设计页常写以 `<body>` 类为作用域的链接规则（如 `.gv a` / `.lx a`，最高 (0,2,1)），菜单里的 `<a class="cm-item">` 不得继承它们。共享菜单 CSS 用 `.cm a.cm-item[role="menuitem"]` / `.cm-sheet a.cm-item[role="menuitem"]` 的 (0,3,1) 复位收回 `color` / `text-decoration` / `box-shadow` / `outline` / `transition`；菜单自身 hover / focus 底色提升到 (0,3,0)，压过设计页 `.design a:focus` 的 (0,2,1)。不得靠调整 `<link>` 顺序或给设计页加 `.cm` 例外来修；新增菜单链接项必须带 `role="menuitem"` 以命中该复位。
- **单语言构建**：`i18n.locales` 只有 1 项时，语言分组**整组不渲染**——桌面语言触发项与子菜单、移动面板语言分组、注入 JSON 的 `languages`、`LanguageSwitcher`、`html-only` 原生语言区均不得出现；不得留下空标题、空 `<ul>` 或空数组。语言项的目标规则仍为「目标 locale 覆盖当前设计则保持设计，否则落到默认设计」。
- **一份数据，两种容器形态**：SSR 同时输出两份 DOM（`.cm` 桌面浮层 / `.cm-sheet` 移动面板），运行时按输入能力把不需要的那份设为 `hidden`——**必须用 `hidden` 属性**（它同时移出无障碍树，不会被重复朗读），不要用 `display: none` 类。两份共享同一批 `<a href>` / `<button data-cm-action>` / Toast 容器与事件委托。**静态 DOM 不是无 JS 回退**：两份容器初始都带 `hidden`，悬浮球与菜单交互也依赖运行时；无 JS 时这些语言链接不可见、不可达。基础设施页的回退是单独的 `<noscript><LanguageSwitcher /></noscript>`。
- **触发方式**（与菜单本体解耦）：
  - 桌面：非交互区域右键 / `Shift+F10`，门控 `(hover: hover) and (any-pointer: fine)`。
  - 移动：点击悬浮球，门控 `(any-pointer: coarse)`。
  - **原生右键保留规则在两种环境下都不变**：链接、图片、输入控件、可编辑区、已选中文字、触屏来源（混合设备长按）一律交还浏览器原生菜单——**不得对全页无条件 `preventDefault()`**。移动端**不靠长按打开**，也不拦截原生长按与文本选择。
  - **混合输入设备按真实输入能力处理**：媒体查询只做初判，收到真实 `pointerdown` 的 `pointerType`（`touch` / `mouse`）即切换形态并记入**会话级 `sessionStorage`**（键 `senrenbanka.input.v1`）。该键**不得**与 `storageKeyFor()` 的主题偏好混用，也不得写入 `localStorage`。
- **页面上下文（`context`，判别联合）**：`design` / `switcher` / `not-found` 三值，**不得**假设每页都存在"当前主题"。它决定：身份条是否渲染（仅 `design`）、随机抽选是否排除当前（仅 `design`）、「全部设计」是否隐藏（`switcher` 上是重复动作，构建期就不渲染）、语言项目的目标 URL。
- **404 菜单跟随 404 display locale**：404 的菜单标签、分组标题、Toast、无障碍名称、当前语言标记、随机目标池、全部设计 href 与分享标题必须与页面展示语言一致。菜单仍只有一份 DOM；构建期注入各 Locale 的 runtime variant，运行时按 `html[data-404-locale]` 选择并更新，**不得**复制菜单 DOM，也**不得**固定使用默认 Locale 的菜单文案。决策见 [ADR 0025](../adr/0025-single-404-locale-resolution.md)。
- **菜单项**：页面操作（重新加载 / 回到顶部 / 复制当前页面链接 / 打印 / 分享页面）+ 主题操作（随机一个设计 / 全部设计）；`navigator.share` 不可用时移除「分享页面」；复制 / 分享结果以 Toast（`role="status"`）反馈，各配置语言各有文案。
- **随机语义**（与 `/designs/` 切换页、根脚本一致）：复用 `storageKey` 与 `{ designId, expiresAt }` 格式；**`design` 页**必须排除当前设计（保证确实切换），**`switcher` / `not-found`** 没有当前主题，走**全池**（绝不能排除一个不存在的"当前"）；`avoidRepeat` 时再尽量排除上次；仅一套启用设计时该项 `aria-disabled`（不得假装切换）；写入后直接导航目标设计的固定 URL；打开菜单 / 页面加载均不写存储。**随机主题在所有页面可用**。
- **语言偏好写入**：语言项是普通 `<a>`，默认导航不被拦截；显式激活 `.cm-lang` 时把目标 Locale path 写入独立键 `senrenbanka.locale.v1:<baseKey>`（桌面 / 移动共用同一逻辑，Ctrl-Cmd 点击与中键 `auxclick` 也写入）。直接访问 Locale 页面或其他导航不写偏好。`html-only` 没有共享菜单与运行时，语言点击不持久化。
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
- **接入范围**：所有 `styled` 设计 × 各语言、`/{locale}/designs/`、404。`html-only` 设计不接菜单，以原生导航替代。**四类"立即跳转"页不接**（`/`、`/{locale}/`、`/{design}/`、`/designs/`）——它们在 `<head>` 内同步跳转、停留不足一帧，挂菜单自相矛盾；其自带的 `<noscript>` 链接列表本身就是回退。
- **`manualSwitch: false`**：`styled` 菜单的主题组整体不渲染（`designActionsEnabled: false`），`html-only` 的「全部设计」链接不渲染，`/designs/` 不构建（404）；`styled` 的**菜单本体与语言分组照常渲染**，`html-only` 的语言导航也照常渲染。配置中**没有** `enabled` 字段（v0.10.0 已删除——它恒为 `true`，无信息量，且与 `designActionsEnabled` 职责重复）。
