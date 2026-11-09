---
name: "design-page-verify"
description: "SenrenBanka 设计页验证流程：新建或修改设计页（或 src/lib / src/components 共享机制）后，先按 design.json.renderMode 分流，再执行构建/类型检查、产物校验、impeccable 检测器、浏览器桌面实测、动效实测、375px 触控仿真、降级与可访问性、对比度与截图归档，产出验证记录。新增设计完成或任一设计页 / 共享机制改动后必须执行。"
---

# 设计页验证流程（SenrenBanka）

本 skill 是已验证过的"设计页完整验证"可执行版（对应 SPEC §13 验收标准；规则见 `docs/rules/README.md`，记录归属见 `docs/README.md`）。
**新设计按 DESIGN.md 实现完成后，或任一设计页 / 样式 / 构建配置 / `src/lib/` / `src/components/`（共享机制）改动后**，按本流程逐步执行，不得跳步；无法验证的项必须如实标注（如仿真限制、真机未测），禁止虚构结果。
**先读取 `design.json.renderMode` 分流**：省略 / `styled` 走完整设计管线；`html-only` 只验证语义 HTML、普通链接、metadata、产物禁令与无 CSS / 无 JS 呈现。不得把共享菜单、字体、Tailwind、Reveal 或动效测试套到 HTML-only 页面，也不得把 HTML-only 的普通链接称为“菜单回退”。
**动效相关断言（步骤 4b / 5b）只对"引入了 `<Reveal />` 的设计"生效**；无动效的设计（若某设计按规范保持静止）应显式跳过，并在记录中注明是"设计上无动效"，而不是当成漏测。

## 前置

- 预览：`npm run preview`（本项目 preview 固定 http://localhost:4321；`npm run dev` 亦可）。
  **端口被占用**：启动时提示 `Port 4321 is in use` 会静默回落到 4322 →（若照抄 4321）后续断言全错。先清占用再重启：`Get-NetTCPConnection -LocalPort 4321 -State Listen` 取 `OwningProcess` → `Stop-Process -Id <pid> -Force`。（实测：`StopCommand` 停掉 preview 后 node 进程可能残留。）
- 浏览器工具：优先用当前会话可用的浏览器工具族（2026-10-11 环境实测：code mode `Exec` 内 `tools.browser_*`——`browser_navigate` / `browser_evaluate`（参数 `{ script }`，用**裸表达式**，块语句体可能返回 undefined）/ `browser_console_messages` / `browser_network_requests` / `browser_take_screenshot`）。
- 移动触控仿真（按序降级）：(1) `mcp_playwright` 的 `browser_run_code_unsafe` 直接建上下文（`viewport 375×812 + hasTouch:true + isMobile:true`），回读 `matchMedia('(pointer: coarse)').matches` 证明触控生效；(2) 无 run_code 能力时，用**本机 playwright-core 一次性脚本**（临时目录 `npm i playwright-core`，`chromium.launch({ executablePath: <本机 ms-playwright 内 chrome.exe>, headless: true, args: ['--no-proxy-server'] })` + `newContext({ viewport, hasTouch, isMobile, deviceScaleFactor })`；脚本放项目外，2026-10-11 实测可用）；(3) 派 `browser_use` 子代理做同样的事；均不可用才降级为“静态核对”并声明。
- 降级仿真（步骤 5b）：`browser_run_code_unsafe` 内用 `browser.newContext({ reducedMotion: 'reduce' })` / `({ javaScriptEnabled: false })`；无 IO 用 `addInitScript(() => { delete window.IntersectionObserver })`；脚本抛错用 `addInitScript(() => { window.IntersectionObserver = function () { throw new Error('boom') } })`。无 run_code 能力时改用上述 playwright-core 一次性脚本（四情形可同一脚本内跑完）；reduced-motion 亦可 `mcp_playwright_browser_emulate_media({ reducedMotion: 'reduce' })` + 重载实测（2026-10-11 实测可用）。
- 已知环境坑：本机 `HTTP_PROXY` 会拦截 localhost 的 curl/Invoke-WebRequest（表现为 502），需要时用 `curl.exe --noproxy "*"`；优先用浏览器工具取运行时证据。
- 持久浏览器会话可能残留旧标签页的资源请求（如 `@vite/client`）——网络断言以**本次新导航后的 Document 请求**为准；`browser_evaluate` 请用裸表达式（如 `JSON.stringify({...})`），IIFE 写法在本环境可能返回 undefined。

