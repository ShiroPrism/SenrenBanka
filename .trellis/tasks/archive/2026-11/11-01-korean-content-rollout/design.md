# 22 套设计韩语文案与页面 · 技术设计

## 1. 数据流

```text
site.config.yaml (ko locale, fontProfile: korean)  ← 已存在
  + design.json.locales 加 ko                      ← 本任务
  + messages.ts 加 ko block                        ← 本任务
  + descriptions.ts 加 ko 描述                     ← 本任务
  + Page.astro <Font cssVariable="--font-..."/>    ← 本任务
        │ astro build
        ▼
/ko/<design>/ 页面 + /ko/designs/ 列表
        │ fonts:coverage (build 前) / fonts:subset / fonts:prune / fonts:audit
        ▼
Hangul-only 子集（C2 已实现）+ 韩语字体实际命中
```

字体仓库、catalog、字体 CSS 栈、`fonts.config.json`/lock/snapshot/generated 均不改。

## 2. 文案翻译契约

每个设计读取：

- `src/designs/<id>/messages.ts`：文件头注释（设计语域、不翻译项）、`zh-CN` / `ja` / `en` 三语、key 注释。
- `src/designs/<id>/DESIGN.md` / 页面结构：该设计模拟的物件/媒介与语域。
- 现有 5 套 ko 的 `messages.ts`（editorial / fast / frost / govuk / html-only）作为项目韩语风格参考。

规则：

1. **只翻译现有文案**：不新增解释性、自我描述或补全性句子。
2. **保持设计语域**：命令/终端/小票/档案/杂志/像素等各自语气不同，不得统一成同一种翻译腔。
3. **不翻译项**：文件注释声明的品牌名、命令、ASCII 装饰、编号、刻意的双语标识保持原样；必要时在 `ko` 块中复用原文。
4. **占位/标记**：保留 `{name}`、`%s`、HTML/ASCII 标记、大小写与标点语义；不改变信息量。
5. **韩语自然度**：使用自然的韩语（존댓말/평서体按设计语域选择），避免机翻痕迹；专业名词保留项目既有译法。
6. **状态**：本轮 AI 起草，**待人工审校**；不得在文案或验证记录中宣称已审校。

## 3. 每套设计的接线

| 设计 | 韩语 `<Font>` | messages.ts | design.json | descriptions.ts |
|---|---|---|---|---|
| archive | `--font-gowun-batang` | 加 `ko` | 加 `ko` | 加 `ko` |
| brutal | `--font-gothic-a1` | 加 `ko` | 加 `ko` | 加 `ko` |
| cute-alism | `--font-dongle` | 加 `ko` | 加 `ko` | 加 `ko` |
| deco | `--font-gowun-batang` | 加 `ko` | 加 `ko` | 加 `ko` |
| fairy-kei | `--font-dongle` | 加 `ko` | 加 `ko` | 加 `ko` |
| fax | `--font-noto-sans-mono-cjk-kr` | 加 `ko` | 加 `ko` | 加 `ko` |
| homepage99 | `--font-gothic-a1` | 加 `ko` | 加 `ko` | 加 `ko` |
| ink | `--font-gowun-batang` | 加 `ko` | 加 `ko` | 加 `ko` |
| kern | `--font-gothic-a1` | 加 `ko` | 加 `ko` | 加 `ko` |
| lexicon | `--font-gowun-batang` | 加 `ko` | 加 `ko` | 加 `ko` |
| little-forest | `--font-gowun-batang` | 加 `ko` | 加 `ko` | 加 `ko` |
| magical-girl | `--font-dongle` | 加 `ko` | 加 `ko` | 加 `ko` |
| material3 | `--font-gothic-a1` | 加 `ko` | 加 `ko` | 加 `ko` |
| oxide | `--font-noto-sans-mono-cjk-kr` | 加 `ko` | 加 `ko` | 加 `ko` |
| pager | `--font-galmuri11` | 加 `ko` | 加 `ko` | 加 `ko` |
| pixel-pet-rpg | `--font-galmuri11` | 加 `ko` | 加 `ko` | 加 `ko` |
| poster | `--font-gothic-a1` | 加 `ko` | 加 `ko` | 加 `ko` |
| radio | `--font-galmuri11` | 加 `ko` | 加 `ko` | 加 `ko` |
| receipt | `--font-galmuri11` | 加 `ko` | 加 `ko` | 加 `ko` |
| sticker-diary | `--font-poor-story` | 加 `ko` | 加 `ko` | 加 `ko` |
| tape | `--font-poor-story` | 加 `ko` | 加 `ko` | 加 `ko` |
| terminal | `--font-noto-sans-mono-cjk-kr` | 加 `ko` | 加 `ko` | 加 `ko` |

