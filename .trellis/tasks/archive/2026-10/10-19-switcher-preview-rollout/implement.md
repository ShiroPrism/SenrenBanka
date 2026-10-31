# implement.md — 16 套预览全铺 + 三列栅格

## 前置

- 阅读 `prd.md` / `design.md`；沿用在 `10-18` 验证过的三条硬约束。
- 建立**正式页产物基线**：对 16 套 × zh-cn 记录 `dist/zh-cn/<id>/index.html` 的 sha256（归一化 CSS 文件名后）。

## 阶段 1 · 基线

- [ ] 1.1 `npm run build` → 采集 16 套 zh-cn 设计页 HTML 基线。
- [ ] 1.2 采集切换页基线（CSS 字节 / HTML 字节 / `@font-face` / DOM 节点）。
- [ ] 1.3 记录 16 套设计的令牌清单与祖先选择器审计结果。

## 阶段 2 · 令牌抽取（13 套新增 + 3 套既有复核）

按风险从高到低：

- [ ] 2.1 `pager`：`:root` → `:is(.pg, .pg-pv)`；`style.css` 加 import 与 `@source not`；比对正式页。
- [ ] 2.2 `editorial`：提取颜色令牌（唯一「新增令牌」的套）。
- [ ] 2.3 `frost` / `material3` / `radio`（令牌最多的三套）。
- [ ] 2.4 `fax` / `kern` / `lexicon` / `poster` / `receipt` / `tape` / `oxide` / `govuk`。
- [ ] 2.5 逐套比对正式页产物（A5）；不一致即回滚该套。

## 阶段 3 · 预览碎片（13 套）

每套：

- [ ] 3.1 写 `Preview.astro`：只呈现视觉签名（见 `design.md` §3），样式走组件 `<style>`，目标 1–4KB。
- [ ] 3.2 导出 `fonts`（系统字体设计导出 `[]`）。
- [ ] 3.3 本地构建 + 目检：与正式页对照「一眼可认」。

建议顺序（从简到繁，尽早暴露问题）：`oxide` → `govuk` → `kern` → `editorial` → `receipt` → `lexicon` → `poster` → `pager` → `material3` → `frost` → `tape` → `fax` → `radio`。

## 阶段 4 · 三列栅格

- [ ] 4.1 `InfraStyles.astro`：`.infra` 宽度 → `74rem`；`.infra-list` → `repeat(3, minmax(0, 1fr))` + `align-items: stretch`。
- [ ] 4.2 `<=60rem` 2 列、`<=48rem` 强制单列；卡片 `height: 100%`。
- [ ] 4.3 实测 375 / 768 / 900 / 960 / 1024 / 1280 / 1536 的列数与溢出。

## 阶段 5 · 验证

- [ ] 5.1 `npm run build` 73 页绿；`astro check` 0/0。
- [ ] 5.2 产物断言：切换页 1 条样式表、0 preflight、0 整页选择器、0 `:root` 设计令牌；16 套设计页 0 预览选择器。
- [ ] 5.3 `@font-face` 计数 = 去重族数；记录数值。
- [ ] 5.4 CDP 无障碍树：16 个卡片可访问名不含预览文字；0 可聚焦预览。
- [ ] 5.5 三语言 × 桌面/移动截图；逐套目检。
- [ ] 5.6 reduced-motion / 无 JS / 无 IO；console 0。
- [ ] 5.7 `impeccable detect` 对新增文件 0 条；缩略档位登记进 `DESIGN.md` / `ADAPTATION.md`。
- [ ] 5.8 成本实测：CSS / HTML / DOM / 字体数，与 `design.md` 预估对比。

## 阶段 6 · 记录与提交

- [ ] 6.1 更新 `docs/verification/shared.md`（预览全铺 + 栅格实测）。
- [ ] 6.2 更新 13 套的 `docs/verification/<id>.md`（预览形态 + 令牌抽取）。
- [ ] 6.3 厂商来源设计更新 `docs/designs/<id>/ADAPTATION.md`。
- [ ] 6.4 `AGENTS.md` / `SPEC.md` 如有新事实则同步。
- [ ] 6.5 新增 `change-log/0.14.0.md`。
- [ ] 6.6 提交 + 归档。

## 风险与回滚

| 文件 | 风险 | 回滚 |
|---|---|---|
| `<id>/tokens.css` | 令牌搬移导致正式页漂移 | 删除并还原 `style.css` |
| `<id>/Preview.astro` | 视觉不达「一眼可认」 | 删除即回退色点卡片 |
| `InfraStyles.astro` | 栅格改动影响根页 / 404 | 单文件从 Git 还原 |

## 纪律

- **不改正式页视觉**：每套令牌抽取后必须字节级比对。
- 临时探针 / 脚本用后删除，`git status` 必须干净。
- 不引入静态截图资产。
- 命名空间类必须与该设计 body 类一致（`.<prefix>-pv`）。
