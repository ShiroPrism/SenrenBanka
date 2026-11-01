# 韩语字体调研与字体仓库发行 · 技术设计

## 1. 仓库边界

本任务只操作 `F:\SenrenBanka-fonts`（`whitehair-failure/SenrenBanka-fonts`）：

- 修改：`catalog/families/**`、`licenses/**`、`schemas/**`、`scripts/**`、`tests/**`、`docs/**`、`README.md`。
- 不提交：`.cache/`、`artifacts/`、`artifacts-repro/`、`bootstrap-sources-*.zip`、任何 `.ttf/.otf/.woff2` 源文件。
- 不修改：主站 `F:\SenrenBanka` 的任何文件（C2 负责）。

## 2. Family descriptor

沿用 `catalog/families/lxgw-wenkai/1.0.0.json` 的 schema，新增可选顶层 `scripts`：

```json
{
  "schemaVersion": 1,
  "id": "gothic-a1",
  "familyName": "Gothic A1",
  "sourceFamilyName": "Gothic A1 Regular",
  "role": "core-cjk",
  "version": "1.0.0",
  "scripts": ["hangul"],
  "source": {
    "project": "Gothic A1",
    "version": "<pinned upstream version/commit>",
    "url": "https://github.com/google/fonts/tree/<commit>/ofl/gothica1",
    "revision": "<commit>",
    "retrievedAt": "2026-11-01",
    "files": [
      {
        "fileName": "GothicA1-Regular.ttf",
        "size": 2295400,
        "sha256": "<full sha256>",
        "bootstrapKey": "source/fonts/GothicA1-Regular.ttf",
        "download": {
          "url": "https://raw.githubusercontent.com/google/fonts/<commit>/ofl/gothica1/GothicA1-Regular.ttf",
          "sha256": "<full sha256>"
        }
      }
    ]
  },
  "license": {
    "spdx": "OFL-1.1",
    "approvedForRedistribution": true,
    "reviewedAt": "2026-11-01",
    "reviewedBy": "SenrenBanka maintainers",
    "evidenceUrl": "https://github.com/google/fonts/tree/<commit>/ofl/gothica1",
    "files": [{ "name": "LICENSE.txt", "sha256": "<full sha256>" }],
    "reservedFontNames": [],
    "rfn": { "status": "not-applicable" }
  },
  "output": {
    "type": "core-cjk",
    "sourceFile": "GothicA1-Regular.ttf",
    "weight": "400",
    "style": "normal",
    "display": "swap",
    "chunkSize": 71680,
    "languageAreas": true,
    "fontFeature": true
  },
  "cssVariable": "--font-gothic-a1",
  "fallbacks": ["Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "sans-serif"],
  "provenance": {
    "retrievedAt": "2026-11-01",
    "processing": "Fix source bytes, verify SHA-256, then package by the shared descriptor-driven pipeline.",
    "notes": "Pinned Google Fonts commit."
  }
}
```

六个族的 `cssVariable` / `fallbacks`：

| id | cssVariable | fallbacks（目录元数据） |
|---|---|---|
| gothic-a1 | `--font-gothic-a1` | `Apple SD Gothic Neo`, `Malgun Gothic`, `Noto Sans KR`, `sans-serif` |
| gowun-batang | `--font-gowun-batang` | `Apple SD Gothic Neo`, `Malgun Gothic`, `Noto Serif KR`, `serif` |
| galmuri11 | `--font-galmuri11` | `Apple SD Gothic Neo`, `Malgun Gothic`, `monospace` |
| noto-sans-mono-cjk-kr | `--font-noto-sans-mono-cjk-kr` | `Apple SD Gothic Neo`, `Malgun Gothic`, `monospace` |
| dongle | `--font-dongle` | `Apple SD Gothic Neo`, `Malgun Gothic`, `sans-serif` |
| poor-story | `--font-poor-story` | `Apple SD Gothic Neo`, `Malgun Gothic`, `cursive`, `sans-serif` |

> `fallbacks` 只用于目录映射校验，不写进浏览器 `--font-*`；实际回退栈由主站设计 CSS 拥有。

## 3. `scripts` schema 扩展

- `schemas/family.schema.json` 顶层增加：
  ```json
  "scripts": {
    "type": "array",
    "items": { "enum": ["cjk", "hangul"] },
    "minItems": 1,
    "uniqueItems": true
  }
  ```
- 不加入 `required`；现有 v1.0.0 descriptor 不改。
- `scripts/lib/descriptor.mjs` / `build-family.mjs` / `catalog.mjs`：读取 `scripts`，缺省 `["cjk"]`，写入 manifest 与 catalog family 条目。
- `schemas/catalog.schema.json` 与 `manifest.schema.json` 增加同名可选字段。
- `tests/` 增加：
  - 新 descriptor 的 `scripts` 保留；
  - 旧 descriptor 缺省为 `["cjk"]`；
  - 非法 `scripts` 值失败；
  - 发布产物逐字节复现（现有测试已覆盖）。

## 4. 源文件固定与许可

### 4.1 Google Fonts 四族

Google Fonts 的 `main` 是移动分支；必须 pin 到调研时解析的 commit `6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec`（或实现时更新的固定 commit，写入 `source.revision`）。

- `gothica1/GothicA1-Regular.ttf` 2,295,400 B
- `gothica1/OFL.txt`
- `gowunbatang/GowunBatang-Regular.ttf` 8,433,296 B
- `gowunbatang/OFL.txt`
- `dongle/Dongle-Regular.ttf` 4,458,600 B
- `dongle/OFL.txt`
- `poorstory/PoorStory-Regular.ttf` 3,966,768 B
- `poorstory/OFL.txt`

