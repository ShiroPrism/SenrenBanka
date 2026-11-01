# 韩语全设计覆盖 · 技术设计

> 父任务级设计：只定义跨子任务架构、契约与边界。具体实现细节见两个子任务的 `design.md`。

## 1. 架构总览

```text
SenrenBanka-fonts (独立仓库)
  catalog/families/<id>/1.0.0.json     ← role: core-cjk, scripts: ["hangul"]
  licenses/<id>/LICENSE.txt
  source archive (完整源字体)
        │  build-catalog.mjs
        ▼
  catalog v1.1.0 (GitHub Release, immutable)
        │  fonts:update --catalog-url ... --catalog-sha256 ...
        ▼
SenrenBanka (主站)
  fonts.config.json → fonts.lock.json → fonts.catalog.json → src/fonts/generated.ts
        │  fonts:prepare (生产包 + 核心 source archive)
        ▼
  .cache/fonts/1.1.0/<family>@1.0.0/
  .cache/font-sources/1.1.0/<family>@1.0.0/
        │  astro build → fonts:subset → fonts:prune → fonts:audit
        ▼
  dist/_astro/fonts/<family>-subset-<hash>.woff2
  dist/_astro/fonts-<hash>.css   ← Hangul-only unicode-range 规则
```

主站不在运行时访问字体仓库；字体仓库只在 `fonts:prepare` 与 `fonts:update` 时作为构建期依赖。

## 2. 关键契约

### 2.1 字体目录

- `role: core-cjk` 继续表示「完整 cmap 源字体 + 构建期内容子集」；韩语族复用该角色，不新增 `core-script`。
- 新增顶层 `scripts: ("cjk" | "hangul")[]`：
  - 新韩语族：`["hangul"]`；
  - 现有族缺省：`["cjk"]`（catalog builder 默认值，不修改已发布的 family v1.0.0 descriptor）；
  - 该字段是**路由声明**，不是完整覆盖承诺；实际覆盖仍由 source cmap 与 `fonts:audit` 验证。
- 每个韩语族只有一个 Regular face；`output.type: core-cjk`，`chunkSize: 71680`，`languageAreas: true`，`fontFeature: true`。

### 2.2 站点字体锁

- `fonts.config.json` 增加 6 个 family 条目（id、name、cssVariable、fallbacks）。
- `fonts:update` 以发布页带外取得的 catalog SHA 更新 `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`。
- 不手改生成文件；不自动追 latest。

### 2.3 Hangul-only 子集与路由

- 常量 `HANGUL_RANGES`：
  - U+1100–11FF Hangul Jamo
  - U+3130–318F Hangul Compatibility Jamo
  - U+A960–A97F Hangul Jamo Extended-A
  - U+AC00–D7A3 Hangul Syllables
  - U+D7B0–D7FF Hangul Jamo Extended-B
  - U+FFA0–FFDC Halfwidth Hangul
- `fonts:subset` 对 `scripts` 含 `hangul` 且不含 `cjk` 的族：
  - 只从语料中取 Hangul 码位生成子集；
  - 合成 `@font-face` 规则带 `unicode-range: <HANGUL_RANGES>`。
- 对 `scripts` 含 `cjk` 的族保持现有「全语料子集 + 无 unicode-range」行为。
- 设计字体栈顺序：拉丁/展示 → 韩语伴生 → CJK 核心 → 系统韩文 → 系统中文/日文 → 通用族。`unicode-range` 使韩语伴生只接管谚文，不劫持汉字/假名/拉丁。

### 2.4 覆盖门禁

- `design.json.locales` 是页面覆盖的单一事实来源；`site.config.yaml` 的 `fontProfile` 是文字系统需求的单一事实来源。
- 门禁输入：
  - `site.config.yaml`：locale → fontProfile（`cjk` / `korean` / `latin` / `vietnamese`）。
  - `design.json`：`locales`、`renderMode`。
  - 设计 CSS 与 Astro style block：每条 `font-family` / `font` 声明。
  - `Page.astro`：`<Font cssVariable="...">` 注册。
  - catalog snapshot：family 的 `scripts` 与 source coverage。
- 判定：
  - ko + styled：每条字体栈必须包含一个 Hangul 能力核心变量，且页面注册该 Font；否则构建失败。
  - zh-CN/ja + styled：保持现有 CJK 核心字体要求。
  - html-only：排版维度豁免。
  - 源字体缺字：警告 + 报告，不静默回退。
- `fonts:typography` 硬编码的 `20 families` / `26 styled` 必须随 catalog 更新为 `26 families`；`CORE_FONT_VARIABLES` 与 `SYSTEM_CJK_FONTS` 扩展为 CJK + Korean。

### 2.5 Font 注册与预加载

