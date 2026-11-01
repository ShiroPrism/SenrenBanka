# 繁体中文字体调研 · 冻结方案

日期：2026-11-01
范围：zh-TW 的 5 个阅读角色字体族、许可证据、真实语料 subset 实测、逐设计映射与体积预算。

## 1. 结论

冻结 5 个 `core-cjk` 族，全部 OFL-1.1、单人 face、Regular（LXGW 用 Medium 以匹配现有 500 字重）：

| 角色 | 族 id | cssVariable | familyName | 字重 |
|---|---|---|---|---|
| Sans | `noto-sans-tc` | `--font-noto-sans-tc` | Noto Sans TC | 400 |
| Serif/Song | `noto-serif-tc` | `--font-noto-serif-tc` | Noto Serif TC | 400 |
| Kai | `lxgw-wenkai-tc` | `--font-lxgw-tc` | LXGW WenKai TC | 500 |
| Pixel | `fusion-pixel-tc` | `--font-fusion-pixel-tc` | Fusion Pixel 12px TC | 400 |
| Mono | `noto-sans-mono-cjk-tc` | `--font-noto-sans-mono-cjk-tc` | Noto Sans Mono CJK TC | 400 |

**相对原计划的替换**：Ark Pixel TC（`zh_tw`）缺 48 个常用繁体字（應/換/舊/術/概/熱/節/獲/號/劇/層/徵/懷/護/施/既/沒/滾/潔/盤/窗/築/緊/羅/聯/腳…），不满足 4 套像素设计的覆盖承诺；改用 Fusion Pixel 12px Mono zh-TW（同 12px 像素风、覆盖全部 847 个语料汉字、subset 仅多约 10 KB）。`ark-pixel-tc` 不再进入 catalog。

装饰族（圆体/手写）本批不发布：5 族方案已接近 8.5 MiB 软目标，装饰族需等实测 headroom；装饰设计先用最近角色族替代并在覆盖表记录。

## 2. 字体来源与校验

| 族 | 上游 | 版本 | 源文件 | 源文件字节 | 源 SHA-256 |
|---|---|---|---|---|---|
| noto-sans-tc | notofonts/noto-cjk | Sans2.004 | NotoSansTC-Regular.otf | 5,683,368 | `5bab0cb3c1cf89dde07c4a95a4054b195afbcfe784d69d75c340780712237537` |
| noto-serif-tc | notofonts/noto-cjk | Serif2.003 | NotoSerifTC-Regular.otf | 7,936,104 | `63515eb0622d589a2f4062e8757c598b3da3bffd053f69abd181c210158ef10c` |
| lxgw-wenkai-tc | lxgw/LxgwWenkaiTC | v1.530 | LXGWWenKaiTC-Medium.ttf | 15,122,300 | `649efd8516f42d36eacc05480d5dbd2713fb28fbd2bbee8ea76fc40875045c49` |
| fusion-pixel-tc | TakWolf/fusion-pixel-font | 2026.10.25 | fusion-pixel-12px-monospaced-zh_tw.otf | 5,106,780 | `c07852205cf057216c762f3924507f03e02039c4d34d987f77adc787939742ee` |
| noto-sans-mono-cjk-tc | notofonts/noto-cjk | Sans2.004 | NotoSansMonoCJKtc-Regular.otf | 16,392,304 | `82a040aed900bba51b5990bc158a86b264c8ad5071a2d8911e8696350e0794b3` |

下载包：

| 族 | 下载 URL | 包 SHA-256 | archiveMember |
|---|---|---|---|
| noto-sans-tc | `.../releases/download/Sans2.004/19_NotoSansTC.zip` | `fbbcb216be8056a436c7ec142847f302bb1932d07bdad8b322f4953a389d7cbc` | `NotoSansTC-Regular.otf` |
| noto-serif-tc | `.../releases/download/Serif2.003/15_NotoSerifTC.zip` | `cadfc894416096a51174e8a350e5cb872f99a8c4b1d36c3990e7a9741e1456ab` | `SubsetOTF/TC/NotoSerifTC-Regular.otf` |
| lxgw-wenkai-tc | `.../releases/download/v1.530/LXGWWenKaiTC-Medium.ttf` | `649efd8516f42d36eacc05480d5dbd2713fb28fbd2bbee8ea76fc40875045c49` | 无（直链） |
| fusion-pixel-tc | `.../releases/download/2026.10.25/fusion-pixel-font-12px-monospaced-otf-v2026.10.25.zip` | `6e4cd37ad32ccdab76858759397a01c3ec372ac37fdf3acf0705da7b44281302` | `fusion-pixel-12px-monospaced-zh_tw.otf` |
| noto-sans-mono-cjk-tc | `.../releases/download/Sans2.004/14_NotoSansMonoCJKtc.zip` | `0126cbeef724edf21fbaeb113739adf392679fd90a2897c76159d1141df9e8c6` | `NotoSansMonoCJKtc-Regular.otf` |

