# 项目规则正文索引

> **权威声明**：本目录是 SenrenBanka 项目级规则的**唯一完整正文来源**。根 [`AGENTS.md`](../../AGENTS.md) 只保留每次会话必须立即知道的硬门禁与任务路由。
>
> **读取顺序**：先看根文件的硬门禁与路由表，再按任务类型读取本目录的主题文件；不要把本目录全文一次性塞进上下文。

## 主题文件

| 文件 | 读取时机 | 主要内容 |
|---|---|---|
| [`data-and-i18n.md`](./data-and-i18n.md) | 改数据加载、资料、语言、路由、文案 | 数据接口、`loadDesignView` / `loadDesignStrips`、locale、语言切换、翻译纪律 |
| [`design-contract.md`](./design-contract.md) | 新增 / 修改任何设计 | 渲染模式、必交文件、`Preview.astro`、`tokens.css`、设计隔离 |
| [`action-menu.md`](./action-menu.md) | 改共享菜单、悬浮球、页面上下文、chrome | 触发方式、桌面菜单、移动面板、键盘、随机语义、`manualSwitch` |
| [`visual-language.md`](./visual-language.md) | 设计视觉、动效、图标、素材、字体 | Motion、Iconography、Visual Assets、Typography & Fonts |
| [`accessibility-responsive.md`](./accessibility-responsive.md) | 任何用户可见改动 | 可访问名称、对比度、触控目标、键盘、375px 与桌面留白 |
| [`pitfalls.md`](./pitfalls.md) | 排错、设计实现前、新增已知坑 | CSS 聚合、路由、菜单、预览、字体、构建期实测陷阱 |
| [`operations.md`](./operations.md) | 改构建、文档、版本、入库范围 | `npm` 脚本、验证流程、文档维护、版本日志、git 范围 |

## 维护规则

- 规则正文只在本目录维护；根文件不得复制长段落。
- 修改规则时先改对应主题文件，再检查根索引、任务路由与全仓库引用。
- 新增主题文件必须有明确边界，并同步更新根索引与本文件；不得为单条规则新建文件。
- 验证流程仍在 [`.agents/skills/design-page-verify/SKILL.md`](../../.agents/skills/design-page-verify/SKILL.md)；当前实测状态在 [`docs/verification/`](../../docs/verification/)；长期决策在 [`docs/adr/`](../../docs/adr/)。
- 历史 change-log 与归档任务保留当时引用，不回写。
