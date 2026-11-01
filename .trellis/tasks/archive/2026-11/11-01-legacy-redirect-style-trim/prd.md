# 旧路径重定向页内联样式精简

## Goal

让 28 个旧路径 `LegacyRedirect` 页面只内联实际使用的少量样式，去掉列表网格、预览容器、语言切换器、徽章等死规则，在不改变跳转行为和可见降级内容的前提下，把这些页面从 **119,080 B** 降到 **≤ 50,000 B**。

## Background

当前 [src/infra/LegacyRedirect.astro:41](file:///F:/SenrenBanka/src/infra/LegacyRedirect.astro#L41) 复用完整的 `<InfraStyles />`，而该组件是为根页 / 语言入口 / 切换页 / 404 设计的。

以 `dist/brutal/index.html` 实测：

| 项目 | 字节 |
|---|---:|
| 整页 | 4,248 |
| 内联 `<style>` | 3,735 |
| 实际使用规则 | 1,091 |
| 死规则 | 2,059 |
| 注释 | 约 585 |

实际使用的只有：`:root`、`*`、`body`、暗色 `body` 媒体查询、`.infra`、`.infra p`、`.infra-redirect`、`.infra-card`、`.infra-card:hover`。其余规则与跳转页无关。

全站 28 个跳转页（27 个设计旧路径 + `/designs`）合计 119,080 B，其中内联样式 104,580 B。

## Requirements

- R1 新增跳转页专用的最小样式（独立组件或明确 variant），只包含上述实际使用的 9 条规则；不得复制完整 `InfraStyles` 的死规则。
- R2 **不修改** `src/components/InfraStyles.astro` 及其调用方（根页、5 个语言入口、5 个切换页、404），这些页面产物必须逐字节不变。
- R3 保持零外部请求：最小样式仍以 `<style is:inline>` 内联在页面中。
- R4 跳转行为与降级内容不变：`meta refresh`、canonical、`noindex, follow`、可见提示文字与链接完全保留。
- R5 不改设计页、设计 CSS、字体、菜单、脚本或 `astro.config.mjs`。
- R6 亮色 / 暗色下视觉与当前跳转页一致：文字居中、卡片链接外观不变。

## Acceptance Criteria

- [x] A1 28 个跳转页总量 ≤ **50,000 B**（基线 119,080 B）；单页 ≤ **2,400 B**（基线 4,248 B）；单页内联样式 ≤ **1,200 B**（基线 3,735 B）。
- [x] A2 根 `index.html`、5 个语言入口、5 个切换页、`404.html` 的 HTML 与改动前逐字节一致。
- [x] A3 全部 28 个跳转页仍输出正确的 `meta refresh` 目标与 canonical（默认语言目标），无 JS 时仍显示提示与链接。
- [x] A4 `npm run build`、`npm test` 通过；浏览器实测亮/暗色桌面与 375px，提示文字居中、链接卡片外观与基线截图一致。
- [x] A5 `docs/verification/` 记录前后字节、哈希比对与截图。

## Out of Scope

- 改为真正 301 / 平台重定向配置。
- 外置 CSS 或新增运行时请求。
- 修改 `InfraStyles` 的完整页面样式或任何设计页。

## Open Questions

无。
