# 执行计划：HTML Only 原生渲染契约与主题

## 前置

> **Prerequisite:** 父任务方案与 ADR 0009 已经用户确认。先完成本子任务全部契约与验证，再启动 Homepage '99；不得并行修改 `descriptions.ts`。

- [x] 阅读 `prd.md` / `design.md`、父任务 `research/repository-audit.md`、`AGENTS.md`、`SPEC.md`、ADR 0009。
- [x] 记录当前构建页数与 16 套既有设计产物基线。
- [x] 审查 JSONL 上下文 manifest。

## 阶段 1 · 渲染模式与注册表

- [x] 1.1 `designMetaSchema` 增加 `renderMode`，默认 `styled`。
- [x] 1.2 注册表按模式检查 `style.css`：styled 必需、html-only 禁止；`tokens.css` 同样禁止，`Preview.astro` 允许自包含。
- [x] 1.3 更新注册表注释、错误信息与 `site.ts` 中列出设计文件的错误提示。
- [x] 1.4 验证既有 16 套 manifest 不改也能构建。
- [x] 1.5 用临时 `html-only` fixture 验证“存在 style.css 时失败”，删除 fixture。

## 阶段 2 · 产物验证器

- [x] 2.1 新增 `scripts/verify-html-only.mjs`，支持默认 `dist` 与 `--dist`。
- [x] 2.2 实现标签/属性/link rel 的白名单与 fail-closed。
- [x] 2.3 package scripts 增加 `verify:html-only`，并接入 `build` 最后一步。
- [x] 2.4 临时注入四类违规内容，确认逐项非零失败；清理临时目录。

## 阶段 3 · HTML Only 主题

- [x] 3.1 新增 `src/designs/html-only/{DESIGN.md,design.json,Page.astro,messages.ts}`，并补充自包含 `Preview.astro`。
- [x] 3.2 `Page.astro` 只使用 HeadMeta、loadDesignView、locale helpers 与 messages。
- [x] 3.3 渲染核心资料与所有存在扩展区块；不渲染 avatar。
- [x] 3.4 实现页内目录、三语链接、条件性“全部设计”链接与 back-to-top。
- [x] 3.5 为每个 section 提供可访问名称；检查标题层级与普通链接可访问名。
- [x] 3.6 在 `DESIGN.md` 记录资源契约、语义结构、无字体/无动效理由、内容取舍。
- [x] 3.7 在 `messages.ts` 完成三语标签，记录不翻译项（如无则明确无）。

## 阶段 4 · 集成与文档

- [x] 4.1 `src/designs/descriptions.ts` 只新增 `html-only` 三语说明。
- [x] 4.2 更新 `AGENTS.md`：模式、必交文件、style.css/字体/Reveal/ContextMenu 分支，并修正错误的无 JS 回退表述。
- [x] 4.3 更新 `SPEC.md` 的设计目录、schema、构建与验收段落。
- [x] 4.4 更新 `.agents/skills/design-page-verify/SKILL.md` 的 HTML-only 分支。
- [x] 4.5 更新 `docs/verification/action-menu.md`、`shared.md`，新增 `html-only.md`。
- [x] 4.6 检查 `docs/README.md` 的索引是否需要补充，不重复已有事实。

## 阶段 5 · 验证

- [x] 5.1 `npm run build` 绿；HTML-only 门禁在同一命令中执行。
- [x] 5.2 三语产物静态检查：无 CSS/JS/style/on*，metadata links 正确，canonical/robots 符合非默认设计规则。
- [x] 5.3 `BASE_PATH=/demo` 构建到临时 outDir，HTML-only 门禁通过，链接均带 base。
- [x] 5.4 浏览器禁用 JS、禁用 CSS、320px / 375px、桌面与键盘导航：核心与可选资料完整、无横向溢出。
- [x] 5.5 随机池与切换页包含 `html-only`；手选 URL 正确；`manualSwitch:false` 时无 switcher 链接但语言可用。
- [x] 5.6 `Preview.astro` 在切换页呈现可辨识预览，且不污染正式页 0 CSS / JS。
- [x] 5.7 `impeccable detect --json src/designs/html-only` 0 条或记录例外。
- [x] 5.8 更新 `docs/verification/html-only.md` 的当前完整状态并附桌面/移动/无 CSS/无 JS 证据。

## 完成门槛

- [ ] 用户验收通过（按本次目标，代码提交前必须由用户实机确认）。
- [x] 自测完成，`descriptions.ts` 的共享写入点已释放；允许继续 `10-28-homepage99` 的实现自测，归档仍等待用户实机验收。
- [x] 不提交 change-log / 版本号；由父任务最终收口。

## 验证命令

```powershell
npm run build
npm run verify:html-only
npm run preview
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/html-only
node .local-fonts/dev/generic-probe.mjs http://localhost:4321/zh-cn/html-only/
```

## 风险与回滚

- 回滚顺序：HTML-only 目录 → descriptions 条目 → package script/验证器 → registry mode → 文档。
- 若产物仍出现 Astro 注入资源，先移除触发组件，不降低验证器标准。
- 若既有创建无法在不改 16 份 manifest 的前提下保持绿色，回滚 schema 变更并重新设计默认值。
