# 繁中内容与页面铺开

共享需求见父任务 `prd.md` / `design.md` / `implement.md`；本文件只写本子任务范围与验收。

## Goal

完成 27 套设计的繁中资料、共享文案、设计文案与页面，分四批推进并由用户终审后发布。

## Scope

### 公共内容（一次）

- `src/data/site.config.yaml`：新增 `zh-TW` locale（title / description / `fontProfile: traditional-chinese`），排在 `zh-CN` 后。
- `src/data/profiles/zh-tw.yaml`：从 `zh-cn.yaml` 经 OpenCC `s2twp` 初转 + 人工改写；字段完整、不虚构事实；专名本地化（野獸先輩），罗马字保留。
- `src/i18n/messages.ts`：繁中共享文案（菜单、Toast、切换页、入口、404、语言名）。
- `src/designs/descriptions.ts`：27 条繁中描述。

### 批次

- 批次 1（6 套）：`editorial`、`archive`、`pager`、`fast`、`terminal`、`html-only`。
- 批次 2 / 3 / 4：其余 21 套按 7 / 7 / 7 推进。
- 每套：`design.json.locales` 追加 `zh-TW`、`messages.ts` 繁中块、按需补 `Page.astro` 字体接线。
- 每批完成后做设计级验证：字体加载、TC 字形（骨/直/說/體 等抽样）、排版溢出、缺字报告。
- 用户逐批终审文案；未审校不得发布。
- 记录每批 `dist` 字节数与 TC 页面数。

## Out of scope

- 不改字体族集或门禁实现（属集成任务）。
- 不新增资料字段或区块。
- 不为繁中重写设计视觉。

## Acceptance Criteria

- [ ] 27 套 `design.json.locales` 均含 `zh-TW`；`editorial` 覆盖全部 locale。
- [ ] 构建产出 27 个 `/zh-tw/<design>/` 页面；语言切换、404、随机池符合覆盖契约。
- [ ] 繁中资料与 27 套设计文案经用户终审，无未审校机翻、无占位。
- [ ] 每批 `npm run build` 通过，设计级验证记录归档。
- [ ] 每批发布记录含 `dist` 字节数与 TC 页面数；累计体积 ≤ 8.5 MiB 目标（硬门禁 10 MiB）。

## Dependencies

依赖 `11-01-traditional-chinese-font-integration` 的 GATE-3 后才能发布批次 1；批次 2–4 可与文档任务并行。
