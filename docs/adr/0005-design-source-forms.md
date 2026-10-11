# 设计来源扩充为三形态：快照、官方文档汇编、视觉复刻（含许可口径与排除名单）

## 背景与决定

二期扩充调研（2026-10-11，grill 访谈 + 多路网络核查）结论：厂商"原生单份 DESIGN.md"净新增近乎枯竭——官方索引 11 条中可收的仅 Juspay（MIT）与存疑的 VoltAgent，索引外仅小微厂两个；而各大厂商普遍以**官方开放文档**（仓库 markdown / 官网文档）形式公开设计系统（Carbon / USWDS / GOV.UK / Material 3 / Ant / TDesign 等，许可多为 MIT / CC0 / OGL / CC BY / Apache）。若不放宽"逐字快照"口径，主题扩充空间≈0。项目所有者决定全量收录 A / B 两类（分批推进、不设硬上限），据此：

1. **三形态与类型映射**：
   - **快照** = `official-vendor`（不变）：厂商官方单份 `DESIGN.md` 逐字快照，只读；
   - **汇编** = `official-docs-derived`（**新增枚举**）：从厂商官方开放文档遴选**整合**为一份 `DESIGN.md`——自有行文组织、文末「来源与许可」附录逐节保留出处、`SOURCE-LICENSE.txt` 附逐来源许可全文；**非逐字快照；整合完成即冻结**（跟随上游 = 新一次整合，记 changelog）；
   - **复刻** = `third-party-analysis`（复用枚举，语义收窄为"视觉语言致敬"）：规范完全自撰、不移植上游文本与素材、标注"非官方分析"、命名不含商标；`url` / `fetchedAt` 记录参考对象与视觉分析日期。
2. **许可纪律不变**：不得把"允许网页使用"等同于"允许打包再分发"；许可不可核实即弃用（延续 Vercel 先例）。外部抽取 / 逆向索引（awesome-design-md、designmd.app、designsystems.one 等）一律不接入；Atlassian、Shopify Polaris 明文禁止再分发 / 演绎，快照与复刻均回避。
3. **许可未证实的候选（Arco / DevUI / ECL / SGDS / Codex / Nord / Garden）**：不追查其文档许可、视同不可用；仅以复刻形态收录。
4. **二期 30 席 + 批次纪律**：顺序、许可与状态见 SPEC §4.4。汇编 recipe 经 Carbon 打样验证（2026-10-11）；该打样随后因与既有设计同质被移除（复核记录见 SPEC §4.4 / §4.4.1）；批次 2 起按「视觉差异化矩阵」（与现有设计的正交性）过滤重排。

## 被否决的选项

- **只收原生单份快照**：净新增 ≈ 1–2 套，与"更多主题"目标相悖。
- **只收视觉复刻**：规范权威性弱、文本全自撰，失去"收录厂商规范"的项目立意。
- **汇编伪装成逐字快照**：多文件 / 官网来源无法整份逐字，且"整合为一份"必然引入遴选与行文；如实标注比假装快照诚实。
- **接入 awesome-design-md 等第三方抽取内容**：来源不可溯、许可不可靠（复核证据见 SPEC §4.1）。
- **汇编不入 registry 枚举（另立旁路文档）**：构建校验（缺 provenance 即失败）将失守。

## 后果

- SPEC §4.1 / §4.2 已修订（三形态流程与标签）；`registry.ts` 枚举已扩；AGENTS.md、`docs/README.md`、CONTEXT.md 已同步（新增术语：Vendor snapshot / Design compilation / Design reinterpretation）。
- 厂商来源设计（快照 / 汇编 / 复刻）均建 `docs/designs/<id>/ADAPTATION.md` 记录适配与取舍（对齐 fast / oxide 惯例）；验证沿用 `design-page-verify`。
- 快照"只读"与汇编"冻结"同受「官方原始 DESIGN.md 不得被改写成项目适配版本」约束；上游更新 = 新一次抓取 / 整合并记 changelog。