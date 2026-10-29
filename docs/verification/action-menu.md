# verification — 共享操作菜单（Action menu · ADR 0007）

> 本文件维护**共享操作菜单**（`ContextMenu.astro` + `context-menu.ts`）的当前完整验证状态。它的验证维度**跨设计、跨输入环境、跨配置**，与 `shared.md` 的"路由 / 字体 / Reveal / 资产 provenance"不同职责，因此独立成文（见 `docs/README.md`）。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill。
> 最近全流程验证：**2026-10-13（v0.10.0）**，本机 Chromium 实测（`astro preview` + Playwright），非模拟推断。
> 2026-10-28（HTML-only 子任务）：`html-only` 按 ADR 0009 明确排除在共享菜单接入范围之外，使用普通链接导航。本文件原有浏览器实测仍对应当时的 8 套 `styled` 设计；当前 17 套 `styled` 中，本日新增的 homepage99 已在桌面与 375px 触控环境实测菜单，其余 16 套的完整浏览器矩阵仍以 2026-10-13 / 10-19 记录为准。

## 形态与接入面

一份数据，两种容器形态。SSR 同时输出 `.cm`（桌面浮层）与 `.cm-sheet`（移动面板）+ `.cm-launcher`（悬浮球）+ `.cm-scrim`（遮罩），运行时按输入能力把不需要的那份设 `hidden`。

| 页面上下文 | 接入 | 身份条 | 随机主题 | 「切换设计…」 | 语言项目标 |
|---|---|---|---|---|---|
| `design`（`styled`；当前 17 套 × 3 语言 = 51 页） | ✅ | ✅ | 排除当前 | ✅ | `/{locale}/{同一主题}/` |
| `design`（`html-only`；3 页） | ❌（ADR 0009 显式例外） | — | — | — | 原生同主题语言链接 |
| `switcher`（3 页） | ✅ | ❌ | 全池（不排除不存在的当前） | ❌ 构建期不渲染 | `/{locale}/designs/` |
| `not-found`（`404.html`） | ✅ | ❌ | 全池 | ✅（受 `manualSwitch` 门控） | `/{locale}/` |
| `entry`（`/`、`/{locale}/`、旧路径跳转页） | ❌ | — | — | — | 现有 `<noscript>` 列表 |

产物实测：设计页 `cm-lang` **6** 个（桌面子菜单 3 + 面板平铺 3）、`aria-current="page"` **2** 个（两份各一）、`data-cm-sheet` / `data-cm-launcher` / `data-cm-scrim` 各 1。切换页 `data-cm-action="switch"` 计数 **0**、`<header class="cm-head">` 计数 **0**；404 同样无身份条。

## 桌面鼠标环境

- 打开：非交互区右键 / `Shift+F10`。实测 `clientX/clientY = (420, 260)` → 菜单 `left 422 / top 266`，尺寸 **216×374**，完全落在视口内；焦点落容器（`cm`）不预高亮首项。
- `Shift+F10`：标记键盘意图 → 打开后焦点落首项（`重新加载`）且 `data-cm-key` 焦点环生效。
- **原生菜单保留（实测三种情形）**：链接（`精选作品`）→ `defaultPrevented: false`、菜单不开；已选中文字 → 同上；非交互区 `main` → `defaultPrevented: true`、菜单打开。全页无条件拦截不存在。
- 键盘导航：主菜单 7 项 `↓` 循环 12 次未飞出菜单（`cm.contains(activeElement)` 为 true）；`Home` → 首项、`End` → 末项。
- 子菜单契约：主菜单 `↑` 回绕到语言触发项时自动展开（`aria-expanded="true"`）；`→` 进入子菜单并聚焦首个语言项；子菜单内 `↓` 循环 5 次为 `日本語 → English → 简体中文 → 日本語 → English`（不混进主菜单项）；`Home` / `End` 分别为首/末语言；`←` 归还焦点到触发项并收起；主菜单层级按 `←` 无任何动作（不与浏览器返回混淆）。点击触发项亦可展开（**不依赖 hover**）。
- 视口收敛：`openSubmenu()` 右侧放不下翻到左侧，纵向超界时收敛到 `innerHeight - margin - height`。

