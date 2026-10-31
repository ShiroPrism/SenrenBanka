# AGENTS.md 索引化技术设计

## 1. 设计目标

在不改变任何规则语义的前提下，把“自动加载成本”和“规则正文体积”解耦：

- 自动加载：根 `AGENTS.md` 只负责路由与硬门禁；
- 按需读取：任务需要时再读 `docs/rules/<topic>.md`；
- 单一正文：完整规则只在 `docs/rules/` 维护；
- 可持续：链接与预算门禁阻止重新膨胀。

## 2. 权威与读取模型

### 2.1 权威层级

| 层级 | 文件 | 职责 | 是否完整正文 |
|---|---|---|---|
| 自动入口 | `AGENTS.md` | 任务路由、8 条硬门禁、索引、Trellis 托管区块 | 否 |
| 规则索引 | `docs/rules/README.md` | 主题索引、读取时机、维护边界 | 否 |
| 规则正文 | `docs/rules/*.md` | 全部可执行规则 | 是 |
| 执行流程 | `.agents/skills/design-page-verify/SKILL.md` | 验证步骤与通过标准 | 是（流程） |
| 当前状态 | `docs/verification/` | 实测状态 | 是（状态） |
| 长期决策 | `docs/adr/` | 决策与取舍 | 是（决策） |

规则正文与执行流程不得互相复制；根文件只链接两者。

### 2.2 读取协议

根文件提供如下路由：

| 任务类型 | 必读 |
|---|---|
| 新增 / 修改 `styled` 设计 | `design-contract.md` + `visual-language.md` + `pitfalls.md` + `accessibility-responsive.md` |
| 新增 / 修改 `html-only` 设计 | `design-contract.md` + `accessibility-responsive.md` + `pitfalls.md` |
| 改数据 / 多语言 / 路由 | `data-and-i18n.md` + `pitfalls.md` |
| 改共享操作菜单 / 基础设施 chrome | `action-menu.md` + `accessibility-responsive.md` + `pitfalls.md` |
| 改构建 / 文档 / 发布 / git 范围 | `operations.md` |
| 排错 / 新增已知坑 | `pitfalls.md` + 对应主题文件 |

路由表只列“主文件 + 必要交叉引用”，不复制规则。

## 3. 文件结构

```text
AGENTS.md                         # 自动入口：路由 + 硬门禁 + 索引
docs/
├─ README.md                      # 全 docs 职责索引（更新）
├─ rules/
│  ├─ README.md                   # 规则主题索引与读取协议
│  ├─ data-and-i18n.md
│  ├─ design-contract.md
│  ├─ action-menu.md
│  ├─ visual-language.md
│  ├─ accessibility-responsive.md
│  ├─ pitfalls.md
│  └─ operations.md
├─ adr/
│  └─ 0010-agents-doc-index.md     # 新 ADR
└─ verification/                  # 不变
scripts/
└─ verify-agent-docs.mjs           # 文档门禁
```

## 4. 章节归口映射

原 `AGENTS.md` 二级章节按以下方式迁移，**内容不合并改写**：

| 原章节 | 目标文件 |
|---|---|
| 数据接口 | `data-and-i18n.md` |
| 多语言（i18n） | `data-and-i18n.md` |
| 每套设计必须满足 | `design-contract.md` |
| 可选 · 切换页预览碎片 | `design-contract.md` |
| 页面级操作入口：共享操作菜单 | `action-menu.md` |
| 动效（Motion） | `visual-language.md` |
| Iconography & Icon Library Rules | `visual-language.md` |
| Visual Assets & Cursor Rules | `visual-language.md` |
| 字体（Typography & Fonts） | `visual-language.md` |
| 无障碍与响应式 | `accessibility-responsive.md` |
| 已知坑 | `pitfalls.md` |
| 构建 | `operations.md` |
| 文档维护 | `operations.md` |
| 版本与变更日志 | `operations.md` |
| 入库范围（git） | `operations.md` |

每个目标文件保留原章节的规则条目与强调；只做以下允许的结构调整：

- 将原二级标题改为文件内稳定的二级标题；
- 文件顶部增加适用范围 / 权威 / 维护归属说明；
- 将原章节内的交叉引用改为新相对路径；
- 为便于定位，给长文件增加稳定的三级标题；不得借机重写规则。

## 5. 根文件草案结构

```markdown
# AGENTS.md — 项目规则入口

本文件只做两件事：列出不可延迟加载的硬门禁，并把任务路由到 docs/rules 正文。
完整规则以 docs/rules/ 为唯一正文来源。

## 硬门禁

1. ...
2. ...
...

## 任务路由

| 任务 | 必读 |
|---|---|
...

## 规则正文索引

- [规则索引](docs/rules/README.md)
- [数据与多语言](docs/rules/data-and-i18n.md)
...

## 文档边界

- 规则正文：docs/rules/
- 验证流程：.agents/skills/design-page-verify/SKILL.md
- 当前状态：docs/verification/
- 长期决策：docs/adr/

<!-- TRELLIS:START -->
...保留原内容，不修改...
<!-- TRELLIS:END -->
```

### 5.1 硬门禁的写法约束

每条硬门禁必须：

- 一句话可判定；
- 明确“必须”或“不得”；
- 带正文链接；
- 不包含实现细节、例外清单或历史原因。

### 5.2 预算

