# 下一批风格扩展：Aero / Transit / Zine

> 父任务：`11-02-next-style-batch`。本任务拥有需求来源、任务地图、跨子任务验收与最终集成复核；具体实现由子任务承担。

## Goal

在现有 27 套设计、5 个 locale 的基线上，按 2026 趋势与视觉差异化矩阵新增三套自产 styled 设计：

1. `aero` — 2000s Frutiger Aero / Neo-Aero 科技乐观；
2. `transit` — 交通导视 / 环境图形；
3. `zine` — Riso / 复印朋克。

先刷新 SPEC §4.4.1 的视觉差异化矩阵（补录 `ink` / `brutal` / `deco`，增加「时代 / 文化参照」与「信息姿态 / 密度」两轴），再逐套实现、验证、归档。保持 5 语言、纯 CSS、无设计专属 JS、无新增字体/图片、10 MiB 体积门禁。

## 背景与现状（2026-11-02 实测）

- `src/designs` 下 27 套设计（含 `html-only`），全部 `enabled: true`、5 个 locale：`zh-CN` / `zh-TW` / `ja` / `en` / `ko`。
- 当前 `dist`：7,634,316 B（7.28 MiB），175 个 HTML，45 个 WOFF2。
- 上一轮建议的 `ink` / `brutal` / `deco` 已落地，并有 `docs/verification/` 记录；[SPEC §4.4.1](file:///F:/SenrenBanka/SPEC.md#L167) 仍停留在批次 3 口径（只写「浅色红系」缺口，未登记这三套）。
- 2026 趋势交叉核对：Frutiger Aero Revival、zine/punk/low-ink、wayfinding/utilitarian design 在多家来源出现；这三条正好对应现有 27 套的三个空轴（2000s 时代、环境图形信息姿态、Riso 材料/态度）。
- 约束：五语言共享同一 profile schema；设计页只用 `loadDesignView`；styled 设计必须接入共享操作菜单与 Reveal；内部链接用 `withBase()` / `localeHref()`；10 MiB 门禁在 `scripts/fonts/prune.mjs`。

## Requirements

### R1 — 批次范围

- 只新增三套自产 styled 设计：`aero`、`transit`、`zine`；不新增 `html-only`、不新增 locale、不改现有 27 套的视觉。
- 每套 `design.json` 声明 `enabled: true`、`locales: ["zh-CN","zh-TW","ja","en","ko"]`、`source: { "type": "self-produced" }`。
- 每套必须有完整的 `DESIGN.md` / `design.json` / `Page.astro` / `messages.ts` / `style.css`；`tokens.css` 与 `Preview.astro` 三套都提供，保证切换页有视觉签名。

### R2 — 设计契约

- 严格遵循 `docs/rules/design-contract.md`：styled 入口、`@import "tailwindcss" source(none); @source "./";`、`<HeadMeta>`、共享 `<ContextMenu>` 无条件渲染、`<Reveal>`、五语言 `messages.ts`。
- 不新增字体 family；复用现有 npm/local family。Aero：Inter / Roboto Flex + Fredoka + CJK 核心；Transit：Inter / Roboto Flex + JetBrains Mono + CJK 核心；Zine：League Gothic / Blackout / Handjet / Courier Prime + CJK 核心。字体角色最终按 `docs/fonts/selection-guide.md` 的「隐喻 → 样张 → 许可」流程确认。
- 不新增图片；纹理/装饰只用 CSS、Unicode/ASCII、内联 SVG。Transit 的 pictogram 只用少量自绘内联 SVG 或几何符号，不引入整套图标库。
- 无设计专属 JS；动效纯 CSS + 共享 Reveal；禁止无限循环（除已论证的小范围装饰）、滚动劫持、光标替换、自动播放声音。
- 内容默认可见；隐藏态只能由 `html[data-reveal-ready]` 门控；无 JS / 无 IO / 减动态必须可见。

### R3 — 三套视觉方向

- **Aero**：2000s 科技乐观；天蓝/草绿/白、玻璃泡、凝胶按钮、镜头光晕、半透明层、柔和渐变；humanist sans + 圆润展示字；姓名=开机标识/设备名，links=桌面图标，projects=窗口/相册，experience=系统时间线，contact=发送消息。必须与 `homepage99`（90s 个人主页）、`frost`（Apple 玻璃/HIG）明确区分。
- **Transit**：交通导视/环境图形；模块网格、线路色带、站点圆点、换乘、方向箭头、站台牌、时刻表；一种线路主色 + 中性底；projects=线路/站点，experience=时刻表，skills=线路徽章。必须与 `govuk`（政务 Web 表单）和 `oxide`（工业仪表）明确区分。
- **Zine**：Riso/复印朋克；2–3 专色（荧光红/粉 + 黑 + 纸白）、错位套印、半调/颗粒、复印条纹、剪贴、手写圈注；姓名=masthead，bio=manifesto，projects=spreads，links=classifieds。必须与 `poster`（丝网印刷实验）、`receipt`（热敏小票）、`fax` / `tape`（硬件）明确区分。

### R4 — SPEC 矩阵刷新

- 更新 SPEC §4.4.1：锚点表补录 `ink` / `brutal` / `deco`；覆盖缺口改为「色彩缺口已由 ink 朱砂 / brutal 橙红 / deco 金补足，剩余为浅红系等可选色轴」；新增「时代/文化参照」与「信息姿态/密度」两轴；登记批次 4 = Aero + Transit + Zine。
- 更新 §4.4 的批次节奏与已完成批次记录；不修改已冻结的历史 change-log。
- 不修改代码、不新增设计目录。

### R5 — 验证与文档

- 每套完成后执行 `design-page-verify`，更新 `docs/verification/<id>.md`：构建、1440/768/375×812、键盘与焦点、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、dist 体积。
- 三套全部完成后执行全量 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit`。
- 更新 README 的设计清单（如存在）、SPEC §4.4.1、`docs/verification/shared.md` 的体积记录；不修改 `docs/rules/` 规则正文，除非实现暴露新的通用规则（另开任务或在本任务记录）。
- AGENTS.md 八条硬门禁不得破坏；三套都跑 `fonts:typography` 与 `fonts:coverage`。

### R6 — 体积与性能

- 不新增字体文件、不新增图片；新增 3 套后 `dist` 目标 ≤ 8.2 MiB，硬门禁 ≤ 10 MiB。
- 每套 CSS 保持按设计隔离，不引入共享 CSS 聚合；切换页预览目标 1–8 KB/套。
- 每套只加载自身需要的字体 face；CJK 核心变量不得被系统 CJK 替代；不请求未使用字重。

## 非目标（Out of Scope）

- 第二梯队（Broadsheet/LaTeX、自然史、哥特、孟菲斯、节庆记分牌、波普、蓝图、桌游、菜单）本轮不做。
- 不新增字体、图片、第三方图标库、设计专属 JS、运行时交互。
- 不修改共享操作菜单、Reveal、字体管线、路由机制、10 MiB 门禁。
- 不重做或重构现有 27 套设计。
- 不新增 locale；不处理 RTL / 阿拉伯 / 泰文。
- 不做 3D / WebGL / 沉浸式 / 实验性导航 / anti-usability。

## Acceptance Criteria

- [x] A1 SPEC §4.4.1 已更新到 27 套：`ink` / `brutal` / `deco` 入表，两轴与筛选器写入，批次 4 登记；`npx prettier --check SPEC.md` 通过。
- [x] A2 `aero` 完成并通过 `design-page-verify`；5 语言页面可达；切换页预览正常；无新增字体/图片/JS；dist 增量记录。
- [x] A3 `transit` 完成并通过 `design-page-verify`；5 语言页面可达；线路/站点/换乘语义清晰；内联 SVG 图标有可访问名或 `aria-hidden`；无新增字体/图片/JS。
- [x] A4 `zine` 完成并通过 `design-page-verify`；5 语言页面可达；荧光专色不承载正文；错位/颗粒不影响可读性；无新增字体/图片/JS。
- [x] A5 三套 `design.json` 均为 `enabled: true`、5 locale、`source.type = self-produced`；`src/designs` 注册表校验通过；切换页出现 30 套设计（27+3）。
- [x] A6 全量 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit` 通过；dist ≤ 10 MiB（目标 ≤ 8.2 MiB）；HTML 页面数 = **193**（175 + 15 个 locale 设计页 + 3 个旧路径跳转页）。
- [x] A7 AGENTS.md 八条硬门禁未被破坏；CSS 隔离、Reveal 可见性、共享菜单唯一入口、内部链接 `withBase()` 均通过验证。
- [x] A8 `docs/verification/aero.md` / `transit.md` / `zine.md` 与 `docs/verification/shared.md` 更新；父任务最终集成复核通过。

## 任务地图

| 子任务 | 产出 | 顺序 |
|---|---|---|
| `11-02-spec-matrix-refresh` | SPEC §4.4.1 矩阵 + 批次记录 | 必须先完成，作为批次口径 |
| `11-02-aero-design` | `src/designs/aero/` + `docs/verification/aero.md` | C1 后；可与 C3/C4 并行 |
| `11-02-transit-design` | `src/designs/transit/` + `docs/verification/transit.md` | C1 后；可与 C2/C4 并行 |
| `11-02-zine-design` | `src/designs/zine/` + `docs/verification/zine.md` | C1 后；可与 C2/C3 并行 |

## Open Inputs（评审时确认）

- 三套 `displayName` / 一句话 `description` / `accent` 的最终文案与色值。
- Zine 主专色用荧光红还是荧光粉（建议先红，保留粉作第二专色）。
- 三套是否按 Aero → Transit → Zine 串行；若并行，子 agent 文件集已隔离，但父任务集成复核仍需串行。
- 五语言 `messages.ts` 的术语表：Aero 用「设备/窗口/相册」，Transit 用「线路/站点/时刻表」，Zine 用「封面/宣言/跨页/分类广告」。

## Notes

- 子 agent 不 commit；父任务统一集成、复核、提交。
- 子任务文件集不得重叠：各自只改 `src/designs/<id>/` 与 `docs/verification/<id>.md`；SPEC 只由 C1 改。
- 任何实现前先读 `AGENTS.md` 与 `docs/rules/` 对应主题；每套设计先写 `DESIGN.md`，再写实现。
- 共享文件（`src/designs/registry.ts`、`astro.config.mjs`、`src/lib/site.ts`、`ContextMenu`、`Reveal`）本轮预期不需要修改；若需要，先回到父任务评审。
