# verification — 共享机制与基础设施（shared）

> 本文件维护**共享机制**（不属于任何单一设计）的当前完整验证状态：根路由页、各语言入口页、`/<locale>/designs/` 切换页（含**设计预览碎片**）、旧路径跳转页、404、语言切换器、滚动显现机制（Reveal）、字体与 base 处理、行为矩阵、**多语言路由测试矩阵**、资产 provenance。
> **共享操作菜单（桌面浮层 / 移动面板 / 悬浮球）的实测矩阵独立在 `docs/verification/action-menu.md`**——它跨设计、跨输入环境、跨配置，与本文件的路由 / 字体 / Reveal 职责不同。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）；各设计自身的状态见 `docs/verification/<id>.md`。
> 验证步骤与通过标准见 `design-page-verify` skill；记录归属见 `docs/README.md`。
> 最近共享机制专项验证：**2026-11-01（Prettier + ESLint + LF 行尾工具链，ADR 0020；同日字体语料按引用页 + 旧路径跳转页样式精简，ADR 0019；繁中全设计，ADR 0018）**；此前 2026-11-01（韩语全设计字体层 + 22 套韩语内容扩覆盖，ADR 0017）、2026-10-31（韩语首批 + 设计语言覆盖 + 菜单 CSS 外置，ADR 0015 / 0016）、2026-10-31（v0.20.0 核心字体内容子集 + source cache + 子集 cmap 审计 + 10 MiB 体积门禁）、2026-10-31（v0.19.0 构建期分片裁剪 + 字体 CSS 外置 + 部署集合审计 + 15 MiB 门禁）、2026-10-30（v0.18.0 外部字体目录 + 完整 CJK 分片 + primary-only Font 变量 + 设计 CSS 回退链）；最近全流程基线为 2026-10-29（v0.17.0 六套可爱风设计 + 24 套切换预览）；此前 2026-10-19（切换页设计预览 16 套全铺 + 三列响应式栅格）、2026-10-28（第 17 套 `styled` 预览 homepage99 与第 18 套自包含预览 html-only）、2026-10-18（预览碎片 3 套原型）、2026-10-13（v0.10.0 操作菜单全站化，基础设施页部分）、2026-10-12（v0.9.0 多语言）；2026-10-11 文档治理迁移，无代码改动。
> **2026-11-01 Prettier + ESLint + LF 行尾（ADR 0020）**：新增 Prettier 3 / ESLint 10 / EditorConfig / `.gitattributes` LF 约束，`check:eol` / `lint` / `format:check` 接入 `npm run check`（build 与 CI 强制）。152 个文件格式化（+8,576/-5,055），未触碰 docs Markdown 与生成物；ESLint **69 → 0**，`Preview.astro` 的 `fonts` 导出一处路径级豁免。`npm test` **84/84**、`npm run build` 175 页、`astro check` 0 error；`dist` **7,632,396 → 7,634,316 B**（+0.025%）；175 页可见文本逐页一致，格式化前/后 HEAD 构建在动效禁用条件下 6 页 × 2 视口像素差 **0**；切换页 27 个预览正常；`fonts:audit` 0 部署缺口 / 0 孤儿。`git ls-files --eol` 文本全部 LF。详见 `lint-format-tooling.md`。未测：Firefox/Safari/真机、200% 缩放、`--base`、完整 28 套设计验证矩阵。
> **2026-11-01 字体语料按引用页（ADR 0019）**：`fonts:subset` 从全站统一语料改为每族只收录实际声明该族 `@font-face` 的页面语料 + 全部共享非 HTML 资产；未引用族跳过，Hangul 族在每族语料上继续过滤 Hangul。14 族 **2,774,444 → 1,625,116 B**（8 个非 Hangul 2,590,852 → 1,502,884；Hangul 183,592 → 122,232，各 250–297 字）；`dist` **8,781,724 → 7,632,396 B（7.28 MiB）**；`fonts:audit` 0 孤儿 / **0 部署缺口** / 64 条既有源字体缺字警告；`npm test` **80/80**。6 个代表页（5 语言 + html-only）浏览器实测：TC 页只加载 TC 子集、非 TC 页不加载，0 console / 0 4xx / 375px 无横向溢出。详见 `font-corpus-scope.md`，截图 `assets/font-scope-*.png`。未测：Firefox/Safari/真机、200% 缩放、`--base`、CDP 平台字体信息。
> **2026-11-01 旧路径跳转页样式精简**：`LegacyRedirect` 改用专用 `LegacyRedirectStyles.astro`，只内联实际使用的 9 条规则；`InfraStyles` 与根页 / 5 个语言入口 / 5 个切换页 / 404 未改动且 12 个文件 SHA-256 与字节数完全一致。28 个跳转页 **119,080 → 45,076 B**，单页最大 **1,633 B**、单页样式 **1,092 B**；`dist` **8,855,728 → 8,781,724 B**。`npm run build` 175 页、`astro check` 0 error、`npm test` **79/79**、`fonts:audit` 0 孤儿 / 0 部署缺口。浏览器实测：真实跳转 `/brutal/` → `/zh-cn/brutal/`、console 0；精简样式与完整 `InfraStyles` 基线在亮/暗色 × 1440/375 的计算样式 **0 差异**，截图像素差 **0**。详见 `legacy-redirect-style.md`，截图 `assets/redirect-trim-*.png`。未测：Firefox/Safari/真机、200% 缩放、`--base`。
> **2026-11-01 繁中全设计（ADR 0018）**：新增第 5 语言 `zh-TW`；5 个 TC `core-cjk` 族（Noto Sans TC / Noto Serif TC / LXGW WenKai TC / Fusion Pixel TC / Noto Sans Mono CJK TC，`scripts:["cjk","han-traditional"]`）；页面级 `html:lang(zh-TW)` 变量重映射，TC `<Font>` 仅 TC 页注册；8 套系统 CJK 设计把韩文伴生槽位重映射到 TC 族。`npm run build` **175 页**、`dist` **8,845,322 B（8.44 MiB）**、核心子集 **14 族 / 2,756,908 B**、字体 **45 文件 / 3,668,492 B**、`fonts:audit` 677 规则 / 0 孤儿 / **0 部署缺口** / 64 条源字体缺字警告、`npm test` **79/79**。代表页面 editorial/archive/fast/pager/terminal/html-only 浏览器实测通过；375×812 + `tap()` 面板、四种降级隐藏元素 0。catalog v1.2.0 已公开发布，lock 指向公开 URL；TC 文案仍需用户终审。详见 `docs/verification/traditional-chinese.md`。
> **2026-11-01 22 套韩语内容扩覆盖（C3）**：22 套 `design.json` 加 `ko`、`messages.ts` 加 `ko`、`descriptions.ts` 27 条、`Page.astro` 加韩语 `<Font>`；`fonts:coverage` **27 设计**、`npm run build` **146 页**、`dist` **6,056,936 B（5.78 MiB）**、字体 **40 文件 / 1,775,340 B**、核心子集 **9 族 / 863,756 B**（6 个韩语族各 **454** 字符）、`fonts:audit` 556 规则 / 0 孤儿 / **0 部署缺口** / 60 条源字体缺字警告；22 个新 ko 页在 **375×812** 与 **1280×800** 冒烟全部 200 / `lang=ko` / 韩语字体加载 / 无横向溢出 / 0 console；6 族抽样截图 `assets/korean-c3-{archive,brutal,cute-alism,pager,sticker-diary,terminal}.png`。韩语文案已人工审校（用户确认 2026-11-01）；完整逐页菜单/无 JS/对比度/动效矩阵未重跑。
>
> **2026-11-01 韩语全设计字体层（C1/C2，ADR 0017）**：字体仓库发布 catalog v1.1.0（6 个韩语核心族，`scripts: ["hangul"]`，既有 20 族 package/source 字节不变）；主站接入 26 族 / 939 variants。`npm run build` **124 页**、`dist` **5,253,947 B（5.01 MiB）**、字体 **36 文件 / 1,642,072 B**、核心子集 **795,032 B**（9 族；6 个 Hangul-only 子集各 277 字符）、`fonts:audit` 364 规则 / 0 孤儿 / **0 部署缺口** / 56 条源字体缺字警告、`fonts:coverage` **5 设计通过**、`npm test` **74/74**、`npm run check` 0 error / 1 既有 hint。5 套 ko 页面浏览器实测：editorial 加载 Gowun Batang、frost/fast/govuk 加载 Gothic A1、html-only 0 字体 / 0 样式；`/ja/fast/` 的 Gothic A1 未加载（无韩文，不下载子集）。截图 `assets/korean-{editorial-desktop,editorial-375,frost-desktop,fast-desktop,govuk-desktop,html-only-desktop}.png`。未重跑完整 5 套 ko 页的 1440/375/菜单/无 JS/对比度全矩阵。
>
> 2026-10-28（HTML-only 子任务）：新增 `renderMode` 契约与构建末尾 `verify:html-only` 门禁。同日 `homepage99` styled 设计接入后，**当时**静态构建为 **81 页**（v0.17.0 当前为 **105 页**）；HTML-only 的桌面 / 320–375px / 无 CSS / 无 JS / 键盘检查证据见 `docs/verification/html-only.md`，Homepage '99 的浏览器实测见 `docs/verification/homepage99.md`。
> 2026-10-31（`brutal` / `ink` / `deco` 增量）：新增 3 套 `styled` 与 3 个 `Preview.astro`；切换页预览 **24 → 27**，设计页 CSS **23 → 26**（三语共享），`fonts:typography` 门禁为 **26** 套 `styled` / **17** 套核心 CJK。`brutal` 证据见 `docs/verification/brutal.md`；`ink` / `deco` 的构建、体积与浏览器矩阵见 `docs/verification/ink.md` / `docs/verification/deco.md`。
>
> 2026-10-31 批次汇总（`ink` + `deco` 收口）：`npm run build` **117 页**、`astro check` 0 error / 0 warning、`npm test` **67/67**；核心子集 3 个 / **710,012 B**，`fonts:prune` 保留 336 条规则 / 22 个字体 CSS 包，`dist` **6,544,535 B（6.24 MiB）** ≤10 MiB。两套 `impeccable detect` 均为 `[]`（oxide `codex-grid-background` 反证命中）。切换页 **27** 张预览、**0** 个预览内部可聚焦元素；两套在 1440 / 768 / 375×812、三语言、Reveal 滚动与直达、四种降级、悬浮球 52×52 / 面板底边 = `innerHeight` / close+cancel+Esc、对比度与仅本地网络请求上全部通过。**触控验证须用 `tap()`**：Playwright 的鼠标点击会按设计把输入模式切到 mouse 并隐藏悬浮球，不是站点缺陷（2026-10-31 实测）。未复测项：`--base /demo`、Safari/Firefox/iOS/Android 真机、200% 缩放、CDP 平台字体信息。
>
> 2026-10-31 菜单 CSS 外置批次（ADR 0015）：`ContextMenu.astro` 的 18,823 B/页内联样式改为单一共享 `_astro/ContextMenu.<hash>.css`（**7,515 B**）。`npm run build` **117 页**、`npm test` **67/67**、`astro check` 0 error / 0 warning；核心子集 3 个 / **630,332 B**（语料 **1,154** 码位 / 151 个文本资产），`fonts:prune` 字体 **34 文件 / 1,541,916 B**，`dist` **4,932,820 B（4.70 MiB）** ≤10 MiB。桌面 / 375×812 触控 / 无 JS / `html-only` 复测见 `docs/verification/action-menu.md`；截图 `docs/verification/assets/action-menu-css-{desktop,mobile,nojs}.png`。未复测项：`--base /demo`、真机 Safari/Android、200% 缩放。
>
> 2026-10-31 设计语言覆盖批次（C2）：27 套 `design.json` 增加必填 `locales: ["zh-CN","ja","en"]`；`messages.ts` 移除三语 union；`design.json` 覆盖决定页面生成，未覆盖 locale 无产物；默认设计必须全量；切换目标在目标 locale 未覆盖当前设计时落到默认设计；切换页、随机池、locale 入口、旧路径入口均按覆盖过滤。负向实测：非默认设计排除 `en` → `/en/fast/` 无产物且 `/en/designs/` 不列出、`/zh-cn/fast/` 的语言项 en 目标为 `/en/editorial/`；默认设计漏 `en` → 构建失败；声明覆盖但缺 `messages.ts` en 键 → 构建失败；`design.json` 含未配置 `ko` → 告警并忽略、无 `ko` 页面。`npm run check` 0 error / 0 warning、`npm test` 67/67、`npm run build` **117 页**、`dist` **4,939,230 B**（新增 9 条切换页描述，+6,410 B）。
>
> 2026-10-31 韩语首批批次（C4）：新增 `ko` locale、`profiles/ko.yaml`、共享与 5 套设计韩语文案/描述；覆盖 `editorial`（默认）、`frost`、`fast`、`govuk`、`html-only`。字体按 ADR 0016：editorial 用核心 LXGW（子集 249,972 → **275,920 B**），frost/fast/govuk/html-only 用系统韩文回退；不部署 Noto KR。`npm run build` **124 页**、`npm test` 67/67、`verify:html-only` **4 页**、`dist` **5,147,850 B（4.91 MiB）**、字体 **34 文件 / 1,571,636 B**、核心子集 **660,052 B**、`fonts:audit` 348 规则 / 0 孤儿 / 0 悬空。`/ko/` 页面 7 个；`/ko/designs/` 仅列 5 套；`/ja/archive/` 的 ko 语言项回退 `/ko/editorial/`；`/ko/html-only/` 零 CSS/JS/字体、4 个原生语言链接。韩语文案已人工审校（用户确认 2026-11-01，见 C3）；Noto KR 待外部字体仓库发布后替换（ADR 0016）。
>
> 2026-10-31 跨设计冒烟矩阵（C1–C4 收口）：**90 个 URL**（zh/ja/en 各 28 页 + ko 6 页）在 **1280×800** 与 **375×812 + 触控** 下逐页导航：HTTP 200、0 console、0 4xx、`html lang` 正确、styled 页 8 个 `.cm-lang`（4×2）、`html-only` 4 个 `hreflang`、`h1` 存在、无横向溢出、悬浮球 ≥44×44；**0 失败**。`impeccable detect`：editorial `[]`；frost 2 条 `bounce-easing` 为 `docs/designs/frost/ADAPTATION.md` 已记录例外。未逐页重跑像素 / 对比度 / reduced-motion 视觉矩阵。
>
> 2026-10-31 单语言 fork 体积实测（C3）：临时只保留 `zh-CN`，完整字体管线后 `dist` **3,135,835 B（2.99 MiB）**、**59 页**、149 文件、字体 **34 文件 / 1,380,744 B**；HTML 约 786 KB。语言分组、菜单 JSON `languages`、`LanguageSwitcher` 与 `html-only` 原生语言区整组消失；源码已恢复。