## 步骤 1 · 构建与注册表

```powershell
npm run build        # astro check + Astro build + html-only 产物门禁 + verify:sections
npm run check        # 仅类型检查（可按需）
npm run test:html-only  # 验证器正向 / 负向回归（Node 内置 test runner）
npm run verify:html-only -- --dist <目录>  # 检查非默认产物目录
npm run verify:sections  # 主分区 data-section / h2 标准标签门禁
```

- 共同必交：`DESIGN.md` / `design.json` / `Page.astro` / **`messages.ts`**（多语言文案契约，见步骤 2b）。
- `renderMode: "styled"`（缺省）：`style.css` 必须存在。
- `renderMode: "html-only"`：`style.css` / `tokens.css` 必须不存在；注册表必须在反例（临时放回其中任一文件）时明确失败。`Preview.astro` 可选，但只能自包含、不得 import 正式页 CSS，且不得改变正式页面零 CSS / JS 的门禁。
- `design.json`：非自产来源必须含 `source.url/fetchedAt/license`；许可要求保留声明时附 `SOURCE-LICENSE.txt`。

## 步骤 2 · 产物静态抽查

**`styled`**：以 `<id>` 为目标设计 id、`<特征选择器>` 为该设计独有选择器（如 `.ed-masthead{`）：

1. **CSS 隔离**：在 `dist/_astro/*.css` 中定位含 `<特征选择器>` 的文件；断言其他设计的选择器/工具类**不出现**在其中；断言 `dist/index.html`（根路由页）、`dist/404.html`、各语言入口页、切换页**不链接**任何设计 CSS。
2. **base 前缀**：`MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo` 后抽查 `dist-demo/<locale>/<id>/index.html` 的内部链接均带 `/demo` 前缀。
   **坑（Git Bash）**：单独写 `BASE_PATH=/demo` 会被 MSYS 路径转换成 `/D:/Git/demo`（产出错误 base）；单独写 `--base /demo` 同样会被转换。**两者必须同时使用**（`MSYS2_ARG_CONV_EXCL='*'` + `--base` 显式传参），实测有效。
3. **字体与资源**：该页面只引用自身用到的字体文件；`rel="preload"` 数量与预期一致（无多余子集预载）。设计声明 `ko` 时，浏览器需实际命中 Hangul 核心字体（editorial → Gowun Batang；frost/fast/govuk → Gothic A1），且非 `ko` 页面不下载韩语子集；`npm run fonts:coverage` 必须通过。
4. **核心字段**：目标页面 HTML 中核心字段（name/headline/bio/links）全部渲染。

**`html-only`**：跳过 CSS 隔离与字体断言，改为：

1. `npm run verify:html-only` 通过；无候选、缺页面或任何违规都必须非零退出。
2. 最终 HTML 的 `<link>` rel 仅含 `canonical` / `alternate` / `icon`；`<style>`、`style` 属性、`<script>`、`on*`、`iframe` / `object` / `embed`、stylesheet / preload、`javascript:` URL、meta refresh 计数均为 0。
3. 核心字段与所有实际存在的可选区块均渲染；`name` 是唯一 `h1`，每个 section 有可访问名称，目录不链接不存在的锚点。
4. 页面不使用 `<Font>` / `<Reveal>` / `<ContextMenu>` / `<InfraStyles>` / `<LanguageSwitcher>`，且不存在随机入口。

**主分区标签（所有模式，ADR 0023）**：

1. `npm run verify:sections` 通过；该设计不得出现在 `scripts/section-labels.allowlist.json` 中（迁移期除外）。
2. 每个主分区有 `data-section="profile|projects|experience|skills|contact|links"`；profile hero 允许没有 h2。
3. h2 只含当前 Locale 的标准标签（canonical / alias / 英文 canonical）；主题词在 h2 之外的 kicker / subtitle / 装饰中。
4. `aria-labelledby` / `aria-label` 指向标准标签，不得只含主题词。

## 步骤 2b · 多语言专项（v0.9.0 起必做）

以 `<locale>` ∈ {`zh-cn`, `ja`, `en`, `ko`}、`site.config.yaml` 的 `i18n.locales` 为准：

