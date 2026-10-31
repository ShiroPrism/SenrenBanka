# design.md — 拟物主题队列：技术设计与字体资产依据

> 父任务的「技术设计 + 上下文存档」。子任务在此之上按各自隐喻细化，不得违反本文件红线。
> 字体来源与许可的一手证据：`.local-fonts/online-font-candidates.json` 与 `online-font-candidates-review.md`；
> 工作台使用见 `.local-fonts/README.md`；会话过程记录见 `.workbuddy/memory/2026-10-16.md`、`2026-10-17.md`。

## 1 · 既有机制与契约（每套必须遵守）

- **设计即目录**：`src/designs/<id>/` 五件套；`src/designs/registry.ts` 目录即注册（只做发现 + 校验；禁止对本目录产生 CSS import 边——SPEC §3.2 实测过的聚合坑）；页面路由由 `astro.config.mjs` 的 `designRoutes` integration 注入（三语言）。
- **页面模板**：每套 `Page.astro` 是完整 `<html>` 文档（`<HeadMeta>` + `lang`）；字体用 `<Font cssVariable="--font-<x>" />` 按需引入（不 preload 亦可，receipt 先例）；样式层用 `@theme inline` 注册 `--font-<theme>: var(--font-<x>)`。
- **数据层**：`src/lib/site.ts`——`loadDesignView(id, pathname)`（当前语言视图）与 `loadDesignStrips(id, pathname)`（全语言资料条，receipt 三联先例）；页面不接触文件路径、不自行判断语言。
- **共享机制**：`Reveal.astro`（共享 IO 契约：门控 `html[data-reveal-ready]`；无 JS / 无 IO / reduced-motion / 跳转滚动四种降级均须可见）；`ContextMenu`（ADR 0007：悬浮球 + 面板）；`HeadMeta`。
- **验证管线**：`design-page-verify` skill + `.local-fonts/dev/design-probe.mjs`（CDP 直连、自动拉起调试 Chrome）+ 无头 Chrome 截图 + impeccable detect。
- **教训备忘**：① CSS 变量**先定义再引用**——receipt 复修教训：未定义 `var()` 使整条声明 IACVT（页面背景塌成白底），改背景/引入新变量后必须对构建产物做**像素级采样**；② 探针口径为**二维**「视口内隐藏」（opacity≠1 且同时在水平与垂直视口内）；③ 三联类多联布局要按「视口内」而非「全文档」判定。

## 2 · 字体资产清单（生产池：全部已注册 + 已入库 + 许可已核验）

入库位置 `src/assets/fonts/`（50 文件 ≈1.4MB；许可文本与字体同目录）；注册点 `astro.config.mjs` 的 `fonts`（18 款新字体全部 local provider + 既有 6 款 npm 不动）。

