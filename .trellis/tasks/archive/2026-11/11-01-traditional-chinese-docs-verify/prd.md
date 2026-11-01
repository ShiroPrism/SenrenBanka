# 繁中文档与验证

共享需求见父任务 `prd.md` / `design.md` / `implement.md`；本文件只写本子任务范围与验收。

## Goal

完成繁中支持的 ADR、规格与规则文档、验证记录，并补掉韩语遗留的跨页矩阵缺口。

## Scope

- 新 ADR 0018：TC 排版覆盖、页面级字体路由、`han-traditional` 元数据、体积取舍。
- 更新 `SPEC.md`：语言清单、覆盖维度、字体覆盖契约、体积与路由事实。
- 更新 `README.md`、`docs/rules/data-and-i18n.md`、`docs/rules/operations.md`、`docs/rules/visual-language.md`。
- 更新 `CONTEXT.md`：Locale / 排版档位 / 覆盖维度术语；顺带修正“三种语言”的陈旧陈述。
- 更新 `docs/verification/`：TC 各设计验证记录、跨页矩阵、最终体积证据。
- 更新 `change-log/`。
- 跑 TC 跨页矩阵：菜单、语言切换、无 JS、对比度、减动态、375px 触控；补韩语遗留矩阵缺口。
- 字体仓库 README / ADDING-A-FONT / RELEASING / LICENSING 的 TC 说明（与字体发布任务协同，避免重复）。

## Out of scope

- 不改字体资产与 catalog。
- 不重跑与 TC 无关的全部设计视觉回归；矩阵覆盖共享机制与 TC 页面即可。

## Acceptance Criteria

- [ ] ADR 0018 完成并链接到相关规则与验证。
- [ ] 文档与代码状态一致；`npm run check:docs` 通过。
- [ ] TC 跨页矩阵记录归档；韩语遗留矩阵缺口已补。
- [ ] 最终 `dist`（≤10 MiB，目标 ≤8.5 MiB）、HTML 数、WOFF2 数、字体覆盖证据记录完整。
- [ ] `npm run check`、`npm test`、`npm run build`、`npm run fonts:audit`、`npm run verify:html-only` 全部通过。

## Dependencies

依赖 `11-01-traditional-chinese-font-integration` 后可开始文档框架；矩阵与最终体积验收依赖 `11-01-traditional-chinese-content-rollout` 全部批次完成。
