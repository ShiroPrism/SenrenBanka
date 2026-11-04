# Retire govuk and fast designs

## Goal

把 `govuk` 与 `fast` 从**当前产品**中退役：删除两套设计实现、当前态注册/描述/文案、当前验证与适配文档，并把所有当前态计数、矩阵与测试期望更新为 **28 套设计（27 套 `styled` + 1 套 `html-only`）**。

历史 `change-log/`、`docs/adr/`、`.trellis/tasks/archive/` 与带日期的验证快照保留，不回写。

## Decision

2026-11-04，项目所有者确认末位淘汰 `govuk` + `fast`。这是**策展决策**，不是质量修复：两套设计的技术验证均通过；淘汰理由是视觉特异性、家族冗余与维护成本。

- `govuk`：`official-docs-derived` 汇编；视觉语言有意通用，作者性最低；与 `fast` / `kern` / `html-only` / `transit` 的功能型信息角色重叠；带有 OGL/MIT、`SOURCE-LICENSE.txt`、`ADAPTATION.md` 与 Arial 检测器例外，维护路径最重。
- `fast`：`official-vendor` 快照；通用企业 UI，与 `material3` / `kern` / `frost` 的企业 UI 语言重叠；视觉记忆点弱。

## Requirements

### R1 — Remove implementations

