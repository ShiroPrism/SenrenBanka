# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、各语言入口页、`/<locale>/designs/` 切换页（含**设计预览碎片**）、旧路径跳转页、404、语言切换器、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、**多语言路由测试矩阵**、资产 provenance。
> **共享操作菜单（桌面浮层 / 移动面板 / 悬浮球）的实测矩阵独立在 `docs/verification/action-menu.md`**——它跨设计、跨输入环境、跨配置，与本文件的路由 / 字体 / Reveal 职责不同。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近共享机制专项验证：**2026-10-30（20 个 local family 迁移到外部字体目录 + 离线构建 + CJK 审计）**；最近全流程基线为 2026-10-29（v0.17.0 六套可爱风设计 + 24 套切换预览）；此前 2026-10-19（切换页设计预览 16 套全铺 + 三列响应式栅格）、2026-10-28（第 17 套 `styled` 预览 homepage99 与第 18 套自包含预览 html-only）、2026-10-18（预览碎片 3 套原型）、2026-10-13（v0.10.0 操作菜单全站化，基础设施页部分）、2026-10-12（v0.9.0 多语言）；2026-10-11 文档治理迁移，无代码改动。
> 2026-10-28（HTML-only 子任务）：新增 `renderMode` 契约与构建末尾 `verify:html-only` 门禁。同日 `homepage99` styled 设计接入后，**当时**静态构建为 **81 页**（v0.17.0 当前为 **105 页**）；HTML-only 的桌面 / 320–375px / 无 CSS / 无 JS / 键盘检查证据见 `docs/verification/html-only.md`，Homepage '99 的浏览器实测见 `docs/verification/homepage99.md`。

## v0.17.0 集成验证（2026-10-29）

- 六套新增设计均为 `styled`：`fairy-kei`、`sticker-diary`、`pixel-pet-rpg`、`little-forest`、`cute-alism`、`magical-girl`；三语共 **18 页**，全部生成。
- `npm run check`：0 错误 / 0 警告 / 1 条既有 `lexicon` hint；`npm run build`：**105 页**；HTML-only 门禁 20/20。
- `styled` 设计页 CSS **23** 份，与 23 套 `styled` 设计一一对应；切换页另有 1 份聚合 CSS，`dist/_astro/*.css` 总数因此为 **24**。每套三语页面共享同一份自身 CSS，无跨主题聚合。
- 切换页 **24 张卡 / 24 个预览**；CSS **90,763 B**，HTML **109,462 B**，`@font-face` **87**；所有预览无焦点元素。
- 新增字体：Fredoka 29,784 B latin + 4,576 B latin-ext；LXGW WenKai GB 子集 301,340 B；`dist/_astro/fonts/` 共 70 个文件、2,117,824 B；0 第三方字体域名，0 `.local-fonts` 路径泄漏。
- 六套桌面 1440 / 375px 触控实测：无横向溢出；共享菜单、3 语言项、关闭 44px / 取消 48px、背景滚动锁均通过。
- Reveal 三套（fairy-kei / little-forest / cute-alism）通过正常、减动态、无 JS、无 IO、IO 抛错；滚动到底隐藏元素 0。
- 设计脚本三套（sticker-diary / pixel-pet-rpg / magical-girl）通过正常、强制失败与无 JS；压缩体积 1,058 B / 706 B / 646 B gzip，均低于 12KB。
- `BASE_PATH=/demo` 构建 105 页；六套样式、canonical、菜单与切换页链接全部带 `/demo` 前缀。
- 六套 `impeccable detect` 均为 `[]`；截图归档在 `.local-fonts/dev/preview/cute-2026-10-29/`。

## 字体准备与注册迁移（2026-10-30）

**目录与锁**

