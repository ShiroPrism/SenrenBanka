# 入口语言协商与零窗口随机 — 验证记录

> **范围**：根入口 `/` 的 Locale 协商、语言偏好存储、共享菜单语言项写入、零窗口随机、设计页稳定契约。
> **决策**：`docs/adr/0024-entry-locale-negotiation-and-zero-window-random.md`；规则见 `docs/rules/data-and-i18n.md` / `action-menu.md`。
> **结论**：代码层、拆分后的构建步骤、产物 / SEO / html-only / sections 门禁与真实 Chromium 浏览器矩阵通过；`npm run check` 仅在既有 `.trellis/**` EOL 门禁停止。未执行项在文末单独列出。

## 环境

- 日期：2026-11-22
- Node `v24.18.1`，npm `11.16.0`
- 浏览器：Playwright `1.65.1` + 本机 Chrome（headless）
- Preview：`npm run preview -- --port 4321`（4321 被占用，Astro 自动使用 `http://localhost:4322/`）
- 当前配置：`mode: random`、`manualSwitch: true`、`cacheHours: 0`、`avoidImmediateRepeat: true`
- 工作区：未提交、未创建分支；浏览器原始结果保存于 `.cache/verification/entry-locale-random-browser.json`

## 构建与自动检查

`npm run build` 内部会调用 `npm run check`，而 `check:eol` 的既有失败会提前中止；因此按 build 顺序拆分执行：

| 步骤 | 结果 | 证据 |
|---|---|---|
| `npm run fonts:check` | 通过 | 31 families / 1582 variants / 1678 cached files / 14 source caches (45 files) |
| `npm run check:docs` | 通过 | 8/8；agent docs 4343/7000 chars |
| `npm run lint` | 通过 | ESLint 0 输出 |
| `npm run format:check` | 通过 | All matched files use Prettier code style |
| `npm run fonts:typography` | 通过 | 26 styled designs（26 with core script）/ 31 primary-only local families |
| `npm run fonts:coverage` | 通过 | 27 design(s) with enforced scripts |
| `npx astro check` | 通过 | 0 errors / 0 warnings / 1 条既有 `lexicon` hint |
| `npx astro build` | 通过 | **175 pages** |
| `npm run fonts:subset` | 通过 | 14 core subset files / 1,784,080 B；rewrote 135/175 pages |
| `npm run fonts:prune` | 通过 | keep 735 / remove 765 `@font-face`；49 font CSS bundles / 60,880 B；45/1629 shards / 2,695,664 font bytes；**dist 7,888,020 B** |
| `npm run verify:html-only` | 通过 | 1 design × 5 locale = 5 pages；测试 20/20 |
| `npm run verify:sections` | 通过 | 135 pages / 760 sections / 0 allowlist skipped |
| `npm run fonts:audit` | 通过 | 735 rules / 45 referenced files / 0 orphan；64 条既有 CJK 缺字警告 |
| `npm run test:locale` | 通过 | **14/14** |
| `npm test` | 通过 | **106/106** |
| `npm run check:eol` | **失败（既有）** | 10 个 `.trellis/**` 文件 index 为 LF、worktree 为 CRLF |

`scripts/locale-match.test.mjs` 的 **14** 项覆盖语言标签匹配、存储键命名空间、根入口协商 / 非法偏好清理、`navigator.language` 回退、固定 Locale 入口不读偏好，以及 `fixed` 模式是否尊重 / 忽略手选；其中生成脚本用例直接在 Node VM 中执行 `renderRouterScript()`。

### EOL 既有失败明细

`.trellis/tasks/archive/2026-11/11-09-s1-shared-section-contract/{prd.md,task.json}`、`11-09-s2-full-violation-designs/{prd.md,task.json}`、`11-09-s3-partial-structural-designs/{prd.md,task.json}`、`11-09-standard-section-labels/{prd.md,task.json}`、`.trellis/workspace/makeinu/{index.md,journal-1.md}`。这些文件不在本任务 diff 内，本轮未归一化或删除。

## 构建体积与字体

| 指标 | 实测 |
|---|---|
| 设计数 | 27（26 `styled` + 1 `html-only`） |
| 页面数 | 175 |
| `dist` 文件数 | 304 |
| `dist` 总字节 | 7,888,020 B（7.52 MiB） |
| 字体文件 | 45 |

`shared.md` 上一次（2026-11-04）记录的 `dist` 为 7,777,959 B。本任务 diff 未触及 `src/designs/**`；本轮未对差值做逐文件归因，7,888,020 B 作为当前实测基线记录。

## 产物与 SEO

| 页面 / 断言 | 实测 |
|---|---|
| `dist/index.html` | 12,937 B；1 个内联 `<script>`、0 个外部 `src`、0 个 `<link>` / CSS；恰好 1 次 `location.replace` |
| 根入口 robots | `noindex, follow` |
| 根入口脚本配置 | 含 `senrenbanka.design.v1:root`、`senrenbanka.locale.v1:root`；5 个 Locale path（`zh-cn,zh-tw,ja,en,ko`）与 `zh-hans/zh-hant/zh-hk/zh-mo` 等 match tags |
| 根入口 `<noscript>` | 2 段：`0;url=/zh-cn/editorial/` 的 meta refresh + 27 个设计链接；0 个 `hreflang` |
| `/zh-cn/index.html`、`/en/index.html` | `noindex, follow`；0 CSS；0 script；0 hreflang |
| `/zh-cn/editorial/index.html`（默认设计） | `index, follow`；self-canonical `/zh-cn/editorial/`；6 个 alternate（5 Locale + `x-default`）；3 个 CSS（fonts / ContextMenu / 设计）；1 个 ContextMenu script |
| `/zh-cn/fax/index.html`（非默认设计） | `noindex, follow`；self-canonical `/zh-cn/fax/`；0 alternate；3 个 CSS |
| `/ja/html-only/index.html` | `noindex, follow`；self-canonical `/ja/html-only/`；0 CSS；0 script；0 `style=` |
| `404.html` | `noindex, follow`；仅 ContextMenu CSS，无设计 CSS |
| `/zh-cn/designs/index.html` | `noindex, follow`；fonts / SwitcherPage / ContextMenu CSS，无设计 CSS |

