# 站点级示例声明与 fork 配置约束

## Goal

把各设计页脚里的固定“示例资料・仅作演示”声明迁到站点配置：`src/data/site.config.yaml` 的 `i18n.locales[].notice`。示例站保留声明，fork 用户替换真实资料后删除该键即不渲染。明确 fork 必须修改 `site.config.yaml` 的 SEO 标题 / 描述 / 语言清单 / notice，不能只替换 profile。

## Background

- 实际渲染示例声明的是 17 套设计：16 套用 `messages.ts` 的 `sampleNote`（`receipt` 通过私有 `Ticket.astro` 渲染），`ink` 用 `footerNote`。
- `govuk` 的 `licenceNotice` 是 OGL 法律署名，`homepage99` 的 `footerNote` 是外链提示，均不属于示例声明，保持不动。
- `CONTEXT.md` 的资料契约是固定 schema；声明属于站点级显示配置，不进入 profile。
- fork 只替换 profile 会保留示例人物的 `i18n.locales[].title/description`，因此 `site.config.yaml` 本来就是必改文件。

## Requirements

- R1：`localeSchema` 增加可选 `notice`（单行纯文本），`LocaleEntry` 暴露 `notice?: string`，设计通过 `view.locale.notice` 读取。
- R2：示例站五个 locale 的 `notice` 分别使用：`示例资料・仅作演示` / `示例資料・僅作演示` / `サンプル・デモ用` / `Sample profile — demo only` / `샘플 자료 · 데모용`。
- R3：17 套实际渲染的设计改为“`view.locale.notice` 存在才渲染”；缺失时不得留下分隔符、空行或占位。
- R4：删除 16 套 `sampleNote`（含 `receipt`）与 `ink.footerNote` 的接口字段与五语言值。
- R5：更新受影响设计的 `DESIGN.md` 中对“页脚示例声明”的静态描述。
- R6：更新 `CONTEXT.md`（Site notice 术语）、ADR 0021、`SPEC.md`、README 与 `docs/rules/data-and-i18n.md`。
- R7：README 明确 fork 必改 `site.config.yaml`：`i18n.locales[].title/description`、`i18n.locales`（语言清单）、`notice`；语言清单只在 `site.config.yaml` 维护。
- R8：示例站页面显示声明；去掉 notice 的构建中所有 16 套页脚不显示声明且无残留排版。

## Acceptance Criteria

- [x] `npm run build` 通过（schema、Astro check、html-only、字体审计）。
- [x] `npm test` 84/84（或新增测试后全绿）。
- [x] 示例站 17 套设计的页脚声明可见，五语言文案正确。
- [x] 无 notice 的构建中 17 套页脚声明计数为 0，且无孤立分隔符 / 空行。
- [x] `govuk` 的 OGL 署名、`homepage99` 的外链提示、其余 13 套设计（无声明）行为不变。
- [x] `CONTEXT.md` / ADR 0021 / `SPEC.md` / README / `docs/rules/data-and-i18n.md` 已更新且检查通过。
- [x] `design-page-verify` 记录更新到 `docs/verification/shared.md` 与受影响设计的验证文档。

## Out Of Scope

- 不新增 profile 字段；不提供按设计自定义声明。
- 不为 `html-only`、`govuk`、`homepage99` 或原本无声明的 13 套设计新增页脚声明。
- 不改变各设计页脚的样式、位置与布局语言。
