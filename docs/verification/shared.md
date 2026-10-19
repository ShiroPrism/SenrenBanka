# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、各语言入口页、`/<locale>/designs/` 切换页（含**设计预览碎片**）、旧路径跳转页、404、语言切换器、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、**多语言路由测试矩阵**、资产 provenance。
> **共享操作菜单（桌面浮层 / 移动面板 / 悬浮球）的实测矩阵独立在 `docs/verification/action-menu.md`**——它跨设计、跨输入环境、跨配置，与本文件的路由 / 字体 / Reveal 职责不同。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近全流程验证：**2026-10-18（切换页设计预览碎片，3 套原型）**；此前 2026-10-13（v0.10.0 操作菜单全站化，基础设施页部分）；2026-10-12（v0.9.0 多语言）；2026-10-10（v0.4.0）＋ v0.5.0 / v0.5.1（菜单）；2026-10-11 文档治理迁移，无代码改动。

## 构建与产物隔离

- `npm run build` **73 页**绿（`astro check` 0 错误 / 0 警告 / 1 条既有提示）；`manualSwitch:false` 时三语言的 `/designs/` 均不构建 → 404。
- 根页 / 旧路径跳转页：**零**设计 CSS 链接、**零**菜单字节（它们不接共享菜单，ADR 0007 决策 6）。切换页与 404：**零**设计 CSS 链接（菜单样式为 `is:inline`），不含 `data-reveal-ready`（reveal 脚本仅存在于设计页）。
- 菜单样式为 `<style is:inline>`（不新增 `<link>`，"每设计页只链接自己的 CSS" 成立）；运行时 chunk（`context-menu.*.js`）独立、无 `modulepreload`。详见 `action-menu.md`。
- `BASE_PATH=/demo` 全链路前缀正确（根脚本 / noscript / 切换页链接 / canonical / favicon / 菜单配置 JSON / 随机导航均带前缀）。
- 根路径零第三方请求（无字体 / CSS / JS 加载）。

## 行为矩阵（随机 / 固定 / 缓存 / 切换）

- 随机：存储有效→用存储；过期→重随机（`avoidRepeat` 排除上次）并写新窗口；`cacheHours=0` 有效窗口为 0。
- 固定：`manualSwitch:true` 有手选→用存储；无手选→default；`manualSwitch:false`→永远 default 且**不读写存储**（曾存缺陷，已修复并经浏览器实测：遗留存储被忽略）。
- 手选持久化：随机模式手选按 `cacheHours` 过期；固定模式手选 `expiresAt:null` 永久。
- 直达设计固定 URL **不写存储**；`enabled:false` 设计不进随机池与切换页、页面仍可直达。
- 仅 1 套启用设计：随机自然落它；菜单「随机一个设计」项 `aria-disabled` 且强制点击不导航。**菜单内随机在主题页排除当前、在切换页与 404 走全池**（ADR 0007；切换页没有"当前主题"，排除不存在的值是错的）。
- 无 JS：根页 `<noscript>` meta refresh → default + 链接列表；设计页 / 切换页内容可读、链接可导航。
- 存储键命名空间化（`senrenbanka.design.v1:<baseKey>`）；JSON 损坏 / 非法 id → 视为无效并回退（容错）。

## 共享操作菜单（Action menu，ADR 0007）

- 桌面浮层、移动端底部动作面板、悬浮球的完整实测矩阵（3 输入环境 × 3 页面上下文 × `manualSwitch` 两态、键盘契约、语言与主题正交性、无 JS 回退、本版修正的两个既有缺陷）**独立记录在 `docs/verification/action-menu.md`**。
- 本文件不再重复维护菜单细节。基础设施页（切换页 / 404）的接入状态见 `action-menu.md` 的「形态与接入面」表。

## 滚动显现机制（Reveal，ADR 0001）