## 3. 许可

| 族 | SPDX | RFN | 证据 |
|---|---|---|---|
| noto-sans-tc / noto-serif-tc / noto-sans-mono-cjk-tc | OFL-1.1 | `not-applicable` | 复用 `licenses/noto-sans-mono-cjk-kr/LICENSE.txt`（SHA `6a73f9541c2de74158c0e7cf6b0a58ef774f5a780bf191f2d7ec9cc53efe2bf2`）；upstream `notofonts/noto-cjk` 的 OFL 未声明 RFN |
| lxgw-wenkai-tc | OFL-1.1 | `not-applicable` | `lxgw/LxgwWenkaiTC` 的 `OFL.txt`（SHA `1a13783bf4337242834b60309cdcdbeb566ae3f923576fdbba8b78db9d174def`）未声明保留名称；README 说明因 Google Fonts 上架未声明 RFN、条款不具强制力，仅请求衍生字体避免使用 霞鶩/LXGW |
| fusion-pixel-tc | OFL-1.1 | `not-applicable` | 顶层 `OFL.txt`（SHA `bc518cf64b8032c07690f33cc270c35c179255a6ac8efa7c165ebae7e8f76a63`）未声明 RFN；随附 `LICENSES/ark-pixel/OFL.txt`（`3ab41567…`）、`LICENSES/cubic-11/OFL.txt`（`2b6e5938…`）、`LICENSES/galmuri/LICENSE.txt`（`86a3ee94…`） |

注意：

- LXGW TC 的 OFL 没有 GB 版的 “web-only subsetting” 附加许可，但也没有 RFN 声明；法律上可保留名称。README 的请求作为社区惯例记录，不阻塞。
- Fusion Pixel 是 Ark Pixel + Cubic 11 + Galmuri 的合并字体；发布包需同时携带顶层与三个上游许可文件。
- Noto CJK 只用静态 regional OTF，不用 Google Fonts VF（避免 “Source” RFN）。

## 4. 语料与实测

- 现有 `dist` 语料：1,634 唯一码位；OpenCC `cn→twp` 转换后 1,552 唯一码位；并集 1,839 唯一码位，其中汉字 847。
- 下表 `full-dist-union` = 现有语料 + 转换后繁中语料的并集（模拟 Q16=A 的全站语料子集）；`tc-pages-only` 仅作对照。

| 族 | full-dist-union subset | 字符数 | B/字 | tc-pages-only subset |
|---|---|---|---|---|
| noto-sans-tc | 303,352 B | 1,179 | 165 | 281,968 B |
| noto-serif-tc | 432,408 B | 1,179 | 235 | 404,488 B |
| lxgw-wenkai-tc (Medium) | 391,052 B | 1,385 | 282 | — |
| fusion-pixel-tc | 49,948 B | 1,839 | 27 | — |
| noto-sans-mono-cjk-tc | 580,420 B | 1,838 | 316 | 514,372 B |
| **合计** | **1,757,180 B（≈1.68 MiB）** | | | |

现有核心字体因新增繁中语料的增长：

| 族 | 当前 | 含繁中语料 | 增长 |
|---|---|---|---|
| lxgw-wenkai | 288,928 B | 358,348 B | +69,420 B |
| zhuque-fangsong | 357,396 B | 457,780 B | +100,384 B |
| ark-pixel-12px | 33,840 B | 39,720 B | +5,880 B |
| **合计** | | | **+175,684 B** |

覆盖率（转换后语料的 847 个汉字）：

- Noto Sans TC / Noto Serif TC：缺 31 个日文新字体汉字（単収営図変対巻戦戻払択拠掲歩歳気済獣経絵続縦蔵薬蝋観読釈録雑黒）。这是把日语页面一起转繁中产生的伪缺口；实际 zh-TW 文案不会使用这些字形，若出现按契约回退系统字体。
- LXGW WenKai TC、Noto Sans Mono CJK TC：0 缺字。
- Fusion Pixel TC：0 缺字（Ark Pixel zh_tw 缺 48 个，故替换）。

## 5. 体积预算

