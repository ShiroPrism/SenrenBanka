# 韩语全设计覆盖

> 父任务。子任务：`11-01-korean-fonts-release`（字体调研与字体仓库发行）、`11-01-korean-font-integration`（主站字体接入与排版覆盖门禁）。22 套韩语文案与页面待字体层完成后另建子任务。

## Goal

把韩语从首批 5 套设计扩展到全部 27 套，并同时满足两个独立覆盖维度：

1. **Design locale coverage**：每套设计有经人工审校的韩语界面文案与可访问的 `/<ko>/<design>/` 页面。
2. **Locale typography coverage**：每套 `styled` 设计用已部署 webfont 接管谚文呈现，不允许系统韩文字体回退静默顶替。

`html-only` 因零字体契约在排版维度豁免，但仍需满足文案/页面覆盖。

本父任务拥有需求集、子任务映射、跨子任务验收标准与最终集成审查；不直接承担实现。

## 现状

- 27 套设计（26 styled + 1 html-only）；韩语目前只有 5 套：`editorial`、`fast`、`frost`、`govuk`、`html-only`。
- 部署字体中只有 LXGW WenKai 带谚文（11,172 个音节）；Zhuque、Ark Pixel、17 个 fixed、6 个 npm family 均为 0 谚文。
- 字体仓库 catalog v1.0.0 共 20 族，无韩语；`role` 只有 `core-cjk` / `fixed`。
- 当前 `dist` 5,147,903 B（4.91 MiB）；10 MiB 硬门禁。
- `site.config.yaml` 已有 `ko.fontProfile: korean`；`CONTEXT.md` 已定义 `Locale typography coverage` 与收紧后的 `Core CJK font`。

## 覆盖定义

- **Design locale coverage**：只描述文案与页面可达性，不描述字体呈现。
- **Locale typography coverage**：某套设计在某个 Locale 下用已部署 webfont 接管该语言文字系统；字体缺口不得用系统回退静默顶替。
- 两个维度分别验收；不得用一个维度的通过掩盖另一个维度的缺口。
- `html-only` 在 typography 维度按 `renderMode` 豁免；其余 26 套 styled 设计两者都要满足。

## Requirements

### R1 字体层（本阶段）

- 在 `whitehair-failure/SenrenBanka-fonts` 发布 6 个韩语核心族，全部 `OFL-1.1`、无 RFN、单 Regular face：
  - Gothic A1（中性无衬线基线）
  - Gowun Batang（衬线/明朝体）
  - Galmuri11（韩文像素）
  - Noto Sans Mono CJK KR（韩文等宽）
  - Dongle（圆体/可爱）
  - Poor Story（手写/马克笔）
- 复用 `role: core-cjk`，不新增 `core-script`；catalog 发 v1.1.0，6 个新族各发 v1.0.0。
- descriptor/manifest 增加 `scripts: ["hangul"]`（additive）；现有族按 `["cjk"]` 处理。
- 每族提供完整 source archive、许可证、SHA-256、双构建复现与发布资产。

### R2 主站字体接入（本阶段）

- `fonts.config.json` / `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts` 锁到 catalog v1.1.0。
- `fonts:subset` 对 `scripts: hangul` 的族只按 Hangul 区块裁剪，并生成 Hangul-only `unicode-range` 子集规则。
- 韩语伴生族排在 LXGW / 中文核心之前，确保 6 套 LXGW 设计的韩文不被 LXGW 抢先命中；`unicode-range` 同时防止带 Hanja 的韩文字体劫持汉字。
- 26 套 styled 设计的字体栈加入对应韩语伴生族；5 套现有 ko 设计同时注册 `<Font>`：
  - `editorial` → Gowun Batang（替换 LXGW 韩文）
  - `frost` / `fast` / `govuk` → Gothic A1
  - `html-only` → 不变
- 其余 22 套只加 CSS 伴生变量；`Font` 注册与 ko 页面在内容子任务里一起加，避免非 ko 页面预加载韩文字体。

### R3 覆盖门禁（本阶段）

- `fonts:audit` 增加 Hangul 区块（U+AC00–D7A3、U+1100–11FF、U+3130–318F、U+A960–A97F、U+D7B0–D7FF、U+FFA0–FFDC）。
- `fonts:typography` / 新 `fonts:coverage` 建立硬门禁：
  - `design.json.locales` 含 `ko` 的 styled 设计，所有字体栈必须包含 Hangul 能力核心变量；
  - 页面必须注册对应 `<Font>`；
  - `html-only` 按 `renderMode` 豁免；
  - 缺角色或注册 → 构建失败；源字体缺字 → 警告 + 报告。
- 门禁必须能捕获「CSS 有韩语变量但页面未加载 Font」和「纯系统字体栈漏加韩语变量」两类缺口。

### R4 验证与文档（本阶段）

- 四语构建、`fonts:subset`、`fonts:prune`、`verify:html-only`、`fonts:audit` 全部通过；`dist` ≤ 10 MiB。
- 5 套现有 ko 页面执行 `design-page-verify`（桌面、375px、菜单、降级、可访问性、对比度、截图）。
- 新增 ADR 0017，替代 ADR 0016 的 Noto KR 计划；更新 `docs/rules/*`、`SPEC.md`、`docs/verification/*`、`design-page-verify` 的 ko 检查。
- 交付一份给内容子任务的「设计 → 韩语族」映射与接线清单。

### R5 内容层（后续子任务）

