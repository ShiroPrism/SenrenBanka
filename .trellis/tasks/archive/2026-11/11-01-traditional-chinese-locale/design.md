# 繁体中文全设计覆盖 · 技术设计

## 1. 现状与约束

### 1.1 Locale 接入点

新增一个 locale 需要动的地方（来自 `11-01-locale-expansion` 的实现）：

1. `src/data/site.config.yaml` 的 `i18n.locales`（唯一语言清单）。
2. `src/data/profiles/<path>.yaml`（每 locale 恰好一份，缺失/多余都会失败）。
3. `src/i18n/messages.ts` 的 locale 字典与导出映射。
4. 每个覆盖设计的 `design.json.locales`。
5. 每个覆盖设计的 `designs/<id>/messages.ts` locale 块。
6. `src/designs/descriptions.ts` 的每设计 locale 描述。
7. 若新增 `fontProfile` 值：`src/content.config.ts`、`src/lib/site.ts`、`scripts/fonts/coverage.mjs`。
8. 路由无需新增文件：`astro.config.mjs` 在构建期读取 `site.config.yaml` 与各 `design.json`，按 `(locale.path, design.id)` 注入静态路由。
9. 设计内语言相关 CSS：`src/designs/archive/style.css` 的 `:lang(zh-CN)/:lang(ja)/:lang(ko)`。

### 1.2 字体管线

- 字体仓库 `whitehair-failure/SenrenBanka-fonts` 发布 `core-cjk` 与 `fixed` 族；当前 catalog v1.1.0，26 族 = 9 core-cjk + 17 fixed。
- 主站 `fonts:update` 锁定 catalog；`fonts:prepare` 下载生产包与 core source archive 到 `.cache/`；之后构建离线。
- 构建链：`fonts:check` → `check`（docs / typography / coverage / astro check）→ `astro build` → `fonts:subset` → `fonts:prune` → `verify:html-only` → `fonts:audit`。
- `fonts:subset` 用全站 dist 文本建全局语料，每个 core-cjk 族生成一个内容子集；`scripts` 含 `hangul` 且不含 `cjk` 的族只保留 Hangul 码位并输出 Hangul `unicode-range`；其余族用全语料。
- 当前基线（2026-11-01 韩语全量后）：`dist` 6,056,936 B / 146 HTML；语料 1,634 码位；核心子集 LXGW 288,928 B（1,633 字）、Zhuque 357,396 B（1,165 字）、Ark 33,840 B（1,154 字）；韩语 Hangul-only 子集 10,640–54,164 B。
- 体积硬门禁 10 MiB（`scripts/fonts/prune.mjs`）。

### 1.3 现有覆盖门禁

- `fonts:coverage`：当前只把 `fontProfile: korean` 映射到 `hangul`；要求覆盖设计的 `Page.astro` 注册了对应 script 的族，且每条 `font-family` 栈都含该 script 的族。
- `fonts:typography`：硬编码 9 个 `CORE_FONT_VARIABLES` 与系统 CJK 名集合；要求生成族数 26、styled 设计数 26。
- `fonts:audit`：按码位把字符归类为 `hangul` 或 `cjk`，只审计 `scripts.includes(script)` 的活跃族；`core-cjk` 族的源覆盖与部署覆盖不一致会失败。

### 1.4 设计字体分类

- 18 套有 CJK 核心：LXGW 7、Zhuque 8、Ark 4（`ink` 同时用 LXGW 与 Zhuque）。
- 8 套系统 CJK：`fast`、`frost`、`govuk`、`homepage99`、`kern`、`material3`、`oxide`、`terminal`；它们只注册韩文伴生族，汉字本来走系统字体。
- 26 套 styled + `html-only`（零字体契约，排版维度豁免）。

## 2. 决策总览

