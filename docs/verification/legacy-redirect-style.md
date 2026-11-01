# 旧路径跳转页样式精简（legacy redirect）

> **验证日期**：2026-11-01
> **范围**：`src/infra/LegacyRedirect.astro` 改用 `LegacyRedirectStyles.astro`；`InfraStyles.astro` 与根页 / 语言入口 / 切换页 / 404 不变。
> **步骤**：`design-page-verify`（基础设施页专项）；记录归属见 `docs/README.md`。

## 改动

- 新增 `src/infra/LegacyRedirectStyles.astro`，内联跳转页实际使用的 9 条规则（`:root` / `*` / `body` / 暗色 `body` / `.infra` / `.infra p` / `.infra-redirect` / `.infra-card` / `.infra-card:hover`）。
- `LegacyRedirect.astro` 只替换样式组件引用；`meta refresh`、canonical、`noindex, follow`、提示文字与链接均未改动。
- `InfraStyles.astro` 及其余 12 个基础设施页未改动。

## 构建与体积

- `npm run build` 通过：**175 页**；`astro check` 0 error / 0 warning / 1 既有 hint。
- `dist` 总量：**8,855,728 → 8,781,724 B**（-74,004 B）。
- 28 个旧路径跳转页：**119,080 → 45,076 B**（-74,004 B）；单页最大 **1,633 B**（目标 ≤2,400 B）；内联样式合计 **30,576 B**，单页 **1,092 B**（目标 ≤1,200 B）。
- 静态检查 28/28：`meta refresh` 目标 = canonical；`noindex, follow`；恰好 1 个 `<style>`；提示文字与 `.infra-card` 链接存在。
- `npm test` **79/79**。
- `fonts:prune`：`dist` 8,781,724 B；字体 45 文件 / 3,686,028 B；`fonts:audit` 677 规则 / 0 孤儿 / 0 部署缺口 / 64 条既有源字体缺字警告。

## 基础设施页逐字节基线

以下 12 个文件改动前后 SHA-256 与字节数完全一致：

- `dist/index.html`（8,557 B）
- `dist/404.html`（21,311 B）
- `dist/{zh-cn,zh-tw,en,ja,ko}/index.html`
- `dist/{zh-cn,zh-tw,en,ja,ko}/designs/index.html`

## 浏览器实测

预览：`python -m http.server 4400 --directory dist`（本机 4321/4322 存在旧 preview 进程，未使用）。

- 真实跳转：`http://localhost:4400/brutal/` → `http://localhost:4400/zh-cn/brutal/`，标题正确，console **0 error**。
- 精简样式 vs 原完整 `InfraStyles` 基线（把 404 页完整样式注入同一跳转页）：
  - 计算样式对比：亮色 / 暗色 × 1440×900 / 375×812 四组 **0 差异**（body、`.infra`、`.infra-redirect`、`.infra-card` 的 display、布局、padding、颜色、边框、圆角、文字对齐、rect 全部一致）。
  - 截图像素对比（`sharp` raw buffer）：四组 **byteDiff = 0**。
  - 375px 无横向溢出：`scrollWidth === innerWidth === 375`。
- 截图：
  - `assets/redirect-trim-current-{light,dark}-{1440,375}.png`
  - `assets/redirect-trim-baseline-{light,dark}-{1440,375}.png`

## 未测项

- Firefox / Safari / iOS / Android 真机、200% 缩放、`--base /demo` 下的跳转页样式；本轮只验证 Chromium 桌面与 375px 仿真。
- 跳转页本身无脚本；无 JS 呈现由静态 HTML 检查覆盖（提示文字 + 链接 + 内联样式均在产物中）。

## 环境备注

本机 `core.autocrlf=true` 会让 `src/fonts/generated.ts` 在 checkout 后变成 CRLF，而 `fonts:check` 按 LF 渲染比较，导致完整构建在 `fonts:check` 失败。本次验证前将该文件本地规范化为 LF（内容与 HEAD 一致），构建通过；该问题与本次改动无关，未修改仓库配置。
