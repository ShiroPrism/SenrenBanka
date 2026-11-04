# Design — Retire govuk and fast

## Current facts

- 当前设计：30 套（29 `styled` + 1 `html-only`）。
- 当前构建：193 页；`dist` 8,340,020 B（7.95 MiB）。
- 每套设计注入 5 个 locale 页面 + 1 个无前缀旧路径入口（`/<id>/` LegacyRedirect），共 6 个产物页。
- 删除 2 套后预期：28 套（27 `styled` + 1 `html-only`），193 − 12 = **181 页**；以实际构建为准。
- `design.default` 是 `editorial`；`design.exclude` 为空；删除不影响默认设计。
- `fast` / `govuk` 都注册 `Gothic A1`（非 zh-TW）与 `Noto Sans TC`（zh-TW）；这两族也被其它设计使用，删除不触发字体家族移除。
- `scripts/fonts/typography.mjs` 硬编码 `styledCount === 29`；测试也硬编码 29/29。

## Removal mechanics

### Routes

`astro.config.mjs` 的 `designRoutes` 读取 `src/designs/*/Page.astro` 并注入：

- `/{locale}/{id}`（每种 locale）
- `/{id}` → `src/infra/LegacyRedirect.astro`（无前缀兼容入口）

删除目录后，这两套设计的所有路由自动消失；无需修改 `astro.config.mjs`。旧 URL 返回 404，不新增重定向。

### Registry / switcher

- `src/designs/registry.ts` 用 `import.meta.glob('./*/design.json')` 自动发现；删除目录即注销。
- `src/infra/SwitcherPage.astro` glob `Preview.astro`；删除目录后不再生成预览卡。
- `src/designs/descriptions.ts` 是唯一手工维护的切换页描述索引；必须删除两个键，否则留下孤立文案。

### Fonts

- 两套设计没有独占字体族；`fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts` 不改。
- `scripts/fonts/typography.mjs` 的 expected 29 → 27；`typography.test.mjs` 的 `styledCount` / `coreDesignCount` 29 → 27。
- `generatedFamilies` 仍应为 31；若变化，先停下来核对是否有字体族只被这两套使用。
- `fonts:coverage` / `fonts:audit` 动态读取设计目录，预计自动适配；以实际输出为准。

## File action matrix

### Delete

| Path | Reason |
|---|---|
| `src/designs/govuk/` | 设计实现、规范、文案、预览、许可全文 |
| `src/designs/fast/` | 设计实现、规范、文案、预览、许可全文 |
| `docs/verification/govuk.md` | 当前验证状态随设计退役 |
| `docs/verification/fast.md` | 当前验证状态随设计退役 |
| `docs/designs/govuk/` | 适配记录随设计退役 |
| `docs/designs/fast/` | 适配记录随设计退役 |

### Update — code / tests

| Path | Change |
|---|---|
| `src/designs/descriptions.ts` | 删除 `fast` / `govuk` 键 |
| `scripts/fonts/typography.mjs` | `expected 29 styled` → 27 |
| `scripts/fonts/typography.test.mjs` | `styledCount` / `coreDesignCount` 29 → 27；`generatedFamilies` 保持 31 |

### Update — current-state docs

| Path | Change |
|---|---|
| `README.md` | 30/29 → 28/27；来源与许可移除 FAST；可用 Material 3 作为来源示例 |
| `docs/README.md` | “当前 27 套预览” → 28 |
| `docs/rules/operations.md` | “26 套 styled CSS” → 27 |
| `SPEC.md` | §4.2/§4.3 状态、§4.4.1 矩阵与计数、§6 目录树、历史对照注记；batch 1–4 历史保留，追加 batch 5 退役记录 |
| `docs/verification/shared.md` | 当前计数、通知声明数量、检测器例外与汇总；带日期历史条目保持原样 |
| `docs/verification/action-menu.md` | 当前 govuk 测试页替换为 `lexicon`；30 → 28；移除/标注 govuk 截图引用 |
| `docs/verification/material3.md` | 2026-10-12 对照表加“govuk/fast 已退役（2026-11-04）”历史标注 |
| `docs/verification/traditional-chinese.md` | `/zh-tw/fast/` 测试页替换为 `/zh-tw/frost/`，更新预期字体/woff2 |

### Keep — history

| Path | Reason |
|---|---|
| `change-log/*`（历史） | 版本历史；只新增 `0.21.0.md` |
| `docs/adr/*` | 长期决策记录；允许继续提到已退役设计 |
| `.trellis/tasks/archive/**` | 归档任务 |
| `docs/verification/assets/**` | 带日期的审计 JSON / 截图快照 |
| `SPEC.md` batch 1–4 记录 | 历史批次事实；不重写 |

## Current-state audit allowlist

`rg -n "govuk|fast"` 的允许命中仅限：

- `change-log/**`
- `docs/adr/**`
- `.trellis/tasks/archive/**`
- `docs/verification/assets/**`
- `SPEC.md` 中带“历史/已退役/batch 1–4”的注记
- `docs/verification/shared.md` 中以 `>` 开头的带日期历史条目

其余命中一律视为未清理的当前态引用。

## Version / change-log

- `npm version 0.21.0 --no-git-tag-version` 更新 `package.json` 与 `package-lock.json`。
- 新增 `change-log/0.21.0.md`：退役范围、30→28、193→181 页、dist 结果、旧 URL 404、历史保留策略、验证结论。
- 不新增 ADR：这是产品策展决策，不是跨主题架构决策；`change-log/0.21.0.md` 足以记录。

## Verification design

1. **Static**：`npm run check`（含 `fonts:typography` / `fonts:coverage` / `astro check`）。
2. **Unit**：`npm test`；确认 typography 测试期望 27，其余测试数不变。
3. **Build**：`npm run build`；记录页数、`dist` 字节、字体规则数、HTML-only 页数。
4. **Detector**：对剩余设计运行 `impeccable detect`；当前例外应为 `frost` 2 条与 `oxide` 1 条；无新增。
5. **Browser**：`npm run preview` 后检查：
   - `/{locale}/designs/` 列出 28 套；
   - 抽查 `editorial` / `ink` / `zine` / `aero` / `lexicon` 200；
   - `/govuk/`、`/fast/`、`/{locale}/govuk/`、`/{locale}/fast/` 404；
   - 随机池/语言菜单不出现两套已退役设计；
   - 375×812 无横向溢出，console 0。
6. **Reference audit**：`rg` + 人工 allowlist；`git diff --check`。
7. **Documentation**：更新 `docs/verification/shared.md` 当前态；不追加历史快照。

## Rollback

- 删除前记录当前 `git status`；仓库应在任务开始时干净。
- 若删除后发现漏项：`git restore` 恢复被删的 tracked 文件，修正计划后重做；不要用 `git reset --hard`。
- 版本回滚：`package.json` / `package-lock.json` 改回 0.20.0，删除 `change-log/0.21.0.md`。
- 不涉及数据迁移、部署配置或用户资料。

## Open decisions (defaults recorded in PRD)

- 旧 URL 采用 404，不做重定向。
- 历史 ADR / change-log / archive / 日期化验证资产不改写。
- 版本采用 0.21.0。
