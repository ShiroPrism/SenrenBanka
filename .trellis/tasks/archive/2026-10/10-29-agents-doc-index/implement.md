# 实施计划：AGENTS.md 索引化

## 前置

- [ ] 0.1 读取本任务 `prd.md` / `design.md`、`docs/README.md`、`SPEC.md` §9、`CONTEXT.md`。
- [ ] 0.2 读取 `.trellis/spec/frontend/quality-guidelines.md` 与 `.trellis/spec/guides/code-reuse-thinking-guide.md`。
- [ ] 0.3 记录拆分前基线：`AGENTS.md` 字符数、章节列表、全仓库引用清单。
- [ ] 0.4 确认工作树仅含本任务规划文件；其他改动先回报用户。

## 阶段 1：建立规则正文

- [ ] 1.1 创建 `docs/rules/README.md`（索引、读取协议、权威声明、维护边界）。
- [ ] 1.2 创建 `data-and-i18n.md`，迁入「数据接口」「多语言（i18n）」。
- [ ] 1.3 创建 `design-contract.md`，迁入「每套设计必须满足」「可选 · 切换页预览碎片」。
- [ ] 1.4 创建 `action-menu.md`，迁入「页面级操作入口」全节。
- [ ] 1.5 创建 `visual-language.md`，迁入 Motion、Iconography、Visual Assets、Typography & Fonts。
- [ ] 1.6 创建 `accessibility-responsive.md`，迁入「无障碍与响应式」。
- [ ] 1.7 创建 `pitfalls.md`，迁入「已知坑」全部条目。
- [ ] 1.8 创建 `operations.md`，迁入构建、文档维护、版本与变更日志、入库范围。
- [ ] 1.9 逐章节核对：原文件每个规则条目都能在新文件找到对应内容；不得静默删减。

## 阶段 2：重写根入口

- [ ] 2.1 备份原 Trellis 托管区块文本（逐字）。
- [ ] 2.2 将根 `AGENTS.md` 重写为：标题、权威声明、8 条硬门禁、任务路由表、规则正文索引、文档边界。
- [ ] 2.3 原样恢复 Trellis 托管区块，确认首尾标记与内容未变。
- [ ] 2.4 检查根文件字符数 ≤ 7,000；记录实际值。
- [ ] 2.5 检查根文件不包含原章节正文长段落。

## 阶段 3：迁移现行引用

- [ ] 3.1 迁移 `SPEC.md` §9、目录树说明与相关规则引用。
- [ ] 3.2 迁移 `README.md`、`docs/README.md`、`docs/fonts/selection-guide.md`。
- [ ] 3.3 迁移 `.agents/skills/design-page-verify/SKILL.md`。
- [ ] 3.4 迁移 `src/` 下现行源码注释与设计文档（DESIGN.md / Page.astro / style.css / tokens.css / Preview.astro / preview.ts / reveal.ts / InfraStyles.astro / SwitcherPage.astro）。
- [ ] 3.5 迁移 `docs/verification/*.md` 与 `docs/designs/*/ADAPTATION.md` 中的现行规则引用。
- [ ] 3.6 更新活跃 Trellis 任务的 jsonl / md 中作为当前规则来源的引用；历史任务与 change-log 不改。
- [ ] 3.7 全仓库检索 `AGENTS.md`，逐条分类；剩余命中只能是根文件自身、历史记录或有意保留的“入口”引用。

## 阶段 4：ADR 与索引

- [ ] 4.1 新增 `docs/adr/0010-agents-doc-index.md`，按 design.md §8 写决策、替代方案、后果、修订条件。
- [ ] 4.2 更新 `docs/README.md` 职责表与引用关系。
- [ ] 4.3 更新 `SPEC.md` §9 与目录树，说明根索引 + docs/rules 正文模型。
- [ ] 4.4 更新 `README.md` 文档入口说明。
- [ ] 4.5 在 `CONTEXT.md` 增加必要术语（如“规则正文 / 规则入口”），仅当确有领域歧义时。

## 阶段 5：门禁与测试

- [ ] 5.1 新增 `scripts/verify-agent-docs.mjs`，实现 design.md §6.2 全部检查。
- [ ] 5.2 新增 `scripts/verify-agent-docs.test.mjs`，覆盖正例与全部反例。
- [ ] 5.3 修改 `package.json`：
  - `check:docs` 先跑测试再检查真实仓库；
  - `check` 改为 `npm run check:docs && astro check`。
- [ ] 5.4 手动制造至少 3 类违规，确认门禁失败信息可定位；恢复文件。
- [ ] 5.5 确认门禁不自动改文件、不依赖网络、不新增 npm 依赖。

## 阶段 6：验证与收口

- [ ] 6.1 `npm run check` 通过。
- [ ] 6.2 `npm run build` 通过。
- [ ] 6.3 `git diff --check` 通过。
- [ ] 6.4 抽查 3 条任务路由：
  - 新增 styled 设计；
  - 改共享菜单；
  - 新增已知坑。
  确认每条路径可直接到达所需正文，无缺失前置。
- [ ] 6.5 复核 Trellis 托管区块逐字未变。
- [ ] 6.6 更新 `docs/verification/shared.md`（记录文档门禁结果与预算实际值）。
- [ ] 6.7 新增 `change-log/0.16.1.md` 或按项目版本规则确定版本；记录成果、验证结论、未覆盖项。
- [ ] 6.8 向用户报告：根文件前后字符数、拆分文件数、迁移引用数、门禁结果、剩余历史引用。

## 回滚点

- R1：阶段 1 完成后，可删除 docs/rules 并保留原 AGENTS.md，不影响构建。
- R2：阶段 3 前，可放弃根文件替换，只保留新正文供评审。
- R3：阶段 5 后，若门禁阻断正常流程，可单独回滚 `package.json` 接线，保留脚本供手工运行。

## 完成定义

- PRD 全部 AC 满足；
- 根文件成为可读的路由入口，而不是规则正文；
- docs/rules 成为唯一正文；
- 现行引用无断链；
- 门禁能阻止回膨胀；
- 构建与验证全绿。
