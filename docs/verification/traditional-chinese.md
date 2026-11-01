# verification — 繁体中文（zh-TW）

> 本文件记录 `zh-TW` 第 5 语言的当前完整验证状态：27 套设计、5 个 TC 字体族、页面级字体路由与构建/浏览器证据。共享机制的跨设计结论同时写入 `docs/verification/shared.md`；决策见 `docs/adr/0018-traditional-chinese-typography.md`，字体调研见 `.trellis/tasks/11-01-traditional-chinese-font-research/research/tc-font-research.md`。
> 重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。

## 范围

- `site.config.yaml` 新增 `zh-TW`（`path: zh-tw`，`fontProfile: traditional-chinese`）；`profiles/zh-tw.yaml`、共享文案、27 套设计文案/描述、27 套 `design.json.locales`。
- 字体层：5 个 `core-cjk` TC 族（`noto-sans-tc` / `noto-serif-tc` / `lxgw-wenkai-tc` / `fusion-pixel-tc` / `noto-sans-mono-cjk-tc`），`scripts: ["cjk","han-traditional"]`；`fonts:coverage` 新增 TC 重映射门禁；`fonts:audit` 忽略 `var(...)`/哨兵值。
- 页面级路由：26 套 styled 设计在 `html:lang(zh-TW)` 内做变量重映射；TC `<Font>` 只在 zh-TW 页注册；8 套系统 CJK 设计把韩文伴生变量重映射到 TC 族。`html-only` 零字体契约豁免。

## 构建与测试

| 项目 | 结果 |
|---|---|
| `npm run check` | 通过（docs / typography / coverage / astro check；0 error / 0 warning / 1 既有 hint） |
| `npm test` | **79/79** 通过 |
| `npm run build` | **EXIT 0**；`astro build` 175 页；`fonts:subset` 14 个核心子集 / **2,756,908 B**；`fonts:prune` **677** 条 `@font-face` / **45** 个字体文件 / **3,668,492 B** |
| `fonts:audit` | **0 部署缺口** / **0 孤儿** / **64** 条内容级缺字警告（源字体本身缺字） |
| `dist` | **8,845,322 B（8.44 MiB）**，10 MiB 硬门禁与 8.5 MiB 软目标均满足 |
| TC 页面 | **27** 个 `/zh-tw/<design>/` + `/zh-tw/` 入口 + `/zh-tw/designs/` = 29 个；全部设计无缺失 |

TC 核心子集实测：

| 族 | subset 字节 | 字符数 |
|---|---|---|
| `noto-sans-tc` | 299,028 | 1,165 |
| `noto-serif-tc` | 426,384 | 1,165 |
| `lxgw-wenkai-tc` | 385,956 | 1,371 |
| `fusion-pixel-tc` | 49,408 | 1,825 |
| `noto-sans-mono-cjk-tc` | 570,100 | 1,824 |

## 静态产物检查

- `dist/zh-tw/editorial/index.html`：`<html lang="zh-TW">`、canonical 含 `/zh-tw/editorial/`、hreflang 5 种语言 + `x-default`（仅默认设计 `editorial`）、`robots: index, follow`。
- 非默认设计 `/zh-tw/fast/`：`robots: noindex, follow`、`<link rel=alternate hreflang>` 计数 **0**。
- 同一设计的 zh-CN / zh-TW 页面引用相同的 `ContextMenu` 与设计 CSS；只有逐页裁剪的 `fonts-*.css` 不同（字体子集按页面命中，预期）。
- TC 页面的字体 CSS 只含实际注册的 TC/Latin family；简体核心与韩文伴生不出现。
- `html-only` TC 页：0 stylesheet、0 script、0 woff2、5 个原生语言链接。

## 浏览器实测（Chromium，`http://localhost:4322`）

| 页面 | 结果 |
|---|---|
| `/zh-tw/editorial/` | 200；`--font-lxgw` = `LXGW WenKai TC-857bc1a99ec8431d`；`--font-gowun-batang` = `__senrenbanka_tc_skip__`；woff2 仅 Fraunces + LXGW TC；`.cm-lang` 10（5 locale × 2 形态）/ `aria-current` 2；无横向溢出 |
| `/zh-tw/archive/` | 200；`--font-zhuque` = `Noto Serif TC-7be7db09c10d4114`；woff2 仅 Latin 2 个 + Noto Serif TC；无 Zhuque/Gowun 下载 |
| `/zh-tw/fast/` | 200；`--font-gothic-a1` 解析为 `Noto Sans TC-...`；woff2 仅 Noto Sans TC |
| `/zh-tw/pager/` | 200；`--font-ark-pixel` 解析为 `Fusion Pixel 12px TC-...`；woff2 仅 2 个 Latin 像素族 + Fusion Pixel TC |
| `/zh-tw/terminal/` | 200；`--font-noto-sans-mono-cjk-kr` 解析为 `Noto Sans Mono CJK TC-...`；woff2 仅 JetBrains Mono + TC Mono |
| `/zh-tw/html-only/` | 200；0 CSS / 0 JS / 0 字体；5 个原生语言链接 |

