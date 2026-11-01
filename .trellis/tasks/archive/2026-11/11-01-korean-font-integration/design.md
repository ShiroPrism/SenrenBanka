# 主站韩语字体接入与排版覆盖门禁 · 技术设计

## 1. 数据流

```text
font repo catalog v1.1.0
  family.scripts = ["hangul"]
        │ fonts:update --catalog-url ... --catalog-sha256 ...
        ▼
fonts.config.json (6 new entries)
fonts.lock.json / fonts.catalog.json / src/fonts/generated.ts
        │ fonts:prepare
        ▼
.cache/fonts/1.1.0/<family>@1.0.0/
.cache/font-sources/1.1.0/<family>@1.0.0/
        │ astro build (emit shard @font-face rules)
        ▼
fonts:subset
  - cjk families: full corpus subset, no unicode-range (unchanged)
  - hangul families: Hangul-only corpus subset + Hangul-only unicode-range
        ▼
fonts:prune  (per-page unicode-range intersection, externalize CSS, delete orphans)
        ▼
fonts:audit  (deployed coverage: CJK + Hangul)
        ▼
fonts:typography / fonts:coverage (build-time contract)
```

## 2. Catalog 接入

### 2.1 `fonts.config.json`

在 `localFontFamilies` 末尾追加 6 条：

```json
{
  "id": "gothic-a1",
  "name": "Gothic A1",
  "cssVariable": "--font-gothic-a1",
  "fallbacks": ["Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", "sans-serif"]
}
```

其余同理。`fallbacks` 只用于目录映射校验，不写进浏览器 `--font-*`；实际栈由设计 CSS 拥有。

### 2.2 `fonts:update` / lock

```bash
npm run fonts:update -- \
  --catalog-url https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.1.0/catalog.json \
  --catalog-sha256 <from release page>
```

- 生成 `fonts.lock.json`、`fonts.catalog.json`、`src/fonts/generated.ts`。
- 主站 `scripts/fonts/lib/schema.mjs` 的 `catalogFamilySchema` 与 `familyManifestSchema` 需增加可选 `scripts`；当前 strict schema 会拒绝 catalog v1.1.0 的 `scripts` 字段。先补 schema + 测试，再跑 `fonts:update` / `fonts:prepare`。
- `src/fonts/generated.ts` 会有 26 families；`typography.mjs` 的硬编码 `20` 必须同步。
- `fonts.catalog.json` 必须保留 family 的 `scripts`；如果站点 catalog 校验器丢弃未知字段，需在 `scripts/fonts/lib/repository.mjs` / catalog schema 中放行 `scripts`。

### 2.3 `fonts:prepare` / `fonts:check`

- 6 个 core-cjk family 会同时下载 package 与 source archive 到 `.cache/fonts/1.1.0`、`.cache/font-sources/1.1.0`。
- `fonts:check` 完全离线复核 lock、snapshot、generated、package/source 哈希。

## 3. `fonts:subset` 改动

文件：`scripts/fonts/subset.mjs`

### 3.1 Hangul 范围常量

新增（与 audit 共用，建议放 `scripts/fonts/lib/script-ranges.mjs`）：

```js
export const HANGUL_RANGES = [
  [0x1100, 0x11ff], // Hangul Jamo
  [0x3130, 0x318f], // Compatibility Jamo
  [0xa960, 0xa97f], // Jamo Extended-A
  [0xac00, 0xd7a3], // Syllables
  [0xd7b0, 0xd7ff], // Jamo Extended-B
  [0xffa0, 0xffdc], // Halfwidth Hangul
];
export function isHangulCodePoint(cp) { ... }
```

### 3.2 `coreFaces()`

当前 `coreFaces(snapshot)`（约 126–154 行）只返回 `role: core-cjk` 的 family。增加：

```js
scripts: Array.isArray(manifest.scripts) ? manifest.scripts : ['cjk'],
```

如果 manifest 没有 `scripts`，默认 `['cjk']`（兼容 v1.0.0）。

### 3.3 语料过滤

当前 `buildCorpus` / `subsetCoreFonts` 用全站语料为每个 core family 生成子集。改为：

- `scripts` 含 `cjk`：保持全语料（现有行为）。
- `scripts` 只含 `hangul`：只保留 Hangul 码位（`isHangulCodePoint`），其余丢弃。
- 同时含两者：保持全语料（未来扩展）。

这样韩语子集不会把语料中的 912 个汉字带进来，避免 Galmuri11 / Noto Mono 的 Hanja 体积与劫持风险。

### 3.4 `syntheticRule()`

当前（约 302–307 行）：

```js
function syntheticRule({ familyName, url, face }) {
  return `@font-face{...font-display:${face.display};}`;
}
```

增加可选 `unicodeRange`：