| 决策 | 结论 |
|---|---|
| Locale | `zh-TW` / `zh-tw` / 繁體中文 / 台湾国语用词，排在 `zh-CN` 后 |
| 内容生产 | OpenCC `s2twp` 初转 + 逐设计改写 + 用户终审 |
| 字体元数据 | `scripts: ["cjk", "han-traditional"]` |
| Locale profile | 新增 `fontProfile: traditional-chinese` → `han-traditional` |
| TC 族 | 5 个阅读角色族；装饰角色先替代，实测后再决定是否补 |
| CSS 接入 | `html:lang(zh-TW)` 变量重映射；TC Font 仅 TC 页注册 |
| 系统 CJK 设计 | 同一覆盖标准，locale 作用域插入 TC 族 |
| 子集语料 | 沿用全站语料（over-approximate） |
| 体积 | 10 MiB 硬门禁，8.5 MiB 软目标 |
| 发布 | 首批 6 套即可发布，其余 21 套 7/7/7 增量 |
| 任务 | 父任务 + 5 子任务 |

## 3. 字体仓库设计

### 3.1 新增族

| 族 id | 角色 | 上游/许可要点 |
|---|---|---|
| `noto-sans-tc` | Sans | Noto CJK 静态 regional OTF，OFL-1.1，无 RFN；不用 Google Fonts VF |
| `noto-serif-tc` | Serif/Song | 同上 |
| `lxgw-wenkai-tc` | Kai | LXGW 系列，OFL-1.1 + RFN 霞鹜/霞鶩/LXGW；需确认 TC 版本覆盖同一 `permission-granted` 网页子集化许可 |
| `ark-pixel-tc` | Pixel | Ark Pixel 12px zh_tr，OFL-1.1，无 RFN |
| `noto-sans-mono-cjk-tc` | Mono | Noto CJK Mono 静态 regional OTF，OFL-1.1，无 RFN |

- 每族只发 Regular 一个 face，沿用韩语族的单 face + 合成粗体策略。
- 每族 `role: core-cjk`、`output` 与现有 core-cjk 一致；`scripts: ["cjk", "han-traditional"]`。
- 字体仓库 schema 的 `scripts` 枚举加 `han-traditional`；与 `hangul` 一样限制 `role === 'core-cjk'`。
- 族版本 v1.0.0；catalog v1.2.0；现有 26 族字节不变。
- 若 LXGW TC 许可证据不成立：Kai 设计改用 `noto-serif-tc` 或在覆盖表记录替代，不阻塞发布。

### 3.2 发布流程

1. 调研子任务冻结候选、许可证据、样张、真实 TC 语料 subset 体积、逐设计映射表。
2. 字体仓库逐族构建 → 双构建复现 → 许可与资产清单 → 用户确认。
3. 依次发布 `font-<id>-v1.0.0` → `catalog-v1.2.0`；catalog 最后发布。
4. 主站 `fonts:update --catalog-url <catalog-v1.2.0 URL> --catalog-sha256 <sha>` → lock / snapshot / `src/fonts/generated.ts`。

## 4. 主站字体路由与 CSS 机制

### 4.1 变量重映射（18 套 CJK 核心设计）

构建产物中 `<Font>` 生成 `<style>:root{--font-lxgw:"LXGW WenKai GB-<hash>"}</style>`，设计 CSS 后加载且共享；因此每套设计新增一段：

```css
html:lang(zh-TW) {
  --font-gowun-batang: var(--font-lxgw-tc);
  --font-lxgw: var(--font-lxgw-tc);
}
```

- `html:lang(zh-TW)` 特异性 (0,1,1) 高于 `:root` (0,1,0)，稳定覆盖。
- 基础字体栈零改动，其他语言零回归。
- 韩文伴生槽位只覆盖 Hangul；TC 页不需要 Hangul，映射到该设计主 TC 族或哨兵，**不得**把 Sans 伴生提升为 Han 角色。
- 多核心设计（如 `ink`）按角色分别映射：Zhuque 槽 → Serif TC，LXGW 槽 → Kai TC。
- Latin 字体继续在 TC 页注册。

### 4.2 系统 CJK 设计（8 套）

这些设计的基础栈没有 Han 核心变量，需要在 `html:lang(zh-TW)` 作用域给相关 `font-family` 声明插入 TC 族，并移除/替换未注册的韩文伴生变量，避免未定义 `var()` 让整条声明失效：

```css
html:lang(zh-TW) .fast-body {
  font-family: var(--font-noto-sans-tc), 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}
```

