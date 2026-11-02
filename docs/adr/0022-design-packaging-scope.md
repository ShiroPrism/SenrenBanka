# 设计打包范围：site.config.yaml 的 design.exclude

- 状态：Accepted（2026-11-02）
- 相关：`CONTEXT.md`「Packaged design / Packaging scope」；`SPEC.md` Q6 / §5.4 / §6.2 / §6.3；`docs/rules/data-and-i18n.md`；`docs/verification/shared.md`
- 证据：`.trellis/tasks/11-02-design-packaging-scope/`

## 背景

- 30 套设计全部由目录自动发现并构建；`design.json.enabled` 的既有语义是“页面仍构建可直达，只退出随机池与切换页”。
- fork/部署者可能不想发布某些设计（例如 `magical-girl`），但现有机制只能逐套改 `design.json`，且无法阻止页面/资源进入产物。
- `astro.config.mjs` 直接扫描目录注入路由；`site.ts` 的随机池、切换页与语言覆盖校验基于 registry 的启用列表。
- SPEC Q6 原先明确“站点配置不含设计清单”；新增部署级排除名单需要修订该决策。
- 切换页 `Preview.astro` 是 eager glob，彻底移除被排除设计的预览 CSS/描述需要额外的构建期清单；本轮接受为已知限制。

## 决策

1. `site.config.yaml` 的 `design` 段增加可选 `exclude: string[]`，缺省 `[]` = 全部注册设计打包；全站一份，不按 locale 拆分。
2. `design.exclude` 是**打包范围**：被排除设计不注入多语言页面与旧路径跳转，不生成页面 HTML / Page CSS，不进入随机池、切换页与语言入口。
3. `design.json.enabled` 语义保持不变，但只在打包集合内生效；被排除设计即使 `enabled: true` 也静默失效，不报错、不告警。
4. `design.default` 必须同时是打包 + 启用设计；排除 default、未知 ID、重复 ID、排除全部设计都在构建期失败。
5. 语言覆盖 / messages / descriptions 只校验打包设计；registry 仍校验全部目录的四件套与元数据。
6. `SiteModel` 明确区分 `designs`（全部注册）、`packaged`（打包）、`enabled`（打包 ∩ 启用）；路由注入使用 `packaged`，随机池/切换页使用 `enabled`。
7. 目录自动发现不变：注册仍由 `src/designs/<id>/` 存在决定；`design.exclude` 只做部署级减法。

## 结果

- fork 只需在 `site.config.yaml` 写 `design.exclude: [magical-girl]`，即可从产物与所有随机/切换入口移除该设计。
- 默认站点不排除任何设计，公开画廊仍为 30 套。
- 代价：`enabled` 与 `packaged` 是两个概念；被排除设计的预览 CSS / 描述可能仍聚合进切换页 bundle（已知限制）；SPEC Q6 从“站点配置不含设计清单”收紧为“站点配置只含部署级排除名单”。

## 替代方案

- **每套 `design.json` 增加 `packaged` 布尔**：不新增站点清单，但 fork 选多套要改多份，且把部署决策塞进设计元数据。
- **复用 `enabled` 兼任打包**：会改变既有语义并破坏“页面仍构建可直达”的直接 URL 场景。
- **`design.include` 白名单**：适合小站，但默认全部 30 套时需要维护 30 个 ID；本轮不做，保留为后续扩展。
- **严格清除预览资源**：需要构建期预览 manifest / 动态过滤，超出本轮；先在 ADR 与验证文档中记录限制。

## 风险与回滚

- 路由过滤与 `site.ts` 的打包集合必须使用同一份 `design.exclude`；两处解析不一致会导致页面与切换页数量错位，需构建期校验与验证。
- 回滚：移除 `design.exclude` 字段与路由过滤、恢复 `enabledDesigns` 为唯一随机池即可；schema 变更是增量的，不影响现有配置（缺省 `[]`）。