## 浏览器实测

### 方法

- Playwright `browser.newContext({ locale })` 设置真实的 Chromium 语言上下文；实测 `navigator.languages` 与 `navigator.language` 均为目标语言（例如 `ja-JP`）。这不是修改站点代码或伪造返回值。
- 每个 JS-enabled 场景收集 `console` error 与 `pageerror`，全部为 0。
- 语言偏好键在各场景中独立清理；菜单场景先在 `/ja/fax/` 写入 `locale=ja` 与 `design=fax` 作为哨兵。
- 共享菜单由真实右键事件打开，点击语言触发项展开二级菜单，再对 English 链接执行真实 Playwright 点击；测试先注册 capture 阶段 `preventDefault`，因此只验证写入与菜单关闭，不导航离开 `/ja/fax/`。

### 浏览器语言矩阵（清空偏好）

| `navigator.languages` | 落点 | 结果 |
|---|---|---|
| `['en-US']` | `/en/transit/` | 通过 |
| `['ja-JP']` | `/ja/ink/` | 通过 |
| `['zh-TW']` | `/zh-tw/receipt/` | 通过 |
| `['zh-HK']` | `/zh-tw/zine/` | 通过 |
| `['zh-Hans-CN']` | `/zh-cn/deco/` | 通过 |
| `['fr-FR']` | `/zh-cn/little-forest/` | 通过（默认 Locale） |

设计 id 由随机抽取决定；表中记录的是本轮实测值。每次入口写入的设计存储均为 `{designId, expiresAt: 0}`。

### 偏好、菜单与稳定地址

| 用例 | 实测 |
|---|---|
| 偏好 `ja` + 浏览器 `en-US` | `/ja/tape/`；键保持 `ja` |
| 偏好 `xx` | 清除 `senrenbanka.locale.v1:root`；浏览器 `en-US` → `/en/fairy-kei/`；console 0 |
| 共享菜单点击 English | 键变为 `en`；URL 仍为 `/ja/fax/`；设计存储仍为 `{"designId":"fax","expiresAt":0}` |
| 菜单写入 `en` 后访问 `/` | `/en/tape/`；偏好胜出 |
| 直接访问 `/ja/fax/` 并刷新 | 仍为 `/ja/fax/`；`locale=ja`、`design=fax` 未被改写 |
| 连续两次访问 `/` | `/en/pixel-pet-rpg/` → `/en/fax/`；两次设计不同，第二次 `expiresAt: 0` |
| `html-only` 点击 `zh-CN` 语言链接 | 当次导航到 `/zh-cn/html-only/`；既有偏好仍为 `ja`；再访问 `/` → `/ja/poster/`（不持久化，符合已声明限制） |
| 入口 → `/ja/fax/` 网络 | 17 个唯一同源请求，**0 个第三方 host**；console 0 |

### 无 JavaScript

- 实际禁用 JavaScript 后访问 `/`：直接进入 `/zh-cn/editorial/`，`<html lang="zh-CN">`；没有运行时协商，符合“默认 Locale 默认设计”的降级契约。
- 为检查根页静态回退，测试拦截 `/` 响应并移除 meta refresh 后渲染：`<meta http-equiv="refresh" content="0;url=/zh-cn/editorial/">`，27 个设计链接，0 个 `hreflang`。meta refresh 本身已由上面的实际导航单独验证。
- 根入口除既有根路由内联脚本外无新增脚本；设计列表与语言链接均来自静态 HTML，不新增事件处理器。

## `--base /demo` smoke

```bash
MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo
```

- 构建 175 页。
- 根脚本 `base: "/demo/"`；设计键 `senrenbanka.design.v1:demo`；语言键 `senrenbanka.locale.v1:demo`。
- `<noscript>` 目标 `/demo/zh-cn/editorial/`。
- VM 执行根脚本（`navigator.languages=['ja-JP']`）得到 `/demo/ja/aero/`；无 `/demo/demo` 双前缀。
- 临时 `dist-demo` 已清理，未纳入提交。

## 截图与原始记录

- `.cache/verification/entry-locale-random-root-before-1440.png`：无 JS 根页回退（1440×900）。
- `.cache/verification/entry-locale-random-root-before-375.png`：无 JS 根页回退（375×812）。
- `.cache/verification/entry-locale-random-root-after-1440.png`：JS 根入口跳转后的目标设计（1440×900，设计由当次随机决定）。
- `.cache/verification/entry-locale-random-root-after-375.png`：同上（375×812）。
- `.cache/verification/entry-locale-random-browser.json`：17 个浏览器断言的原始结果，全部通过。

## 未执行 / 限制

- 未在真实操作系统语言切换、Firefox / Safari、iOS / Android 真机或 200% 缩放下重跑；浏览器矩阵使用 Playwright 的 Chromium locale 上下文。
- `fixed` 模式与 `manualSwitch: false` 的**真实浏览器**重建未执行；生成路由脚本的对应分支由 `scripts/locale-match.test.mjs` 的 VM 测试覆盖（含协商后默认设计与忽略手选）。
- 未做服务端 / CDN `Accept-Language`、`Vary` 或 Cookie 检测；这是 ADR 0024 明确排除的方案。
- 根入口与设计页 **0 第三方请求**、console 0 已在上表覆盖；未做真实搜索引擎抓取验证。