- 当前 `dist`：6,056,936 B / 146 HTML。
- 新增字体：1,757,180 B（TC 族）+ 175,684 B（现有核心增长）= 1,932,864 B。
- 新增 27 个 TC HTML：按韩语 22 页约 +0.6–0.8 MB 估算，取 0.75 MB。
- 预计 `dist` ≈ 8.74 MB ≈ **8.34 MiB**，低于 8.5 MiB 软目标；10 MiB 硬门禁有余量。
- 结论：本批不上装饰族。若实测超过 8.5 MiB，按父 `design.md` §6 先砍装饰族/替代，不抬门禁。

## 6. 逐设计映射

规则：

- 有 CJK 核心的设计：`html:lang(zh-TW)` 只做变量重映射；韩文伴生槽位映射到哨兵 `__senrenbanka_tc_skip__`（不提升为新字形角色），CJK 核心槽位映射到对应 TC 族。
- 系统 CJK 设计：`html:lang(zh-TW)` 作用域插入 TC 族（Sans 或 Mono），并把韩文伴生变量置为哨兵。
- `html-only`：零字体契约，豁免。

| 设计 | 现有 Han 核心 | TC 映射 |
|---|---|---|
| archive | Zhuque | Noto Serif TC |
| brutal | Zhuque | Noto Serif TC |
| cute-alism | LXGW | LXGW WenKai TC |
| deco | Zhuque | Noto Serif TC |
| editorial | LXGW | LXGW WenKai TC |
| fairy-kei | LXGW | LXGW WenKai TC |
| fast | 系统 | Noto Sans TC |
| fax | Zhuque | Noto Serif TC |
| frost | 系统 | Noto Sans TC |
| govuk | 系统 | Noto Sans TC |
| homepage99 | 系统 | Noto Sans TC |
| ink | LXGW + Zhuque | LXGW WenKai TC + Noto Serif TC |
| kern | 系统 | Noto Sans TC |
| lexicon | Zhuque | Noto Serif TC |
| little-forest | LXGW | LXGW WenKai TC |
| magical-girl | LXGW | LXGW WenKai TC |
| material3 | 系统 | Noto Sans TC |
| oxide | 系统 | Noto Sans Mono CJK TC |
| pager | Ark Pixel | Fusion Pixel TC |
| pixel-pet-rpg | Ark Pixel | Fusion Pixel TC |
| poster | Zhuque | Noto Serif TC |
| radio | Ark Pixel | Fusion Pixel TC |
| receipt | Ark Pixel | Fusion Pixel TC |
| sticker-diary | LXGW | LXGW WenKai TC |
| tape | Zhuque | Noto Serif TC |
| terminal | 系统 | Noto Sans Mono CJK TC |
| html-only | 豁免 | 豁免 |

首批 6 套：`editorial`（LXGW TC）、`archive`（Noto Serif TC）、`pager`（Fusion Pixel TC）、`fast`（Noto Sans TC）、`terminal`（Noto Sans Mono TC）、`html-only`，覆盖 5 族与两种接入机制。

## 7. 发布输入（描述符键值）

- `role: core-cjk`
- `scripts: ["cjk", "han-traditional"]`
- `output.type: core-cjk`、`weight` 见表、`style: normal`、`display: swap`、`chunkSize: 71680`、`languageAreas: true`、`fontFeature: true`
- `cssVariable` 见表
- `fallbacks`：
  - noto-sans-tc / noto-serif-tc / noto-sans-mono-cjk-tc：`["PingFang TC", "Microsoft JhengHei", "Songti TC", "sans-serif"]`（Serif 用 `["Songti TC", "PingFang TC", "serif"]`）
  - lxgw-wenkai-tc：`["Kaiti TC", "Songti TC", "serif"]`
  - fusion-pixel-tc：`["PingFang TC", "Microsoft JhengHei", "monospace"]`
- `source.project/version/url/revision/retrievedAt`：见表 2；`retrievedAt: 2026-11-01`
- `license.reviewedAt: 2026-11-01`、`reviewedBy: "SenrenBanka maintainers"`

## 8. GATE-1 待确认

- [ ] 接受用 Fusion Pixel TC 替换 Ark Pixel TC。
- [ ] 接受 5 族、装饰族延后。
- [ ] 接受 LXGW TC 以 `not-applicable` 记录（OFL 未声明 RFN，README 仅有社区请求）。
- [ ] 接受 Fusion Pixel 的四个许可文件随包发布。
- [ ] 确认后进入字体仓库 descriptor/build 与 catalog v1.2.0。