```js
function syntheticRule({ familyName, url, face, unicodeRange }) {
  const range = unicodeRange ? `unicode-range:${unicodeRange};` : '';
  return `@font-face{...font-display:${face.display};${range}}`;
}
```

- Hangul-only family 传入 `HANGUL_RANGES` 序列化（如 `U+1100-11FF,U+3130-318F,...`）。
- CJK family 不传，保持无 `unicode-range`。

### 3.5 报告

`subset-report.json` 每族增加：

- `scripts`；
- `unicodeRange`（null 或字符串）；
- `corpus`（全语料 / hangul-only）；
- 子集码位数（Hangul / Han / Latin 分解）。

### 3.6 未使用族

- 当前只有 2 个韩语族（Gothic A1、Gowun Batang）会被 5 套 ko 页面引用；另外 4 个族的 CSS 变量在 22 套非 ko 设计中，但没有 `<Font>` 注册与韩文文本。
- `fonts:subset` 可能仍为全部 core families 生成子集；`fonts:prune` 会按页删除未命中的规则，`fonts:audit` 的孤儿检查会删除/报错未引用文件。
- 实施时先按现有管线跑；如果 4 个未使用子集导致 orphan 失败，二选一：
  1. `subsetCoreFonts` 只对「dist 中存在该 family @font-face 规则」的 core family 生成子集；
  2. `prune` 删除所有未引用子集文件。
- 目标是 `dist/_astro/fonts/` 无孤儿、无未使用韩语子集。

## 4. `fonts:audit` 改动

文件：`scripts/fonts/audit.mjs`

- 新增 `HANGUL_RANGES`（与 subset 共用）。
- `isCjkCodePoint` 改为 `isCoreScriptCodePoint`：CJK ranges + Hangul ranges；或保留 `isCjkCodePoint` 并新增 `isHangulCodePoint`，在覆盖检查里分别处理。
- 覆盖检查逻辑：
  - 页面文本中的 Hangul 字符，必须被该页部署的韩语子集或另一个部署规则覆盖；
  - 源字体覆盖但部署缺失 → 失败；
  - 源字体本身缺字 → 警告 + 报告。
- 报告字段：
  - `hangulCharacters` / `uncoveredHangul`；
  - 规则/文件统计保持；
  - 错误文案从「CJK」改为「CJK/Hangul」或 `core script`。
- 不修改 `fonts:prune` 的字节不变式；只扩展审计范围。

## 5. `fonts:typography` 改动

文件：`scripts/fonts/typography.mjs`

### 5.1 常量

```js
const CORE_FONT_VARIABLES = new Set([
  '--font-ark-pixel', '--font-lxgw', '--font-zhuque',
  '--font-gothic-a1', '--font-gowun-batang', '--font-galmuri11',
  '--font-noto-sans-mono-cjk-kr', '--font-dongle', '--font-poor-story',
]);
```

`SYSTEM_CJK_FONTS` 增加：

- `apple sd gothic neo`
- `malgun gothic`
- `noto sans kr`
- `noto serif kr`
- `nanum gothic` / `nanum myeongjo`（如果设计栈使用）

### 5.2 计数与文案

- `generated.count !== 20` → `26`。
- `styledCount !== 26` 保持。
- 错误文案「core CJK font variable」→「core script font variable」；「system CJK fallback」→「system script fallback」。
- 汇总日志 `coreDesignCount` 改为 `coreScriptDesignCount`（或保留变量名、改文案）。

### 5.3 全栈检查

`inspectTypographyCss` 当前只检查含 `var(--font-*)` 的 `font-family` / `font` 声明。这对韩语不够：`fast` 的 body 栈是纯系统字体，漏加韩语变量不会被发现。

- 抽出可复用的解析函数（`declarationValues` / `expandCustomProperties` / `splitTopLevel` / `normalizedFamily`）到 `scripts/fonts/lib/typography-css.mjs`。
- `inspectTypographyCss` 增加选项 `requireCoreVariable` / `requireFamilyFallback`，对**每条** `font-family` / `font` 声明检查：
  - 如果设计声明了 ko，且该栈包含文本（不是纯装饰/数字？），必须包含至少一个韩语核心变量；
  - 韩语核心变量必须位于系统韩文/中文回退之前；
  - 栈必须以显式 fallback 收尾。
- 纯装饰元素（如 `content`、图标）如果确有例外，必须在设计 CSS 注释中说明，并由门禁白名单放行；默认严格。
- 注意：`@theme inline` 里的 `--font-*` 定义不是 `font-family` 声明，不参与检查；但 Tailwind 生成的 `font-family` 会参与。

## 6. `fonts:coverage` 新门禁