1. **页面齐备**：断言 `dist/<locale>/<id>/index.html` 存在；`styled` 另断言 `dist` 中 CSS 文件总数仍等于 `styled` 设计数（多语言**不得**让每套设计产生独立 CSS），`html-only` 的 stylesheet 数必须为 0。
2. **CSS 不随语言分裂（仅 `styled`）**：同一设计的 `<locale>` 与其他语言页面引用**完全相同**的单个 CSS 文件（`diff` 两个 `<link rel=stylesheet>` 集合）。
3. **`lang` / `robots` / `canonical` / `hreflang`**：
   - `<html lang>` 等于该语言的 BCP 47 code（不是固定 `zh-CN`）；
   - 默认设计 `index, follow`，非默认设计 `noindex, follow`；
   - canonical 含 locale 前缀与 base；
   - **仅默认设计**有 `<link rel="alternate" hreflang>`（各语言互指 + `x-default`）；非默认设计该计数必须为 **0**。
4. **文案**：抽查该页面的分区标题来自本设计 `messages.ts`（随语言变化），且**模板中无残留的用户可见字面量**。
5. **语言切换（按模式）**：
   - **`styled`**（共享操作菜单，`.cm-lang`；桌面二级菜单 / 移动端平铺，ADR 0007）：
   - **桌面**：右键菜单 → 「语言」行展开子菜单 → 断言 3 个 `.cm-lang` 项、**恰好 1 个** `aria-current="page"`、每个带正确 `hreflang`、目标 URL **保持同一 `<id>`**、子菜单 `aria-label` 已本地化、触发项 `aria-expanded="true"`。
   - **移动端**（375×812 + 触控，见步骤 5）：悬浮球点击打开底部动作面板 → 语言项**平铺**可直达，3 项 + 1 个 `aria-current`。
   - **两种形态都合计 6 个 `.cm-lang`、2 个 `aria-current`（两份各一）**——这是 SSR 双份 DOM 的预期数量，不是重复渲染缺陷；运行时只有一份可见（另一份带 `hidden`）。
   - **主菜单高度必须与语言数量无关**（桌面二级菜单契约）：对比「语言项平铺进主菜单」时的菜单高度，确认现在恒为固定项数；子菜单限高且可滚动、完全落在视口内。移动端平铺不受此约束（面板容器本身限高滚动）。
   - **不得依赖 hover**：子菜单必须能由**点击 / `→` / Enter** 打开。键盘：`↑↓` 在当前层级内循环**不得飞出菜单**（焦点不能落到 `BODY`）；移到「语言」自动展开、移开收起；`→` 进入子菜单后 `↑↓` 必须在**子菜单内**循环、`←` 归还焦点到触发项。
   - **设计页不应有可见的 `.lang-switch`**（基础设施页切换页 / 404 也有——它们包在 `<noscript>` 内，JS 开启时不渲染）。
   - **`html-only`**：直接在 `<nav>` 内断言语言链接数量与 `i18n.locales` 一致；每个带正确 `hreflang` / `lang`，恰好 1 个 `aria-current="page"`，目标保持 `html-only`；无 `.cm-*`、无悬浮球、无脚本。
6. **语言/主题正交性**：实点击一次语言链接，断言落点为 `/{目标locale}/{原id}/`（切换语言不改主题）。
7. **配置开关**（临时改 `site.config.yaml` 后构建，**测完必须恢复**）：
    - `manualSwitch: false` → 各语言切换页与旧 `/designs/` **不构建**；`styled` 菜单内**主题切换项不渲染**（`data-cm-action="random"` / `switch` 计数为 0），但菜单与语言分组照常渲染；`html-only` 不渲染“全部设计”链接，但语言链接照常渲染；
   - `mode: fixed` → 入口页仍落到默认设计且带 locale 前缀。
8. **旧路径兼容**：`/<id>/` 与 `/designs/` 存在 meta refresh → 默认语言版本，且带 `canonical` + `noindex, follow`。
9. **触控命中区（仅 `styled`）**：375px + 触控下**悬浮球 ≥44×44px**、**移动面板内每项 ≥44px**（项目 chrome，见 `action-menu.md` 实测：球 52×52、项 50px、关闭 ✕ 44px、取消条 48px、抓手条 56px）；设计自身的 `.lang-switch-link` 不再存在。`html-only` 只检查普通链接可点、焦点可见，不要求悬浮球或面板。

