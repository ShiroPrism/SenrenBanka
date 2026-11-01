# 主站韩语字体接入与排版覆盖门禁

> 父任务：`11-01-korean-full-coverage`。前置：`11-01-korean-fonts-release` 已发布 catalog v1.1.0。

## Goal

把字体仓库 catalog v1.1.0 接入主站；把 6 个韩语核心族变成 Hangul-only 部署子集；为 26 套 styled 设计建立「设计 → 韩语族」字体栈；用硬门禁保证 `design.json` 声明 `ko` 的设计真正由韩语字体渲染；完成 5 套现有 ko 页面的验证。

## 前置与依赖

- C1 handoff：catalog v1.1.0 URL + SHA-256 + 6 族资产/源哈希/许可证据。
- 未取得 catalog SHA 前，不得手写 `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`。
- 本任务不新增韩语文案与页面；只做字体层与门禁。

## Requirements

### R1 Catalog 锁与缓存

- **兼容前置**：主站 `scripts/fonts/lib/schema.mjs` 的 `catalogFamilySchema` 与 `familyManifestSchema` 目前 `.strict()` 且没有 `scripts`；先加可选 `scripts: ["cjk" | "hangul"]` 并补测试，否则 `fonts:update` / `fonts:prepare` 会拒绝 catalog v1.1.0。
- `fonts.config.json` 增加 6 个 family：
  - `gothic-a1` / `--font-gothic-a1`
  - `gowun-batang` / `--font-gowun-batang`
  - `galmuri11` / `--font-galmuri11`
  - `noto-sans-mono-cjk-kr` / `--font-noto-sans-mono-cjk-kr`
  - `dongle` / `--font-dongle`
  - `poor-story` / `--font-poor-story`
- `npm run fonts:update -- --catalog-url <v1.1.0 catalog URL> --catalog-sha256 <SHA>` 更新 lock/snapshot/generated。
- `npm run fonts:prepare` 下载 6 个生产包 + source archive；`npm run fonts:check` 离线复核。
- 不手改生成文件；不自动追 latest。

### R2 Hangul-only 子集与路由

- `scripts/fonts/subset.mjs`：
  - `coreFaces()` 读取 `scripts`，返回 `scripts` 给子集步骤。
  - 对 `scripts` 含 `hangul` 且不含 `cjk` 的族：只按 Hangul 码位生成子集；`syntheticRule` 带 Hangul-only `unicode-range`。
  - 对 `scripts` 含 `cjk` 的族：保持现有全语料、无 `unicode-range` 行为。
  - `subset-report.json` 记录每族的 scripts、子集码位范围、字节、哈希。
- `scripts/fonts/prune.mjs`：验证带 `unicode-range` 的韩语子集规则按页保留/裁剪；无孤儿文件。
- 韩语族在设计字体栈中排在 LXGW / 中文核心之前。

### R3 Hangul 审计

- `scripts/fonts/audit.mjs`：
  - `HANGUL_RANGES`：U+1100–11FF、U+3130–318F、U+A960–A97F、U+AC00–D7A3、U+D7B0–D7FF、U+FFA0–FFDC。
  - 部署规则/子集必须覆盖页面上的 Hangul 字符；源字体覆盖但部署缺失 → 失败；源字体缺字 → 警告。
  - 报告标签从「CJK」扩展为「CJK/Hangul」或 `core script`。
- 0 悬空 URL、0 孤儿字体文件。

### R4 排版覆盖门禁

- `scripts/fonts/typography.mjs`：
  - `CORE_FONT_VARIABLES` 增加 6 个韩语变量。
  - `SYSTEM_CJK_FONTS` 增加 `apple sd gothic neo`、`malgun gothic`、`noto sans kr`、`noto serif kr`（以及设计实际使用的韩文系统字体）。
  - 硬编码 `generated.count !== 20` → `26`；`styledCount !== 26` 保持。
  - 错误文案从「core CJK」改为「core script」。
  - 新增/扩展检查：`design.json.locales` 含 `ko` 的 styled 设计，**每条** `font-family` / `font` 声明必须包含一个 Hangul 能力核心变量，并位于系统韩文/中文回退之前。
- 新增 `scripts/fonts/coverage.mjs`（或等价入口）：
  - 读 `site.config.yaml` 的 `fontProfile`，映射 `korean → hangul`、`cjk → cjk`、`latin/vietnamese → 无核心要求`。
  - 对每个 `design.json.locales` 中的 locale，验证设计 CSS 的字体栈与 `Page.astro` 的 `<Font cssVariable>`。
  - `html-only` 按 `renderMode` 豁免。
  - 缺角色/缺注册/声明 ko 但无韩语字体 → 失败。
- 把门禁接入 `npm run check` 或 `npm run build` 的前置链；失败信息带 `[senrenbanka:fonts]` 前缀。
- 补测试：纯系统栈漏加韩语变量、CSS 有变量但未注册 Font、html-only 豁免、非 ko 设计不强制。

### R5 设计字体栈

- 26 套 styled 设计按映射加入韩语伴生变量：
  - Gothic A1：brutal, fast, frost, govuk, homepage99, kern, material3, poster
  - Gowun Batang：archive, deco, editorial, ink, lexicon, little-forest
  - Galmuri11：pager, pixel-pet-rpg, radio, receipt
  - Noto Sans Mono CJK KR：fax, oxide, terminal
  - Dongle：cute-alism, fairy-kei, magical-girl
  - Poor Story：sticker-diary, tape