## 核心字体内容子集验证（2026-10-31，v0.20.0）

> 语料粒度已于 2026-11-01 由 ADR 0019 改为“按实际引用页限定”；本节保留当时的全站语料基线，当前状态见上方 2026-11-01 字体语料按引用页条目与 `font-corpus-scope.md`。

**范围**：新增核心字体 source cache（`.cache/font-sources/`）、`fonts:subset`、子集 cmap 审计；`fonts:prune` 保留非核心分片裁剪；体积门禁由 15 MiB 收紧为 **10 MiB**。本任务不修改设计页面、文案、设计 CSS、catalog/lock/generated 或源字体。

**构建与体积**

- `npm run build`：105 页；`fonts:subset` 语料 **1,261** 码位 / 135 个文本资产；生成 **3** 个核心子集：LXGW **272,948 B**、Zhuque **382,420 B**、Ark Pixel **35,964 B**，合计 **691,332 B**；改写 **45/105** 页面（60 页不含核心字体）；`fonts:prune` 保留 **300** / 删除 **336** 条规则，19 个字体 CSS 包 / **23,921 B**；核心分片 **0**，字体文件 **34 / 1,602,916 B**。
- `dist` **6,035,329 B（5.76 MiB）**，≤10 MiB；HTML 3,541,803 B、字体 1,602,916 B、CSS 574,445 B、图片 302,730 B、JS 11,747 B。
- `npm run fonts:check` 离线通过：20 families / 578 variants / 638 cached files / **3 source caches (9 files)**；`npm run check` 0 错误 / 0 警告 / 1 条既有 `lexicon` hint；`npm test` **67/67**；HTML-only 20/20 + 1 design × 3 locale。
- `fonts:audit`：303 条部署 `@font-face`、34 个引用字体文件、0 孤儿 / 0 悬空；32 条源 cmap 缺字警告（5 个唯一字符）与裁剪前一致。无 `unicode-range` 的核心规则按 `fontkitten` 真实 cmap 校验。