下载后重新计算完整 SHA-256，不使用调研阶段的截断哈希。

### 4.2 Galmuri11

- Release：`https://github.com/quiple/galmuri/releases/download/v2.40.4/Galmuri-v2.40.4.zip`
- 取出 `Galmuri11.ttf`（5,376,428 B）与 `LICENSE.txt`。
- 许可：OFL-1.1，无 RFN。

### 4.3 Noto Sans Mono CJK KR

- Release：`https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/12_NotoSansMonoCJKkr.zip`
- 取出 `NotoSansMonoCJKkr-Regular.otf`（16,389,532 B）与 `LICENSE`。
- 使用 noto-cjk 资产，不使用 Google Fonts VF：
  - VF 默认实例是 Thin；
  - Google Fonts 的 `OFL.txt` 声明 RFN `'Source'`，与 noto-cjk 资产不一致。
- 许可：OFL-1.1，无 RFN。

## 5. 构建与复现

```bash
npm ci
npm test
npm run catalog:validate
npm run bootstrap:build -- --bootstrap-dir .cache/bootstrap --out artifacts/bootstrap-sources-v1.1.0.zip
npm run bootstrap:verify -- --bundle artifacts/bootstrap-sources-v1.1.0.zip --sha256 "$(awk '{print $1}' artifacts/bootstrap-sources-v1.1.0.zip.sha256)"
node scripts/build-catalog.mjs --out artifacts --catalog-version 1.1.0 --bootstrap-dir .cache/bootstrap --bootstrap-sha256 "$(awk '{print $1}' artifacts/bootstrap-sources-v1.1.0.zip.sha256)"
npm run release:verify -- --dir artifacts --catalog-version 1.1.0
node scripts/build-catalog.mjs --out artifacts-repro --catalog-version 1.1.0 --bootstrap-dir .cache/bootstrap --bootstrap-sha256 "$(awk '{print $1}' artifacts/bootstrap-sources-v1.1.0.zip.sha256)"
npm run release:verify -- --dir artifacts --compare-dir artifacts-repro --catalog-version 1.1.0
node scripts/publish.mjs --dir artifacts --catalog-version 1.1.0 --target-sha "$(git rev-parse HEAD)" --dry-run
```

- 若 6 族都有直接 HTTPS 源，`bootstrap-sources-v1.1.0.zip` 只包含已有 bootstrap-only 源；是否重建以 `bootstrap:build` 输出为准。
- `catalog.json` 必须包含 26 族；6 个新族的 `scripts: ["hangul"]`、`role: "core-cjk"`、`version: "1.0.0"` 正确。
- `SHA256SUMS` 覆盖 6 个 package + 6 个 source + catalog + bootstrap（如存在）。
- `artifacts` 与 `artifacts-repro` 逐字节一致；不一致时先修确定性输入，不得发布。

## 6. 发布事务

按 `docs/RELEASING.md`：

1. 提交并合并 descriptor/schema/toolchain 变更。
2. 若需要 bootstrap，先发布 `bootstrap-v1.1.0`。
3. 发布 6 个 `font-<id>-v1.0.0`。
4. 最后发布 `catalog-v1.1.0`。
5. 已发布资产不覆盖、不删除；失败保留 Draft。
6. 发布后核对：
   - 每个 family release 有 4 个资产（package、package.sha256、source、source.sha256）；
   - catalog release 的 `catalog.json` / `.sha256` / `SHA256SUMS`；
   - 资产大小与本地 `artifacts/` 一致。

## 7. Handoff 给 C2

`research/handoff.md` 必须包含：

- catalog URL：`https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.1.0/catalog.json`
- catalog SHA-256（发布页带外取得）。
- 6 族：id、version、package 文件/大小、source 文件/大小、`cssVariable`、`scripts`。
- 每族源字体 SHA-256 与 license 文件 SHA-256。
- `npm test` / `catalog:validate` / `release:verify --compare-dir` 的结果。
- 已知风险：Noto Mono OTF/CFF、Galmuri Hanja、source archive 体积。

C2 只使用 handoff 与 catalog，不读取本任务的 `.cache/` 或本地源文件。

## 8. 回滚与恢复

- 发布前：删除 `artifacts/`、`artifacts-repro/` 重新构建；不改已提交 descriptor。
- 发布中失败：Draft 保留；重跑 `publish.mjs` 会复用并校验已有资产，只上传缺失项。
- 发布后发现问题：提升该族 `version`（如 `1.0.1`）并发新 catalog；不删除/覆盖 `v1.0.0`。
- catalog 发布后：主站仍可锁 v1.0.0；v1.1.0 不阻塞旧消费者。

## 9. 替代方案

| 方案 | 否决理由 |
|---|---|
| 继续用 Noto Sans/Serif KR | 带 Hanja；全站语料子集 256/390 KB；Gothic A1/Gowun Batang 更小且无 RFN。 |
| Black Han Sans 作重展示 | 仅 2,581/11,172 音节，缺字风险；重设计先用 Gothic A1 合成粗体。 |
| D2Coding / Pretendard | `renameSfntFont` 对真实 TTF 失败；修复是独立工具链任务。 |
| `fixed` 全量 WOFF2 | 失去内容子集，主站体积不可控。 |
| 新增 `core-script` role | 韩语属于 CJK，分发/子集路径相同；没有操作差异的新分类。 |
| 多 face / 可变字体 | 主站 core 子集只支持单 face；先 Regular + 合成粗体。 |
