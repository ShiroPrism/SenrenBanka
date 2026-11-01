# 韩语全设计覆盖 · 执行计划

> 父任务不直接实现。按子任务顺序推进；每个子任务独立规划、实现、检查、归档。

## 1. 顺序与依赖

```text
C1 字体调研与字体仓库发行
  └─ 产出 catalog v1.1.0 URL + SHA + 6 族资产/许可/哈希
       └─ C2 主站字体接入与排版覆盖门禁
            └─ 产出 26 套设计字体栈、门禁、5 套 ko 页面验证
                 └─ C3（待建）22 套韩语文案与页面
```

- C2 在 C1 发布 catalog v1.1.0 前只能做不依赖真实 catalog 的代码阅读/草案，不得伪造 lock 或手写 generated。
- C3 在 C2 完成并通过最终集成审查后创建。
- 父任务在所有子任务完成后执行最终集成审查并归档。

## 2. C1：字体调研与字体仓库发行

1. 固化调研矩阵到 `11-01-korean-fonts-release/research/korean-font-candidates.md`。
2. 按 `F:\SenrenBanka-fonts\docs\ADDING-A-FONT.md` 添加 6 个 descriptor、license、source。
3. schema 增加 `scripts`；更新 catalog builder/测试。
4. `npm ci` → `npm test` → `catalog:validate`。
5. 构建 `artifacts` 与 `artifacts-repro`，`release:verify --compare-dir` 逐字节一致。
6. `publish.mjs --dry-run` 审查；push 前把资产清单/SHA 交给用户确认。
7. 发布 6 个 family release，最后 catalog v1.1.0；验证资产 URL 与 SHA。
8. 产出 handoff：catalog URL、catalog SHA、6 族版本/大小/源哈希/许可证据。

验收以 C1 的 `prd.md` 为准。

## 3. C2：主站字体接入与排版覆盖门禁

1. 读取 C1 handoff，确认 catalog v1.1.0 URL/SHA。
2. `fonts.config.json` 加 6 族；`fonts:update --catalog-url ... --catalog-sha256 ...`；检查 lock/catalog/generated。
3. `fonts:prepare` 下载 6 个 source archive；`fonts:check` 离线复核。
4. 扩展 `scripts/fonts/subset.mjs`：`scripts` 路由、Hangul-only 语料、`unicode-range`、报告字段。
5. 扩展 `scripts/fonts/audit.mjs`：Hangul 区块、错误文案、覆盖检查。
6. 扩展 `scripts/fonts/typography.mjs`：26 families、CJK+Korean 核心变量、Korean 系统回退、全栈 ko 检查、测试。
7. 新增 `fonts:coverage`（或等价门禁）：`design.json.locales` + `fontProfile` + 字体栈 + `<Font>` 注册；`html-only` 豁免。
8. 更新 26 套 styled 设计的字体栈；5 套现有 ko 设计加 `<Font>`；其余 22 套只加 CSS 变量。
9. 构建链全跑：`npm test`、`npm run check`、`npm run build`、`fonts:subset`、`fonts:prune`、`verify:html-only`、`fonts:audit`。
10. 5 套 ko 页面执行 `design-page-verify`，记录截图与体积。
11. 写 ADR 0017，更新 rules/SPEC/verification/design-page-verify。
12. 提交前复核 dist、报告、生成文件与任务产物。

验收以 C2 的 `prd.md` 为准。

## 4. C3（待建）：22 套韩语文案与页面

- 先建任务，不在本轮实现。
- 每套设计：`design.json.locales` 加 `ko`、`messages.ts` 韩语块、`descriptions.ts` 韩语描述、按映射加 `<Font>`。
- 文案人工审校；不新增解释性句子。
- 跑 `fonts:coverage` 与 `design-page-verify`。

## 5. 最终集成审查（父任务）

- [ ] C1 catalog v1.1.0 与 C2 lock 的 URL/SHA 一致；26 族可 `fonts:prepare`/`fonts:check` 离线复核。
- [ ] 6 个韩语族均为 `core-cjk`、`scripts: ["hangul"]`、OFL-1.1、无 RFN；双构建一致。
- [ ] 5 套现有 ko 页面的韩文由声明字体渲染；editorial 不再命中 LXGW 谚文。
- [ ] 26 套 styled 设计均有映射；`fonts:coverage` 对 ko 设计失败即构建失败。
- [ ] `fonts:audit` 覆盖 Hangul；0 悬空、0 孤儿、0 部署缺字。
- [ ] 四语 dist ≤ 10 MiB；体积报告入 `docs/verification/`。
- [ ] `design-page-verify` 5 套通过；截图归档。
- [ ] ADR 0017、rules、SPEC、verification、design-page-verify 同步。
- [ ] C3 可在不改字体仓库/管线的情况下添加 22 套 ko。

## 6. 验证命令（C2 完成时）

```bash
npm ci
npm test
npm run fonts:check
npm run check
npm run build
npm run verify:html-only
npm run fonts:audit
du -sb dist
```

`npm run build` 已包含 `fonts:check` → check → astro build → `fonts:subset` → `fonts:prune` → `verify:html-only` → `fonts:audit`。单独重跑子步骤时按 `docs/rules/operations.md`。

## 7. 回滚点

- C1：catalog v1.1.0 未发布前可丢弃 Draft；已发布后不回写，提升 family 版本再发新 catalog。
- C2：`fonts.lock.json` 回退 v1.0.0；移除 6 族配置与字体栈；删除 `.cache/fonts/1.1.0`、`.cache/font-sources/1.1.0` 后重新 prepare。
- 不得通过提高 10 MiB 门禁、删除审计或关闭 typography 检查来让构建通过。

## 8. 提交边界

- C1 只提交字体仓库：descriptors、schemas、licenses、docs、tests；不提交生成的 `artifacts/`、`artifacts-repro/`、`.cache/`。
- C2 只提交主站：fonts config/lock/generated、scripts、design CSS/Page、docs/ADR/verification、任务产物。
- 不把字体仓库源码或大文件搬进主站；不跨仓合并。
