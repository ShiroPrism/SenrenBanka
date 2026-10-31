# Cute-alism — 执行计划

## Checklist

- [ ] 写 `DESIGN.md`：拼贴几何、色彩 token、大小阶梯、阴影/描边、字段映射、动效和 Poster 非目标。
- [ ] 完成 `Page.astro`、`style.css`、`tokens.css`、`Preview.astro`、三语消息和 `design.json`。
- [ ] 建立全页组件语法，而不是每个 section 随手贴形状。
- [ ] 检查无渐变/玻璃/柔和阴影/Poster 字体；所有文字对比度达标。
- [ ] 接入 HeadMeta/ContextMenu/按需 Reveal；内部链接 helper 正确。
- [ ] 报告文件、字体、字段覆盖、静态检查和未解决问题。

## Validation

- 主线程串行构建；主题级 1440 / 1280 / 375 / 320 截图。
- 检测器、对比度、焦点、触控、Reveal 降级；无主题 JS。
- 检查预览字体导出与切换页全局令牌泄漏。

## Rollback

- 若拼贴变成 Poster 近似或阅读顺序受损，退回本主题重组网格，不改共享模块。
