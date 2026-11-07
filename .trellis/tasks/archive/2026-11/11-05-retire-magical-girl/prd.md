# Retire magical-girl design

## Goal

把 `magical-girl` 从**当前产品**中退役：删除设计实现与当前态引用，更新所有当前计数 / 矩阵 / 测试期望为 **27 套设计（26 套 `styled` + 1 套 `html-only`）**、**175 页**（181 − 6：5 个 locale 页 + 1 个旧路径入口，以实际构建为准）。旧路由返回 404；不新增重定向。

历史 `change-log/`、`docs/adr/`、`.trellis/tasks/archive/`、`docs/verification/assets/` 与带日期的验证快照保留，不回写。

## Decision

2026-11-05，项目所有者确认退役 `magical-girl`。这是**策展 + 信息架构决策**，不是技术质量修复（该设计的技术验证通过）。

- `magical-girl` 的主分区是「魔法道具 / 星轨章回 / 变身年表 / 技能封印 / 蜡封信笺」，把 `links / projects / experience / skills / contact` 全部替换成主题词；第一次访问者必须先解码主题才能找到项目、经历、技能与联系。
- 与刚退役的 `shelf` 同类问题：主题词覆盖了求职语义。项目所有者判定“太羞耻、也不符合要求”。
- 默认设计保持 `editorial`；`design.default` / `design.exclude` 不变（只更新 `exclude` 的示例文本）。

## Scope / Files

```text
删除：
  src/designs/magical-girl/          # DESIGN.md / design.json / Page.astro / messages.ts
                                     # style.css / tokens.css / Preview.astro / script.ts
  docs/verification/magical-girl.md

当前态引用：
  src/designs/descriptions.ts         # 删除 magical-girl 五语言说明
  src/data/site.config.yaml           # design.exclude 示例 [magical-girl] → [archive]
  scripts/fonts/typography.mjs        # expected styled 27 → 26
  scripts/fonts/typography.test.mjs   # styledCount 27 → 26
  README.md                           # 28/27 → 27/26；exclude 示例
  docs/README.md                      # 当前 28 套预览 → 27
  docs/rules/operations.md            # 27 套 styled → 26
  SPEC.md                             # §4.4.1 当前计数 + 退役记录；exclude 示例
  docs/verification/shared.md         # 当前基线 / 页数 / 切换页计数 / 路由说明
  docs/verification/traditional-chinese.md  # 当前 27 套 → 26 套
  package.json / package-lock.json     # 0.21.0 → 0.21.1
  change-log/0.21.1.md                # 新增当前结论
```

历史白名单（不改）：`change-log/` 历史文件、`docs/adr/`、`.trellis/tasks/archive/`、`docs/verification/assets/`、`docs/verification/shared.md` 与 `action-menu.md` 中带日期的历史条目、`.trellis/workspace/` journal。

## Requirements

### R1 — Remove implementation

- 删除 `src/designs/magical-girl/` 整个目录（含 `script.ts`）。
- 删除 `docs/verification/magical-girl.md`。
- 不保留 `design.exclude` 占位；不是隐藏，是从当前产品移除。
- `src/designs/registry.ts` / `astro.config.mjs` 依赖目录自动发现，预期无需改代码；构建后验证注册结果。

### R2 — Remove current-state references

- `src/designs/descriptions.ts`：删除 `magical-girl` 五语言对象。
- `src/data/site.config.yaml`、`README.md`、`SPEC.md`：`design.exclude` 示例 `[magical-girl]` 改为 `[archive]`。
- `README.md`：28 套 / 27 styled → 27 套 / 26 styled。
- `docs/README.md`：当前 28 套预览 → 27。
- `docs/rules/operations.md`：`fonts:typography` 的 27 套 styled → 26。
- `SPEC.md`：§4.4.1 当前总数 28/27 → 27/26；追加 2026-11-05 退役 `magical-girl` 记录（与 `shelf` 退役同一段）。
- `docs/verification/shared.md`：只改当前态（顶部基线、默认构建、切换页计数、`/zh-cn/designs/` 卡片数）；带日期的历史条目（含 2026-11-02 的 exclude 实验、2026-10-29 六套可爱风、字体表）保持原样。
- `docs/verification/traditional-chinese.md`：当前 27 套 → 26 套（顶部状态、当前文案/页面计数）；历史证据与日期保留。
- `scripts/fonts/typography.mjs` / `typography.test.mjs`：expected styled / styledCount 27 → 26；`generatedFamilies` 保持 31。
- 不修改 `fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts`；`magical-girl` 使用的字体若仍被其它设计使用，保持注册。

