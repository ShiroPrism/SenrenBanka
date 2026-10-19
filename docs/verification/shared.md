# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、各语言入口页、`/<locale>/designs/` 切换页（含**设计预览碎片**）、旧路径跳转页、404、语言切换器、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、**多语言路由测试矩阵**、资产 provenance。
> **共享操作菜单（桌面浮层 / 移动面板 / 悬浮球）的实测矩阵独立在 `docs/verification/action-menu.md`**——它跨设计、跨输入环境、跨配置，与本文件的路由 / 字体 / Reveal 职责不同。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近全流程验证：**2026-10-19（切换页设计预览 16 套全铺 + 三列响应式栅格）**；此前 2026-10-18（预览碎片 3 套原型）、2026-10-13（v0.10.0 操作菜单全站化，基础设施页部分）、2026-10-12（v0.9.0 多语言）；2026-10-11 文档治理迁移，无代码改动。

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

- 字体构建期自托管：本版 `dist/_astro/fonts/` 共 **67** 个 woff2 文件；切换页运行时按 `unicode-range` 实际请求 **25** 个，全站零第三方字体引用，设计页与切换页 `rel="preload"` 均为 0。
- 结论：npm provider 不填 face 的 subset 元数据、family 级 `subsets` 为空操作——**无法子集过滤**（preload 会带入未使用子集；latin 子集仍按 `unicode-range` 按需加载）。
- 回退栈含系统中文字体（示例资料中英混排验证通过）。
- `import.meta.env.BASE_URL` 在带 base 时不带尾斜杠（如 `'/demo'`）→ `src/lib/urls.ts` 归一化；`BASE_PATH=/demo` 前缀自检通过。

## 切换页设计预览（`Preview.astro`，2026-10-19 全铺）

切换页 `/{locale}/designs/` 为全部 **16 套**设计渲染**装饰性缩略引述**。预览不是静态截图：它由各设计私有的 `Preview.astro` 在构建期生成，随设计、语言与内容更新，不需要截图维护管线。视觉签名覆盖布局骨架、字体角色、配色与标志性装饰；例如 terminal 保留琥珀屏 / 扫描线 / 命令行，receipt 保留长票 / 齿孔 / 点引导 / 红章，pager 保留机壳 / LCD / 状态栏。

**架构（沿用 10-18 定稿的三条硬约束）**

1. 预览**不 import** 本设计 `style.css`；样式只在组件 `<style>` 中，避免带入 Tailwind preflight、整页规则、动效与交互依赖。
2. 调色板单一来源为同目录 `tokens.css`，作用域为命名空间类 `:is(.ar, .ar-pv)`；**不得**出现 `:root`。字体角色仍留在正式页 `style.css` 的 `@theme inline`。
3. 预览发现 glob 只写在 `src/infra/SwitcherPage.astro` entrypoint（eager）；不得移入共享模块，否则建立到设计 CSS 的聚合边。

**三列响应式栅格**

`.infra` 内容宽度为 `min(74rem, calc(100% - 3rem))`；`.infra-list` 使用 `repeat(3, minmax(0, 1fr))`，间距 `1.5rem`。`<=60rem` 降为 2 列，`<=48rem` 强制 1 列。卡片内部为固定三段：`16 / 10` 预览画幅 + 标题 + 两行描述；所有卡片因此在同一栅格下尺寸一致，不靠 `stretch` 掩盖底部空洞。没有 JS、分页或断点监听。

**验收实测（本机 Chromium + 产物断言）**

