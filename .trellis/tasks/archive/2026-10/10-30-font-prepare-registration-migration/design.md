# SenrenBanka 字体准备与注册迁移 — 技术设计

## App Data Model

### `fonts.config.json`（人工维护）

```json
{
  "schemaVersion": 1,
  "baseUrl": "https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download",
  "families": [
    {
      "id": "zhuque-fangsong",
      "cssVariable": "--font-zhuque",
      "fallbacks": ["Songti SC", "SimSun", "serif"]
    }
  ]
}
```

这是“页面需要哪些字体”的唯一人工选择；字体仓新增 family 不会自动启用。

### `fonts.lock.json`（生成、受控修改）

- 固定 catalog version、catalog URL/hash。
- 对每个启用 family 固定 family version、package release tag/file/SHA。
- `fonts:prepare` 与 `fonts:check` 只信任该锁和本地 catalog snapshot。

### `fonts.catalog.json`（生成快照）

- `fonts:update` 从固定目录下载并过滤出启用 family 的完整 metadata。
- 提交文本快照，离线构建不依赖 live catalog。

### `src/fonts/generated.ts`（生成）

导出 `localFontDefinitions`：

```ts
{
  name: 'Zhuque Fangsong',
  cssVariable: '--font-zhuque',
  fallbacks: [...],
  options: {
    variants: [
      { src: ['./.cache/fonts/1.0.0/zhuque-fangsong@1.0.0/fonts/abc123.woff2'], weight: '400', style: 'normal', unicodeRange: [...] }
    ]
  }
}
```

`astro.config.mjs` 映射为 `provider: fontProviders.local()` 并展开到现有 fonts 数组。固有不使用动态 import/glob，避免 CSS 聚合。

## Commands

```text
npm run fonts:update [-- --catalog-url URL]
npm run fonts:prepare [-- --offline]
npm run fonts:check
npm run fonts:audit [-- --dist dist --json path]
```

- `update` 需要网络，显式调用。
- `prepare` 默认只下载缺失资产；`--offline` 必须已有完整缓存。
- `check` 始终离线。
- audit 在 build 末尾执行；缺源 cmap 字符返回 0 并打印警告，基础设施错误返回非零。

## Download and Verification

1. 从本地 catalog 读取 family package pointer。
2. 构造 `${baseUrl}/${releaseTag}/${fileName}`，用 `fetch` 流式下载到临时目录。
3. 校验外层 SHA-256 与大小。
4. 用 `tar` 解到临时目录；filter 只允许 `manifest.json`、`fonts/`、`licenses/`、`font.css` 的普通文件，拒绝绝对路径、`..`、symlink、hardlink 和未声明文件。
5. schema 校验 package manifest；逐文件校验大小/SHA。
6. 全部通过后原子移动到最终缓存目录；失败清理临时目录，不破坏旧缓存。
7. 写入 `.complete.json`，包含 catalog/family version 与 lock digest；`check` 仍重算关键哈希而不只信 marker。

缓存目录：

```text
.cache/fonts/<catalogVersion>/<familyId>@<version>/
```

## Registration Generation

- 生成器按 family id 排序，JSON 稳定输出。
- 保留 fixed variant 的所有字段：`unicodeRange`、`weight`、`style`、`stretch`、`display`、`featureSettings`、`variationSettings`。
- core-cjk 一个 family 可生成上百 variants；Astro config 只展开数组。
- 生成文件头部标注“由 fonts:update 生成，勿手改”。

## Build and Offline Behavior

- `build` 先运行 `fonts:check`，避免 Astro 在缺文件时给出难以定位的底层错误。
- `fonts:prepare` 不挂 `postinstall`，不让安装阶段隐式联网。
- 6 个 npm provider family 设置 `optimizedFallbacks: false`，避免 `node_modules/.astro/fonts` 依赖 jsDelivr。验证若有其他首次网络路径，继续收敛到本地 package。
- 失败消息统一前缀 `[senrenbanka:fonts]`，包含缺失 family、当前目录锁和修复命令。

## HTML Audit

- 扫描 `dist/**/*.html`，HTML-only 页面无字体变量时跳过 CJK family 检查。
- 解析每个页面的 `:root` 字体变量声明，映射当前注册的 core-cjk family。
- 提取 body 可见文本，排除 script/style/注释；CJK 范围包含 BMP CJK、扩展 A/B+、兼容汉字。
- 对每个码位检查活动 core family 的分片覆盖并集。
- 生成去重报告，按页面汇总，限制控制台样本数量；`--json` 写完整报告。
- 不解析最终 CSS cascade。浏览器设计验证仍负责实测字体命中。

## Migration

1. 从当前 `astro.config.mjs` 和 `src/assets/fonts/README.md` 生成 `fonts.config.json` 初稿。
2. 接入真实字体仓 catalog/lock，运行 update/prepare/check。
3. 替换 astro.config 中 20 个 local family 为生成定义；保持旧 family 定义作为对比 fixture 直至产物等价验证。
4. 删除 `src/assets/fonts/` 二进制和许可证副本，保留 README 指向外部仓与版本。
5. 从 package.json 移除只服务于已迁移 local provider 的 Fontsource 直接依赖（保留 6 个 npm provider 所需项）。
6. 更新 .github workflow、README、docs/rules、docs/fonts、SPEC 与验证记录。

## Tests

- Node test fixtures：valid package、bad outer hash、bad file hash、missing family、schema error、path traversal、symlink、offline cache missing、reuse cache、unselected family not downloaded。
- Registration snapshot：20 families from catalog -> expected variants/families/fallbacks。
- Audit fixture HTML：covered CJK, uncovered CJK warns, no HTML fails, malformed catalog fails。
- `fonts:prepare` tests use local HTTP server, no external network。
- `npm run build` integration with real prepared release。

## Compatibility and Risks

- Astro local provider accepts project-root relative hidden cache files; this was verified in installed Astro source. Keep explicit weight/style so metadata inference is unnecessary。
- Windows atomic rename and path separator cases need tests。
- Large core CJK shard count may increase config size and build time; track generated variant count and build duration。
- SHA checks on every build add IO but ensure integrity; measure and keep under a reasonable few seconds。