**浏览器（Chromium，preview，普通排版，未使用强制 `document.fonts.load()`）**

- `/zh-cn/little-forest/`：2 个字体请求 / **303 KB**（Fraunces + LXGW 子集）；HTML 48 KB。
- `/zh-cn/archive/`：3 个 / **415 KB**（两个拉丁 + Zhuque 子集）；HTML 35 KB。
- `/zh-cn/pixel-pet-rpg/`：4 个 / **70 KB**（三个拉丁/像素 + Ark 子集）；HTML 45 KB。
- `/zh-cn/designs/`：28 个 / **716 KB**（含三个核心子集）；HTML 73 KB。
- `/en/editorial/`：1 个 / 0 KB（缓存）；HTML 34 KB。
- 已访问页面 0 条 console error / warning；请求的字体文件均为部署子集/非核心字体，无 404；审计 0 悬空 / 0 孤儿。未单独用 CDP `CSS.getPlatformFontsForNode` 复测；普通字体请求与 `@font-face` 族名映射作为命中证据。

**base 前缀**

- `MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo` + `fonts:subset --dist dist-demo` + `fonts:prune --dist dist-demo` + `fonts:audit --dist dist-demo`：105 页，`dist-demo` **6,052,419 B**；字体 CSS 链接为 `/demo/_astro/fonts-...css`，子集 URL 为 `/demo/_astro/fonts/...-subset-...woff2`；审计通过。临时目录已清理。

