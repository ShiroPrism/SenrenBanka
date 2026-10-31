# 共享菜单 CSS 外置与体积验证

> 父任务：`11-01-locale-expansion`。本子任务只做菜单 CSS 外置，不改语言机制。

## Goal

把 `ContextMenu.astro` 中每页内联的 18,823 B 共享菜单 CSS 外置为单一 hash CSS 文件，所有含菜单的页面链接它；在保持菜单 DOM、动作、状态语义、CSS 隔离与 html-only 零资源契约不变的前提下，把三语 dist 从 6.54 MB 降到约 4.98 MB。

## 背景

- `src/components/ContextMenu.astro` 顶部注释与实现使用 `<style is:inline>`，刻意不新增 `<link>`。
- 该样式在 27 个设计页 + 切换页 + 404（每 locale）完全相同，三语合计约 1.56 MB 重复。
- 菜单容器初始 `hidden`；移动悬浮球在 `(any-pointer: coarse)` 显示；运行时 JS 约 9.9 KB。
- 当前 dist 6,544,535 B；10 MiB 门禁在 `scripts/fonts/prune.mjs`。

## Requirements

- R1 抽出菜单样式为独立 CSS 入口（建议 `src/components/context-menu.css` 或 Astro 可追踪的等价入口），构建为单一 hash 文件。
- R2 所有含菜单的页面在 `<head>` 链接该 CSS；不含菜单的 `html-only` 页面不链接。
- R3 不改变菜单 DOM、动作处理、`hidden`/`aria` 语义、二级菜单与移动面板行为；不新增第二个语言/操作入口。
- R4 不把菜单 CSS 与设计 CSS 聚合：每页仍只链接自己的设计 CSS + 一份 chrome CSS；禁止 `@import` 从设计 CSS 引入。
- R5 处理 FOUC：CSS 为 render-blocking `<link>`；若悬浮球在样式加载前可见，需验证并记录。
- R6 更新 `docs/rules/action-menu.md` 中“内联/不新增 link”的表述；新增 ADR（建议 0015）记录体积、缓存、额外请求、隔离边界与回滚方式。
- R7 验证：桌面右键、`Shift+F10`、移动悬浮球、375px 触控、无 JS、减动态；菜单视觉与交互与改动前一致。
- R8 体积报告：三语 dist ≤ 5.2 MB；styled 页面无菜单内联样式。

## Acceptance Criteria

- [ ] styled 页面的 `<head>` 仅含自己的设计 CSS + 一份共享菜单 CSS；无 `<style is:inline>` 菜单样式。
- [ ] 三语 dist ≤ 5.2 MB（实测写入验证记录）。
- [ ] 菜单桌面/移动/键盘/无 JS 行为与改动前一致；无控制台错误。
- [ ] `html-only` 页面仍零 CSS/JS/字体资源。
- [ ] 新增 ADR；`docs/rules/action-menu.md` 与 `docs/verification/action-menu.md` 更新。
- [ ] `npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`design-page-verify` 通过。

## Out of Scope

- 语言覆盖字段、单语言 fork、韩语、任何语言文案改动。
- 菜单功能/视觉改版。
- 提高或降低体积门禁。

## Notes

- 与 `11-01-single-locale-menu` 都改 `ContextMenu.astro`，必须串行合并；本任务先完成。
- 回滚方式：恢复 `<style is:inline>` 并删除共享 CSS 链接。

## 完成记录（2026-10-31）

- `ContextMenu.astro` 改为 `<style is:global>`；构建产出单一 `_astro/ContextMenu.CfXucDQq.css`（**7,515 B**），所有含菜单页面链接，`html-only` 0 条。
- `dist` **6,544,535 → 4,932,820 B**；HTML 3,960,801 → 2,421,251；CSS 645,973 → 653,488；117 页。
- 桌面右键 / `Shift+F10` / 语言子菜单 / Escape；移动 375×812 触控（悬浮球 52×52、面板底边 812、项高 48、关闭 44 / 取消 48、无横向溢出）；无 JS 内容可读；`html-only` 零资源；0 console。
- 截图：`docs/verification/assets/action-menu-css-{desktop,mobile,nojs}.png`；ADR 0015、`docs/rules/action-menu.md`、`docs/verification/action-menu.md`、`docs/verification/shared.md` 已更新。
- `npm run build` / `npm test` 67/67 / `npm run check` 0 error 通过。
