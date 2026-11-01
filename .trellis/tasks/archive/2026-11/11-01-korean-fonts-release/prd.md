# 韩语字体调研与字体仓库发行

> 父任务：`11-01-korean-full-coverage`。本子任务只改 `whitehair-failure/SenrenBanka-fonts`，不改主站。

## Goal

在字体仓库发布 6 个韩语核心族，并发布 catalog v1.1.0；为主站提供可复现、可校验、许可完整的 family package、source archive、catalog URL 与 SHA-256。

## 背景

- 现行 catalog v1.0.0 共 20 族，无韩语；`role` 只有 `core-cjk` / `fixed`。
- 主站部署字体中只有 LXGW WenKai 带 11,172 个谚文音节；其余核心/fixed/npm 族均为 0。
- 韩文字体普遍带 Hanja，且部分许可含 RFN；调研已排除 Noto Sans/Serif KR、Black Han Sans、D2Coding、Pretendard 等候选（理由见 research 文件）。
- 字体仓库 Release 不可变；catalog 是消费者可见的事务边界。

## Requirements

### R1 六个韩语族

全部满足：`OFL-1.1`、无 RFN、单 Regular 400 face、完整源字体、可再分发/子集化/WOFF2 嵌入。

| id | family | 定位 | 源文件 |
|---|---|---|---|
| `gothic-a1` | Gothic A1 | 中性无衬线基线 | Google Fonts `ofl/gothica1/GothicA1-Regular.ttf` |
| `gowun-batang` | Gowun Batang | 衬线/明朝体 | Google Fonts `ofl/gowunbatang/GowunBatang-Regular.ttf` |
| `galmuri11` | Galmuri11 | 韩文像素 | `quiple/galmuri` v2.40.4 `Galmuri11.ttf` |
| `noto-sans-mono-cjk-kr` | Noto Sans Mono CJK KR | 韩文等宽 | `notofonts/noto-cjk` Sans2.004 `12_NotoSansMonoCJKkr.zip` → `NotoSansMonoCJKkr-Regular.otf` |
| `dongle` | Dongle | 圆体/可爱 | Google Fonts `ofl/dongle/Dongle-Regular.ttf` |
| `poor-story` | Poor Story | 手写/马克笔 | Google Fonts `ofl/poorstory/PoorStory-Regular.ttf` |

### R2 Descriptor 与许可

- 6 个 descriptor：`catalog/families/<id>/1.0.0.json`。
- `role: "core-cjk"`；`output.type: "core-cjk"`；`weight: "400"`；`style: "normal"`；`display: "swap"`；`chunkSize: 71680`；`languageAreas: true`；`fontFeature: true`。
- 新增顶层 `scripts: ["hangul"]`（additive schema）。
- `source.files[]`：完整文件名、字节数、SHA-256、下载 URL、`bootstrapKey`。
- `license`：`spdx: "OFL-1.1"`、`approvedForRedistribution: true`、`reviewedAt`、`reviewedBy`、`evidenceUrl`、license 文件哈希、`reservedFontNames: []`、`rfn.status: "not-applicable"`。
- `cssVariable`：`--font-gothic-a1`、`--font-gowun-batang`、`--font-galmuri11`、`--font-noto-sans-mono-cjk-kr`、`--font-dongle`、`--font-poor-story`。
- license 文件放 `licenses/<id>/LICENSE.txt`。

### R3 Catalog v1.1.0

- `catalog:validate`、`npm test` 通过。
- 构建 `artifacts` 与 `artifacts-repro`，`release:verify --compare-dir` 逐字节一致。
- `catalog.json` 含 26 族；6 个新族可被主站 `fonts:update` 解析；`SHA256SUMS` 完整。
- 新族 source archive 与 package archive 均发布；如无 bootstrap-only 源，不新增 bootstrap bundle。

### R4 发布

