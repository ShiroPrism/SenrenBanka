# 字体目录分发与核心 CJK 分片 — 技术设计

## Architecture

系统分为三个独立边界：

```text
SenrenBanka-fonts (独立 Git 仓 / GitHub Releases)
  family descriptors + licenses + release toolchain
        ↓ catalog snapshot + immutable family packages
fonts.lock.json + fonts.catalog.json + app selection
        ↓ explicit fonts:prepare
.cache/fonts/<catalog>/<family>@<version>/
        ↓ generated registration metadata
Astro local() → <Font> → dist/_astro/fonts/*.woff2
        ↓ post-build HTML audit
warning report (no third-party runtime request)
```

字体仓是唯一发布源；主仓库是唯一应用注册源。字体仓不得决定页面使用哪些字体，主仓库不得维护可发布的字体二进制副本。

## Cross-Repository Contract

### Family descriptor

- schema 带 `schemaVersion`，首版为 `1`。
- 稳定标识使用 kebab-case `id`；显示名、权重、样式和 CSS family 分开。
- `role` 至少支持 `core-cjk` 与 `fixed`。
- `version` 表示分发版本；上游版本/commit、来源 URL、源 SHA-256 单独记录。
- 许可证记录 SPDX、许可证文件、人工批准、评审日期、证据 URL 和 RFN 信息。
- `output` 描述固定资产 variants 或 `cn-font-split` 配置；工具版本和分片目标必须显式固定。

### Family package

- 使用 `.tar.gz`，根目录含 `manifest.json`、`licenses/`、`fonts/`；核心 CJK 包同时含生成 CSS。
- manifest 列出每个文件的相对路径、大小、SHA-256、字体变体和覆盖范围。
- 包内只允许普通文件；符号链接、硬链接、绝对路径、`..` 路径和解压后越界路径全部拒绝。
- 固定字体保持现有 variant/unicode-range/weight/style/stretch 行为；核心 CJK 使用互不重叠分片。

### Catalog release

- 每次目录发布有独立 tag，资产至少包含 `catalog.json` 和 `catalog.json.sha256`。
- 每家族包放在独立 tag：`font-<id>-v<version>`。
- catalog 记录 `baseUrl + releaseTag + fileName` 的可组合定位信息，不把 `latest` 固化为构建依赖。
- 目录更新可引用未变家族的原版本与既有 Release；升级一个家族不要求重新上传其他家族。
- GitHub Release 设置不可变；发布已存在 tag 必须失败，禁止覆盖资产。

## Source and License Pipeline

1. 解析并验证 family descriptor。
2. 检查许可批准、许可证文件和 RFN 声明；任何缺口 fail closed。
3. 从固定 URL/SHA 或受控 bootstrap 输入解析源文件。
4. 若使用 RFN 字体产生修改版本，先按 schema 要求使用不同发布名称并验证实际 `name` 表；未满足则失败。
5. 核心 CJK 使用固定 `cn-font-split@7.4.3`，初始目标 `70 KiB`、`languageAreas: true`、保留 OpenType features，并关闭测试 HTML/预览等非生产产物。
6. 固定字体直接标准化既有 WOFF2 与 variant 元数据。
7. 用 `fontkitten` 校验实际 family、weight、style、格式和声明覆盖。
8. 生成确定性 JSON/CSS/tar.gz；同一输入连续构建必须产生相同外层 SHA-256。
9. 将源文件打成独立 source archive，并附目录清单与哈希。

源字体在 Git 中只保留描述与哈希，不提交 TTF/OTF。首次迁移可使用现有资产/本地源作为受控 bootstrap 输入；发布后同版本重建必须能从 Release source archive 获得。

## Main Repository Contract

### Human-maintained files

- `fonts.config.json`：启用的 family id、`cssVariable`、fallbacks 和必要的 app-only 覆盖。
- `fonts.lock.json`：目录 release、base URL、已选家族版本、外层包/目录哈希。
- `fonts.catalog.json`：`fonts:update` 生成的离线目录快照，只保留启用家族。

### Generated files

- `src/fonts/generated.ts`：把目录 variants 转为 Astro `local()` family 定义，路径指向 `.cache/fonts/...`。
- 生成文件受版本控制，以便 `astro check` 和代码审阅；字体二进制不进入 Git。
- `astro.config.mjs` 只展开生成定义，不再手写 20 个 family 或 CJK 分片。

### Commands