## 移动触控环境（375×812）

- 悬浮球：实测 **52×52px**（≥ `docs/rules/accessibility-responsive.md` 要求的 44px），让开 `env(safe-area-inset-*)`；反相配色（深色药丸 / 浅色药丸随系统明暗翻转），`:active` 缩放 0.94 提供按压反馈；`aria-label` 三语言分别为「打开快捷操作菜单」/「クイック操作メニューを開く」/「Open quick actions menu」，`aria-haspopup="true"`、`aria-expanded` 随开合翻转、`aria-controls="cm-sheet"`。面板打开时球淡出并 `pointer-events: none`（它的职责是"打开"，展开态下留在原位只会让人再点一次关闭）。
- **命中尺寸实测**（切换页 375×812）：关闭 ✕ **44px**、取消条 **48px**、操作项 **48px** —— 全部 ≥ 44px。
- **动作清单按端裁剪**（构建期，`ContextMenu.astro` 的 `desktopActions` 5 项 / `sheetActions` **2 项**）：
  - 移动端面板实测 `[data-cm-action]` = `copy` / `share`（切换页 + 随机 = 3 项、主题页 + 随机 + 切换设计 = 4 项）——**无 `reload`、无 `top`、无 `print`**。
  - 桌面浮层实测 `[data-cm-action]` = `reload` / `top` / `copy` / `print` / `share` / `random` / `switch` —— **三项全部仍在**。裁剪精确落在移动容器内，未误伤桌面。
  - 裁剪判断标准：**移动端浏览器 / 系统是否已原生提供这个动作**。`copy` / `share` 保留（前者原生长按地址栏拷贝要 2~3 步且把用户带离页面；后者 `navigator.share()` 唤起的就是系统原生分享表单本身），三项原生已提供的全部删除。
- **下拉刷新未被禁用**（本次移除手势的核心目的）：实测全页 `getComputedStyle(el).touchAction === 'none'` 的元素数 = **0**，`html` 的 `touch-action` = `auto`；面板关闭后 `html` `overflow: visible`、`cm-scroll-locked` 已移除。此前 `.cm-sheet-bar` 上的 `touch-action: none` 已连同手势实现一起删除。
- 面板布局：实测 **518px**（375×812 下**无需滚动**，`scrollHeight === clientHeight`），`bottom === innerHeight === 812`；`bar` 59px + `body` 394px + `foot` 65px，`bottom === innerHeight === 812`。`transform: none`（入场动画已 `animationend` 摘除触发属性，回到自然终态）。三轮裁剪（5 项 → 3 项 → **2 项**）后面板从 600px 收成 **518px**，从「需要滚动」变成「一屏放得下且底部不���空」。
- 背景滚动锁：打开时 `<html>` 计算样式 `overflow: hidden`、`class="cm-scroll-locked"`；关闭后 `visible` 且类被移除。面板 `overscroll-behavior: contain`（与锁滚动是两个不同问题，缺一不可）。
- **初始态**（主题页 / 切换页 / 404 三种上下文均实测）：面板 `display: none`、遮罩 `display: none`、悬浮球 `display: grid` —— 页面加载后面板不应常开。
- **关闭路径四条，全部实测通过**，每条都隐藏面板 + 隐藏遮罩 + 解锁滚动 + `aria-expanded` 回 `false`：
  1. 头部 ✕ 按钮（`[data-cm-close]`，44×44）
  2. 底部取消条（`[data-cm-close]`，48px）
  3. `Esc` 键
  4. 点遮罩
  关闭后悬浮球仍在（它是移动端唯一常驻入口），再次点击可重开。
  > **下拉关闭手势已于本轮移除**（项目所有者裁定：它抢占的触屏手势会让页面顶部的下拉刷新一并失效）。抓手 `.cm-sheet-grip` 现为纯装饰（4px 短横），**不暗示可拖动**；`.cm-sheet-bar` 的 `touch-action` 实测为 `auto`。
