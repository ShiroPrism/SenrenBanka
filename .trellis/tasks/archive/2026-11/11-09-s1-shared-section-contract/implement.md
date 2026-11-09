# S1 执行计划：共享契约与 8 套合规设计迁移

## 顺序

1. 词表与检查脚本
2. 8 套合规设计迁移
3. 规则 / ADR / verification
4. 构建接入与全量验证

## 1. 词表与检查脚本

- [ ] 新建 `src/i18n/sections.ts`，按父任务 `design.md` 第 3 节补全 5 Locale × 6 SectionKey。
- [ ] 新建 `scripts/check-section-labels.mjs`。
- [ ] 新建 `scripts/check-section-labels.test.mjs`，覆盖设计文档第 2 节的夹具。
- [ ] 新建 `scripts/section-labels.allowlist.json`，初版 19 套。
- [ ] `package.json` 增加 `verify:sections`；加入 `test`；在 `build` 的 `astro build` 之后运行。
- [ ] 运行 `npm run test`，确认检查脚本测试通过。

## 2. 8 套合规设计迁移

按 brutal → cute-alism → frost → homepage99 → html-only → kern → material3 → terminal 顺序：

- [ ] `Page.astro` 导入 `sectionLabels`，取 `sections = sectionLabels[view.locale.code]`。
- [ ] 主分区加 `data-section`。
- [ ] h2 使用共享 `label`（terminal 使用 `enLabel` + `label`，en 下不重复）。
- [ ] `aria-labelledby` / `aria-label` 保持有效。
- [ ] `messages.ts` 删除仅用于标准标签的键；主题词键保留。
- [ ] 标签变短导致留白 / 换行时做最小 CSS 调整。
- [ ] 每套运行一次构建 + 页面目检。

## 3. 规则 / ADR / verification

- [ ] `docs/rules/design-contract.md` 重写「信息架构与主题文案」。
- [ ] `AGENTS.md` 新增第 9 条门禁并更新计数与路由。
- [ ] `docs/rules/operations.md` 加入 `verify:sections` 与 allowlist 说明。
- [ ] `docs/rules/accessibility-responsive.md` 补充分区可访问名称不得只含主题词。
- [ ] `docs/rules/data-and-i18n.md` 补充分区标准标签属于共享契约。
- [ ] `docs/adr/0023-standard-section-labels.md`。
- [ ] `.agents/skills/design-page-verify/SKILL.md` 加入标准标签检查项。
- [ ] `docs/verification/section-labels.md` 记录审计与 S1 证据。

## 4. 验证

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

浏览器抽查：

- [ ] brutal / cute-alism / frost / homepage99 / html-only / kern / material3：各 1 个 Locale，桌面 + 375px。
- [ ] terminal：桌面 + 375px，确认 `sr-only` h2 与可见 `# 标准词` 都存在，屏幕阅读器语义不重复。
- [ ] 减动态与无 JS 终态：至少抽 2 套。

## 审查门

- 词表 canonical / alias 逐项评审；alias 不得含主题词。
- 检查脚本在 allowlist 下通过；不得跳过整页或放宽词元规则。
- 8 套设计在 5 Locale 下无违规；`data-section` 全部存在。
- 文档与代码一致；ADR 记录真实取舍。

## 回滚

- 删除 `sections.ts` 导入、`data-section`、检查脚本与 build 接入。
- 恢复 8 套 `messages.ts` 的标签键与 h2 文案。
- 规则 / ADR / verification 可保留为计划记录，或随 S1 一并回滚。