- 外部目录固定为 `SenrenBanka-fonts` catalog v1.0.0，catalog SHA-256 `3ec45b912b0cae17fad5438d4dbf7443fc108c65284bc8597923329bf3d55b4c`；20 个 family、578 个注册 variant、638 个 package 文件，package 总字节 **22,160,569**。
- `fonts.config.json` 是唯一人工启用表；`fonts:update` 通过固定 catalog URL/SHA 校验 schema、许可、外层包与内层逐文件哈希，生成 `fonts.lock.json`（14,841 B）、`fonts.catalog.json`（1,741,807 B）和 `src/fonts/generated.ts`（1,123,174 B）。
- 3 个 core-cjk family：Zhuque 161 variants / 5,998,018 B、LXGW 328 / 13,841,062 B、Ark Pixel 55 / 1,371,013 B。生成注册保留 20 个 family 的注册名、CSS 变量、回退、weight/style/stretch/unicode-range；Format 1452 的目录实际 weight 元数据为 500，人工 `variantOverrides` 保持站点历史注册 weight 400。构建实测 19 个 family 被页面实际引用并输出 CSS 变量；`TT2020 Base`（2 variants）仍注册且与旧配置一致，但迁移前后均无设计引用，因此不产生页面 CSS。
- 17 个 fixed family 的 **34/34** 个注册变体与迁移前 HEAD 中对应 WOFF2 逐字节 SHA-256 相等（证据见 `fixed-font-equivalence.json`）；3 个 core family 则从站内用字子集升级为外部目录完整 cmap 分片，属于经过批准的覆盖范围变化。
- 旧 `src/assets/fonts/` 中 56 个生产字体 / 许可文件已删除；只保留 `README.md` 与 `SOURCES.md`。Git 当前跟踪的 `.woff2/.woff/.ttf/.otf` 为 **0**；9 个不再使用的 Fontsource 直接依赖已移除，保留 6 个 npm provider family。

**准备与离线**

- `npm ci && npm run fonts:prepare -- --offline`：20/20 family 仅复核缓存，0 下载；`fonts:check` 重算 638 个缓存文件哈希并离线通过。
- Node 测试使用本地 HTTP catalog / package fixture 覆盖重复 update 幂等、外层与内层哈希、声明大小、路径穿越、symlink / hardlink、重复 / 未声明归档文件、缓存注入与两路并发 prepare；安装按 family 加锁，并在 marker-last 回退失败时恢复旧缓存。
- 删除 `node_modules/.astro/fonts/` 后，以 `HTTP_PROXY=http://127.0.0.1:9`、`HTTPS_PROXY=http://127.0.0.1:9`、`NODE_USE_ENV_PROXY=1` 执行完整 `npm run build`：**105 页绿**。6 个 Fontsource npm family 由 `localNpmProvider()` 将 unifont 返回的 jsdelivr URL 映射到安装包文件；`optimizedFallbacks:false` 单独并不足以阻止构建末段取件。
- 当前 `dist/_astro/fonts/`：**611** 个 WOFF2、总计 **22,404,240 B**；`dist` 全量 747 文件 / **35,171,037 B**。CSS / HTML / JS 中 `cdn.jsdelivr`、Google Fonts、第三方字体 URL 均为 **0**。`src/`、`astro.config.mjs`、锁 / 快照 / 生成模块与 `dist/` 中无 `.local-fonts`、`F:\SenrenBanka-fonts` 或旧 `src/assets/fonts/` 生产路径。
- `fonts:check` 与准备的 20 个缓存目录均使用相对缓存路径；`node_modules/.astro/fonts/` 可由本地已被校验的 WOFF2 重新生成，不构成额外网络依赖。

**HTML CJK 审计**

- `npm run fonts:audit`：扫描 **105** 个 HTML、**45** 个含核心字体变量的候选页、**60** 个未声明核心字体变量的页面；检查 **8,525** 个按页去重的 CJK 码位。可见文本提取会排除 `hidden` 菜单 / 浮层，字体变量只认 `<style>` 与 `style` 属性中的声明。
- 同一审计另检查 **131** 个 HTML / CSS / JS / JSON 产物：第三方字体 URL **0**、machine path / `.local-fonts` / 旧 `src/assets/fonts/` 引用 **0**。
- 发现 **32** 条缺字（5 个唯一字符：`輩 U+8F29`、`概 U+6982`、`護 U+8B77`、`術 U+8853`、`劇 U+5287`），集中在 Ark Pixel 的 pager / pixel-pet-rpg / radio / receipt 三语页面；按契约只警告，build 仍成功。先前 4 条 `変 U+5909` 来自初始 `hidden` 的共享菜单文案，不属于页面可见文本，已由可见文本解析修正。完整报告与页面、字符、码位、活动核心字体见 `docs/verification/assets/fonts-2026-10-30/audit-report.json`。

