# 字体目录分发与核心 CJK 分片 — 实施计划

## Ordering

1. 完成子任务 A（字体仓与发布工具链）。
2. 使用 A 的固定目录/包接入子任务 B（主项目迁移）。
3. 父任务完成跨仓接口复核、ADR/文档收口、端到端验证和版本发布。

## Checklist

- [x] 审核子任务 A 的 schema、许可闸门、真实 20 家族目录、三个核心 CJK 分片包和 Release 清单；外部仓与 Release 保持只读，通过 lock/catalog 复核。
- [x] 审核子任务 B 的离线准备、缓存安全、生成注册、二进制迁移、内容审计和部署接线。
- [x] 新增 ADR `0012-external-font-catalog-and-cjk-shards.md`，并标注 ADR 0008 的修订边界。
- [x] 更新 `docs/README.md` 字体链路、`SPEC.md`、`docs/rules/visual-language.md`、`docs/rules/operations.md`、`docs/rules/pitfalls.md`、`docs/fonts/selection-guide.md`、根 README 与部署说明。
- [x] 检查现有规则和新增术语是否重复；`CONTEXT.md` 保留用户修改且未重复实现细节。
- [x] 主仓测试覆盖准备/缓存/离线/审计/篡改失败；外部仓发布工具由子任务 A 的只读 Release 证据复核，本轮不修改外部仓。
- [x] 执行 `npm ci`、`npm run fonts:prepare -- --offline`、`npm run build`，再在无效代理模拟下重复构建。
- [x] 用浏览器普通排版验证 11 套核心 CJK 设计、npm provider 设计与切换页的字体请求；不使用强制 `document.fonts.load()`，全部请求限于本站。
- [x] 执行 `design-page-verify` 的共享机制分支，更新 `docs/verification/shared.md`；记录截图、请求集合、总字节与当前成本。
- [x] 更新版本到 `0.18.0`，新增 `change-log/0.18.0.md`。
- [x] 检查所有当前相对链接、过期路径、`.local-fonts` 泄漏、`dist` 第三方域名与非 WOFF2 生产字体。
- [x] 提交主仓父任务变更；外部字体仓与已发布 Release 只读，主仓提交不包含字体二进制。

## Validation Commands

```bash
# 字体仓
npm ci
npm test
npm run catalog:validate
npm run release:build -- --out artifacts
npm run release:verify -- --dir artifacts

# 主仓
npm ci
npm run fonts:prepare
npm run fonts:check
npm run build
HTTP_PROXY=http://127.0.0.1:9 HTTPS_PROXY=http://127.0.0.1:9 NODE_USE_ENV_PROXY=1 npm run build
npm run test:html-only
```

需在实现时按实际脚本名调整，但不得减少“字体仓产物验证”“离线主构建”“HTML 审计”“设计浏览器验证”四类证据。

## Review Gates

- Gate 1：外部仓目录契约冻结后才能删除主仓字体二进制。
- Gate 2：真实 Release 包和校验和可用后才能生成主仓锁文件。
- Gate 3：`fonts:prepare` 和损坏/篡改测试通过后才能接入 Astro。
- Gate 4：`npm run build` 与离线模拟通过后才能更新验证记录和版本。
- Gate 5：全部文档引用和回滚说明完成后才能归档子任务/父任务。

## Risky Files

- `astro.config.mjs`：20 个 local family 注册将被生成数据替换。
- `src/assets/fonts/**`：整体迁移涉及 56 个文件；必须确认字体仓包已验证再删除。
- `package.json` / `package-lock.json`：新增脚本与依赖，移除不再直接使用的 Fontsource 包。
- `.github/workflows/deploy.yml`：缺少 prepare 会使部署失败。
- `docs/rules/`、`SPEC.md`、`README.md`：必须保持单一权威来源并同步链接。

## Rollback Points

- 字体仓发版前：只删除未发布本地产物。
- 主仓切换前：保留当前提交作为完整回滚点。
- 主仓迁移后：恢复旧 lock/catalog 或撤销提交；不得覆盖已发布 Release。
