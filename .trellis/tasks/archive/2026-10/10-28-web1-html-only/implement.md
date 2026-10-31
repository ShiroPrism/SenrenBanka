# 执行计划：Web 1.0 与 HTML Only 双主题

> 父任务不上 `start`。实际实施发生在两个子任务；本文件只定义顺序、整合门槛与最终复查。

## 前置

- [x] 完成代码调研并持久化到 `research/repository-audit.md`。
- [x] 用户确认渲染模式、页面边界、导航、视觉方向与任务拆分。
- [x] 更新 `CONTEXT.md` 的渲染模式术语。
- [x] 新增 ADR 0009。
- [ ] 两个子任务的 PRD / design / implement / JSONL 已审阅。

## 阶段 1 · HTML Only 子任务

- [ ] 1.1 审阅并启动 `.trellis/tasks/10-28-html-only/`。
- [ ] 1.2 实现渲染模式契约、验证器、全局规范与 HTML Only 页面。
- [ ] 1.3 完成正/负向产物验证、三语、base path、随机/切换与浏览器无 JS/无 CSS 测试。
- [ ] 1.4 更新验证记录与 descriptions，交付用户验收。
- [x] 1.5 实现自测通过；用户实机验收与归档在提交前统一完成，未通过则回到该子任务修复。

## 阶段 2 · Homepage '99 子任务

- [x] 2.1 HTML Only 契约自测完成且规则稳定后，启动 `.trellis/tasks/10-28-homepage99/`；归档等待用户实机验收。
- [ ] 2.2 实现主题、tokens、preview、三语文案与 descriptions。
- [ ] 2.3 执行 `design-page-verify` 全流程与视觉复核。
- [ ] 2.4 交付用户验收；通过后归档。

## 阶段 3 · 父任务最终整合

- [ ] 3.1 核对两个子任务均已归档、descriptions 三语条目齐全。
- [ ] 3.2 运行 `npm run build`，确认 18 套 × 3 语言 / 81 页；HTML-only 门禁绿。
- [ ] 3.3 抽查随机池、切换页、旧路径、`manualSwitch:false`、三语 SEO、CSS 隔离与 base path。
- [ ] 3.4 更新 `docs/verification/shared.md`、change-log、版本号与文档索引。
- [ ] 3.5 运行最终 review / Trellis check；完成后归档父任务。

## 验证命令

```powershell
npm run build
npm run verify:html-only
npm run preview
node .local-fonts/dev/generic-probe.mjs http://localhost:4321/zh-cn/html-only/
node .local-fonts/dev/generic-probe.mjs http://localhost:4321/zh-cn/homepage99/
```

base path 与源码无关的最终产物检查：

```powershell
$env:BASE_PATH='/demo'
$env:MSYS2_ARG_CONV_EXCL='*'
npx astro build --outDir dist-demo --base /demo
node scripts/verify-html-only.mjs --dist dist-demo
```

## 风险与回滚点

| 风险 | 防护 | 回滚 |
|---|---|---|
| HTML-only 漏掉脚本/样式 | 产物验证器纳入 build + 负向注入测试 | 恢复旧 build script、删验证器与模式 |
| `descriptions.ts` 冲突 | 两子任务严格串行 | 保留已验收条目，回滚未完成条目 |
| 旧主题注册回归 | 显式模式默认 `styled` | 还原 registry schema |
| Homepage '99 与既有拟物重叠 | DESIGN.md 视觉差异矩阵 + 用户目检 | 删除主题目录 |
| 文档规则漂移 | 子任务同步 AGENTS/SPEC/skill | 回滚对应文档与代码为原子变更 |
