# 单语言 fork 的菜单隐藏与文档

> 父任务：`11-01-locale-expansion`。本子任务让「只保留一种 locale」成为正式支持模式。

## Goal

当 `site.config.yaml` 只配置 1 个 locale 时，构建期不渲染语言切换分组的任何形态，菜单不出现空分组；三语构建行为不变；记录 fork 裁剪步骤并增加单语言构建验证用例。

## 背景

- 当前 `ContextMenu.astro` 无条件渲染「语言」触发项 + 二级菜单；移动端无条件渲染语言分组；JSON 配置无条件注入语言项。
- `html-only` 设计在原生导航中列出语言链接。
- 减少到 1 个 locale 目前可构建（zod `min(1)`），但菜单仍显示一个只有当前项的语言组；多余 profile 必须删除，否则 `src/lib/site.ts` 报错。
- 保留 `/<locale>/` 前缀，不改路由。

## Requirements

- R1 `locales.length < 2` 时，以下全部不渲染：
  - 桌面菜单的语言触发项与子菜单；
  - 移动面板的语言分组与标题；
  - 注入的菜单 JSON 中的语言项；
  - `html-only` 原生导航中的语言区（若只剩当前语言）。
- R2 不得留下空 `<ul>`、空标题、空数组或 `aria-labelledby` 指向不存在节点；菜单其余分组（主题/操作）正常。
- R3 3 个及以上 locale 的渲染结果与现状一致（链接、`hreflang`、`aria-current`、目标规则）。
- R4 单语言 fork 文档：改 `site.config.yaml` → 删多余 `src/data/profiles/*.yaml`；`design.json.locales` 中未配置的 code 由覆盖机制忽略；共享/设计文案多余键可保留。
- R5 增加单语言构建验证用例（测试夹具或脚本）：页面可达、菜单无语言组、无空分组、构建通过。
- R6 与 `design.default` 的默认设计配合：单语言时默认设计仍覆盖该 locale。

## Acceptance Criteria

- [ ] 单语言构建成功；每页无语言分组 DOM/JSON；菜单其余功能正常。
- [ ] 三语构建产物与基线一致。
- [ ] 375px 触控与桌面右键菜单均无空分组。
- [ ] `html-only` 单语言页面无空语言导航。
- [ ] fork 文档可照做并通过验证。
- [ ] `npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`design-page-verify` 通过。

## Out of Scope

- 移除 `/<locale>/` 前缀。
- 改语言切换目标规则（由 C2 实现）。
- 翻译/新增语言。

## Notes

- 与 `11-01-menu-css-external` 都改 `ContextMenu.astro`，必须串行合并。
- 复杂任务：实现前补 `design.md`（DOM/JSON 分支、测试夹具）与 `implement.md`。
- 回滚：恢复无条件渲染语言组。

## 完成记录（2026-10-31）

- `buildActionMenuConfig` 在 `locales.length < 2` 时返回空 `languages`；`ContextMenu.astro` 桌面语言触发项/子菜单与移动语言分组整组构建期不渲染；`LanguageSwitcher.astro` 在少于 2 项时不渲染；`html-only` 原生语言区整组不渲染。
- 临时单语言构建（只留 `zh-CN`）通过：59 页；`dist/ja`、`dist/en` 不存在；设计页 `.cm-lang` / `.cm-sub-trigger` / `#cm-lang-submenu` 均为 0；菜单 JSON `"languages":[]`；`html-only` 无 `hreflang` / 语言区；切换页与 404 无 `<nav class="lang-switch">`；源码已恢复。
- `docs/rules/action-menu.md`、`docs/rules/data-and-i18n.md`、`README.md` 已写入单语言 fork 步骤与隐藏契约。