- 删除 `src/designs/govuk/` 与 `src/designs/fast/` 整个目录（含 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`、`tokens.css`、`Preview.astro`、`SOURCE-LICENSE.txt` 等）。
- 不保留部署级 `design.exclude` 占位；不是隐藏，是从当前产品移除。
- `src/designs/registry.ts` 与 `astro.config.mjs` 依赖目录自动发现，预期无需改代码；构建后必须验证 28 套注册结果。

### R2 — Remove current-state references

- `src/designs/descriptions.ts`：删除 `fast` 与 `govuk` 两个键。
- 删除 `docs/verification/govuk.md`、`docs/verification/fast.md`。
- 删除 `docs/designs/govuk/ADAPTATION.md`、`docs/designs/fast/ADAPTATION.md`（空目录一并移除）。
- `README.md`：设计计数从 30/29 改为 28/27；来源与许可列表中移除 FAST 条目（可用 Material 3 等现有来源替换示例，避免留下已删除设计的入口）。
- `docs/README.md`：预览链路的“当前 27 套预览”改为 28。
- `docs/rules/operations.md`：`fonts:typography` 的“26 套 styled CSS”改为 27。
- `SPEC.md`：
  - §4.2 的 `fast` 行标记为已退役；并把“对齐 fast / oxide 惯例”改为仍有效的示例（如 `oxide` / `material3`）。
  - §4.3 的 `govuk` 行标记为已退役；保留历史批次记录。
  - §4.4.1 锚点表移除 `fast` 行；矩阵标题日期更新为 2026-11-04。
  - 当前示例中的 `govuk` 改为仍存在的设计（如 `material3` / `html-only`）。
  - “A 强差异化”中的 `govuk` 标记已退役；C 组对比加“历史对照（fast/govuk 已退役）”说明。
  - 当前总数改为 28（27 styled + 1 html-only）；追加“批次 5（2026-11-04）：退役 govuk + fast”。
  - §6 目录树中的 `fast/` 示例替换为仍存在的设计（如 `material3/`）。
- `docs/verification/shared.md`：更新当前态计数（30→28；193 页→实际页数；通知声明“其余 13 套”→“其余 11 套”）、移除 `govuk` 检测器例外、更新当前检测器汇总；**带日期的历史条目保持原样**。
- `docs/verification/action-menu.md`：把当前 `govuk` 测试页替换为仍存在的设计（建议 `lexicon`），更新 30→28；删除或标注仅属于 govuk 的当前截图引用。
- `docs/verification/material3.md`：2026-10-12 的横向对照表保留，但为 `govuk` / `fast` 行加“已退役（2026-11-04）”历史标注。
- `docs/verification/traditional-chinese.md`：`/zh-tw/fast/` 当前测试页替换为仍存在的非默认设计（建议 `/zh-tw/frost/`），并更新预期字体/woff2 结果。
- `scripts/fonts/typography.mjs`：expected styled 计数 29→27。
- `scripts/fonts/typography.test.mjs`：`styledCount` / `coreDesignCount` 29→27；`generatedFamilies` 仍为 31（两套设计没有独占字体族）。
- 不修改 `fonts.config.json`、`fonts.lock.json`、`src/fonts/generated.ts`：`Gothic A1` / `Noto Sans TC` 仍被其它设计使用；构建后由字体管线复核。

### R3 — Preserve history

以下内容**不得**改写或删除：

- `change-log/` 历史版本文件；
- `docs/adr/` 所有 ADR（它们是长期决策记录，允许继续提到已退役设计）；
- `.trellis/tasks/archive/` 归档任务；
- `docs/verification/assets/` 下带日期的审计 JSON / 截图（历史快照）；
- `SPEC.md` 中的历史批次记录（batch 1–4）与历史对照说明。

新增 `change-log/0.21.0.md` 作为本次退役的当前结论；历史文件不回写。

### R4 — Version

- `package.json` / `package-lock.json` 版本从 `0.20.0` 升到 `0.21.0`。
- 新增 `change-log/0.21.0.md`，概括退役范围、计数变化、验证结论与“旧 URL 404”的行为。

### R5 — Routing behavior

- 不新增重定向层。退役后 `/govuk/`、`/fast/`、`/{locale}/govuk/`、`/{locale}/fast/` 返回 404。
- 理由：项目是静态多平台部署，没有按“退役设计”生成重定向的既有机制；为两个实验主题新增 10 条重定向会扩大范围。旧链接的丢失作为已知取舍记录在 PRD / change-log。
- 默认设计仍是 `editorial`；`site.config.yaml` 的 `design.default` 与 `design.exclude` 不变。

### R6 — Verification

- `npm run build` 通过；当前设计数 28（27 styled + 1 html-only）；预期 181 页（当前 193 − 2×6：每套 5 个 locale 页 + 1 个旧路径入口），以实际构建为准。
- `npm test`、`npm run check`、`npm run fonts:typography`、`npm run fonts:coverage`、`npm run fonts:audit`、`npm run verify:html-only` 全绿。
- `impeccable detect` 扫描剩余设计：不得新增发现；已记录例外只保留 `frost` 的 `bounce-easing` 与 `oxide` 的 `codex-grid-background`，`govuk` 的 Arial 例外随设计删除。
- 浏览器 smoke（preview）：`/{locale}/designs/` 只列 28 套；抽查 5 套现有设计 200；旧 govuk/fast 路由 404；切换页/随机池/语言菜单不出现两套已退役设计；375px 无横向溢出。
- `dist` 总量 ≤ 10 MiB；记录新页数、HTML/CSS/字体/总字节，并与 8,340,020 B 基线对比。
- 全仓库当前态引用审计：`govuk` / `fast` 只允许出现在历史白名单（`change-log/`、`docs/adr/`、`.trellis/tasks/archive/`、带日期的验证资产、SPEC 历史批次注记）；当前代码、当前验证、README、当前矩阵不得残留。

## Acceptance Criteria

- [ ] `src/designs` 下恰好 28 个设计目录：27 个 `styled` + `html-only`；无 `govuk` / `fast`。
- [ ] 构建通过，页面数为 181（以实际为准）；`/designs/` 切换页显示 28 张预览，无两套已退役设计。
- [ ] 旧 govuk/fast 路由（含 5 个 locale 前缀与无前缀入口）返回 404；无新增重定向。
- [ ] `src/designs/descriptions.ts` 无 `govuk` / `fast`；注册表校验无缺失文案。
- [ ] 当前态 `README.md`、`SPEC.md`、`docs/README.md`、`docs/rules/operations.md`、`docs/verification/{shared,action-menu,material3,traditional-chinese}.md` 计数与引用已更新。
- [ ] `scripts/fonts/typography.mjs` 与测试期望为 27；`fonts:typography` / `fonts:coverage` / `fonts:audit` 通过，字体家族数不意外变化。
- [ ] `impeccable detect` 无新增发现；`govuk` 例外已从当前验证中移除。
- [ ] `dist` ≤ 10 MiB，记录实际字节与页面数。
- [ ] `package.json` / `package-lock.json` 为 `0.21.0`，`change-log/0.21.0.md` 已新增。
- [ ] `change-log/` 历史文件、`docs/adr/`、`.trellis/tasks/archive/`、`docs/verification/assets/` 未被改写。
- [ ] `npm run check`、`npm test`、`npm run build` 全部通过；`git diff --check` 无空白错误。

## Non-goals

- 不重新设计剩余 28 套；不新增主题。
- 不删除字体家族或改字体选型。
- 不新增旧 URL 重定向；不做 301 迁移。
- 不修改 `design.default` / `design.exclude`。
- 不清洗 `docs/adr/`、`change-log/`、archive 或带日期的验证资产。
- 不清理 `docs/verification/assets/` 中已失去当前引用的旧截图/JSON；它们作为历史快照保留。

## Risks

- 当前态引用分散在 SPEC、README、验证记录与测试硬编码中；只删目录会留下死引用。用 `rg` 审计 + 构建/测试兜底。
- `typography` 硬编码 29，若漏改会使 `npm run build` 直接失败。
- 字体家族计数可能因共享关系变化而意外波动；以 `fonts:typography` / `fonts:audit` 实际结果为准。
- `docs/verification/shared.md` 同时含当前态与带日期的历史条目；只更新当前态，避免把历史记录改写成“现在时”。
- 旧链接会 404；已作为明确取舍记录，不在本任务补重定向。
