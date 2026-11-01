# 执行计划：旧路径重定向页内联样式精简

## 1. 实现

- [ ] 新增 `src/infra/LegacyRedirectStyles.astro`，内联跳转页实际使用的规则：
  - `:root { color-scheme: light dark; }`
  - `* { box-sizing: border-box; }`
  - `body`（居中、字体栈、亮色背景/文字、行高）
  - `@media (prefers-color-scheme: dark) { body { ... } }`
  - `.infra`、`.infra p`、`.infra-redirect`、`.infra-card`、`.infra-card:hover`
- [ ] 组件保持 `<style is:inline>`，不引入任何外部请求。
- [ ] `src/infra/LegacyRedirect.astro` 改为引用新组件；其余标记、head、body 内容不动。
- [ ] **不要修改** `src/components/InfraStyles.astro` 及 `LocalIndex` / `SwitcherPage` / `404` / 根页的调用。

## 2. 基线比对

- [ ] 改动前记录：
  - 28 个 `dist/<design>/index.html` 与 `dist/designs/index.html` 的总字节与单页字节。
  - 根 `dist/index.html`、5 个 `dist/<locale>/index.html`、5 个 `dist/<locale>/designs/index.html`、`dist/404.html` 的 SHA-256。
- [ ] `npm run build` 后：
  - 跳转页总量、单页、内联样式字节达标（A1）。
  - 基础设施页 SHA-256 与基线一致（A2）。
  - 逐页检查 `meta http-equiv="refresh"`、canonical、`noindex`、提示文字与链接仍在。

## 3. 视觉验证

- [ ] `npm run preview` 后打开 `/brutal/`（或任一旧路径）。
- [ ] 由于 `meta refresh` 立即跳转，验证时用 Playwright 拦截目标导航或移除 refresh 后截图，分别检查亮色 / 暗色 / 375px。
- [ ] 对比基线截图：文字居中、卡片边框/圆角/内边距一致；无布局塌陷。
- [ ] 检查 28 个页面中有代表性的 3 个（设计页、`/designs`、含长路径的页面）。

## 4. 文档

- [ ] 新增 `docs/verification/legacy-redirect-style.md`，记录前后字节、哈希比对、截图路径。
- [ ] 在 `docs/verification/shared.md` 顶部追加一条摘要。
- [ ] 如 `docs/rules/operations.md` 对基础设施页有体积/结构说明，补充一句“跳转页使用专用最小样式”。
- [ ] `npm run check:docs` 通过。

## 5. 风险与回滚

| 风险文件 | 说明 |
|---|---|
| `src/infra/LegacyRedirect.astro` | 仅替换样式组件 |
| `src/infra/LegacyRedirectStyles.astro` | 新增文件 |
| `docs/verification/*` | 验证记录 |

- 回滚：删除新组件、恢复 `LegacyRedirect.astro` 的 `InfraStyles` 引用，重新 build。
- 不允许通过修改 `InfraStyles` 或基础设施页来“顺便”减少字节；本任务只影响跳转页。
