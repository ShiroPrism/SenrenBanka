# S1 共享分区契约与合规设计迁移

## Goal

建立主分区标准标签的共享契约：`src/i18n/sections.ts` 词表、`data-section` 数据契约、构建后检查脚本与临时豁免清单；修订规则 / 术语 / ADR；迁移 8 套语义合规设计作为样板。S1 完成后，S2 / S3 只需按同一模式修复剩余设计。

## Scope / Files

```text
新增：
  src/i18n/sections.ts
  scripts/check-section-labels.mjs
  scripts/check-section-labels.test.mjs
  scripts/section-labels.allowlist.json
  docs/adr/0023-standard-section-labels.md
  docs/verification/section-labels.md

修改：
  package.json / package-lock.json          # verify:sections、test、build
  src/designs/brutal/Page.astro + messages.ts
  src/designs/cute-alism/Page.astro + messages.ts
  src/designs/frost/Page.astro + messages.ts
  src/designs/homepage99/Page.astro + messages.ts
  src/designs/html-only/Page.astro + messages.ts
  src/designs/kern/Page.astro + messages.ts
  src/designs/material3/Page.astro + messages.ts
  src/designs/terminal/Page.astro + messages.ts
  docs/rules/design-contract.md
  docs/rules/operations.md
  docs/rules/accessibility-responsive.md
  docs/rules/data-and-i18n.md
  AGENTS.md
  .agents/skills/design-page-verify/SKILL.md
```

## Requirements

### R1 — 共享词表

- `src/i18n/sections.ts` 定义 `SectionKey`、`SectionLabel`、`sectionLabels`；覆盖 5 Locale × 6 SectionKey。
- canonical / enLabel / alias 按父任务 `design.md` 第 3 节；alias 不含主题词。
- 纯数据，不 import CSS / `Page.astro` / `style.css`；只 `import type` Locale 类型。

### R2 — 检查脚本

- 依赖为零的 HTML 切片器；扫描 `dist/**/index.html`。
- 按 `<html lang>` 选 Locale；按路径识别 design id；读取 `site.config.yaml` 的 locale path 与 `src/designs/` 目录集合。
- 对每个 `[data-section]` 取区间内第一个 h2；词元化后必须全部属于允许集合。
- profile 无 h2 跳过；条件未渲染的分区跳过；sr-only h2 合法。
- 违规输出设计、Locale、SectionKey、h2 文本、非法词元并非零退出。
- `scripts/section-labels.allowlist.json` 初版 19 套；allowlist 内的设计整页跳过并计数。

### R3 — 构建接入

- `package.json` 增加 `verify:sections`；在 `build` 的 `astro build` 之后、`fonts:audit` 之前运行。
- `npm run test` 加入检查脚本测试。
- 检查失败必须让 `npm run build` 失败；不得静默警告。

### R4 — 8 套合规设计迁移

- 设计：brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal。
- `Page.astro` 导入 `sectionLabels`，取 `sections = sectionLabels[view.locale.code]`。
- h2 改为共享 `label`；主分区加 `data-section`；保留 `aria-labelledby` / `aria-label`。
- `messages.ts` 删除不再使用的标准标签键；主题词键保留。
- terminal 保留 `sr-only` h2 + 可见标准词模式；h2 文本使用共享 `enLabel` + `label`（en 下不重复）。

### R5 — 规则 / 术语 / ADR

- `docs/rules/design-contract.md`：重写「信息架构与主题文案」，加入六分区、h2 词元限制、主题词位置、共享词表、`data-section`、构建校验。
- `AGENTS.md`：新增第 9 条硬门禁；更新“8 条”为“9 条”。
- `docs/rules/operations.md`：记录 `verify:sections`、allowlist 与清空要求。
- `docs/rules/accessibility-responsive.md`：分区可访问名称不得只含主题词。
- `docs/rules/data-and-i18n.md`：标准分区标签属于共享契约，不属于设计 messages。
- `docs/adr/0023-standard-section-labels.md`：决策、替代方案、代价、回滚。
- `.agents/skills/design-page-verify/SKILL.md`：加入标准标签检查项。
- `docs/verification/section-labels.md`：审计、S1 批次证据、allowlist 变化。

## Acceptance Criteria

- [ ] `npm run check`、`npm run test`、`npm run build`、`npm run verify:html-only` 通过。
- [ ] `verify:sections` 在 19 套 allowlist 下通过；8 套合规设计无跳过。
- [ ] 检查脚本单元测试覆盖通过 / 失败 / sr-only / profile 无 h2 / 条件缺失五类。
- [ ] 8 套设计在 5 个 Locale 下 h2 与 `data-section` 正确；terminal 的 sr-only + 可见标准词模式通过。
- [ ] 规则 / AGENTS / ADR / verification / design-page-verify 已更新。
- [ ] 不修改 19 套待修设计的文案；不退役设计；不改 profile schema。
- [ ] `html-only` 没有新增 CSS / JS；`data-section` 只作为数据属性出现。

## Out of Scope

- 不修复 aero / deco / fairy-kei / ink / little-forest / sticker-diary / transit / zine。
- 不修复 archive / fax / lexicon / pager / pixel-pet-rpg / poster / radio / receipt / tape / oxide / editorial。
- 不新增共享 UI 组件；只共享纯数据。
- 不调整字体、路由、随机逻辑、共享操作菜单。

## Dependencies

- 无前置子任务；S1 是 S2 / S3 的前置。
- 词表与 alias 白名单在 S1 评审后冻结；S2 / S3 不得自行扩充。

## Verification

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

浏览器：8 套设计各抽 1 个 Locale 做桌面 + 375px 实测；terminal 重点验证 sr-only h2 与可见标准词；记录到 `docs/verification/section-labels.md`。

## Notes

- 审计证据：父任务 `research/audit-2026-11-09.md`。
- 技术设计：父任务 `design.md` 第 2–6 节；执行顺序见父任务 `implement.md`。
- `CONTEXT.md` 的三个术语已于 2026-11-09 写入。