| 断言 | 结果 |
|---|---|
| `npm run build` / `astro check` | **73 页**绿；0 错误 / 0 警告 / 1 条既有提示（`lexicon/Page.astro` 未用参数，与本任务无关） |
| 预览覆盖 | **16/16** 设计均有 `Preview.astro`，三语言切换页均渲染 **16 个**预览 |
| 切换页样式表 | **恰好 1 条** `SwitcherPage.*.css`，**52 499 B**；0 `--tw-`（无 preflight）、0 Tailwind 标记 |
| 切换页 `:root` 设计令牌 | **0**（框架 `--font-*` 变量不计入设计令牌） |
| 设计页隔离 | 16 套 × 3 语言 = **48 页**逐一核对：每页恰 1 条自身 CSS、0 个预览选择器 |
| 正式页等价 | 本轮修改 6 个字族的回退链，`editorial` / `terminal` / `oxide` / `material3` / `kern` / `frost` 不再计入等价集合；其余 10 套仍与 HEAD 基线相等（字体审计未触及） |
| `@source not` | 16/16 套 `style.css` 均排除 `Preview.astro`；无预览属性文本注入正式页 |
| 预览可聚焦元素 | **0**；预览统一 `aria-hidden="true"`；16 个卡片链接无障碍名不含预览文字 |
| 栅格 | 1536 / 1280 / 1024 = 3 列；960 / 900 = 2 列；768 / 375 = 1 列；所有档位 0 横向溢出 |
| 卡片几何 | 1536px 实测 16/16 卡片均约 `379×333px`、预览均约 `353×221px`、描述区均 `46.2px`；1536 / 960 / 375 三档实机截图确认留白与分组正常 |
| 降级 | reduced-motion 下预览动画全停、无隐藏预览；无 JS（16 卡 / 16 预览 / 16 链接）、无 IO（0 隐藏、0 console 错误） |
| 字体 | **82** 个 `@font-face` 声明、由 **38** 个生成族名承载；运行时三语言各实际请求 **25** 个唯一 woff2，全部 HTTP 200；0 preload |
| 检测器 | 13 套零发现；既有已记录例外：frost 2 条 `bounce-easing`、govuk 2 条 `overused-font`、oxide 1 条 `codex-grid-background` |

**成本实测与规模评估**

| 口径 | 3 套原型（2026-10-18） | 16 套全铺（2026-10-19） | 114 套线性外推 |
|---|---|---|---|
| 切换页 CSS | 10 149 B | **52 499 B** | ≈ 374 KB |
| 切换页 HTML（zh-cn） | 46.8 KB | **89 969 B** | ≈ 641 KB |
| `@font-face` | 21（4 族） | **82**（38 个生成族名） | 由字体族种类决定，**不随设计数线性增长** |
| 实际字体文件 | — | **25** / locale（0.14.0 基线 22，+3；总计 **1,199,652 B**，约 **1.14 MiB**） | 由预览实际渲染的文本与 `unicode-range` 决定 |

- 预览 CSS 在切换页聚合为**单个**样式表，三语言共享同一 entrypoint；16 套时 CSS 体积与 DOM 节点数仍可控，但运行时字体总字节已达约 **1.14 MiB**（主要由现有 `Zhuque Fangsong` 约 252 KB 与 `TT2020 Style D` 约 311 KB 贡献），扩展时必须同时监控字体请求总量，不能只看 CSS。
- 16 套 CSS 现已接近 52 KB；到 114 套时约 374 KB，仍属可接受但需要监控。**本轮不引入**分页、搜索、筛选、按需加载或 iframe——这些会在 16 套时增加复杂度而没有实际收益。扩展至约 100 套时优先评估 `content-visibility: auto` 与分类；仍不引入必须依赖服务器的方案。
- CJK 字体成本：预览文字**允许**触发 CJK 子集下载（用户 2026-10-18 批准）。CJK 文件按 `unicode-range` 惰性加载，不 preload；三语言 25 个运行时字体文件是实际网络口径，不是 `@font-face` 声明数。

**2026-10-19 旧设计字体审计后的成本口径**：九套旧设计的字体族并集未新增包；Oxide 从“声明了但未加载的两族”改为复用已有 Geist / Geist Mono，切换页的 **82** 个 `@font-face` 与 **38** 个生成族名不变。运行时由 0.14.0 的 22 个唯一 woff2 增至 **25** 个（**净增 3 个文件、58,340 B**），增量全部来自 Oxide 预览实际渲染后的 Geist / Geist Mono 子集：Geist latin（29,400 B）、Geist Mono latin（23,128 B）与 Geist Mono 的 `symbols2` 子集（5,812 B，覆盖 `▁▂▃▄▅▆▇█└─`）；前两者替换了原先静默回退到系统字体的视觉声部，第三者是波形块字符按需请求。这个数字是**本次净增量**，不是整页字体总成本；后者见上表 **1,199,652 B**。预览仍只导出 `fonts` 数组，不各自声明 `<Font>`；字体按族去重、0 preload，CJK 子集按需下载。九套的接线、覆盖、回退与许可记录分别见各自 `docs/verification/<id>.md` 及 `DESIGN.md` / `ADAPTATION.md`。

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