**未测项**

- 375px 触控、减动态、无 JS 本轮未独立复测；核心子集不改变布局、DOM 或客户端脚本，发布前如需完整设计验收可按 `design-page-verify` 复跑。
- 未单独用 CDP 平台字体信息复测；普通字体请求 + 族名映射已证明核心子集参与普通排版。

## 构建期字体分片裁剪验证（2026-10-31，v0.19.0）

**范围**：新增 `fonts:prune`（`astro build` 之后按最终产物文本逐页裁剪 `@font-face`、外置共享字体 CSS、删除全站未引用分片、15 MiB 体积门禁），`fonts:audit` 改为校验部署集合。本任务不修改设计页面、文案、设计 CSS、字体文件、字体目录锁、快照或生成注册，也不实现语言扩展。

**构建与体积**

- `npm run build`：105 页；`fonts:prune` 保留 **2,321** / 删除 **7,891** 条 `@font-face` 规则；**19** 个字体 CSS 包 / **964,702 B**；字体分片 **247 / 611**，**9,147,548 B**；`dist` **14,520,742 B（13.85 MiB）**，≤ 15 MiB。
- 裁剪前：`dist` **35,129,812 B（33.50 MiB）**；字体 **611 / 22,404,240 B**；HTML **11,858,883 B**；CSS **550,524 B**；JS **11,747 B**；图片 **302,730 B**。
- 裁剪后：HTML **3,541,803 B**；CSS **1,515,226 B**（设计 CSS 550,524 B 不变 + 19 个字体包 964,702 B）；JS / 图片不变。
- `fonts:check` 离线通过；`npm run check` 0 错误 / 0 警告 / 1 条既有 `lexicon` hint；`npm test` **54/54**；HTML-only 20/20 测试 + 1 design × 3 locale 通过。
- `fonts:audit`：3,153 条部署 `@font-face`、247 个被引用字体文件、**0 孤儿 / 0 悬空 URL**；32 条源 cmap 缺字警告（5 个唯一字符）与裁剪前一致。`fonts:prune -- --dry-run` 在已裁剪 `dist` 上 no-op。