### R3 — Preserve history

不得改写或删除：

- `change-log/` 历史文件；只新增 `0.21.1.md`；
- `docs/adr/` 所有 ADR；
- `.trellis/tasks/archive/` 归档任务；
- `docs/verification/assets/` 带日期的截图 / JSON；
- `docs/verification/shared.md` 与 `action-menu.md` 中带日期的历史条目；
- `.trellis/workspace/` journal。

### R4 — Version / change-log

- `package.json` / `package-lock.json`：`0.21.0` → `0.21.1`。
- 新增 `change-log/0.21.1.md`：退役范围、理由、28→27 / 181→175 / dist 变化、旧 URL 404、历史保留、验证结论。

### R5 — Routing behavior

- 退役后 `/magical-girl/`、`/{locale}/magical-girl/` 返回 404。
- 不新增重定向层；旧链接丢失作为已知取舍记录在 PRD / change-log。
- 默认设计仍是 `editorial`；`design.default` / `design.exclude` 不变。

### R6 — Verification

- `npm run build` 通过；当前 27 套（26 styled + 1 html-only）；预期 175 页（以实际为准）。
- `npm test`、`npm run check`、`npm run fonts:typography`（26 styled）、`fonts:coverage`、`fonts:audit`、`verify:html-only` 全绿。
- `impeccable detect` 扫描剩余设计：不得新增发现；既有例外仍为 `frost` 2 条 `bounce-easing` + `oxide` 1 条 `codex-grid-background`。
- 浏览器 smoke：`/{locale}/designs/` 只列 27 套；抽查 5 套现有设计 200；旧 magical-girl 路由 404；随机池 / 语言菜单 / 旧路径入口不出现该设计；375px 无横向溢出。
- `dist` ≤ 10 MiB；记录新页数、HTML/CSS/字体/总字节，并与 8,036,433 B 基线对比。
- 当前态引用审计：`magical-girl` 只允许留在历史白名单；当前代码、当前验证、README、SPEC 当前矩阵不得残留。

## Acceptance Criteria

- [ ] `src/designs` 下恰好 27 个设计目录：26 个 `styled` + `html-only`；无 `magical-girl`。
- [ ] 构建通过，页面数为 175（以实际为准）；`/designs/` 切换页显示 27 张预览。
- [ ] `/magical-girl/` 与 5 个 locale 前缀的 magical-girl 路由返回 404；无新增重定向。
- [ ] `descriptions.ts` 无 `magical-girl`；注册表校验无缺失文案。
- [ ] 当前态 README / SPEC / docs README / operations / shared / traditional-chinese 计数与引用已更新；历史条目未改写。
- [ ] `scripts/fonts/typography.mjs` 与测试期望为 26；字体门禁与审计通过，字体家族数不意外变化。
- [ ] `impeccable detect` 无新增发现；magical-girl 的脚本 / 样式 / 字体引用不再出现在当前产物中。
- [ ] `dist` ≤ 10 MiB，记录实际字节与页面数。
- [ ] `package.json` / `package-lock.json` 为 `0.21.1`，`change-log/0.21.1.md` 已新增。
- [ ] `npm test`、`npm run build` 通过；`git diff --check` 无空白错误。

## Non-goals

- 不重新设计剩余 27 套；不新增主题。
- 不删除字体家族或改字体选型。
- 不新增旧 URL 重定向；不做 301 迁移。
- 不修改 `design.default` / `design.exclude` 的实际值。
- 不清洗 `docs/adr/`、`change-log/`、archive、workspace journal 或带日期的验证资产。

## Risks

- 当前态引用分散在 README / SPEC / 验证记录 / 测试硬编码中；只删目录会留下死引用。用 `rg` 审计 + 构建/测试兜底。
- `typography` 硬编码 27，漏改会使 `npm run build` 直接失败。
- `magical-girl` 有 `script.ts` 与专属字体使用；删除后字体族可能变为未引用，`fonts:audit` / subset 统计会变化；不得为此改字体配置，以实际审计为准。
- `docs/verification/shared.md` 同时含当前态与带日期的历史条目；只更新当前态，避免把历史改写成“现在时”。
- 旧链接会 404；已记录取舍，不在本任务补重定向。