- 面板呈现（action sheet 三段结构，非桌面菜单的等比放大）：
  - **分组**：`.cm-sheet-group` 依次为「页面 / デザイン / 言語」（切换页与 404 无「设计」组的重复项）。`manualSwitch: false` 时「设计」整组消失。
  - **语言项平铺**：无二级子菜单，3 个语言项带 `Globe` 图标；当前语言项额外带**底色 + 勾选**（不只靠颜色，`aria-current="page"`）。
  - **身份条**仅 `design` 上下文有，实测渲染为一枚 chip（强调色圆点 + 设计名 + 「現在のデザイン」标签），与操作项形态区分——否则用户会以为点它有反应。
  - **首项不预高亮**：面板打开时给首项的焦点是程序性聚焦，`data-cm-key` 不预置、`background: transparent`，触屏上没有"当前项"。
  - **面板内滚动条隐藏**（`scrollbar-width: none` + `::-webkit-scrollbar { width: 0 }`）：留着会被读成"页面还能继续滚"，也会让文字列在有/无滚动条时对不齐。
- 无横向溢出：`scrollWidth - clientWidth = 0`（设计页 / 切换页 / 404 三处均实测）。
- **桌面端回归**（`mouse` 模式）：初始三容器全 `display: none` 且悬浮球不显示，右键打开桌面菜单并定位在视口内（宽 216px），身份条正常，`Esc` 关闭 —— **无回归**。桌面浮层**不**渲染 ✕ / 取消条（桌面有 Esc 和"点外面"，不需要面板内出口）。

## 混合输入设备

`sessionStorage` 键 `senrenbanka.input.v1`。实测：`touch` 起始 → 派发 `pointerdown(pointerType: 'mouse')` → `data-cm-input` 变 `mouse`、悬浮球隐藏、面板隐藏、桌面菜单可用；再派发 `pointerdown(pointerType: 'touch')` → 全部翻回。**形态跟随最后一次真实输入**，不因启用触屏而破坏桌面右键。

## 语言与主题跳转正交性

- `design` 页（`/ja/material3/`）：8 个随机目标**全为 `ja` 前缀**；池（排除 material3 后）= **7**，`excludesCurrent: true`；语言项 = `/zh-cn/material3/`、`/ja/material3/`、`/en/material3/`。
- `switcher` 页（`/zh-cn/designs/`）：8 个目标全为 `zh-cn`；无身份条；无「切换设计…」；随机实测跳转 `→ /zh-cn/oxide/`，存储写入 `{"designId":"oxide","expiresAt":1791989119493}`（`random` 模式 + `cacheHours: 24`）。
- `not-found`（`/nonexistent-path/` 真实 404）：语言项 = `/zh-cn/`、`/ja/`、`/en/`；有随机与切换页项；无身份条。
- 存储语义未变：`storageKey = senrenbanka.design.v1:root`（不含 locale）、`mode: random`、`cacheHours: 24`、`avoidRepeat: true`。语言切换**不会**重置主题偏好。

## 配置边界

