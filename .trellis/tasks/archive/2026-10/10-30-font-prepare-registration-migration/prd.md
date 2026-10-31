# SenrenBanka 字体准备与注册迁移

## Goal

把主项目的非 npm 自定义字体切换为外部目录发行物：干净 clone 通过显式准备获得固定缓存，普通构建完全离线，Astro 注册由清单生成；fork 修改资料后，源字体覆盖范围内的任意 CJK 字符继续使用设计字体，缺字可审计。

## Background

- 依赖上一个子任务的公开字体目录与家族包。
- 当前 20 个 local provider family 在 `astro.config.mjs` 手工注册，字体二进制在 `src/assets/fonts/`。
- 当前资料改动不会触发字体更新，缺字静默回退；用户确认要改为固定完整分片。
- npm provider 的首次 fallback metrics 网络问题是剩余离线缺口。

## Requirements

- B1：主仓增加 `fonts.config.json`、`fonts.lock.json`、`fonts.catalog.json` 与生成的注册模块；只有前两者及其生成结果进入版本控制，字体包进入忽略缓存。
- B2：`fonts:update` 显式拉取固定目录，验证 schema、许可和哈希，更新 catalog/lock/generated registration；不自动追最新。
- B3：`fonts:prepare` 按锁文件下载启用家族，校验外层和包内哈希，拒绝路径穿越/链接/未声明文件，并原子安装到 `.cache/fonts/`。
- B4：`fonts:check` 完全离线验证缓存、锁和 generated registration 一致。
- B5：`astro.config.mjs` 通过生成的 `local()` 定义保持 20 个 family 的名称、CSS 变量、fallback、weight/style/stretch/unicode-range 行为；不手工列出 CJK 分片。
- B6：删除 `src/assets/fonts/` 中已迁移的字体二进制和许可证副本；仅保留迁移/来源索引。Fontsource npm provider 的 6 个字体不动。
- B7：普通 `npm run build` 先执行 `fonts:check`；缓存未准备时明确失败，不自动下载。
- B8：将 npm provider family 的构建期 metrics 网络依赖消除，保证准备完成后构建可离线。
- B9：`fonts:audit` 扫描最终 HTML；缺字输出含页面、字符、码位、活动核心字体和报告路径的警告；无候选页面/缓存错误/元数据错误失败。
- B10：CI 与三平台部署说明增加 prepare；GitHub Actions 缓存按锁文件哈希复用。
- B11：自动测试覆盖准备、校验、离线、篡改、路径安全、生成注册和 HTML 审计正常/失败路径。
- B12：主仓 README 快速开始、Cloudflare/Vercel 构建命令、字体指南和相关规则同步迁移。

## Acceptance Criteria

- [x] 干净 clone 执行 `npm ci && npm run fonts:prepare && npm run build` 成功。
- [x] `fonts:prepare` 后第二次运行只做校验，不重新下载；删除一个缓存文件后 `fonts:check` 失败并给出可执行提示。
- [x] 错误外层 SHA、错误包内文件、缺家族、未知 schema、未批准许可、路径穿越和 symlink 包均失败。
- [x] `fonts:update` 只更新锁/快照/生成注册；不改变设计使用关系，不自动接入未选择字体。
- [x] 20 个 family 在构建产物中的 family/CSS 变量/fallback/字重/样式与迁移前等价；核心 CJK 页面只请求命中的分片。
- [x] 迁移后 Git 不跟踪任何 `.woff2`/`.ttf`/`.otf`/`.woff` 生产字体二进制。
- [x] 在无效代理/无网络模拟下，完成 prepare 后 `npm run build` 通过。
- [x] 资料中出现源字体不支持的 CJK 字符时，审计报告列出字符并警告；构建仍完成。
- [x] 分片/缓存/清单损坏时审计前或构建期失败，不能带病产出。
- [x] GitHub Pages 工作流和 README 三平台说明均包含准备步骤。
- [x] Node 测试与 `npm run build` 全绿；HTML-only 产物的零字体/零脚本约束不回归。
- [x] 切换页与至少 Zhuque、LXGW、Ark Pixel 三套设计在浏览器中 `document.fonts.check()` 命中，网络无第三方字体请求。

## Out of Scope

- 字体仓 schema、分片生成和 Release 发布。
- 新增设计或改变 fallback 视觉策略。
- Fontsource npm provider 字体迁入外部仓。
- 自动后台升级字体。
- 运行时生成子集。

## Constraints

- `.cache/` 被忽略；不得把缓存路径写入公开页面或构建产物。
- 必须保留用户已有 `CONTEXT.md` 修改。
- 字体路径变化不得触发跨设计 CSS 聚合。
- 生产 `dist` 仍只含自托管 WOFF2，无第三方域名。