建议新增 `scripts/fonts/coverage.mjs`，职责是 **locale × script × design** 的覆盖判定；`typography.mjs` 继续负责通用字体栈契约。

### 6.1 输入

- `src/data/site.config.yaml`：`i18n.locales[]` 的 `code` / `path` / `fontProfile`。
- `src/designs/<id>/design.json`：`locales` / `renderMode`。
- 设计 CSS 与 `*.astro` style block。
- `Page.astro` 中的 `<Font cssVariable="...">`。
- `fonts.catalog.json`：family 的 `cssVariable` + `scripts`（v1.1.0 新增）。
- `fonts.config.json`：cssVariable → family id 映射（若 catalog 不含 cssVariable）。

### 6.2 判定

```text
for each design:
  if renderMode == 'html-only': skip typography coverage
  for each locale in design.locales:
    profile = siteConfig.locales[locale].fontProfile
    # 本轮只新增韩语覆盖；CJK 核心存在性继续由 typography.mjs 的既有契约约束。
    requiredScript = profile == 'korean' ? 'hangul' : null
    if requiredScript is null: continue
    for each font-family declaration in design CSS/Astro styles:
      assert stack contains a var(--font-*) whose family.scripts includes requiredScript
      assert that var appears before system CJK/Korean fallbacks
    assert Page.astro registers at least one <Font> for a family with requiredScript
```

- `fontProfile` 不从 locale code 推断；只读显式配置。
- `html-only` 在 typography 维度豁免，但仍受 Design locale coverage 的文案/页面检查。
- 失败信息带 `[senrenbanka:fonts] coverage: <design> (<locale>) ...`。

### 6.3 与现有检查的分工

| 脚本 | 职责 |
|---|---|
| `fonts:typography` | 所有字体栈的通用契约：显式 fallback、core script 变量顺序、主 face、注册数 |
| `fonts:coverage` | locale 需要的**新增**文字系统（本轮为韩语/Hangul）是否被设计栈与 `<Font>` 注册真正覆盖；CJK 核心存在性仍由 `fonts:typography` 处理 |
| `fonts:audit` | 构建产物中部署字体是否覆盖页面实际字符 |

三者互补，不能互相替代。

## 7. 设计字体栈

### 7.1 通用顺序

```css
font-family:
  <拉丁/展示字体变量或系统拉丁>,
  var(--font-<韩语伴生>),
  <CJK 核心变量：--font-zhuque / --font-lxgw / --font-ark-pixel>,
  <系统韩文：Apple SD Gothic Neo / Malgun Gothic / Noto Sans KR>,
  <系统中文/日文：PingFang SC / Microsoft YaHei / Hiragino Sans / Yu Gothic UI>,
  <通用族：serif / sans-serif / monospace>;
```

- 韩语伴生必须在 LXGW 之前；否则 LXGW 的 11,172 个谚文会抢先命中。
- 韩语伴生必须在 Zhuque/Ark 之前或之后都可以（它们无谚文），但为了统一，放在 CJK 核心之前。
- 系统韩文字体放在系统中文之前；系统中文放在通用族之前。
- `unicode-range` 保证韩语伴生只接管谚文，不改变拉丁/CJK 字形。

### 7.2 示例

**editorial（现有 ko，LXGW + Fraunces）**

```css
.ed-name {
  font-family: var(--font-fraunces), var(--font-gowun-batang), var(--font-lxgw),
    'Songti SC', Georgia, 'Apple SD Gothic Neo', 'Malgun Gothic', serif;
}
/* body 栈原为 Georgia/Songti/SimSun；需加韩语变量，否则 bio 的韩文走系统回退 */
.ed {
  font-family: var(--font-gowun-batang), Georgia, 'Songti SC', 'SimSun',
    'Apple SD Gothic Neo', 'Malgun Gothic', serif;
}
```

**fast（现有 ko，系统字体）**

```css
.fs {
  font-family: 'Segoe UI Variable Text', 'Segoe UI', -apple-system, BlinkMacSystemFont,
    var(--font-gothic-a1), 'PingFang SC', 'Microsoft YaHei',
    'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
}
```

**archive（Zhuque + 衬线）**

```css
font-family: var(--font-sorts-mill-goudy), var(--font-gowun-batang), var(--font-zhuque),
  'Songti SC', 'SimSun', 'Apple SD Gothic Neo', 'Malgun Gothic', serif;
```

**pixel-pet-rpg（Ark Pixel）**

```css
font-family: var(--font-silkscreen), var(--font-galmuri11), var(--font-ark-pixel),
  'SimSun', 'Apple SD Gothic Neo', 'Malgun Gothic', monospace;
```

> 以上为顺序示意；实际选择器以各设计 CSS 为准。每条含 `var(--font-*)` 的栈都必须补韩语变量，纯系统栈也要补。