- `manualSwitch: false` 实测：构建 **37 页**（切换页 3 页消失）；设计页 `data-cm-action="random"` / `"switch"` 计数均为 **0**，而 `data-cm-sheet` 与 `cm-lang` × 6 **仍在**——菜单本体与语言分组照常渲染，页面操作与语言切换不受影响。
- `navigator.share` 不可用：两份容器内的分享项均被移除（桌面 + 面板同时处理）。
- 剪贴板双失败：模拟 `navigator.clipboard.writeText` reject 且 `execCommand` 返回 false → Toast 显示「复制失败，请手动复制地址栏链接」、`data-cm-tone="error"`、`hidden: false`。
- 无 JS 回退：切换页与 404 的 `<noscript>` 各含 **3** 个 `.lang-switch-link`，目标分别为 `/{locale}/designs/` 与 `/{locale}/`；`styled` 设计页**不含**该回退（维持 v0.9.0 已裁定的取舍）。`html-only` 由 ADR 0009 的原生 `<nav>` 提供可见语言链接，不依赖菜单。
- **隐藏菜单 DOM 不是回退**：`.cm` 与 `.cm-sheet` 初始均带 `hidden`，悬浮球与交互逻辑也依赖运行时；无 JS 时其中的语言链接不可见、不可达。此前把移动面板静态 DOM 说成“无 JS 语言切换回退”的表述已更正。

## 构建与产物隔离

- 2026-10-13 的菜单浏览器矩阵记录为 **41 页**（当时 8 套 `styled`）；2026-10-28 当前静态构建为 **81 页**，并新增 HTML-only 产物门禁。homepage99 的桌面菜单、触控面板、语言导航与背景滚动锁已在本轮实测，见 `docs/verification/homepage99.md`。
- 每个 `styled` 设计页 CSS `<link>` 计数 = **1**；`html-only` 页面 = **0**，切换页与 404 = **0**（不误带设计样式）。菜单样式全部 `<style is:inline>`，不新增 `<link>`。
- 运行时 chunk `context-menu.*.js` 独立，页面内 `modulepreload` 计数 = **0**。启动门控为 `matchMedia('(hover: hover) and (any-pointer: fine)')` **或** `matchMedia('(any-pointer: coarse)')` 任一命中即动态 `import()`。
- 三语言 `launcherLabel` 与语言目标 URL 均正确本地化。

## 本版修正的缺陷（实测暴露）

