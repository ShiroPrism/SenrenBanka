# 单份 404 的多语言展示与运行时 Locale 解析

- 状态：Accepted（2026-11-23）
- 相关：`SPEC.md` §5.5 / §7.3 / §7.5；`CONTEXT.md`「404 display locale / Single 404 page」；`docs/rules/data-and-i18n.md`；`docs/rules/action-menu.md`；`.trellis/tasks/11-23-404-locale-display/`

## 背景

静态托管只在未知路径返回根 `dist/404.html`，URL 保持原样，构建期拿不到请求路径。项目又要求
404 与共享操作菜单使用同一种 Locale；如果 404 固定按默认 Locale 渲染，英文 / 日文用户会在
错误页看到中文，菜单的当前语言标记也会与页面内容不一致。

为每种 Locale 生成独立 404 页面并依赖托管平台按路径 routing，会破坏 GitHub Pages / Cloudflare
Pages / Vercel 的可移植部署边界；只渲染默认内容再在运行时替换文本，则会先闪一下错误语言。

## 决策

1. **保留单份 `404.html`**，不生成每 Locale 的 404 页面，不增加 Hosting rewrite 或服务端语言检测。
2. 构建期在同一份 HTML 内预渲染全部 Locale 的 404 正文、入口链接与默认设计链接；默认 Locale
   区块带 `data-default`，无 JavaScript 时可见。其它区块由 CSS 默认隐藏。
3. `<head>` 内的内联脚本在首屏前按 **请求路径首段 → Locale preference → 浏览器语言 → 默认
   Locale** 解析展示语言；路径首段精确匹配 `i18n.locales[].path`，未配置的路径语言视为无路径
   语言。浏览器语言采用与根入口一致的最长标签匹配。
4. 脚本设置 `html[lang]`、`html[data-404-locale]`（值为 Locale path）与本地化 `<title>`；
   CSS 根据该属性只显示对应区块，避免默认语言闪烁。
5. 404 的共享操作菜单仍只有一份 DOM；运行时按 `data-404-locale` 选择菜单 Locale variant，
   同步标签、Toast、aria、当前语言标记、随机目标池、全部设计 href 与分享标题。
6. 404 只读取 Locale preference，**不写入、不删除**；语言偏好仍只在菜单语言项被显式激活时写入。
   404 菜单中的语言项继续指向目标 Locale 的入口页。
7. 无 JavaScript 时固定显示默认 Locale；这是单份静态 404 的明确限制。保留 `<noscript>` 语言
   入口，不声称无 JS 能按路径本地化。

## 结果

- 用户在 `/en/nonexistent/`、`/ja/nonexistent/` 等路径看到对应语言的 404 与菜单；无路径错误
  链接优先复用其已选语言，其次浏览器语言，最后默认 Locale。
- 单份 404 的 HTML 会增加全部 Locale 的 404 区块与菜单 variant 数据；正文很短，成本远低于
  每语言复制整页菜单 DOM。菜单 DOM 仍只渲染一次。
- 无 JS 时仍是默认 Locale；这是与根入口“无 JS 不做语言协商”一致的取舍。
- 404 不写偏好，打开一个错误分享链接不会改变收件人的入口语言。

## 替代方案

- **每 Locale 独立 404 + Hosting routing**：静态托管不可移植，GitHub Pages 只认根 `404.html`。拒绝。
- **只渲染默认区块，运行时替换文本**：实现更小但会闪错语言，且丢失预渲染的结构化链接。拒绝。
- **只换正文，不本地化菜单**：页面与菜单语言割裂，当前语言勾选错误。拒绝。
- **404 加载时写入浏览器 / 路径语言偏好**：错误链接会覆盖用户手选入口语言。拒绝。
- **无 JS 也按路径本地化**：构建期拿不到请求路径；只能引入每 Locale 页面或服务端能力。拒绝。

## 回滚

删除 404 预渲染面板、内联 Locale 解析脚本与菜单 locale variants，恢复 `resolveLocale(model, '')`
的默认 Locale 渲染；菜单运行时与设计页不受影响。若回滚，本 ADR 标记为 superseded，不删除历史。
