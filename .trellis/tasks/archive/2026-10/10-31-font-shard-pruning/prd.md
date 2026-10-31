# Prune unused font shards to shrink dist below 15 MB

## Goal

在不修改任何字体文件、不改变页面排版和可见文案的前提下，把最终 `dist` 从约 33.5 MB 降到 **≤ 15 MiB**。新增构建期字体裁剪步骤，让 fork 用户只需从既有字体仓库下载锁定字体，构建时自动按当前站点文本裁剪，不再需要本地字体环境。

语言扩展实现暂停；本任务只处理体积。

## Confirmed Facts

- 当前 `dist` ≈ 33.5 MB：字体 21.37 MB / 611 个分片，HTML 11.31 MB（其中 9.06 MB 为重复内联 `@font-face` CSS），共享 CSS 0.53 MB，头像 0.30 MB。
- 三个 core-cjk family 占 20.9 MB：LXGW 13.06 MB / 328 分片，Zhuque 5.65 MB / 161，Ark Pixel 1.20 MB / 55。
- 全站可见文本只有 1,031 个不同码位；按分片 `unicode-range` 命中约 229 个分片、8.13 MB。
- 只删除未命中规则和分片的模拟结果为 15.08 MB，刚好超过 15 MiB；因此本任务同时需要把保留的 `@font-face` 规则外置为共享 CSS。
- `@font-face` 目前只出现在 HTML 内联 `<style>` 中，共享 CSS 与 preload 均没有字体声明。
- `fonts:prepare` 只从外部字体目录下载生产包，不依赖本地字体；`fonts:lock` / `fonts:check` 的完整性校验必须保持不变。
- 不修改字体文件，因此不触发 OFL Reserved Font Name 的“修改字体”问题。

## Requirements

### R1 · 按构建文本裁剪分片

- 新增构建期步骤，扫描最终 `dist` 的全部文本资产（HTML / CSS / JS / JSON / SVG / XML / TXT 等文本文件）。
- 语料必须覆盖可见正文、`title` / `aria-label` / `alt` / `placeholder` 等属性、内联 JSON/JS 字符串、CSS `content`、HTML 实体和 CSS Unicode 转义。
- 对每个页面独立判定：保留与该页文本命中的 `@font-face` 规则；没有 `unicode-range` 的规则始终保留。
- 字体文件按**全站保留集合**处理：任何页面仍需要的分片必须保留；没有任何页面需要的分片删除。
- 删除范围只限 `dist/_astro/fonts/` 下的字体文件，不得删除其他资源。

### R2 · 删除未使用的 `@font-face` 规则

- 从每页内联 `<style>` 中删除未命中的 `@font-face` 规则；保留 `--font-*` 变量和其他 CSS。
- `<style>` 删除后为空时移除该标签。
- 重写后的页面可见文本必须与重写前逐字一致；任何文本变化都视为失败。

### R3 · 字体 CSS 外置

- 将每页保留的 `@font-face` 规则写入共享的哈希 CSS 文件，并在该页 `<head>` 中以 `<link rel="stylesheet">` 引用。
- 同一字体族集合的页面（例如同一设计的三种语言版本）必须复用同一个 CSS 文件，包内是这些页面所需规则的并集，减少重复字节并利用浏览器缓存。
- 外置 CSS 只包含 `@font-face` 规则，不聚合设计样式；不得把不同设计的普通 CSS 合并。
- 必须正确处理 `base` 前缀（例如 `/demo/`），不得生成失效链接。

### R4 · 审计与失败级别

- `fonts:audit` 改为校验**裁剪后的部署集合**：
  - 每个页面引用的字体 URL 必须真实存在；
  - 每个页面中由源字体覆盖的 CJK 字符，在裁剪后仍必须被该页保留的规则覆盖；否则构建失败；
  - 源字体本身缺字仍按现有策略警告并写报告；
  - `dist/_astro/fonts/` 中不得留下无人引用的字体文件。
- 新增测试证明“故意删除仍被需要的分片”会让审计失败。

### R5 · 体积门禁

- 完成裁剪和外置后计算整个 `dist` 字节数；超过 **15 MiB** 必须构建失败并输出体积报告（包含最大文件与字体统计）。
- 体积统计口径固定为全部文件字节数之和，1 MiB = 1,048,576 字节。

### R6 · fork / CI 可复现

- 保持现有流程：`npm run fonts:prepare` 从字体仓库下载并校验锁定字体，然后执行构建。
- 不新增运行时或构建期第三方依赖；不要求 fork 用户安装本地字体或 Python 字体工具。
- 裁剪结果必须由 `dist` 内容和构建文本确定性决定，不得包含时间戳或机器路径。

### R7 · 验证与文档

- 按 `design-page-verify` skill 验证共享机制改动，覆盖样式隔离、多语言、字体请求、无 404 和核心字体实际命中。
- 验证记录更新到 `docs/verification/shared.md`。
- 更新构建/字体规则文档、`SPEC.md` 中受影响的事实、`CONTEXT.md` 的字体领域术语；如版本号变化则新增 change-log。
- 记录新构建步骤、体积目标和 fork 使用方式。

## Non-goals

- 不做字形级子集化（Q18 的 B/C），不修改字体字节，不引入 `pyftsubset` / `cnFontSplit`。
- 不新增语言、不实现 design locale coverage、不改变 `i18n` 行为。
- 不修改设计页面、不改字体 family、不改排版。
- 不优化头像 PNG、预览渲染或设计 CSS；如 15 MiB 仍达不到，再单独评估。
- 不改变字体目录锁、版本或 `fonts:prepare` 的下载语义。

## Acceptance Criteria

- [ ] `npm run build` 成功，最终 `dist` ≤ 15 MiB。
- [ ] 字体分片由 611 个降到约 250 个，字体体积由 21.37 MB 降到约 8.7 MB；HTML 中不再有重复的整份字体 CSS。
- [ ] 代表页面（LXGW / Zhuque / Ark Pixel / Latin-only / 切换页）无字体 404，可见文本与裁剪前完全一致，核心字体在正常排版中实际命中。
- [ ] `npm run fonts:audit` 在裁剪后通过；人为删除一个仍被需要的分片时审计失败。
- [ ] `npm run check`、`npm run test`、HTML-only 门禁全部通过。
- [ ] 带 `base=/demo` 的构建 + 裁剪通过，页面字体链接有效。
- [ ] fork 流程 `npm ci && npm run fonts:prepare && npm run build` 不需要本地字体，准备后断网构建可通过。
- [ ] `docs/verification/shared.md`、构建/字体规则、`SPEC.md`、`CONTEXT.md` 已更新，且记录本任务的体积与验证证据。

## Constraints

- 目标上限是硬要求：≤15 MiB；如果实现后仍超出，优先再压缩字体 CSS/HTML，而不是放宽阈值。
- 所有字体资产仍必须自托管、无第三方 URL；不得引入 CDN。
- 必须保持 `fonts:typography` 的字体栈与 CJK 顺序门禁。
- 设计页与 HTML-only 的现有渲染契约不得改变。
