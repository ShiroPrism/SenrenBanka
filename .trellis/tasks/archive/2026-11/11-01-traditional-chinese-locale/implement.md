# 繁体中文全设计覆盖 · 执行计划

## 0. 开工前检查

- [ ] 确认当前分支与未推送提交：`git status`、`git log --oneline -5`；韩语收尾可能有本地未推送提交，先与用户确认处理方式。
- [ ] 记录基线：`dist` 字节数、HTML 数、`npm run fonts:check`、`npm test` 全绿。
- [ ] 确认 catalog 锁定在 v1.1.0（26 族）且 `.cache/fonts` 完整。
- [ ] 读规则：`docs/rules/data-and-i18n.md`、`operations.md`、`visual-language.md`、`design-contract.md`。

## 1. 字体调研（子任务 1）

- [ ] 在字体仓库实测 5 个候选族的源文件：Noto Sans TC、Noto Serif TC、LXGW WenKai TC、Ark Pixel TC、Noto Sans Mono CJK TC。
- [ ] 核实许可：LXGW TC 的 RFN `permission-granted` 是否覆盖 TC；Noto 只用静态 regional OTF；Ark Pixel 12px zh_tr 的产物名。
- [ ] 用真实 TC 语料（可先用简中语料 + OpenCC `s2twt` 生成的临时文本）测每族 subset 字节数，给出 4 族 / 5 族 / 加装饰族的体积区间。
- [ ] 产出逐设计映射表：18 套 CJK 核心设计（按 LXGW/Zhuque/Ark 角色）+ 8 套系统 CJK 设计（Sans/Mono）+ `html-only` 豁免。
- [ ] 冻结族集、族 id、上游版本、许可证据、样张结论，写入该子任务 `research/`。
- [ ] 验证：`npm test`（字体仓库）；样张人工目检；体积估算与 8.5 MiB 软目标对照。

**GATE-1**：用户确认冻结族集与许可证据后，才进入发布。

## 2. 字体仓库发布（子任务 2）

- [ ] 为每个 TC 族新增 license 文本与 `catalog/families/<id>/1.0.0.json`；`role: core-cjk`、`scripts: ["cjk","han-traditional"]`。
- [ ] 扩展 `scripts/lib/schema.mjs` 与 `schemas/*.json` 的 `scripts` 枚举；更新 `tests/descriptors.test.mjs`（族数 26 → 31、core 9 → 14、TC 5）。
- [ ] 更新 `README.md`、`docs/ADDING-A-FONT.md`（Script Routing / TC 说明）、`docs/LICENSING.md`、`docs/RELEASING.md`。
- [ ] `npm run schemas:generate` → `npm test` → `npm run catalog:validate` → 双构建复现。
- [ ] 生成资产清单：每族 package/source 的 SHA256、大小、许可证据；**push 前用户逐族确认**。
- [ ] 发布 `font-<id>-v1.0.0`（5 个）→ `catalog-v1.2.0`；确认公开 Release 资产完整。
- [ ] 验证：`npm run release:verify`；catalog v1.2.0 的 SHA 记录到子任务。

**GATE-2**：catalog v1.2.0 发布成功、SHA 固定后，才允许主站更新 lock。

## 3. 主站字体集成（子任务 3）

- [ ] `npm run fonts:update -- --catalog-url <catalog-v1.2.0 URL> --catalog-sha256 <sha>`；确认 `fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts` 更新且 31 族。
- [ ] `fonts.config.json` 加 5 族（`fallbacks: []` 由生成器保证）。
- [ ] `src/content.config.ts`、`src/lib/site.ts`、`scripts/fonts/coverage.mjs` 加 `fontProfile: traditional-chinese`。
- [ ] `scripts/fonts/lib/schema.mjs` 的 `scripts` 枚举加 `han-traditional`；`fonts.catalog.json` 随 update 更新。
- [ ] `scripts/fonts/subset.mjs`：确认 TC 族走全语料子集（`isHangulOnly` 为 false），无代码改动或只加注释级说明。
- [ ] `scripts/fonts/typography.mjs`：加 5 个 `CORE_FONT_VARIABLES`、TC 系统字体名；生成族数断言 26 → 31。
- [ ] `scripts/fonts/coverage.mjs`：加 `traditional-chinese → han-traditional`；实现 5.1 的 TC 专用校验。
- [ ] 18 套 CJK 核心设计：加 `html:lang(zh-TW)` 变量重映射块；每个被用到的 CJK/伴生变量都覆盖。
- [ ] 8 套系统 CJK 设计：加 `html:lang(zh-TW)` 作用域字体栈插入（Noto Sans TC / Noto Sans Mono TC），并移除未定义的韩文伴生变量引用。
- [ ] 首批 6 套的 `Page.astro`：条件注册 TC `<Font>`，条件跳过简体核心与韩文伴生。
- [ ] `src/designs/archive/style.css` 的 `:lang()` 列表补 `zh-TW`。
- [ ] 验证：`npm run check`、`npm run fonts:coverage`、`npm run fonts:typography`、`npm test`、`npm run build`。
- [ ] 记录首批 `dist`、HTML 数、WOFF2 数、每族 subset 字节数；与 8.5 MiB 软目标对照。
- [ ] 若超软目标：先砍装饰族/替代，再评估缩小族集；不抬门禁。

