# Locale 配置与语言扩展机制 — 执行计划

> 父任务执行计划。子任务分别在各自目录维护 `prd.md`（+ 复杂子任务的 `design.md` / `implement.md`）；本文件只定顺序、门禁、文件集边界与回滚点。

## 0. 前置检查（每次开工）

- [ ] `python ./.trellis/scripts/task.py current` 确认为 `11-01-locale-expansion` 或指定子任务。
- [ ] `git status` 干净或已确认在途改动；子 agent 不得 commit。
- [ ] 读 `AGENTS.md` 八条门禁；按任务读 `docs/rules/data-and-i18n.md`、`action-menu.md`、`design-contract.md`、`operations.md`、`pitfalls.md`。
- [ ] 记录基线：`find dist -type f -printf '%s\n' | awk '{s+=$1} END {print s}'`、页面数、菜单内联 CSS 字节。

## 1. 阶段 A — 共享菜单 CSS 外置（子任务 C1，必须先完成）

- [ ] 把 `ContextMenu.astro` 的 `<style is:inline>` 抽为共享 CSS 入口；所有含菜单页面链接该文件。
- [ ] 更新 `docs/rules/action-menu.md` 表述；新增 ADR（0015）。
- [ ] 验证：桌面右键 / 移动悬浮球 / `Shift+F10` / 无 JS / 375px / 减动态；菜单视觉与现状一致；html-only 零资源不变。
- [ ] 体积：三语 dist ≤ 5.2 MB；styled 页面无内联菜单 CSS。
- [ ] 门禁：`npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`design-page-verify`。

**回滚点**：恢复内联样式即可；不影响语言机制。

## 2. 阶段 B — 设计语言覆盖（子任务 C2）

- [ ] `design.json` schema 增加必填 `locales`；registry 校验（默认设计全量、重复、空、未配置 code 忽略+告警）。
- [ ] 27 套 `design.json` 迁移：全部声明 `["zh-CN","ja","en"]`；`editorial` 为默认，保持一致。
- [ ] 路由生成按 `(design, locale)` 覆盖过滤；未覆盖 404；切换页只列覆盖当前 locale 的设计。
- [ ] 文案解耦：移除 `Record<'zh-CN'|'ja'|'en'>`；新增 `getDesignMessages` / 构建期全量缺失扫描；`descriptions.ts` 同步。
- [ ] 语言切换目标：覆盖则同一设计，否则默认设计；菜单/`html-only` 共用目标函数。
- [ ] 验证：现有三语产物与基线逐页对比（结构/字节/链接），不得出现非预期变化；新增覆盖缺口测试。
- [ ] 门禁：同上 + 新增单元/构建测试。

**回滚点**：移除字段/校验与路由过滤；三语输出应保持完全一致。

## 3. 阶段 C — 单语言 fork（子任务 C3）

- [ ] `locales.length < 2` 时，构建期不渲染语言分组的所有形态（桌面触发项/子菜单、移动分组、JSON、html-only 原生语言区）。
- [ ] 确保无空标题、空 `<ul>`、空数组；菜单其余组（主题/操作）不受影响。
- [ ] 增加单语言构建测试夹具/脚本；文档写明裁剪步骤（site.config → profiles；design.json 未配置 code 被忽略）。
- [ ] 验证：1 语构建成功、页面可达、菜单无语言组；3 语构建与基线一致。
- [ ] 门禁：同上。

**回滚点**：恢复无条件渲染语言组。

## 4. 阶段 D — 韩语 locale（子任务 C4，依赖 A + B）

- [ ] 外部字体仓库发布 Noto Sans KR / Noto Serif KR（生产包 + source archive + license）；`fonts:update` 更新 config/lock/generated。
- [ ] `site.config.yaml` 增加 `ko` 条目与 `fontProfile: korean`；新增 `src/data/profiles/ko.yaml`。
- [ ] 共享文案 `src/i18n/messages.ts` 增加韩语键；27 套设计中仅首批 5–8 套声明 ko，其余保持三语。
- [ ] 首批设计补齐韩语 `messages.ts`；默认 `editorial` 必须包含 ko；未覆盖设计不生成 ko 页面。
- [ ] 字体子集/裁剪/审计通过；缺字报告为空或仅接受项。
- [ ] 验证：4 语构建；ko 页面数量 = 覆盖设计数 + 入口/切换页；菜单语言项 4 个；hreflang 4 语；`design-page-verify` 对每个新增 ko 页面执行。
- [ ] 体积：四语 ≤ 6.0 MB；10 MiB 门禁通过。
- [ ] 门禁：`npm test`、`npm run check`、`npm run build`、`fonts:audit`、`verify:html-only`。

**回滚点**：移除 ko 条目/profile/覆盖与文案；字体仓库版本可保留。

## 5. 阶段 E — 文档与全量验证（子任务 C5）

- [ ] 更新 `README.md`、`docs/rules/data-and-i18n.md`、`action-menu.md`、`operations.md`、`docs/adr/`、`docs/verification/`。
- [ ] 写明任意 locale 添加步骤、覆盖声明、单语言 fork、失败级别、体积预算。
- [ ] 全量回归：`npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`npm run fonts:audit`、每个设计页 `design-page-verify`。
- [ ] 体积报告写入 `docs/verification/shared.md`。
- [ ] 更新 `.trellis/spec/` 中与 locale/字体/菜单相关的事实（如需要）。

## 6. 文件集边界（避免并行冲突）

| 区域 | 负责子任务 |
|---|---|
| `src/components/ContextMenu.astro`、菜单 CSS、`docs/rules/action-menu.md`、ADR 0015 | C1 |
| `src/designs/registry.ts`、`design.json` × 27、`astro.config.mjs` 路由、`src/lib/site.ts`、`src/i18n/resolve.ts`、`descriptions.ts` | C2（C3/C4 只读或按 C2 契约修改） |
| `ContextMenu.astro` 语言组渲染、`html-only/Page.astro` 原生导航、单语言测试 | C3（与 C1 协调 ContextMenu 文件） |
| `site.config.yaml` ko、`profiles/ko.yaml`、`i18n/messages.ts`、首批设计 `messages.ts`、`fonts.*`、`scripts/fonts/*` | C4 |
| `README.md`、`docs/rules/*`、`docs/adr/*`、`docs/verification/*` | C5（C1/C2 的 ADR 除外） |

共享文件冲突处理：C1 与 C3 都会碰 `ContextMenu.astro`，串行合并；C2 先落地 `locales` 契约，C4 再声明 ko。

## 7. 门禁与复核

- 每个子任务完成：`npm test` + 相关构建/验证 + 子任务 PRD 验收项勾选。
- 父任务集成复核：全量 `npm run build`、体积检查、`design-page-verify`、`fonts:audit`；检查 `git diff` 范围与 AGENTS 八条门禁。
- 子 agent 产物必须由主 agent 复核文件与数字，不直接采信摘要。
- 不 commit、不 push、不改 git 配置，直到父任务集成通过并由用户确认。

## 8. 验证命令速查

```bash
npm test
npm run check
npm run build
npm run verify:html-only
npm run fonts:audit
# 体积
find dist -type f -printf '%s\n' | awk '{s+=$1} END {print s}'
# 页面/字体统计
find dist -name '*.html' | wc -l
find dist -name '*.woff2' | wc -l
```

`design-page-verify` 按 `.agents/skills/design-page-verify/SKILL.md` 执行，覆盖桌面、动效、375px、降级、可访问性、对比度与截图归档。
