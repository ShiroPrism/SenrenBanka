# S2 执行计划：8 套全违规设计

## 前置

- S1 已完成：`src/i18n/sections.ts`、检查脚本、allowlist（19 条）可用。
- 从父任务 `design.md` 复制词表规则；不得自行扩充 alias。

## 顺序

建议按风险从低到高：zine → transit → deco → fairy-kei → ink → little-forest → sticker-diary → aero。

aero 放最后，因为它是参考样板，最容易对照浏览器证据。

## 每套清单

- [ ] 读该设计 `DESIGN.md`、`messages.ts`、`Page.astro`，确认 h2 与 section 结构。
- [ ] `Page.astro` 导入共享词表，取 `sections`。
- [ ] 主分区加 `data-section`。
- [ ] h2 改为共享 `label`；主题词移到 h2 外（kicker / subtitle / 装饰）。
- [ ] 修正 `aria-labelledby` / `aria-label`。
- [ ] 删除 `messages.ts` 中仅用于标准标签的键。
- [ ] 标签变短导致排版变化时，做最小 CSS 调整。
- [ ] 从 allowlist 删除该设计。
- [ ] 运行 `node scripts/check-section-labels.mjs`，确认该设计通过。
- [ ] `design-page-verify`：桌面 + 375px + 减动态 + 无 JS（如适用）+ 截图。
- [ ] 在 `docs/verification/section-labels.md` 记录 h2 前后值、kicker 去留、CSS 调整与证据。

## 批次验证

```bash
npm run check
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

预期 allowlist 从 19 降到 11；这 8 套无跳过、无违规。

## 审查门

- 8 套 h2 在 5 Locale 下全部只含标准词元。
- 主题词仍可读但不是 heading；移除 kicker 后标题成立。
- 页面视觉语言未改变；无横向溢出；无新增客户端 JS。
- allowlist 精确减少 8 条，没有误删其他设计。

## 回滚

- 按设计回滚目录与 allowlist 条目；S2 不修改共享词表，回滚不影响 S1。
- 若某套 CSS 调整导致回归，优先回滚该设计而不是放宽检查。