**GATE-3**：集成后 `fonts:coverage` / `typography` / `audit` 全绿，首批 TC 页面实测无简体字形回退。

## 4. 内容与页面铺开（子任务 4）

### 4.1 公共内容（一次）

- [ ] `src/data/site.config.yaml`：加 `zh-TW` locale（title / description / `fontProfile: traditional-chinese`），排在 `zh-CN` 后。
- [ ] `src/data/profiles/zh-tw.yaml`：从 `zh-cn.yaml` 经 OpenCC `s2twp` 初转 + 人工改写；字段完整、不虚构事实；`野獸先輩` 等专名本地化，罗马字保留。
- [ ] `src/i18n/messages.ts`：加繁中共享文案（菜单、Toast、切换页、入口、404、语言名）。
- [ ] `src/designs/descriptions.ts`：加 27 条繁中描述。
- [ ] `npm run check` 通过。

### 4.2 批次

- [ ] 批次 1（6 套）：`editorial`、`archive`、`pager`、`fast`、`terminal`、`html-only`。
  - 每套：`design.json.locales` += `zh-TW`、`messages.ts` 繁中块、`Page.astro` 字体接线（若集成阶段未完成）。
  - 字体角色覆盖：LXGW TC / Noto Serif TC / Ark Pixel TC / Noto Sans TC / Noto Sans Mono TC 全部验证。
- [ ] 批次 2（7 套）、批次 3（7 套）、批次 4（7 套）：按剩余设计推进；每批完成后 `npm run build` + 设计级验证。
- [ ] 每批设计级验证：字体加载、TC 字形（骨/直/說/體 等抽样）、排版溢出、缺字报告。
- [ ] 用户终审每批文案；未审校不得发布。
- [ ] 发布记录：每批 `dist` 字节数、TC 页面数。

**GATE-4**：27 套 `design.json.locales` 均含 `zh-TW`，27 个 `/zh-tw/<design>/` 页面构建成功，用户终审通过。

## 5. 文档与验证（子任务 5）

- [ ] 新 ADR 0018：TC 排版覆盖、页面级字体路由、`han-traditional` 元数据、体积取舍。
- [ ] 更新 `SPEC.md`（语言清单、覆盖维度、字体覆盖契约、体积）、`README.md`、`docs/rules/data-and-i18n.md`、`operations.md`、`visual-language.md`、`CONTEXT.md`（顺带修正“三种语言”陈述）。
- [ ] 更新 `docs/verification/`：TC 各设计验证记录、跨页矩阵、最终体积证据。
- [ ] 更新 `change-log/`。
- [ ] 跑 TC 跨页矩阵：菜单、语言切换、无 JS、对比度、减动态、375px 触控；补韩语遗留矩阵缺口。
- [ ] 最终验收命令：`npm run check`、`npm test`、`npm run build`、`npm run fonts:audit`、`npm run verify:html-only`。
- [ ] 记录最终 `dist`（≤10 MiB，目标 ≤8.5 MiB）、HTML 数、WOFF2 数。

**GATE-5**：全部验收命令通过，文档与验证归档完成，父任务最终集成审查通过。

## 6. 跨子任务门禁

- 子任务 2 不得在 GATE-1 之前 push 任何 Release。
- 子任务 3 不得在 GATE-2 之前改 catalog 锁定。
- 子任务 4 的批次 1 不得在 GATE-3 之前发布。
- 每个子任务完成后由检查代理复核；结论由主代理复核后再归档。

## 7. 回滚点

- 调研阶段：只改 `research/`，无生产影响。
- 发布阶段：Release 不可变；发现错误只能发新版本，不回改。
- 集成阶段：回退 `fonts.config.json` / `fonts.lock.json` / `generated.ts` 到 v1.1.0，移除 TC CSS 块与条件注册。
- 内容阶段：按批次移除对应设计的 `zh-TW` 覆盖与该设计文案。
- 文档阶段：文档回退不影响构建，但必须与代码状态一致。
