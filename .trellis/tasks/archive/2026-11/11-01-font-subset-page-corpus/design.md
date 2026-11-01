# 技术设计：字体子集按引用页限定语料

## 1. 现状

构建顺序：`astro build` → `fonts:subset` → `fonts:prune` → `fonts:audit`。

[scripts/fonts/subset.mjs](file:///F:/SenrenBanka/scripts/fonts/subset.mjs) 当前流程：

1. [buildCorpus:264](file:///F:/SenrenBanka/scripts/fonts/subset.mjs#L264) 扫描 `dist` 全部 209 个文本资产，生成 1833 码位的全局语料。
2. [Pass 1:412](file:///F:/SenrenBanka/scripts/fonts/subset.mjs#L412) 每个 core 族都用同一份全局语料生成一个 WOFF2 子集。
3. [Pass 2:445](file:///F:/SenrenBanka/scripts/fonts/subset.mjs#L445) 才逐页计算 `coreByFamilyName` 并重写内联 `@font-face`。

问题：语料在页面归属已知之前就被全局化，导致只被 2 个页面引用的 TC mono 族也携带全站 1832 个字符。

约束：[docs/rules/operations.md:30](file:///F:/SenrenBanka/docs/rules/operations.md#L30) 要求语料必须来自最终 `dist` 产物本身，不能另建语料清单；[operations.md:33](file:///F:/SenrenBanka/docs/rules/operations.md#L33) 目前明确写的是 TC 族“用全站语料”，本次需要同步改文档。

## 2. 目标数据流

```
astro build
  └─ 扫描 HTML 一次
       └─ pageContexts: { label, file, html, styles, css, coreByFamilyName, coreRuleIds }
  └─ buildSharedCorpus(dist)
       └─ 非 HTML 文本资产（CSS/JS/JSON/SVG/XML/TXT/webmanifest），去掉 @font-face，解码实体/转义
  └─ familyCorpus[core] = sharedCorpus ∪ 引用该 core 的页面原始 HTML
       └─ hangul-only 族再过滤 Hangul 区块
  └─ subsetFont(familyCorpus[core]) → 每个被引用的 core 一个 WOFF2
  └─ 用 pageContexts 重写页面（逻辑与当前 Pass 2 相同）
  └─ 写子集文件、页面、subset-report v2
```

## 3. 代码边界与改造点

改动集中在 `scripts/fonts/subset.mjs` 与 `scripts/fonts/subset.test.mjs`；`audit.mjs` / `prune.mjs` 不改。

### 3.1 保留

- `buildCorpus(distRoot)` 保留导出与现有行为（全局语料），供现有测试与需要全站语料的调用方使用。
- `coreFaces` 的单 face 校验、source cache 哈希校验、已 prune 检测、可见文本一致性检查、幂等语义全部保留。
- `pageCss`、`cssVariableFamilies`、`extractInlineStyles`、`syntheticRule`、`rewriteStyleBlock` 复用，不复制逻辑。

### 3.2 新增

1. `buildSharedCorpus(distRoot)`
   - 复用 `walkFiles` + `TEXT_ASSET_EXTENSIONS`，排除 `.html` / `.htm`。
   - 复用 `FONT_FACE_BLOCK_PATTERN` 去除 `@font-face`，`decodeHtmlEntities` / `decodeCssEscapes` 后收集码位。
   - 返回 `{ text, codePoints, textFiles, textBytes, sha256 }`。

2. `planPageCores({ distRoot, htmlFiles, cores })`
   - 逐页读取 HTML、`extractInlineStyles`、`pageCss`、`cssVariableFamilies`。
   - 生成 `coreByFamilyName`（family 名 → core）与 `coreRuleIds`（该页确实存在匹配 `@font-face` 规则的 core，语义等同当前 Pass 2 的 `pageCores`）。
   - 返回页面上下文数组，后续重写直接复用，不二次读盘。

3. `buildFamilyCorpus(core, pageContexts, sharedCorpus)`
   - 从所有 `coreRuleIds` 包含该 core 的页面拼接原始 HTML 文本（同样去 `@font-face`、解码实体/转义）到共享语料的码位集合。
   - 码位排序 → 文本 → sha256；返回 `{ text, codePoints, pages, sha256 }`。
   - Hangul-only 判定沿用 `isHangulOnly` + `filterCorpusText`，`corpus` 标记 `hangul`。

### 3.3 流程调整

`subsetCoreFonts` 改为：

1. 扫描 HTML。
2. `planPageCores`（一次读盘）。
3. `buildSharedCorpus`。
4. 求 `usedCoreIds = union(pageContext.coreRuleIds)`。
5. 对每个 `usedCoreIds` 中的 core：`buildFamilyCorpus` → `subsetFont`。
6. 未被任何页面引用的 core：记录日志并跳过，不写文件、不写规则。
7. 用已保存的 pageContexts 重写页面（当前 Pass 2 逻辑）。
8. 写子集文件与报告。

早退分支保持：
- catalog 无 core → `families: []`。
- 没有任何页面引用 core（例如纯拉丁 fork）→ 现有“already externalized”检测与 `families: []` 报告。
- 已 prune（存在外置 `fonts-*.css`）→ 明确报错。

## 4. 契约：subset-report v2

```json
{
  "schemaVersion": 2,
  "corpusScope": "per-family",
  "dist": "dist",
  "catalogVersion": "1.2.0",
  "corpusCodePoints": 0,
  "corpusSha256": "...",
  "corpusTextFiles": 0,
  "corpusTextBytes": 0,
  "sharedCorpus": {
    "codePoints": 0,
    "textFiles": 0,
    "textBytes": 0,
    "sha256": "..."
  },
  "families": [
    {
      "id": "noto-sans-mono-cjk-tc",
      "cssVariable": "--font-noto-sans-mono-cjk-tc",
      "corpus": "page-scope",
      "corpusPages": 2,
      "corpusCodePoints": 536,
      "corpusSha256": "...",
      "subsetFile": "_astro/fonts/noto-sans-mono-cjk-tc-subset-<hash>.woff2",
      "subsetBytes": 202412,
      "characters": 0,
      "scripts": ["cjk", "han-traditional"],
      "unicodeRange": null
    }
  ],
  "pages": [],
  "subsetBytes": 0,
  "subsetFileCount": 0
}
```

兼容策略：

- 顶层 `corpusCodePoints` / `corpusSha256` / `corpusTextFiles` / `corpusTextBytes` 保留，值为**所有实际生成子集的 family 语料并集**，避免现有断言与文档全部失效；新增 `corpusScope` 与 `sharedCorpus` 说明真实粒度。
- 每族新增 `corpusPages` / `corpusCodePoints` / `corpusSha256`；`corpus` 取值 `page-scope` 或 `hangul`。
- 报告仍不含时间戳、机器路径；码位排序保证确定性。

## 5. 正确性论证

- **覆盖面**：对每个 core，凡是存在该族 `@font-face` 规则的页面，其**原始 HTML 全文**（含属性、内联 JSON、脚本、样式）都进入该族语料；共享 CSS/JS 全量进入所有族语料。页面可能渲染的任何字符都是该集合的子集。
- **CSS 伪元素 / JS 字符串**：位于共享 CSS/JS 资产中，已全量纳入。
- **页面映射等价**：`planPageCores` 使用与当前 Pass 2 相同的 `pageCss` + `cssVariableFamilies` + 内联规则过滤；locale 重映射产生的 `var(...)` / 哨兵值不会误判为 family。
- **符号/缺字**：仍由现有 `fonts:audit` 按真实 cmap 逐页校验；子集是超集，审计只会更容易通过。
- **幂等**：已子集页面保留 CSS 变量与合成规则（family 名不变、无 `unicode-range`），`coreByFamilyName` 仍能识别；语料与输出哈希不变，第二次运行页面无变化。

## 6. 边界情况

| 情况 | 行为 |
|---|---|
| core 族未被任何页面引用 | 跳过，不产文件；报告不列出该族 |
| 页面只声明 CSS 变量但无 `@font-face` 规则 | 不计入 `coreRuleIds`，不触发该族子集 |
| 同一 core 在一页用多个 family 名 | 去重后只生成一条子集规则（沿用 Pass 2 的 `emitted` 集合） |
| 纯拉丁 fork | 早退，`families: []`，不生成子集 |
| 已执行过 `fonts:prune` | 明确报错，要求重新 `astro build` |
| 源缓存缺失/哈希不符 | 维持现有报错与修复提示 |
| 多 face core | 维持现有拒绝行为 |
| `--dry-run` | 不写子集、页面、报告；仍返回计划结果 |

## 7. 取舍

- 选择“按引用页”而非“按语言”：实测 1,099,300 B vs 565,324 B，收益约 2 倍；且不需要为每个 locale 建特例。
- 选择“按族”而非“按设计页”更细粒度：按设计页会让同一个共享 core 族在不同设计间产生多份文件，文件名与引用关系复杂，且新增设计会改变现有文件归属；按族是稳定边界。
- 不引入手写字符清单：保持“语料来自最终产物”的既有规则。

## 8. 兼容与回滚

- 无公开契约变化；`subset-report.json` 为内部产物且不入库。
- 字体文件名仍是 `<id>-subset-<hash>.woff2`，哈希会因语料变化而变，属于预期。
- 回滚：还原 `subset.mjs` / 测试 / 文档，重新 `npm run build` 即恢复全局语料子集；无数据迁移。

## 9. 风险

- 页面存在运行期注入、且不在任何 `dist` 文本资产中的文本 → 缺字。当前站点为纯静态，菜单与 Toast 文案均在产物中；审计兜底。
- 报告 schema v2 需同步测试与文档，否则 `npm test` 会暴露不一致。