### 4.3 页面注册

- `Page.astro` 中以 `view.locale.code === 'zh-TW'` 条件注册 TC `<Font>`。
- 同一条件下不注册简体核心与韩文伴生，避免 TC 页下载无用字体。
- 覆盖门禁必须校验注册受 locale 条件保护，而不仅是字符串存在。

### 4.4 子集与部署

- TC 族 `scripts` 含 `cjk`，`isHangulOnly` 为 false，走全语料子集；不新增语料切分机制。
- `fonts:subset` 仍为每族一个 WOFF2；`fonts:prune` 按页保留命中规则；TC 页只保留实际注册的 TC/Latin 族。
- TC 族源字体覆盖 TC 页面可见字符；`fonts:audit` 继续按 `cjk` 审计。

## 5. 门禁设计

### 5.1 `fonts:coverage`

新增 `traditional-chinese` → `han-traditional` 映射，并增加 TC 专用校验：

- 覆盖 `zh-TW` 的设计，CSS 中出现的每个 CJK/伴生变量必须在 `html:lang(zh-TW)` 块中有重映射；重映射目标族的 `scripts` 含 `han-traditional`。
- 8 套系统 CJK 设计：`html:lang(zh-TW)` 作用域必须存在含 TC 族的字体栈，且栈内所有 `var(--font-*)` 在 TC 页都有定义。
- TC `<Font>` 注册必须在 locale 条件内。

### 5.2 `fonts:typography`

- `CORE_FONT_VARIABLES` 增加 5 个 TC 变量。
- `SYSTEM_CJK_FONTS` 增加 `PingFang TC`、`Microsoft JhengHei`、`Noto Sans CJK TC`、`Noto Serif CJK TC`、`Songti TC`、`Kaiti TC` 等 TC 系统字体名。
- 生成族数 26 → 31；styled 设计数仍为 26。

### 5.3 `fonts:audit`

- TC 族保留 `cjk`，因此 TC 页的汉字覆盖照常审计。
- TC 页的活跃族只有 TC + Latin；`activeForScript` 会选中 TC 族。
- 缺字按既有规则警告并记录，不阻塞构建。

## 6. 体积模型

- 当前 `dist` 6,056,936 B；新增 27 个 TC HTML 页预计 +0.6–0.8 MB。
- 5 个 TC 族按现有语料规模粗估 2–2.5 MB；最终以调研子任务用真实 TC 语料实测为准。
- 软目标 8.5 MiB；若超限：先去掉装饰族、再用同角色替代，最后才考虑缩小 TC 族集；不抬 10 MiB 硬门禁。
- 发布记录必须包含 `dist` 字节数、HTML 数、WOFF2 数、每族 subset 字节数。

## 7. 风险与缓解

| 风险 | 缓解 |
|---|---|
| LXGW TC RFN 许可不覆盖 TC | 调研核实；不成立则 Kai 设计改用 Noto Serif TC 并记录 |
| Noto VF 的 “Source” RFN | 只用静态 regional OTF |
| Ark Pixel TC 变体缺失/命名不一致 | 调研阶段确认 12px zh_tr 产物与 manifest 命名 |
| TC 子集体积超预期 | 5 族方案 + 装饰族延后；软目标 8.5 MiB；必要时只保留 4 族 |
| 8 套系统设计漏改导致未定义 `var()` | 覆盖门禁校验 TC 作用域内所有变量已定义 |
| TC 页误加载简体/韩文字体 | 条件注册 + prune 后按页审计 |
| 内容机翻未审 | 用户终审是发布前置条件 |
| 韩语遗留矩阵缺口 | 收尾 TC 矩阵时一并补跑 |

## 8. 回滚

- 内容层：按批次移除 `design.json.locales` 的 `zh-TW` 与该设计文案即可回滚到上一批。
- 字体层：catalog 锁定可回退到 v1.1.0；TC 族与 catalog v1.2.0 是不可变资产，回滚只改主站 lock / config / generated。
- 样式层：`html:lang(zh-TW)` 块与条件注册可按设计独立移除，不影响其他语言。
- 发布后回滚优先移除 locale 或缩小覆盖，不修改已发布字体资产。
