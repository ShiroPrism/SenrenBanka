# 旧设计字体调研与系统默认字体替换

## Goal

对字体选型指南建立前完成的九套设计做一次可追溯的字体审计，修复实际接线断裂，补足选型与许可记录，并在不牺牲字体质量、可读性与静态部署兼容性的前提下控制切换页的字体并集和网络成本。

用户价值：这些设计不再依赖“碰巧看起来还行”的默认字体；每套字体都有可复核的隐喻、角色分配、覆盖、许可和回退依据，后续扩展到更多设计时也不会悄悄放大字体成本。

## Background

- 以字体指南提交 `7368595`（2026-10-17）为分界，指南前已有九套设计需要审计：`archive`、`editorial`、`fast`、`terminal`、`oxide`、`material3`、`kern`、`govuk`、`frost`。
- `AGENTS.md` 要求字体选型遵循 `docs/fonts/selection-guide.md`：先设计隐喻与角色，再用真实字体文件样张目检，过许可闸门，最后走 `astro.config.mjs` → `<Font>` → `@theme inline` 的生产接线。自产/复刻记录写入 `DESIGN.md`；厂商来源记录写入 `docs/designs/<id>/ADAPTATION.md`。
- 切换页已按 `Preview.astro` 架构渲染所有设计；预览不 import 正式页 `style.css`，字体由切换页按族去重后声明。预览文字允许触发 CJK 子集下载，但不得 preload，也不得把完整设计打包进切换页。
- 0.14.0 基线：16 套预览、切换页 CSS 约 51,963 B、HTML 约 89,379 B、82 个 `@font-face`；运行时每种语言实际请求 22 个唯一 WOFF2。字体族并集不会随设计数线性增长，但每新增一个族都会抬高声明数与潜在运行时请求。

## Confirmed Facts

### 接线与现状

| 设计 | 来源类型 | 当前接线 | 审计结论 |
|---|---|---|---|
| `archive` | 自产 | Sorts Mill Goudy + Courier Prime + Zhuque Fangsong；三族均经 `<Font>` 接入 | 六项记录完整，保留并复核 |
| `editorial` | 自产 | Fraunces 经 `<Font>` 接入；Georgia 正文、`system-ui` 标签为系统字体 | 记录不完整；新增更“有味道”的衬线只会扩大字体并集，倾向保留 |
| `terminal` | 自产 | JetBrains Mono 已注册并经 `<Font>` 加载 | “使用默认字体”的判断不成立；真实问题是缺少六项记录与候选对照 |
| `oxide` | 厂商快照 | 规范声明 `SuisseIntl` / `GT America Mono`，但两族均未注册，页面无 `<Font>` | **高风险实际缺陷**：CSS 只保留字体字符串，浏览器静默回退系统字体 |
| `fast` | 厂商快照 | Segoe UI 系统栈；无 `@font-face` | 与官方快照一致；需补 `ADAPTATION.md` 追溯记录 |
| `material3` | 官方文档汇编 | Roboto Flex 经 `<Font>` 接入 | 接线正确；需补 `ADAPTATION.md` 六项记录 |
| `kern` | 第三方分析复刻 | Geist + Geist Mono 经 `<Font>` 接入 | 接线正确；需补 `DESIGN.md` 六项记录 |
| `govuk` | 官方文档汇编 | Arial 系统栈；GDS Transport 不可再分发 | 与上游回退口径一致；需扩写 `ADAPTATION.md` 六项记录 |
| `frost` | 第三方分析复刻 | Inter 经 `<Font>` 接入 | 接线正确；需补 `DESIGN.md` 六项记录 |

### 实机与构建证据

