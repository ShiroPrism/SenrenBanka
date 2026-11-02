# 刷新 SPEC §4.4.1 视觉差异化矩阵

> 子任务：`11-02-spec-matrix-refresh`。父任务：`11-02-next-style-batch`。本任务只改 SPEC 文档，不改代码、不新增设计目录。

## Goal

把 [SPEC §4.4.1](file:///F:/SenrenBanka/SPEC.md#L167) 从批次 3 口径更新到当前 27 套设计，并登记批次 4（Aero / Transit / Zine）的计划；让后续设计批次按新矩阵判断正交性，而不是只看颜色缺口。

## 背景

- 当前 `src/designs` 有 27 套设计（含 `html-only`），但 SPEC §4.4.1 的锚点表只列了 editorial / terminal / oxide / fast 四套，覆盖缺口仍写「浅色红系」。
- `ink` / `brutal` / `deco` 已落地，但 SPEC 未登记；继续按旧矩阵推进会误判缺口。
- 本轮调研确认：真正缺的是三条轴（2000s 时代、信息姿态/环境图形、Riso 材料/态度），不是更多颜色。

## Required Changes

### R1 — 锚点表补录

在 §4.4.1 锚点表中补录三套已落地设计：

| 设计 | 色温 · 明度 | 几何 | 字体 | 装饰语言 |
|---|---|---|---|---|
| ink | 暖纸 · 浅 | 竖排题署 / 界栏 / 不对称留白 | 楷 + 仿宋 + 旧体衬线 | 朱砂印 / 青瓷细线 / 页次 |
| brutal | 暖纸 + 酸性高亮 · 浅 | 粗黑边 / 硬偏移阴影 / 可见网格 | 窄体展示 + 中性正文 + 等宽标签 | 告示 / 贴纸 / 编号 |
| deco | 近黑 · 极暗 | 中轴对称 / 双线框 / 阶梯角 | Didone 衬线 + 中性正文 | 扇形 / 菱形 / 金色 monogram |

### R2 — 覆盖缺口改写

把「浅色红系」单条改为：

- 色彩缺口已由 `ink` 朱砂、`brutal` 橙红、`deco` 金补足；剩余「浅红系」等属于可选色轴，不再作为独立风格优先级。
- 真正缺口见新增两轴。

### R3 — 新增两轴

在 §4.4.1 五维之后新增：

1. **时代 / 文化参照**：宋、1920s、1950s Swiss、1980s、1990s、2000s、中世纪、自然史。
2. **信息姿态 / 密度**：海报、文档、仪表、玩具、导视、记分牌。

并说明：这两轴用于区分「视觉像但使用感不同」的设计（如 Aero vs homepage99/frost、Transit vs govuk/oxide、Zine vs poster/receipt）。

### R4 — 新增筛选器

在分级/批次建议旁补三个筛选器（不是视觉轴）：

- **素材负担**：是否需要图片/公版插画/图标库。
- **趋势半衰期**：长（宋式/导视/学术）vs 短（cyberpunk/glitch）。
- **图标依赖**：是否需要成套 pictogram（影响纯 CSS/内联 SVG 可行性）。

### R5 — 登记批次 4

在 §4.4 批次节奏与 §4.4.1 批次建议中登记：

- **批次 4 = `aero` + `transit` + `zine`**；三套均为自产、纯 CSS/无 JS、5 语言、复用现有字体。
- 说明顺序：先本 SPEC 刷新，再 Aero → Transit → Zine；三套文件集独立，可并行但父任务串行复核。
- 不修改已冻结的历史 change-log。

## Acceptance Criteria

- [ ] A1 §4.4.1 锚点表包含 editorial / terminal / oxide / fast + ink / brutal / deco，共 7 套。
- [ ] A2 覆盖缺口段落已改写，不再把「浅色红系」作为唯一/最高优先级缺口。
- [ ] A3 新增「时代/文化参照」「信息姿态/密度」两轴，并给出至少 3 个例子说明如何区分现有设计。
- [ ] A4 三个筛选器（素材负担 / 趋势半衰期 / 图标依赖）已写入。
- [ ] A5 批次 4 已登记为 Aero + Transit + Zine；与 §4.4 批次节奏一致。
- [ ] A6 `npx prettier --check SPEC.md` 通过；`git diff -- SPEC.md` 只含预期段落。
- [ ] A7 未修改代码、未新增设计目录、未改历史 change-log。

## Non-Goals

- 不实现 Aero / Transit / Zine（由子任务 C2–C4 承担）。
- 不修改 `docs/rules/` 规则正文。
- 不重新排序现有 A/B/C 分级（除补录已落地三套与批次 4 外）。
- 不改 10 MiB 门禁、字体管线、路由机制。

## Notes

- 这是轻量文档任务，PRD-only 即可；不需要 `design.md` / `implement.md`。
- 只改 `SPEC.md`；不 commit，等父任务集成。
- 参考：父任务 `design.md` 第 0/1 节；本任务调研结论见父任务 PRD 背景。
