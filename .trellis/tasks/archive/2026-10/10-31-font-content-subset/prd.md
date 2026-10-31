# Subset core CJK fonts to the site text corpus

## Goal

在已提交的分片裁剪基础上，把三套核心 CJK 字体从部署分片替换为**按当前站点文本生成的单一字形子集**。目标：核心字体由 7.85 MiB 降到约 0.7 MiB，整个 `dist` 从 13.85 MiB 降到 **≤10 MiB**（预期 5.5–6.5 MiB），同时保持 fork 构建可复现、准备后离线构建、页面排版不变。

依赖：父任务 `10-31-font-shard-pruning` 已提交（`eefdbc1`），当前 `fonts:prune`、部署集合审计和 15 MiB 门禁已存在。

## Confirmed Facts

- 当前字体 8.72 MiB / 247 分片；LXGW 4.00、Zhuque 3.04、Ark Pixel 0.81，其余 0.87 MiB。
- 全站最终文本约 1,261 个不同字符；分片粒度导致核心字体携带约 4 万个字形槽。
- 外部字体目录已有三套核心字体的 source archive；`fonts.lock.json` 已记录 source 指针、SHA-256 与大小；`fonts:prepare` 当前只下载生产包。
- `subset-font@2.9.0`（BSD-3-Clause，HarfBuzz WASM）实测三套源字体子集为 272,948 / 382,396 / 35,964 B，合计 691,308 B；保留全部 OpenType layout features，输出 WOFF2。
- `fontkitten@1.0.3`（MIT）可直接解析 WOFF2 的 `characterSet`，用于校验子集覆盖。
- LXGW 有 web-only subset 附加许可；Zhuque / Ark 无 Reserved Font Name。子集只作为 Web WOFF2 交付，不发布可安装桌面字体。

## Requirements

### R1 · 源字体下载与离线校验

- `fonts:prepare` 为 `role: core-cjk` 的 family 下载 catalog 的 source archive，验证外层 SHA-256 / 大小，解析 USTAR，验证 `source-manifest.json`、source font 与 license 的哈希/大小，然后安装到 `.cache/font-sources/<catalogVersion>/<id>@<version>/`。
- 已有完整 source cache 只复核不重下；`--offline` 禁止网络，缺失时给出明确的 `fonts:prepare` 修复提示。
- `fonts:check` 完全离线校验 source cache（marker、source font、license、source manifest），失败必须阻断构建。
- 不修改 `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`；source 指针已在 lock 中。

### R2 · 构建期内容子集

- 新增 `fonts:subset`，在 `astro build` 之后、`fonts:prune` 之前运行。
- 扫描最终 `dist` 的全部文本资产（HTML/CSS/JS/JSON/SVG/XML/TXT），解码 HTML 实体与 CSS 转义，生成全站语料。
- 对每个 core family 的每个 source font，用 `subset-font` 生成一个 WOFF2 子集（保留全部 layout features），写到 `dist/_astro/fonts/<family-id>-subset-<hash>.woff2`。
- 逐页重写内联 `@font-face`：把该页上属于 core family 的全部分片规则替换为一条指向子集文件的规则，保留 `font-family`（Astro 哈希后的名字）、`font-weight` / `font-style` / `font-display`，移除 `unicode-range`。
- 页面可见文本在重写前后必须逐字一致；不一致时中止且不删除任何字体文件。
- 支持 `--dry-run`、`--dist`，写 `.cache/fonts/subset-report.json`（包含 catalog/source/corpus/subsetter 版本与哈希、输出大小与覆盖字符数，不含时间戳或机器路径）。
- 子集文件必须由“源字体 + 语料 + 固定 subsetter 版本”确定性生成；重复运行同一输入产生相同哈希。

### R3 · 与 prune / 体积门禁衔接