**浏览器字体实测（Chromium，1440×900）**

| 页面 | `document.fonts.check()` | WOFF2 请求 | 磁盘字节 | 外部字体请求 |
|---|---:|---:|---:|---:|
| `/zh-cn/archive/` | Sorts Mill Goudy / Courier Prime / Zhuque 均 `true`；Zhuque 30 loaded faces | 32 | 902,244 | 0 |
| `/zh-cn/cute-alism/` | Fredoka / LXGW / Inter / League Mono 均 `true`；LXGW 显式 `fonts.load()` 后 4 loaded faces | 7 | 230,804 | 0 |
| `/zh-cn/radio/` | Share Tech / Format 1452 / DSEG14 / Ark Pixel 均 `true`；Ark 3 loaded faces | 6 | 73,452 | 0 |
| `/zh-cn/frost/` | Inter `true`；1 loaded face | 1 | 48,256 | 0 |
| `/zh-cn/designs/` | Zhuque / Ark Pixel / LXGW 均 `true`；loaded faces 23 / 8 / 18；25 个字体变量、622 个 `@font-face` | 74 | 2,252,816 | 0 |

- 分片按页面实际 `unicode-range` 命中，没有下载 core family 的全部 578 个文件：归档 30/161、LXGW 4/328、Ark 3/55（切换页按三套预览实际文本合计 49 个核心分片）。
- 截图、`registration-summary.json` 与完整请求 URL / transfer / disk / SHA-256 证据在 `docs/verification/assets/fonts-2026-10-30/`；桌面与 375px 全页图均在滚动到底触发全部 Reveal 后采集，请求日志中的文件大小与 SHA-256 已逐项对当前 `dist` 复算。375×812 + `hasTouch/isMobile` 下 `pointer: coarse=true`，归档页无横向溢出；悬浮球 52×52，面板底边 812、关闭 44px、取消 48px、语言 3 项且每项 48px，两关闭路径均隐藏面板并解锁滚动；全页无 `touch-action:none`。
- `impeccable detect`：archive / cute-alism / radio 为 `[]`；frost 仅 2 条已登记的 `bounce-easing` 适配例外，无新增字体相关发现。

**未测 / 边界**

- 本轮按共享字体迁移做代表页浏览器实测，不重复执行 23 套 `styled` 的完整键盘 / 动效 / 对比度矩阵；这些设计的 CSS 与规范未改，历史验证继续有效，父级质量门可再跑全量 `design-page-verify`。
- `cute-alism` 的 CJK 字体栈把 `--font-lxgw` 放在 `--font-fredoka` / `--font-inter` 自带的系统中文字体回退之后；Chromium 实际排版会先命中系统中文，只有显式 `document.fonts.load()` 才加载 LXGW。迁移按 B5 保留既有 fallback 顺序，不在本任务内调整设计层字体栈；后续主题审查应决定是否把 `--font-lxgw` 提前。
- 浏览器网络字节同时记录 transfer 与磁盘字节；磁盘字节由当前 `dist` 文件回填，避免本地 HTTP 缓存把重复请求报告为 0 / 300 B。

## 规则文档入口（2026-10-29）

- 根 `AGENTS.md`：**26,568 → 4,010 字符**（减少 84.9%）；Trellis 托管区块逐字保留。
- 规则正文：`docs/rules/README.md` + 7 个主题文件；原 14 个二级章节、7 个三级章节全部有归口。
- 现行引用迁移：源码 29 处、现行 docs / SPEC / README / skill 16 处、活跃任务 7 处；历史 change-log 与归档任务保持原样。
- `npm run check:docs`：8 项 Node 内置测试通过，真实仓库门禁 `4010/7000 chars`；硬门禁还校验其链接指向正确正文。
- `npm run check`：0 错误 / 0 警告 / 1 条既有 `lexicon` hint。
- `npm run build`：当前 **105 页**（规则文档迁移当时为 81 页）；HTML-only 门禁 20 项测试通过（1 设计 × 3 locale）。
- 文档门禁覆盖：根预算、必需文件、相对链接、8 条硬门禁、Trellis 标记、跨文件重复二级标题。