- 观察 `[data-reveal]` → 首次进入视口置 `[data-reveal-in]` 并 `unobserve`（只播一次）；门控 `html[data-reveal-ready]` 由内联 boot 在「非 reduced-motion 且支持 `IntersectionObserver`」时同步写入。
- 降级四情形（Chromium 仿真）：reduced-motion（门控不写、动画 0、隐藏 0）、无 JS（门控不写、内容齐备）、无 IO（门控不写、隐藏 0）、IO 构造抛错（`try/catch` 撤销门控、隐藏 0）。
- 脚本失败安全网：内联计时安全网（2s 未初始化则撤销门控并全部揭示）+ 模块 `try/catch`。
- 跳转式滚动兜底：刷新恢复位置 / End 键 / 锚点跳转不产生 IO 通知，已加滚动补揭示；四页实测隐藏目标 0。
- 共享模块（`src/lib/reveal.ts` / `Reveal.astro`）不 import 任何 CSS。

## 字体与 base

- 字体构建期自托管：dist 内 9 个 woff2，全站零第三方字体引用；`rel="preload"` 四页均 0。
- 结论：npm provider 不填 face 的 subset 元数据、family 级 `subsets` 为空操作——**无法子集过滤**（preload 会带入未使用子集；latin 子集仍按 `unicode-range` 按需加载）。
- 回退栈含系统中文字体（示例资料中英混排验证通过）。
- `import.meta.env.BASE_URL` 在带 base 时不带尾斜杠（如 `'/demo'`）→ `src/lib/urls.ts` 归一化；`BASE_PATH=/demo` 前缀自检通过。

## 切换页设计预览（`Preview.astro`，2026-10-18）

切换页 `/{locale}/designs/` 为每套设计渲染一枚**装饰性缩略引述**。本轮落地 **3 套原型**（`terminal` 极端视觉 / `archive` `:root` 令牌风险 / `fast` 零字体成本），铺开范围待用户验收后决定。

**架构（三条硬约束，均由实测推导）**

1. 预览**不 import** 本设计 `style.css`（否则带进 Tailwind preflight 与整页规则）；样式走组件 `<style>`，目标 1–3KB。
2. 令牌**不得**在 `:root`——迁入同目录 `tokens.css`，作用域为命名空间类 `:is(.ar, .ar-pv)`。组件内联的 `:root` 不被 Astro 作用域化，会成为切换页的全局令牌泄漏。
3. 预览组件**不得**从共享模块 glob——glob 写在**切换页 entrypoint 内**（eager），既可自动发现、容忍缺失，又不建立到设计 CSS 的聚合边。

**令牌抽取是等价重构**：`dist/zh-cn/{archive,terminal,fast}/index.html` 与改动前基线**逐字节一致**（归一化 `Page.*.css` 文件名后 sha256 相等）。`archive` 的 `html` 规则是 `.ar` 的**祖先**，取不到后代作用域的自定义属性，故其取值改为字面量（`#1a120d` / `#6b5e4a`，与令牌同值）——实测计算值不变。

**本轮修复的真实缺陷**：`style.css` 的 `@source "./"` 会连带扫描同目录 `Preview.astro`，把其 `<style>` 里的属性文本（`display: flex` / `border:` / `transform:` / `flex-wrap:` / `ease-in-out`）当作候选工具类，把 `.flex` / `.border` / `.transform` / `.flex-wrap` / `.ease-in-out` 与配套 `@property` **注进正式页 CSS**（约 +1.3KB/页，且「改预览」会静默影响正式页样式）。已加 `@source not "./Preview.astro";`（Tailwind 4 否定来源语法，实测 4.3.3 支持）——修复后正式页新增工具类归零，仅剩既有 Tailwind 基线。

**验收实测（本机 Chromium + 产物断言）**

