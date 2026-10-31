# 字体目录、分片与发布工具链 — 实施计划

## Checklist

- [x] 创建 `F:\SenrenBanka-fonts` 与公开 GitHub 仓，初始化 Node 24 ESM、测试、ignored 缓存/产物目录。
- [x] 实现 schema 与 descriptor loader，覆盖 20 个当前 local family 的最小描述。
- [x] 实现许可闸门、来源解析、SHA 校验和安全解压。
- [x] 实现确定性 bootstrap 包生成器与白名单校验，覆盖首版 12 个无公开直链的固定字体源。
- [x] 实现固定字体打包与核心 CJK `cn-font-split` 分片，解析 CSS 为 machine-readable variants。
- [x] 实现字体元数据/覆盖验证、确定性 family package/source archive 和包内 manifest。
- [x] 实现 catalog 构建、互链校验与 `release:verify`。
- [x] 接入初始字体数据，生成 20 个家族包和 `catalog-v1.0.0`。
- [x] 实现 GitHub Actions 发布工作流与不可变 tag 防护。
- [x] 移除 runtime Immutable Releases API 依赖，改为空 Draft → 上传 → 远端校验 → Publish 的幂等事务。
- [x] 编写新增字体、许可审核、镜像和回滚文档。
- [x] 运行全部测试与两次确定性构建比较，记录 artifact 路径和 SHA。

## Validation Commands

```bash
npm ci
npm test
npm run catalog:validate
node scripts/build-catalog.mjs --out artifacts --bootstrap-dir <controlled-input-dir>
npm run release:verify -- --dir artifacts
```

## Review Gates

- 20 个 family 全部有 descriptor、许可证与固定 provenance。
- 三套 core-cjk 的分片并集覆盖源 cmap，CSS 与 manifest 一致。
- 许可/RFN 失败路径有测试。
- 没有源字体或生成包进入 Git status。
- 初始 `catalog.json` 中所有家族包/源包 SHA 可重算并可定位。

## Risky Files

- family descriptor 字段一旦发布应视为 v1 契约；新增字段必须兼容旧 parser。
- `cn-font-split` 输出文件名/CSS 格式解析是升级风险点，必须固定版本并对解析做回归测试。
- 确定性归档设置依赖 `tar` 实现，升级时必须重跑双构建 hash 测试。

## Rollback

- 在创建 GitHub Release 前失败：删除本地 `artifacts/` 并修复输入。
- 已创建家族 Release 后：不覆盖；修复后提升家族版本并发布新 catalog。
- 工具回归：恢复上一工具 commit，仍可按旧 descriptor 重建旧版本。
