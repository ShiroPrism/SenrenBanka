# 韩语全设计字体：6 族伴生、Hangul-only 路由与 core-cjk 复用

- 状态：Accepted（2026-11-01）
- 取代：ADR 0016 中「Noto Sans/Serif KR 作为未来目标」的字体计划（本 ADR 保留其首版取舍背景）
- 相关：`CONTEXT.md` 的 `Design locale coverage` / `Locale typography coverage` / `Core CJK font`；`docs/rules/operations.md`；`docs/fonts/selection-guide.md`；字体仓库 catalog v1.1.0 handoff

## 背景

- 站点有 27 套设计；韩语目前只覆盖 5 套（`editorial` / `fast` / `frost` / `govuk` / `html-only`）。
- 部署字体中只有 LXGW WenKai 带 11,172 个谚文音节；Zhuque、Ark Pixel、17 个 fixed、6 个 npm family 均为 0。
- ADR 0016 首版把 Noto KR 延后，editorial 临时用 LXGW 的 Hangul，frost/fast/govuk 走系统韩文字体。
- 用户要求韩语覆盖全部设计，同时对 `dist` 体积敏感（10 MiB 硬门禁）；系统回退无法满足「排版覆盖」。
- 调研实测：Noto Sans/Serif KR 带 Hanja（语料 653/912），全站语料子集 256/390 KB；韩语字体普遍带 Hanja，直接放在中文字体前会劫持汉字；LXGW 自带谚文且 7 套设计在用，韩语字体必须排在它之前或用 `unicode-range` 隔离。

## 决策

### 1. 两个覆盖维度

- `Design locale coverage`：页面 + 经审校的界面文案。
- `Locale typography coverage`：该 locale 的文字系统由已部署 webfont 接管，不允许系统回退静默顶替。
- 两个维度独立验收；`html-only` 因零字体契约在 typography 维度豁免。

### 2. 六个韩语核心族

全部 `OFL-1.1`、无 RFN、单 Regular 400 face：

| id | 定位 | 映射设计 |
|---|---|---|
| `gothic-a1` | 中性无衬线基线 | brutal, fast, frost, govuk, homepage99, kern, material3, poster |
| `gowun-batang` | 衬线/明朝体 | archive, deco, editorial, ink, lexicon, little-forest |
| `galmuri11` | 韩文像素 | pager, pixel-pet-rpg, radio, receipt |
| `noto-sans-mono-cjk-kr` | 韩文等宽 | fax, oxide, terminal |
| `dongle` | 圆体/可爱 | cute-alism, fairy-kei, magical-girl |
| `poor-story` | 手写/马克笔 | sticker-diary, tape |

- 源固定：Google Fonts commit `6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec`（Gothic A1 / Gowun Batang / Dongle / Poor Story）、`quiple/galmuri` v2.40.4、`notofonts/noto-cjk` Sans2.004。
- Noto Sans Mono CJK KR 使用 noto-cjk 静态 OTF，不用 Google Fonts VF（后者声明 RFN `'Source'` 且默认 Thin）。

### 3. 复用 `core-cjk`，不新增 `core-script`

- 韩语属于 CJK；6 族走与现有核心字体完全相同的「完整源字体 + 构建期内容子集」路径。
- catalog 发 v1.1.0；6 族各发 v1.0.0；现有 20 族 package/source 字节保持不变（已逐字节复核）。
- descriptor/manifest/catalog 增加 `scripts: ["cjk" | "hangul"]`（additive）；现有族缺省 `["cjk"]`。
- 主站 catalog/manifest schema 接受可选 `scripts`，`fonts:update` 校验 catalog 与 package manifest 的 scripts 一致。

### 4. Hangul-only 路由

- 韩语核心族的内容子集只按 Hangul 区块生成，并发布 Hangul-only `unicode-range`：
  `U+1100-11FF`、`U+3130-318F`、`U+A960-A97F`、`U+AC00-D7A3`、`U+D7B0-D7FF`、`U+FFA0-FFDC`。
- 韩语族在设计字体栈中排在 LXGW / 中文核心之前；`unicode-range` 保证只接管谚文，不改变拉丁/CJK 字形，也防止带 Hanja 的韩语族劫持汉字。
- 系统字体型设计（fast / govuk / homepage99）同样加 Hangul-only 伴生；拉丁仍走系统字体。
- 5 套现有 ko 设计注册韩语 `<Font>`；其余设计先加 CSS 变量，内容子任务在声明 `ko` 时再注册。Astro `<Font>` 默认 `preload=false`，非 ko 页面不会下载韩语子集，`fonts:prune` 按 `unicode-range` 裁掉规则。