- `/zh-cn/terminal/`：计算字体为 JetBrains Mono，实际请求 `font-jetbrains-mono-100-800-normal-*.woff2`（约 40,404 B）；正文 15px / 行高 24px。
- `/zh-cn/oxide/`：`document.fonts` 为空；计算值仍显示 `SuisseIntl` / `GT America Mono`，说明字体从未加载，只会回退。`Page.astro` 无 `<Font>`，`Preview.astro` 也导出空 `fonts`。
- `/zh-cn/editorial/`：仅 Fraunces 被加载；Georgia 与 `system-ui` 标签由系统提供。
- `/zh-cn/designs/`：16 套预览均存在；375px 下卡片约 312 × 291.6px，间距一致。切换页无设计页 CSS 边、预览无 `:root` 泄漏。
- 本地已下载候选的真实样张：VT323、Share Tech Mono 均不覆盖 Oxide/Terminal 使用的 `▁▂▃▄▅▆▇█`、`└─`、`●`、`■` 等字符；它们不能单独承担现有 ASCII 波形或框线。替 Terminal 正文引入它们会同时牺牲字符覆盖与正文宽度。

### 字体与文档归属

- 厂商来源只读规范：`oxide` / `fast` / `material3` / `govuk` 的 `DESIGN.md` 不得改写；记录归 `docs/designs/<id>/ADAPTATION.md`。
- 自产/复刻可修订规范：`archive` / `editorial` / `terminal` / `kern` / `frost` 的六项记录归各自 `DESIGN.md`。
- 生产字体来源与许可：既有 npm/Fontsource 六族、本地保留的开源字体和在线候选均需逐项核对；不得把 `.local-fonts/` 路径、字体库文件或本机路径写入生产配置、`src/`、`public/` 或公开文档。

## Requirements

### R1 · 范围与不回归

- 审计并记录上述九套设计；不把指南后的七套拟物设计重新纳入范围。
- 保持九套设计的视觉身份、内容结构、动效语言、共享操作菜单、多语言与静态部署兼容性不变；除非字体接线或可读性证据要求变更。
- 不批量重做设计，不生成或引入静态截图，不引入运行时字体 CDN、服务器依赖或截图维护管线。

### R2 · 以证据决定“替换”

- 每套设计先确认隐喻与角色（标题 / 正文 / 数字或技术标记），再对现有字体做真实样张与字符覆盖复核。
- 只有同时满足以下条件才替换现有字体：现字体与隐喻明显冲突，候选在目标字号可读性更好，覆盖与回退可接受，许可允许自托管，且新增字体成本有明确收益。
- 不允许仅因“名字更艺术”“看起来更专业”而新增字族；不把“系统字体”自动等同于缺陷。

### R3 · 修复真实接线缺陷

- `oxide`：用项目可再分发、可自托管的字体恢复规范中的“文字声部 + 技术等宽声部”对比。优先复用已入库且许可清楚的 Geist / Geist Mono，并以系统中文与日文回退收尾；不得引入不可再分发的 SuisseIntl / GT America Mono。
- `oxide` 的 ASCII/块字符覆盖必须在实施前实测；候选若缺 `▁▂▃▄▅▆▇█`、框线或强调符号，必须提供明确的字体栈回退或调整装饰方案，不得让关键字符静默换字形。
- `terminal`：保留 JetBrains Mono 作为基线，除非样张证明它在 15px 正文与现有字符集上明显不合格；VT323 / Share Tech Mono 只能作为有覆盖证明的补充或仅展示用途，不得因“更像 CRT”直接取代正文。
- `editorial`：Fraunces 继续承担展示；Georgia / 系统无衬线正文只有在样张证明有明确收益且字体成本可接受时才调整。

### R4 · 六项记录与许可

每套设计补齐同构的六项记录：

1. 设计隐喻与字体需表达的特征；
2. 标题 / 正文 / 数字或技术标记的角色分配；
3. 为什么选中该字体而非其他候选；
4. 简体中文、日文、英文的实际覆盖与回退；
5. 字重、可变轴、资源体积与许可；
6. 目标字体缺失时的完整回退顺序。

