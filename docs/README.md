# docs/ — 文档职责索引与维护规则

> 2026-10-11 文档治理确立。修改任何文档前，先在此查找归属；新信息写入对应既有文档，不因内容增加而随意新建文件。

## 职责一览

| 文档 | 职责 | 创建 / 更新条件 |
|---|---|---|
| `README.md`（根） | 面向使用者：fork → 改资料 → 三平台部署 → 增删设计 | 使用方式变化 |
| `AGENTS.md` | 编码 Agent 的**自动入口**：不可延迟加载的硬门禁 + 按任务读取的路由；不承载完整规则正文 | 硬门禁 / 路由变化 |
| `docs/rules/README.md` + `docs/rules/*.md` | 项目级规则的**唯一完整正文来源**（数据与多语言、设计契约、共享菜单、视觉语言、无障碍、已知坑、操作）；`README.md` 只做索引 | 规则变化 |
| `SPEC.md` | 项目**规格与事实来源**：目标、决策记录、已核实技术事实、数据契约、配置语义、路由与多语言契约、部署、验收、风险 | 规格 / 事实变化；**不写**逐次验证记录与调试过程 |
| `docs/adr/NNNN-*.md` | 跨主题 / 架构级**长期决策**：背景、方案、取舍、后果（含修订节） | 同时满足三条才新增：难逆转 + 未来读者会问为什么 + 真实取舍 |
| `src/i18n/messages.ts` | 共享文案（chrome 与基础设施页）；`src/designs/<id>/messages.ts` | 各主题界面文案 | 界面文案新增 / 变更；**不得**在其中记录实现细节 |
| `src/data/profiles/*.yaml` | 各语言的个人资料（共用同一套 schema） | 资料内容变更（文件名须与 `i18n.locales[].path` 对应） |
| `docs/designs/<id>/ADAPTATION.md` | 主题**适配记录**：厂商快照偏差、实现增补、检测器例外 | 仅当存在特殊适配 / 重要例外时创建；普通主题不建空文件 |
| `docs/fonts/selection-guide.md` | 新增主题的**字体选型流程与工具契约**（设计隐喻 → 本地候选 → 样张目检 → 许可闸门 → 生产接线与记录模板）；不含本机字体清单 | 选型流程 / 隔离规则变化 |
| `docs/verification/<id>.md`、`shared.md`、`action-menu.md` | 各主题与共享机制的**当前完整验证状态**（含跨语言测试矩阵）。`action-menu.md` 专收共享操作菜单的跨设计 / 跨输入环境 / 跨配置实测矩阵（独立职责，ADR 0007） | 每次验证**更新**对应文件；不追加历史快照（历史由 Git 保留） |
| `change-log/<version>.md` | 版本**成果 / 修复 / 验证结论**摘要 | 一个版本一个文件（版本号命名）；不写调试流水账 |
| `src/designs/<id>/DESIGN.md` | 主题视觉规范、设计意图与设计层实现要求 | 自产 / 复刻规范可修订（先规范、后实现）；厂商来源（快照 / 汇编）**只读**（汇编 = 整合完成即冻结），偏差记入该主题 `ADAPTATION.md` |
| `src/designs/<id>/tokens.css`、`Preview.astro` | 可选：设计令牌单一来源（正式页与预览共用）与切换页预览碎片 | 预览层新增 / 变更；约束见 `docs/rules/design-contract.md`「可选 · 切换页预览碎片」 |
| `.agents/skills/design-page-verify/SKILL.md` | **验证流程唯一载体**：步骤、通过标准、记录收口 | 流程变化 |
| `.agents/skills/personal-site-launch/SKILL.md` | **资料导入与部署流程**：运行环境 / 部署权限门禁、文件抽取、语言映射、profile 替换、构建、上线与临时资源清理 | 流程、权限要求或平台操作变化 |
| `CONTEXT.md` | 领域术语表（只收项目特有概念，不含实现细节） | 术语新增 / 修订 |

## 引用关系