1. **桌面态菜单常驻可见**：`applyMode()` 误写为 `root.hidden = touchMode`，导致桌面菜单容器初始不隐藏。修正为两份容器初始 `hidden`，由 `applyMode()` 分别摘除。
2. **`→` 无法进入子菜单 + 子菜单内 `↑↓` 循环错层**：层级判据原为 `subOpen`（子菜单是否已展开），但 `↑↓` 移到触发项会自动展开子菜单而焦点仍留在触发项，此时 `→` 被 `if (subOpen) return` 拦掉。改为按「焦点实际所在处」判定（`submenu.contains(document.activeElement)`），并让子菜单层级内不同步收起子菜单。修正后子菜单内 `↓` 正确循环。
3. **`data-cm-sub` 死代码清理**：该属性设置与移除都有、但无任何 CSS / JS 消费者。
4. **`hidden` 被作者样式压过 → 面板恒开、悬浮球不可见（项目所有者实测发现）**：`.cm-sheet` 与 `.cm-launcher` 都声明了 `display: flex`，而**作者样式表的优先级高于 UA 样式表的 `[hidden] { display: none }`**，两者无视 `hidden` 恒常可见。桌面菜单因未声明 `display` 而幸免，所以只有移动端出问题。修法：组件样式加 `[hidden] { display: none }` 兜底规则（覆盖 `.cm` / `.cm-submenu` / `.cm-sheet` / `.cm-launcher` / `.cm-scrim` / `.cm-toast` 六者）。
5. **面板显隐逻辑写反（项目所有者实测发现）**：`applyMode()` 写成 `sheet.hidden = !inTouchMode()`，移动端下恒为 `false` —— 等于"永远打开面板"。改为：形态切换时全部容器先收起，面板显隐只由 `show()` / `closeMenu()` 驱动，**悬浮球是移动端唯一常驻入口**。
6. **入场动画可能全程不推进**：面板动画起点原为 `translateY(100%)`，一旦动画未播完（后台标签页、`rAF` 节流、减动态切换），面板就永远停在视口外，用户点悬浮球像没反应。两条修法：① 起点收敛到 `translateY(14%)`，保证退化时仍有 86% 在视口内可点；② 不使用 `both` / `forwards` 等会固化起始帧的 fill-mode，并在 `animationend` 后摘掉 `data-cm-open` 让它回到无动画的自然终态。
7. **点悬浮球图标打不开面板（项目所有者实测发现）**：`document` 级 click / `pointerdown` 判定写的是 `target === launcher`，而**点在按钮内部的 `<svg>` 图标上时 `event.target` 是图标而不是按钮本身** → 判定失败 → 面板刚被 `show()` 打开，就被同一笔点击的冒泡立刻 `closeMenu()` 掉。点按钮的空白边缘之所以有效，只是因为那时 `target` 恰好就是按钮。修法：判定改为 `launcher.contains(target)` / `scrim.contains(target)`，图标另加 `pointer-events: none` 作第二道保险。
8. **面板无任何可见关闭控件（项目所有者实测发现）**：原先唯一的关闭路径是点遮罩——一块没有可点击暗示的暗色区域。桌面菜单这样设计成立（指针 + hover + Esc 三重出口），但触屏只剩这一条，用户被迫去"瞄准"遮罩。重做为 action sheet 三段结构：头部 ✕ 按钮（44px）、底部取消条（48px）、抓手条下拉手势（跟手 + 阈值 1/4 + 短滑回弹），遮罩降为兜底。
9. **面板背景透明（重做样式时引入并当场修复）**：把 `.cm-sheet` 从与桌面浮层共享的 `background` / `color` 规则里拆出来改贴边大表面时，漏了这两个属性 → 面板透明、页面内容直接透出。拆分共享规则后必须逐属性复核继承。
10. **面板内原生滚动条外露**：滚动条会被读成"页面还能继续滚"，也让文字列在有/无滚动条时对不齐。改为 `scrollbar-width: none` + `::-webkit-scrollbar { width: 0 }`（保留滚动能力，只隐藏轨道）。
11. **触屏下首项预高亮**：打开面板时预置了 `data-cm-key` + 焦点环，读起来像"误选了第一项"。触屏没有"当前项"概念，改为只给焦点不画标记（`.cm-sheet:not([data-cm-key]) .cm-item:focus { background: transparent }`），键盘 / 读屏用户按 ↑↓ 后才点亮。
12. **移动端存在桌面不适用的动作（项目所有者指出，已调研确认）**：
  - **「回到页面顶部」**：Nielsen Norman 的结论是「页面短于 4 屏时 Back to Top 属于 overkill——人们直接滑回去并不费力」。移动端惯性滚动甩一次就回顶，且 iOS 有多数设计师不知道的原生手势：点屏幕最顶端直接回顶。已从 `sheetActions` 移除，桌面保留。
  - **「打印 / 保存为 PDF」**：移动端是「点了没反应」。iOS Safari（iOS 16+）**完全忽略** `window.print()`——不报错、不弹窗；Android Chrome 默认隐藏打印入口（需手改 `chrome://flags`），部分国产定制浏览器完全移除响应逻辑。已从 `sheetActions` 移除，桌面保留。
  - 两项都改为**构建期裁剪**（`desktopActions` / `sheetActions` 两个清单），而非运行时 `hidden`——产物里移动面板根本不含这两项标记。
