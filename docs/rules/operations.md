# 构建、文档与发布操作

> **适用范围**：构建验证、文档维护、版本日志与 git 入库范围。
>
> **权威级别**：本文件是该项目主题规则的唯一正文来源；根 `AGENTS.md` 只提供硬门禁与路由。
>
> **相关决策**：[`../adr/0010-agents-doc-index.md`](../adr/0010-agents-doc-index.md)
>
> **维护归属**：规则变更先修改本文件，再检查根索引与引用。

## 构建

- `npm run check`：文档门禁 + `fonts:typography`（Astro 字体注册与 23 套 styled CSS / 预览回退契约）+ `astro check`
- `npm run fonts:update`：显式从固定字体目录更新 lock / catalog snapshot / 生成注册；不得自动追最新版本
- `npm run fonts:prepare`：按锁文件下载缺失 family 并校验到 `.cache/fonts/`，已有完整缓存只复核不重下；`-- --offline` 禁止网络
- `npm run fonts:check`：完全离线复核配置、锁、快照、生成注册与缓存；普通 `npm run build` 的第一步
- `npm run fonts:typography`：静态检查所有 npm / local registration 只有主 face，并检查所有 `styled` 设计及预览中字体变量后的显式回退与 CJK 顺序
- `npm run build`：`fonts:check` + check（含 typography）+ Astro 构建 + HTML-only 门禁 + CJK 字体审计；设计注册表校验失败时以 `[senrenbanka]` 前缀明确报错，字体基础设施失败以 `[senrenbanka:fonts]` 前缀报错
- 干净 clone / CI / 三平台部署必须先执行 `npm run fonts:prepare`；`.cache/fonts/` 不入库，CI 按 `fonts.lock.json` 哈希复用
- 新设计页完成、或任一设计页 / 样式 / 构建配置 / 共享机制改动后：按 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）执行完整验证流程（步骤与通过标准以 skill 为准，本文件不重复维护清单）；验证状态更新至 `../verification/`（见「文档维护」节）
- 临时调整 `site.config.yaml`（如切 `mode: fixed`）验证行为后，请恢复示例配置再提交

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