## 设计渲染模式（ADR 0009）

- `design.json.renderMode` 取 `styled`（缺省）或 `html-only`。共同必交 `DESIGN.md` / `design.json` / `Page.astro` / `messages.ts`；`styled` 必须提供 `style.css`，`html-only` 必须不提供。
- `html-only` 的最终 HTML 只允许语义标记与 `canonical` / `alternate` / `icon` metadata 链接；禁止 `<style>`、`style` 属性、`<script>`、事件处理器、`iframe` / `object` / `embed`、stylesheet / preload、`javascript:` URL 与 meta refresh。
- 2026-10-28 静态检查：`html-only` 3 个 locale 页面均由产物验证器通过；`html-only` 目录无 `style.css` / `tokens.css`，其 `Preview.astro` 仅用于切换页且完全自包含。验证器另用 20 项 Node 内置测试覆盖上述禁令与 HTML tokenizer 边界。

## 构建与产物隔离

- `npm run build` **105 页**绿（`astro check` 0 错误 / 0 警告 / 1 条既有提示）：23 套 `styled` × 3 locale = 69 页、`html-only` 3 页、语言入口 3 页、切换页 3 页、根入口、404、24 个设计旧路径与旧 `/designs/` 各 1 页。HTML-only 产物门禁通过 `1 design × 3 locale = 3 page`。`manualSwitch:false` 时三语言的 `/designs/` 均不构建 → 404（本批未重跑该配置分支）。
- 根页 / 旧路径跳转页：**零**设计 CSS 链接、**零**菜单字节（它们不接共享菜单，ADR 0007 决策 6）。切换页与 404：**零**设计 CSS 链接（菜单样式为 `is:inline`），不含 `data-reveal-ready`（reveal 脚本仅存在于设计页）。
- 菜单样式为 `<style is:inline>`（不新增 `<link>`，"每个 `styled` 设计页只链接自己的 CSS" 成立）；`html-only` 页面无任何 stylesheet / script。运行时 chunk（`context-menu.*.js`）独立、无 `modulepreload`。详见 `action-menu.md`。
- `BASE_PATH=/demo` 全链路前缀正确（根脚本 / noscript / 切换页链接 / canonical / favicon / 菜单配置 JSON / 随机导航均带前缀）。
- 根路径零第三方请求（无字体 / CSS / JS 加载）。

## 行为矩阵（随机 / 固定 / 缓存 / 切换）

- 随机：存储有效→用存储；过期→重随机（`avoidRepeat` 排除上次）并写新窗口；`cacheHours=0` 有效窗口为 0。
- 固定：`manualSwitch:true` 有手选→用存储；无手选→default；`manualSwitch:false`→永远 default 且**不读写存储**（曾存缺陷，已修复并经浏览器实测：遗留存储被忽略）。
- 手选持久化：随机模式手选按 `cacheHours` 过期；固定模式手选 `expiresAt:null` 永久。
- 直达设计固定 URL **不写存储**；`enabled:false` 设计不进随机池与切换页、页面仍可直达。
- 仅 1 套启用设计：随机自然落它；菜单「随机一个设计」项 `aria-disabled` 且强制点击不导航。**菜单内随机在主题页排除当前、在切换页与 404 走全池**（ADR 0007；切换页没有"当前主题"，排除不存在的值是错的）。
- 无 JS：根页 `<noscript>` meta refresh → default + 链接列表；设计页 / 切换页内容可读、链接可导航。`styled` 设计页的菜单语言入口仍不可达；隐藏的 `.cm` / `.cm-sheet` 静态 DOM 不构成回退。`html-only` 的目录、语言与资料链接是普通 `<a>`，无 JS 仍完整可达。
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

