# 下一批风格扩展 — 执行计划

> 父任务执行计划。子任务分别在各自目录维护 `prd.md`（+ 复杂子任务的 `design.md` / `implement.md`）；本文件只定顺序、门禁、文件集边界与回滚点。

## 0. 前置检查（每次开工）

- [ ] `python ./.trellis/scripts/task.py current` 确认为父任务或指定子任务。
- [ ] `git status` 干净或已确认在途改动；子 agent 不得 commit。
- [ ] 读 `AGENTS.md` 八条门禁；按任务读 `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`pitfalls.md`、`data-and-i18n.md`。
- [ ] 记录基线：`find dist -type f -printf '%s\n' | awk '{s+=$1} END {print s}'`、HTML 页面数、WOFF2 数量、当前设计数（27）。
- [ ] 确认 `src/designs/{aero,transit,zine}` 不存在，避免覆盖。

## 1. 阶段 A — SPEC 矩阵刷新（子任务 C1，必须先完成）

- [ ] 更新 SPEC §4.4.1 锚点表：补录 `ink` / `brutal` / `deco` 的四维描述与来源。
- [ ] 覆盖缺口改为：色彩缺口已由 ink 朱砂 / brutal 橙红 / deco 金补足；剩余「浅红系」等可选色轴。
- [ ] 新增两轴：「时代/文化参照」「信息姿态/密度」；补三个筛选器：素材负担、趋势半衰期、图标依赖。
- [ ] 登记批次 4 = Aero + Transit + Zine；更新 §4.4 批次节奏与已完成批次记录。
- [ ] 不改代码、不新增设计目录；不修改历史 change-log。
- [ ] 验证：`npx prettier --check SPEC.md`；`git diff -- SPEC.md` 只含预期段落。
- [ ] 回滚点：恢复 SPEC 原文即可。

## 2. 阶段 B — Aero（子任务 C2）

- [ ] 读 C1 更新后的 SPEC §4.4.1 与 `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`。
- [ ] 先写 `src/designs/aero/DESIGN.md`：隐喻、色板、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- [ ] 写 `design.json`：`displayName: "Aero"`、`description` 一句话、`enabled: true`、5 locale、`accent`、`source: { "type": "self-produced" }`。
- [ ] 写 `tokens.css`（`:is(.aero, .aero-pv)`）、`style.css`（`@source "./"` + `@source not "./Preview.astro";`）、`Page.astro`（`loadDesignView('aero')`、`<HeadMeta>`、`<ContextMenu>`、`<Reveal>`、`<Font>`）、`messages.ts`（5 语言）、`Preview.astro`（自包含、`aria-hidden`）。
- [ ] 字体只用现有 family；CJK 核心变量保留；不新增图片/JS/字体。
- [ ] 验证：构建、5 语言、1440/768/375、键盘、对比度、减动态/无 JS/无 IO、预览、CSS 隔离、内部链接、共享菜单。
- [ ] 更新 `docs/verification/aero.md`；记录 dist 增量。
- [ ] 回滚点：删除 `src/designs/aero/` 与 `docs/verification/aero.md`。

## 3. 阶段 C — Transit（子任务 C3）

- [ ] 读 C1 更新后的 SPEC §4.4.1 与设计契约；先写 `DESIGN.md`。
- [ ] `design.json`：`displayName: "Transit"`、5 locale、`accent`、`source: self-produced`。
- [ ] 实现线路色带、站点圆点、换乘、方向箭头、站台牌、时刻表；少量自绘内联 SVG 图标；不引整套图标库。
- [ ] 线路图用 CSS grid + 伪元素；站点信息用真实列表/表格；装饰线路 `aria-hidden`。
- [ ] 字体：Inter / Roboto Flex + JetBrains Mono + CJK 核心；不新增字体。
- [ ] 验证：同 C2；额外检查线路色不单独承载信息、黄色线不承载文字、窄屏纵向线路、触控 ≥44px。
- [ ] 更新 `docs/verification/transit.md`；记录 dist 增量。
- [ ] 回滚点：删除 `src/designs/transit/` 与 `docs/verification/transit.md`。

## 4. 阶段 D — Zine（子任务 C4）

- [ ] 读 C1 更新后的 SPEC §4.4.1 与设计契约；先写 `DESIGN.md`。
- [ ] `design.json`：`displayName: "Zine"`、5 locale、`accent`、`source: self-produced`。
- [ ] 实现 2–3 专色、错位套印、半调/颗粒、复印条纹、剪贴、手写圈注；荧光红/粉只做装饰/大字。
- [ ] 正文 ink；小字链接用深红/蓝；不做无限 marquee/闪烁；不抄真实杂志/品牌。
- [ ] 字体：League Gothic / Blackout / Courier Prime / Handjet + CJK 核心；不新增字体。
- [ ] 验证：同 C2；额外检查荧光色对比、错位不影响正文、纹理不造成阅读疲劳、375px 无横向滚动。
- [ ] 更新 `docs/verification/zine.md`；记录 dist 增量。
- [ ] 回滚点：删除 `src/designs/zine/` 与 `docs/verification/zine.md`。

## 5. 阶段 E — 集成复核（父任务）

- [ ] 三套设计目录齐备；`design.json` 校验通过；切换页显示 30 套设计。
- [ ] 全量 `npm test` / `npm run check` / `npm run build` / `npm run verify:html-only` / `npm run fonts:audit`。
- [ ] 页面数 = **193**（175 + 15 个 locale 设计页 + 3 个旧路径跳转页）；dist ≤ 10 MiB（目标 ≤ 8.2 MiB）；记录 HTML/CSS/WOFF2 分类体积。
- [ ] 三套 `design-page-verify` 记录齐全；`docs/verification/shared.md` 更新体积与字体统计。
- [ ] AGENTS 八条门禁复核：数据加载、资料字段、内部链接、html-only 零资源、共享菜单、CSS 隔离、Reveal 可见性、改动必验。
- [ ] `git diff --stat` 范围只含 `src/designs/{aero,transit,zine}/`、`docs/verification/{aero,transit,zine,shared}.md`、`SPEC.md`；无意外共享文件改动。
- [ ] 子 agent 产物由主 agent 复核文件与数字，不直接采信摘要。
- [ ] 不 commit、不 push、不改 git 配置，直到用户确认。

## 6. 文件集边界（避免并行冲突）

| 区域 | 负责子任务 |
|---|---|
| `SPEC.md` §4.4 / §4.4.1 | C1（仅此任务） |
| `src/designs/aero/**`、`docs/verification/aero.md` | C2 |
| `src/designs/transit/**`、`docs/verification/transit.md` | C3 |
| `src/designs/zine/**`、`docs/verification/zine.md` | C4 |
| `docs/verification/shared.md`、最终集成记录 | 父任务 E |
| `src/designs/registry.ts`、`astro.config.mjs`、`src/lib/site.ts`、`ContextMenu`、`Reveal`、字体管线 | 本轮预期不改；如需修改，先回父任务评审 |

三套设计的目录互不重叠，可并行；C1 必须先完成。若并行，父任务在 E 阶段串行复核。

## 7. 门禁与验证命令速查

```bash
# 任务状态
python ./.trellis/scripts/task.py current

# 设计与文档
npx prettier --check SPEC.md
npm test
npm run check
npm run build
npm run verify:html-only
npm run fonts:audit

# 体积 / 页面 / 字体
find dist -type f -printf '%s\n' | awk '{s+=$1} END {printf "%d bytes / %.2f MiB\n", s, s/1048576}'
find dist -name '*.html' | wc -l
find dist -name '*.woff2' | wc -l

# 单套设计页（示例）
# 开发服务器启动后逐页检查 /zh-cn/aero、/zh-tw/aero、/ja/aero、/en/aero、/ko/aero
```

`design-page-verify` 按 `.agents/skills/design-page-verify/SKILL.md` 执行：按 `design.json.renderMode` 分流（三套均为 styled）、构建/类型检查、产物校验、impeccable 检测器、浏览器桌面实测、动效实测、375px 触控仿真、降级与可访问性、对比度与截图归档。

## 8. 子 agent 派遣协议

- 每次 dispatch prompt 第一行必须是 `Active task: <task path from task.py current>`。
- 子 agent 只改自己文件集；不 commit、不 push、不改 git 配置。
- 子 agent 返回摘要后，主 agent 必须读回关键文件与数字，不直接采信摘要。
- 大实现拆层：先 DESIGN.md → tokens/style → Page/messages/Preview → 验证；避免单回合超限。
- 若子 agent 发现共享文件必须修改，停止并回到父任务评审，不自行改共享机制。
