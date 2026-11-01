# 繁中字体主站集成

共享需求见父任务 `prd.md` / `design.md` / `implement.md`；本文件只写本子任务范围与验收。

## Goal

主站锁定 catalog v1.2.0，落地 `traditional-chinese` 排版档位、TC 字体路由与门禁，并完成首批 6 套字体接线。

## Scope

- `fonts:update` 锁 catalog v1.2.0；`fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts` 更新到 31 族。
- `fontProfile: traditional-chinese` 在 `src/content.config.ts`、`src/lib/site.ts`、`scripts/fonts/coverage.mjs` 落地。
- 主站 `scripts` schema 加 `han-traditional`。
- `fonts:suite` 相关：`subset.mjs` 确认 TC 族走全语料；`typography.mjs` 加 TC 变量/系统字体与族数断言；`coverage.mjs` 加 TC 专用校验；`audit.mjs` 确认 TC 族按 `cjk` 审计。
- 18 套 CJK 核心设计加 `html:lang(zh-TW)` 变量重映射；8 套系统 CJK 设计加 locale 作用域字体栈插入。
- 首批 6 套（editorial / archive / pager / fast / terminal / html-only）的 `Page.astro` 条件注册 TC `<Font>`，并跳过简体核心与韩文伴生。
- `archive/style.css` 的 `:lang()` 列表补 `zh-TW`。
- 记录首批 `dist`、HTML 数、WOFF2 数、每族 subset 字节数。

## Out of scope

- 不写繁中文案（除首批字体接线所需的测试占位）。
- 不发布字体资产。
- 不改其他语言的设计视觉。

## Acceptance Criteria

- [ ] `npm run check`、`npm run fonts:coverage`、`npm run fonts:typography`、`npm test`、`npm run build` 全部通过。
- [ ] 首批 TC 页面加载映射后的 TC 字体，不出现简体字形回退；8 套系统设计无未定义 `var()`。
- [ ] `fonts:audit` 通过并记录 TC 覆盖证据。
- [ ] `dist` ≤ 10 MiB，与 8.5 MiB 软目标对照；超限时按父 `design.md` §6 取舍。
- [ ] 若首批 6 套设计尚未声明 `zh-TW`（由内容任务负责），本任务只验证字体接线不阻塞构建；最终验收以 GATE-3 为准。

## Dependencies

依赖 `11-01-traditional-chinese-fonts-release` 的 catalog v1.2.0 与 GATE-2。
