# HTML Only 原生渲染契约与主题

> 父任务：`.trellis/tasks/10-28-web1-html-only/`。本子任务先完成渲染契约和产物门禁，再实现 `html-only` 主题；必须整体通过后才启动 Homepage '99。

## Goal

让 `html-only` 成为项目内一类显式、可验证、不是靠空 CSS 文件伪装的渲染模式，并用它交付一套完整可读、可导航、无自定义 CSS/JavaScript 的语义化个人介绍页。

## Requirements

- **R1 渲染模式**：`design.json` 支持 `renderMode: "styled" | "html-only"`，缺省 `styled`；既有 manifest 不需改动。
- **R2 文件契约**：`html-only` 必须有 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`，不得有 `style.css` / `tokens.css`；可提供完全自包含的 `Preview.astro`。
- **R3 页面资源**：最终页面不得含 `<style>`、`style` 属性、任何 `<script>`、stylesheet / preload、字体资源、事件处理器、`iframe` / `object` / `embed`；不得渲染 `Font`、`Reveal`、`ContextMenu`、`InfraStyles`。
- **R4 metadata**：继续原样使用 `HeadMeta`、`view.head.lang`、canonical / robots / alternate 规则；允许 `rel=canonical|alternate|icon` 与普通 meta。
- **R5 数据完整性**：渲染 `name` / `headline` / `bio` / `links` 与所有实际存在的 `location` / `projects` / `experience` / `skills` / `contact`；不渲染 avatar。
- **R6 原生导航**：普通 `<a>` 提供页内目录、同主题三语切换；`manualSwitch: true` 时提供“全部设计”链接到本地化切换页；不提供随机按钮。
- **R7 路由与选择**：设计进入 enabled 池、随机分配、切换页与旧路径兼容；支持 `manualSwitch:false`；不建立额外路由或存储机制。
- **R8 构建门禁**：新增产物级验证器，逐语言检查 HTML-only 页面，并纳入 `npm run build`；负向注入违规内容时必须失败。
- **R9 文档**：同步 `AGENTS.md`、`SPEC.md`、`design-page-verify`、ADR 引用、`docs/verification/shared.md`、`docs/verification/html-only.md` 和 `descriptions.ts`；修正“ContextMenu 静态 DOM 是无 JS 语言回退”的错误表述。
- **R10 依赖**：不新增第三方依赖；验证器只使用 Node 标准库和现有 `yaml`。
- **R11 范围**：只登记 `ContextMenu` 无 JS 回退、动态 locale 消息校验与 `_draft` 注册不一致，不实施修复。

## Acceptance Criteria

- [ ] **A1** `npm run build` 绿；`astro check` 0 error / 0 warning；HTML-only 三语共 3 页生成。
- [ ] **A2** `html-only` 目录无 `style.css`；带 `style.css` 的 `html-only` fixture 被注册表明确拒绝；既有 `styled` 设计缺少 `style.css` 仍被拒绝。
- [ ] **A3** 每个 `dist/<locale>/html-only/index.html` 均满足：0 `<style>`、0 `<script>`、0 `style` 属性、0 `on*`、0 stylesheet/preload；`<link>` 仅 `canonical|alternate|icon`。
- [ ] **A4** 验证器对临时注入 `<style>`、`<script>`、`style=`、stylesheet link 的副本分别以非零状态失败，并指出文件与原因。
- [ ] **A5** 三语页面核心字段与现有可选资料完整；`html` lang、title、description、canonical、robots 正确。
- [ ] **A6** 语言链接保持 `html-only`、带 `hreflang`/`lang` 和当前 `aria-current`；“全部设计”链接受 `manualSwitch` 门控；所有链接兼容 `BASE_PATH=/demo`。
- [ ] **A7** 无 JS、禁用 CSS、320–375px 视口与键盘导航下，内容完整、无横向溢出、所有普通链接可达；不出现隐藏菜单或不可用交互。
- [ ] **A8** 页面在切换页参与随机池和手动选择；`manualSwitch:false` 时不渲染切换页与设计切换链接，但语言链接仍正常，设计页仍可直接访问。
- [ ] **A9** `descriptions.ts` 有 `html-only` 三语说明；`Preview.astro` 自包含且切换页可见，正式页仍为 0 CSS / JS。
- [ ] **A10** AGENTS / SPEC / verification skill / docs 已同步，且明确记录未修复的既有缺陷。
- [ ] **A11** `impeccable detect --json src/designs/html-only` 为 0 或所有发现已按规则记录。

## Out of Scope

- 修复 ContextMenu 无 JS 回退。
- 修复 messages.ts 动态 locale 强校验。
- 修复 `_draft` 注册不对称。
- 为 HTML Only 增加 CSS、字体、图标、预览或客户端交互。
- 新增后端、测试框架或浏览器自动化生产依赖。