| 断言 | 结果 |
|---|---|
| `npm run build` / `astro check` | **73 页**绿；0 错误 / 0 警告 / 1 条既有提示（`lexicon/Page.astro` 未用参数，与本任务无关） |
| 切换页样式表链接 | **恰好 1 条**（`/_astro/SwitcherPage.*.css`，10 149 B）；**0** `--tw-`（无 preflight）、**0** 任一设计的整页选择器（`.ar-drawer` / `.tm-screen` / `.fs-page` / `.m3-` / `.gv-` / … 全 false） |
| 切换页 `:root` 设计令牌 | **0**（框架 `--font-*` 变量属不可避免一类） |
| 设计页预览选择器 | **0**（16 套 × 3 语言逐一核对）；每设计页仍**恰好 1 条**自身 CSS |
| 根页 / 404 / 语言入口页 | **0** 样式表链接 |
| `@font-face` 计数 | **21**（4 族去重）；**反证**：向 `terminal` 的 `fonts` 临时加入 `archive` 已用的族 → 仍为 21（非 30），已还原 |
| A7 无障碍（CDP 无障碍树） | 卡片链接可访问名 = displayName + 本地化描述；**预览文字零泄漏**（三语言）；预览 `aria-hidden="true"`、内部 **0** 可聚焦元素；Tab 走查 6 步均停在 `a.infra-card` |
| A8 回退 | 移出 `archive/Preview.astro` → 构建仍绿、卡片回退为 accent 色点、不破版；还原后哈希一致 |
| A6 视觉 | 三套预览对照正式页「一眼可认」：terminal 琥珀屏 + 扫描线 + `$ whoami`；archive 木抽屉 + 马尼拉卡 + 类目签 + 点引导 + 红章；fast 企业 hero + 品牌蓝按钮 + 三卡网格 |
| 降级 | reduced-motion 下动画全 `none`、内容可见；无 JS / 无 IO 内容齐备；三语言 console **0** 错误 |
| 375px 触控 | `pointer: coarse` 生效、**0** 横向溢出（三语言） |
| 对比度 | 预览内最低 5.00 / 6.75 / 5.16，均 ≥ 4.5:1 |

**成本实测与规模评估（A9）**

| 口径 | 基线（0 预览） | 3 套预览 | 外推 16 套 | 外推 114 套 |
|---|---|---|---|---|
| 切换页 CSS | 0 | **10.1KB**（单资源） | ≈ 54KB | ≈ 386KB |
| 切换页 HTML（zh-cn） | 35.6KB | **46.8KB** | ≈ 57KB | ≈ 188KB |
| `@font-face` | 0 | **21**（4 族） | 随**族数**增长，不随设计数 | 同左 |

- **瓶颈是 CSS 体积与 DOM 节点数，不是请求数**——预览 CSS 在切换页聚合为**单个**样式表（三语言共享同一 entrypoint）。
- 已否决方案（实测）：各设计 `style.css` 全量引入 = 16 套 209KB / 114 套 ~1.5MB；iframe 真实页 = 16 套 ~1MB / 114 套 ~7MB。
- 缓解次序：① `content-visibility: auto`（零 JS、静态兼容）兜底离屏卡片；② 保持预览极简（实测 2.1–3.8KB/套）。**分页 / 按需加载属过早优化，本轮不引入**（R7）。
- CJK 成本：预览文字**允许**触发 CJK 子集下载（用户 2026-10-18 批准）；仅 `archive` 预览渲染中文，其余不引入 CJK。

## 多语言路由测试矩阵（v0.9.0，2026-10-12）

**构建**：`npm run check` 0 错误 / 0 警告；`npm run build` **41 页**（3 语言 × 8 设计 = 24 设计页 + 3 语言入口 + 3 切换页 + 根入口 + 404 + 8 旧路径跳转 + 旧 `/designs/` 跳转）。

**架构实测结论**：Astro 7.3.8 原生 `i18n` 对本项目**零增益**——开启与关闭两种配置的产物页面清单 `diff` **完全一致**（37 页），它不生成重定向、不做 fallback；唯一作用是让 `Astro.currentLocale` 有值，**不配时实测为 `UNDEFINED`**。故采用 `injectRoute` 显式注册 + `resolveLocale()` 自解析（见 `docs/adr/0006-multilingual-static-routing.md`）。

**CSS 隔离（多语言未破坏原约束）**

