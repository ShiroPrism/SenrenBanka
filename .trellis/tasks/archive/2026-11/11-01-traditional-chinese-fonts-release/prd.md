# 繁中字体仓库发布

共享需求见父任务 `prd.md` / `design.md` / `implement.md`；本文件只写本子任务范围与验收。

## Goal

在独立仓库 `whitehair-failure/SenrenBanka-fonts` 发布 5 个 TC `core-cjk` 族各 v1.0.0 与 catalog v1.2.0，资产不可变、可复现、许可完整。

## Scope

- 每个族新增 license 文本、`catalog/families/<id>/1.0.0.json`、source archive 与 manifest。
- `role: core-cjk`、`scripts: ["cjk", "han-traditional"]`、Regular 单 face。
- 扩展字体仓库与主站共用的 `scripts` 枚举（`cjk | hangul | han-traditional`）与 schema 生成。
- 更新 `README.md`、`docs/ADDING-A-FONT.md`、`docs/LICENSING.md`、`docs/RELEASING.md`。
- 发布顺序：5 个 family releases → catalog v1.2.0；公开 Release 不可变。

## Out of scope

- 不改主站代码或 catalog 锁定。
- 不发布装饰族（除非调研结论明确追加且用户确认）。

## Acceptance Criteria

- [ ] 5 个族的 descriptor / manifest / license / source archive 完整，SHA256 与覆盖元数据齐全。
- [ ] `npm test`、`npm run catalog:validate`、`npm run schemas:generate`、`npm run release:verify` 通过；双构建字节一致。
- [ ] 族数与 scripts 断言更新（31 族 / 14 core-cjk / 5 TC）。
- [ ] 用户逐族确认许可证据、样张结论与资产清单后发布。
- [ ] catalog v1.2.0 发布成功，记录 catalog SHA 与每族 package/source SHA。

## Dependencies

依赖 `11-01-traditional-chinese-font-research` 的冻结族集与 GATE-1。