- 厂商来源只写 `ADAPTATION.md`，不改 `DESIGN.md`。
- 新增或替换任何生产字体前，必须核对官方许可、RFN（如适用）与可再分发条件；需要保留声明的字体随设计附 `SOURCE-LICENSE.txt`。
- 生产字体栈必须包含系统中文与通用族兜底；不得用字体名称或内嵌字段替代人工许可核实。

### R5 · 加载与切换页成本

- 继续使用现有静态字体管线；不新增必须依赖服务器运行的方案。
- 不为预览单独声明 `<Font>`；预览的 `fonts` 只列出实际渲染用到的族，切换页按族去重，不 preload。
- 新增字族必须给出理由与体积预算；切换页字体并集、`@font-face` 数、运行时 WOFF2 请求数不得无依据增长。
- CJK 子集仍按 `unicode-range` 惰性加载；不得为少数字符引入整套大字体。

### R6 · 文档与验证

- 更新对应 `docs/verification/<id>.md` 与 `docs/verification/shared.md`，记录字体接线、实际请求、覆盖、回退和切换页成本。
- 本次设计选择 / 流程若有长期影响，更新 `docs/fonts/selection-guide.md` 或 ADR；不把本机候选清单写进公开文档。
- 版本发布时更新 `package.json` 与 `change-log/`（包含此前遗漏的提交补记，按仓库现有版本策略执行）。

## Acceptance Criteria

- [x] **A1 范围与记录**：九套设计逐一有结论；自产/复刻的五套（`archive` 已有，`editorial` / `terminal` / `kern` / `frost` 补齐）六项记录位于 `DESIGN.md`；厂商来源四套（`oxide` / `fast` / `material3` / `govuk`）记录位于 `ADAPTATION.md`，且 `DESIGN.md` 未被改写。
- [x] **A2 Oxide 接线**：`/zh-cn/oxide/` 实际加载两个可再分发字体族（或一个明确的双声部组合）；`document.fonts.check()` 与网络请求均能证明不再回退到系统默认；ASCII/块字符覆盖有实测记录，缺字有可接受回退。
- [x] **A3 Terminal / Editorial 复核**：两套的六项记录包含真实样张结论、候选取舍、覆盖与回退；若保留现字体，必须明确“为什么不需要替换”；若替换，需有可复核的样张与许可依据。
- [x] **A4 系统字体设计**：`fast` / `govuk` 的厂商口径与系统栈保持一致，记录齐全；不得为了“更有个性”引入替代字体。
- [x] **A5 字体加载**：三语言设计页无第三方字体域名；断网 / 字体加载失败时正文仍可读；切换页不 preload，CJK 子集按需下载；新增字体的运行时请求与体积记录在验证文档中。
- [x] **A6 隔离与静态部署**：预览不 import 正式页 `style.css`，无 `:root` 泄漏，无可聚焦元素；正式页每页只链接自身 CSS；`BASE_PATH` 构建与静态产物正常。
- [x] **A7 响应式与无障碍**：桌面与 375px 下无横向溢出；字体替换不降低正文对比度、可读性或触控命中；`prefers-reduced-motion` 和无 JS 降级不受影响。
- [x] **A8 构建与成本**：`npm run check` 与 `npm run build` 通过；记录切换页 CSS、HTML、`@font-face` 与唯一字体文件数相对 0.14.0 基线的变化；任何增长都有明确理由。
- [x] **A9 文档同步**：对应验证文档、共享验证文档、字体指南/ADR（如适用）和 `change-log/` 更新；版本号按实际发布策略处理。

## Out of Scope

- 重做九套设计的布局、动效、内容结构或视觉方向。
- 为所有旧设计统一添加艺术字体，或为“丰富度”新增字体族。
- 修改厂商来源的 `DESIGN.md` 快照。
- 生成静态截图、引入截图回归服务、运行时字体 CDN、服务端渲染或分页/搜索等复杂切换页机制。
- 扩写 114 套设计的完整字体方案；仅保留规模评估与后续触发条件。

## Open Questions

- 无阻塞项。最终推荐范围与每套处置以 `design.md` 为准；实施前需用户明确批准最终规划摘要。
