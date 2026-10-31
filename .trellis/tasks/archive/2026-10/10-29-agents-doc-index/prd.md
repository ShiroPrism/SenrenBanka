# AGENTS.md 分块索引化与 docs/rules 权威拆分

## Goal

把根 `AGENTS.md` 从约 14k tokens 的完整规则正文，收缩为**每次会话必读的最小硬门禁 + 按任务类型读取的路由索引**；完整规则正文迁入 `docs/rules/` 并保持单一来源。同步迁移现行引用、增加防回膨胀门禁，并用 ADR 固化权威模型。

## Background

- 当前 `AGENTS.md` 为 49,613 字节 / 297 行 / 约 14k tokens，每次 Codex 会话自动加载。
- 最大章节：操作菜单 19.0%、已知坑 16.7%、每套设计契约 15.2%。
- 全仓库约 60 个文件引用 `AGENTS.md`：现行源码注释约 29 个、现行文档与 SPEC 约 12 个、skill / README 约 4 个，另有历史 change-log 与归档任务。
- 多数任务只需要其中一小部分规则；全部加载既贵，也让关键红线被长文淹没。
- `AGENTS.md` 末尾含 Trellis 托管区块，任何重构必须保留且不触碰其内容。

## Requirements

### R1 · 权威模型

- `docs/rules/*.md` 是完整规则的**唯一正文来源**。
- 根 `AGENTS.md` 只承载：任务路由表、不可延迟加载的硬门禁、docs/rules 索引，以及 Trellis 托管区块。
- 根文件不得复制完整规则细节；每条硬门禁保持一句可判定陈述并链接正文。
- 同一规则不得在根文件与 docs/rules 各维护一份正文。

### R2 · 拆分结构

- 在 `docs/rules/` 建立 7 个主题文件：
  1. `data-and-i18n.md`
  2. `design-contract.md`
  3. `action-menu.md`
  4. `visual-language.md`
  5. `accessibility-responsive.md`
  6. `pitfalls.md`
  7. `operations.md`
- 现有 `AGENTS.md` 的每个章节必须且只能归入上述一个文件；不得借拆分删减、弱化或改写规则语义。
- `docs/rules/README.md` 提供规则索引、读取时机、权威声明与维护边界。
- `design-contract.md` 承载渲染模式、必交文件、`Preview.astro` / `tokens.css`、构建期校验。
- `visual-language.md` 承载 Motion、Iconography、Visual Assets、Typography & Fonts。
- `operations.md` 承载构建、文档维护、版本与变更日志、git 入库范围。
- `data-and-i18n.md` 承载数据接口与全部 i18n 规则。
- `action-menu.md` 承载共享操作菜单的全部行为、形态、无障碍与状态语义。
- `accessibility-responsive.md` 承载跨设计无障碍、触控与响应式底线。
- `pitfalls.md` 承载全部“已知坑”，并保留实测日期 / 现象 / 正解。

### R3 · 根文件最小内容

根 `AGENTS.md` 必须保留以下 8 条硬门禁（每条一句 + 正文链接）：

1. 设计页统一通过 `loadDesignView` / `loadDesignStrips` 取数，不自行解析语言。
2. 核心资料字段必须全部渲染，禁止虚构个人事实。
3. 内部链接必须经 URL helper 拼接，禁止硬编码绝对路径。
4. `html-only` 最终页面零自定义 CSS / JS / 字体 / 菜单。
5. `styled` 必须无条件接入唯一共享操作菜单，不得重复或隐藏旧切换入口。
6. 设计 CSS 与共享模块不得建立动态导入边；不得跨设计聚合样式。
7. 内容默认可见；任何显现隐藏态只由 `data-reveal-ready` 门控。
8. 设计页或共享机制改动后必须执行 `design-page-verify` 并更新验证记录。

根文件还必须包含按任务类型的最小读取路由（至少覆盖：新增/修改设计、改共享菜单或 i18n、改构建/发布/文档、排错与新增已知坑）。

### R4 · 引用迁移

- 所有**现行**源码注释、现行 docs、`SPEC.md`、`README.md`、`docs/README.md`、`docs/fonts/selection-guide.md`、`design-page-verify` skill 中指向旧章节的引用，迁移到对应 `docs/rules/*.md` 的稳定标题锚点。
- 历史 `change-log/*` 与已归档任务不改写；如需说明，在新 change-log 中记录迁移。
- 活跃 Trellis 任务的上下文清单若仍将根 `AGENTS.md` 当作完整规则来源，更新为对应 docs/rules 文件；历史任务不改。
- 迁移后不得留下指向已删除章节的现行引用。
- 所有新引用使用相对路径，便于本地与仓库浏览。

