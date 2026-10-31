# implement.md — 旧设计字体审计与最小修复执行计划

## 前置与纪律

- 阅读 `prd.md`、`design.md`、`AGENTS.md`、`SPEC.md`、`docs/fonts/selection-guide.md`、`docs/adr/0008-local-font-library-isolation.md`。
- 本任务只处理九套旧设计；不得顺手重做布局、动效、内容或多语言结构。
- 不生成或引入静态截图；验证使用浏览器实测与构建产物断言。
- 不写入 `.local-fonts/`、本机字体路径或未核对许可的字体文件到生产代码和公开文档。
- 厂商 `DESIGN.md` 只读；适配记录写 `ADAPTATION.md`。
- 每批完成后停在一个可构建、可回滚的状态，再进入下一批。

## Batch 0 · 基线与可复核证据

- [x] 0.1 记录 `package.json` 版本、当前 Git 提交、分支与工作区状态；确认没有用户未提交的改动被覆盖。
- [x] 0.2 运行 `npm run build` 和 `npm run check`，记录页数、错误、警告与既有提示。
- [x] 0.3 对九套设计采集：
  - `astro.config.mjs` 中的字体注册；
  - `Page.astro` 的 `<Font>`；
  - `style.css` / `tokens.css` 的实际字体栈；
  - `Preview.astro` 导出的 `fonts`；
  - 现有 `DESIGN.md` / `ADAPTATION.md` 的六项记录完成度。
- [x] 0.4 对 `/zh-cn/{archive,editorial,fast,terminal,oxide,material3,kern,govuk,frost}/` 记录浏览器计算字体、`document.fonts`、实际字体请求与 375px 横向溢出。
- [x] 0.5 记录 `/zh-cn/designs/` 的 CSS/HTML 字节、`@font-face` 数、生成族名、唯一 WOFF2 请求数、preload 数和卡片几何。
- [x] 0.6 复核真实字符覆盖：至少覆盖 Oxide/Terminal 的 `▁▂▃▄▅▆▇█`、`└─`、`●`、`■`、`→`。覆盖结论只写“实测 / 未实测”，不按字体名推断。
- [x] 0.7 若字符覆盖不足，先决定“明确系统回退”还是“CSS/SVG 装饰替代”；在改动前记录决策。

**通过闸门**：基线数值、证据来源和字符覆盖结论齐全；未把本地候选清单写入公开文档。

## Batch 1 · Oxide 接线修复

- [x] 1.1 在 `astro.config.mjs` 确认/复用 `Geist Variable` 与 `Geist Mono Variable`，不改其既有注册语义。
- [x] 1.2 `src/designs/oxide/Page.astro` 按实际使用引入 `<Font cssVariable="--font-geist" />` 与 `<Font cssVariable="--font-geist-mono" />`。
- [x] 1.3 `src/designs/oxide/style.css` 把 `SuisseIntl` 替换为 `var(--font-geist)`，把 `GT America Mono` 替换为 `var(--font-geist-mono)`；字体栈保留系统中英文与通用族回退。
- [x] 1.4 `src/designs/oxide/Preview.astro` 导出两个实际使用的字体变量；若预览只用其中一族，则只导出该族，避免无意义声明。
- [x] 1.5 若 Geist Mono 不覆盖波形/框线，按 Batch 0.7 的方案加入明确回退或改装饰；记录缺字位置与处理方式。
- [x] 1.6 实机检查 `/zh-cn/oxide/`：`document.fonts` 非空、两个目标族均命中、正文可读、ASCII 装饰不意外换字形、控制台无错误。
- [x] 1.7 检查 `/zh-cn/designs/` 的 Oxide 预览仍保留频道标签、波形、青绿信号与网格；确认预览字体按族去重。

**回滚点**：仅还原 Oxide 的页面、样式和字体声明；不触碰其他设计。

## Batch 2 · Terminal / Editorial 复核

### Terminal

- [x] 2.1 做真实样张对照：JetBrains Mono、候选系统等宽、VT323、Share Tech Mono；重点看 15px 正文、日文/中文回退、波形、框线和状态符号。
- [x] 2.2 记录候选淘汰理由：字符覆盖、正文可读性、宽度、字重、许可和体积。
- [x] 2.3 除非有可复核的明显收益，保留 JetBrains Mono；在 `src/designs/terminal/DESIGN.md` 补六项记录，明确“为什么无需替换”。
- [x] 2.4 检查 `Preview.astro` 仍只导出 `--font-jetbrains-mono`，不影响切换页请求。

### Editorial

- [x] 2.5 做 Fraunces / Georgia / 系统无衬线标签的样张复核；确认正文灰度、标题气质、中文宋体回退与 0.18em 标签字距。
- [x] 2.6 对照候选衬线，说明新增字体是否有明确收益；默认结论为保留。
- [x] 2.7 在 `src/designs/editorial/DESIGN.md` 补六项记录，明确系统声部是设计决定。
- [x] 2.8 检查预览仍只导出 `--font-fraunces`，不新增字体请求。

**回滚点**：若替换导致可读性或字体成本恶化，恢复现有字体并保留记录中的淘汰结论。

## Batch 3 · 九套六项记录

