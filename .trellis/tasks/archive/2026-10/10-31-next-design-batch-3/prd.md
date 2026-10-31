# 下一批三套设计：宋式/侘寂、新粗野、Art Deco

## Goal

在现有 24 套设计之外，新增三套彼此正交、完整承载资料契约的 `styled` 设计：宋式/侘寂（暂定 id `ink`）、新粗野（暂定 id `brutal`）、Art Deco/暗黑奢华（暂定 id `deco`）。本批先规划；每个子任务独立实现、验证、归档。

## 背景与依据

- 现有 24 套在纸张/复古科技/现代 UI/可爱四个家族已密；本批补三条新轴：东方传统、反设计、装饰艺术/暗黑奢华。
- 选型依据 2026-10-31 联网调研与 [SPEC §4.4.1 视觉差异化矩阵](../../../SPEC.md)；按正交性选型，不按热点堆叠。
- 容量决定：用户明确「先不管容量，不要影响设计发挥，后面再想办法」。三套预计 6.2–6.5 MiB，本身仍在 10 MiB 门禁内；构建仍会跑体积门禁。若超限，另开容量任务，不回退设计。

## 子任务与顺序

1. `10-31-neo-brutalism`（`brutal`）— 先做，验证新设计管线、Preview 与验证流程；结构最简单、风险最低。
2. `10-31-song-wabi`（`ink`）— 旗舰方向；CJK 字体、留白、印章、题跋。
3. `10-31-art-deco`（`deco`）— 黑金、对称、装饰主义；字体与对比度风险最高，最后做。

顺序理由：先易后难，先跑通管线，再做高风险的字体/装饰决策。若用户要求旗舰先行，可调整顺序。

进度（2026-10-31）：

- [x] `10-31-neo-brutalism` — 完成；验证见 `docs/verification/brutal.md`。
- [x] `10-31-song-wabi`（`ink`）— 完成；构建、检测器与浏览器矩阵见 `docs/verification/ink.md`。
- [x] `10-31-art-deco`（`deco`）— 完成；构建、检测器与浏览器矩阵见 `docs/verification/deco.md`。
- `npm run build` 117 页、`npm test` 67/67、`dist` 6,544,535 B（6.24 MiB）；两套 `impeccable detect` 均为 `[]`。

## 跨子任务验收

- 每套都有 `DESIGN.md`（含 Motion 章节与 Don't）、`design.json`（`self-produced`）、`Page.astro`、`messages.ts`、`style.css`；可选 `tokens.css` / `Preview.astro`。
- 三语言（zh-CN / ja / en）完整渲染；`name` / `headline` / `bio` / `links` 四字段必现；不虚构个人事实。
- 仅 `styled`；不新增设计专属 JS（ADR 0011）；无运行时第三方请求；无共享视觉运行时。
- 响应式到 375px；键盘可达；焦点可见；减动态 / 无 JS 降级；对比度达标。
- 每套通过 `design-page-verify`，更新 `docs/verification/<id>.md`；共享机制改动更新 `shared.md`。
- `npm run build` 通过；记录 `dist` 体积；若超 10 MiB，记录并另开容量任务，不降低设计质量。
- 不修改无关设计；不改 ADR（除非出现新的长期决策）。

## 非目标

- 不做这三套的设计专属 JS 交互。
- 不引入新的运行时框架 / 第三方交互依赖。
- 不为容量压缩设计；容量优化另开任务。
- 不新增资料字段 / 自定义区块。
- 不修改现有 24 套的视觉语言。

## 待确认

- 设计 id：`ink` / `brutal` / `deco`（可改）。
- 字体：优先复用现有 families；若需要新字体，走 `docs/fonts/selection-guide.md` 与许可闸门。
- 三套是否都提供 `Preview.astro`：建议都提供；若某个预览成本过高，可回退 accent 点。
- 实现顺序：`brutal` → `ink` → `deco`；如用户要旗舰先行可调整。

## Acceptance Criteria

- [ ] 三个子任务均完成并通过 `design-page-verify`。
- [ ] 三套视觉语言互不正交重叠；与现有 24 套的差异可一句话说清。
- [ ] 四字段与三语言完整；无虚构事实。
- [ ] 无设计专属 JS；无共享运行时；降级路径成立。
- [ ] `npm run build` 通过；`dist` 体积有记录；超限有后续任务。
- [ ] 文档 / 验证记录更新；不改无关文件。
