# Implement — Retire govuk and fast

> 执行前状态：task 仍是 `planning`；完成本文件的 review gate 后才 `task.py start`。不要在规划阶段删除文件。

## 0. Preflight

- [ ] `git status --short` 确认工作区干净；若有未提交改动，先停下并向用户报告。
- [ ] `python ./.trellis/scripts/task.py current` 确认当前任务为 `11-04-retire-govuk-fast`。
- [ ] `node -e "console.log(require('./package.json').version)"` 记录基线 `0.20.0`。
- [ ] 记录基线：`du -sb dist`（当前 8,340,020 B）、`find src/designs -mindepth 1 -maxdepth 1 -type d | wc -l`（当前 30）。
- [ ] 记录回滚点：当前 HEAD；删除只发生在工作区，可用 `git restore` 恢复 tracked 文件。

## 1. Remove design implementations

- [ ] 删除 `src/designs/govuk/`。
- [ ] 删除 `src/designs/fast/`。
- [ ] 删除 `docs/verification/govuk.md`、`docs/verification/fast.md`。
- [ ] 删除 `docs/designs/govuk/`、`docs/designs/fast/`（空目录一并移除）。
- [ ] 不改 `astro.config.mjs` / `src/designs/registry.ts` / `src/infra/SwitcherPage.astro`；它们按目录自动发现。

## 2. Remove code / copy references

- [ ] `src/designs/descriptions.ts`：删除 `fast:` 与 `govuk:` 两个对象；确认剩余 28 个键。
- [ ] `scripts/fonts/typography.mjs`：`styledCount !== 29` → `!== 27`；错误文案 `expected 29 styled designs` → 27。
- [ ] `scripts/fonts/typography.test.mjs`：`styledCount` 29 → 27；`coreDesignCount` 29 → 27；`generatedFamilies` 保持 31。

## 3. Update current-state counts / docs

- [ ] `README.md`：30 套 / 29 styled → 28 套 / 27 styled；删除 FAST 来源条目，替换为仍存在的来源示例（如 Material 3）。
- [ ] `docs/README.md`：预览链路的“当前 27 套预览” → 28。
- [ ] `docs/rules/operations.md`：`fonts:typography` 的“26 套 styled CSS” → 27。
- [ ] `SPEC.md`：
  - [ ] §4.2 `fast` 行标记“已退役（2026-11-04）”；规则示例 `fast / oxide` → `oxide / material3`。
  - [ ] §4.3 `govuk` 行标记“已退役（2026-11-04）”。
  - [ ] §4.4.1 标题日期改 2026-11-04；锚点表删除 `fast` 行。
  - [ ] `transit` 示例中的 `govuk` 改为 `material3` 或 `html-only`。
  - [ ] A 级清单中的 `govuk` 标记已退役；C 组加“历史对照（fast/govuk 已退役）”注记。
  - [ ] 当前总数 30/29 → 28/27；追加“批次 5（2026-11-04）：退役 govuk + fast”。
  - [ ] §6 目录树 `fast/` 示例替换为 `material3/`。
  - [ ] 保留 batch 1–4 历史记录，不改写其事实。
- [ ] `docs/verification/shared.md`：
  - [ ] 当前“30 套” → 28；“193 页 / 30 套” → 181 / 28（以实际构建为准）。
  - [ ] 通知声明“其余 13 套” → “其余 11 套”；删除 govuk OGL 当前句。
  - [ ] 当前检测器汇总移除 govuk `overused-font` 例外；更新零发现计数（以实际 detect 结果为准）。
  - [ ] 带 `>` 的 2026-10-31 / 11-01 历史条目保持原样。
- [ ] `docs/verification/action-menu.md`：当前 govuk 测试页替换为 `lexicon`；30 → 28；删除/标注 govuk 截图引用。共享菜单行为本身不改。
- [ ] `docs/verification/material3.md`：2026-10-12 对照表为 `govuk` / `fast` 行加“已退役（2026-11-04）”历史标注。
- [ ] `docs/verification/traditional-chinese.md`：`/zh-tw/fast/` → `/zh-tw/frost/`；预期字体改为 `--font-gothic-a1` → Noto Sans TC；woff2 仅 Noto Sans TC。