- 顺序：拉丁/展示 → 韩语伴生 → CJK 核心 → 系统韩文 → 系统中文/日文 → 通用族。
- 5 套现有 ko 设计同时注册 `<Font>`：
  - `editorial`：`--font-gowun-batang`
  - `frost` / `fast` / `govuk`：`--font-gothic-a1`
  - `html-only`：不变
- 其余 22 套只加 CSS 变量，不加 `<Font>`；内容子任务再加。
- 预览样式（`Preview.astro` / preview CSS）与正式页共享 typography 门禁，必须同步。

### R6 验证与文档

- `npm test`、`npm run check`、`npm run build`、`npm run verify:html-only`、`npm run fonts:audit` 通过。
- 四语 `dist` ≤ 10 MiB；记录字体文件数/字节、核心子集字节、最大文件。
- 5 套现有 ko 页面执行 `design-page-verify`：桌面、375px、菜单、无 JS/减动态、对比度、截图归档。
- 新增 ADR 0017（替代 ADR 0016 的 Noto 计划）；更新 `docs/rules/operations.md`、`data-and-i18n.md`、`design-contract.md`、`visual-language.md`、`SPEC.md`、`docs/verification/*`、`.agents/skills/design-page-verify/SKILL.md` 的 ko 检查。
- 输出内容子任务的接线清单：设计 → 韩语族 → CSS 变量 → `<Font>` → 待加 `ko` 的 `messages.ts` / `descriptions.ts`。

## Acceptance Criteria

- [ ] `fonts.config.json` / lock / catalog / generated 锁到 catalog v1.1.0；6 族均有 1 个主 face。
- [ ] `fonts:prepare` / `fonts:check` 通过；6 个 source archive 已校验。
- [ ] `fonts:subset` 为 6 个韩语族生成 Hangul-only 子集与 `unicode-range`；`subset-report.json` 记录 scripts/范围/字节。
- [ ] `fonts:prune` 不保留非 ko 页面上的韩语规则，不产生孤儿文件。
- [ ] `fonts:audit` 覆盖 Hangul；0 悬空、0 孤儿、0 部署缺字。
- [ ] `fonts:typography` / `fonts:coverage` 对 ko 设计硬门禁生效；`html-only` 豁免；纯系统栈缺口会失败。
- [ ] 26 套 styled 设计均有韩语伴生变量；5 套现有 ko 页面韩文由声明字体渲染。
- [ ] 四语构建成功；`dist` ≤ 10 MiB（预计 ~5.35 MB）。
- [ ] 5 套 ko 页面 `design-page-verify` 通过；截图归档。
- [ ] ADR 0017、rules、SPEC、verification、design-page-verify 同步。
- [ ] 内容子任务只加文案/locale/`<Font>` 即可，不需再改字体管线。

## Out of Scope

- 22 套韩语文案与页面。
- 字体仓库的 descriptor/source/Release（C1）。
- Noto Sans/Serif KR、Black Han Sans、D2Coding、Pretendard。
- 修复 `renameSfntFont`。
- 运行时语言/字体切换；提高 10 MiB 门禁。

## Risks

- **门禁漏检**：现有 typography 只检查含 `--font-*` 的栈；必须扩展为 ko 设计的全栈检查，否则纯系统栈会漏。
- **预加载**：Astro `<Font>` 可能预加载；非 ko 设计暂不注册，需实测确认。
- **子集/裁剪**：Hangul-only 规则带 `unicode-range`，`prune` 的逐页保留逻辑需验证。
- **孤儿子集**：6 个韩语族中只有 2 个被当前 ko 页面使用；`fonts:subset` 可能生成未使用子集，需由 `prune`/`audit` 清理。
- **CJK 顺序**：韩语变量必须在 LXGW/中文核心之前；放错会让韩文命中 LXGW 或让带 Hanja 的韩语族劫持汉字。
- **合成粗体**：韩文标题的合成粗体可能不理想；验收目检，必要时扩两 face。
- **字体仓库依赖**：catalog SHA/资产未发布前无法完成 lock；不得伪造。

## Notes

- 调研矩阵：`11-01-korean-fonts-release/research/korean-font-candidates.md`。
- 字体仓库 handoff：`11-01-korean-fonts-release/research/handoff.md`（C1 产出）。
- 现有 `typography.mjs` 硬编码 20 families / 26 styled；`audit.mjs` CJK 范围不含 Hangul；`subset.mjs` 合成规则不带 `unicode-range`。这三处是本任务的核心改动。

## 实施记录（2026-11-01）

- catalog v1.1.0 接入：26 族 / 939 variants；6 个韩语族 config/lock/snapshot/generated；Hangul-only 子集 + `unicode-range`；审计按 script；`fonts:coverage` 接入 `check`。
- 26 套设计字体栈、5 套现有 ko 设计 `<Font>`；C2 构建 **124 页**、`dist` **5,253,947 B**、字体 **36 / 1,642,072 B**、核心子集 **9 / 795,032 B**、`fonts:audit` 0 部署缺口、`npm test` 74/74、`npm run check` 0 error；commit `2447de2`（本地）。
- 5 套 ko 页面：字体冒烟 + 桌面/375 截图；完整菜单/无 JS/对比度/动效矩阵未重跑（C3 的 22 页 375/1280 冒烟补足新页面；全 27 页完整矩阵作为后续 design QA）。