### 7.3 5 套现有 ko 的 `<Font>` 注册

| 设计 | Page.astro 增加 |
|---|---|
| editorial | `<Font cssVariable="--font-gowun-batang" />` |
| frost | `<Font cssVariable="--font-gothic-a1" />` |
| fast | `<Font cssVariable="--font-gothic-a1" />` |
| govuk | `<Font cssVariable="--font-gothic-a1" />` |
| html-only | 无 |

- 其余 22 套只加 CSS 变量；内容子任务在加 `ko` 时补 `<Font>`。
- 实测 Astro `<Font>` 默认 `preload=false`（`node_modules/astro/components/Font.astro:14`）；共享 Page.astro 注册不会产生 preload，非 ko 页面的韩语规则由 `fonts:prune` 裁掉。若升级后默认变化，改为条件渲染或显式 `preload={false}`。

## 8. 预加载与性能

- 实测 Astro `<Font>` 默认 `preload=false`（`node_modules/astro/components/Font.astro:14`），不会生成 `<link rel="preload">`。
- 因此共享 Page.astro 注册韩语 Font 不会让非 ko 页面下载韩语子集；`fonts:subset` 生成的 Hangul-only `@font-face` 会在 `fonts:prune` 时按页裁掉（无 Hangul 文本的页面不保留规则）。
- 仍保持「只有 5 套现有 ko 设计注册韩语 Font；其余 22 套只加 CSS 变量，内容任务再加 Font」：减少无用 `@font-face` CSS，并让内容任务逐套验证。
- 如果后续 Astro 版本改变默认预加载行为，必须回到条件渲染 `<Font>`（`view.locale.code === 'ko'`）或显式 `preload={false}`。

## 9. 体积

- 当前 5 套 ko 页面只使用 2 个韩语族：
  - Gothic A1 ~34 KB（frost/fast/govuk）
  - Gowun Batang ~43 KB（editorial）
  - 合计 ~77 KB。
- 其余 4 族（Galmuri11 / Noto Mono / Dongle / Poor Story）当前无 ko 页面，不应出现在最终 `dist`；由 prune/audit 保证无孤儿。
- 内容子任务扩展到 22 套后，6 族全部启用，Hangul-only 子集合计 ~178 KB，四语 dist 预计 ~5.35 MB。
- 10 MiB 门禁不变；不得为容纳字体提高阈值。

## 10. 文档

- **ADR 0017**：`docs/adr/0017-korean-full-coverage-fonts.md`
  - 替代 ADR 0016 的 Noto KR 计划；
  - 记录 6 族、无 RFN、core-cjk 复用、Hangul-only 路由、单 face/合成粗体、10 MiB 预算；
  - 记录否决 Noto/Black Han Sans/D2Coding/Pretendard 的原因；
  - 记录回滚。
- `docs/rules/operations.md`：核心脚本子集、Hangul-only、审计范围、体积。
- `docs/rules/data-and-i18n.md`：Locale typography coverage、fontProfile 消费、设计覆盖。
- `docs/rules/design-contract.md`：ko 设计的字体栈必须含韩语伴生。
- `docs/rules/visual-language.md`：字体顺序与回退。
- `SPEC.md`：字体管线、locale 覆盖、验收。
- `docs/verification/shared.md` + 5 套设计验证页：当前状态、截图、体积。
- `.agents/skills/design-page-verify/SKILL.md`：locale 列表加 ko，增加韩文字体检查。
- `CONTEXT.md`：已有 `Locale typography coverage` / `Core CJK font`；如需要，补「Korean companion face」术语。

## 11. 测试

新增/扩展：

- `scripts/fonts/*.test.mjs`（若存在）：
  - `scripts` 缺省 `['cjk']`；
  - Hangul 范围判断；
  - `syntheticRule` 带/不带 `unicode-range`；
  - 全栈检查捕获纯系统栈缺韩语变量；
  - `html-only` 豁免；
  - 非 ko 设计不强制韩语变量；
  - CSS 有韩语变量但 Page.astro 无 `<Font>` → 失败；
  - 声明 ko 但无韩语字体 → 失败。
- 现有 `npm test` 不能回归。

## 12. 回滚

- `fonts.lock.json` 回退 catalog v1.0.0；`fonts:update` 重新生成。
- 移除 6 个 family 的 `fonts.config.json` 条目。
- 回退 26 套设计 CSS 与 5 套 Page.astro 的韩语变量/`<Font>`。
- 删除 `.cache/fonts/1.1.0`、`.cache/font-sources/1.1.0` 后重新 `fonts:prepare`。
- 回退 `fonts:subset` / `audit` / `typography` / `coverage` 的改动。
- 内容子任务未开始，无文案回滚。