- `fonts:update`：拉取固定目录 URL，验证 schema/许可/哈希，更新 catalog snapshot、lock 和 generated registration。只有显式执行才联网。
- `fonts:prepare`：读取本地 catalog/lock，下载缺失家族包，校验外壳与包内文件，原子安装到缓存。
- `fonts:check`：纯离线验证缓存完整性和 generated registration 一致性。
- `fonts:audit`：构建后扫描 `dist/**/*.html`，输出 CJK 覆盖警告和机器可读报告。

## Cache and Asset Flow

- 缓存根：`.cache/fonts/<catalogVersion>/<familyId>@<familyVersion>/`。
- 下载文件先进入临时目录；外壳 SHA、manifest、文件 SHA 全部通过后才原子换入。
- 已存在缓存也校验；损坏缓存在 `prepare` 时重取，在 `check` 时失败并提示。
- Astro local provider 可以读取项目根下的隐藏缓存路径；不复制到 `src/`，因此不存在“每次资料变化覆盖字体目录”的路径。

## Build Integration

- `npm run build` 顺序：`fonts:check` → 现有 check → `astro build` → HTML-only 验证 → `fonts:audit`。
- `fonts:prepare` 不自动挂在 `npm install` 或普通构建上；首次使用和 CI 必须显式执行。
- npm provider 的 6 个字体族设置 `optimizedFallbacks: false`，消除首次构建通过 jsDelivr 拉取 metrics 的残余网络路径；该项需用离线构建实测确认。
- Astro `<Font>` 生成的 CSS 变量只提供主字体 face，不携带系统 fallback；完整 fallback 链由各设计 `style.css` 按实际声部显式组合。否则 `var(--latin)` 内部的中文 fallback 会先于 `var(--zhuque)` 命中系统字体。
- `.github/workflows/deploy.yml` 增加目录缓存与 prepare 步骤；README 同步 GitHub Pages / Cloudflare Pages / Vercel 的构建命令。

## Coverage Audit

- 审计读取最终 HTML，排除 `<script>`/`<style>` 后提取可见文本。
- 以当前页面 `:root` 字体变量识别实际注册的核心 CJK family，再用 family manifest 的 shard 覆盖范围求并集。
- 对页面中的 CJK 码位逐一检查；一个字符若不被该页任一活动核心 CJK family 覆盖，则记录字符、码位、页面与活动字体。
- 只产生警告与报告，不因源 cmap 缺字失败；无 HTML 候选、缓存缺失或 manifest 不一致则失败。
- 审计是静态证据，不声称验证 CSS cascade 的最终逐元素字体选择；设计验证阶段必须以普通页面排版产生的字体请求或 CDP 平台字体信息补充，不得用强制 `document.fonts.load()` 代替命中证据。

## Compatibility and Migration

- 20 个 `local()` 字体族迁移后保持相同 family 名称、CSS 变量和字重/样式；fallback 顺序仍在各设计 CSS 中按字符落点维护，Astro 变量只暴露主 face。
- 既有 HTML-only 设计不受影响。
- `src/assets/fonts/` 只保留迁移说明/来源索引，删除二进制与包内许可证副本；许可信息由生成文档统一索引到字体仓版本。
- 新增 ADR 0012，说明字体仓边界、完整分片与离线准备；ADR 0008 保留本地工作台隔离决定并标注生产分发层由 0012 修订。

## Trade-offs

- 采用固定完整分片而非 per-fork 精确子集：首访可能加载多个小文件，但新增资料文字不需要重裁，fork 行为稳定。
- 采用显式 prepare 而非隐式网络：干净 clone 少一步命令，但构建可复现且失败模式明确。
- 采用外部家族包而非主仓提交二进制：主仓更轻、新增字体可扩展，但依赖公开 Release 与缓存完整性。
- 采用生成注册文件而非运行时扫描：新增字体仍需显式设计选择，避免字体仓变化悄悄改变页面。
- 采用“Font 变量仅主 face，设计 CSS 拥有 fallback”而非在每个变量内封装完整系统链：增加少量设计 CSS 维护责任，但保证多字体混排可以按字符正确落到下一个自定义字体。

## Rollback

- 应用回滚：恢复上一 `fonts.lock.json`/`fonts.catalog.json`/generated registration，缓存可重新准备。
- 发布回滚：不覆盖 Release；恢复旧目录快照并发布新的 catalog version 指向旧家族版本。
- 代码回滚：主仓与字体仓独立提交；恢复主仓提交可重新引入当前已提交字体资产，但发布过程不得重写既有 Release。