## 步骤 3 · impeccable 检测器

```powershell
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/<id>
```

- `[]` + exit 0 = 干净；有发现时逐条处理或按"有意为之"记录（见步骤 7）。
- **有效性反证**（必做，避免"静默空转"）：对已知含信号的目标（如网格底纹类信号；已记录的例外见 `docs/designs/*/ADAPTATION.md` 或主题验证记录）或临时探针文件运行一次，确认检测器真的会命中；探针用完删除。
- 视觉叠层（可选，浏览器内信号）：`impeccable live-server --background` 获取端口 → 浏览器打开目标页 → 注入 `http://localhost:<port>/detect.js` → 读 console 的 `impeccable` 前缀消息 → `impeccable live-server stop`。

## 步骤 4 · 桌面实测（浏览器）

打开 `http://localhost:4321/<locale>/<id>/`，用 `browser_evaluate` 取计算值：

- **console**：0 错误/警告；`styled` 网络请求仅自身资源（HTML + 自身 CSS + 自身字体），`html-only` 只有 Document 与允许的 favicon metadata 请求，无 404。
- **关键 token 复核（仅 `styled`）**：颜色（如需对比度，直接算数值）、字号/字距、间距/padding、布局结构（如 grid 列宽）。
- **a11y 结构（逐项可判定）**：
  - 标题层级 `h1 → h2 → h3` 无跳级；
  - **主分区 h2 的文本是标准标签**（`data-section` 区间内），主题词只出现在 h2 之外；
  - **每个 `<section>` / 分区都有可访问名称**（`aria-labelledby` 指向同区可见标签，或 sr-only 标题）——实测 `[aria-label],[aria-labelledby]` 计数必须 > 0；
  - **装饰符号不进入可访问名**：`▸` `└─` `#` `●`、ASCII 波形、扫描线等一律 `aria-hidden`；链接可访问名**不得**以这类符号开头；
  - 输出实测值：标题序列、链接可访问名列表、`aria-hidden` 计数。
- **交互态**：`:hover` 无法直接 evaluate 时，采用"rest 计算值 + 构建产物中的 `:hover` 规则存在"双证。
- **`html-only` 例外**：无自定义 token / hover / 字体可复核；改为核对浏览器默认呈现、无横向溢出、所有目录 / 语言 / 资料链接为普通 `<a>`，并记录无 CSS / JS 请求。

## 步骤 4b · 动效实测（仅对引入 `<Reveal />` 的设计）

对采用共享显现的设计（当前采用情况见 `docs/verification/<id>.md`）：

- **门控**：`document.documentElement.hasAttribute('data-reveal-ready') === true`；`[data-reveal]` 数量与预期一致。
- **首屏入场**：目标元素（如 `.ox-name` / `.fs-title`）`animation-name` 生效，且动画结束态 `opacity === '1'`、`transform` 为单位矩阵。
- **滚动显现**：滚到底后**全部** `[data-reveal]` 均带 `[data-reveal-in]`，且 `opacity !== '1'` 的元素数为 **0**。
- **跳转兜底（必测）**：直接 `window.scrollTo(0, document.documentElement.scrollHeight)`（模拟刷新恢复位置 / End 键 / 锚点跳转）后，隐藏元素仍为 **0**——该场景不产生 `IntersectionObserver` 通知，是已知高危路径。
- **装饰性滚动进度线**（若该设计采用该机制；当前采用情况见 `docs/verification/<id>.md`，选择器以该设计实际实现为准）：进度线元素存在且 `aria-hidden`；支持 scroll-driven 的环境下滚动后 `transform` 随进度变化（不支持的环境由 `@supports` 整条隐藏，属预期行为）。
- **console / 网络**：0 错误 0 警告；请求仅自身资源（Document + 自有 CSS + 字体 / favicon），无 404。
- 截图归档：动效前 / 后各 ≥1 张，给出路径。

## 步骤 5 · 移动端 + 触控仿真

在 375×812 + 触控仿真下断言并回报**实测值**（用 `browser_run_code_unsafe` 直接建上下文，或派子代理）：