| 家族 | cssVariable | 文件数 | 体积 | 许可 | 形态 / 覆盖 | 来源渠道 |
|---|---|---|---|---|---|---|
| Cutive Mono | `--font-cutive-mono` | 2 | 39KB | OFL | 拉丁等宽 | @fontsource/cutive-mono |
| Courier Prime | `--font-courier-prime` | 8 | 137KB | OFL | 400/700 × 正/斜 | @fontsource/courier-prime |
| Sorts Mill Goudy | `--font-sorts-mill-goudy` | 4 | 69KB | OFL（RFN） | oldstyle 衬线 + 斜体 | @fontsource/sorts-mill-goudy |
| Share Tech Mono | `--font-share-tech-mono` | 1 | 13KB | OFL（RFN "Share"） | 工业等宽 | @fontsource/share-tech-mono |
| League Mono | `--font-league-mono` | 2 | 51KB | OFL | 技术等宽 400/700 | @fontsource/league-mono |
| Silkscreen | `--font-silkscreen` | 2 | 16KB | OFL | 像素 400/700 | @fontsource/silkscreen |
| Prociono | `--font-prociono` | 1 | 12KB | OFL（RFN） | 罗马衬线 | @fontsource/prociono |
| Handjet Variable | `--font-handjet` | 1 | 18KB | OFL | 可变像素（wght/ELGR/ELSH） | @fontsource-variable/handjet |
| League Gothic | `--font-league-gothic` | 1 | 18KB | OFL | 窄体（wdth 75–100） | @fontsource-variable/league-gothic |
| Blackout 2AM | `--font-blackout` | 1 | 9KB | OFL（RFN） | stencil 镂空 | League of Moveable Type |
| UglyTypist | `--font-uglytypist` | 1 | 27KB | OFL（内嵌声明） | 手写 | Font Library（CSS 资产通道） |
| Format 1452 | `--font-format-1452` | 1 | 13KB | OFL | DIN 式面板字 | Velvetyne（GitHub org） |
| DSEG7 Classic | `--font-dseg7` | 2 | 10KB | OFL（RFN "DSEG"） | 7 段数字 | keshikan/DSEG（npm dseg） |
| DSEG14 Classic | `--font-dseg14` | 2 | 11KB | OFL（RFN "DSEG"） | 14 段数字 | keshikan/DSEG（npm dseg） |
| TT2020 Base | `--font-tt2020` | 2 | 93KB | OFL | 磨损打字机 正/斜 | ctrlcctrlv/TT2020 |
| TT2020 Style D | `--font-tt2020-styled` | 1 | 304KB | OFL | 复写纸磨损（站内用字子集） | ctrlcctrlv/TT2020 |
| 朱雀仿宋 Zhuque | `--font-zhuque` | 1 | 246KB | OFL | 简中 GB2312 6763/6763 + 假名（子集） | TrionesType/zhuque v0.212 |
| 方舟像素 Ark Pixel | `--font-ark-pixel` | 1 | 39KB | OFL | 12px 网格中文像素（子集） | TakWolf/ark-pixel-font |

- **既有 6 款生产字体可复用**（Fraunces / JetBrains Mono / Roboto Flex / Geist / Geist Mono / Inter；npm provider）——如某套的数字/正文更合适可直接 `<Font>` 引入，但**不得改动其注册条目**。
- **再生成工具**（池内字体更新 / 扩字时）：`.local-fonts/tools/vendor-fonts.sh`（npm 包 → 入库 + 许可）；`.local-fonts/tools/make-web-subsets.py`（CJK / 磨损子集；实测参考：朱雀 8.6MB→246KB、方舟 541KB→39KB、StyleD 827KB→304KB）。**新设计若引入新的汉字用字，需重跑子集并复验覆盖**（子集缺字会静默回退系统字，需字形级证据兜底）。
- **RFN 义务**：DSEG / Share Tech Mono / Sorts Mill Goudy / Prociono / Blackout 带 Reserved Font Name——当前均为**原样分发**（可行）；任何由子集/修改产生的新文件须遵守改名要求。朱雀 / 方舟 / TT2020 无 RFN。
- **本地库 `F:\Fonts`（722 face）仅作发现与样张**（`.local-fonts/`）：多数许可为「商用线索/未声明」，**不得**直接复制进生产；如需启用，按 selection-guide 逐项核验。

## 3 · 七套设计 × 字体映射与缘由（决策记录）

> 预选来自 `online-font-candidates-review.md`（八方向榜单：实测 + 许可核验后的视觉筛选）。
> **每套在子任务规划时按隐喻复核、以真实样张（8794/8795）为准，允许调整组合。**

