# Fairy Kei — 执行计划

## Checklist

- [ ] 读取父任务 research、现行规则与字体资产；确认只写 `src/designs/fairy-kei/`。
- [ ] 先写自产 `DESIGN.md`，固定隐喻、非目标、IA、token、字段映射、动效、响应式、六项字体记录与预览档位。
- [ ] 写 `design.json`、三语 `messages.ts`、`tokens.css`、`Page.astro`、`style.css`、`Preview.astro`。
- [ ] 完整渲染 core / optional fields；头像缺失时保持构图成立。
- [ ] 使用共享 `HeadMeta`、`ContextMenu`、按需 `Reveal`；内部链接走 helper。
- [ ] 静态检查主题目录无共享文件改动、无主题 JS、无外部资产。
- [ ] 向主线程报告文件、字体、字段覆盖、CSS 命名空间、静态检查结果与未解决问题。

## Validation

- 主线程整合后由主线程运行全站构建；本代理不得与其他代理并发运行完整 `dist` 构建。
- 主题级浏览器检查：1440、1280、375、320，无横向溢出；减动态可见；对比度和触控命中记录。
- 运行 `impeccable detect --json src/designs/fairy-kei`，例外写入 `DESIGN.md`。

## Rollback

- 收藏盒构图不成立时只重做本设计目录，不改共享字体或父任务。
