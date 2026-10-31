# Locale 配置与语言扩展机制

> 父任务：`11-01-locale-expansion`。本任务拥有需求来源、任务地图、跨子任务验收与最终集成复核；具体实现由子任务承担。

## Goal

把现有「三语言硬编码」的多语言实现升级为**配置驱动的 locale 机制**：

1. 任意 locale 可通过 `site.config.yaml` + 资料文件 + 设计覆盖声明加入，构建期校验完整性与结构缺口；
2. 每套设计在 `design.json` 显式声明支持的 locale，未覆盖的 locale 不生成该设计页面；
3. 支持只保留一种 locale 的 fork（构建合法、菜单不出现空语言分组）；
4. 先外置共享操作菜单 CSS 控制 dist 体积，再首批接入韩语（默认设计 + 5–8 套代表设计）；
5. 保留 ADR 0006 的静态多语言路由，不引入运行时翻译切换。

## 背景与现状（2026-11-01 实测）

- 当前 3 个 locale：`zh-CN` / `ja` / `en`；27 套设计；每 locale 29 个页面。
- `dist` 总计 **6,544,535 B（6.24 MiB）**：HTML 3,960,801 B / CSS 645,973 B / WOFF2 1,621,596 B / PNG 302,730 B / JS 11,747 B。
- 每页约 43.5 KB，其中**共享菜单 CSS 内联 18,823 B**，且在所有 styled 页面完全相同；三语合计约 1.56 MB 重复。
- 27 套 `messages.ts` 使用 `Record<'zh-CN' | 'ja' | 'en'>` 硬编码；`design.json` 无 locale 覆盖字段；新增第 4 语言需要修改 27 套设计。
- 体积门禁 10 MiB，定义于 `scripts/fonts/prune.mjs`；当前无「每语言体积预算」。
- 字体：核心 Zhuque / LXGW 覆盖全部测试拉丁语言 + 越南语；Ark Pixel 缺越南语声调；6 个 Fontsource 族含 `latin-ext` + `vietnamese`；17 个 fixed 族中仅 4 个带真正 `latin-ext`。韩语需新增 Noto Sans KR / Noto Serif KR 核心文字系统角色。
- ADR 0006 已否决运行时客户端语言切换；本任务维持该决定。

## Requirements

### R1 — 配置驱动的 locale

- locale 唯一来源仍是 `src/data/site.config.yaml` 的 `i18n.locales`；`min(1)`、code/path 唯一、`defaultLocale` 必须在列。
- 每种 locale 必须有 `src/data/profiles/<path>.yaml`；多余/缺失资料继续构建失败。
- 共享文案（`src/i18n/messages.ts`）必须覆盖所有配置 locale，缺失构建失败。

### R2 — 设计语言覆盖

- `design.json` 新增必填 `locales: string[]`（非空、唯一）；值为 locale code。
- `design.default`（当前 `editorial`）必须覆盖全部配置 locale。
- 非默认设计可覆盖子集；未覆盖的 locale **不生成页面**，直接 404。
- `design.json` 中列出但未在 `site.config.yaml` 配置的 locale code **忽略并告警**（保证 fork 删除语言时不必逐套改 design.json）。
- 声明覆盖但缺少 `messages.ts` 对应键 → **构建失败**（结构缺口）。
- 字体角色缺失 → 构建失败；仅内容缺字 → 警告并写报告。

### R3 — 语言切换目标

- 菜单语言项始终列出全部配置 locale，不受当前设计覆盖影响。
- 目标 locale 覆盖当前设计时，链接保持同一设计；否则落到目标 locale 的默认设计。
- `html-only` 原生语言导航遵循同一目标规则。
- 当前语言项保留 `aria-current="page"`；每个语言项带 `hreflang` / `lang`。

### R4 — 单语言 fork

- `locales.length < 2` 时，语言分组整组在构建期不渲染：桌面触发项/子菜单、移动分组、注入 JSON、html-only 原生导航均不得出现空分组。
- 保留 `/<locale>/` URL 前缀；不要求去前缀。
- 文档给出裁剪步骤：改 `site.config.yaml` → 删多余 profile → 设计覆盖数组中的未配置 code 被忽略。
- 增加单语言构建验证用例。

### R5 — 共享菜单 CSS 外置

- 把 `ContextMenu.astro` 的 `<style is:inline>` 改为单一共享 hash CSS 文件；所有含菜单的页面链接它。
- 不改变菜单 DOM、动作、状态语义；不新增第二个语言入口；`html-only` 仍零资源。
- 不把设计 CSS 与菜单 CSS 聚合；每页仍只链接自己的设计 CSS + 一份 chrome CSS。
- 新增 ADR 记录取舍与缓存/FOUC/隔离影响。
- 预期：三语 dist 从 6.54 MB 降至约 **4.98 MB**。