- 现行 local family 链路为 `fonts.config.json` → `fonts.lock.json` / `fonts.catalog.json` → `src/fonts/generated.ts` → `.cache/fonts/` → `fontProviders.local()`；普通 build 先离线执行 `fonts:check`，缺缓存必须显式 prepare。
- 当前构建自托管 **611** 个 WOFF2 / **22,404,240 B**；20 个 local family 578 个注册 variant，6 个 Fontsource family 通过本地 URL 包装接入。全站无第三方字体 URL、无字体 preload。
- 回退栈含系统中文字体（示例资料中英混排验证通过）；`fonts:audit` 的当前缺字与候选范围见上节。
- `import.meta.env.BASE_URL` 在带 base 时不带尾斜杠（如 `'/demo'`）→ `src/lib/urls.ts` 归一化；`BASE_PATH=/demo` 前缀自检通过。

## 切换页设计预览（`Preview.astro`，2026-10-19 全铺；2026-10-28 模式边界）

切换页 `/{locale}/designs/` 为 **全部 24 套设计**渲染**装饰性缩略引述**。预览不是静态截图：它由各设计私有的 `Preview.astro` 在构建期生成，随设计、语言与内容更新，不需要截图维护管线。视觉签名覆盖布局骨架、字体角色、配色与标志性装饰；例如 terminal 保留琥珀屏 / 扫描线 / 命令行，receipt 保留长票 / 齿孔 / 点引导 / 红章，pager 保留机壳 / LCD / 状态栏，homepage99 保留左目录 / 主栏 / 徽章轨与施工条，html-only 呈现白纸式浏览器默认排版；v0.17.0 新增六套预览继续各自保留玩具盒、手帐、像素地图、森林小径、硬糖拼贴与魔法档案的独立签名。

**架构（沿用 10-18 定稿的三条硬约束）**

1. 预览**不 import** 本设计 `style.css`；样式只在组件 `<style>` 中，避免带入 Tailwind preflight、整页规则、动效与交互依赖。
2. 调色板单一来源为同目录 `tokens.css`，作用域为命名空间类 `:is(.ar, .ar-pv)`；**不得**出现 `:root`。字体角色仍留在正式页 `style.css` 的 `@theme inline`。
3. 预览发现 glob 只写在 `src/infra/SwitcherPage.astro` entrypoint（eager）；不得移入共享模块，否则建立到设计 CSS 的聚合边。

**三列响应式栅格**

`.infra` 内容宽度为 `min(74rem, calc(100% - 3rem))`；`.infra-list` 使用 `repeat(3, minmax(0, 1fr))`，间距 `1.5rem`。`<=60rem` 降为 2 列，`<=48rem` 强制 1 列。卡片内部为固定三段：`16 / 10` 预览画幅 + 标题 + 两行描述；所有卡片因此在同一栅格下尺寸一致，不靠 `stretch` 掩盖底部空洞。没有 JS、分页或断点监听。

**验收实测（本机 Chromium + 产物断言）**

