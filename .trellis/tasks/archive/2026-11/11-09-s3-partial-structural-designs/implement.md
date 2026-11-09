# S3 执行计划：11 套部分 / 结构违规

## 前置

- S1 已完成：共享词表、检查脚本、allowlist（S2 完成后应为 11 条）。
- 不依赖 S2；若 S2 未完成，allowlist 仍是 19 条，S3 完成后应剩余 S2 的 8 条，但最终交付要求为空，因此仍需 S2 完成。

## 顺序

1. 机械部分：pager → radio → archive → fax → lexicon → poster → receipt → tape → pixel-pet-rpg。
2. 结构部分：oxide → editorial。
3. 清空 allowlist + 全量验证。

## 每套清单

- [ ] 读 `DESIGN.md` / `messages.ts` / `Page.astro`，确认 h2 与标准 / alias 现状。
- [ ] `Page.astro` 导入共享词表，取 `sections`。
- [ ] 主分区加 `data-section`。
- [ ] 只改违规键；已是标准 / alias 的键保持不动。
- [ ] 主题词移到 h2 外（kicker / subtitle / 装饰）。
- [ ] 修正 `aria-labelledby` / `aria-label`。
- [ ] 删除仅用于标准标签的 messages 键。
- [ ] 标签变短导致排版变化时做最小 CSS 调整。
- [ ] 从 allowlist 删除该设计。
- [ ] `node scripts/check-section-labels.mjs` 确认该设计通过。
- [ ] `design-page-verify` 并记录证据。

## oxide 专项

- [ ] 5 个 `ox-label` `<p>` 转 `<h2>`；contact footer 转 `<h2>`。
- [ ] 英文主题词降为 `.ox-kicker`。
- [ ] 行标题 `<h2 class="ox-row-title">` 降为 `<h3>`，检查 `.ox-row-title` 样式。
- [ ] `data-section`：profile / links / skills / projects / experience / contact。
- [ ] heading 层级 `h1 → h2 → h3`；浏览器 accessibility tree 验证。
- [ ] 375px 无横向溢出；kicker 换行可接受。

## editorial 专项

- [ ] links h2 改标准 `Links` / `链接`，`Elsewhere` 降 kicker。
- [ ] projects `Selected Works` 按 alias 保留或统一 canonical；删除重复的 `<p>精选作品</p>`。
- [ ] 加 `data-section="projects"` / `data-section="links"`。
- [ ] TOC 锚点不变；编辑式排版不变。

## 清空与全量验证

- [ ] `scripts/section-labels.allowlist.json` 改为 `{"designs": []}`。
- [ ] `npm run check`
- [ ] `npm run test`
- [ ] `npm run build`（含 `verify:sections`，无跳过项）
- [ ] `npm run verify:html-only`
- [ ] 27 套 × 5 Locale 的构建产物抽查；页面数、字体基线、dist 体积记录。
- [ ] `docs/verification/section-labels.md` 汇总最终证据。

## 审查门

- allowlist 为空；`verify:sections` 无跳过。
- oxide / editorial heading 层级正确，无 h2 同级冲突。
- 9 套部分违规只改必要键，标准 / alias 键未被无意义改写。
- 全量浏览器验证通过；无横向溢出；无新增客户端 JS。
- 历史验证记录未回写。

## 回滚

- 按设计回滚；allowlist 恢复对应 id。
- 最终交付前必须再次清空 allowlist；否则视为未完成。
