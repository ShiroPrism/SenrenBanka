# Profile 自定义内容扩展收口为非目标

## Goal

明确 SenrenBanka 的资料模型不会演进为通用自定义内容系统。更多个人信息通过核心字段 `links` 导向外部平台；现有四个扩展区块继续兼容，但降级为高级可选，避免普通使用者误以为必须填写大量内容。

本任务仅修改文档，不改变运行时行为、数据契约或任何设计页面。

## Requirements

- 在项目规格的“非目标”中明确不提供用户自定义字段、自定义内容区块、任意内容模型或通用内容渲染兜底。
- 在 Profile 契约相关文档中明确：`name` / `headline` / `bio` / `links` 是核心字段；`avatar` / `location` 是普通可选字段；`projects` / `experience` / `skills` / `contact` 是保留兼容的高级可选扩展区块，不再是扩展方向。
- 明确 `links` 是承载站外更多信息的方式，同时说明其取舍：内容离开本站，可用性、可访问性与持久性由外部平台控制。
- 在 `README.md` 的快速开始中增加只含核心字段的最小资料片段，并标注四个扩展区块为高级可选。
- 保留当前三份丰富示例 Profile，不改动其内容；文档需说明它们是用于验证多套设计的内容样张。
- 在 `CONTEXT.md` 中补充或收紧相应领域术语，使后续贡献者能区分“高级可选扩展区块”和“用户自定义内容机制”。
- 不新增代码、Schema、配置、Profile、设计页面或构建校验改动。

## Confirmed Facts

- `src/content.config.ts` 使用严格 Zod Schema；核心字段为 `name` / `headline` / `bio` / `links`，四个扩展区块全部可选。
- `links` 位于核心契约中，所有设计都必须渲染，因此可作为稳定的站外内容出口。
- 当前 17 套 `styled` 设计已消费现有可选区块；`editorial` 有意省略 `experience` / `skills`，`html-only` 有意省略 `avatar`。
- 三份示例 Profile 当前填写了全部可选区块，用于覆盖多套设计的完整内容呈现。
- 仓库不存在共享 Profile 内容渲染器、自定义字段 Schema 或主题专属资料机制。

## Acceptance Criteria

- [x] `SPEC.md` 的非目标与 Profile 契约不再暗示自定义内容扩展会进入路线图，并将四个扩展区块标为兼容保留的高级可选字段。
- [x] `README.md` 提供可直接复制的最小资料片段，同时说明当前完整 Profile 是设计样张、更多内容可通过 `links` 指向外部平台。
- [x] `docs/rules/data-and-i18n.md` 明确禁止把新需求直接解释为自定义字段或自定义区块，并指向 `links` 作为站外内容出口。
- [x] `CONTEXT.md` 的术语定义与上述边界一致，不新增实现细节。
- [x] `src/`、构建配置、当前 Profile、Trellis 以外的任务文件均无改动。
- [x] `npm run check:docs` 与 `git diff --check` 通过。

## Out of Scope

- 删除、重命名或收紧现有 Profile 字段。
- 为 `links` 增加非空校验。
- 修改任何设计页面、样式、文案或内容渲染逻辑。
- 修复 `SPEC.md` 中与 i18n 已实现状态不一致的既有历史描述；该项另立任务处理。
- 新增数据契约版本、迁移脚本或兼容层。
- 创建新的 ADR；本次是对已确认产品边界的文档收口，不引入新的难逆技术决策。

## Notes

- 本任务属于轻量文档任务，PRD-only 即可。
- 根 `AGENTS.md` 的 8 条硬门禁与任务路由保持不变。
