# 主分区标准标签：共享词表与主题词分离

## Goal

27 套设计的主分区 h2 统一使用共享 canonical 标准标签（简介 / 项目 / 经历 / 技能 / 联系 / 链接）；主题词只能作为 heading 之外的可见 kicker / 副标题或装饰。建立共享词表、`data-section` 契约与构建后校验，分批修复存量并防止回归。

## Background

- `docs/rules/design-contract.md`「信息架构与主题文案」于 2026-11-07（commit `4f43172`）随 `shelf` / `magical-girl` 退役加入；规则最后一句写明「既有主题按批次审计」，但审计尚未执行。
- 2026-11-09 全量审计 27 套设计：8 套全违规、9 套部分违规、1 套待定（editorial）、1 套结构违规（oxide）、8 套语义合规。证据见 `research/audit-2026-11-09.md`。
- 现有分区文案全部由各设计 `messages.ts` 自持，没有共享标准标签来源；`site.config.yaml` 与 `content.config.ts` 都不定义显示标签。
- 公开证据支持“分区标签属于信息架构，不属于视觉设计”：NN/g / UXmatters 的 wayfinding 研究、WCAG 2.4.6、CSS Zen Garden 的内容与表现分离。调研结论见会话记录与 `CONTEXT.md`。

## Decision

2026-11-09 项目所有者确认：

1. **h2 只留标准词**，主题词完全移出 heading；主题词可作为 heading 之外的可见 kicker / 副标题或装饰，且必须可选。
2. **主分区范围**：简介 / 项目 / 经历 / 技能 / 联系 / 链接六个；简介 hero 不强制 h2，若存在独立简介分区则使用标准标签。
3. **共享词表**：新增 `src/i18n/sections.ts`，所有设计 import 消费；主题词仍留各设计 `messages.ts`。`CONTEXT.md` 的 Shared messages / Design messages 定义同步修订。
4. **词表规则**：每语言一套 canonical + 小规模显式 alias 白名单；主题词不进入白名单。
5. **存量全部修复，不退役**；8 套语义合规设计仍需接入共享词表与 `data-section`，不做仅视觉层面的豁免。
6. **构建后校验**：主分区带 `data-section`，新增 `scripts/check-section-labels.mjs` 扫描 `dist`；19 套临时豁免逐批移除，最终为空。
7. **执行结构**：父任务 + S1 / S2 / S3 三个独立可验收的子任务。
8. **文档落点**：修订 `design-contract.md`；`AGENTS.md` 新增第 9 条硬门禁；新增 ADR 0023；更新 `design-page-verify` 与 `docs/verification/`。

## Requirements

### R1 — 共享标准标签词表

- 新增 `src/i18n/sections.ts`，纯数据模块，不 import CSS、`Page.astro` 或 `style.css`。
- 覆盖当前 5 个 Locale（zh-CN / zh-TW / ja / en / ko）× 6 个 `SectionKey`（profile / projects / experience / skills / contact / links）。
- 每项包含 `label`（当前语言 canonical）、`enLabel`（英文 canonical）与 `aliases`（显式白名单）。
- 词表是标准标签的唯一来源；设计不再在 `messages.ts` 自持标准标签。

### R2 — h2 渲染契约

- 每个已渲染非 profile 主分区的 `<h2>` 文本只能由 canonical / alias / 英文 canonical 词元组成；允许分隔符（`/`、`|`、`·`、`-`、`—`、空白），不允许主题词或其他文本。
- 主题词必须位于 h2 之外的可选元素（kicker 前置、subtitle 后置或装饰），不得承担 heading 语义。
- profile hero 允许没有 h2；若存在独立简介分区，使用标准标签。
- 分区仍必须有可访问名称（`aria-labelledby` 指向标准标签，或 `aria-label`），符合 `accessibility-responsive.md`。

### R3 — `data-section` 契约

- 每个主分区的 sectioning 元素（通常是 `<section>`，oxide contact 为 `<footer>`）增加 `data-section="<SectionKey>"`。
- 该属性只用于构建期校验，不产生样式、脚本或行为；`html-only` 允许使用。
- `design-contract.md` 明确记录该数据属性。

### R4 — 构建后校验

- 新增 `scripts/check-section-labels.mjs` 与单元测试；依赖为零或仅使用项目既有依赖，不引入浏览器运行时。
- 扫描 `dist/**/index.html`，按 `<html lang>` 选择 Locale，按路径识别设计 id；对每个 `[data-section]` 校验 h2 词元集合。
- profile 无 h2 时跳过；条件未渲染的分区不检查；`sr-only` h2 合法（终端的可见标准词模式）。
- 临时豁免清单 `scripts/section-labels.allowlist.json` 只允许 19 套待修设计；每次子任务删除对应 id，最终为空。
- 新增 `npm run verify:sections`，接入 `npm run build` 的 `astro build` 之后；检查失败必须让构建失败。

### R5 — 规则与决策文档