13. **下拉关闭手势抢占浏览器下拉刷新（项目所有者指出，比"多余"更严重）**：实现手势必须给 `.cm-sheet-bar` 加 `touch-action: none`，代价是**整站页面顶部的下拉刷新同时被禁用**（移动浏览器把"页首下拉"理解为用户要求重新加载）。Material 的 `ModalBottomSheet` 正是这个代价；但 Compose 那类实现的结论是——不打算靠下拉关 sheet 时应直接 `sheetGesturesEnabled = false`。为"少点一次 ✕"牺牲整站刷新能力，方向反了。**已移除整段手势实现**（`sheetBar` 查询、`dragStart` 状态、`pointerdown`/`pointermove`/`pointerup`/`pointercancel` 四个监听、`data-cm-dragging` 相关 CSS 与动画分支），抓手降级为 4px 纯装饰短横。
14. **「重新加载」与下拉刷新自相矛盾（项目所有者指出）**：上一轮刚论证「下拉刷新比下拉手势重要」、把 `.cm-sheet-bar` 的 `touch-action: none` 移除以把这条通道还给浏览器，下一轮却在同一块面板里留着「重新加载」——两处互相打脸。移动浏览器的页首下拉就是刷新，用户没有任何理由打开面板去找它。已从 `sheetActions` 移除，桌面保留（桌面肌肉记忆是 F5 / Ctrl+R，且右键菜单是"不离开当前位置拿操作"的入口）。
    - 由此确立裁剪的**判断标准**：不是"桌面菜单里有什么"，而是"**整个平台已经原生提供了什么**"。据此复查了保留的两项——`copy` 原生路径是长按地址栏（2~3 步且带离页面）、`share` 唤起的就是系统原生分享表单，二者都是缩短路径而非重复，保留成立。
15. **动作裁剪后版面重排**：面板三轮裁剪后从 600px（且 `body` 需滚动）收成 **518px**（375×812 下**无需滚动**）。项高 52→48px、组间距同步收紧，避免动作减少后底部留出一大段空白。组标题选择器从 `:first-child` 改为 `:first-of-type`——`cm-head` 身份条存在时它是 `body` 的第一个元素子节点，`:first-child` 会误命中导致首个分组丢失上边距。

## 未覆盖 / 需后续补测

- **`BASE_PATH=/demo` 的完整链路**：本机环境存在 `BASE_URL` 污染（产出 `/D:/Git/demo/...` 前缀），非本次改动引入；`/demo` 全链路断言本轮**未通过干净环境复测**，需在隔离环境重跑。
- **真机 Safari / iOS 的 `overscroll-behavior: contain` 穿透行为**：仅在 Chromium 仿真验证计算样式生效，未在 iOS 实机确认滚动不穿透。
- **移动端下拉刷新的真机确认**：已验证全页无 `touch-action: none`、`html` 溢出锁定正确解除（这是禁用下拉刷新的充分条件），但**未在真机浏览器上实际下拉触发刷新**。
- **被移除动作的平台行为依据来自文档调研，未逐一在真机复现**：iOS Safari 忽略 `window.print()`、Android Chrome 隐藏打印入口两条来自多个技术文档的一致描述，未在具体机型上实测。
- **退场动画**：已实现 200ms 退场（`data-cm-closing` + `animationend` 摘属性 + 260ms 定时兜底），headless 下动画不推进时兜底路径实测生效；**未在真实浏览器确认动画视觉时序**。
- **面板在 `dvh` / 软键盘弹出时的定位**：`max-height: min(82vh, 82dvh)` 已用 `dvh` 优先，理由记在样式注释；未在真机验证地址栏收缩与键盘弹出的组合情形。
- **大屏一体机 / 触屏笔记本实机**：混合输入切换逻辑用 `PointerEvent` 合成事件验证，未在真实混合设备上跑过。
- **`navigator.share` 真实分享流程**：仅验证了 API 缺失时的移除逻辑与 Toast 三态中的失败分支，未在真机验证系统分享面板。
- **8 套设计各自的移动端视觉复核**：本轮逐页核对了标记数量与正交性（脚本化断言），但面板在 8 套设计视觉语境下的观感只实测了 editorial（截图），其余 7 套待逐套目视复核。
- **打印 / PDF 实际输出**：仅验证按钮触发 `window.print()`，未核对打印样式。
