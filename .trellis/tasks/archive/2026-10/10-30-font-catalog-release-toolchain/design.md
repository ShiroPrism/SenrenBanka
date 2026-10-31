# 字体目录、分片与发布工具链 — 技术设计

## Repository Layout

```text
SenrenBanka-fonts/
├─ catalog/families/<id>/<version>.json
├─ licenses/<id>/
├─ schemas/{family,catalog,manifest}.schema.json
├─ scripts/{validate-catalog,build-family,build-catalog,publish}.mjs
├─ scripts/lib/{schema,source,archive,font-split,manifest,hash}.mjs
├─ tests/
├─ fixtures/
├─ .github/workflows/release.yml
├─ package.json
└─ README.md
```

`fixtures/` 只放极小测试字体/合成数据，不放生产源字体。`.cache/` 与 `artifacts/` 被忽略。

## Descriptor Model

Family descriptor 分为：

- `id`、`familyName`、`role`、分发 `version`。
- `source`：`url` + `sha256` + archive member 或 `bootstrapKey`；记录上游版本/commit。
- `license`：`spdx`、`approvedForRedistribution`、`reviewedAt`、`evidenceUrl`、`licenseFiles`、`reservedFontName`。
- `output`：固定 variants 或 shard 配置；字重、样式、display、stretch、feature/variation settings。
- `provenance`：上游项目、获取日期、处理说明。

版本文件不可原地修改；升级同一家族创建新 descriptor 版本，旧版本仍可重建。

## Toolchain

- Node 24 ESM；最低 Node 22.12。
- 直接依赖固定为：`cn-font-split@7.4.3`、`fontkitten@1.0.3`、`zod@4.6.7`、`tar@7.5.22`、`yauzl@3.4.0`。
- 测试使用 Node 内置 test runner。
- `cn-font-split` 通过 `CN_FONT_SPLIT_GH_HOST` 支持下载镜像；工具版本固定在 lockfile 和 catalog manifest。

## Family Build Flow

1. 读取并 schema 校验 descriptor；检查版本唯一性。
2. 验证许可证批准和 RFN 规则。
3. 获取源文件：
   - URL 下载到临时缓存；
   - 可选 ZIP/TAR 归档按精确成员解出；
   - 迁移期允许 `--bootstrap-dir` 读取主仓现有文件；
   - 所有输入校验声明的 SHA-256。
4. 若 RFN 需要改名，先产生实际 name table 已改名的派生源，并验证不再使用保留名称；未配置改名则 fail closed。
5. `core-cjk`：
   - 调用固定 `cn-font-split`，`chunkSize=71680`，`languageAreas=true`，保留 font features，关闭测试 HTML/预览/报告；
   - 输出短哈希 WOFF2 与 CSS；
   - 解析生成的 CSS，得到文件到 `unicode-range` 的映射；
   - 验证每个分片的实际 cmap 是声明范围的子集，并求并集覆盖源字体声明字符集。
6. `fixed`：
   - 复制 descriptor 指定的 WOFF2，保留每个 variant 的 CSS 属性与可选 unicode-range；
   - 验证实际字体元数据与声明一致。
7. 生成 family manifest；排序并规范 JSON；打包 `licenses/`、`fonts/`、可选 `font.css`。
8. 生成 source archive；源文件只进 Release。
9. 计算包内/外层 SHA-256 和大小。

## Deterministic Packaging

- 所有文件按 POSIX 相对路径排序。
- 固定 mtime、uid/gid、mode；JSON 稳定键序；gzip mtime 为 0。
- 禁止依赖当前用户名、绝对工作目录或构建时间。
- `release:verify` 解包、重算 manifest，并比较连续构建 hash。

## Catalog Build

`catalog.json` 只记录发布指针，不内嵌整份 family manifest：

```json
{
  "schemaVersion": 1,
  "catalogVersion": "1.0.0",
  "families": {
    "zhuque-fangsong": {
      "version": "1.0.0",
      "role": "core-cjk",
      "package": {
        "releaseTag": "font-zhuque-fangsong-v1.0.0",
        "fileName": "zhuque-fangsong-v1.0.0.tar.gz",
        "sha256": "..."
      },
      "source": {
        "releaseTag": "font-zhuque-fangsong-v1.0.0",
        "fileName": "zhuque-fangsong-v1.0.0-source.tar.gz",
        "sha256": "..."
      }
    }
  }
}
```

应用用 `baseUrl = https://github.com/<owner>/<repo>/releases/download` 组合下载地址。镜像只需提供相同 `baseUrl/releaseTag/fileName` 布局。

## Release Workflow

- 手动 `workflow_dispatch` 输入 `catalogVersion`。
- 校验 descriptor 与所有期望产物。
- 不依赖 `GITHUB_TOKEN` 读取仓库级 Immutable Releases 设置；不可变性由仓库管理员设置与 GitHub 平台执行，不作为运行时发布前置探测。
- 每个新版本先创建**空 Draft Release**，再逐个上传缺失资产；对已存在的同名 Draft 幂等复用。
- 上传后通过 GitHub API 校验 Release metadata、tag、draft 状态，以及资产名称、大小、SHA-256 完整集合；全部 draft 验证通过后才按 bootstrap → families → catalog 顺序 Publish。
- 任何中途失败都不删除已发布 Release、tag 或资产，也不删除 Draft；重跑会验证已有状态并补齐缺失资产。冲突资产直接失败，不使用 `--clobber`。
- 已发布且资产字节完全一致的 Release 可复用，使相同 catalog 版本的重跑成为只读验证。
- 发布前先构建并上传到 workflow artifact；正式 Release 事务不得在本地验证完成前开始。

## Initial Migration

- 从主仓 `astro.config.mjs` 提取 20 个 local family 的 variants 与属性。
- 从 `src/assets/fonts/README.md` 和许可证文件建立 descriptor 初稿。
- 核心 CJK 源：
  - Zhuque v0.212 官方 zip；
  - Ark Pixel 2026.10.16 OTF zip；
  - LXGW WenKai GB v1.521 TTF。
- 固定字体以当前已提交 WOFF2 为受控 bootstrap 输入，并记录来源；发布后的 source archive 成为同版本可重建依据。
- 初始 `catalogVersion` 使用 `1.0.0`，每家族分发版本使用语义化 `1.0.0`。

## Testing

- schema：未知版本、重复 id、无效字段、未批准许可。
- source：200/404、SHA mismatch、zip slip、member missing。
- split：fixture 字体生成多分片、CSS/manifest 一致、范围不重叠。
- package：确定性 hash、缺文件、多文件、篡改、symlink。
- catalog：缺包、错版本、错 hash、URL 组合。
- workflow dry-run：发布命令只在验证通过后执行。

## Security and Compliance

- 所有外部下载只允许 HTTPS，`file:` 只在测试注入中存在。
- 解包只允许白名单普通文件并限制解压大小。
- 许可证文件必须随包；不把字体许可证视为代码许可证。
- RFN 不合规直接失败；不得依赖只改 CSS family 伪装改名。
