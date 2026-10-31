# SenrenBanka 字体准备与注册迁移 — 实施计划

## Prerequisite

必须等字体仓子任务产出真实 `catalog-v1.0.0`、20 个 family packages 和可访问 Release；不得用占位 URL 删除主仓资产。

## Checklist

- [x] 新增 `fonts.config.json` 初稿，覆盖当前 20 个 local family 的 app-only 映射。
- [x] 实现 catalog/lock/schema 校验与 `fonts:update`，生成 catalog snapshot 和 `src/fonts/generated.ts`。
- [x] 实现安全下载、tar 解包、原子缓存、`fonts:prepare` 与 `fonts:check`。
- [x] 用字体仓真实 catalog 生成锁文件和注册模块。
- [x] 修改 `astro.config.mjs` 展开生成定义；为 npm provider family 关闭 optimized fallback metrics。
- [x] 验证构建产物中 20 family 的 CSS 变量、fallback、variant 与迁移前等价。
- [x] 验证三核心 CJK 页面按 `unicode-range` 只请求所需分片。
- [x] 删除 `src/assets/fonts/` 已迁移二进制和许可证副本；重写 README 指向字体仓。
- [x] 移除不再使用的 Fontsource 直接依赖，更新 lockfile。
- [x] 实现 `fonts:audit` 与 Node 测试，加入 build 末尾。
- [x] 更新 `.github/workflows/deploy.yml`、README 和部署说明。
- [x] 更新字体规则/指南与 SPEC 中旧的“已提交字体资产/站内子集”事实。
- [x] 运行 Node 测试、`npm run build`、HTML-only 验证与无网络模拟构建。
- [x] 浏览器验证代表设计、切换页和网络请求，记录字体请求集合/字节与截图。

## Validation Commands

```bash
npm ci
npm run fonts:update -- --catalog-url <catalog-url>
npm run fonts:prepare
npm run fonts:check
npm test
npm run build
HTTP_PROXY=http://127.0.0.1:9 HTTPS_PROXY=http://127.0.0.1:9 NODE_USE_ENV_PROXY=1 npm run build
npm run test:html-only
```

浏览器验证至少覆盖：

```text
/zh-cn/archive/    Zhuque
/zh-cn/cute-alism/ LXGW
/zh-cn/radio/      Ark Pixel
/zh-cn/frost/      npm provider fallback path
/zh-cn/designs/    shared switcher font set
```

## Review Gates

- 生成注册与人工 `fonts.config.json` 一致，字体仓不能自动启用 family。
- 缓存/锁/快照三者任一不一致都失败。
- 所有二进制删除发生在真实构建和网络验证之后。
- 离线模拟构建通过前，不得在文档宣称“准备后完全离线”。
- HTML 审计与浏览器 `document.fonts.check()` 都有证据。

## Risky Files

- `astro.config.mjs`：大段 family 注册被替换，需逐项对比。
- `package.json` / lockfile：依赖删除和脚本顺序影响部署。
- `.github/workflows/deploy.yml`：缺 prepare 会让生产构建失败。
- `src/assets/fonts/**`：56 个文件迁移不可逆内容删除，必须在 commit 前完成产物对照。
- `docs/rules/`、`SPEC.md`、`README.md`：旧事实必须同步，不留双源。

## Rollback

- 保持迁移前 git 提交为回滚点。
- 生成文件与锁可恢复上一 catalog 版本；缓存可重取。
- 若字体仓故障，可临时用镜像 base URL；若 Release 永久不可用，回退主仓提交恢复已提交字体资产。
