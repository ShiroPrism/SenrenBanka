# 字体目录、分片与发布工具链

## Goal

在独立 `SenrenBanka-fonts` 仓库建立可复用的字体发行系统：以 schema 描述任意非 npm 字体，固定源输入，生成核心 CJK 分片或固定 Web 资产，执行许可闸门，并发布不可变、可校验、可镜像的家族包与目录快照。

## Background

- 当前字体资产只有主仓库内的人工产物，没有独立发布契约。
- 新冷门 CJK 字体必须避免每次增加一套专用脚本。
- 首版需要承载当前 20 个非 npm provider 字体族，其中 Zhuque、LXGW、Ark Pixel 为核心 CJK。
- 字体仓 Git 不应保存 TTF/OTF 大文件；源文件随发行版本保存为独立资产。

## Requirements

- A1：创建公开的独立字体仓 `whitehair-failure/SenrenBanka-fonts`（本地路径 `F:\SenrenBanka-fonts`），与主仓独立版本化。
- A2：定义并验证 family descriptor、family manifest 和 catalog 的 versioned JSON schema。
- A3：family descriptor 支持固定源 URL + SHA-256、受控 bootstrap 输入、上游版本/commit、许可证证据和 RFN 信息。
- A4：核心 CJK 使用固定版本 `cn-font-split@7.4.3` 生成约 70 KiB 的完整 `unicode-range` 分片；固定字体发布现有 WOFF2 variants。
- A5：构建前强制人工许可批准；未批准、缺许可证文件或 RFN 不合规时失败。
- A6：用 `fontkitten` 验证输出字体实际 family、weight、style、格式、覆盖范围与声明一致。
- A7：每个家族生成确定性 `.tar.gz`，包含 manifest、字体、许可证和所需 CSS；源文件另打 source archive。
- A8：目录 Release 使用不可变快照；每家族独立版本和 Release tag；catalog 记录可组合的 `baseUrl/releaseTag/fileName`。
- A9：所有发布资产生成 SHA-256；禁止覆盖已存在 tag/资产。
- A10：Git 只提交 schema、descriptor、许可证和工具代码，不提交源 TTF/OTF 或生成字体包。
- A11：首版目录必须覆盖当前 20 个 local provider 字体族；Fontsource npm provider 的 6 个字体族不镜像。
- A12：新增字体只需增加 descriptor、许可证、来源和输出配置；下载、校验、打包、catalog 代码不得复制。
- A13：提供本地 build/verify 命令和 GitHub Actions 发布工作流，失败路径有自动化测试。
- A14：首版 12 个无公开直链的固定字体源必须能生成确定性 bootstrap 包，并在发布前按 descriptor 白名单验证成员、大小、SHA-256 与路径安全；bootstrap 包独立发布为不可变资产，后续版本从家族 source archive 重建。
- A15：发布流程不得依赖 Actions token 查询仓库级 Immutable Releases 设置；必须统一为创建空 Draft、上传资产、远端完整性校验、元数据/tag 校验、最后 Publish。失败可保留 Draft 供幂等恢复，不得删除或覆盖已发布 Release、tag 或资产。

## Acceptance Criteria

- [x] 仓库可在 Node 22.12+ 执行 `npm ci && npm test`；无源二进制进入 Git 跟踪。
- [x] schema 正例通过，缺必需字段、未知 role、重复 id、无效 semver、未批准许可证均失败。
- [x] 源 URL/归档路径可解析；SHA 不符、压缩包损坏、目标源文件缺失均失败。
- [x] 核心 CJK 输出包含互不重叠的 `unicode-range` 分片，覆盖源字体 cmap，CSS 与 manifest 指向同一文件集合。
- [x] 固定字体输出保持原 family、weight、style、stretch、unicode-range 和 fallbacks 所需元数据。
- [x] 包内文件大小/哈希与 manifest 一致；符号链接、绝对路径、`..`、重复文件和未声明文件被拒绝。
- [x] 连续两次从相同缓存源构建同版本，外层 SHA-256 完全一致。
- [x] 目录验证能发现缺失家族包、版本漂移、错误哈希和不存在的 `baseUrl/releaseTag/fileName` 组合。
- [x] 初始 catalog 含 20 个 local family；三个核心 CJK 为 core-cjk 且发布完整分片。
- [x] 发布工作流只以完整草稿事务发布，失败不会留下半发布状态。
- [x] bootstrap 生成器可从受控目录只收集 descriptor 声明且无公开直链的文件，连续两次输出字节一致；解包验证拒绝缺失、额外、路径穿越、链接和哈希不符成员。
- [x] 新 Release 只有在全部资产上传并通过文件名、大小、SHA-256、Release tag/draft 状态校验后才 Publish；中途失败留下可恢复 Draft，重跑可补齐缺失资产，已发布版本保持不变。
- [x] 新增测试 fixture 字体只通过数据变更即可走完整构建，不需要修改工具源码。
- [x] README 记录新字体接入、许可审核、版本发布、镜像布局和回滚流程。

## Out of Scope

- 主项目 `fonts:prepare`、Astro 注册或页面审计。
- Fontsource npm provider 的 6 个字体。
- 在线管理 UI、数据库或服务端 API。
- 自动推断字体许可。
- 首版 minisign/公钥签名。

## Constraints

- 源字体可能很大，Git 历史必须保持轻量。
- 核心 CJK 分片必须适配静态托管和 `unicode-range` 惰性加载。
- Release 资产必须公开可下载；仓库不得包含不可再分发字体。
- 构建输出必须跨 Windows/Linux CI 一致。

