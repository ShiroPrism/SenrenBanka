# Pixel Pet RPG — 执行计划

## Checklist

- [ ] 写 `DESIGN.md`：小镇地图 IA、像素网格、HUD 限制、字段映射、JS 状态、无 JS、字体和预览。
- [ ] 完成 `Page.astro`、`style.css`、`tokens.css`、`Preview.astro`、三语消息与 `design.json`。
- [ ] 先验证无 JS 的所有章节与锚点，再加入 `script.ts`。
- [ ] 检查无 fake stats、无 Canvas-only 文本、无主题级横向滚动。
- [ ] 接入共享 HeadMeta/ContextMenu；内部资料链接走 helper。
- [ ] 报告脚本体积、缺字回退、键盘路径与未解决问题。

## Validation

- 主线程串行构建；主题级验证 1440 / 1280 / 375 / 320，地图与面板无溢出。
- 测试脚本成功、抛错、无 JS、reduced-motion；检查所有 `hidden` 恢复路径。
- 检测器与对比度记录；截图包含地图初始态和一处地点激活态。

## Rollback

- 地图状态超出脚本预算或降级不成立时，保留静态地图与全部顺序资料，移除脚本增强。