- 发布顺序：6 个 `font-<id>-v1.0.0` → `catalog-v1.1.0`（catalog 最后）。
- 不覆盖、不删除已发布 Release/资产；失败保留 Draft，不产生不完整 catalog。
- push/tag/Release 前向用户提交资产清单、catalog SHA、diff 摘要，确认后执行。
- 发布后验证 family 资产与 catalog URL 可下载、SHA 匹配。

### R5 Handoff

- 输出 `research/handoff.md`：catalog URL、catalog SHA-256、6 族 id/version/package/source 大小、源字体 SHA、license 证据、验证命令结果。
- 输出主站接线所需信息：family id、`cssVariable`、`scripts`、建议 fallback、source archive 大小。
- 不向主站 `fonts.config.json` 写入任何内容（属于 C2）。

## Acceptance Criteria

- [x] 6 个 descriptor 通过 schema/策略校验；均 `role: core-cjk`、`scripts: ["hangul"]`、`OFL-1.1`、无 RFN。
- [x] 6 个 license 文件存在且哈希入 descriptor；许可允许子集化与 WOFF2 嵌入。
- [x] 6 族完成样张目检（标题/正文/小字号/数字/标点/缺字回退/合成粗体），记录结论；不合格族在发布前替换或调整映射。
- [x] `npm test`、`catalog:validate` 通过。
- [x] `artifacts` 与 `artifacts-repro` 逐字节一致；`release:verify --compare-dir` 通过。
- [x] 6 个 family release 与 catalog v1.1.0 已发布；资产 URL 可下载且 SHA 匹配。
- [x] catalog v1.1.0 含 26 族；现有 20 族仍为 v1.0.0，未被改写。
- [x] 发布前资产清单经用户确认；发布后无资产被覆盖或删除。
- [x] `research/handoff.md` 完整，C2 可仅凭 handoff 完成 lock 更新。

## Out of Scope

- 主站 `fonts.config.json` / lock / generated / 设计字体栈 / 覆盖门禁。
- 22 套韩语文案与页面。
- Noto Sans KR / Noto Serif KR、Black Han Sans、D2Coding、Pretendard。
- 修复 `renameSfntFont`；多 face / 可变字体发布。
- 非韩语的其他文字系统。

## Risks

- **Google Fonts 移动分支**：必须 pin commit，不能用 `main` 的漂浮 URL。
- **Noto Mono 许可**：使用 noto-cjk 静态 OTF（无 RFN）；不要用 Google Fonts VF（声明 RFN 'Source'，默认 Thin）。
- **Galmuri 带 Hanja**：不影响发布；主站用 Hangul-only 路由隔离。
- **source archive 体积**：Noto Mono 16.4 MB、Gowun Batang 8.4 MB、Galmuri 5.4 MB；发布资产与 CI 缓存需留足空间。
- **Release 不可变**：任何源文件/许可/字节问题必须在发布前解决；发布后只能提升 family 版本。
- **磁盘空间**：当前 F: 剩余约 60 GB；双构建 + 缓存需预留。

## Notes

- 调研矩阵、候选对比、实测子集体积与源 URL 见 `research/korean-font-candidates.md`。
- 字体仓库操作契约：`docs/ADDING-A-FONT.md`、`docs/LICENSING.md`、`docs/RELEASING.md`、`schemas/family.schema.json`。
- 主站接入依赖本任务的 catalog v1.1.0 URL/SHA；未发布前 C2 不得手写 lock/generated。

## 实施记录（2026-11-01）

- 6 族 descriptor/license/source 已加入；catalog v1.1.0（26 族、9 core / 17 fixed、939 variants）发布；bootstrap v1.1.0、6 个 family release、catalog release 均已 live；catalog SHA `a61b225c5edca6a3b023fdfa1d3ef2ffdb0c1b3b98f81cd4c5c0dbe26b399029`。
- 字体仓库 `npm test` 61/61；`catalog:validate` 26 族；`release:verify --compare-dir` `reproducible: true`；既有 20 族 package/source 零漂移；6 族样张目检通过。
- 字体仓库 commit `bab1a4f` 已 push；既有 v1.0.0 资产未改。Handoff 与 specimen 见 `research/`。