| id | 隐喻 | 预选字体 | 角色分工 |
|---|---|---|---|
| archive | 档案柜 / 索引卡 | Sorts Mill Goudy · Courier Prime · 朱雀仿宋 | 阅读衬线（卡面标题）/ 打字机（记录条目）/ 中文仿宋（编号与正文） |
| radio | 短波收音机 / 仪表 | Share Tech Mono · DSEG14 · Format_1452 | 工业丝印标签 / 14 段刻度数字 / DIN 面板字 |
| fax | 复古办公室 / 传真 | Courier Prime · TT2020 Style D | 正文 / 磨损打字机（该套的质感主角） |
| pager | 寻呼机 / 单色 LCD | Handjet · Silkscreen · Ark Pixel | 点阵可变（ELGR/ELSH）/ 像素小字 / 中文像素 |
| tape | 磁带 / 录音设备 | UglyTypist · League Mono | 手写贴标 / 曲目编号等宽 |
| poster | 海报 / 实验艺术 | League Gothic · Blackout 2AM · Prociono | 窄体报头（wdth 可变）/ stencil 镂空 / 罗马衬线反衬 |
| lexicon | 中日英混排 / 辞书 | 朱雀仿宋 · Sorts Mill Goudy | 中文骨架 / 拉丁声部 |

**关键缘由（不得随意换用）**
- **八方向的声部差异是刻意的**：receipt 用 7 段（日常收据读数），14 段留给 radio（仪表）；磨损打字机（TT2020 Style D）留给 fax——receipt 的 DESIGN.md 选型记录已明确「磨损感不属于小票机」。
- **中文只有两条开放路径**：朱雀仿宋（真仿宋，GB2312 全量已核）与方舟像素（12px 网格；Zpix 因官方无许可文件被排除的替代）。中文一律走**子集纪律**，绝不整包进 dist。
- **池内唯二可变字体**：Handjet（3 轴）与 League Gothic（wdth）——pager / poster 使用可变轴时需在样张与探针中验证实际显示。
- **禁止「看名字选字」**：隐喻 → 候选 → 样张目检 → 六项记录，是 selection-guide 的强制顺序；最容易翻车的两点是中文缺字与像素字的设计尺寸显示。

## 4 · 数据流 / 契约（子任务实现时直接复用）

1. `Page.astro` frontmatter：`const view = await loadDesignView('<id>', Astro.url.pathname)`（或 strips 变体）→ `HeadMeta {...view.head}` → `<Font cssVariable>` × N → 分区结构。
2. `messages.ts`：三语（zh-CN / ja / en）文案；品牌名不翻译；装饰符号不进无障碍树（伪元素或 `aria-hidden`）。
3. 动效：遵循 `Reveal` 契约 + `docs/adr/0001`/`0003`；节奏参数（步进/延迟）可参考 receipt 但非强制。
4. `descriptions.ts`：新增 `Record<DesignId, Record<'zh-CN'|'ja'|'en', string>>` 条目（receipt 条目为 R6 待办，勿混淆）。
5. 验证记录：`docs/verification/<id>.md`（更新式，结构参照 receipt.md：构建与产物 / 结构 a11y / 对比度 / 动效 / 触控移动 / 隔离）。

## 5 · 风险 / 兼容 / 回滚

- **子集回归**：新增用字 → 重跑子集 → 字形指纹法（canvas 采样对比）复验真实渲染字体；回退链（Songti SC / SimSun 等）保持实测。
- **新布局 vs 共享机制**：创新布局可能暴露 Reveal / 菜单的边界情形——探针四口径 + 移动端集成必须全过。
- **体积纪律**：每套只加载实际使用的字体面；CJK 子集为站内用字；单文件现状上限参照 ≈350KB woff2（TT2020 StyleD）。
- **回滚**：每套独立——撤销 = 删 `src/designs/<id>/` + descriptions 条目（registry 自动不再注册）；字体池文件可留（合计 1.4MB）。
- **构建**：全链路本机可复现（`npm run build` 零网络；素材与工具均在仓库或 `.local-fonts/`）。

## 6 · 复现入口

```bash
npm run build                                             # astro check + build
npm run preview                                           # http://localhost:4321
node .local-fonts/dev/design-probe.mjs http://localhost:4321/zh-cn/<id>/
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/<id>
node .local-fonts/tools/specimen-server.mjs --port 8794   # 本地库样张（F:\Fonts）
node .local-fonts/tools/specimen-server.mjs --port 8795 --catalog .local-fonts/online-font-catalog.json
```