**文本与产物**

- 105/105 页面可见文本与裁剪前逐字一致（独立对比裁剪前副本）。
- 代表页面内联 `@font-face` 为 **0**；每页只有一条 `_astro/fonts-<hash>.css` 外链。
- 19 个字体 CSS 包；同一设计的三种语言页面共享字体包（按字体族集合取并集）。

**浏览器（Chromium，`npm run preview`，普通排版，未使用强制 `document.fonts.load()`）**

- `/zh-cn/little-forest/`：31 个字体请求 / **1,135 KB**；请求映射到 `Fraunces Variable` 1 + `LXGW WenKai GB` 30；HTML 48 KB。
- `/zh-cn/archive/`：42 个 / **1,312 KB**；`Zhuque Fangsong` 40 + `Courier Prime` 1 + `Sorts Mill Goudy` 1；HTML 35 KB。
- `/zh-cn/pixel-pet-rpg/`：13 个 / **253 KB**；`Ark Pixel 12px` 10 + `Handjet Variable` 1 + `Silkscreen` 2；HTML 45 KB。
- `/zh-cn/designs/`：82 个 / **768 KB**（热缓存口径）；HTML 73 KB；家族包含 `LXGW` 20 / `Zhuque` 28 / `Ark Pixel` 9 与各拉丁字体。
- `/en/editorial/`：1 个 / 0 KB（缓存）；HTML 34 KB；仅一条字体 CSS 外链。
- 已访问页面 0 条 console error / warning；所有请求字体 URL 均存在，审计 0 悬空 / 0 孤儿。**未**单独用 CDP `CSS.getPlatformFontsForNode` 复测；命中证据为普通排版产生的字体请求与 `@font-face` 族名映射。

**base 前缀**

- `MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo` + `fonts:prune --dist dist-demo`：105 页，`dist-demo` **14,542,462 B**；字体 CSS 链接为 `/demo/_astro/fonts-...css`，CSS 内字体 URL 为 `/demo/_astro/fonts/...woff2`；`fonts:audit --dist dist-demo` 通过。临时目录已清理。

**未测项**

- 375px 触控、减动态、无 JS 本轮未独立复测；字体裁剪不改变布局、DOM 或客户端脚本，发布前如需完整设计验收可按 `design-page-verify` 复跑。
- 未单独用 CDP 平台字体信息复测；普通字体请求 + 族名映射已证明核心字体参与普通排版。

## v0.17.0 集成验证（2026-10-29）

- 六套新增设计均为 `styled`：`fairy-kei`、`sticker-diary`、`pixel-pet-rpg`、`little-forest`、`cute-alism`、`magical-girl`；三语共 **18 页**，全部生成。
- `npm run check`：0 错误 / 0 警告 / 1 条既有 `lexicon` hint；`npm run build`：**105 页**；HTML-only 门禁 20/20。
- `styled` 设计页 CSS **23** 份，与 23 套 `styled` 设计一一对应；切换页另有 1 份聚合 CSS，`dist/_astro/*.css` 总数因此为 **24**。每套三语页面共享同一份自身 CSS，无跨主题聚合。
- 切换页 **24 张卡 / 24 个预览**；CSS **90,763 B**，HTML **109,462 B**，`@font-face` **87**；所有预览无焦点元素。
- 新增字体：Fredoka 29,784 B latin + 4,576 B latin-ext；迁移前站内子集口径已退役，当前外部目录与完整分片成本见下文 2026-10-30 专项验证。
- 六套桌面 1440 / 375px 触控实测：无横向溢出；共享菜单、3 语言项、关闭 44px / 取消 48px、背景滚动锁均通过。
- Reveal 三套（fairy-kei / little-forest / cute-alism）通过正常、减动态、无 JS、无 IO、IO 抛错；滚动到底隐藏元素 0。
- 设计脚本三套（sticker-diary / pixel-pet-rpg / magical-girl）通过正常、强制失败与无 JS；压缩体积 1,058 B / 706 B / 646 B gzip，均低于 12KB。
- `BASE_PATH=/demo` 构建 105 页；六套样式、canonical、菜单与切换页链接全部带 `/demo` 前缀。
- 六套 `impeccable detect` 均为 `[]`；截图归档在 `.local-fonts/dev/preview/cute-2026-10-29/`。