- `matchMedia('(pointer: coarse)').matches === true`（触控媒体查询真实生效）；
- 无横向滚动：`document.documentElement.scrollWidth <= innerWidth + 1`；**固定定位元素（悬浮球 / 面板）也不得引入横向溢出**；
- **共享操作菜单（ADR 0007，仅 `styled` 必做）**：
  - 悬浮球可见且命中 ≥44×44px、有 `aria-label` / `aria-haspopup` / `aria-expanded` / `aria-controls`；**点击图标本身**（不是按钮空白）也能打开面板 —— 这一条专门抓 `target === 元素` 类型的判定 bug（点在 `<svg>` 上时 `event.target` 不是按钮）。
  - 点击后底部面板打开、**`rect.bottom === innerHeight`**（定位正确）、面板内各项命中 ≥44px、语言项平铺可达。
  - **面板内必须有可见关闭控件**（ADR 0007）：头部 ✕ 按钮（`.cm-sheet-close`，44px）与底部取消条（`.cm-sheet-cancel`，≥48px）**两条必须存在**；**点遮罩不能是唯一关闭路径**。逐条点一遍，每条都应隐藏面板 + 隐藏遮罩 + 解锁背景滚动 + `aria-expanded` 回 `false`。
    > 下拉关闭手势已于v0.10.0 移除（它需要 `touch-action: none`，会让页面顶部的下拉刷新一并失效）。**验证时不要断言存在下拉手势，反而应断言全页 `getComputedStyle(el).touchAction !== 'none'`**（这是下拉刷新可用的充分条件）。
  - **动作清单按端裁剪**（ADR 0007）：移动面板的 `[data-cm-action]` 只能是 `copy` / `share`（+ 条件项 `random` / `switch`）——**不得出现** `reload` / `top` / `print`，这三项移动端已有原生能力（下拉刷新 / 点顶端回顶 / iOS 无打印）。而**桌面浮层必须仍含全部 5 项**，裁剪精确落在移动容器内才算通过。
  - 打开时 `<html>` 计算样式 `overflow: hidden` 且面板 `overscroll-behavior: contain`；`Esc` 关闭并解锁，再次点击悬浮球可重开。
  - **测量面板位置前必须等入场动画播完**（面板入场起点为 `translateY(14%)`，未播完时 `getBoundingClientRect()` 返回动画中途位置，会被误判为 `position: fixed` 失效）。
- **`html-only`**：断言页面不存在 `.cm-*` / `.cm-launcher` / `data-reveal-ready` / script；普通导航在 320px 与 375px 下换行正常、无横向溢出，键盘 Tab 可达全部链接。
- 触控命中高度：主要链接/按钮 `getBoundingClientRect().height >= 40`（目标 44）；
- 折行/对齐：关键列表、导航、工具条在窄屏的换行与左缘对齐；
- 截图 ≥1 张，并给出路径；**fullPage 截图前先滚动到底触发全部 `[data-reveal]` 显现**，否则未触发区块在图面呈隐藏态（2026-10-11 实测口径，属记录方法问题而非页面缺陷）。

## 步骤 5b · 降级与可访问性（仅对引入 `<Reveal />` 的设计）

四种情形下必须实测"隐藏元素数为 0"（无 JS 时改用截图 + 如实声明）：

| 情形 | 构造方式 | 期望 |
|---|---|---|
| `prefers-reduced-motion: reduce` | `newContext({ reducedMotion: 'reduce' })` | 不写 `data-reveal-ready`；`animation: none`；隐藏元素 0 |
| 无 JavaScript | `newContext({ javaScriptEnabled: false })` | 全内容可见（无法 `evaluate`，以截图断言） |
| 不支持 `IntersectionObserver` | `addInitScript(() => delete window.IntersectionObserver)` | 不写门控；隐藏元素 0 |
| 脚本抛错 | `addInitScript(() => { window.IntersectionObserver = function () { throw new Error('boom') } })` | `try/catch` 撤销门控；隐藏元素 0 |

统计口径：`Array.from(document.querySelectorAll('[data-reveal]')).filter(e => getComputedStyle(e).opacity !== '1').length`。

## 步骤 6 · 对比度核算