### 5. 单 face 与合成粗体

- 每族只发 Regular；韩文标题先用合成粗体。
- 6 族样张目检通过（标题/正文/小字号/数字/标点/缺字回退/混排）；若后续视觉验收发现合成粗体不可接受，再扩展为两 face 并提升 family 版本。

### 6. Noto Mono 的确定性回退

- `cn-font-split` 的最终分片对 Noto Sans Mono CJK KR 不稳定（同一源、同一配置下两次构建会出现不同分片边界）。
- descriptor 声明 `output.subsetStrategy: "subset-font"`：按排序后的源码位确定性分块（256 码位/块），用 `subset-font@2.9.0` 生成分片；现有 20 族仍走原 `cn-font-split` 路径，字节不变。
- 主站内容子集只使用 source archive，不受该回退影响。

### 7. 覆盖门禁范围

- 新 `fonts:coverage` 只强制**本轮新增的韩语/Hangul**：`design.json` 含 `ko` 的 styled 设计，其字体栈必须包含 Hangul 能力核心变量，且 `Page.astro` 注册对应 `<Font>`；`html-only` 豁免。
- CJK 核心存在性继续由既有 `fonts:typography` 契约处理；不因新增韩语门禁强制 system-font 设计加载 CJK webfont。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| Noto Sans/Serif KR | 带 Hanja；全站语料子集 256/390 KB；Gothic A1/Gowun Batang 无 RFN、0 Hanja、约 34/43 KB。 |
| Black Han Sans | 只覆盖 2,581/11,172 音节，缺字会静默 tofu；重设计先用 Gothic A1 合成粗体。 |
| D2Coding / Pretendard | 字体仓库 `renameSfntFont` 对真实 TTF 失败（只有 NeoDunggeunmo 成功）；修复是独立工具链任务。 |
| 新增 `core-script` role | 韩语走同一分发/子集路径；没有操作差异的新分类只会增加分支。 |
| 按字体栈自然回退 | LXGW 自带谚文且 7 套设计在用；韩语族放其后永远不生效；带 Hanja 的韩语族放前面会劫持汉字。 |
| 按 locale 切换整套字体栈 | CSS 分叉、维护成本高；Hangul-only `unicode-range` 已能隔离。 |
| 韩语族按 `fixed` 全量 WOFF2 | 失去内容子集，体积不可控。 |
| 多 face / 可变字体 | 主站 core 子集只支持单 face；先 Regular + 合成粗体。 |

## 后果

- 5 套现有 ko 页面当前使用 Gothic A1（frost/fast/govuk）与 Gowun Batang（editorial）；其余 4 族在内容任务启用。
- 6 族 Hangul-only 子集合计约 178 KB；四语 `dist` 预计约 5.35 MB（10 MiB 门禁内）。当前任务只部署被 5 套 ko 使用的 2 族。
- 6 个 source archive 合计约 41 MB，增加 `fonts:prepare` 构建期下载；访客 `dist` 不受影响。
- 韩文标题依赖合成粗体；未来修复 `renameSfntFont` 后可评估 Pretendard / D2Coding 替换 Gothic A1 / Noto Mono。
- 内容子任务（22 套韩语文案/页面）只需加 `design.json.locales`、`messages.ts`、`descriptions.ts` 与 `<Font>`，无需再改字体仓库或字体管线。

## 回滚

- 主站 `fonts.lock.json` 回退 catalog v1.0.0；移除 6 个 family 配置、设计字体栈与 `<Font>` 注册。
- 字体仓库 catalog v1.0.0 保持可用；v1.1.0 已发布后不删除/覆盖，若需修复则提升 family 版本并发新 catalog。
- 删除 `.cache/fonts/1.1.0`、`.cache/font-sources/1.1.0` 后重新 `fonts:prepare`。
- 不得通过提高 10 MiB 门禁、删除审计或关闭 typography/coverage 检查来让构建通过。

## 验证

- 字体仓库：`npm test` 61/61；`catalog:validate` 26 族（9 core / 17 fixed）；`release:verify --compare-dir` `reproducible: true`；现有 20 族 package/source 零漂移。
- 主站：`npm test` 74/74；`npm run check` 0 errors；真实 catalog v1.1.0 与新族 manifest 可被主站 schema 解析。
- 样张：6 族目检通过（截图与结论见字体发行任务的 `research/korean-font-specimen.md`）。
- 待完成：catalog 发布后的 `fonts:update` / `fonts:prepare`、Hangul-only 子集实测、`fonts:audit`、5 套 ko 页面 `design-page-verify`、四语 `dist` 体积记录。
