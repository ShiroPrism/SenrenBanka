# 22 套设计韩语文案与页面

> 父任务：`11-01-korean-full-coverage`。前置：`11-01-korean-fonts-release`（catalog v1.1.0）与 `11-01-korean-font-integration`（主站字体接入、Hangul-only 子集、覆盖门禁、26 套设计字体栈）。

## Goal

为剩余 22 套 `styled` 设计增加 `ko` locale、韩语文案、切换页描述与韩语 `<Font>` 注册，使 27 套设计同时满足：

- `Design locale coverage`：`/ko/<design>/` 页面 + 审校文案 + `/ko/designs/` 列表。
- `Locale typography coverage`：`fonts:coverage` 对全部 27 套 ko 设计通过；`html-only` 字体维度豁免。

本任务不再改字体仓库、字体管线、字体 CSS 栈或现有 5 套 ko 页的字体映射。

## 22 套设计

`archive`、`brutal`、`cute-alism`、`deco`、`fairy-kei`、`fax`、`homepage99`、`ink`、`kern`、`lexicon`、`little-forest`、`magical-girl`、`material3`、`oxide`、`pager`、`pixel-pet-rpg`、`poster`、`radio`、`receipt`、`sticker-diary`、`tape`、`terminal`。

现有 5 套 ko（`editorial` / `fast` / `frost` / `govuk` / `html-only`）只做回归，不重写文案。

## 字体映射（已接入，本任务只补 `<Font>`）

| 韩语族 | 设计 |
|---|---|
| `--font-gothic-a1` | brutal, fast, frost, govuk, homepage99, kern, material3, poster |
| `--font-gowun-batang` | archive, deco, editorial, ink, lexicon, little-forest |
| `--font-galmuri11` | pager, pixel-pet-rpg, radio, receipt |
| `--font-noto-sans-mono-cjk-kr` | fax, oxide, terminal |
| `--font-dongle` | cute-alism, fairy-kei, magical-girl |
| `--font-poor-story` | sticker-diary, tape |
| 无 | html-only |

## Requirements

### R1 覆盖与文案

- 22 套 `design.json.locales` 增加 `ko`（保留 `zh-CN` / `ja` / `en`）。
- 22 套 `messages.ts` 为现有每个 key 增加 `ko` 文案；按该设计的语域与既有中文/日文/英文翻译，不新增解释性文案。
- 文件注释声明的不翻译项（命令、ASCII 装饰、品牌名、刻意的双语标识）保持原样。
- `descriptions.ts` 为 22 套设计增加 `ko` 切换页描述。
- 韩语文案由 AI 起草，**必须人工审校**；任务记录与验证文档明确标注“待审校”，不得把未审校机翻宣称为已审校。

### R2 字体接线

- 22 套 `Page.astro` 注册映射的韩语 `<Font cssVariable="..."/>`；缺少 `Font` import 的补 import。
- 不改设计 CSS 栈（C2 已完成）；不改字体配置/lock/snapshot/generated。
- `npm run fonts:coverage` 对 27 套 ko 设计通过；`html-only` 豁免。

### R3 构建与验证

- `npm run fonts:coverage`、`npm test`、`npm run check`、`npm run build` 全通过。
- 预期页面数：124 + 22 = **146 页**；`/ko/designs/` 列出 27 套；`dist` ≤ 10 MiB。
- `fonts:audit` 0 部署缺口 / 0 孤儿；非 ko 页面不下载韩语子集。
- 22 套新 ko 页面浏览器冒烟：`lang=ko`、声明的韩语字体实际加载、0 console、375px 无横向溢出；抽查截图归档。
- 更新 `docs/verification/shared.md` 与相关设计验证记录；标注完整视觉矩阵范围。

### R4 文档与提交

- README/SPEC/rules 如已有字体说明则引用 ADR 0017；不重复维护。
- 文案审校待办写入任务 Notes/verification；提交主站变更（不 push 字体仓库）。

## Acceptance Criteria

- [x] 22 套 `design.json` 含 `ko`；22 套 `messages.ts` 每个 key 有 `ko`；`descriptions.ts` 22 条 `ko`。
- [x] 27 个 `/ko/<design>/` 页面生成；`/ko/designs/` 列出 27 套；5 套现有 ko 页面无回归。
- [x] 22 套 `Page.astro` 注册映射的韩语 `<Font>`；`fonts:coverage` 27 设计通过。
- [x] `npm run build` 146 页、dist ≤ 10 MiB、`fonts:audit` 0 部署缺口、`npm test` / `npm run check` 通过。
- [x] 22 套新 ko 页面冒烟矩阵通过；截图与证据入 `docs/verification/`。
- [x] 文案已人工审校（用户确认 2026-11-01）。

## Out of Scope

- 字体仓库/catalog/字体管线/字体 CSS 栈变更。
- 22 套设计之外的视觉改版、布局调整、动效改动。
- 完整人工翻译审校（本轮只起草并标注）。
- 完整逐页 1440/375/菜单/无 JS/对比度/动效全矩阵（做共享冒烟 + 抽样深验；全矩阵可另开验证任务）。

## Risks

- **语域**：22 套设计各有视觉语言，统一翻译腔会破坏设计；必须逐文件读注释与既有三语。
- **不翻译项**：命令/ASCII/品牌名误译会改变设计意图。
- **页面/体积**：+22 页与全部 6 个韩语子集启用，dist 增长；10 MiB 门禁。
- **字体注册**：`<Font>` 缺失或页面未注册会让 `fonts:coverage` 失败；非 ko 页面不得下载韩语子集。
- **文案审校**：AI 起草的韩语可能存在语气/术语问题，发布前需人工审校。

## Notes

- C2 已把 26 套设计字体栈准备好；本任务只补 `ko` 内容与 `<Font>`。
- 现有 5 套 ko 文案已由用户确认（2026-11-01）；本任务不改变其内容。
- 子任务拆分：3 个实现批次（8/7/7 套），`descriptions.ts` 由主会话合并，避免共享文件冲突。

## 实施记录（2026-11-01）

- 22 套设计全部完成：`design.json` 加 `ko`、`messages.ts` 加 `ko`、`Page.astro` 加映射的韩语 `<Font>`；`descriptions.ts` 27 条 ko（22 新增 + 5 既有）。
- `fonts:coverage` **27 设计**；`npm run build` **146 页**；`dist` **6,056,936 B（5.78 MiB）**；字体 **40 文件 / 1,775,340 B**；核心子集 **9 族 / 863,756 B**（6 个韩语族各 **454** 字符）；`fonts:audit` 556 规则 / 0 孤儿 / **0 部署缺口** / 60 条源字体缺字警告；`npm test` 74/74；`npm run check` 0 error。
- 22 个新 ko 页在 **375×812** 与 **1280×800** 冒烟全部 200 / `lang=ko` / 韩语字体加载 / 无横向溢出 / 0 console；6 族抽样截图见 `docs/verification/assets/korean-c3-*.png`。
- 修正 `archive/style.css` 的 `:lang(zh-CN/ja) .ar-headline` 选择器，加入 `:lang(ko)`，避免韩文标题合成斜体。
- 韩语文案已人工审校（用户确认 2026-11-01）；terminal / oxide 的双语终端/技术标签是文件注释声明的刻意不翻译项。完整逐页菜单/无 JS/对比度/动效矩阵未重跑（本任务 Out of Scope）。
- 主站 commit：`fa44b73 feat: add Korean content for all designs`（本地，未 push；C2 为 `2447de2`）。