- `fonts:prune` 在 subset 之后运行：外置保留规则、删除所有已无引用的核心分片，并保留非核心字体的既有裁剪逻辑。
- 体积门禁从 15 MiB 收紧为 **10 MiB**；`dist` 全部文件字节超过 10 MiB 即构建失败。
- 最终代表页面的字体请求应从 30+ 分片降为 1 个核心字体文件；不得出现悬空 URL 或孤儿字体文件。

### R4 · 审计改为子集覆盖

- `fonts:audit` 对无 `unicode-range` 的 core family 规则，用 `fontkitten` 读取子集 WOFF2 的 `characterSet`，而不是当作 `coversAll`。
- 页面 CJK 文本若源字体覆盖但子集文件不覆盖，构建失败（子集漏字）；源字体本身缺字仍按现有策略警告。
- 保留悬空 URL、孤儿分片、第三方 URL 与机器路径检查。

### R5 · fork / CI

- 干净 clone 流程仍为 `npm ci && npm run fonts:prepare && npm run build`；prepare 会额外下载三套 source archive（约 20 MB 压缩），之后构建完全离线。
- 不要求 Python、fontTools 或本地字体目录；`subset-font` / `fontkitten` 作为固定版本的 Node 依赖。
- source cache 入 `.cache/`，不入库；CI 按 lock/source 哈希复用。

### R6 · 许可与 provenance

- source cache 保留 source archive 的 license 文件与 `source-manifest.json`；子集只做 Web WOFF2 交付。
- 新增 ADR 0014 记录“源字体保持完整、部署使用内容子集”的取舍、许可依据与被否决方案；更新 ADR 0013 的后续关系。
- `docs/fonts/`、`README.md`、`SPEC.md`、`CONTEXT.md`（Deployment subset set）、`docs/verification/shared.md`、change-log 同步更新。

### R7 · 验证

- `npm run build`、`npm run check`、`npm test`、`npm run fonts:check`（含 source cache 离线校验）、`npm run fonts:audit` 全绿。
- 代表页面（LXGW / Zhuque / Ark / Latin-only / 切换页）无字体 404，核心字体正常命中，可见文本不变。
- `--base /demo` 构建 + subset + prune 通过，链接与字体 URL 带 `/demo`。
- 375px 触控、减动态、无 JS 至少做一次共享机制回归；无法执行时在验证记录中如实标注。

## Non-goals

- 不对 17 个非核心展示字体做字形子集化（它们合计约 0.87 MiB，后续可单独评估）。
- 不改设计页面、文案、设计 CSS、字体 family 或字体栈。
- 不新增语言、不改 i18n、不实现 design locale coverage。
- 不把 source archive 或子集字体提交到 Git；不改变 catalog/lock/generated 的内容。
- 不追求低于 5 MiB 的极限；若 10 MiB 仍超出，优先检查重复 HTML/预览，而不是放宽阈值。

## Acceptance Criteria

- [ ] `fonts:prepare` 能下载/验证三套 source archive；`--offline` 与 `fonts:check` 能完全离线复核 source cache。
- [ ] `fonts:subset` 生成三个子集文件，核心字体合计 ≤1.2 MiB（预期 ~0.7 MiB）。
- [ ] 最终 `dist` ≤10 MiB；代表页面核心字体请求为 1 个文件，无 404。
- [ ] 105/105 页面可见文本与 subset 前一致；字体 CSS 中 core family 只剩一条子集规则。
- [ ] `fonts:audit` 用子集 cmap 校验覆盖；故意删掉一个子集字形或让子集漏字时审计失败。
- [ ] `npm run build` / `npm run check` / `npm test` / `fonts:check` / `fonts:audit` 全部通过。
- [ ] `--base /demo` 构建 + subset + prune 通过，字体链接带 `/demo`。
- [ ] fork 流程准备后断网构建通过；无 Python/本地字体依赖。
- [ ] ADR 0014、CONTEXT、README、SPEC、operations、selection-guide、verification/shared、change-log 已更新。
- [ ] 375px / 减动态 / 无 JS 至少完成一次回归，或明确记录未测原因。
