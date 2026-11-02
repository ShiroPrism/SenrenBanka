# 设计打包范围配置

## Goal

在 `site.config.yaml` 增加部署级 `design.exclude`，让 fork/部署者可以排除不想要的设计（例如 `magical-girl`）：被排除的设计不构建页面与旧路径跳转，不进入随机池和切换页。注册仍由目录自动发现；`enabled` 只在打包集合内表达“是否进入随机/切换页”。

## Background

- 当前 30 套设计全部 `design.json.enabled: true`；`enabled:false` 的语义是“页面仍构建可直达，退出随机池与切换页”。
- `astro.config.mjs` 直接扫描 `src/designs/*/Page.astro` 注入所有路由；`site.ts` 的随机池、切换页、语言覆盖校验都基于 registry 的 `enabledDesigns`。
- SPEC Q6 原先写“站点配置不含设计清单”；本次需要修订为“设计注册仍由目录发现，站点配置可含部署级打包排除名单”。
- 切换页的 `Preview.astro` 是 eager glob，排除设计仍可能把预览 CSS/描述聚合进切换页资源；本轮作为已知限制接受。

## Requirements

- R1：`site.config.yaml` 的 `design.exclude` 为可选字符串数组，缺省 `[]` = 全部注册设计打包。
- R2：`design.exclude` 是**部署级全局**范围；被排除设计的所有 locale 页面与旧路径跳转都不注入、不构建。
- R3：被排除设计不进入随机池、切换页、语言切换目标池；`enabled` 在打包集合外静默失效（不报错、不告警）。
- R4：`design.default` 必须同时是打包 + 启用设计；排除 default、排除后打包集合为空、未知 ID、重复 ID 都必须在构建期失败。
- R5：语言覆盖 / messages / descriptions 只校验**打包设计**；注册表仍校验全部目录的四件套与元数据。
- R6：`SiteModel` 明确区分 `designs`（全部注册）、`packaged`（打包）、`enabled`（打包 ∩ 启用）；`designsForLocale`、随机池、切换页使用 `enabled`；路由注入使用 `packaged`。
- R7：新增 ADR 0022 与 Registered / Packaged / Enabled / Default 四层术语；同步 SPEC Q6 / §5.4 / §6.3、README、规则与验证记录。
- R8：默认构建（无 exclude）保持 193 页不变；排除构建验证页面、路由、随机池、切换页与旧跳转。

## Acceptance Criteria

- [x] 默认 `npm run build` 仍为 193 页；`npm test` 84/84；`npm run check` 全绿。
- [x] 临时设置 `design.exclude: [magical-girl]` 后构建成功：不再生成 `/*/magical-girl/` 与 `/magical-girl/`；设计页总数减少 5、总页数减少 6；切换页每语言只列出 29 套；随机池不含 magical-girl。
- [x] `design.default` 被排除、未知 ID、重复 ID、排除全部设计时构建失败，错误信息指明配置项与修法。
- [x] 被排除设计的语言覆盖 / messages / descriptions 不再参与校验；注册表四件套校验仍覆盖全部目录。
- [x] 无 exclude 时 30 套全部打包；`enabled` 现有行为不变。
- [x] 切换页预览 CSS / 描述仍可能包含被排除设计（已知限制，记录在 ADR 与验证文档）。
- [x] `CONTEXT.md` / ADR 0022 / SPEC / README / `docs/rules/data-and-i18n.md` / `docs/verification/shared.md` 已更新。
- [x] 默认构建与排除构建的浏览器/静态证据已记录，截图与命令留档。

## Out Of Scope

- 不做每语言独立的打包范围。
- 不删除仓库中的设计源码。
- 不实现“排除设计的预览 CSS / 描述彻底不进入切换页 bundle”（已知限制；后续如需再做预览 manifest）。
- 不改变目录自动发现与 `design.json.enabled` 的既有语义。