- 重写 `design-contract.md`「信息架构与主题文案」：六分区、h2 词元限制、主题词位置、共享词表、`data-section`、构建校验、存量审计状态。
- `AGENTS.md` 新增第 9 条硬门禁「主分区标准标签」，并更新“8 条”计数。
- `CONTEXT.md` 已加入 Primary section / Standard section label / Theme word（2026-11-09）。
- 新增 `docs/adr/0023-standard-section-labels.md`，记录共享词表、alias 白名单、`data-section` 与构建校验的取舍。
- 更新 `.agents/skills/design-page-verify/SKILL.md` 与 `docs/rules/operations.md` 的验证清单，加入标准标签与 `verify:sections`。
- 新增 `docs/verification/section-labels.md` 记录审计、批次与最终证据；历史验证记录不回写。

### R6 — S1 共享契约与合规设计迁移

- 创建共享词表、检查脚本、allowlist、规则 / ADR / AGENTS / verification 更新。
- 迁移 8 套语义合规设计：brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal。
- 这些设计 h2 文案不变，但改为消费共享词表并补 `data-section`；terminal 保留 `sr-only` h2 + 可见标准词模式。

### R7 — S2 全违规设计修复

- 修复 8 套：aero、deco、fairy-kei、ink、little-forest、sticker-diary、transit、zine。
- h2 改为标准标签；原主题词降为可选 kicker / subtitle；需要时微调 CSS 以保持标题区节奏。
- 删除这 8 套的 allowlist 条目。

### R8 — S3 部分违规与结构统一

- 修复 9 套部分违规：archive、fax、lexicon、pager、pixel-pet-rpg、poster、radio、receipt、tape。
- 结构统一 2 套：oxide（`<p>` 标签转 h2，英文主题词降 kicker）、editorial（`Elsewhere` 转标准 links 标签 + kicker；`Selected Works` 可按 alias 保留或统一为 canonical）。
- 删除剩余 allowlist 条目并清空清单；执行全量构建与浏览器验证。

### R9 — 验证与记录

- S1 / S2 / S3 每个子任务完成后运行：`npm run check`、`npm run build`、`npm run test`、`npm run verify:html-only`。
- 每套改动设计执行 `design-page-verify`：桌面实测、375px 触控仿真、减动态、无 JS 终态、双主题（如适用）、对比度、截图归档。
- `docs/verification/section-labels.md` 记录逐套证据与 allowlist 变化；各设计既有验证记录只追加当前批次，不回写历史。

## Acceptance Criteria

- [ ] `npm run build` 在 allowlist 为空时通过，`verify:sections` 覆盖所有 Locale × 所有已渲染设计页。
- [ ] 27 套设计的每个已渲染非 profile 主分区 h2 只含 canonical / alias 词元；无主题词-only h2。
- [ ] 主题词只出现在 h2 之外，且移除后页面仍成立。
- [ ] 每个主分区带 `data-section`；profile hero 无 h2 时通过。
- [ ] 共享词表覆盖 5 Locale × 6 SectionKey；alias 白名单已评审且不含主题词。
- [ ] `design-contract.md`、`AGENTS.md`、`CONTEXT.md`、ADR 0023、`design-page-verify`、`operations.md`、`docs/verification/section-labels.md` 已更新。
- [ ] S1 / S2 / S3 的 allowlist 条目按批次减少并最终为空。
- [ ] 不修改 profile schema、不退役设计、不改共享操作菜单、不给 `html-only` 增加 CSS / JS。
- [ ] dist 体积增量仅为 `data-section` 属性级别；字体与页面数基线不变。

## Task Map

| 任务 | 交付物 | 依赖 |
|---|---|---|
| S1 共享分区契约与合规设计迁移 | `src/i18n/sections.ts`、检查脚本、allowlist、规则 / ADR、8 套合规设计迁移 | 无 |
| S2 全违规设计修复 | 8 套全违规设计的 h2 + kicker + `data-section` | 依赖 S1 的共享词表与检查脚本 |
| S3 部分违规与结构统一 | 11 套部分 / 结构违规设计、清空 allowlist、全量验证 | 依赖 S1；可在 S2 之后或并行（文件集不重叠） |

## Non-Goals

- 不重新设计各套视觉语言；主题词仍可保留为 kicker。
- 不把主题词从页面彻底删除；只移出 heading。
- 不修改 `src/data/profiles/*` 或 `content.config.ts` 的字段契约。
- 不新增共享组件；共享的只有纯数据词表。
- 不改 `html-only` 的零 CSS / 零 JS 契约。
- 不回写历史 `change-log/`、`docs/adr/`、`docs/verification/` 的既有记录。

## Constraints

- 共享词表不得 import CSS / `Page.astro` / `style.css`，不得破坏样式隔离。
- 设计文案仍来自各设计 `messages.ts`；标准标签是唯一例外。
- 构建校验必须离线、确定性、可在 CI 复现；不得依赖浏览器。
- allowlist 是迁移期债务清单，不得长期保留或作为永久豁免。
- 子任务文件集不重叠；S2 / S3 可并行，但都必须以 S1 的词表为准。

## Notes

- 审计证据：`research/audit-2026-11-09.md`。
- 设计细节：`design.md`；执行计划：`implement.md`。
- 2026-11-09 已将 Primary section / Standard section label / Theme word 写入 `CONTEXT.md`。
