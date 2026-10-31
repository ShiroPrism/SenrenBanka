# Magical Girl — 执行计划

## Checklist

- [ ] 写 `DESIGN.md`：舞台/档案 IA、原创 SVG、色彩、字体、JS 编排、降级、字段映射和预览。
- [ ] 完成 `Page.astro`、`style.css`、`tokens.css`、`Preview.astro`、三语消息和 `design.json`。
- [ ] 先实现无 JS 静态终态，再添加 `script.ts` 的短编排。
- [ ] 确保无外部位图/角色、无覆盖层、无声音、无无限循环。
- [ ] 接入 HeadMeta/ContextMenu；内部链接 helper 正确。
- [ ] 报告脚本 gzip、降级路径、字体覆盖、字段覆盖和未解决问题。

## Validation

- 主线程串行构建；主题级 1440 / 1280 / 375 / 320 截图。
- 测试正常、脚本抛错、无 JS、reduced-motion；正文必须在动画开始前可读。
- 焦点、对比度、触控、标题层级、装饰可访问名；检测器与预览隔离。

## Rollback

- 若编排导致内容隐藏、超过 1.2 秒或超出脚本预算，删除 `script.ts`，保留静态舞台终态。