- 目标：根文件 ≤ 6,000 字符（含 Trellis 区块）。
- 硬上限：7,000 字符。
- 当前 Trellis 区块约 1,200 字符，留给路由与硬门禁约 4,800–5,800 字符。
- 超过硬上限时，门禁失败；调整预算必须同时更新 ADR 与门禁常量。
- 预算按 UTF-8 字符数计算，不用字节数，避免中文与英文混排造成口径漂移。

## 6. 文档门禁设计

### 6.1 输入

- 仓库根目录；
- `AGENTS.md`；
- `docs/rules/*.md`；
- `package.json` 中的 `check` 脚本。

### 6.2 检查项

1. **存在性**：`docs/rules/README.md` + 7 个主题文件均存在且非空。
2. **根预算**：`AGENTS.md` 字符数 ≤ 7,000。
3. **硬门禁**：根文件包含 8 个稳定标识，建议用不可见的 HTML 注释锚点或固定小标题：
   - `data-loader`
   - `profile-fields`
   - `internal-links`
   - `html-only-zero-assets`
   - `single-action-menu`
   - `css-isolation`
   - `reveal-visibility`
   - `verify-after-change`
4. **Trellis 区块**：`<!-- TRELLIS:START -->` 与 `<!-- TRELLIS:END -->` 均存在且顺序正确。
5. **索引完整**：根文件“规则正文索引”中的每个相对链接目标存在。
6. **链接有效**：根文件与 `docs/rules/*.md` 内所有相对 Markdown 链接均解析到真实文件；锚点可选校验（先校验文件，锚点作为后续增强）。
7. **重复标题**：`docs/rules/*.md` 的二级标题不得跨文件完全重复；显式白名单用于确有必要的通用标题（如“适用范围”）。
8. **禁止回填**：根文件中不得出现 docs/rules 正文的长段落；以根预算作为硬约束，辅以“根文件不得包含原章节标题”的检查。

### 6.3 输出与退出码

- 成功：单行摘要，退出码 0。
- 失败：逐项列出文件、检查名、原因，退出码 1。
- 不做自动修复；修复由人决定，避免门禁擅自改文档。

### 6.4 与 npm scripts 的接线

```json
"check:docs": "node scripts/verify-agent-docs.mjs",
"check": "npm run check:docs && astro check"
```

注意：现有 `check` 是 `astro check`，需改为串行组合；`build` 已调用 `npm run check`，因此自动继承。

### 6.5 测试

新增 `scripts/verify-agent-docs.test.mjs`，使用 Node 内置 `node:test`：

- 正例：临时目录中构造合规的最小文档集；
- 反例：超预算、缺文件、断链、缺硬门禁、缺 Trellis 区块、重复标题；
- 不依赖真实仓库内容，避免测试随文档改动而脆断。

`npm run check:docs` 先跑测试，再检查真实仓库：

```json
"check:docs": "node --test scripts/verify-agent-docs.test.mjs && node scripts/verify-agent-docs.mjs"
```

## 7. 引用迁移策略

### 7.1 分类

| 类别 | 处理 |
|---|---|
| 现行源码注释 / 现行设计文档 | 改为对应 docs/rules 相对路径 |
| 现行 `docs/verification/*` | 改为对应 docs/rules 路径；若只是“规则见 AGENTS.md”可改为“规则见 docs/rules/...” |
| `SPEC.md` / `README.md` / `docs/README.md` / selection guide / skill | 改为新权威模型与新路径 |
| 历史 change-log | 不改 |
| 已归档 Trellis 任务 | 不改 |
| 活跃 Trellis 任务 | 更新其 jsonl / md 中作为“当前规则来源”的引用；不改历史事实描述 |

### 7.2 迁移顺序

1. 先建立 docs/rules 正文并逐条比对；
2. 再改根文件；
3. 再迁移现行引用；
4. 最后接门禁与全仓库检索。

先改引用会造成中间态断链，故顺序不可颠倒。

### 7.3 锚点策略

- 优先链接到文件，不链接到易漂移的小节锚点；
- 只有确需精确指向时才使用 `#标题`，且标题必须稳定、语义明确；
- 根索引与 docs/rules/README 使用文件级链接。

## 8. ADR 内容要点

新 ADR `0010-agents-doc-index.md` 记录：

- 背景：自动加载 14k tokens，规则增长导致成本与可读性双重问题；
- 决策：根文件索引化，docs/rules 单一正文；
- 被否决项：继续单文件、根与 docs 双正文、按设计拆文件、嵌套 AGENTS.md；
- 后果：多一次按需读取；需要链接与预算门禁；引用迁移一次性成本；
- 修订条件：预算调整、主题文件拆分/合并、根硬门禁增删。

## 9. 兼容性与回滚

- 不改变任何构建产物与页面行为；本任务只改文档、脚本与 npm 脚本。
- `astro check` 仍执行，只是前置文档门禁。
- 若门禁导致正常开发受阻，可临时单独运行 `astro check` 定位；不得直接删除门禁。
- 回滚单位：先回滚根文件与 docs/rules，再回滚引用；门禁脚本最后回滚，避免中间态无人检查。

## 10. 已知风险与缓解

| 风险 | 缓解 |
|---|---|
| 拆分时语义漂移 | 逐章节 diff 比对 + AC4 人工复核 |
| 根文件漏红线 | 固定 8 条硬门禁 + 路由抽查 |
| 引用漏改 | 全仓库 `rg` + 链接门禁 |
| 门禁误报 | 白名单仅限通用标题；错误信息可定位 |
| 预算过紧 | 7,000 字符硬上限，ADR 记录调整流程 |
| Trellis 更新覆盖 | 只替换托管区块之外内容；保留首尾标记 |
