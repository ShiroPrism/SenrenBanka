# 六套可爱风独立设计 — 执行计划

## Preconditions

- [x] 用户审阅并明确批准本父任务、六个子任务与当前 PRD/design/implement。
- [x] 工作树状态已检查；既有用户改动不得回退。
- [x] 当前 Node/npm、`design-page-verify` 检测器与浏览器工具可用性已记录。

## Phase 0 — Baseline and Font Foundation

- [x] 运行基线 `npm run check` 与 `npm run build`，保存现有页数、styled CSS 数和失败基线。
- [x] 将 Fredoka 的 latin / latin-ext woff2 与 OFL 文本入库到 `src/assets/fonts/fredoka/`。
- [x] 从已核许可的 LXGW WenKai GB 源生成暂定站内子集，入库到 `src/assets/fonts/lxgw-wenkai/` 并保留 OFL。
- [x] 更新 `src/assets/fonts/README.md` 与 `astro.config.mjs` local provider 注册；使用 `--font-fredoka` / `--font-lxgw`。
- [x] 连接字体后再跑一次基线构建，确认现有主题无回归。
- [x] 若字体暂定子集无法覆盖新文案，代理只能报告缺字，不得改共享配置或引用本地路径。

## Phase 1 — Parallel Implementation

### `fairy-kei`

- [x] 派发前确认子任务 `10-29-fairy-kei-design` 已 `start`，其余五个子任务独立启动。
- [x] 子代理仅写 `src/designs/fairy-kei/`；完成六项字体验证记录、CSS、消息、预览与 DESIGN.md。
- [x] 禁止主题脚本；使用 CSS + 原生 `details`/锚点完成收藏盒与抽屉。

### `sticker-diary`

- [x] 子代理仅写 `src/designs/sticker-diary/`；完成跨页手帐、三语消息、预览与 `script.ts`。
- [x] 验证无 JS 长文档、脚本失败终态、键盘翻页和脚本 gzip 体积。

### `pixel-pet-rpg`

- [x] 子代理仅写 `src/designs/pixel-pet-rpg/`；完成像素小镇、地图锚点、真实数据区块、预览与 `script.ts`。
- [x] 检查没有虚构 level/HP/XP/quest 完成度；验证无 JS 锚点路径和键盘可操作性。

### `little-forest`

- [x] 子代理仅写 `src/designs/little-forest/`；完成林间路径、植物/树轮/小花信息映射、预览与 DESIGN.md。
- [x] 禁止主题脚本；图像只来自 CSS/SVG；验证 Reveal 可见性契约。

### `cute-alism`

- [x] 子代理仅写 `src/designs/cute-alism/`；完成全页几何拼贴系统、硬阴影与三语消息。
- [x] 禁止主题脚本；明确与 `poster` 的非目标差异，记录对比度与焦点样式。

### `magical-girl`

- [x] 子代理仅写 `src/designs/magical-girl/`；完成角色档案、星轨/缎带/魔法阵、预览与 `script.ts`。
- [x] 验证 0.8–1.2 秒登场编排、减动态、无 JS、脚本异常和 ≤12KB gzip。

## Phase 2 — Review and Integration

- [x] 汇总六个代理文件清单；检查无代理修改共享文件或其他目录。
- [x] 六个目录完整性审查：文件、命名空间、HEAD、ContextMenu、字段、三语、预览、非目标。
- [x] 抽查六套 DOM 骨架和截图，确认不存在同一模板换皮；不合格主题退回对应子任务。
- [x] 更新 `src/designs/descriptions.ts` 六条三语描述。
- [x] 汇总所有主题文案，重生成 LXGW 子集；验证三语字形覆盖与最终字体体积。
- [x] 处理切换页预览字体并集、CSS 体积、全局令牌泄漏与重复 `@font-face`。
- [x] 将版本从 `0.16.1` 升至 `0.17.0`，新增 `change-log/0.17.0.md`。

## Phase 3 — Validation

- [x] `npm run check`
- [x] `npm run build`
- [x] HTML-only 正向/反向回归与产物门禁
- [x] 三语六套页面存在；CSS 链接与语言无关；样式表数量与 styled 设计数一致
- [x] `BASE_PATH=/demo` 子路径构建抽查
- [x] 六套静态产物核心/可选字段、SEO、菜单、语言目标、预览与 CSS 隔离
- [x] 六套 `impeccable detect --json src/designs/<id>`，处理或记录例外
- [x] 六套桌面 1440 + 375px 触控浏览器测试与截图
- [x] 六套对比度核算、键盘、分区名称、装饰隐藏、焦点、触控命中
- [x] Fairy Kei / Little Forest / Cute-alism 的 Reveal 降级矩阵
- [x] Sticker Diary / Pixel Pet RPG / Magical Girl 的成功、脚本失败、无 JS、减动态矩阵
- [x] 共享操作菜单和切换页回归，包括 24 个启用主题、六套新预览、语言上下文
- [x] 控制台、网络、字体命中、横向溢出、无第三方请求
- [x] 更新 `docs/verification/{fairy-kei,sticker-diary,pixel-pet-rpg,little-forest,cute-alism,magical-girl}.md`
- [x] 更新 `docs/verification/shared.md` 与必要的 `docs/verification/action-menu.md`

## Phase 4 — Closeout

- [x] 复查 `git status` / diff，确保只包含本任务与已确认文档改动。
- [x] 所有文档准确反映实测状态；未执行项与限制明确列出。
- [x] 生成最终交付报告：六套识别点、关键文件、字体/许可、验证命令与结果、遗留风险。

## Rollback Points

- 字体接入失败：撤销新字体注册与资产，六套保留系统回退，不引用本地路径。
- 某主题脚本不达降级/体积门槛：移除该主题脚本并改用静态终态，不影响其他设计。
- 某主题视觉不成立：仅回到该子任务修正；共享文件和其余主题不重做。
- 整批验收失败：按主题独立关闭，不影响既有 16 套与共享基础设施。