### R6 — 韩语首批接入

- 新增 `ko` locale：`site.config.yaml` 条目、`src/data/profiles/ko.yaml`、共享文案韩语键。
- 首批覆盖：默认设计 + 5–8 套代表设计（具体名单在子任务 PRD 确认）；其余设计不声明 ko。
- 字体：`fontProfile: korean` 显式声明。首版按 ADR 0016 使用现有核心 LXGW（韩文命中）+ 系统韩文回退；Noto Sans/Serif KR 作为后续目标，待外部字体仓库发布 core source 包并接入内容子集后替换。
- 文案必须人工审校；不以未审校机翻作为承诺文案。
- 预期：韩语窄覆盖后 4 语 dist ≈ **5.3–5.5 MB**，远低于 10 MiB。

### R7 — 失败级别

- 结构缺口（声明覆盖但文案/字体角色缺失、默认设计未覆盖全部 locale、locale 未配置资料）→ **构建失败**。
- 内容级缺字（源字体无字形）→ **警告 + 报告**，不静默回退到其他语言文案。

### R8 — 文档与验证

- 更新 README、`docs/rules/data-and-i18n.md`、`docs/rules/action-menu.md`、`docs/rules/operations.md`、相关 ADR 与 `docs/verification/`。
- 每个改动设计页/共享机制的批次执行 `design-page-verify`。

## 非目标（Out of Scope）

- 运行时客户端 JS 切换语言、单 URL 多语言、移除 `/<locale>/` 前缀（维持 ADR 0006）。
- 本轮新增韩语以外的可选语言（西/葡/法/德/越等）；机制就绪后按需另开任务。
- 把 27 套设计全部翻译成韩语。
- RTL / 阿拉伯 / 泰文等新文字系统。
- 提高 10 MiB 门禁。
- 修改 `design.default` 的选择。

## Acceptance Criteria

- [ ] A1 菜单 CSS 外置完成：styled 页面无内联菜单 CSS；三语 dist ≤ 5.2 MB；菜单桌面/移动/无 JS 行为与现状一致；新增 ADR。
- [ ] A2 `design.json` 覆盖字段落地且 27 套设计完成迁移；默认设计覆盖全部配置 locale；未覆盖 locale 无页面且 404；结构缺口构建失败。
- [ ] A3 `messages.ts` 不再硬编码三语 union；新增第 4 语言只需为覆盖它的设计补文案，不需要改未覆盖设计的文案文件。
- [ ] A4 单语言构建合法：无语言分组 DOM/JSON；三语构建输出与现状一致；fork 文档与验证用例完成。
- [ ] A5 韩语 4 语构建通过：仅覆盖设计生成 ko 页面；默认设计全量；首版韩文字体按 ADR 0016（LXGW + 系统回退）；无结构缺口；内容缺字有报告。
- [ ] A6 四语 dist ≤ 6.0 MB；10 MiB 门禁保持不变并通过 `fonts:audit`。
- [ ] A7 全量 `npm test` / `npm run check` / `npm run build` / `verify:html-only` / `design-page-verify` 通过。
- [ ] A8 AGENTS.md 八条硬门禁均未被破坏；`docs/verification/` 记录更新。

## 任务地图

| 子任务 | 产出 | 顺序 |
|---|---|---|
| `11-01-menu-css-external` | 菜单 CSS 外置 + ADR + 体积验证 | 必须最先完成，作为后续体积基线 |
| `11-01-design-locale-coverage` | `design.json.locales` + 校验 + 路由 + 文案解耦 + 27 套迁移 | 可与 C1 并行开发，体积验收在 C1 后 |
| `11-01-single-locale-menu` | `locales < 2` 菜单隐藏 + fork 文档 + 用例 | 可与 C2 并行 |
| `11-01-korean-locale` | ko profile/文案 + Noto KR 字体 + 覆盖 | 依赖 C1 体积基线 + C2 覆盖机制 |
| `11-01-locale-docs-verify` | 文档 + 全量验证 + 体积报告 | 依赖 C1–C4 |

## Open Inputs（开始实现前需确认）

- 韩语文案由谁撰写/审校；没有人工审校则不发布 ko。
- `whitehair-failure/SenrenBanka-fonts` 发布 Noto Sans KR / Noto Serif KR 源包与生产包的时间。
- 韩语首批 5–8 套设计名单（默认 `editorial` 必含）。

## Notes

- 子 agent 不 commit；由父任务统一集成、复核、提交。
- 子任务文件集不得重叠；共享文件（`site.config.yaml`、`src/lib/site.ts`、`astro.config.mjs`）由编排方或指定单一子任务修改。
- 任何实现前先读 `AGENTS.md` 与 `docs/rules/` 对应主题。