## 4. Version / change-log

- [ ] `npm version 0.21.0 --no-git-tag-version`（更新 `package.json` + `package-lock.json`）。
- [ ] 新增 `change-log/0.21.0.md`，包含：
  - [ ] 退役 `govuk` + `fast` 及理由；
  - [ ] 30 → 28 套（27 styled + html-only）；
  - [ ] 193 → 181 页（实际为准）；
  - [ ] `dist` 新体积；
  - [ ] 旧 URL 404、无重定向；
  - [ ] 历史 ADR/change-log/archive/日期化资产保留；
  - [ ] 验证结论。

## 5. Static / unit / build

- [ ] `npm run fonts:prepare`（若 `.cache/fonts` / `.cache/font-sources` 缺失）。
- [ ] `npm run check`。
- [ ] `npm test`。
- [ ] `npm run build`；记录：
  - [ ] 页面数（预期 181）；
  - [ ] `dist` 字节（应 ≤10 MiB，且低于 8,340,020 B）；
  - [ ] `fonts:typography` 输出 27 styled / 27 core / 31 generated families；
  - [ ] `fonts:audit` 0 孤儿 / 0 悬空；
  - [ ] HTML-only 门禁通过。
- [ ] 若 `generatedFamilies` 不为 31：暂停，核对是否有字体族只被两套删除设计使用；不要直接改期望值。

## 6. Detector / browser smoke

- [ ] 对剩余 28 套运行 `impeccable detect`（按现有验证命令逐目录或整目录）；预期新发现 0，例外仅 `frost` 2 条 `bounce-easing` + `oxide` 1 条 `codex-grid-background`。
- [ ] `npm run preview`（记录端口与停止方式）。
- [ ] `/zh-cn/designs/` 只列 28 套；抽查 `editorial` / `ink` / `zine` / `aero` / `lexicon` 200。
- [ ] `/govuk/`、`/fast/`、`/zh-cn/govuk/`、`/zh-cn/fast/` 返回 404。
- [ ] 随机池 / 语言菜单 / 旧路径入口不再出现两套退役设计。
- [ ] 375×812 smoke：无横向溢出；console 0 error / 0 warning。
- [ ] 停止 preview server。

## 7. Current-state reference audit

- [ ] `rg -n "govuk|fast"` 全仓库；逐条核对：
  - 允许：`change-log/**`、`docs/adr/**`、`.trellis/tasks/archive/**`、`docs/verification/assets/**`、`SPEC.md` 历史批次/已退役注记、`docs/verification/shared.md` 带日期的 `>` 历史条目。
  - 不允许：`src/**`、`scripts/**`、`README.md`、`docs/rules/**`、当前验证正文、当前 SPEC 计数/矩阵。
- [ ] `rg -n "30 套|29 套|193 页|26 套 styled|当前 27 套"` 确认当前态计数无残留。
- [ ] `git diff --check`。
- [ ] `git status --short` 检查未误改 `docs/adr/`、`change-log/` 历史文件、archive、日期化资产。

## 8. Review gate

- [ ] 汇总 diff 统计、构建/测试/检测器/浏览器结果、`dist` 新体积、页面数。
- [ ] 向用户展示变更与验证证据，等待确认。
- [ ] 用户确认前不 commit、不 archive、不推送。
- [ ] 确认后才进入 Phase 3（spec update / commit / finish-work）。

## Rollback points

- 删除目录后立刻 `git status`；若发现误删，`git restore src/designs/govuk src/designs/fast ...` 恢复 tracked 文件。
- 文档批量改动前可先 `git diff --stat`；若范围失控，`git restore` 单文件重做。
- 版本改动可回退 `package.json` / `package-lock.json` 到 0.20.0 并删除 `change-log/0.21.0.md`。
- 不使用 `git reset --hard` / `git clean -fd`。
