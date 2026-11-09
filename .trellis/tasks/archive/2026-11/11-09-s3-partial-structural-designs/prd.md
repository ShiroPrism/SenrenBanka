# S3 修复部分违规与结构统一（11 套）

## Goal

修复 9 套部分违规设计，并把 oxide / editorial 的分区标签结构统一为 h2 标准标签 + 可选 kicker；清空 allowlist，执行全量构建与浏览器验证。

## Scope

设计：archive、fax、lexicon、pager、pixel-pet-rpg、poster、radio、receipt、tape、oxide、editorial。

依赖：S1 的共享词表与检查脚本。S1 完成即可开始，不依赖 S2。

## 逐套映射

| 设计 | links | projects | experience | skills | contact | 简介 / 结构 |
|---|---|---|---|---|---|---|
| archive | 索引 → 链接 | 编目 → 项目 | 履历保留 | 主题词 → 技能 | 借阅 → 联系 | 备注 → 简介 |
| fax | 明细 → 链接 | 订单 → 项目 | 纪录 → 经历 | 技能保留 | 结账 → 联系 | 备注 → 简介 |
| lexicon | 明细 → 链接 | 订单 → 项目 | 纪录 → 经历 | 技能保留 | 结账 → 联系 | 备注 → 简介 |
| pager | 链接保留 | 项目保留 | 经历保留 | 技能保留 | 联系保留 | 备注 → 简介 |
| pixel-pet-rpg | 随身物品 → 链接 | 远方路标 → 项目 | 经历日志 → 经历 + kicker「日志」 | 工具 → 技能 | 联系保留 | 个人资料按 alias 保留或统一为简介 |
| poster | 明细 → 链接 | 订单 → 项目 | 纪录 → 经历 | 技能保留 | 结账 → 联系 | 备注 → 简介 |
| radio | 频道 → 链接 | 节目 → 项目 | 日志 → 经历 | 技能保留 | 联络按 alias 保留 | 备注 → 简介 |
| receipt | 明细 → 链接 | 订单 → 项目 | 纪录 → 经历 | 技能保留 | 结账台 → 联系 | 备注 → 简介 |
| tape | 曲目 → 链接 | 企划 → 项目 | 纪录 → 经历 | 技能保留 | 结算 → 联系 | 备注 → 简介 |
| oxide | CHANNELS / 链接 → h2 链接 | DEPLOYMENTS / 精选项目 → h2 项目 | OPERATIONS / 经历 → h2 经历 | CAPABILITIES / 能力 → h2 技能 | CONTACT → h2 联系 | IDENTITY / 身份 → h2 简介 |
| editorial | Elsewhere → h2 链接 + kicker Elsewhere | Selected Works 按 alias 保留或统一为 Projects + kicker | 不渲染 | 不渲染 | 不渲染 | hero bio |

## Requirements

### R1 — 9 套部分违规

- h2 使用共享 `label`；原主题词移到 h2 之外（kicker / subtitle / 装饰）。
- 已符合标准或 alias 的键保持不动，避免无意义 churn。
- 每个主分区加 `data-section`。
- 删除 `messages.ts` 中仅用于标准标签的键；主题词键保留。

### R2 — oxide 结构统一

- 所有 `ox-label` 的 `<p>` 改为 `<h2>`，保留原 class 或改为语义化标题类；视觉层级由 CSS 维持。
- 英文主题词（IDENTITY / CHANNELS / CAPABILITIES / DEPLOYMENTS / OPERATIONS）降为 kicker；h2 使用标准标签（可双语 canonical）。
- contact 在 `<footer>` 上，`data-section="contact"` 放在 footer。
- 行标题 `<h2 class="ox-row-title">` 仍是项目 / 经历条目标题，不参与主分区检查；若造成 heading 层级冲突，调整为 `<h3>` 并检查视觉。

### R3 — editorial 结构统一

- links h2 `Elsewhere` → 标准 `Links` / `链接` + kicker `Elsewhere`。
- projects h2 `Selected Works` 可作为 en alias 保留；若保留，下面的 `<p>精选作品</p>` 可删除或改为 kicker，避免重复标准标签。
- 补 `data-section="projects"` 与 `data-section="links"`；其余分区不渲染，不补。
- 保持 only-projects + links 的编辑式结构。

### R4 — allowlist 清空

- 从 allowlist 删除这 11 套；最终 `designs: []`。
- `verify:sections` 不得有任何跳过项。

### R5 — 全量验证

- 27 套 × 5 Locale 构建；`verify:sections` 通过。
- 每套改动设计执行 `design-page-verify`；重点 375px、减动态、无 JS、对比度、截图归档。
- `docs/verification/section-labels.md` 汇总最终证据。

## Acceptance Criteria

- [ ] 11 套在 5 Locale 下 `verify:sections` 通过。
- [ ] allowlist 为空；检查脚本无跳过项。
- [ ] oxide / editorial 的分区标签是 h2 标准词 + 可选 kicker；heading 层级无冲突。
- [ ] 9 套部分违规设计只改必要标签，标准 / alias 键不被无意义改写。
- [ ] 每套 `data-section` 完整；可访问名称有效。
- [ ] `npm run check`、`npm run build`、`npm run test`、`npm run verify:html-only` 通过。
- [ ] 全量构建页数、字体基线与 dist 体积记录在案。
- [ ] 不退役设计；不改 profile schema；不给 html-only 增加 CSS / JS。

## Out of Scope

- 不修改共享词表 / alias 白名单 / 检查脚本（除非发现 S1 缺陷，需回父任务处理）。
- 不修复 S2 的 8 套全违规设计。
- 不改变 oxide / editorial 的视觉语言。

## Verification

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

浏览器：11 套逐套桌面 + 375px；oxide / editorial 额外检查 heading 层级与键盘 / 屏幕阅读器路径。
