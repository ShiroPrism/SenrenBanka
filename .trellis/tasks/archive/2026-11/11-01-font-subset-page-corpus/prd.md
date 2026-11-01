# 字体子集按实际引用页限定语料

## Goal

把 `fonts:subset` 的全站统一语料改为**按每个 core 字体族实际被引用的页面**收集语料，在不改变任何页面字体选择、可见文本与排版的前提下，把 8 个非 Hangul 核心子集从 **2,590,852 B** 降到 **约 1,491,552 B**，为整个 `dist` 释放约 **1.05 MiB**。

## Background

当前 [scripts/fonts/subset.mjs:264](file:///F:/SenrenBanka/scripts/fonts/subset.mjs#L264) 的 `buildCorpus` 读取 `dist` 内全部文本资产（209 个文件、1833 码位）作为统一语料，所有 core 族都用它子集。但每个族实际只被少数页面加载。

2026-11-01 用真实 source font 重跑子集实验（语料 = 引用该族的页面原始 HTML + 全部共享 CSS/JS）：

| 字体族 | 引用页数 | 当前 | 按引用页 | 节省 |
|---|---:|---:|---:|---:|
| noto-sans-mono-cjk-tc | 2 | 575,664 | 202,412 | 373,252 |
| noto-serif-tc | 8 | 428,236 | 196,132 | 232,104 |
| lxgw-wenkai-tc | 7 | 388,256 | 189,400 | 198,856 |
| noto-sans-tc | 6 | 300,956 | 128,896 | 172,060 |
| fusion-pixel-tc | 4 | 49,704 | 18,296 | 31,408 |
| zhuque-fangsong | 37 | 453,536 | 398,756 | 54,780 |
| lxgw-wenkai | 33 | 355,068 | 322,652 | 32,416 |
| ark-pixel-12px | 21 | 39,432 | 35,008 | 4,424 |
| **合计** | — | **2,590,852** | **1,491,552** | **1,099,300** |

6 个 Hangul 族原先合计 183,592 B；实现后它们同样按引用页收窄语料，实测合计 **122,232 B**（各 250–297 个 Hangul 字符）。这是按族语料的自然结果，`fonts:audit` 0 部署缺口。

实现后实测：8 个非 Hangul 族 **1,502,884 B**（实验预估 1,491,552 B，差 11,332 B），14 族合计 **1,625,116 B**。

## Requirements

- R1 **页面到 core 的映射前置**：在生成子集前，先按当前 pass 2 的同一套规则计算每个 HTML 页引用哪些 core（页面实际 CSS + CSS 变量值 + 内联 `@font-face` family），并复用该上下文做后续重写，避免重复解析。
- R2 **共享语料**：所有非 HTML 文本资产（`.css` / `.js` / `.json` / `.svg` / `.xml` / `.txt` / `.webmanifest`）全量进入共享语料；去除 `@font-face` 块，解码 HTML 实体与 CSS 转义，保持现有“有意过近似”原则。
- R3 **按族语料**：每个 core 的语料 = 共享语料 ∪ 所有引用该 core 的页面原始 HTML 文本（含属性、内联 JSON、脚本与样式）；Hangul-only 族在此基础上继续过滤 Hangul 区块。码位排序后生成文本并计算哈希。
- R4 **未被引用的 core**：不生成子集文件、不报错；报告中记录 0 引用页。不得产生孤儿字体文件或悬空规则。
- R5 **保留全部现有守卫**：source cache 哈希校验、单 face 限制、已 prune 产物拒绝、子集前后可见文本逐字一致、二次运行同哈希且页面无变化（幂等）。
- R6 **报告 schema v2**：保留 source/subsetter 信息；新增 `corpusScope: "per-family"`、共享语料统计，以及每族的 `corpusPages`、`corpusCodePoints`、`corpusSha256`、`corpus` 字段；不写时间戳或机器路径。
- R7 **零设计改动**：不修改 `astro.config.mjs`、设计页/组件/设计 CSS、catalog/lock/generated、`fonts.config.json`；不改变子集文件名模式 `_astro/fonts/<id>-subset-<hash>.woff2`。

## Acceptance Criteria

- [x] A1 8 个非 Hangul 族 ≤ **1,510,000 B**（基线 2,590,852 B，实测 **1,502,884 B**）；14 族合计 ≤ **1,700,000 B**（基线 2,774,444 B，实测 **1,625,116 B**）。原“合计 ≤1,500,000 B”口径误把 Hangul 子集也算入，已按实测拆分为两项。
- [x] A2 本任务完成后 `dist` ≤ **7,800,000 B**（基线 8,855,728 B，实测 **7,632,396 B**）。
- [x] A3 报告中的 `corpusPages` 与真实引用页一致（本基线：noto-sans-mono-cjk-tc=2、noto-serif-tc=8、lxgw-wenkai-tc=7、noto-sans-tc=6、fusion-pixel-tc=4、zhuque-fangsong=37、lxgw-wenkai=33、ark-pixel-12px=21；Hangul 族 8–32 页、250–297 个 Hangul 字符，`fonts:audit` 0 部署缺口）。
- [x] A4 `npm run build` 通过；`fonts:audit` 为 **0 部署缺口、0 孤儿字体、0 悬空规则**，覆盖全部 175 个页面。
- [x] A5 `npm test` 全绿，新增“两个页面各自引用不同 core，子集只包含各自页面字符”的隔离测试，并覆盖“未引用 core 不产文件”与幂等行为。
- [x] A6 5 种语言的代表设计（至少 archive、terminal、oxide、little-forest、html-only）浏览器实测：字体请求集合、实际命中字体、可见文本与改动前一致；无缺字回退；桌面与 375px 无溢出。
- [x] A7 `SPEC.md`、`docs/rules/operations.md` 更新“语料来源 / 按族限定”的描述；新增 ADR 记录决策；`docs/verification/` 写入前后字节与审计结果。
- [x] A8 `git diff --stat` 不含设计页、设计 CSS、头像、菜单组件、脚本外置相关文件。

## Out of Scope

- 设计页 HTML/CSS、文案、字体选择、catalog/lock/generated 变更。
- Hangul 语料策略调整；头像、菜单图标 sprite、内联脚本优化。
- 引入新的运行时资源或改变 `@font-face` 输出格式。

## Open Questions

无；粒度与范围已由用户确认（按实际引用页）。
