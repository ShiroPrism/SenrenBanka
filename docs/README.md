# docs/ — 文档职责索引与维护规则

> 2026-10-11 文档治理确立。修改任何文档前，先在此查找归属；新信息写入对应既有文档，不因内容增加而随意新建文件。

## 职责一览

| 文档 | 职责 | 创建 / 更新条件 |
|---|---|---|
| `README.md`（根） | 面向使用者：fork → 改资料 → 三平台部署 → 增删设计 | 使用方式变化 |
| `AGENTS.md` | 编码 Agent 的**强制全局规则**（数据接口、每套设计必须满足、共享 chrome、动效、图标、素材、无障碍与响应式、已知坑、构建、文档维护）；不含详细验证流程 | 规则变化 |
| `SPEC.md` | 项目**规格与事实来源**：目标、决策记录、已核实技术事实、数据契约、配置语义、路由与多语言契约、部署、验收、风险 | 规格 / 事实变化；**不写**逐次验证记录与调试过程 |
| `docs/adr/NNNN-*.md` | 跨主题 / 架构级**长期决策**：背景、方案、取舍、后果（含修订节） | 同时满足三条才新增：难逆转 + 未来读者会问为什么 + 真实取舍 |
| `src/i18n/messages.ts` | 共享文案（chrome 与基础设施页）；`src/designs/<id>/messages.ts` | 各主题界面文案 | 界面文案新增 / 变更；**不得**在其中记录实现细节 |
| `src/data/profiles/*.yaml` | 各语言的个人资料（共用同一套 schema） | 资料内容变更（文件名须与 `i18n.locales[].path` 对应） |
| `docs/designs/<id>/ADAPTATION.md` | 主题**适配记录**：厂商快照偏差、实现增补、检测器例外 | 仅当存在特殊适配 / 重要例外时创建；普通主题不建空文件 |
| `docs/verification/<id>.md`、`shared.md` | 各主题与共享机制的**当前完整验证状态**（含跨语言测试矩阵） | 每次验证**更新**本文件；不追加历史快照（历史由 Git 保留） |
| `change-log/<version>.md` | 版本**成果 / 修复 / 验证结论**摘要 | 一个版本一个文件（版本号命名）；不写调试流水账 |
| `src/designs/<id>/DESIGN.md` | 主题视觉规范、设计意图与设计层实现要求 | 自产 / 复刻规范可修订（先规范、后实现）；厂商来源（快照 / 汇编）**只读**（汇编 = 整合完成即冻结），偏差记入该主题 `ADAPTATION.md` |
| `.agents/skills/design-page-verify/SKILL.md` | **验证流程唯一载体**：步骤、通过标准、记录收口 | 流程变化 |
| `CONTEXT.md` | 领域术语表（只收项目特有概念，不含实现细节） | 术语新增 / 修订 |

## 引用关系

- 规则（`AGENTS.md`）→ 执行（`design-page-verify` skill）→ 状态（`docs/verification/`）→ 版本结论（`change-log/`）。
- 多语言链路：语言清单唯一来源 `site.config.yaml` 的 `i18n.locales` → 资料 `src/data/profiles/<path>.yaml` → 共享文案 `src/i18n/messages.ts` / 主题文案 `src/designs/<id>/messages.ts` → 路由 `astro.config.mjs` 的 `injectRoute` → 决策 `docs/adr/0006-multilingual-static-routing.md`。
- 决策（`docs/adr/`）被 `AGENTS.md` / `DESIGN.md` / `ADAPTATION.md` 引用；主题适配互引 ADR 与 change-log。
- **检测器规则分层**：通用规则在 skill 步骤 3；主题特有例外——自产 → 该设计 `DESIGN.md`；厂商 → 该主题 `ADAPTATION.md`。
- 历史：`SPEC.md §18` 曾承载逐次实施记录（v0.1.0–v0.5.2），2026-10-11 迁移至上述归属；此前全文见 Git 历史。

## 维护规则（要点）

- 修改前先查找既有记录，避免重复维护同一事实；跨主题规则 / 单主题例外 / 当前验证状态 / 版本历史**分别归档**（见上表）。
- 官方原始 `DESIGN.md` 不得被改写成项目适配版本。
- 修改文档边界或章节位置后，必须同步更新全仓库引用（含 skill、ADR、change-log、源码注释），不留过期路径。
- 强制条款以 `AGENTS.md`「文档维护」节为准。