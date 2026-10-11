---
name: "design-page-verify"
description: "SenrenBanka 设计页验证流程：新建或修改设计页（或 src/lib / src/components 共享机制）后，执行构建/类型检查、产物与 CSS 隔离抽查、impeccable 检测器、浏览器桌面实测、动效实测、375px 触控仿真、降级与可访问性（reduced-motion / 无 JS / 无 IO）、对比度与截图归档，产出验证记录。新增设计完成或任一设计页 / 共享机制改动后必须执行。"
---

# 设计页验证流程（SenrenBanka）

本 skill 是已验证过的"设计页完整验证"可执行版（对应 SPEC §13 验收标准；规则见 `AGENTS.md`，记录归属见 `docs/README.md`）。
**新设计按 DESIGN.md 实现完成后，或任一设计页 / 样式 / 构建配置 / `src/lib/` / `src/components/`（共享机制）改动后**，按本流程逐步执行，不得跳步；无法验证的项必须如实标注（如仿真限制、真机未测），禁止虚构结果。
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
npm run build        # 含 astro check；注册表校验失败会以 [senrenbanka] 前缀报错
npm run check        # 仅类型检查（可按需）
```

- 四件套齐备：`DESIGN.md` / `design.json` / `Page.astro` / `style.css`。
- `design.json`：非自产来源必须含 `source.url/fetchedAt/license`；许可要求保留声明时附 `SOURCE-LICENSE.txt`。

## 步骤 2 · 产物静态抽查

以 `<id>` 为目标设计 id、`<特征选择器>` 为该设计独有选择器（如 `.ed-masthead{`）：

1. **CSS 隔离**：在 `dist/_astro/*.css` 中定位含 `<特征选择器>` 的文件；断言其他设计的选择器/工具类**不出现**在其中；断言 `dist/index.html`（根路由页）、`dist/designs/index.html`（切换页，若构建）、`dist/404.html` **不链接**任何设计 CSS。
2. **base 前缀**：`npm run build -- --base /demo`（或设置 `BASE_PATH` 环境变量）后抽查 `dist/<id>/index.html` 的内部链接均带 `/demo` 前缀。
3. **字体与资源**：该页面只引用自身用到的字体文件；`rel="preload"` 数量与预期一致（无多余子集预载）。
4. **核心字段**：目标页面 HTML 中核心字段（name/headline/bio/links）全部渲染。

## 步骤 3 · impeccable 检测器

```powershell
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/<id>
```

- `[]` + exit 0 = 干净；有发现时逐条处理或按"有意为之"记录（见步骤 7）。
- **有效性反证**（必做，避免"静默空转"）：对已知含信号的目标（如网格底纹类信号；已记录的例外见 `docs/designs/*/ADAPTATION.md` 或主题验证记录）或临时探针文件运行一次，确认检测器真的会命中；探针用完删除。
- 视觉叠层（可选，浏览器内信号）：`impeccable live-server --background` 获取端口 → 浏览器打开目标页 → 注入 `http://localhost:<port>/detect.js` → 读 console 的 `impeccable` 前缀消息 → `impeccable live-server stop`。

## 步骤 4 · 桌面实测（浏览器）

打开 `http://localhost:4321/<id>/`，用 `browser_evaluate` 取计算值：

- **console**：0 错误/警告；网络请求仅自身资源（HTML + 自身 CSS + 自身字体），无 404。
- **关键 token 复核**：颜色（如需对比度，直接算数值）、字号/字距、间距/padding、布局结构（如 grid 列宽）。
- **a11y 结构（逐项可判定）**：
  - 标题层级 `h1 → h2 → h3` 无跳级；
  - **每个 `<section>` / 分区都有可访问名称**（`aria-labelledby` 指向同区可见标签，或 sr-only 标题）——实测 `[aria-label],[aria-labelledby]` 计数必须 > 0；
  - **装饰符号不进入可访问名**：`▸` `└─` `#` `●`、ASCII 波形、扫描线等一律 `aria-hidden`；链接可访问名**不得**以这类符号开头；
  - 输出实测值：标题序列、链接可访问名列表、`aria-hidden` 计数。
- **交互态**：`:hover` 无法直接 evaluate 时，采用"rest 计算值 + 构建产物中的 `:hover` 规则存在"双证。

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
- 无横向滚动：`document.documentElement.scrollWidth <= innerWidth + 1`；
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

- 对每个文字明度档 vs 实际底色核算对比度（含叠加层影响，如扫描线最坏行），记录数值；
- 未达标项要么调整设计，要么在 DESIGN.md 记录例外与理由。

## 步骤 7 · 记录与收口

- **记录收口（`docs/verification/`）**：更新 `docs/verification/<id>.md` 的当前完整验证状态（改动内容 + 实测证据 + 未测项声明）；重复验证**改写**本文件，不追加历史快照（历史由 Git 保留）。共享机制改动更新 `docs/verification/shared.md`。
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

- [ ] `npm run build` 通过（含 astro check），注册表校验无 `[senrenbanka]` 报错
- [ ] 产物抽查：CSS 隔离、base 前缀、字体资源、核心字段全部通过
- [ ] 检测器 0 发现（或均已记录为例外）
- [ ] 桌面：console 0、仅自身资源、token 实测符合 DESIGN.md
- [ ] a11y：标题层级无跳级、每个分区有可访问名称、链接可访问名不含装饰符、装饰元素 `aria-hidden`
- [ ] 动效（若引入 `<Reveal />`）：门控写入、首屏 animation 生效、滚动到底全部 `data-reveal-in`、**跳转滚动不留隐藏元素**、console 0（无动效设计显式跳过并注明）
- [ ] 降级：reduced-motion / 无 JS / 无 IO / IO 抛错 四种情形下隐藏元素均为 0
- [ ] 375px + 触控：无横向溢出、命中 ≥40px、折行正常（或如实降级声明）
- [ ] 对比度达标（或记录例外）
- [ ] `docs/verification/<id>.md`（或 `shared.md`）已更新为最新状态；例外按归属记录（自撰 `DESIGN.md` / 厂商来源 `ADAPTATION.md`）；截图留档且记录路径