| 断言 | 实测 |
|---|---|
| `dist/_astro/*.css` 总数 | **8**（= 设计数，未因语言增加） |
| 每页引用的设计 CSS | **恰好 1 个**；同一设计的 3 个语言页面引用**完全相同**的文件 |
| 根入口 / 404 / 语言入口 / 切换页 / 旧跳转页 | 设计 CSS 链接数 **0** |
| 消息模块的 CSS 边 | `src/i18n/messages.ts`、`src/designs/*/messages.ts` **不 import** 任何 CSS / `Page.astro` / `style.css` |

**逐语言 × 逐设计实测矩阵**（Playwright，24 页，桌面 1280×900 与 375×812 触控各一轮）

| 断言 | 结果 |
|---|---|
| `<html lang>` | 24/24 与 locale 相符（`zh-CN` / `ja` / `en`） |
| console 错误 | **0**（24 页） |
| 375px 横向溢出 | **0**（24 页，`scrollWidth - innerWidth = 0`） |
| 二级菜单内语言项 / `aria-current="page"` | **3 / 恰好 1**（24 页，悬浮展开后测） |
| 设计页残留可见语言切换器 | **0**（`.lang-switch` 计数，24 页） |
| 子菜单 `aria-label` / 触发项 `aria-expanded` | 已本地化；展开时 `aria-expanded="true"` |
| **18 语言扩展性** | 注入 18 种语言后主菜单仍 **8 项 / 374px**（与 3 语言一致），子菜单限高滚动且在视口内 |
| 切换语言保持主题 | 8/8 设计链接均保持同一 `<id>`；实点击 `/zh-cn/oxide/` → English 落点 `/en/oxide/` |

**SEO 实测**

| 页面 | robots | canonical | hreflang |
|---|---|---|---|
| `/<locale>/editorial/`（默认设计） | `index, follow` | 含 locale 前缀 | 3 语言互指 + `x-default` → `zh-cn` |
| `/<locale>/<非默认设计>/` | `noindex, follow` | 含 locale 前缀 | **0 个** `<link rel=alternate>` |
| `/`、各语言入口页、切换页、404 | `noindex, follow` | — | 0 |
| 旧 `/<design>/`、`/designs/` | `noindex, follow` | 指向默认语言版本 | 0 |

**路由与降级实测**

- **语言切换实测（右键菜单二级菜单内）**：24 页逐一打开右键菜单并悬浮展开子菜单，`cm-lang` 均 3 项、目标保持同一设计 id、`aria-current` 恰好 1 个；实点击 `/zh-cn/oxide/` 的 English 落点 `/en/oxide/`、`/ja/oxide/` → `/en/oxide/`（`lang=en`）。
- **二级菜单交互实测**：悬浮开启（含延迟）、点击切换开合、斜向移入子菜单不误关；子菜单默认贴右侧，放不下时翻转到左侧，纵向始终收敛在视口内。
- **键盘实测**：`↑↓` 在主菜单 8 项间循环**不飞出菜单**（修复前第 8 次 `↓` 会落到 BODY）；移到「语言」自动展开、移开收起；`→` 进入并聚焦首项、`←` 返回触发项；焦点环实测 `outline: 1.6px solid`。
- **重复排版已消除**：8 套设计的 `style.css` 中语言切换样式全部移除（约 **9.4 KB**），各设计 `style.css` 现与改动前**逐字节一致**（仅末尾换行）——文案本地化与入口重构**零视觉漂移**，检测器状态回到改动前基线。
- 语言入口：`/zh-cn/` → `/zh-cn/frost/`、`/ja/` → `/ja/frost/`、`/en/` → `/en/frost/`（**均保留自身 locale 前缀**）。
- 根路径 `/` → `/zh-cn/frost/`（进入**默认语言**，不按浏览器语言改写 URL，无 Cookie 检测）。
- 旧路径兼容：`/editorial/` → `/zh-cn/editorial/`、`/designs/` → `/zh-cn/designs/`、`/terminal/` → `/zh-cn/terminal/`（meta refresh + canonical + noindex）。**真正的 HTTP 301 未实现**——静态托管下由平台配置决定，属明确声明的降级（SPEC §7.3）。
- `manualSwitch: false` + `mode: fixed`：切换页与旧 `/designs/` **均不构建**（37 页）；菜单内**主题切换项不渲染**（`data-cm-action="random"` / `switch"` 计数 0），**但菜单与语言分组照常渲染**（`cm-lang` 仍 3 项）——语言切换不受 `manualSwitch` 影响；测后已恢复示例配置。
- 无 JS：正文可读、语言链接在基础设施页仍可导航；**语言项是普通 `<a>`，无 JS 时菜单 DOM 仍存在**（样式内联），但菜单交互依赖运行时。
- Reveal 四情形（`/ja/kern/`）：normal 隐藏 0 / 门控 `true`；reduced-motion、无 `IntersectionObserver`、IO 抛错三种情形隐藏元素均为 **0** 且门控不写入。
- `BASE_PATH=/demo`：内部链接 / CSS / canonical / hreflang **全部带 `/demo`**，全站无遗漏；`/demo/zh-cn/` 仍正确解析为 `zh-CN`（部署 base 未被误判为语言代码）；右键菜单随机目标同样带 base 与 locale。
  **环境坑**：Git Bash 下必须 `MSYS2_ARG_CONV_EXCL='*'` **与** `--base /demo` 同时使用；只给 `BASE_PATH=/demo` 或只给 `--base /demo` 都会被 MSYS 转换成 `/D:/Git/demo`。