- 为剩余 22 套设计增加 `design.json.locales` 的 `ko`、`messages.ts` 韩语块、`descriptions.ts` 韩语描述与 `<Font>` 注册。
- 韩语文案必须人工审校；未审校机翻不得作为承诺文案。
- 不改字体仓库与字体管线；只做内容与接线。

## 子任务映射

| 子任务 | 交付 | 验收 |
|---|---|---|
| `11-01-korean-fonts-release` | 6 个韩语核心族 + catalog v1.1.0 + source/license/哈希/复现证据 | 6 个 family release 与 catalog v1.1.0 可复现、可下载、catalog SHA 固定 |
| `11-01-korean-font-integration` | 主站锁到 v1.1.0、Hangul-only 子集/审计/门禁、26 套设计字体栈、5 套 ko 页面验证 | 四语构建通过、5 套 ko 页面字体正确、门禁生效、dist ≤ 10 MiB |
| `11-01-korean-content-rollout` | 22 套韩语文案/页面/Font 注册（已实现，文案已审校） | 27 套 Design locale coverage 全通过 |

依赖顺序：字体发行 → 主站接入 → 内容扩覆盖。父任务不是实现目标。

## 跨子任务验收标准

- [ ] catalog v1.1.0 含 26 族；6 个新族均 `core-cjk`、`scripts: ["hangul"]`、`OFL-1.1`、无 RFN；双构建逐字节一致。
- [ ] 主站锁到 v1.1.0，`fonts:prepare` / `fonts:check` 离线复核通过。
- [ ] 5 套现有 ko 页面韩文由声明的韩语族渲染（不是系统回退）；editorial 不再命中 LXGW 谚文。
- [ ] 26 套 styled 设计均有「设计 → 韩语族」映射；`fonts:typography` / `fonts:coverage` 对 ko 设计硬门禁生效。
- [ ] `fonts:audit` 覆盖 Hangul 区块；无悬空 URL、无孤儿字体文件、无部署缺字。
- [ ] 四语 `dist` ≤ 10 MiB；字体子集与页面体积记录入 `docs/verification/`。
- [ ] 5 套 ko 页面 `design-page-verify` 通过；桌面与 375px 截图归档。
- [ ] ADR 0017、rules、SPEC、verification、design-page-verify 的 ko 描述同步。
- [ ] 内容子任务无需再改字体仓库或字体管线即可为 22 套设计添加 ko。

## Out of Scope

- 22 套韩语文案与页面（后续子任务）。
- Noto Sans KR / Noto Serif KR、Black Han Sans、D2Coding / Pretendard（已评估并暂缓）。
- 修复字体仓库 `renameSfntFont`（独立工具链任务）。
- 韩语以外的非 CJK 文字系统；新增 `core-script` role。
- 运行时字体/语言切换；提高 10 MiB 门禁。

## Risks

- **许可/RFN**：6 族虽均为无 RFN OFL，仍需逐族保存许可证据与源文件哈希；Noto Sans Mono CJK KR 使用 noto-cjk 资产而非 Google Fonts VF（后者声明 RFN 'Source' 且默认 Thin）。
- **单 face 限制**：每族只发 Regular，韩文标题依赖合成粗体；验收目检不合格需扩到两 face。
- **Hanja 与排序**：韩文字体可能覆盖 Hanja；必须依赖 Hangul-only `unicode-range`，不能只靠字体栈顺序。
- **预加载**：`<Font>` 可能预加载字体；非 ko 设计暂不注册，避免无谓下载。
- **来源固定**：Google Fonts 是移动分支，必须 pin commit；Galmuri/Noto 使用不可变 Release 资产。
- **构建期体积**：新增 6 个 source archive，`fonts:prepare` 下载量增加；只影响构建缓存，不影响访客 `dist`。
- **门禁盲区**：现有 `typography.mjs` 只检查含 `--font-*` 的栈，且硬编码 20 families / 26 styled；必须扩展并补测试。

## Notes

- 调研矩阵与实测数据见 `11-01-korean-fonts-release/research/korean-font-candidates.md`。
- 决策记录见 `docs/adr/0016-korean-first-batch-fonts.md`（被替代）与 ADR 0017。
- 用户已确认：六族选型、设计映射、Noto Sans Mono CJK KR 作为 mono、Regular 单 face、`scripts` 元数据放在字体仓库 descriptor/manifest、公开 Release 前保留检查点。

## 最终集成审查（2026-11-01）

- 27 套设计：27 个 `/ko/<id>/` + `/ko/designs/` 27 条；`fonts:coverage` 27；`descriptions.ts` 27 条 ko；22 套新增 + 5 套既有；韩语文案已人工审校（用户确认 2026-11-01）。
- C3 构建 **146 页**、`dist` **6,056,936 B（5.78 MiB）**、字体 **40 / 1,775,340 B**、核心子集 **9 / 863,756 B**（6 个韩语族各 454 字符）、`fonts:audit` 556 规则 / 0 孤儿 / 0 部署缺口 / 60 条源字体缺字警告、`npm test` 74/74、`npm run check` 0 error。
- 22 个新 ko 页在 375×812 / 1280×800 冒烟全通过；6 族抽样截图；C2 5 页字体冒烟/截图。完整 27 页菜单/无 JS/对比度/动效全矩阵未重跑，作为后续 design QA，不影响字体/文案覆盖验收。
- 字体仓库 `bab1a4f` 已 push + catalog v1.1.0 发布；主站 `2447de2` + `fa44b73` 本地提交，未 push。C1/C2/C3 归档。