- 规则入口（`AGENTS.md`）→ 规则正文（`docs/rules/`）→ 执行（`design-page-verify` skill）→ 状态（`docs/verification/`）→ 版本结论（`change-log/`）。
- 多语言链路：语言清单唯一来源 `site.config.yaml` 的 `i18n.locales` → 资料 `src/data/profiles/<path>.yaml` → 共享文案 `src/i18n/messages.ts` / 主题文案 `src/designs/<id>/messages.ts` → 路由 `astro.config.mjs` 的 `injectRoute` → 决策 `docs/adr/0006-multilingual-static-routing.md`。
- 404 多语言链路：`src/lib/not-found.ts`（构建期预渲染数据 / 首屏解析脚本 / 菜单 variants）→ `src/pages/404.astro`（单份 HTML）→ `ContextMenu` 运行时按 `data-404-locale` 本地化 → 决策 `docs/adr/0025-single-404-locale-resolution.md`；当前实测见 `docs/verification/shared.md` 与 `action-menu.md`。
- 操作入口链路：`docs/rules/action-menu.md`（规则）→ `ContextMenu.astro` + `context-menu.ts`（`styled` 页面的唯一实现）→ `docs/verification/action-menu.md`（实测）→ 决策 `docs/adr/0007-action-menu-site-wide-with-touch-launcher.md`（取代 `0004` 的决定 2 与被否决项 2，并修订 `0003` 决定 4；无 JS 能力由 ADR 0009 更正；菜单样式外置见 ADR 0015）。
- 预览链路：`docs/rules/design-contract.md`「可选 · 切换页预览碎片」（规则）→ `src/designs/<id>/{Preview.astro,tokens.css}`（各设计私有）+ `src/infra/SwitcherPage.astro`（唯一聚合点）→ `docs/verification/shared.md`（实测与成本；当前 27 套预览）。
- 渲染模式链路：ADR 0009（决策）→ `design.json.renderMode` + `src/designs/registry.ts`（源文件契约）→ `scripts/verify-html-only.mjs`（最终 HTML 门禁）→ `docs/verification/{shared,html-only}.md`（当前状态）。
- 字体链路：`docs/rules/visual-language.md`「字体（Typography & Fonts）」（规则）→ `docs/fonts/selection-guide.md`（流程与工具契约）→ 本地工作台 `.local-fonts/`（只做发现与样张，不入库、不进构建）→ `fonts.config.json`（显式启用）→ 外部 `SenrenBanka-fonts` 目录的 lock / snapshot / generated registration → 忽略缓存 `.cache/fonts/` 与核心源字体 `.cache/font-sources/` → `astro.config.mjs` 的 primary-only local / npm registration → 各设计 CSS 拥有的完整 fallback 链 → `fonts:subset` 的核心内容子集 → `fonts:prune` 的非核心分片集与共享字体 CSS；来源索引见 `src/assets/fonts/SOURCES.md`，本地隔离决策见 `docs/adr/0008-local-font-library-isolation.md`，生产分发决策见 `docs/adr/0012-external-font-catalog-and-cjk-shards.md`，分片裁剪决策见 `docs/adr/0013-build-time-font-shard-pruning.md`，内容子集决策见 `docs/adr/0014-content-subset-fonts.md`，韩语首版字体取舍见 `docs/adr/0016-korean-first-batch-fonts.md`；全设计韩语字体（6 族伴生 / Hangul-only 路由 / core-cjk 复用）见 `docs/adr/0017-korean-full-coverage-fonts.md`（取代 0016 的 Noto KR 计划）。
- 决策（`docs/adr/`）被 `docs/rules/` / `DESIGN.md` / `ADAPTATION.md` 引用；主题适配互引 ADR 与 change-log。
- **检测器规则分层**：通用规则在 skill 步骤 3；主题特有例外——自产 → 该设计 `DESIGN.md`；厂商 → 该主题 `ADAPTATION.md`。
- 历史：`SPEC.md §18` 曾承载逐次实施记录（v0.1.0–v0.5.2），2026-10-11 迁移至上述归属；此前全文见 Git 历史。

## 维护规则（要点）

- 修改前先查找既有记录，避免重复维护同一事实；跨主题规则 / 单主题例外 / 当前验证状态 / 版本历史**分别归档**（见上表）。
- 官方原始 `DESIGN.md` 不得被改写成项目适配版本。
- 修改文档边界或章节位置后，必须同步更新全仓库引用（含 skill、ADR、change-log、源码注释），不留过期路径。
- 强制条款以 `docs/rules/operations.md`「文档维护」节为准；根 `AGENTS.md` 只做入口。