## 字体目录与 primary-face 回退验证（2026-10-30，v0.18.0）

**目录、锁与生成注册**

- 外部目录固定为 `SenrenBanka-fonts` catalog v1.0.0，catalog SHA-256 `3ec45b912b0cae17fad5438d4dbf7443fc108c65284bc8597923329bf3d55b4c`；20 个 family、578 个注册 variant、638 个 package 文件，package 总字节 **22,160,569**。
- Zhuque Fangsong 为 **161** 个完整 cmap 分片 / 5,998,018 B；LXGW WenKai GB 为 **328** 个 / 13,841,062 B；Ark Pixel 12px 为 **55** 个 / 1,371,013 B。现行设计文档已不再把旧站内子集大小当作当前事实。
- `npm run fonts:update` 连续执行两次，`fonts.lock.json`、`fonts.catalog.json`、`src/fonts/generated.ts` 的 SHA-256 均不变：`DBA8C1EE...FEDC6` / `07B15331...6B4B` / `3C81084F...3726`。
- 6 个 Fontsource npm family 与 20 个 external local family 均在 registration 中设置 `fallbacks: []` + `optimizedFallbacks: false`；npm wrapper 继续把 provider 包 URL 映射回 `node_modules`。`src/fonts/generated.ts` 的每个 local definition 也只暴露主 face。
- `npm run fonts:typography` 对 23 套 `styled` 设计、其 `Preview.astro`、跨文件 CSS 变量与全部 registration 执行静态门禁：字体变量后的显式 fallback、核心 CJK 顺序、14 套 core-CJK 设计的每个字体栈与 primary-only 变量全部通过。本次复核补齐 cute-alism micro、lexicon running/period 等仍可绕过核心字体的局部栈，并补齐 fax、pager、poster、radio、receipt、sticker-diary、tape 等设计的系统 CJK 尾链。

**准备、测试与构建**

- `npm ci`：290 packages；`npm test`：**40/40** 通过，含字体更新/准备/校验/篡改失败、缓存并发、生成注册、HTML 审计、HTML-only 与 typography 回归。
- `npm run fonts:prepare -- --offline`：20/20 family 复核缓存，0 下载；`npm run fonts:check`：20 families / 578 variants / 638 cached files，完全离线通过。
- `npm run build`：**105 页**；`astro check` 0 错误 / 0 警告 / 1 条既有 `lexicon` hint；HTML-only 门禁 20/20 测试、1 design × 3 locale = 3 页通过。
- 清空 `node_modules/.astro/fonts/` 后，以 `HTTP_PROXY=http://127.0.0.1:9`、`HTTPS_PROXY=http://127.0.0.1:9`、`NODE_USE_ENV_PROXY=1` 重复完整 build：仍为 **105 页绿**。
- `npm run fonts:audit`：扫描 105 HTML、45 个含核心字体变量候选页、60 个无核心变量页面；32 条缺字（5 个唯一字符：`輩 / 概 / 護 / 術 / 劇`）按契约警告并写入 `audit-report.json`，不阻断构建。

**产物静态审计**

- `static-artifact-audit.json`：105 HTML、24 CSS、**611** 个字体文件 / **22,404,240 B**；非 WOFF2 字体 **0**。
- 25 个实际出现的注册变量、228 处声明均为单一主 face；含逗号、`var()` 或系统中文字体的非法注册变量声明 **0**。
- 第三方字体 URL、`.local-fonts` / 机器路径、旧 `src/assets/fonts/` 生产引用均为 **0**。

**跨页面浏览器矩阵**

- `all-pages-browser-audit.json` 在新 Chrome context 中逐页加载全部 **105** 个 HTML 路由：loaded **105/105**，font responses **1,939**，third-party responses **0**，failed responses **0**，console errors **0**，桌面横向溢出 **0**；cute-alism / lexicon 的 8 条受影响路由已按最终 dist 刷新。逐字体请求的当前基准以下方 fresh-context 矩阵和 `*-font-requests.json` 为准。
- `primary-face-browser-matrix.json` 对 **14 套核心 CJK 设计**、npm provider 代表 frost 与切换页共 **16 页**逐页新建 fresh Chrome profile / 1440×900 context，普通页面排版等待 `document.fonts.ready` 后读取 WOFF2 资源，并用 CDP `CSS.getPlatformFontsForNode` 记录实际平台字体；不使用强制 `document.fonts.load()`：

