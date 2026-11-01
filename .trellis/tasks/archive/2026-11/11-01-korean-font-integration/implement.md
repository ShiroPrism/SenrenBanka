# 主站韩语字体接入与排版覆盖门禁 · 执行计划

> 前置：C1 已发布 catalog v1.1.0，`research/handoff.md` 含 URL/SHA/资产。主站工作目录 `F:\SenrenBanka`。

## 0. 前置检查

- [ ] 读 C1 `research/handoff.md`；确认 catalog URL 与 SHA。
- [ ] `git status` 记录当前工作树；本任务只改主站。
- [ ] 基线构建：`npm run build` 通过；记录 `dist` 字节、字体文件数、页面数。
- [ ] 读 `docs/rules/operations.md`、`data-and-i18n.md`、`design-contract.md`、`visual-language.md`、`docs/fonts/selection-guide.md`。
- [ ] 确认 `yaml` / `fontkitten` / `subset-font` 依赖可用；不新增无必要依赖。

## 1. Catalog 锁

- [ ] **兼容前置**：主站 `scripts/fonts/lib/schema.mjs` 的 `catalogFamilySchema` / `familyManifestSchema` 增加可选 `scripts: z.array(z.enum(['cjk','hangul'])).min(1).optional()`；补测试；用主站 schema 解析本地 catalog v1.1.0 与新族 manifest，确认不再报 `Unrecognized key: "scripts"`。
- [ ] `fonts.config.json` 增加 6 个 family（id/name/cssVariable/fallbacks）。
- [ ] 运行：
  ```bash
  npm run fonts:update -- \
    --catalog-url https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.1.0/catalog.json \
    --catalog-sha256 <C1 handoff SHA>
  ```
- [ ] 检查 `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`：
  - 26 families；
  - 6 个韩语族有 `scripts: ["hangul"]`；
  - 每族 1 个主 face。
- [ ] `npm run fonts:prepare`；`npm run fonts:check`。
- [ ] 若 catalog 校验器丢弃 `scripts`，修 `scripts/fonts/lib/repository.mjs` / catalog schema，再加测试。

## 2. `fonts:subset`（Hangul-only）

文件：`scripts/fonts/subset.mjs`（+ 可选 `scripts/fonts/lib/script-ranges.mjs`）

- [ ] 新增 `HANGUL_RANGES` / `isHangulCodePoint`（6 个区块）。
- [ ] `coreFaces()` 读取 manifest `scripts`，缺省 `['cjk']`。
- [ ] 语料过滤：`scripts` 只含 `hangul` → 只保留 Hangul 码位。
- [ ] `syntheticRule()` 支持 `unicodeRange`；韩语族传入 Hangul 序列。
- [ ] CJK 族保持「全语料 + 无 unicode-range」。
- [ ] `subset-report.json` 增加 scripts / unicodeRange / 语料类型 / 码位分解。
- [ ] 处理未使用韩语族：确保 `fonts:prune` 删除未引用子集，`fonts:audit` 不报孤儿。
- [ ] 单测：Hangul 范围、规则带/不带 unicode-range、语料过滤。

## 3. `fonts:audit`

文件：`scripts/fonts/audit.mjs`

- [ ] 复用 `HANGUL_RANGES`；`isCoreScriptCodePoint` = CJK + Hangul（或分别判断）。
- [ ] 覆盖检查：页面 Hangul 字符必须由部署规则/子集覆盖；源字体缺字 → 警告。
- [ ] 报告增加 `hangulCharacters` / `uncoveredHangul`；错误文案改 `CJK/Hangul` 或 `core script`。
- [ ] 0 悬空、0 孤儿、0 部署缺字。

## 4. `fonts:typography`

文件：`scripts/fonts/typography.mjs`