- `styled`：对每个文字明度档 vs 实际底色核算对比度（含叠加层影响，如扫描线最坏行），记录数值；
- 未达标项要么调整设计，要么在 DESIGN.md 记录例外与理由。
- `html-only`：不声明颜色或背景，呈现由浏览器 / 用户设置决定；记录“无自定义对比度覆盖”，不得把浏览器默认色值伪造成主题 token。

## 步骤 7 · 记录与收口

- **记录收口（`docs/verification/`）**：更新 `docs/verification/<id>.md` 的当前完整验证状态（改动内容 + 实测证据 + 未测项声明）；重复验证**改写**本文件，不追加历史快照（历史由 Git 保留）。共享机制改动更新 `docs/verification/shared.md`；**共享操作菜单（桌面浮层 / 移动面板 / 悬浮球）的跨设计 / 跨输入环境 / 跨配置实测矩阵更新 `docs/verification/action-menu.md`**（ADR 0007 起独立成文）。
- **例外与适配的归属**：自撰设计（自产 / 复刻）——新 token、有意保留的检测器信号（格式：信号名 + 日期 + 理由）写入该 `DESIGN.md`；厂商来源设计（快照 / 汇编，规范只读、汇编为整合完成即冻结）——适配与检测器例外写入 `docs/designs/<id>/ADAPTATION.md`。
- **版本发布**：在 `change-log/<version>.md` 保留精简结论（成果 / 修复 / 验证结论），不写调试流水账。
- 最终状态：`npm run build` 绿 + 检测器 0 发现（或全部为已记录例外）。

## 可选 · 完整评审（更重的质量门）

需要设计层面评分时，按 `.agents/skills/impeccable/reference/critique.md` 的 dual-agent 流程执行 `critique`，快照与趋势用：

```powershell
.agents\skills\impeccable\scripts\impeccable.cmd critique-storage latest "src/designs/<id>/Page.astro" --json
.agents\skills\impeccable\scripts\impeccable.cmd critique-storage trend "src/designs/<id>/Page.astro" 5
```

## 通过标准（勾选表）

- [ ] `npm run build` 通过（含 astro check、html-only 产物门禁与 `verify:sections`），注册表校验无 `[senrenbanka]` 报错
- [ ] 主分区标签：每个主分区有 `data-section`，h2 只含标准标签，主题词在 h2 之外；该设计不在 allowlist 中
- [ ] 产物抽查按模式完成：`styled` 的 CSS 隔离 / 字体 / 核心字段通过；`html-only` 的资源禁令 / metadata rel / 核心字段通过，且 `npm run test:html-only` 全绿
- [ ] 多语言（步骤 2b）：各 locale 页面齐备、`lang`/`robots`/`canonical`/`hreflang` 正确；`styled` 菜单语言项与键盘路径通过；`html-only` 普通语言链接通过；语言/主题正交、旧路径跳转与配置开关均符合
- [ ] 韩语字体（若设计声明 `ko`）：`fonts:coverage` 通过；浏览器实际命中声明的 Hangul 核心字体；非 `ko` 页面未下载韩语子集
- [ ] 检测器 0 发现（或均已记录为例外）
- [ ] 桌面：console 0、仅自身资源；`styled` token 实测符合 DESIGN.md，`html-only` 只有 Document / favicon metadata 请求
- [ ] a11y：标题层级无跳级、每个分区有可访问名称、链接可访问名不含装饰符、装饰元素 `aria-hidden`
- [ ] 动效（若引入 `<Reveal />`）：门控写入、首屏 animation 生效、滚动到底全部 `data-reveal-in`、**跳转滚动不留隐藏元素**、console 0（无动效设计显式跳过并注明）
- [ ] 降级：reduced-motion / 无 JS / 无 IO / IO 抛错 四种情形下隐藏元素均为 0
- [ ] 375px + 触控：无横向溢出、命中 ≥40px、折行正常；`styled` 额外验证悬浮球 / 底部动作面板 / 背景滚动锁（ADR 0007），`html-only` 验证普通链接与目录键盘可达
- [ ] 对比度达标（或记录例外）；`html-only` 记录“无自定义颜色覆盖”
- [ ] `docs/verification/<id>.md`（或 `shared.md`）已更新为最新状态；例外按归属记录（自撰 `DESIGN.md` / 厂商来源 `ADAPTATION.md`）；截图留档且记录路径