| 断言 | 结果 |
|---|---|
| `npm run build` / `astro check`（历史基线 + 当前） | 2026-10-19 历史基线 **73 页**、2026-10-28 历史基线 **81 页**；v0.17.0 当前 **105 页**，0 错误 / 0 警告 / 1 条既有提示（`lexicon/Page.astro` 未用参数，与本任务无关） |
| 预览覆盖 | **24/24** 设计均有 `Preview.astro`，三语言切换页各渲染 **24 个**预览（共 24 张卡） |
| 切换页样式表 | **恰好 1 条** `SwitcherPage.*.css`，**90 763 B**；0 `--tw-`（无 preflight）、0 Tailwind 标记 |
| 切换页 `:root` 设计令牌 | **0**（框架 `--font-*` 变量不计入设计令牌） |
| 设计页隔离 | 23 套 `styled` × 3 语言 = **69 页**，每页恰 1 条自身 CSS、0 个预览组件规则；`html-only` 3 页均为 0 CSS / 0 预览选择器。v0.17.0 新增六套逐页核对；既有设计沿用 2026-10-19 / 10-28 记录 |
| 正式页等价 | 2026-10-19 历史记录中，6 个字体回退链调整的设计不再计入字节等价集合，其余 10 套与当时 HEAD 相等；v0.17.0 未重新执行这一历史等价矩阵 |
| `@source not` | 23/23 套 `styled` 的 `style.css` 均排除 `Preview.astro`；html-only 无 `style.css`，其预览样式只存在于切换页聚合 CSS |
| 预览可聚焦元素 | **0**；预览统一 `aria-hidden="true"`；24 个卡片链接无障碍名不含预览文字 |
| 栅格 | 1536 / 1280 / 1024 = 3 列；960 / 900 = 2 列；768 / 375 = 1 列；所有档位 0 横向溢出 |
| 卡片几何 | 2026-10-19 的 1536px 历史实测中 16/16 卡片均约 `379×333px`、预览均约 `353×221px`、描述区均 `46.2px`；2026-10-28 复测 homepage99 沿用固定三段结构。v0.17.0 产物确认 24 张卡均使用同一 `16 / 10` 三段合同，未重新记录几何尺寸 |
| 降级 | 2026-10-28 的 18-card 历史实测中 reduced-motion、无 JS、无 IO 均无隐藏预览；v0.17.0 的 24 张预览保持 SSR、无预览脚本、0 可聚焦元素。六套新增设计的 no-JS / reduced-motion 矩阵另见各主题验证记录 |
| 字体 | 2026-10-30 当前切换页 **622** 个 `@font-face` 声明，构建产物 **611** 个 woff2；zh-cn 运行时 **74** 个请求 / **2,252,816 B**，0 preload、0 第三方；分片按 `unicode-range` 惰性加载 |
| 检测器 | 21 套零发现；既有已记录例外：frost 2 条 `bounce-easing`、govuk 2 条 `overused-font`、oxide 1 条 `codex-grid-background`。v0.17.0 六套新增设计均为 `[]` |

**成本实测与规模评估**

| 口径 | 3 套原型（2026-10-18） | 18 套历史（2026-10-28） | 24 套当前（2026-10-29） | 114 套线性外推 |
|---|---|---|---|---|
| 切换页 CSS | 10 149 B | 58 050 B | **90 763 B** | ≈ 431 KB |
| 切换页 HTML（zh-cn） | 46.8 KB | 92 775 B | **109 462 B** | ≈ 520 KB |
| `@font-face` | 21（4 族） | 82 | **622**（20 local + 6 npm family 的完整分片注册） | 由字体族种类与完整 CJK 分片决定，**不随设计数线性增长** |
| 构建字体文件 | — | 67 | **611**（**22,404,240 B**） | 由预览实际渲染的文本与 `unicode-range` 决定 |

- 预览 CSS 在切换页聚合为**单个**样式表，三语言共享同一 entrypoint；24 套时 CSS 为 **90 763 B**、HTML 为 **109 462 B**。运行时字体总量必须继续按语言与 `unicode-range` 实测监控，不能只看 CSS；2026-10-19 的 1.14 MiB 数值只保留为历史基线。
- 24 套 CSS 仍为 **90,763 B**；到 114 套时约 **431 KB**，仍属可接受但需要监控。**本轮不引入**分页、搜索、筛选、按需加载或 iframe——这些会在 24 套时增加复杂度而没有实际收益。扩展至约 100 套时优先评估 `content-visibility: auto` 与分类；仍不引入必须依赖服务器的方案。
- CJK 字体成本：预览文字**允许**触发核心分片下载。2026-10-30 的 zh-cn 切换页实际请求 **74** 个 WOFF2 / **2,252,816 B**，其中 Zhuque / Ark Pixel / LXGW 分别加载 23 / 8 / 18 个分片；不 preload，0 第三方域名。历史 70 文件 / 2,117,824 B 是迁移前站内子集口径，不可用于当前容量估算。