- 只有当前有 ko 页面的设计注册韩语 `<Font>`：`editorial`、`frost`、`fast`、`govuk`。
- 其余 22 套只加 CSS 伴生变量；内容子任务在添加 `design.json.locales` 的 `ko` 时一并加 `<Font>`。
- 必须先验证 Astro `<Font>` 是否预加载韩语子集；若非 ko 页面会因此下载韩文字体，则坚持「有 ko 页面才注册」。
- `html-only` 不注册任何字体。

## 3. 设计映射

| 韩语族 | 设计 |
|---|---|
| Gothic A1 | brutal, fast, frost, govuk, homepage99, kern, material3, poster |
| Gowun Batang | archive, deco, editorial, ink, lexicon, little-forest |
| Galmuri11 | pager, pixel-pet-rpg, radio, receipt |
| Noto Sans Mono CJK KR | fax, oxide, terminal |
| Dongle | cute-alism, fairy-kei, magical-girl |
| Poor Story | sticker-diary, tape |
| 豁免 | html-only |

判断点（可在视觉验收时微调）：`archive`（Gowun Batang vs Noto Mono）、`poster`（Gothic A1 vs Gowun Batang）、`receipt`（Galmuri11 vs Noto Mono）、`tape`（Poor Story vs Noto Mono）。

## 4. 体积模型

- 韩语族 Hangul-only 子集估算：Gothic A1 ~34 KB、Gowun Batang ~43 KB、Galmuri11 ~9 KB、Noto Sans Mono CJK KR ~53 KB、Dongle ~15 KB、Poor Story ~24 KB，合计 ~178 KB。
- 当前 dist 5,147,903 B；预计四语 dist ~5.35 MB，低于 10 MiB。
- 访客只下载页面命中的子集；非 ko 页面不加载韩语 Font。字体仓库 source archive 体积只影响构建期 `fonts:prepare`。
- 不在运行时重新子集化；不发布可安装桌面字体。

## 5. 边界与职责

| 层 | 负责 | 不负责 |
|---|---|---|
| 字体仓库 | 源字体、descriptor、license、family package、catalog、Release | 站点字体栈、内容、路由 |
| 主站 | 锁、子集/裁剪/审计、设计字体栈、覆盖门禁、页面 | 字体源文件打包、Release |
| 内容子任务 | 22 套韩语文案、`design.json.locales`、`messages.ts`、`descriptions.ts`、`<Font>` | 字体仓库、字体管线 |

## 6. 替代方案与否决理由

| 方案 | 否决理由 |
|---|---|
| 新增 `core-script` role | 韩语属于 CJK，且走同一分发/子集路径；没有操作差异的新分类只会增加分支。 |
| 继续用 Noto Sans/Serif KR | 带 Hanja，全站语料子集 256/390 KB；Gothic A1/Gowun Batang 无 RFN、0 Hanja、更小。 |
| 按字体栈自然回退 | LXGW 自带谚文且 7 套设计在用；韩语族放在其后永远不生效；含 Hanja 的韩语族放前面会劫持汉字。 |
| 按 locale 切换整套字体栈 | CSS 分叉、维护成本高；Hangul-only `unicode-range` 已能隔离。 |
| 每族发多个 face | 现有 core 子集管线只支持单 face；先用 Regular + 合成粗体，验收后再扩。 |
| 韩语族按 `fixed` 全量 WOFF2 | 失去内容子集，体积不可控。 |
| 修 `renameSfntFont` 以解锁 D2Coding/Pretendard | 独立工具链债；本轮用无 RFN 字体绕过，避免扩大范围。 |

## 7. 回滚

- 字体仓库：catalog v1.0.0 保持可用；v1.1.0 发布后不删除、不覆盖。若新族有问题，提升该族版本并发新 catalog，不修改已发布资产。
- 主站：`fonts.lock.json` 回退到 catalog v1.0.0；移除 6 个 family 配置与设计字体栈；内容子任务未开始，无文案回滚。
- 构建缓存：`.cache/fonts/1.1.0` 与 `.cache/font-sources/1.1.0` 可删除后重新 `fonts:prepare`。
- 门禁：新增门禁与脚本可独立回退；不得通过放宽 10 MiB 或删除审计来「修复」构建。

## 8. 待实现验证的风险

- Astro `<Font>` 的预加载行为与非 ko 页面下载量。
- `fonts:prune` 对带 `unicode-range` 的韩语子集规则的逐页保留/孤儿清理。
- `typography.mjs` 的全栈扫描能否捕获纯系统字体栈的韩语缺口。
- Google Fonts 源文件的 commit pin 与许可文件哈希。
- Noto Sans Mono CJK KR 的 OTF/CFF 在 `subset-font` 与 `cn-font-split` 下的行为。
- 6 个 source archive 的下载体积与 CI 缓存策略。
