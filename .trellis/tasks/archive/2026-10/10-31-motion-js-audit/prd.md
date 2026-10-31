# 审计：设计专属 JS 动效缺口

## Goal

盘点项目 24 套设计中，哪些存在「隐喻核心交互的纯 CSS 表达缺口」，按 ADR 0011 判定是否需要设计专属 JS；只读审计，不实施。

## 已定约束（2026-10-31 盘问第 1 轮）

- 判定标准：主表严格按 ADR 0011（仅隐喻核心交互的纯 CSS 缺口）；另附「超纲愿望池」，明确不建议实施。
- 范围：24 套全列；`html-only` 标注 renderMode 契约排除，其余 23 套 `styled`。
- 已实现设计专属 JS 的 3 套（magical-girl / pixel-pet-rpg / sticker-diary）视为已满足，不再叠加；重点审计其余 20 套零设计脚本的 `styled`。
- 「动态效果」只算用户可操作、有状态、键盘可达的交互；自动循环、声音、光标替换、滚动劫持等不进入主表，仅可进愿望池且须贴近该设计隐喻。
- 产物：只读审计，不写实现代码；由 Trellis 任务 `10-31-motion-js-audit` 承载。

## 待定决策

- 缺口判据的硬 / 软分级（第 2 轮）
- 纯 CSS 缺口的举证标准
- 愿望池收录门槛
- 审计落盘位置与持久化
- 是否附实施准入条件
- 候选排序规则

## Requirements

- R1 全量 24 行盘点表：id / renderMode / 页面脚本现状 / 已有动效手段 / ADR 0011 判定 / 依据。
- R2 对每个「需要」候选给出：隐喻核心动作、当前静态证据、纯 CSS 缺口论证（按能力类别，列明已排除的 CSS 机制）、若加 JS 的边界与风险。
- R3 愿望池：仅收贴近隐喻但被 ADR 0011 禁止项挡住的动态，标注禁止依据，不建议实施。
- R4 明确 `html-only` 不可添加的契约依据。
- R5 不修改任何设计代码、CSS、脚本或 `DESIGN.md`。

## Acceptance Criteria

- [ ] 24 套全覆盖，无遗漏；每行有文件:行号依据。
- [ ] 每个候选的「纯 CSS 缺口」论证可被反证（列明考虑过的 CSS 机制）。
- [ ] 主表与愿望池边界清晰，愿望池不构成实施建议。
- [ ] 结论只引用当前代码、`DESIGN.md` 与 ADR，不引用记忆或推测。
- [ ] 零代码改动。

## Notes

- 初步候选：terminal / radio / tape / pager；深度取证在后台进行，最终名单以证据为准。
- material3 的 ripple 初步归装饰而非核心动作，待证据确认。

## 结论（2026-10-31）

**不新增设计专属 JS；维持 ADR 0011 原状。** 按「隐喻核心交互的纯 CSS 表达缺口」严格判定，硬候选 0 套。

- 已实现设计专属 JS 的 3 套（magical-girl / pixel-pet-rpg / sticker-diary）覆盖各自隐喻核心交互，视为已满足，不再叠加。
- `pager`：[pager/DESIGN.md:329](../../../src/designs/pager/DESIGN.md) 明确键帽/滚轮「不属于任何交互，页面不假装有翻页功能」，[:358](../../../src/designs/pager/DESIGN.md) 将假控件列入 Don't；不构成缺口。
- `material3`：[material3/DESIGN.md:81](../../../src/designs/material3/DESIGN.md) 的 ripple 是 press 反馈装饰，非核心交互；纯 CSS 取不到指针坐标，属「实现与自家规范的视觉差距」，不是 JS 需求。
- `tape`：[tape/DESIGN.md:304-305](../../../src/designs/tape/DESIGN.md) 的 `:focus-within` 是唯一「未来加控件即生效」伏笔；但 cassette 整体 `aria-hidden`、壳内无可聚焦元素，加控件需同时改可访问结构，属重新设计。
- `terminal`：[terminal/DESIGN.md:194-197](../../../src/designs/terminal/DESIGN.md) 明确打字级联为 CSS、无 JS；加输入等于伪造命令能力，属重新设计。
- 其余 19 套为零脚本 `styled`，扫漏未发现惰性控件或设计文档中的 JS 伏笔；`html-only` 由 ADR 0009 契约排除。
- 未修改任何设计代码、CSS、脚本或 `DESIGN.md`；第 2 轮待定问题因「不实施」决定而关闭。