**文案纪律**：翻译只处理**已有**文案，不新增解释性 / 自我描述的句子（`AGENTS.md` 强制条款）。据此已删除 fast / frost / govuk / kern / material3 页脚的无意义直译「由同一份资料生成」——24 页页脚实测：fast / frost / kern 仅姓名；govuk 姓名 + OGL 许可声明；material3 姓名 + M3 来源署名；editorial / oxide / terminal 各保留其原有文案不变。

**共享文案本地化覆盖**：右键菜单静态标签（含新增的**语言分组标题**）+ `lib/context-menu.ts` 6 处运行时 Toast、切换页（标题/说明/计数句/当前标记）、入口页（含 noscript 文案）、404、语言选择器 `aria-label`——全部随语言切换。原 `InfraStyles.astro` 中由 CSS `content: ' · 当前 / current'` 生成的「当前」标记已改为切换页模板里的**真实元素**（可本地化、可被读屏读取），运行时按存储显隐。

## 资产 provenance

- `src/assets/brand/github.svg`：来源 simple-icons（CC0-1.0，canonical 仓库 `github.com/simple-icons/simple-icons`，经 jsDelivr 镜像获取，2026-10-10）；商标核对结论：GitHub Logos and Usage Policy 允许个人账户链接用途。
- Bluesky 专项商标政策未查证到——不使用；其余平台按需增补并**逐品牌核对规范**。
- 图标库：`@lucide/astro`（ISC，构建期内联、零客户端 JS）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；降级 / 触控基于 Chromium 仿真。
- `navigator.share` 缺失路径以 stub 验证（未在真实 Firefox 桌面实测）；macOS 原生分享面板呈现未实测；Linux 桌面未实测。
- **无 JS 时的入口覆盖不均**：共享操作菜单依赖运行时，因此设计页在无 JS 下没有页内操作 / 语言切换入口（移动端面板的静态 DOM 也不可达，因为它需要点击悬浮球）；切换页与 404 有 `<noscript>` 语言链接回退。设计页这一项是 v0.9.0 起沿用的取舍，v0.10.0 未改变（ADR 0007 决策 8）。
- **旧路径未实现真正的 HTTP 301**：静态托管限制，当前为 meta refresh + canonical + noindex 的降级方案（SPEC §7.3）。
- **未做真实搜索引擎验证**：hreflang / canonical 的正确性仅经产物断言与浏览器实测，未经 Google / Bing 实际抓取验证。
- **语言自动检测为项目决策且未实现**：不按浏览器语言改写 URL、不使用 Cookie 语言检测。
- 样例资料为**虚构角色**，三语内容为示例翻译，未经专业译者校对；日文排版仅验证无溢出，未做日文 typographic 精修。
