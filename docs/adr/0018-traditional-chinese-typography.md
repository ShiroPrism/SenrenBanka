# 繁体中文全设计字体：5 族、页面级字体路由与 `han-traditional`

- 状态：Accepted（2026-11-01）
- 相关：`CONTEXT.md` 的 `Design locale coverage` / `Locale typography coverage` / `Core CJK font`；ADR 0017；`docs/rules/operations.md`；字体仓库 catalog v1.2.0
- 证据：`.trellis/tasks/11-01-traditional-chinese-font-research/research/tc-font-research.md`；`docs/verification/traditional-chinese.md`

## 背景

- 站点新增第 5 语言 `zh-TW`（繁體中文，台湾国语用词），目标覆盖全部 27 套设计。
- 韩语的排版覆盖靠 `unicode-range` 隔离 Hangul 伴生族；繁中不能照搬：繁中与简中大量共享码位（骨/直/說/體），无法按码位把 TC 字形从 SC 字形中分流。
- 现有核心 CJK 没有一套能承担繁中排版：`lxgw-wenkai` 是 GB 版（码位 97% 但简体字形）、`zhuque-fangsong` 只有 56.8% Big5、`ark-pixel-12px` 缺 48 个常用繁体字、韩文族没有汉字。
- TC 子集是汉字密集型：实测 LXGW 177–307 B/字，5 族全语料子集约 1.68 MiB；韩语 Hangul-only 每族只有 10–54 KB，不能按韩语成本估算。
- Ark Pixel 的 `zh_tw` 变体缺 應/換/舊/術/概/熱/節/獲 等 48 个常用繁体字；Fusion Pixel 12px Mono zh-TW 覆盖全部 847 个语料汉字，subset 只多约 10 KB。

## 决策

### 1. 五个阅读角色族

全部 `OFL-1.1`、单 face：

| id | 角色 | 字重 | 主要承接 |
|---|---|---|---|
| `noto-sans-tc` | Sans | 400 | fast / frost / govuk / homepage99 / kern / material3 |
| `noto-serif-tc` | Serif/Song | 400 | Zhuque 8 套 |
| `lxgw-wenkai-tc` | Kai | 500 | LXGW 7 套 |
| `fusion-pixel-tc` | Pixel | 400 | pager / pixel-pet-rpg / radio / receipt |
| `noto-sans-mono-cjk-tc` | Mono | 400 | terminal / oxide |

- 装饰族（圆体/手写）本批不发布：5 族已接近 8.5 MiB 软目标；装饰设计先用最近角色族替代并记录，实测有 headroom 再补。
- Ark Pixel TC 被 Fusion Pixel TC 替代：前者缺 48 个常用繁体字，后者覆盖全部语料汉字。
- LXGW TC 以 `not-applicable` 记录 RFN：TC 仓库的 `OFL.txt` 未声明保留名称；README 的避让请求作为社区惯例记录，不构成 RFN 条款。
- Noto 只用静态 regional OTF，不用 Google Fonts VF（避免 `'Source'` RFN）。

### 2. `han-traditional` 与 `scripts`

- 字体仓库与主站的 `scripts` 枚举新增 `han-traditional`。
- TC 族声明 `scripts: ["cjk", "han-traditional"]`：`cjk` 必须保留，否则 `fonts:audit` 会把 TC 族排除在汉字覆盖检查之外。
- `fontProfile: traditional-chinese` 映射到 `han-traditional` 覆盖门禁；不从语言代码静默推断。

### 3. 页面级字体路由

- `html:lang(zh-TW)` 内做变量重映射：每个被设计用到的 CJK 核心变量映射到对应 TC 族；韩文伴生槽位映射到哨兵 `__senrenbanka_tc_skip__`，不提升为新的字形角色。
- 系统 CJK 设计（8 套）没有 Han 核心变量：把韩文伴生变量重映射到 Noto Sans TC / Noto Sans Mono CJK TC；该槽位原本就是 Han 回退位。
- TC `<Font>` 只在 `zh-TW` 页面注册；简体核心与韩文伴生不在 TC 页注册。条件注册受 `fonts:coverage` 校验。
- 基础字体栈零改动，其他语言零回归；不引入按 locale 拆 CSS 的新机制。

### 4. 子集与体积

- `fonts:subset` 沿用全站 dist 语料（over-approximate），TC 族不按码位过滤；不新增语料切分机制。
- 实测（175 HTML / 27 TC 页）：`dist` **8,845,322 B（8.44 MiB）**；14 个核心子集 / 2,756,908 B；45 个字体文件 / 3,668,492 B；10 MiB 硬门禁与 8.5 MiB 软目标均满足。
- 超软目标时先砍装饰族/同角色替代，不抬门禁。

### 5. 发布

- 字体仓库：5 族各 v1.0.0 → catalog v1.2.0；现有 26 族字节不变；Release 不可变。
- 发布前逐族确认许可证据、样张与资产清单；catalog 最后发布。

## 后果

- 27 套设计都有繁中页面与 TC 字形；TC 页只下载 TC 字体与 Latin 字体，不下载简体核心/韩文伴生。
- 新增 5 个本地字体族、14 个核心子集；`dist` 增加约 2.79 MiB（含 27 个 HTML）。
- `fonts:audit` 的 64 个内容级缺字警告保留（主要是 Ark Pixel 在 en/ja/zh-CN 页的既有缺口，以及 TC 页日本标签 URL 的 `獣`）；无部署缺口。
- 繁中与简中共享码位，`unicode-range` 不能用于分流；未来新增繁中类 locale 必须继续走页面级路由。
- `fonts:audit` 现在忽略 locale 重映射产生的 `var(...)` 与哨兵值，避免把未部署的 SC 核心算作 active source。

## 已否决

- **`unicode-range` 分流**：4,384 个 Big5 码位与 GB2312 重合，无法按码位区分。
- **全站注册 TC 字体 + 栈顺序**：所有语言页面都会预加载 TC 字体，违背体积敏感。
- **按 locale 拆设计 CSS**：新增 27 个 CSS 文件与条件加载机制，碰样式隔离边界。
- **运行时 JS 文本转换/语言切换**：破坏静态路由、SEO 与无 JS 契约。
- **复用 SC 核心字体**：码位有、字形不对，正是本 ADR 要避免的静默回退。
- **Ark Pixel TC**：缺 48 个常用繁体字。
- **一次配 7 个全角色族**：会逼近 10 MiB 门禁；装饰族延后到实测之后。