`Page.astro`：

- 已有 `import { Font } from 'astro:assets'` 的设计直接加 `<Font cssVariable="--font-..." />`。
- 没有 import 的补 import；放在 `<head>` 的 `HeadMeta` 之后。
- `<Font>` 顺序不影响字体匹配；默认 `preload=false`，非 ko 页面不会下载韩语子集。
- 不改 `Page.astro` 的其他内容。

`design.json`：

```json
"locales": ["zh-CN", "ja", "en", "ko"]
```

保留原有顺序，只在末尾加 `ko`。

## 4. 实现分批

为避免共享文件冲突与单 agent 回合上限：

- **批次 A（8 套）**：archive, brutal, cute-alism, deco, fairy-kei, fax, homepage99, ink
- **批次 B（7 套）**：kern, lexicon, little-forest, magical-girl, material3, oxide, pager
- **批次 C（7 套）**：pixel-pet-rpg, poster, radio, receipt, sticker-diary, tape, terminal

每个批次只改自己的设计目录（`design.json` / `messages.ts` / `Page.astro`），不碰：

- `src/designs/descriptions.ts`（主会话合并 22 条 ko 描述）
- CSS/Preview（C2 已完成）
- `fonts.*` / `scripts/**` / `docs/**` / 共享组件
- 其他批次的设计

批次报告需包含：每个设计的韩语描述建议（用于 `descriptions.ts`）、未翻译项说明、任何无法确定语域的 key。

## 5. 验证

1. `npm run fonts:coverage`：27 套 ko 设计通过（CSS 栈 + `<Font>`）。
2. `npm test`、`npm run check`：0 error；`fonts:typography` 26 families / 26 styled。
3. `npm run build`：146 页；`fonts:subset` 语料增长；9 核心子集（6 个韩语族现在全部被使用）；`fonts:prune` ≤10 MiB；`verify:html-only` 4 页；`fonts:audit` 0 部署缺口。
4. 浏览器冒烟：22 个 `/ko/<design>/` 页面，1280×800 + 375×812：
   - `html lang=ko`；页面存在；
   - 声明的韩语字体实际加载（`document.fonts` / computed family）；
   - 0 console error；无横向溢出；
   - 非 ko 页面（抽查 `/ja/<design>/`）不加载韩语子集。
5. 抽样深验：每族至少 1 套设计做桌面/375 截图；关键设计（archive, brutal, pager, terminal, sticker-diary）可多看一次。
6. 更新 `docs/verification/shared.md` 与 22 套设计的验证记录（可先加统一批次记录，再逐设计补一行）。

## 6. 风险与回滚

- **韩语语域**：不同设计的文案语气必须不同；翻译后逐套目检（韩语可读/不突兀），必要时请项目所有者审校。
- **不翻译项**：文件注释中的命令/ASCII/品牌名不能译；误译会改变设计意图。
- **页面/字体增长**：22 页 + 6 个韩语族全量启用；预期 dist 约 6–7 MB，仍低于 10 MiB；若超限，先查页面重复 HTML/字体 CSS，不放宽门禁。
- **字体注册**：`<Font>` 缺失会让 `fonts:coverage` 失败；非 ko 页面不下载韩语子集由 prune + `preload=false` 保证。
- **回滚**：移除 22 套的 `ko`（design.json / messages / descriptions / `<Font>`）即可；字体层与 5 套现有 ko 页面不受影响。