- 移动端（375×812 + `hasTouch` + `isMobile`）：`(any-pointer: coarse) === true`；悬浮球 **52×52**；`tap()` 打开底部面板，面板底边 **= 812**，动作项 **48px**，5 个语言项平铺且当前项 `aria-current="page"`，关闭 ✕ 与取消条均存在，`html` overflow = hidden；无横向溢出。
  - **注意**：Playwright 的鼠标 `click()` 会按设计把输入模式切到 mouse 并隐藏悬浮球；触控验证必须用 `tap()`（与 2026-10-31 记录一致）。
- 降级（`/zh-tw/editorial/`，7 个 `[data-reveal]`）：`reduced-motion` / 无 JS / 删除 `IntersectionObserver` / IO 抛错四种情形均 `data-reveal-ready=false` 且隐藏元素 **0**。

## 已知缺口（内容级，不阻塞构建）

- `fonts:audit` 的 64 条警告主要来自既有 Ark Pixel 在 en/ja/zh-CN 页的缺口（例如 輩/劇/概/羅/護/術/優/築），以及 TC 页 `archive` / `fax` / `poster` 的日本标签 URL `野獣先輩` 中的 `獣`（Noto Serif TC 源字体缺该日文新字体字）。浏览器按契约回退系统字体；未新增部署缺口。
- Noto Sans/Serif TC 缺 31 个日文新字体汉字（単収営図変対巻戦戻払択拠掲歩歳気済獣経絵続縦蔵薬蝋観読釈録雑黒）；TC 文案不应使用这些字形，若出现则记录为内容级缺字。
- 装饰角色（圆体/手写）本批未发布 TC 族；相关设计使用最近阅读族替代，待实测 headroom 后再评估。

## 公开发布（已完成）

- catalog v1.2.0 已发布：`https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.2.0/catalog.json`；公开文件 SHA-256 与本地构建一致 **`430cb587dcb9cfa850fc25d16953e5092ac6c48c3865e4138722cd68b7039635`**；**31 族 / 1,582 variants**。
- 已发布 `bootstrap-v1.2.0`、5 个 TC family release、`catalog-v1.2.0`；发布脚本逐资产验证 SHA/大小，catalog 最后发布。
- 5 个 TC 包在两次独立构建中字节一致（3 个 Noto 族使用 `output.subsetStrategy: "subset-font"`，避免 `cn-font-split` 的 Windows 析构崩溃与非确定性分片）：
  - `noto-sans-tc` `950eeb991d3af61e64d556d4a31c65f95f3f53d26c907500d56fbfa0a79967ef`（5,025,778 B）
  - `noto-serif-tc` `8fac4aeeebfb3e778d3af80e3fa1f18295b0cffe9794edcbc1f046e88d818f11`（7,385,031 B）
  - `lxgw-wenkai-tc` `ed98f5acda7c342bccad8684f5f1cdcafb9989bf59b776f4015d0516b99a1d00`（8,540,734 B）
  - `fusion-pixel-tc` `291c7dd6f3fcb86c4a98cb8d246958968d6c869d754337ef1d2cd2386741d2ca`（1,708,824 B）
  - `noto-sans-mono-cjk-tc` `f5ddd60ec8aa4bd4476a718fc02a595ec0616db9f81055fdf41c4666735727ba`（13,245,126 B）
- 主站已切回公开 baseUrl：`fonts.config.json` / `fonts.lock.json` / `fonts.catalog.json` / `src/fonts/generated.ts` 均指向 catalog v1.2.0；`fonts:prepare` 复用缓存；`npm run build` **EXIT 0**、`npm test` **79/79**、`dist` **8,845,322 B**、`fonts:audit` **0 部署缺口**。
- 剩余：繁中文案用户终审；主站提交与部署。

## 未测 / 限制

- 27 套 TC 页未逐页重跑完整菜单 / 无 JS / 对比度 / 动效 / 375px 矩阵；本次覆盖 6 套代表设计 + 跨页共享机制。韩语遗留的完整矩阵缺口仍未补。
- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测。
- 繁中文案由 OpenCC `s2twp` 初转 + 逐设计改写，**仍需用户终审**；未经专业译者校对。
- 本次验证使用公开 catalog v1.2.0（`430cb587…`）与本地构建产物；主站 lock / `fonts.config.json` 已指向公开 URL。TC 文案仍需用户终审；主站尚未提交/部署。
