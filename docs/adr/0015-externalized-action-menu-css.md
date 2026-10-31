# 共享操作菜单 CSS 外置：单一 hash 文件替代逐页内联

共享操作菜单的样式原先以 `<style is:inline>` 注入每个含菜单的页面。2026-10-31 起改为 Astro 全局样式，构建为单一 `_astro/ContextMenu.<hash>.css`，由所有含菜单的页面链接；`html-only` 不链接。每页仍只链接自己的设计 CSS 与这一份 chrome CSS，不产生跨设计样式聚合。

## 背景

- 菜单样式在组件内跨设计、跨语言完全相同；2026-10-31 实测每页未压缩内联 **18,823 B**，出现在 27 个 `styled` 设计页 + 切换页 + 404（每 locale）上，三语合计约 **1.56 MB**。
- 内联是 v0.9.0 为“不新增 `<link>`、每设计页仍只链接自己的 CSS”做出的选择；代价是体积随设计数 × 语言数线性增长，与语言扩展目标冲突。
- 操作菜单是项目 chrome，不属于任何设计的 `style.css`；外置不改变唯一实现、两份容器 DOM、动作清单或状态语义。

## 决策与依据

- 把 `<style is:inline>` 改为 `<style is:global>`，由 Astro 在构建期抽取为共享 hash CSS。
- 所有含菜单的页面在 `<head>` 链接该文件；`html-only` 页面不链接，维持零 CSS/JS/字体契约。
- 菜单 CSS 不通过 `@import` 进入任何设计 CSS，也不与其他设计 CSS 合并；CSS 隔离判定不变：每页 = 自己的设计 CSS（如有）+ 字体包（如有）+ 一份菜单 CSS。
- 外置文件是 render-blocking `<head>` 链接；菜单容器初始 `hidden`，悬浮球与面板显隐由运行时驱动，实测无可见 FOUC。

## 实测结果（2026-10-31）

- `dist` **6,544,535 B → 4,932,820 B**（-1,611,715 B，约 -24.6%）。
- HTML **3,960,801 B → 2,421,251 B**；CSS **645,973 B → 653,488 B**（新增 7,515 B 共享菜单文件）；117 页不变。
- 页面链接数：`styled` 设计页 **3**（字体包 + 菜单 + 自身设计 CSS）；切换页 **3**（字体包 + SwitcherPage + 菜单）；404 **1**（菜单）；`html-only` **0**。
- 菜单 CSS 仅存在于 `_astro/ContextMenu.CfXucDQq.css`；`Page.*.css` 与 `SwitcherPage.*.css` 不含 `.cm-*` 选择器。
- 桌面：右键 / `Shift+F10` 打开；语言子菜单 3 项、`aria-expanded` 正确、完全落在视口内；两份 DOM 合计 6 个 `.cm-lang`、2 个 `aria-current="page"`。
- 移动 375×812 + 触控（`touchscreen.tap`）：悬浮球 52×52、面板底边 = 812、项高 48px、头 ✕ 44px、取消条 48px、语言项平铺 3 个；无横向溢出、全页无 `touch-action: none`、关闭后滚动锁解除；0 console 错误。
- 无 JS：`styled` 页菜单两份容器仍 `hidden`；`html-only` 原生语言链接 3 个且当前项 `aria-current="page"`；内容可读。
- `fonts:audit`：339 条 `@font-face`、34 个引用字体文件、0 孤儿 / 0 悬空；32 条既有 CJK 缺字警告不变。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| 继续逐页内联 | 三语已重复约 1.56 MB；每新增语言再增加约 0.5 MB，与 10 MiB 门禁和语言扩展目标冲突。 |
| 把菜单 CSS 并入各设计 CSS | 违反 CSS 隔离：菜单是项目 chrome，不得跨设计聚合，也不得让每套设计复制同一份样式。 |
| 运行时注入 `<style>` | 依赖 JS、引入 FOUC 与无 JS 不可用风险；菜单样式不是渐进增强项。 |
| 提高体积门禁 | 不解决重复 chrome 的根因；只会把成本转嫁给访客。 |

## 后果

- **正向**：dist 降低约 1.6 MB；菜单 CSS 跨页面/设计共享缓存，后续语言扩展的每页边际成本下降约 18.8 KB（压缩后 7.5 KB 的共享文件只加载一次）。
- **代价**：每个含菜单页面多一个 CSS 请求（首次访问 7.5 KB，之后命中缓存）；Astro 全局样式抽取的 hash 会随菜单样式内容变化。
- **回滚**：恢复 `<style is:inline>` 并删除共享链接即可；语言机制不依赖此决定。
- **验证归属**：`docs/rules/action-menu.md` 已更新；`docs/verification/action-menu.md` 与 `docs/verification/shared.md` 记录本轮实测。
