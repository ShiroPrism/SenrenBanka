# 多语言扩展文档与全量验证

> 父任务：`11-01-locale-expansion`。本子任务在 C1–C4 完成后收口文档、体积报告与全量回归。

## Goal

把新的 locale 机制、覆盖声明、单语言 fork、字体档案与体积预算写成可执行文档；完成全量构建/验证/体积报告；确保没有残留的三语硬编码假设。

## Requirements

- R1 更新 `README.md`：任意 locale 添加步骤（site.config → profile → 设计覆盖 → 文案）、单语言 fork 步骤、覆盖缺口与 404、体积预算。
- R2 更新 `docs/rules/data-and-i18n.md`：`design.json.locales` 契约、未配置 code 忽略规则、语言切换目标规则、失败级别。
- R3 更新 `docs/rules/action-menu.md`：菜单 CSS 外置后的链接/隔离表述、单语言隐藏契约。
- R4 更新 `docs/rules/operations.md` 与相关 ADR：菜单 CSS 外置 ADR、韩语/Noto KR 字体 ADR（如需要）、构建与体积门禁。
- R5 更新 `docs/verification/`：shared 体积/页面/字体基线、菜单验证、韩语页面验证；若新增 ADR 编号冲突则顺延。
- R6 全局搜索并清理残留的 `zh-CN` / `ja` / `en` 三语硬编码假设（除正当的 locale 数据/文档示例）。
- R7 全量回归：`npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`npm run fonts:audit`、每个设计页 `design-page-verify`。
- R8 输出体积报告：3 语、4 语（韩语窄覆盖）的 dist 字节、字体字节、页面数；确认 10 MiB 门禁。
- R9 更新 `.trellis/spec/` 中与 locale/字体/菜单相关的事实（如有）。

## Acceptance Criteria

- [ ] README 与规则文档可按步骤复现「加一种语言」和「只留一种语言」。
- [ ] 所有 ADR/验证记录编号正确、交叉引用有效。
- [ ] 全局无未解释的三语硬编码；构建期校验覆盖所有声明语言。
- [ ] 全量命令通过；体积报告落盘。
- [ ] AGENTS.md 八条硬门禁复核通过。

## Out of Scope

- 新功能/新语言。
- 修改已冻结的历史 ADR 正文（只追加新 ADR/更正说明）。

## Notes

- 依赖 C1–C4 完成。
- 复杂任务：实现前补 `implement.md`（文档清单、搜索清单、回归命令、体积报告模板）。
- 文档语言保持项目现有中文正文与代码英文注释的约定。

## 完成记录（2026-10-31）

- 已更新：`README.md`（四语言 / profile / URL / 单语言 fork）、`SPEC.md`（`fontProfile`、覆盖契约、路由/切换页/切换目标）、`docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md`、`docs/README.md`、ADR 0015 / 0016、`docs/verification/{shared,action-menu,editorial,frost,fast,govuk,html-only,...}.md`。
- 跨页矩阵：90 个 URL（zh/ja/en 各 28 + ko 6）× 1280×800 与 375×812 触控逐页实测，0 console / 0 4xx / 0 横向溢出 / 0 断言失败；`impeccable detect` editorial `[]`、frost 2 条已记录 `bounce-easing` 例外。
- 未逐页重跑像素 / 对比度 / reduced-motion 视觉矩阵；韩语文案待人工审校；Noto KR 按 ADR 0016 延后。
- `npm run check:docs`、`npm test` 67/67、`npm run build`、`verify:html-only`（4 页）、`fonts:audit` 全部通过；最终 `dist` 5,147,850 B / 124 页 / 34 字体文件。
