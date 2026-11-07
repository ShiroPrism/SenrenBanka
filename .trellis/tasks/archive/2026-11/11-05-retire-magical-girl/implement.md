# Retire magical-girl — 执行计划

## 0. Preflight

- [ ] `git status --short`：预期已有上一步 `shelf` 退役留下的 `SPEC.md` / `docs/rules/design-contract.md` 修改与归档任务目录；这些是前置决策，不回退。
- [ ] `python ./.trellis/scripts/task.py current` 指向 `11-05-retire-magical-girl`（start 后确认）。
- [ ] 记录基线：28 套（27 styled + html-only）/ 181 页 / `dist` 8,036,433 B / 版本 0.21.0。
- [ ] 确认默认设计为 `editorial`，`design.default` 不改。

## 1. 删除实现与当前验证

- [ ] 删除 `src/designs/magical-girl/`。
- [ ] 删除 `docs/verification/magical-girl.md`。
- [ ] 不改 `src/designs/registry.ts` / `astro.config.mjs` / `SwitcherPage.astro`（目录自动发现）。

## 2. 当前态代码 / 文案

- [ ] `src/designs/descriptions.ts`：删除 `'magical-girl': { ... }` 五语言对象；确认剩余键数正确。
- [ ] `src/data/site.config.yaml`：`exclude` 示例 `[magical-girl]` → `[archive]`。
- [ ] `scripts/fonts/typography.mjs`：`styledCount !== 27` → `!== 26`；错误文案同步。
- [ ] `scripts/fonts/typography.test.mjs`：`styledCount` 27 → 26。
- [ ] 不改 `fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts`。

## 3. 当前态文档 / 计数

- [ ] `README.md`：28 套 / 27 styled → 27 套 / 26 styled；`exclude` 示例 → `[archive]`。
- [ ] `docs/README.md`：当前 28 套预览 → 27。
- [ ] `docs/rules/operations.md`：27 套 styled → 26。
- [ ] `SPEC.md`：§4.4.1 当前总数 28/27 → 27/26；2026-11-05 退役记录加入 `magical-girl`；`exclude` 示例 → `[archive]`；历史批次不改。
- [ ] `docs/verification/shared.md`：
  - [ ] 顶部当前基线：28 套 / 181 页 / dist 8,036,433 → 27 / 175 / 新 dist；切换页 28 卡 → 27 卡；检测器汇总更新为剩余设计。
  - [ ] 默认构建段：181 → 175；28 套 → 27 套；移除“magical-girl 路由仍存在”，改为“magical-girl 旧路由 404”。
  - [ ] `/zh-cn/designs/` 当前卡片数 28 → 27。
  - [ ] 当前切换页段 28 套 → 27 套。
  - [ ] 带日期的历史条目（2026-10-29 / 11-01 / 11-02 / 11-04 等）保持原样。
- [ ] `docs/verification/traditional-chinese.md`：当前 27 套 → 26 套（顶部状态、当前文案 / 页面计数）；历史证据保留。
- [ ] 不修改 `docs/verification/action-menu.md` 第 142 行的历史 exclude 实验。

## 4. 版本 / change-log

- [ ] `npm version 0.21.1 --no-git-tag-version`。
- [ ] 新增 `change-log/0.21.1.md`：退役 `magical-girl`、理由、28→27 / 181→175、dist 变化、旧 URL 404、历史保留、验证结论。

## 5. 构建 / 测试

- [ ] `npm run fonts:typography`：26 styled / 26 core / 31 generated families。
- [ ] `npm run fonts:coverage`：按实际设计数通过。
- [ ] `npm test`：84/84（或当前基线）。
- [ ] `npm run check`；若 `check:eol` 因既有 `.trellis` CRLF 失败，按已知问题只规范化对应文件，不扩大改动。
- [ ] `npm run build`：记录页数（预期 175）、字体文件数、核心子集体积、`dist` 总量；`fonts:audit` 0 孤儿 / 0 部署缺口。
- [ ] 若 `generatedFamilies` 不是 31：暂停，核对字体族引用，不直接改期望。

## 6. 检测器 / 浏览器 smoke

- [ ] 对剩余 styled 设计运行 `impeccable detect`：无新增发现；既有例外仅 `frost` 2 + `oxide` 1。
- [ ] `npm run preview`（记录端口与停止方式）。
- [ ] `/zh-cn/designs/` 只列 27 套；抽查 `editorial` / `ink` / `zine` / `aero` / `lexicon` 200。
- [ ] `/magical-girl/`、`/zh-cn/magical-girl/`、`/zh-tw/magical-girl/`、`/ja/magical-girl/`、`/en/magical-girl/`、`/ko/magical-girl/` 均 404。
- [ ] 切换页 27 张预览；随机池 / 语言菜单 / 旧路径入口无 magical-girl。
- [ ] 375×812 切换页无横向溢出；console 0 error / 0 warning。
- [ ] 停止 preview server。

## 7. 当前态引用审计

- [ ] `rg -n "magical-girl|魔法少女"` 全仓库；允许：`change-log/**`、`docs/adr/**`、`.trellis/tasks/archive/**`、`docs/verification/assets/**`、带日期的历史验证条目、workspace journal、`.cache` / `.local-fonts` / `.playwright-mcp` 等忽略目录。
- [ ] 不允许：`src/**`、`scripts/**`、`README.md`、`docs/rules/**`、当前验证正文、当前 SPEC 计数 / 示例。
- [ ] `rg -n "28 套|27 套|181 页|27 套 styled|当前 28 套"` 确认当前态计数无残留。
- [ ] `git diff --check`。
- [ ] `git status --short` 检查未误改历史文件。

## 8. Review gate

- [ ] 汇总 diff、构建 / 测试 / 检测器 / 404 / 切换页结果、新 `dist`、版本与 change-log。
- [ ] 向用户展示变更与验证证据；确认前不 commit、不 archive、不推送。
- [ ] 确认后才提交并归档任务。

## Rollback points

- 删除目录后立刻 `git status`；误删用 `git restore src/designs/magical-girl` 恢复 tracked 文件。
- 文档批量改动前 `git diff --stat`；范围失控时按文件 `git restore` 重做。
- 版本改动可回退 `package.json` / `package-lock.json` 并删除 `change-log/0.21.1.md`。
- 不使用 `git reset --hard` / `git clean -fd`。