**2026-10-19 旧设计字体审计后的历史成本口径**：九套旧设计的字体族并集未新增包；Oxide 从“声明了但未加载的两族”改为复用已有 Geist / Geist Mono，切换页当时为 **82** 个 `@font-face` 与 **38** 个生成族名，运行时由 0.14.0 的 22 个唯一 woff2 增至 **25** 个。这些数字只保留为迁移前历史；2026-10-30 当前状态是 **622** 个声明 / **611** 个构建字体文件 / zh-cn 切换页 **74** 个请求，不能用旧的 82 / 38 / 25 代表当前状态。九套的接线、覆盖、回退与许可记录分别见各自 `docs/verification/<id>.md` 及 `DESIGN.md` / `ADAPTATION.md`。

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
- 无 JS：正文可读；基础设施页通过 `<noscript>` 语言链接导航。`styled` 设计页的菜单 DOM 虽存在，但 `.cm` / `.cm-sheet` 初始带 `hidden` 且无法在无运行时下打开，语言入口不可达；`html-only` 使用自身可见的原生语言导航。
- Reveal 四情形（`/ja/kern/`）：normal 隐藏 0 / 门控 `true`；reduced-motion、无 `IntersectionObserver`、IO 抛错三种情形隐藏元素均为 **0** 且门控不写入。
- `BASE_PATH=/demo`：内部链接 / CSS / canonical / hreflang **全部带 `/demo`**，全站无遗漏；`/demo/zh-cn/` 仍正确解析为 `zh-CN`（部署 base 未被误判为语言代码）；右键菜单随机目标同样带 base 与 locale。
  **环境坑**：Git Bash 下必须 `MSYS2_ARG_CONV_EXCL='*'` **与** `--base /demo` 同时使用；只给 `BASE_PATH=/demo` 或只给 `--base /demo` 都会被 MSYS 转换成 `/D:/Git/demo`。

**文案纪律**：翻译只处理**已有**文案，不新增解释性 / 自我描述的句子（`docs/rules/data-and-i18n.md` 强制条款）。据此已删除 fast / frost / govuk / kern / material3 页脚的无意义直译「由同一份资料生成」——24 页页脚实测：fast / frost / kern 仅姓名；govuk 姓名 + OGL 许可声明；material3 姓名 + M3 来源署名；editorial / oxide / terminal 各保留其原有文案不变。

**共享文案本地化覆盖**：右键菜单静态标签（含新增的**语言分组标题**）+ `lib/context-menu.ts` 6 处运行时 Toast、切换页（标题/说明/计数句/当前标记）、入口页（含 noscript 文案）、404、语言选择器 `aria-label`——全部随语言切换。原 `InfraStyles.astro` 中由 CSS `content: ' · 当前 / current'` 生成的「当前」标记已改为切换页模板里的**真实元素**（可本地化、可被读屏读取），运行时按存储显隐。

## 资产 provenance

- `src/assets/brand/github.svg`：来源 simple-icons（CC0-1.0，canonical 仓库 `github.com/simple-icons/simple-icons`，经 jsDelivr 镜像获取，2026-10-10）；商标核对结论：GitHub Logos and Usage Policy 允许个人账户链接用途。
- Bluesky 专项商标政策未查证到——不使用；其余平台按需增补并**逐品牌核对规范**。
- 图标库：`@lucide/astro`（ISC，构建期内联、零客户端 JS）。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；降级 / 触控基于 Chromium 仿真。
- `navigator.share` 缺失路径以 stub 验证（未在真实 Firefox 桌面实测）；macOS 原生分享面板呈现未实测；Linux 桌面未实测。
- **`styled` 的无 JS 入口缺口**：共享操作菜单依赖运行时，因此 `styled` 设计页在无 JS 下没有菜单内的操作 / 语言入口；移动面板的静态 DOM 初始带 `hidden`，且需要悬浮球与运行时才能打开，不可达。切换页与 404 有 `<noscript>` 语言链接回退。该缺口是 v0.9.0 起沿用的取舍，v0.10.0 未改变（ADR 0007 决策 8），ADR 0009 仅让 `html-only` 通过普通链接规避。
- **旧路径未实现真正的 HTTP 301**：静态托管限制，当前为 meta refresh + canonical + noindex 的降级方案（SPEC §7.3）。
- **未做真实搜索引擎验证**：hreflang / canonical 的正确性仅经产物断言与浏览器实测，未经 Google / Bing 实际抓取验证。
- **语言自动检测为项目决策且未实现**：不按浏览器语言改写 URL、不使用 Cookie 语言检测。
- 样例资料为**虚构角色**，三语内容为示例翻译，未经专业译者校对；日文排版仅验证无溢出，未做日文 typographic 精修。
