# Little Forest — 执行计划

## Checklist

- [ ] 写 `DESIGN.md`：路径 IA、自然色 token、SVG 规则、字段映射、Reveal 契约、字体与预览。
- [ ] 创建 `Page.astro`、`style.css`、`tokens.css`、`Preview.astro`、三语 `messages.ts`、`design.json`。
- [ ] 完成桌面路径与移动单列，所有资料在正确叙事节点。
- [ ] 接入 HeadMeta、ContextMenu、Reveal；内部链接与锚点正确。
- [ ] 检查无主题 JS、无外部素材、无无意义循环动画。
- [ ] 报告文件、字体覆盖、字段覆盖、静态检查和未解决问题。

## Validation

- 主线程串行构建；主题级 1440 / 1280 / 375 / 320 截图。
- 测试 Reveal 四情形：正常、减动态、无 JS、无 IO/脚本错误；隐藏元素必须 0。
- 对比度、焦点、触控目标、检测器；路径与木牌不得进入链接可访问名。

## Rollback

- 若路径布局影响可读性，退化为清晰的单列绘本节点，不移除核心内容。
