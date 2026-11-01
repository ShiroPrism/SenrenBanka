# 执行计划：字体子集按引用页限定语料

## 0. 基线快照（开始前）

- 记录 `dist` 总字节：当前 8,855,728 B；`fonts` 3,686,028 B；14 个 core 子集 2,774,444 B。
- 备份基线报告：`cp .cache/fonts/subset-report.json .cache/fonts/subset-report.baseline.json`。
- 记录非跳转基础设施页的 HTML 哈希（根 `index.html`、5 个语言入口、5 个切换页、`404.html`），供改后逐字节比对。
- 确认工作区干净；本任务只允许改动 `scripts/fonts/**`、文档与生成物。

## 1. 改造 `scripts/fonts/subset.mjs`

- [ ] 新增 `buildSharedCorpus(distRoot)`：非 HTML 文本资产 → 去 `@font-face` → 解码实体/转义 → 码位集合，返回 `{text, codePoints, textFiles, textBytes, sha256}`。
- [ ] 新增 `planPageCores(...)`：一次读盘完成 `extractInlineStyles` / `pageCss` / `cssVariableFamilies` / 内联 `@font-face` 过滤，返回页面上下文与 `coreRuleIds`。
- [ ] 新增 `buildFamilyCorpus(core, contexts, shared)`：共享语料 ∪ 引用页原始 HTML；Hangul 族复用 `filterCorpusText`。
- [ ] 重排 `subsetCoreFonts`：先规划页面，再算共享/按族语料，只为被引用的 core 生成子集；未被引用的 core 记日志跳过。
- [ ] 保留全部既有守卫与早退分支（无 core、无页面引用、已 prune、source 缺失/篡改、多 face、`--dry-run`）。
- [ ] 重写阶段复用页面上下文，避免二次读盘；保持可见文本前后一致检查。
- [ ] 报告升级到 schema v2：`corpusScope`、`sharedCorpus`、每族 `corpusPages` / `corpusCodePoints` / `corpusSha256` / `corpus`；顶层 corpus 字段取实际使用族语料的并集。

## 2. 更新测试 `scripts/fonts/subset.test.mjs`

- [ ] 更新报告断言：schema v2、`corpusScope === 'per-family'`、`sharedCorpus` 字段、每族 corpus 字段。
- [ ] 新增隔离测试：两个页面分别引用 core A / core B，断言各自子集包含本页字符、不包含对方页面独有字符，且 `corpusPages === 1`。
- [ ] 新增未引用 core 测试：catalog 有 core 但无页面引用时不产子集文件、不报错。
- [ ] 保留并跑通：语料解码测试、幂等测试、real CJK source 测试、dry-run、source cache 失败、多 face、已 prune 拒绝。
- [ ] 断言未引用页面 HTML 不变、可见文本不变。

## 3. 本地验证

- [ ] `npm run test:fonts` 全绿。
- [ ] `npm test` 全绿。
- [ ] `npm run build` 全绿；记录：
  - 14 个 core 子集合计（目标 ≤ 1,500,000 B）。
  - `dist` 总量（目标 ≤ 7,800,000 B）。
  - `fonts:audit`：0 部署缺口、0 孤儿、0 悬空规则；175 页。
  - `fonts:coverage` / `fonts:typography` 随 `check` 通过。
- [ ] 二次 `npm run fonts:subset` 验证幂等（同哈希、页面无变化）。
- [ ] 非跳转基础设施页 HTML 哈希与基线一致（本任务不应改变它们）。

## 4. 浏览器与视觉验证

- [ ] `npm run preview` 后按 `.agents/skills/design-page-verify/SKILL.md` 执行。
- [ ] 覆盖 5 种语言代表页：`archive`、`terminal`、`oxide`、`little-forest`、`html-only`，以及 `/zh-tw/designs/` 切换页。
- [ ] 断言：字体请求集合与实际命中字体与基线一致；TC 页仍加载 TC 族、非 TC 页不加载 TC 族；无缺字回退或排版变化；桌面 1440 + 375px 无横向溢出；0 console 错误。
- [ ] 保存前后截图到 `docs/verification/assets/`。

## 5. 文档更新

- [ ] `docs/rules/operations.md:30`：把“全站语料”改为“按族引用页语料 + 共享资产”，说明共享资源全量纳入。
- [ ] `docs/rules/operations.md:33`：TC 族不再使用全站语料，改为按引用页。
- [ ] `docs/rules/operations.md:39`：报告字段补充 per-family corpus 元数据。
- [ ] `SPEC.md`：更新 §5.5 字体说明、`scripts/fonts/subset.mjs` 描述与第 10 节验收中“8.44 MiB”实测值。
- [ ] 新增 `docs/adr/0019-per-family-font-corpus.md`：背景、决策、取舍、验证方式。
- [ ] 新增 `docs/verification/font-corpus-scope.md`，并在 `docs/verification/shared.md` 顶部追加一条摘要。
- [ ] `npm run check:docs` 通过。

## 6. 风险文件与回滚点

| 风险文件 | 说明 |
|---|---|
| `scripts/fonts/subset.mjs` | 流程重排，核心风险 |
| `scripts/fonts/subset.test.mjs` | 报告契约与新增断言 |
| `docs/rules/operations.md` / `SPEC.md` | 与实现必须同步 |
| `.cache/fonts/subset-report.json` | 生成物，不入库 |

- 回滚点 1：改完 `subset.mjs` 后先跑 `npm run test:fonts`，失败则只回滚脚本与测试。
- 回滚点 2：`npm run build` 后若体积或审计不达标，回滚脚本与文档，重新 build 恢复全局语料子集。
- 不允许通过修改设计页、设计 CSS、字体 catalog 或审计阈值来“通过”验收。