| 页面 | WOFF2 请求 | 磁盘字节 | 实际加载的核心字体 |
|---|---:|---:|---:|
| `/zh-cn/archive/` | 42 | 1,331,092 | Zhuque 507 |
| `/zh-cn/cute-alism/` | 34 | 1,263,752 | LXGW 487 |
| `/zh-cn/fairy-kei/` | 34 | 1,299,492 | LXGW 563 |
| `/zh-cn/fax/` | 42 | 1,619,188 | Zhuque 480 |
| `/zh-cn/lexicon/` | 41 | 1,272,040 | Zhuque 474 |
| `/zh-cn/radio/` | 16 | 358,984 | Ark Pixel 470 |
| `/zh-cn/receipt/` | 16 | 361,036 | Ark Pixel 485 |
| `/zh-cn/pager/` | 15 | 353,720 | Ark Pixel 471 |
| `/zh-cn/pixel-pet-rpg/` | 13 | 255,516 | Ark Pixel 194 |
| `/zh-cn/poster/` | 43 | 1,329,096 | Zhuque 475 |
| `/zh-cn/tape/` | 41 | 1,301,124 | Zhuque 488 |
| `/zh-cn/little-forest/` | 31 | 1,152,656 | LXGW 574 |
| `/zh-cn/magical-girl/` | 36 | 1,329,584 | LXGW 524 |
| `/zh-cn/sticker-diary/` | 28 | 930,788 | LXGW 171 |
| `/zh-cn/frost/` | 1 | 48,256 | 0（npm Inter）；无核心 CJK 变量 |
| `/zh-cn/designs/` | 82 | 2,535,300 | Zhuque 314 / LXGW 237 / Ark Pixel 192 |

- 16 页合计 515 个 WOFF2 请求 / 16,741,624 B（页面合计，不是去重全站成本）；每页 third-party、failed、console error 均为 0，桌面横向溢出为 0。
- `platform-font-audit.json` 另以 CDP 平台字体证据复核 14/14 核心 CJK 设计：全部命中预期 Zhuque / LXGW / Ark Pixel；系统 CJK 只出现在审计报告已列出的 5 个源 cmap 缺字位置。cute-alism 和 lexicon 修复后不再出现非预期系统 CJK 回退。
- 每个页面的 WOFF2 URL、状态、传输字节与平台字体证据均写入对应 `*-font-requests.json`；截图：`archive-desktop.png`、`cute-alism-desktop.png`、`radio-desktop.png`、`receipt-desktop.png`、`pager-desktop.png`、`poster-desktop.png`、`tape-desktop.png`、`little-forest-desktop.png`、`magical-girl-desktop.png`、`fairy-kei-desktop.png`、`sticker-diary-desktop.png`、`frost-desktop.png`、`designs-desktop.png`。

**响应式、减动态与无 JS**

- `responsive-accessibility-matrix.json` 在 fresh Chrome context 中对 archive / cute-alism / radio 复测 375×812 + `isMobile` + touch：`pointer: coarse=true`，三页无横向溢出，Zhuque / LXGW / Ark Pixel 均按普通排版加载；WOFF2 分别为 40 / 32 / 15 个。截图 `archive-375.png`、`cute-alism-375.png`、`radio-375.png`。
- archive 触控菜单：面板可见且底边贴合视口，语言项 4 个，关闭 44×44、取消 351×48；打开时 `<html>` overflow hidden，取消后面板隐藏、`aria-expanded=false` 且滚动解锁。面板截图 `archive-touch-panel.png`。
- 三页 `prefers-reduced-motion: reduce`：`data-reveal-ready` 未写入，`[data-reveal]` 隐藏数 0，运行中动画 0；代表截图 `archive-reduced-motion.png`。
- 三页 375px 无 JS：门控未写入、隐藏数 0，正文 804–870 字符、可见链接 6 个，无横向溢出；代表截图 `archive-no-js.png`。

**检测器与范围**

