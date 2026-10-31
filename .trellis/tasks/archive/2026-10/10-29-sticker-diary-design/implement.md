# Sticker Diary — 执行计划

## Checklist

- [ ] 写 `DESIGN.md`，覆盖跨页 IA、非目标、JS 状态、键盘、无 JS、字体、动效与预览。
- [ ] 创建 `Page.astro`、`style.css`、`tokens.css`、`Preview.astro`、三语 `messages.ts`、`design.json`。
- [ ] 先完成无 JS 长文档，再添加 `script.ts`；不得让隐藏状态成为默认。
- [ ] 接入共享 HeadMeta/ContextMenu；内部链接和书签 URL 正确。
- [ ] 检查所有非空字段、空数据分支、三语标签、键盘焦点与 `aria-current`。
- [ ] 测量脚本 gzip 体积并报告；禁止共享文件改动。

## Validation

- 本代理只做主题静态检查和脚本本地检查；完整构建由主线程串行执行。
- 主线程验证脚本成功、脚本抛错、无 JS、reduced-motion 四路径。
- 1440 / 375 截图、无横向溢出、对比度、触控目标、检测器。

## Rollback

- 若跨页交互无法满足无 JS/焦点/体积要求，删除 `script.ts` 与运行时状态，保留完整长文档作为终态。
