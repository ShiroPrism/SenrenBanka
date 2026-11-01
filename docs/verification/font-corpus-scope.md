# 字体子集按实际引用页限定语料（font corpus scope）

> **验证日期**：2026-11-01
> **范围**：`scripts/fonts/subset.mjs` 的语料粒度从全站统一改为按 core 族实际引用页；`scripts/fonts/subset.test.mjs` 新增隔离测试。
> **决策**：`docs/adr/0019-per-family-font-corpus.md`。

## 改动

- `fonts:subset` 先一次读盘规划页面 → core 映射，再生成每族语料：
  - 共享语料：全部非 HTML 文本资产（34 个，112 码位，665,092 B）；
  - 每族语料：共享语料 ∪ 实际声明该族 `@font-face` 的页面原始 HTML。
- 未被任何页面引用的 core 族跳过，不产子集文件；Hangul 族在每族语料上继续过滤 Hangul 区块。
- `subset-report.json` 升级为 schema v2：`corpusScope: "per-family"`、`sharedCorpus`、每族 `corpusPages` / `corpusCodePoints` / `corpusSha256`。

## 构建与体积

- `npm run build` 通过：**175 页**；`astro check` 0 error / 0 warning / 1 既有 hint；`fonts:coverage` / `fonts:typography` / `verify:html-only` 全绿。
- `fonts:subset`：14 个被引用族 / **1,625,116 B**（基线 2,774,444 B，-1,149,328 B = **1.096 MiB**）。
  - 8 个非 Hangul 族：**1,502,884 B**（基线 2,590,852 B）。
  - 6 个 Hangul 族：**122,232 B**（基线 183,592 B；各 250–297 个 Hangul 字符，旧策略固定 454 字）。
- `fonts:prune`：677 条规则 / 45 个字体文件 / 2,536,700 B；`dist` **7,632,396 B（7.28 MiB）**（本轮字体改动前 8,781,724 B；原始基线 8,855,728 B）。
- `fonts:audit`：677 规则 / 45 引用文件 / **0 孤儿 / 0 部署缺口** / 64 条源字体缺字警告（与改动前同量级）。
- `npm test`：**80/80**（新增“按族隔离 + 未引用族跳过 + 幂等”测试）。
- 10 MiB 门禁余量：**2.85 MiB**。

### 每族实测（subset-report v2）

| 族 | 页面数 | 字节 | 字符 |
|---|---:|---:|---:|
| zhuque-fangsong | 37 | 400,764 | 1670 |
| lxgw-wenkai | 33 | 323,952 | 1707 |
| noto-sans-mono-cjk-tc | 2 | 205,860 | 545 |
| noto-serif-tc | 8 | 197,216 | 604 |
| lxgw-wenkai-tc | 7 | 191,684 | 667 |
| noto-sans-tc | 6 | 129,716 | 563 |
| gowun-batang | 24 | 38,844 | 1099（Hangul 过滤后 296） |
| ark-pixel | 21 | 35,156 | 1640 |
| noto-sans-mono-cjk-kr | 12 | 24,784 | 962（Hangul 过滤后 250） |
| gothic-a1 | 32 | 21,944 | 1010（Hangul 过滤后 267） |
| poor-story | 8 | 19,480 | 983（Hangul 过滤后 268） |
| fusion-pixel-tc | 4 | 18,536 | 564 |
| dongle | 12 | 9,964 | 1066（Hangul 过滤后 297） |
| galmuri11 | 16 | 7,216 | 994（Hangul 过滤后 270） |

## 浏览器实测

预览：`python -m http.server 4400 --directory dist`；每页使用独立浏览器上下文（空缓存）。

| 页面 | 实际字体请求 | console | 4xx/5xx | 375px |
|---|---|---|---:|---|
| `/zh-tw/archive/` | noto-serif-tc + 2 个拉丁字体 | 0 | 0 | scrollWidth 360 < 375 |
| `/zh-tw/terminal/` | noto-sans-mono-cjk-tc + JetBrains Mono | 0 | 0 | 360 < 375 |
| `/zh-cn/little-forest/` | lxgw-wenkai + Fraunces | 0 | 0 | 360 < 375 |
| `/ko/editorial/` | gowun-batang + Fraunces | 0 | 0 | 360 < 375 |
| `/ja/pager/` | ark-pixel + 2 个拉丁字体 | 0 | 0 | 360 < 375 |
| `/en/html-only/` | **0** | 0 | 0 | 360 < 375 |

- `document.fonts.status === "loaded"`；计算字体栈中的 TC/Hangul 变量命中对应族（TC 页出现 `Noto Serif TC` / `Noto Sans Mono CJK TC` / `LXGW WenKai TC`，非 TC 页不出现 TC 族）。
- 截图：`assets/font-scope-{zh-tw-archive,zh-tw-terminal,zh-cn-little-forest,ko-editorial,ja-pager,en-html-only}-{1440,375}.png`。

## 正确性证据

- `fonts:audit` 用真实 cmap 逐页校验，0 部署缺口；源字体自身缺字仅 64 条既有警告。
- 新测试断言两个页面各自引用不同 core 时，子集只包含本页字符；未被引用的第三族不产生文件；第二次运行同输出。
- 语料仍是超集：每个族包含引用它的页面**全部原始 HTML** 与全部共享非 HTML 资产，属性、内联 JSON、脚本与 CSS 字符串都在内。

## 未测项

- Firefox / Safari / iOS / Android 真机、200% 缩放、`--base /demo`。
- 未做与改动前同视口的全页像素对比（无同尺寸基线）；以部署集合 cmap 审计、真实字体请求、计算字体栈与截图作为证据。
- CDP 平台字体信息未采集（项目允许的替代证据之一）。

## 环境备注

本机 `core.autocrlf=true` 会让 `src/fonts/generated.ts` 在 checkout 后成为 CRLF，而 `fonts:check` 按 LF 渲染比较；本次验证前将该文件本地规范化为 LF（内容与 HEAD 一致）后构建通过。该问题与字体语料改动无关。