- 受影响的 12 套设计运行 `impeccable detect` 均为 `[]`：archive / cute-alism / fax / fairy-kei / little-forest / magical-girl / pager / poster / radio / receipt / sticker-diary / tape。
- frost 仍只有既有 2 条 `bounce-easing` 适配例外；本任务没有改变其视觉规范。
- 覆盖口径：静态 typography 门禁覆盖全部 23 套 `styled`；CDP 平台字体证据覆盖全部 **14 套 core-CJK 设计** + frost + 切换页（16 页）；375px / reduced-motion / no-JS 覆盖三套核心 CJK 代表页。未对全部 23 套重复手工矩阵，既有交互、对比度与脚本专项记录继续有效。
- 未测：Safari / Firefox、iOS / Android 真机与 200% 缩放；本地 Chrome headless 只证明 Chromium 行为。

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
| `npm run build` / `astro check`（历史基线 + 当前） | 2026-10-19 历史基线 **73 页**、2026-10-28 历史基线 **81 页**；v0.18.0 当前 **105 页**，0 错误 / 0 警告 / 1 条既有提示（`lexicon/Page.astro` 未用参数，与本任务无关） |
| 预览覆盖 | **24/24** 设计均有 `Preview.astro`，三语言切换页各渲染 **24 个**预览（共 24 张卡） |
| 切换页样式表 | **恰好 1 条** `SwitcherPage.*.css`，**91,254 B**；0 `--tw-`（无 preflight）、0 Tailwind 标记 |
| 切换页 `:root` 设计令牌 | **0**（框架 `--font-*` 变量不计入设计令牌） |
| 设计页隔离 | 23 套 `styled` × 3 语言 = **69 页**，每页恰 1 条自身 CSS、0 个预览组件规则；`html-only` 3 页均为 0 CSS / 0 预览选择器。v0.17.0 新增六套逐页核对；既有设计沿用 2026-10-19 / 10-28 记录 |
| 正式页等价 | 2026-10-19 历史记录中，6 个字体回退链调整的设计不再计入字节等价集合，其余 10 套与当时 HEAD 相等；v0.17.0 未重新执行这一历史等价矩阵 |
| `@source not` | 23/23 套 `styled` 的 `style.css` 均排除 `Preview.astro`；html-only 无 `style.css`，其预览样式只存在于切换页聚合 CSS |
| 预览可聚焦元素 | **0**；预览统一 `aria-hidden="true"`；24 个卡片链接无障碍名不含预览文字 |
| 栅格 | 1536 / 1280 / 1024 = 3 列；960 / 900 = 2 列；768 / 375 = 1 列；所有档位 0 横向溢出 |
| 卡片几何 | 2026-10-19 的 1536px 历史实测中 16/16 卡片均约 `379×333px`、预览均约 `353×221px`、描述区均 `46.2px`；2026-10-28 复测 homepage99 沿用固定三段结构。v0.17.0 产物确认 24 张卡均使用同一 `16 / 10` 三段合同，未重新记录几何尺寸 |
| 降级 | 2026-10-28 的 18-card 历史实测中 reduced-motion、无 JS、无 IO 均无隐藏预览；v0.17.0 的 24 张预览保持 SSR、无预览脚本、0 可聚焦元素。六套新增设计的 no-JS / reduced-motion 矩阵另见各主题验证记录 |
| 字体 | v0.18.0 当前切换页 **609** 个 `@font-face` 声明，构建产物 **611** 个 woff2；zh-cn 普通排版运行时 **82** 个请求 / **2,535,300 B**，0 preload、0 第三方；分片按 `unicode-range` 惰性加载 |
| 检测器 | 21 套零发现；既有已记录例外：frost 2 条 `bounce-easing`、govuk 2 条 `overused-font`、oxide 1 条 `codex-grid-background`。v0.17.0 六套新增设计均为 `[]` |

**成本实测与规模评估**

| 口径 | 3 套原型（2026-10-18） | 18 套历史（2026-10-28） | 24 套当前（2026-10-30） | 114 套线性外推 |
|---|---|---|---|---|
| 切换页 CSS | 10 149 B | 58 050 B | **91 254 B** | ≈ 433 KB |
| 切换页 HTML（zh-cn） | 46.8 KB | 92 775 B | **577 919 B** | 主要由字体注册决定，**不随设计数线性增长** |
| `@font-face` | 21（4 族） | 82 | **609**（20 local + 6 npm family 的完整分片注册） | 由字体族种类与完整 CJK 分片决定，**不随设计数线性增长** |
| 构建字体文件 | — | 67 | **611**（**22,404,240 B**） | 由预览实际渲染的文本与 `unicode-range` 决定 |

- 预览 CSS 在切换页聚合为**单个**样式表，三语言共享同一 entrypoint；24 套时 CSS 为 **91,254 B**、HTML 为 **577,919 B**。HTML 的主要增量来自内联 primary-only `@font-face` 注册；运行时字体仍按 `unicode-range` 惰性取件，不能用 HTML 体积推断实际下载量。
- 24 套 CSS 为 **91,254 B**；到 114 套时约 **433 KB**，仍属可接受但需要监控。**本轮不引入**分页、搜索、筛选、按需加载或 iframe。扩展至约 100 套时优先评估 `content-visibility: auto` 与分类；仍不引入必须依赖服务器的方案。
- CJK 字体成本：2026-10-30 v0.18.0 的 zh-cn 切换页在普通排版下实际请求 **82** 个 WOFF2 / **2,535,300 B**，其中 Zhuque / LXGW / Ark Pixel 分别加载 28 / 20 / 9 个分片；不 preload，0 第三方域名。

**2026-10-19 旧设计字体审计后的历史成本口径**：九套旧设计的字体族并集未新增包；Oxide 从“声明了但未加载的两族”改为复用已有 Geist / Geist Mono，切换页当时为 **82** 个 `@font-face` 与 **38** 个生成族名，运行时由 0.14.0 的 22 个唯一 woff2 增至 **25** 个。这些数字只保留为迁移前历史；2026-10-30 v0.18.0 当前状态是 **609** 个声明 / **611** 个构建字体文件 / zh-cn 切换页 **82** 个请求，不能用旧的 82 / 38 / 25 代表当前状态。九套的接线、覆盖、回退与许可记录分别见各自 `docs/verification/<id>.md` 及 `DESIGN.md` / `ADAPTATION.md`。

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
- 样例资料为**虚构角色**，五语内容为示例翻译，未经专业译者校对；日文 / 繁中排版仅验证无溢出与字体命中，未做当地 typographic 精修；繁中文案仍需用户终审。
