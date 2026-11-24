# AGENTS.md — 项目规则入口

本文件是编码 Agent 的自动入口，只承载**不可延迟加载的硬门禁**与**按任务读取的路由**。完整规则以 [`docs/rules/`](docs/rules/README.md) 为唯一正文来源；本文件不复制规则细节。新增 / 修改设计前必读。

## 硬门禁

以下 9 条在任何实现任务中都立即生效；展开说明见对应正文。

1. <!-- gate:data-loader -->**统一取数**：设计页只用 `loadDesignView` / `loadDesignStrips` 取数，不得自行解析语言或文件路径。见 [`data-and-i18n.md`](docs/rules/data-and-i18n.md)。
2. <!-- gate:profile-fields -->**资料完整**：`name` / `headline` / `bio` / `links` 必须全部渲染，禁止虚构个人事实。见 [`data-and-i18n.md`](docs/rules/data-and-i18n.md)。
3. <!-- gate:internal-links -->**链接可部署**：内部链接必须经 `withBase()` 或 `localeDesignHref()` / `localeHref()` 生成，禁止硬编码绝对路径。见 [`data-and-i18n.md`](docs/rules/data-and-i18n.md)。
4. <!-- gate:html-only-zero-assets -->**HTML-only 零前端资源**：不得提供自定义 CSS / JS / 字体 / 菜单，最终 HTML 只含语义内容与获准 metadata 链接。见 [`design-contract.md`](docs/rules/design-contract.md)。
5. <!-- gate:single-action-menu -->**唯一操作入口**：`styled` 必须无条件接入唯一共享操作菜单，不得复制菜单、另建切换入口或保留隐藏可聚焦旧入口。见 [`action-menu.md`](docs/rules/action-menu.md)。
6. <!-- gate:css-isolation -->**样式隔离**：共享模块不得对设计页面 / CSS 建立动态导入边，不得跨设计聚合样式。见 [`pitfalls.md`](docs/rules/pitfalls.md)。
7. <!-- gate:reveal-visibility -->**降级可见**：内容默认可见，隐藏态只能由 `html[data-reveal-ready]` 门控；无 JS / 无 IO / 减动态时必须可见。见 [`visual-language.md`](docs/rules/visual-language.md)。
8. <!-- gate:verify-after-change -->**改动必验**：设计页或共享机制改动后必须执行 `design-page-verify` 并更新 `docs/verification/`。见 [`operations.md`](docs/rules/operations.md)。
9. <!-- gate:section-labels -->**主分区标准标签**：主分区 h2 只能使用共享词表的标准标签（canonical / alias / 英文 canonical），主题词移出 h2；每个主分区带 `data-section`，`npm run verify:sections` 必须通过。见 [`design-contract.md`](docs/rules/design-contract.md)。

## 任务路由

先按任务读取主文件，再读表中列出的必要交叉文件；不要默认加载全部规则。

| 任务 | 必读 |
|---|---|
| 新增 / 修改 `styled` 设计 | [`design-contract`](docs/rules/design-contract.md) + [`visual-language`](docs/rules/visual-language.md) + [`pitfalls`](docs/rules/pitfalls.md) + [`accessibility-responsive`](docs/rules/accessibility-responsive.md) |
| 新增 / 修改 `html-only` 设计 | [`design-contract`](docs/rules/design-contract.md) + [`accessibility-responsive`](docs/rules/accessibility-responsive.md) + [`pitfalls`](docs/rules/pitfalls.md) |
| 数据 / 多语言 / 路由 / 文案 | [`data-and-i18n`](docs/rules/data-and-i18n.md) + [`pitfalls`](docs/rules/pitfalls.md) |
| 主分区命名 / 标签 / 信息架构 | [`design-contract`](docs/rules/design-contract.md) + [`accessibility-responsive`](docs/rules/accessibility-responsive.md) + [`pitfalls`](docs/rules/pitfalls.md) |
| 共享操作菜单 / 项目 chrome | [`action-menu`](docs/rules/action-menu.md) + [`accessibility-responsive`](docs/rules/accessibility-responsive.md) + [`pitfalls`](docs/rules/pitfalls.md) |
| 构建 / 文档 / 版本 / git 范围 | [`operations`](docs/rules/operations.md) |
| 排错 / 新增已知坑 | [`pitfalls`](docs/rules/pitfalls.md) + 对应主题文件 |
| 个人资料导入 / 快速部署 | [`README`](README.md) + [`data-and-i18n`](docs/rules/data-and-i18n.md) + [`operations`](docs/rules/operations.md) + [`.agents/skills/personal-site-launch/SKILL.md`](.agents/skills/personal-site-launch/SKILL.md) |

## 规则正文索引

- [规则索引与读取协议](docs/rules/README.md)
- [数据与多语言](docs/rules/data-and-i18n.md)
- [设计交付契约](docs/rules/design-contract.md)
- [共享操作菜单](docs/rules/action-menu.md)
- [视觉语言](docs/rules/visual-language.md)
- [无障碍与响应式](docs/rules/accessibility-responsive.md)
- [已知坑](docs/rules/pitfalls.md)
- [构建、文档与发布操作](docs/rules/operations.md)

## 文档边界

- 规则正文：`docs/rules/`；根文件只做路由与硬门禁。
- 验证流程：`.agents/skills/design-page-verify/SKILL.md`；当前状态：`docs/verification/`。
- 长期决策：`docs/adr/`；全库文档职责：`docs/README.md`；规格事实：`SPEC.md`。
- 历史 change-log 与归档任务保留当时引用，不回写。

<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