按“先已有记录、后缺口”的顺序：

- [x] 3.1 `archive`：复核现有六项记录与当前实现是否一致；只补真实缺口。
- [x] 3.2 `terminal` / `editorial`：采用 Batch 2 的结论写 `DESIGN.md`。
- [x] 3.3 `kern` / `frost`：在 `DESIGN.md` 补隐喻、角色、候选取舍、覆盖、工程属性与回退顺序。
- [x] 3.4 `oxide`：在 `docs/designs/oxide/ADAPTATION.md` 记录 Geist 复用、字符覆盖、回退与迁移偏差；不改 `DESIGN.md`。
- [x] 3.5 `fast` / `material3` / `govuk`：在各自 `ADAPTATION.md` 补完整六项；`fast` / `govuk` 明确系统字体是上游口径，`material3` 记录 Roboto Flex 的取舍。
- [x] 3.6 每套记录必须含系统中文与通用族兜底；英文/日文覆盖写“实测”或“回退”，不写推测。
- [x] 3.7 全仓库检索确认没有新增 `.local-fonts/`、`F:\Fonts` 或未核验来源泄漏。

**通过闸门**：九套逐一有结论，五套自撰 `DESIGN.md` 与四套 `ADAPTATION.md` 归属正确；厂商快照 diff 为零。

## Batch 4 · 预览隔离、字体与降级验证

- [x] 4.1 构建产物断言：九套设计页各自只链接自身 CSS；切换页不链接任何设计整页 CSS。
- [x] 4.2 预览检查：不 import `style.css`、不声明 `<Font>`、无 `:root` 设计令牌、无 `data-reveal`、无可聚焦元素。
- [x] 4.3 切换页检查：字体按族去重、0 preload、CJK 子集允许惰性下载、无第三方字体域名。
- [x] 4.4 记录新增/变化后的 CSS、HTML、`@font-face`、唯一 WOFF2 数值；与 0.14.0 基线比较并解释差异。
- [x] 4.5 浏览器桌面与 375px：无横向溢出，预览视觉签名不退化，切换页三列/单列布局不被字体修复破坏。
- [x] 4.6 `prefers-reduced-motion`、无 JS、无 IntersectionObserver：预览与正式页内容均可见，控制台无错误。
- [x] 4.7 触控目标与对比度：字体替换不降低正文对比度、可读性或命中面积。
- [x] 4.8 静态部署：在 `BASE_PATH` 场景下确认字体、预览与内部链接前缀正确；不引入服务器依赖。

**通过闸门**：任何字体文件或预览样式只出现在预期页面；成本增长有明确解释。

## Batch 5 · 文档、版本与提交

- [x] 5.1 更新九套 `docs/verification/<id>.md` 的字体接线、实际请求、覆盖、回退与预览状态。
- [x] 5.2 更新 `docs/verification/shared.md` 的切换页成本表与字体并集结论。
- [x] 5.3 如流程或长期决策改变，更新 `docs/fonts/selection-guide.md` 或 ADR；否则说明无需改。
- [x] 5.4 按仓库版本策略更新 `package.json` 与 `change-log/<version>.md`，并补记此前遗漏的提交（至少核对 0.14.0 之后的提交历史，按现有日志口径补写，不改写已发布历史事实）。
- [x] 5.5 检查 `git diff`：不含截图、本机路径、未核验许可资产、`.local-fonts/` 文件，不改厂商 `DESIGN.md`。
- [x] 5.6 最终运行 `npm run build`、`npm run check`、检测器与产物断言。
- [x] 5.7 提交前向用户汇报变更摘要、验证结果、成本变化和未测项；经用户确认后再提交/归档。

## 验证命令

```powershell
npm run check
npm run build
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/<id>
```

浏览器验证以 `npm run preview` 的 `http://localhost:4321` 为准；若端口被占用，先清理监听进程再重启，避免静默回落到其他端口。

## 风险与回滚

| 文件 / 批次 | 风险 | 回滚 |
|---|---|---|
| `astro.config.mjs` | 字体注册影响其他页面 | 仅保留既有条目；按 Oxide 单独回滚 |
| `oxide/Page.astro` / `style.css` | 字体加载失败或字符覆盖不足 | 恢复原字体字符串与页面声明，保留验证记录 |
| 九套记录文件 | 厂商快照被误改 | 从 Git 还原 `DESIGN.md`，把内容移入 `ADAPTATION.md` |
| `Preview.astro` | 样式泄漏或字体膨胀 | 删除该预览改动，回退色点形态 |
| `SwitcherPage.astro` | 去重逻辑退化 | 恢复页面级 `Set` 收集与 `<Font>` 声明 |
| `docs/verification/*` | 记录与实测不一致 | 以最新构建和浏览器证据重写，不追加历史快照 |

## 完成定义

- 九套设计都有当前、可复核的字体记录。
- Oxide 实际加载目标字族，文档字体与浏览器实际字体不再矛盾。
- Terminal / Editorial 有明确的保留或替换证据。
- 切换页保持静态、无截图、字体按族去重、无完整设计资源打包。
- `npm run build` / `npm run check` 通过；验证记录、版本与 change-log 已收口。