### R5 · ADR 与文档治理

- 新增一篇 ADR，记录“根文件索引化 / docs/rules 单一正文”的决策、替代方案、代价与迁移规则。
- 更新 `docs/README.md` 的职责表与引用关系，明确根文件与 `docs/rules/` 的边界。
- 更新 `SPEC.md` §9，说明项目级规则现在由根索引 + docs/rules 正文共同承载，但正文唯一来源是 docs/rules。
- 更新 `README.md` 的文档入口说明（如涉及）。

### R6 · 防回膨胀门禁

- 新增 `scripts/verify-agent-docs.mjs`，至少检查：
  - 根 `AGENTS.md` 存在且字符数不超过预算；
  - `docs/rules/README.md` 与 7 个主题文件均存在且非空；
  - 根文件索引列出的每个 docs/rules 文件真实存在；
  - 根文件与 docs/rules 内部的相对 Markdown 链接均可解析；
  - 根文件仍含 8 条硬门禁与 Trellis 托管区块；
  - docs/rules 中不存在重复的二级章节标题跨文件冲突（允许同义但须显式白名单）。
- 预算以拆分完成后的实际根文件大小为基线，并留出有限增长空间；具体值在 `design.md` 中确定。
- 将门禁接入 `npm run check`，使其成为常规检查的一部分；不得只在手工命令中运行。
- 门禁失败信息必须指出违规文件与原因。

### R7 · 可维护性

- docs/rules 文件按主题组织，单个文件应可在典型任务中独立读取，不要求读者先读完整套。
- 文件顶部注明：适用范围、权威级别、相关 ADR / skill、维护归属。
- 规则变更时先改 docs/rules 正文，再检查根索引是否需要更新。
- 不新增重复的“规则摘要”文件；`docs/rules/README.md` 只做索引，不复制正文。

## Acceptance Criteria

- [ ] AC1 根 `AGENTS.md` 字符数较拆分前减少至少 70%，且不超过 `design.md` 确定的预算。
- [ ] AC2 根文件包含任务路由表、8 条硬门禁、docs/rules 索引与完整 Trellis 托管区块。
- [ ] AC3 `docs/rules/README.md` + 7 个主题文件存在，原 `AGENTS.md` 每个章节均有明确归口。
- [ ] AC4 逐条比对确认：拆分未删减、弱化或改写任何规则语义；仅有结构性改写与必要的路径/标题调整。
- [ ] AC5 现行源码、SPEC、README、docs、skill 中不存在指向旧章节的过期引用；历史 change-log 与归档任务保持原样。
- [ ] AC6 新增 ADR，且 `docs/README.md`、`SPEC.md` §9、`README.md` 已同步权威模型。
- [ ] AC7 `scripts/verify-agent-docs.mjs` 覆盖 R6 全部门禁，并在 `npm run check` 中执行。
- [ ] AC8 门禁具备正反例：根文件超预算、缺文件、断链、缺硬门禁、Trellis 区块缺失均会失败。
- [ ] AC9 `npm run check` 与 `npm run build` 通过；`verify:html-only` 不受影响。
- [ ] AC10 `git diff --check` 通过，工作树仅含本任务相关改动。
- [ ] AC11 迁移后随机抽取至少 3 个典型任务路由，验证“按需读取”的路径完整、无循环引用、无缺失前置。

## Out of Scope

- 不改写任何规则的实际内容（除结构调整、标题稳定化与路径更新）。
- 不重新设计共享操作菜单、i18n、动效、字体、图标或设计页面。
- 不修改历史 change-log 与归档任务。
- 不修改 Trellis 托管区块内部文本。
- 不引入新的文档生成器、静态站点或重型 Markdown 依赖。
- 不拆分为多个 `AGENTS.md` 嵌套文件（Codex 自动加载语义不保证）。

## Risks

- 根文件过小可能漏掉真正必须立即知道的红线；用 AC4 + 硬门禁清单 + 任务路由抽查缓解。
- 按主题拆分后，跨主题规则可能被读者漏读；用路由表明确“主文件 + 必读交叉引用”。
- 引用迁移面广，容易遗漏；用全仓库检索与链接门禁收口。
- 门禁预算过紧会阻碍正常规则增长；预算需留合理余量并在 ADR 中说明调整流程。
