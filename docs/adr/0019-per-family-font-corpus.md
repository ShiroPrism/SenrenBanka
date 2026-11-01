# 核心字体子集语料按实际引用页限定（per-family corpus）

- 状态：Accepted（2026-11-01）
- 相关：ADR 0014（内容子集）、ADR 0017（Hangul-only）、ADR 0018（TC 页面级路由）；`docs/rules/operations.md`；`SPEC.md` §5.5 / §10.4
- 证据：`.trellis/tasks/11-01-font-subset-page-corpus/`；`.cache/fonts/subset-report.json`；`docs/verification/font-corpus-scope.md`

## 背景

- ADR 0014 的 `fonts:subset` 用最终 `dist` 的**全站统一语料**（209 个文本资产、1833 码位）给每个 core 族生成子集。只要某个族存在，就会携带全站字符，即使它只被 2 个页面加载。
- 实测：`noto-sans-mono-cjk-tc` 只被 `terminal` / `oxide` 两套设计的 zh-TW 页引用，却生成了 575,664 B / 1832 字符的子集；TC 5 族与 SC 核心族合计 2,590,852 B。
- 约束不变：语料必须从最终产物派生，不能维护手写字符清单；页面字体选择、设计 CSS、catalog/lock/generated 不得改动。
- Hangul 族此前固定使用全站 Hangul 语料（454 字）。按引用页收窄后再过滤 Hangul，仍能通过部署集合审计。

## 决策

1. `fonts:subset` 先扫描最终 `dist` 的每个 HTML，按当前重写逻辑计算页面实际声明的 `--font-*` 变量与匹配 `@font-face` 规则的 core 族（一次读盘，结果复用于后续重写）。
2. 语料分两层：
   - **共享语料**：所有非 HTML 文本资产（CSS / JS / JSON / SVG / XML / TXT / webmanifest），去 `@font-face`、解码 HTML 实体与 CSS 转义；
   - **每族语料**：共享语料 ∪ 实际引用该族的页面原始 HTML（含属性、内联 JSON、脚本与样式）。
3. 只有被至少一个页面引用的 core 族才生成子集；未被引用的族跳过，不产生孤儿文件或悬空规则。
4. Hangul-only 族继续在每族语料上过滤 Hangul 区块并写 Hangul-only `unicode-range`；TC 族按页面级路由加载，语料同样按引用页。
5. `subset-report.json` 升级为 schema v2：新增 `corpusScope: "per-family"`、`sharedCorpus` 与每族 `corpusPages` / `corpusCodePoints` / `corpusSha256`；顶层 corpus 字段为实际使用族语料的并集。
6. 不改变 `fonts:prune` 的逐页规则判定、`fonts:audit` 的部署集合校验、字体文件名模式或构建顺序。

## 结果

| 项目 | 改动前 | 改动后 |
|---|---:|---:|
| 8 个非 Hangul 族 | 2,590,852 B | **1,502,884 B** |
| 6 个 Hangul 族 | 183,592 B（各 454 字） | **122,232 B**（各 250–297 字） |
| 14 族合计 | 2,774,444 B | **1,625,116 B** |
| `dist`（含跳转页样式精简） | 8,855,728 B | **7,632,396 B（7.28 MiB）** |

代表族：`noto-sans-mono-cjk-tc` 575,664 → 205,860 B（2 页）；`noto-serif-tc` 428,236 → 197,216 B（8 页）；`lxgw-wenkai-tc` 388,256 → 191,684 B（7 页）。`fonts:audit` 0 部署缺口、0 孤儿；`npm test` 80/80。

## 取舍

- 不采用“仅 TC 按语言”方案：实测只能省 565,324 B，约为按族方案的一半，且需要为 locale 建特例。
- 不采用“按设计页”更细粒度：同一共享 core 族会在设计间产生多份文件，新增设计会改变既有文件归属；按族是稳定边界。
- 语料仍然是超集：页面原始 HTML 全文与全部共享资产都进入每族语料，额外字符只让子集略大，不牺牲正确性。

## 后果与风险

- 新增页面或文案会改变对应族的语料哈希并自动重新生成子集，无需人工维护。
- 若存在运行期注入、且不在任何 `dist` 文本资产中的字符，可能缺字；当前站点为纯静态，菜单与 Toast 文案都在产物中，`fonts:audit` 按真实 cmap 逐页兜底。
- 取代 ADR 0014 中“全站统一语料”的描述，以及 ADR 0018 中“TC 族用全站语料”的描述；TC 页面级路由、Hangul-only `unicode-range` 与审计策略不变。
