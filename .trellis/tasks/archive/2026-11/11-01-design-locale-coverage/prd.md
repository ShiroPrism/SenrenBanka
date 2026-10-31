# 设计语言覆盖字段与路由生成

> 父任务：`11-01-locale-expansion`。本子任务建立 locale 覆盖契约与文案解耦，不接入韩语。

## Goal

在 `design.json` 增加显式 `locales` 覆盖数组，按 `(design, locale)` 覆盖生成页面；未覆盖的 locale 不生成设计页并 404；默认设计覆盖全部配置 locale；设计文案不再硬编码三语 union；结构缺口构建失败。

## 背景

- 27 套设计的 `messages.ts` 使用 `Record<'zh-CN' | 'ja' | 'en'>`；`Page.astro` 直接按 `locale.code` 取值。
- `design.json` 无 locale 字段，schema strict；27 套设计全部无条件生成三语页面。
- `src/designs/descriptions.ts` 有切换页描述的三语键与 fallback。
- 路由由 `astro.config.mjs` 用 `injectRoute` 为每套设计注册；必须保持 CSS 隔离。
- `site.config.yaml` 的 `design.default` 当前为 `editorial`。

## Requirements

- R1 `designMetaSchema` 增加必填 `locales: string[]`：非空、去重；值为 locale code。
- R2 注册表校验：默认设计（`design.default`）的覆盖集合必须包含全部配置 locale；非默认设计可为子集；过滤掉未配置 code 并告警；过滤后为空 → 构建失败。
- R3 路由：`astro.config.mjs` 只为覆盖对生成 `/<locale.path>/<design.id>/`；未覆盖 URL 无产物（404）。
- R4 切换页：只列出覆盖当前 locale 的设计；计数、卡片、描述同步；未覆盖设计不出现。
- R5 文案：移除 `Record<'zh-CN' | 'ja' | 'en'>` 硬编码；新增共享查找/校验（如 `getDesignMessages(messages, locale, designId)`），覆盖但缺键 → 构建失败，并全量列出缺失项。
- R6 `descriptions.ts` 按覆盖查找；覆盖但缺描述 → 构建失败。
- R7 语言切换目标：目标 locale 覆盖当前设计 → 同一设计；否则 → 目标 locale 的默认设计。菜单与 `html-only` 原生导航共用该函数。
- R8 27 套 `design.json` 迁移：全部声明 `["zh-CN", "ja", "en"]`；`editorial` 作为默认设计保持一致。
- R9 三语产物不得出现非预期变化：页面数、URL、HTML 结构/字节、canonical、hreflang、菜单链接与基线一致。

## Acceptance Criteria

- [ ] 全部 27 套设计带 `locales` 字段；默认 `editorial` 覆盖三语。
- [ ] 移除三语 union 后 `astro check` 通过；新增第 4 语言的文案缺失会在构建期报错且指出设计与键。
- [ ] 构造一个不覆盖某 locale 的测试设计/夹具：该 locale 无页面、切换页不列出、直接访问 404。
- [ ] 默认设计漏配某 locale → 构建失败；覆盖数组含未配置 code → 告警并继续。
- [ ] 语言切换目标测试：覆盖时同设计，未覆盖时默认设计。
- [ ] 现有三语产物与基线逐页对比无非预期差异。
- [ ] `npm test`、`npm run check`、`npm run build`、`design-page-verify` 通过。

## Out of Scope

- 韩语/其他新语言。
- 菜单 CSS 外置（子任务 C1）。
- 单语言菜单隐藏（子任务 C3）。
- 修改 `design.default`。

## Notes

- 复杂任务：实现前补 `design.md`（schema/数据流/错误信息/测试夹具）与 `implement.md`。
- 共享文件边界：`src/designs/registry.ts`、`design.json` × 27、`astro.config.mjs`、`src/lib/site.ts`、`src/i18n/*`、`descriptions.ts`、各设计 `Page.astro` 的取值；C1/C3/C4 不重复修改这些文件。
- 回滚：移除字段/校验与路由过滤，三语输出应完全相同。

## 完成记录（2026-10-31）

- 27 套 `design.json` 增加 `locales: ["zh-CN","ja","en"]`；`messages.ts` 改为 `Record<string, ...>`；`Page.astro` 移除三语 cast。
- `registry.ts` 增加必填 `locales`；`site.ts` 增加覆盖校验（默认设计全量、缺文案/描述构建失败、未配置 code 告警忽略）与 `designCovers` / `designsForLocale` / `designHrefForLocale`。
- 路由、切换页、随机池、locale 入口、旧路径入口、`html-only` 语言导航均按覆盖过滤；语言切换目标未覆盖时回退默认设计。
- 负向实测：非默认设计排除 `en` → `/en/fast/` 无产物、`/en/designs/` 不列出、语言项 en 目标 `/en/editorial/`；默认设计漏 `en` → 构建失败；缺 `messages.ts` en 键 → 构建失败；未配置 `ko` → 告警忽略、无页面。
- 117 页、`dist` 4,939,230 B；`npm run check` 0 error、`npm test` 67/67、`npm run build` 通过。
