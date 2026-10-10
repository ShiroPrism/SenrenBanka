---
name: "design-page-verify"
description: "SenrenBanka 设计页验证流程：新建或修改设计页后，执行构建/类型检查、产物与 CSS 隔离抽查、impeccable 检测器、浏览器桌面实测、375px 触控仿真、a11y、对比度与截图归档，产出验证记录。新增设计完成或任一设计页改动后必须执行。"
---

# 设计页验证流程（SenrenBanka）

本 skill 是已验证过的"设计页完整验证"可执行版（对应 SPEC §13 验收标准与 AGENTS.md 新增设计评审清单）。
**新设计按 DESIGN.md 实现完成后、或任一设计页/样式/构建配置改动后**，按本流程逐步执行，不得跳步；无法验证的项必须如实标注（如仿真限制、真机未测），禁止虚构结果。

## 前置

- 预览：`npm run preview`（本项目 preview 固定在 http://localhost:4321；`npm run dev` 亦可）。
- 浏览器工具：`run_mcp` → server `integrated_code_mode` → tool `Exec`，内部用 `tools.browser_navigate / browser_evaluate / browser_console_messages / browser_take_screenshot` 等。
- 移动触控仿真：派 `browser_use` 子代理，要求其用自建 Playwright 上下文（`viewport 375×812 + hasTouch:true + isMobile:true`），并回读 `matchMedia('(pointer: coarse)').matches` 证明触控生效；若不可用，结论降级为"静态核对"并声明。
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
- **有效性反证**（必做，避免"静默空转"）：对已知含信号的目标（如 oxide 的网格底纹）或临时探针文件运行一次，确认检测器真的会命中；探针用完删除。
- 视觉叠层（可选，浏览器内信号）：`impeccable live-server --background` 获取端口 → 浏览器打开目标页 → 注入 `http://localhost:<port>/detect.js` → 读 console 的 `impeccable` 前缀消息 → `impeccable live-server stop`。

## 步骤 4 · 桌面实测（浏览器）

打开 `http://localhost:4321/<id>/`，用 `browser_evaluate` 取计算值：

- **console**：0 错误/警告；网络请求仅自身资源（HTML + 自身 CSS + 自身字体），无 404。
- **关键 token 复核**：颜色（如需对比度，直接算数值）、字号/字距、间距/padding、布局结构（如 grid 列宽）。
- **a11y 结构**：`h1→h2` 层级、`aria-labelledby/aria-label`、装饰元素 `aria-hidden`、链接可访问名（列出实测值）。
- **交互态**：`:hover` 无法直接 evaluate 时，采用"rest 计算值 + 构建产物中的 `:hover` 规则存在"双证。

## 步骤 5 · 移动端 + 触控仿真（子代理）

要求子代理在 375×812 + 触控仿真下断言并回报**实测值**：

- `matchMedia('(pointer: coarse)').matches === true`（触控媒体查询真实生效）；
- 无横向滚动：`document.documentElement.scrollWidth <= innerWidth + 1`；
- 触控命中高度：主要链接/按钮 `getBoundingClientRect().height >= 40`（目标 44）；
- 折行/对齐：关键列表、导航、工具条在窄屏的换行与左缘对齐；
- 截图 ≥1 张，并给出路径。

## 步骤 6 · 对比度核算

- 对每个文字明度档 vs 实际底色核算对比度（含叠加层影响，如扫描线最坏行），记录数值；
- 未达标项要么调整设计，要么在 DESIGN.md 记录例外与理由。

## 步骤 7 · 记录与收口

- **SPEC §18** 追加一条验证记录：改动内容 + 实测证据 + 未测项声明。
- **DESIGN.md** 同步：新 token、有意保留的检测器信号（格式：信号名 + 日期 + 理由）、例外说明。
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
- [ ] 桌面：console 0、仅自身资源、token/a11y 结构实测符合 DESIGN.md
- [ ] 375px + 触控：无横向溢出、命中 ≥40px、折行正常（或如实降级声明）
- [ ] 对比度达标（或记录例外）
- [ ] SPEC §18 与 DESIGN.md 记录已写入；截图留档且记录路径