- [ ] `CORE_FONT_VARIABLES` 加 6 个韩语变量。
- [ ] `SYSTEM_CJK_FONTS` 加 `apple sd gothic neo`、`malgun gothic`、`noto sans kr`、`noto serif kr`、`nanum gothic`、`nanum myeongjo`。
- [ ] `generated.count !== 20` → `26`；`styledCount !== 26` 保持。
- [ ] 文案 `core CJK` → `core script`。
- [ ] 抽出 CSS 栈解析到 `scripts/fonts/lib/typography-css.mjs`（与 coverage 共用）。
- [ ] 增加选项：对声明 ko 的设计，每条 `font-family` / `font` 必须含韩语核心变量，且位于系统字体之前；纯系统栈也要检查。
- [ ] 单测：纯系统栈漏加、KO 变量在系统 CJK 之后、显式 fallback、非 ko 不强制。

## 5. `fonts:coverage` 新门禁

文件：`scripts/fonts/coverage.mjs`（新增）

- [ ] 读 `site.config.yaml` 的 `fontProfile`（用项目已有 YAML loader；不 regex 解析）。
- [ ] 读 `design.json` 的 `locales` / `renderMode`。
- [ ] 读设计 CSS + Astro style blocks；复用 `typography-css` 解析。
- [ ] 读 `Page.astro` 的 `<Font cssVariable="...">`。
- [ ] 读 `fonts.catalog.json` 的 family `scripts` + `fonts.config.json` 的 cssVariable 映射。
- [ ] 判定：
  - `korean` → 每条栈需 Hangul 能力核心变量 + `<Font>` 注册；
  - `cjk` → 保持现有 CJK 核心要求；
  - `latin` / `vietnamese` → 无核心要求；
  - `html-only` → 排版豁免。
- [ ] 失败信息带 `[senrenbanka:fonts] coverage: ...`。
- [ ] 接入 `package.json` 的 `check` 或 `build` 前置链；不要只做 warning。
- [ ] 单测：缺 CSS 变量、缺 `<Font>`、html-only 豁免、非 ko 不强制、ko 通过。

## 6. 26 套设计字体栈

对每套 styled 设计，逐条 `font-family` / `font`：

- [ ] 加入对应韩语伴生变量。
- [ ] 顺序：拉丁/展示 → 韩语伴生 → CJK 核心 → 系统韩文 → 系统中文/日文 → 通用族。
- [ ] 纯系统栈（fast/govuk/homepage99 等）也加韩语变量。
- [ ] `Preview.astro` / preview CSS 同步。
- [ ] 映射表：

| 韩语族 | 设计 |
|---|---|
| `--font-gothic-a1` | brutal, fast, frost, govuk, homepage99, kern, material3, poster |
| `--font-gowun-batang` | archive, deco, editorial, ink, lexicon, little-forest |
| `--font-galmuri11` | pager, pixel-pet-rpg, radio, receipt |
| `--font-noto-sans-mono-cjk-kr` | fax, oxide, terminal |
| `--font-dongle` | cute-alism, fairy-kei, magical-girl |
| `--font-poor-story` | sticker-diary, tape |
| 无 | html-only |

建议拆层执行，避免一次改 26 套导致审查困难：

1. 字体管线脚本 + 门禁（第 2–5 节）；
2. 5 套现有 ko 设计（editorial/frost/fast/govuk）+ `<Font>`；
3. 其余 21 套 styled CSS 变量（只 CSS，不加 Font）；
4. 文档/ADR/verification。

## 7. 5 套现有 ko 的 `<Font>`

- [ ] `editorial/Page.astro`：`<Font cssVariable="--font-gowun-batang" />`
- [ ] `frost/Page.astro`：`<Font cssVariable="--font-gothic-a1" />`
- [ ] `fast/Page.astro`：`<Font cssVariable="--font-gothic-a1" />`
- [ ] `govuk/Page.astro`：`<Font cssVariable="--font-gothic-a1" />`
- [ ] `html-only`：不变。
- [ ] 其余 22 套不注册；内容子任务再加。
- [ ] 实测 `<Font>` 默认 `preload=false`（`node_modules/astro/components/Font.astro:14`）；共享 Page.astro 不会产生 preload。若升级 Astro 后默认变化，改为条件渲染或显式 `preload={false}`。

## 8. 测试与构建

