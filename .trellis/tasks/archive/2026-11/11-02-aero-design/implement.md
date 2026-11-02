# Aero — 执行计划

## 0. 前置

- [ ] `python ./.trellis/scripts/task.py current` 指向 `11-02-aero-design`。
- [ ] 读 `AGENTS.md`、`docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`pitfalls.md`。
- [ ] 确认 `src/designs/aero` 不存在；记录 dist 基线。

## 1. 规范先行

- [ ] 写 `src/designs/aero/DESIGN.md`：按 `docs/rules/design-contract.md` 的必填章节；色板表写实测对比度。
- [ ] 写 `design.json`：5 locale、`source: self-produced`、`accent: "#2f9fe0"`。
- [ ] 字体六项记录：Fredoka / Inter / CJK 核心；不新增 family；写完整 fallback。

## 2. 实现

- [ ] `tokens.css`：`:is(.aero, .aero-pv)` 命名空间；禁止 `:root`。
- [ ] `style.css`：入口两行；`@source not "./Preview.astro";`；天空背景、状态条、Hero、dock、窗口、时间线、徽章、消息、页脚；动效包在 `prefers-reduced-motion: no-preference`。
- [ ] `Page.astro`：`loadDesignView('aero', Astro.url.pathname)`；`HeadMeta`；`Font`（展示/正文/CJK）；`Reveal`；`ContextMenu` 无条件渲染；条件区块判空。
- [ ] `messages.ts`：5 语言；术语用「设备/窗口/相册/发送消息」；纯数据。
- [ ] `Preview.astro`：自包含 16/10；不 import `style.css`；`aria-hidden`；无 `:root` / `<Font>` / 可聚焦元素；1–8KB。

## 3. 验证

- [ ] `npm run build`（至少一次）或 `astro build`。
- [ ] 5 语言页面可达：`/zh-cn/aero`、`/zh-tw/aero`、`/ja/aero`、`/en/aero`、`/ko/aero`。
- [ ] 桌面 1440 / 平板 768 / 375×812；无横向滚动；触控 ≥44px。
- [ ] 键盘 Tab/Shift+Tab；焦点环可见；共享菜单可开/关。
- [ ] 对比度：正文 ≥4.5:1；大字 ≥3:1；非文字线条 ≥3:1。
- [ ] 减动态 / 无 JS / 无 IO：内容可见；无隐藏残留。
- [ ] 切换页预览正常；不泄漏正式页 CSS。
- [ ] 更新 `docs/verification/aero.md`；记录 dist 增量。
- [ ] 跑 `npm test` / `npm run check` / `npm run verify:html-only` / `npm run fonts:audit`（可与父任务集成合并）。

## 4. 回滚

- [ ] 删除 `src/designs/aero/` 与 `docs/verification/aero.md`；注册表/路由自动消失。
