# 主分区标准标签：共享词表、data-section 与构建校验

- 状态：Accepted（2026-11-09）
- 相关：`CONTEXT.md`「Primary section / Standard section label / Theme word」；`docs/rules/design-contract.md`「信息架构与主题文案」；`docs/rules/accessibility-responsive.md`；`docs/rules/operations.md`；`AGENTS.md` 第 9 条硬门禁；`.trellis/tasks/11-09-standard-section-labels/`
- 证据：27 套设计审计见 `.trellis/tasks/11-09-standard-section-labels/research/audit-2026-11-09.md`；验证记录见 `docs/verification/section-labels.md`

## 背景

- 2026-11-07 的 `4f43172` 随 `shelf` / `magical-girl` 退役加入「主分区必须保持求职语义」规则，但既有主题尚未审计；审计发现 8 套主分区全部被主题词替换、9 套部分违规、1 套待定、1 套结构违规，只有 8 套语义合规。
- 分区标签属于信息架构，不属于视觉设计：NN/g / UXmatters 的 wayfinding 研究要求标签清晰、可区分；WCAG 2.4.6 要求标题描述主题或用途；CSS Zen Garden 证明同一份内容结构可以承载大量不同视觉设计。
- 现有分区文案由各设计 `messages.ts` 自持，27 套 × 5 Locale 的重复会漂移；没有统一的构建门禁。

## 决策

1. 主分区固定为六个：简介 / 项目 / 经历 / 技能 / 联系 / 链接；简介 hero 允许没有 h2。
2. 主分区 h2 的文本只能由当前 Locale 的 canonical、英文 canonical 或显式 alias 词元组成；主题词完全移出 heading，只能作为可选 kicker / subtitle / 装饰。
3. 标准标签由共享纯数据词表 `src/i18n/sections.ts`（数据源 `src/i18n/sections.json`）提供；设计 `messages.ts` 不再维护标准标签。alias 是显式白名单，不接受任意同义词。
4. 每个主分区的 sectioning 元素带 `data-section="<key>"`；只用于构建期校验，不产生样式或脚本，`html-only` 同样适用。
5. 新增 `npm run verify:sections`：构建后扫描 `dist`，按 Locale 校验每个 `data-section` 的 h2；临时 allowlist 只允许迁移期设计跳过，最终必须为空。
6. 存量 27 套全部修复，不退役；S1 迁移 8 套合规设计并建立共享契约，S2 修复 8 套全违规，S3 修复 9 套部分违规 + oxide / editorial 结构统一。

## 结果

- 27 套设计的 h2 使用同一套标准标签；主题词的语域仍保留在 kicker / subtitle / 正文，不再承担 heading 语义。
- 首次访问者和屏幕阅读器无需解码主题即可识别分区；`verify:sections` 在构建期阻止回归。
- 标准标签只维护一份；设计只维护主题词与真正需要随语言切换的文案。
- 代价：新增 `data-section` 属性与共享词表；短标签可能改变标题区排版，需要逐套微调 CSS；alias 白名单需要人工审查。

## 替代方案

- **每套设计各自维护标准标签**：保留“文案全归设计”的旧边界，但 27 × 5 × 6 的重复会漂移，且无法构建期校验。拒绝。
- **主题词做主标题、标准词做副标题**：首次识别仍依赖访问者先读次级标签；不符合 WCAG 2.4.6 对 heading 描述用途的要求。拒绝。
- **共享 `<SectionHeading>` 组件**：会约束各设计的 h2 结构与样式，增加样式隔离风险；只共享数据即可。拒绝。
- **运行时 JavaScript 检查 / 人工走查**：不能阻止回归，且依赖浏览器；构建产物扫描更确定。拒绝。
- **退役所有违规设计**：审计未发现商品化文案，交易语域只是隐喻；修复成本主要是标签替换，退役会损失策展成果。拒绝。

## 风险与回滚

- **标题区排版**：标签变短可能留下空洞或破坏栅格；每套设计必须目检桌面 / 375px，必要时只调整标题区字号、间距、装饰线，不改变视觉语言。
- **共享词表耦合**：设计依赖纯数据模块，不依赖 CSS / 组件；若需回滚，删除导入、`data-section` 与检查脚本，恢复 `messages.ts` 标签键即可。
- **allowlist 长期化**：allowlist 是迁移期债务清单，必须在 S3 清空；最终交付时 `verify:sections` 不得有跳过项。
- **alias 后门**：alias 必须显式评审，主题词不得进入；单元测试对已知主题词做禁止断言。
- **旧路径重定向页**：检查器跳过含 `meta http-equiv="refresh"` 的页面；真实设计页仍逐页校验。