```bash
npm test
npm run fonts:check
npm run check
npm run build
npm run verify:html-only
npm run fonts:audit
du -sb dist
```

- [ ] `npm run check` 含 `fonts:typography` + `fonts:coverage`。
- [ ] `fonts:subset` 生成 6 个韩语子集（或按使用裁剪）；2 个被 5 套 ko 使用。
- [ ] `fonts:prune` 无孤儿；`dist/_astro/fonts/` 无未使用韩语子集。
- [ ] `fonts:audit` 0 悬空 / 0 孤儿 / 0 部署缺字。
- [ ] `dist` ≤ 10 MiB；记录字节、字体数、核心子集、最大文件。
- [ ] 生成文件未手改；`git diff` 只含预期变更。

## 9. 视觉与设计验证

- [ ] 6 族样张目检（不可跳过，`docs/fonts/selection-guide.md` §3）：
  - 大标题 / 正文 / 小字号 / 数字 / 标点 / 缺字回退；
  - Galmuri11 在目标字号下的像素网格；
  - Noto Mono 在 terminal/oxide/fax 的实际观感；
  - 合成粗体的韩文标题。
- [ ] 5 套现有 ko 页面 `design-page-verify`：
  - 桌面 + 375px；
  - 菜单语言项、`aria-current`、切换目标；
  - 无 JS / 减动态；
  - 对比度；
  - 截图归档到 `docs/verification/assets/`。
- [ ] 5 套页面实测：
  - `document.fonts.check()` / computed font-family；
  - 韩文字符实际使用的字体；
  - 无系统回退（editorial 不再命中 LXGW 谚文）。
- [ ] 若某族视觉不合格：调整映射或回到 C1 换族；不在主站硬凑。

## 10. 文档

- [ ] `docs/adr/0017-korean-full-coverage-fonts.md`（替代 ADR 0016 的 Noto 计划）。
- [ ] `docs/rules/operations.md`：Hangul-only 子集、审计、体积。
- [ ] `docs/rules/data-and-i18n.md`：Locale typography coverage、fontProfile 消费。
- [ ] `docs/rules/design-contract.md`：ko 设计字体栈要求。
- [ ] `docs/rules/visual-language.md`：字体顺序/回退。
- [ ] `SPEC.md`：字体管线与验收。
- [ ] `docs/verification/shared.md` + 5 套设计验证页。
- [ ] `.agents/skills/design-page-verify/SKILL.md`：locale 加 ko，增加韩文字体检查。
- [ ] `CONTEXT.md`：如需要补「Korean companion face」；已有两个覆盖术语。

## 11. 内容子任务 handoff

- [ ] 产出清单：设计 → 韩语族 → CSS 变量 → 待加 `<Font>` → 待加 `ko` 的 `messages.ts` / `descriptions.ts`。
- [ ] 说明内容子任务只需：
  - `design.json.locales` 加 `ko`；
  - `messages.ts` 韩语块；
  - `descriptions.ts` 韩语描述；
  - `Page.astro` 加对应 `<Font>`；
  - 跑 `fonts:coverage` + `design-page-verify`。
- [ ] 不需再改字体仓库、catalog、subset/audit/typography 管线。

## 12. 回滚

- `fonts.lock.json` 回退 v1.0.0，`fonts:update` 重新生成。
- 移除 6 个 family 配置。
- 回退 26 套 CSS 与 5 套 Page.astro。
- 删除 `.cache/fonts/1.1.0`、`.cache/font-sources/1.1.0`。
- 回退脚本/门禁/文档改动。
- 不通过提高 10 MiB、删除 audit 或关闭 typography 来让构建通过。

## 13. 提交边界

只提交主站：

- `fonts.config.json` / `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts`
- `scripts/fonts/**` + tests + `package.json`
- `src/designs/**` 字体栈/Page.astro
- `docs/adr/0017-*.md`、`docs/rules/*`、`SPEC.md`、`docs/verification/*`、`.agents/skills/design-page-verify/SKILL.md`
- 任务产物 `.trellis/tasks/...`

不提交：`.cache/`、`dist/`、字体二进制、字体仓库源码。
