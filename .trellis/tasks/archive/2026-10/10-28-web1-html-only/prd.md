# Web 1.0 与 HTML Only 双主题

> **父任务（任务地图）**。本任务只负责源需求、子任务契约、跨任务验收与最终整合复查，不直接实现主题。

## Goal

为 SenrenBanka 新增两套定位明确区分的正式主题：

1. `homepage99`：1998–1999 年个人主页 / GeoCities 式的 Web 1.0 页面，强调侧栏导航、表格式信息组织、粗边框、密集内容与本地装饰，不复用现有设备拟物主题的定位。
2. `html-only`：完全不加载自定义 CSS、JavaScript、字体资源或共享交互 chrome 的语义化 HTML 页面，用验证证明同一份 profile 仍可完整阅读和导航。

用户价值：站点同时获得一套鲜明的早期互联网视觉表达，以及一套可作为极端降级、语义结构与资源边界基准的原生 HTML 设计。

## Confirmed Decisions

- `design.json` 显式声明 `renderMode: "styled" | "html-only"`，默认 `styled`。
- `html-only` 必须有 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`；不得有 `style.css`。
- HTML-only 继续使用 `loadDesignView`、`HeadMeta`、profile、locale、SEO、base path、随机池与手动切换身份。
- HTML-only 不渲染 `Font`、`Reveal`、`ContextMenu`、`InfraStyles` 或任何自定义样式/脚本；语言与设计切换使用普通链接。
- 构建必须读取最终产物，禁止 `<style>`、`style` 属性、任何 `<script>`、stylesheet/preload、事件处理器与嵌入式活动内容；允许 canonical / alternate / icon 等 metadata 链接。
- Homepage '99 使用语义 HTML + CSS Grid 模拟旧网页骨架，只有结构化数据使用真实 `<table>`；系统字体、无新字体依赖。
- Homepage '99 提供 `tokens.css` 与 `Preview.astro`；HTML Only 提供自包含 `Preview.astro`，正式页面仍不提供 `style.css` / `tokens.css`。
- Homepage '99 仅保留一个低速施工斜纹循环；不接入共享 Reveal、不做闪烁或滚动入场。

## Requirements

- **R1 HTML Only 与渲染契约**：完成显式渲染模式、注册表分支校验、最终 HTML 验证器和语义化 HTML 主题；不得用空 `style.css` 绕过。
- **R2 Homepage '99**：完成正式页、tokens、预览、三语文案、切换页说明和验证记录；必须与 Terminal / Pager / Radio / Fax / Receipt / Tape 等既有主题明显区分。HTML Only 也提供自包含预览，使两套新主题在切换页均可辨识。
- **R3 数据完整性**：两套主题都渲染 `name` / `headline` / `bio` / `links`，并渲染实际存在的 `location` / `projects` / `experience` / `skills` / `contact`。HTML Only 不渲染头像。
- **R4 路由与切换**：两套设计都进入 enabled 池、随机分配、切换页、三语路由、旧路径兼容和 `manualSwitch` 语义；不得建立第二套路由。
- **R5 链接与部署**：所有内部链接正确处理 locale 与 base path；HTML Only 的语言链接保持同主题，设计切换链接只在手动切换开启时出现。
- **R6 执行顺序**：先完成并验收 `HTML Only` 子任务，再完成 `Homepage '99`；父任务最后执行跨主题整合复查。
- **R7 共享文件归属**：每个子任务只写自己的 `${id}` 说明条目到 `src/designs/descriptions.ts`；严格串行，不并行修改该文件。
- **R8 文档同步**：HTML Only 子任务更新渲染模式相关项目规则、SPEC、验证 skill 与 ADR；Homepage '99 只更新自身设计与验证文档。
- **R9 范围纪律**：不修复 `ContextMenu` 无 JS 回退、`messages.ts` 动态 locale 校验、`_draft` 注册不对称等既有问题，只登记风险。

## Child Task Map

| 顺序 | 任务 | 路径 | 职责 |
|---|---|---|---|
| 1 | HTML Only 原生渲染契约与主题 | `.trellis/tasks/10-28-html-only/` | 渲染模式、注册表、验证器、全局规范、HTML Only 主题、自身 descriptions 与验证 |
| 2 | Homepage '99 早期个人主页 | `.trellis/tasks/10-28-homepage99/` | styled 主题实现、tokens、preview、自身 descriptions 与验证 |

Trellis 的父子关系不提供运行时依赖；上述顺序写在两个子任务的 PRD 与 implement 中，作为人工评审门槛。

## Acceptance Criteria

- [ ] **A1** 两个子任务各自完成规划、实施、验证并归档；父任务只在两者完成后做整合复查。
- [ ] **A2** `npm run build` 绿；以当前 16 套 × 3 语言 / 73 页为基线，新增后为 18 套 × 3 语言 / 81 页（两套新设计各增加 3 个语言页与 1 个旧路径兼容页）。
- [ ] **A3** 两套设计在 `dist/<locale>/<id>/index.html` 均存在，出现在三语切换页、随机池与共享操作菜单的目标池中；两套新主题在切换页均有可辨识预览；`manualSwitch:false` 时仍可直接访问并保持语言切换语义。
- [ ] **A4** HTML Only 构建门禁逐语言通过：0 `<style>`、0 `<script>`、0 `style` 属性、0 事件处理器、0 stylesheet/preload，`<link>` 仅限获准 metadata rel；人为注入违规标签时命令必须失败。
- [ ] **A5** Homepage '99 桌面与 375px 均无横向溢出；核心与所有存在的可选资料可见；系统字体栈生效；唯一循环动效在 reduced-motion 下停止。
- [ ] **A6** `src/designs/descriptions.ts` 同时存在 `html-only` / `homepage99` 的 zh-CN / ja / en 条目，三语文案不新增原文没有的解释性内容。
- [ ] **A7** 既有 16 套设计的 CSS 隔离、共享操作菜单、语言切换、随机/缓存与 SEO 行为无回归。
- [ ] **A8** `AGENTS.md`、`SPEC.md`、`design-page-verify`、ADR、`docs/verification/shared.md`、两套验证记录与 change-log 在对应子任务/收口阶段同步完成。

## Risks

- **产物级例外容易被绕过**：只检查源码或只检查 `<link>` 会漏掉内联 `<style>` / `<script>`，必须以构建后的 HTML 为准。
- **动态 locale 校验缺口**：`messages.ts` 现有注册表仅检查文件存在；新增 locale 时仍需逐设计更新固定 union。
- **共享 descriptions 冲突**：两个主题都修改同一索引，必须串行执行。
- **视觉与现有拟物主题重叠**：Homepage '99 不得转向 CRT、设备面板、终端、纸张或票券语法。
- **无 JS 回退误判**：现有设计页不存在可用语言回退；本次不得在验证记录中谎称它已通过。

## Out of Scope

- 修复 `ContextMenu` 的无 JS 回退。
- 修复 `messages.ts` 的动态 locale 强校验。
- 修复 `_draft` 目录注册不对称。
- 修改默认主题或 `manualSwitch` 示例配置。
- 新增后端、访问统计、Guestbook 服务、Webring 服务或第三方依赖。
