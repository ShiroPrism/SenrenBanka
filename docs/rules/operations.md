# 构建、文档与发布操作

> **适用范围**：构建验证、文档维护、版本日志与 git 入库范围。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0010-agents-doc-index.md`](../adr/0010-agents-doc-index.md), [`../adr/0013-build-time-font-shard-pruning.md`](../adr/0013-build-time-font-shard-pruning.md), [`../adr/0014-content-subset-fonts.md`](../adr/0014-content-subset-fonts.md), [`../adr/0020-lint-format-and-lf-line-endings.md`](../adr/0020-lint-format-and-lf-line-endings.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 构建

- `npm run check`：文档门禁 + `check:eol` + `lint` + `format:check` + `fonts:typography`（Astro 字体注册与 26 套 styled CSS / 预览回退契约）+ `fonts:coverage` + `astro check`
- `npm run check:eol`：解析 `git ls-files --eol`，任一文本文件 index / worktree 不是 LF（CRLF 或 mixed）即失败
- `npm run lint`：ESLint flat config，覆盖 `src/**/*.{astro,ts}`、`scripts/**/*.mjs` 与配置文件；`Preview.astro` 的 `fonts` 导出按预览契约局部豁免
- `npm run format` / `npm run format:check`：Prettier 写入 / 检查源码与配置；`docs/`、Markdown、生成物与 lock 文件由 `.prettierignore` 排除
- `npm run fonts:update`：显式从固定字体目录更新 lock / catalog snapshot / 生成注册；不得自动追最新版本
- `npm run fonts:prepare`：按锁文件下载缺失 family 生产包并校验到 `.cache/fonts/`；同时为核心 CJK family 下载 source archive 并校验到 `.cache/font-sources/`。已有完整缓存只复核不重下；`-- --offline` 禁止网络
- `npm run fonts:check`：完全离线复核配置、锁、快照、生成注册、生产包缓存与核心 source cache；普通 `npm run build` 的第一步
- `npm run fonts:typography`：静态检查所有 npm / local registration 只有主 face，并检查所有 `styled` 设计及预览中字体变量后的显式回退与 CJK 顺序；已选用 core-cjk 的设计还必须在每个字体变量栈中保留核心字体
- `npm run fonts:subset`：`astro build` 之后的构建步骤，按最终 `dist` 中实际引用该族的页面语料从 core source font 生成每族一个 WOFF2 字形子集，并把页面的核心分片 `@font-face` 替换为一条无 `unicode-range` 的子集规则；未被引用的族跳过；`-- --dist <dir>` / `-- --dry-run` 可用
- `npm run fonts:prune`：`fonts:subset` 之后的构建步骤，按最终 `dist` 文本裁剪剩余分片并把保留的 `@font-face` 外置为共享哈希 CSS；`-- --dist <dir>` 指向其他产物目录，`-- --dry-run` 只报告不写盘。规则见下文「字体裁剪、内容子集与体积门禁」
- `npm run build`：`fonts:check` + check（含 lint / format / eol / typography / coverage）+ Astro 构建 + **`fonts:subset`** + **`fonts:prune`** + HTML-only 门禁 + **主分区标签门禁** + CJK 字体审计（部署集合适配）；设计注册表校验失败时以 `[senrenbanka]` 前缀明确报错，字体基础设施失败以 `[senrenbanka:fonts]` 前缀报错
- `npm run verify:sections`：`astro build` 之后扫描 `dist` 中每个 `[data-section]` 的 h2，按 Locale 校验只能由 `src/i18n/sections.json` 的 canonical / alias / 英文 canonical 组成；`scripts/section-labels.allowlist.json` 是迁移期债务清单，最终必须为空。`html-only` 同样覆盖，旧路径重定向页跳过。规则见 [`design-contract.md`](./design-contract.md)「信息架构与主题文案」。
- 干净 clone / CI / 三平台部署必须先执行 `npm run fonts:prepare`；`.cache/fonts/` 与 `.cache/font-sources/` 不入库，CI 按 `fonts.lock.json` 与 source 哈希复用
- 新设计页完成、或任一设计页 / 样式 / 构建配置 / 共享机制改动后：按 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）执行完整验证流程（步骤与通过标准以 skill 为准，本文件不重复维护清单）；验证状态更新至 `../verification/`（见「文档维护」节）
- 404 / 共享菜单 Locale 解析改动后：除完整流程外，必须执行 `design-page-verify` 的「单份 404 的 Locale 展示」专项，保留原错误 URL 实测路径优先级、偏好只读、菜单同步、无 JS 与 `--base`；当前状态写入 `../verification/shared.md` 与 `action-menu.md`。
- 根入口、语言偏好或随机模式改动后：按 `design-page-verify` 的「入口语言协商与入口随机」步骤跑浏览器语言矩阵、偏好优先 / 非法值回退、连续入口重抽、设计页刷新稳定、无 JS 回退与 `--base /demo` 存储键检查；无法实测的项如实写入验证记录。
- 临时调整 `site.config.yaml`（如切 `mode: fixed`）验证行为后，请恢复示例配置再提交

## 代码规范与行尾

- **Prettier**：`prettier.config.mjs` 固定 100 列、单引号、分号、尾逗号、`endOfLine: lf`，使用 `prettier-plugin-astro`。`prettier --write .` / `--check .` 覆盖源码与配置；`.prettierignore` 排除 `docs/`、Markdown、`dist/`、`.cache/`、`.astro/`、`src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json` 与本地工具目录。**不得**格式化生成文件或文档来通过检查。
- **ESLint**：`eslint.config.mjs` 使用 flat config（`@eslint/js` + `typescript-eslint` + `eslint-plugin-astro` + browser/node globals）。`src/designs/*/Preview.astro` 的 `fonts` 导出是切换页预览契约（`design-contract.md`），只对该路径关闭 `astro/no-exports-from-components`；不得全局关闭该规则。
- **行尾**：`.gitattributes` 的 `* text=auto eol=lf` + `.editorconfig` 把所有文本文件固定为 LF；二进制扩展名显式标记。`npm run check:eol` 用 `git ls-files --eol` 拦截 CRLF / mixed，已接入 `check`。Windows 下不要依赖 `core.autocrlf` 的默认行为；`fonts:check` 要求 `src/fonts/generated.ts` 为 LF。
- **存量修复**：错误链使用 `new Error(message, { cause })`；控制字符正则只在确有解析需求的 5 处局部禁用并写明理由；计数器最后一个自增的 `no-useless-assignment` 只对具体行豁免，不关闭规则。
- 新文件默认 LF、UTF-8、2 空格；Markdown 保留行尾空格以支持硬换行。改完源码后先 `npm run format`、`npm run lint`，再跑完整验证。决策见 `../adr/0020-lint-format-and-lf-line-endings.md`。

## 字体裁剪、内容子集与体积门禁

核心字体按最终产物中**实际引用该族的页面文本**生成内容子集（ADR `../adr/0014-content-subset-fonts.md` / `../adr/0019-per-family-font-corpus.md`）；非核心字体继续按分片裁剪，源字体、字体目录锁与分片集合保持不变（ADR `../adr/0013-build-time-font-shard-pruning.md`）。

- **源字体缓存**：`fonts:prepare` 只为核心 CJK family 下载 source archive 到 `.cache/font-sources/<catalogVersion>/<id>@<version>/`，验证外层哈希、source-manifest、源字体与 license 哈希；`fonts:check` 完全离线复核。source cache 缺失时必须先执行 prepare，不得让 `fonts:subset` 静默回退到分片。
- **语料来源是产物本身、粒度按族引用页**：`fonts:subset` 先解析最终 `dist` 的每个 HTML（原始文本 + 它链接的本地 CSS / JS），确定每页实际声明了哪些 core 族的 `@font-face` 规则；每个族的语料 = **所有非 HTML 文本资产**（共享 CSS / JS / JSON / SVG / XML / TXT / webmanifest）∪ **实际引用该族的页面原始 HTML**。解码 HTML 实体与 CSS 转义后收集码位；属性值、内联 JSON、模板与 JS 字符串都算，宁可多留字形，也不漏掉页面真正需要的字符。未被任何页面引用的族不生成子集、不产文件。**不要**另建语料清单或从源码渲染文本另行推导——那会与产物脱节。
- **核心字体内容子集**：`fonts:subset` 用固定版本的 `subset-font`（HarfBuzz WASM）从 source font 生成每族一个 WOFF2 子集，写入 `dist/_astro/fonts/`；逐页把该族全部分片规则替换为一条不带 `unicode-range` 的子集规则（保留 `font-family`、weight/style/display）。子集文件按语料哈希，内容变化会重新生成；不发布可安装桌面字体。子集字体必须是 Web-only WOFF2，许可依据见 ADR 0013 / 0014。
- **韩语 Hangul-only 子集与覆盖门禁**：`scripts: ["hangul"]` 的核心族先按引用页语料（与其它 core 族相同）收窄，再只保留 Hangul 区块并写 Hangul-only `unicode-range`；`fonts:audit` 按 script 分开校验（Hangul 族不要求覆盖 Hanja / 假名）；`fonts:coverage` 对声明 `ko` 的 `styled` 设计硬门禁（每个字体栈含 Hangul 核心变量 + 页面注册对应 `<Font>`），`html-only` 豁免。决策见 ADR 0017 / 0019。
- **繁中页面级字体路由与覆盖门禁**：`scripts: ["cjk", "han-traditional"]` 的 TC 核心族按实际引用页生成内容子集（不再使用全站统一语料，ADR 0019）；繁中页面在 `html:lang(zh-TW)` 内把 CJK/伴生变量重映射到 TC 族（伴生槽位用 `__senrenbanka_tc_skip__` 哨兵），TC `<Font>` 只在 zh-TW 页注册，简体核心与韩文伴生不在 TC 页注册。`fonts:coverage` 校验重映射与条件注册；`fonts:audit` 仍按 `cjk` 审计 TC 页，并忽略 locale 重映射产生的 `var(...)`/哨兵值。决策见 ADR 0018。
- **逐页决策、全站保留**：`fonts:prune` 每页只保留与该页语料相交的 `unicode-range` 规则（无 `unicode-range` 的子集规则始终保留）；字体文件按全站并集保留，任何页面仍需要的分片不删。删除范围固定为 `dist/_astro/fonts/`，路径解析拒绝 `..` 且必须落在 `dist` 内。
- **字体 CSS 外置**：保留规则写入 `dist/_astro/fonts-<hash>.css`，页面 `<head>` 用一条 `<link rel="stylesheet">` 引用；`--font-*` 变量与其他内联 CSS 原样保留。字体族集合相同的页面（同一设计的多语言版本）复用同一个包，包内是这些页面所需规则的并集。外置文件**只含 `@font-face`**，不含 `@charset`、注释或设计 CSS；不得把不同设计的普通 CSS 合并。
- **base 前缀来自既有产物 URL**：链接前缀从页面内已有的字体 URL 推导（`/demo/_astro/fonts/x.woff2` → `/demo/_astro/`），不读配置、不写死 `/`。带 `--base` 的构建必须重新执行本步骤后再验证。
- **不变量**：不改源字体与已发布分片字节、不改设计页面 / 文案 / 设计 CSS、不改锁与生成注册；核心子集是新生成的派生 Web WOFF2。重写后逐页 HTML 可见文本必须与重写前一致，否则中止且不删除任何字体文件。
- **体积门禁**：`dist` 全部文件字节之和（1 MiB = 1,048,576 B）超过 **10 MiB** 即构建失败；报错输出总量、字体统计、桶统计、最大文件与报告路径。**不得**为提高余量放宽阈值，应减少重复 HTML / 字体 CSS。
- **报告与复现**：`.cache/fonts/subset-report.json`（schema v2）记录 `corpusScope: "per-family"`、共享语料与每族的 `corpusPages` / `corpusCodePoints` / `corpusSha256`，以及 source 哈希、subsetter 版本、子集文件哈希/字节/覆盖字符；`.cache/fonts/prune-report.json` 记录前后字节、保留 / 删除的规则与分片、每页决策、体积桶与可见文本哈希。两者不入库，不含时间戳或机器路径。
- **审计按部署集合判定**（`fonts:audit`）：解析内联样式与链接的本地 CSS 中的 `@font-face`，任一 URL 指向的文件必须存在；`dist/_astro/fonts/` 下不得存在无人引用的分片；无 `unicode-range` 的核心子集规则必须用 `fontkitten` 读取真实 cmap，而不是当作全覆盖。源字体覆盖的 CJK 字符若未被该页部署规则/子集 cmap 覆盖必须失败；源字体本身缺字仍只警告。
- **不要手写 `@font-face`**：分片/子集注册由 `fonts:update` / `fonts:subset` 生成、字体 CSS 外置由 `fonts:prune` 完成；在设计 CSS 或组件里手写 `@font-face` 会绕过语料判定并让审计的孤儿检查失败。


## 文档维护（强制）

- 文档职责与引用关系见 `../README.md`（索引）；修改任何文档前先在该索引与既有记录中查找同一事实，避免重复维护。
- 新信息写入职责对应的既有文档，不因内容增加而随意新建文件：跨主题规则 → 本文件；单主题例外 / 适配 → `../designs/<id>/ADAPTATION.md`（仅确有例外时创建）；当前验证状态 → `../verification/`；版本历史 → `change-log/`；长期决策 → `../adr/`。
- 验证记录维护**最新完整状态**（更新式，不追加历史快照——历史由 Git 保留）；`change-log` 概括成果 / 修复 / 验证结论，不写逐次调试流水账。
- 官方原始 `DESIGN.md` **不得被改写成项目适配版本**（只读；偏差记入该主题 `ADAPTATION.md`）。
- 修改文档边界 / 章节位置后，必须同步更新全仓库引用（含 skill、ADR、change-log、源码注释），不留过期路径。

## 版本与变更日志

- 变更日志在 `change-log/` 下**一个版本一个文件，以版本号命名**（如 `change-log/0.1.0.md`）
- 版本规则：**大功能更新 `+0.1`**（0.1.0 → 0.2.0）；**小功能补丁 `+0.0.1`**（0.1.0 → 0.1.1）；与 `package.json` 的 `version` 保持同步
- 每次版本更新**新增**对应版本号的日志文件，不在旧文件上累积
- 日志内容概括该版本的重要成果、修复与验证结论；验证的**当前完整状态**在 `../verification/`，不在 change-log 重复维护

## 入库范围（git）

- skill 只入库**仓库定制化**的 `.agents/skills/design-page-verify/`；通用 skill（impeccable、grill-me 等）不入库
- `.trae/`、`.codex/`、`.impeccable/` 等本地工具目录不入库（规则见 `.gitignore`）
- 通用 skill 由使用者自行安装（如 impeccable：用于设计文档化 / 检测器 / 评审；`design-page-verify` 流程中的检测器步骤依赖它）
