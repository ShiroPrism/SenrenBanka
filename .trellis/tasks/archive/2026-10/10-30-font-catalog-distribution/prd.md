# 字体目录分发与核心 CJK 分片

## Goal

让开发者 fork SenrenBanka 后可以安全替换任意资料文字：核心 CJK 字体只要源字体包含相应字形，就继续使用设计字体；同时把自定义字体从主仓库解耦到可版本化、可镜像、可校验的独立字体目录，使新增冷门 CJK 字体不需要复制下载或裁字代码。

## Background

- 当前自定义字体二进制提交在 `src/assets/fonts/`，四个大字体是手动按站内用字裁出的静态子集。
- `profiles/*.yaml` 变化不会重新裁字；新增字符会静默回退系统字体。`make-web-subsets.py` 找不到源文件时也只是跳过。
- `.local-fonts/` 被忽略，fork 不具备重新生成所需源字体。
- 当前有 20 个经 `local()` 注册的字体族；Fontsource npm provider 的 6 个字体族不属于本轮迁移范围。
- 用户已确认：核心 CJK 覆盖率、独立字体仓、固定版本 Release、显式离线准备、schema 驱动扩展和完整分片方向。

## Requirements

- R1：Zhuque Fangsong、LXGW WenKai GB、Ark Pixel 12px 承担核心 CJK 覆盖承诺；未来新增 CJK 字体可显式取得该角色。
- R2：核心 CJK 字体按源字体完整字形集生成 `unicode-range` 分片；源字体存在的字符不依赖 fork 时重新裁字。
- R3：源字体本身缺字时允许系统回退，但必须产生可定位的审计警告；字体包缺失、清单损坏或校验失败必须构建失败。
- R4：所有 20 个非 npm provider 生产字体族迁移到独立字体仓；Fontsource npm provider 的 6 个字体族继续使用 npm。
- R5：字体仓采用固定目录快照和每家族独立版本；主项目通过锁文件固定目录、家族版本和校验和。
- R6：每个家族以独立压缩包发布；完整源字体另包，不提交进字体仓 Git。
- R7：Release 是规范下载源；下载 URL 支持可配置 base URL，以支持镜像或代理。
- R8：`fonts:update` 是唯一升级入口；普通安装、准备和构建不得自动追最新版本。
- R9：`fonts:prepare` 显式下载、校验并原子解压到忽略缓存；缓存就绪后默认构建不访问网络。
- R10：主项目保留 Astro `fonts`/`local()`/`<Font>` 管线；字体注册由锁文件和清单生成，不手工枚举全部 CJK 分片。
- R11：新增字体的常规扩展只需增加 schema 描述、许可、来源和生成配置，并更新主项目锁与设计注册；不得复制下载器、校验器或 Astro family 结构。
- R12：许可闸门仍为强制人工门槛；未批准再分发、缺许可证或 RFN 处理不合规的字体不得发布。
- R13：最终构建 HTML 执行 CJK 缺字审计；审计不替代构建期字体包完整性检查。
- R14：ADR、规则、SPEC、README、部署说明、验证记录与 changelog 必须反映新的单一事实来源。
- R15：字体变量不得把系统 CJK fallback 封装在拉丁字体之前；每个设计的 CSS 必须拥有完整 fallback 顺序，浏览器实际排版（非强制 `fonts.load()`）必须命中对应核心 CJK 字体。
- R16：迁移前的“站内子集”、旧体积和已删除 `src/assets/fonts/` 路径必须在全部现行设计文档中清除；厂商只读 `DESIGN.md` 不得改写。

## Child Tasks

- `10-30-font-catalog-release-toolchain`：字体仓 schema、源获取、分片、打包、校验、目录 Release、扩展文档和测试。
- `10-30-font-prepare-registration-migration`：主项目锁文件、离线准备、生成式 Astro 注册、资产迁移、审计、部署和测试。
- 父任务：固定跨仓契约，审查子任务交付，完成 ADR / 文档收口、版本发布与最终端到端验证。

## Acceptance Criteria

- [x] 字体仓能仅凭新家族描述、许可证和固定源输入生成核心 CJK 分片或固定 Web 资产；新增第二套同类字体不需要修改工具代码。
- [x] 目录快照可复现地列出版本、家族包、源包、覆盖范围和 SHA-256；错误许可证、源哈希不符、包篡改和目录穿越均被拒绝。
- [x] 主项目干净克隆后通过 `npm ci`、`fonts:prepare`、`npm run build`；准备完成后在无网络模拟下构建成功。
- [x] `src/assets/fonts/` 不再包含已迁移字体二进制；普通构建从锁定的缓存资产注册字体。
- [x] 三套核心 CJK 字体在源字体覆盖字符范围内使用设计字体；缺分片/包损坏失败，源 cmap 缺字产生审计警告。
- [x] 最终 HTML 审计覆盖全部已构建页面，且不会因没有候选页面而空转通过。
- [x] 六个 npm provider 字体族不再在首次构建时访问 jsDelivr 获取 fallback metrics，或最终离线构建验证证明没有类似网络依赖。
- [x] 字体仓与主项目均有自动化测试覆盖正常路径和关键失败路径；主项目 `npm run build` 全绿。
- [x] 设计验证流程已在代表核心 CJK 设计、npm 字体设计和切换页上执行，并更新 `docs/verification/shared.md`。
- [x] 新 ADR、`SPEC.md`、`docs/rules/`、字体指南、README、部署说明、`CONTEXT.md` 和 changelog 之间无重复权威来源或断链。
- [x] 代表性核心 CJK 页面在无需强制加载的普通排版中实际命中 Zhuque/LXGW/Ark Pixel；切页请求日志同时证明未提前命中系统中文。
- [x] 所有现行设计文档不再把已退役 site subset 当作当前事实，厂商规范保持只读。
- [x] 版本号与 `change-log/` 按项目规则更新，回滚路径记录为恢复上一目录锁或回退提交。

## Out of Scope

- 改变设计选型、字体角色分配或具体视觉规范。
- 将 Fontsource npm provider 的 6 个字体镜像进独立字体仓。
- 运行时的第三方字体请求、服务端动态裁字或按访问者生成字体。
- 首版引入 minisign/公钥签名体系。
- 运行时自动更新字体。

## Constraints

- 生产字体必须自托管，运行时不得请求第三方字体。
- 字体发布必须通过许可闸门；RFN 字体不得在修改后沿用保留名称。
- `.local-fonts/` 仍只作本机发现与样张工作台，不得进入构建。
- 主项目默认构建不得依赖网络；首次准备必须显式执行。
- HTML-only 设计继续不加载字体。

