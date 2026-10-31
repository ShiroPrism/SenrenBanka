# 拟物主题实施队列：余下 7 套设计（archive → lexicon）

> **父任务（任务地图）**。本文件记录源需求集合、子任务映射与跨子任务验收标准。
> 技术设计、字体资产清单（18 款已入库）、七套字体映射与决策缘由见本目录 `design.md`；
> 执行协议与每套检查清单见 `implement.md`。各套的**实际实施**由子任务承担（开工时创建）。

## Goal

为 SenrenBanka 依次实施余下 7 套「拟物」主题设计页，补齐八方向设计集（receipt 已完成样板）：

`archive`（档案柜/索引卡）→ `radio`（短波收音机/工业仪表）→ `fax`（复古办公室/传真机）→ `pager`（寻呼机/单色 LCD）→ `tape`（磁带/录音设备）→ `poster`（海报/实验艺术）→ `lexicon`（中日英混排/辞书）

用户价值：站点获得一套以「设计隐喻优先、字体逐一核验、布局各自独立」为标准的特色主题体系；每套都可被用户逐个验收、独立上线或下线。

## 背景与已确认事实（会话上下文摘要，2026-10-16 ~ 10-17）

- **字体工作台（`.local-fonts/`，已被 gitignore 排除）**：`library/`（目录联接 → `F:\Fonts`，543 文件 / 722 face，仅作发现与样张）、`font-catalog.json`、`tools/`（扫描器 / 样张服务器 8794·8795 / CJK 子集化 / npm 入库脚本）、`online-candidates/`（23 族下载件与许可原文）、`online-font-candidates.json`、`font-candidates.md`、`online-font-candidates-review.md`（八方向候选榜单）、`dev/`（探针与截图）。
- **正式规则**：选型流程 `docs/fonts/selection-guide.md`；隔离决策 `docs/adr/0008`；`docs/rules/visual-language.md`「字体（Typography & Fonts）」节与 `docs/rules/design-contract.md`「每套设计必须满足」条款。
- **在线调研结论**：7 个必查来源逐项核实（Google Fonts / Velvetyne / League of Moveable Type / Font Library / Fontsource / Noto CJK / TT2020）；23 族 / 31 文件下载；许可逐项核验（OFL / Apache-2.0 / MIT）；RFN 义务清单与排除项（FPL Neu=GPL、NotCourierSans 未核验、Fontshare 类不收录）见榜单 §10。
- **字体生产管线（10-17 决策，已完成）**：18 款新字体以「npm 取件 → 入库 `src/assets/fonts/`（50 文件 ≈1.4MB，许可随附）→ `fontProviders.local()`」接入，构建期零网络、全平台可复现；缘由：npm provider 构建期依赖 cdn.jsdelivr 且在本机受限网络下并发取件不可靠（实测约 70% ECONNRESET），且 `cdn` 选项在配置管线中不生效。**既有 6 套设计的 npm provider 未动。**
- **receipt 样板（已完成，含三轮修订）**：五件套 + `Ticket.astro` 私有组件；三联（≥1024px 三语并排 + 窗口横向滚动）/ 单联（<1024px）；验证全绿（构建 45 页 / astro check 0·0·0 / 检测器 0 / 探针四口径 0 / 像素级背景与字形级字体证据）；记录 `docs/verification/receipt.md`。
- **验证管线（每套复用）**：`design-page-verify` skill + `.local-fonts/dev/design-probe.mjs`（CDP 探针，自动拉起调试 Chrome）+ 无头 Chrome 截图 + impeccable detect + `npm run check/build`。
- **已知缺口**：`src/designs/descriptions.ts` 尚无 receipt 条目（切换页说明暂回退 design.json）；用户明确 receipt 仍需调整（具体清单待用户给出）。

## Requirements

- **R1 队列实施**：7 套按既定顺序实施；每套一个独立子任务（开工时创建：`task.py create "<id>（<隐喻>）" --slug <id> --parent 10-17-skeuo-theme-queue`）；父任务自身不上 start。
- **R2 每套交付物**：`src/designs/<id>/` 五件套（design.json / DESIGN.md / Page.astro / style.css + messages.ts 三语）；`descriptions.ts` 增三语条目；`docs/verification/<id>.md`；桌面 / 移动 / 日文截图归档。
- **R3 字体纪律**：只从已入库字体池（见 design.md §2）选字；DESIGN.md 按 selection-guide 写六项选型记录；组合以该套隐喻复核后为准（允许单字成稿或调整组合）；缺字回退链必须实测；不得新增生产依赖（确需先回报用户）。
- **R4 设计独立**：以「设计隐喻 → 信息结构 → 布局机制 → 交互」独立设计；不得照搬 receipt 版式；可复用共享机制（Reveal / ContextMenu / HeadMeta / 数据层 loadDesignView·loadDesignStrips）。
- **R5 红线**：不改既有 6 套主题与 receipt；不动字体管线与 `.local-fonts` 工具契约；不批量复制字体；构建产物无本地库文件 / 本机路径 / 第三方域名；行为与无障碍满足 design-page-verify。
- **R6 receipt 待办（不在本任务范围）**：用户给出调整清单后按复杂度单开任务；`descriptions.ts` 的 receipt 条目届时一并补。

## 子任务地图（Task Map）

| # | id | 隐喻 | 预选字体（子任务规划时复核） | 备注 |
|---|---|---|---|---|
| 1 | `archive` | 档案柜 / 图书馆索引卡 | Sorts Mill Goudy + Courier Prime + 朱雀仿宋 | 建议先行（复刻 receipt 流水线） |
| 2 | `radio` | 短波收音机 / 工业仪表 | Share Tech Mono + DSEG14 + Format_1452 | |
| 3 | `fax` | 复古办公室 / 传真机 | Courier Prime + TT2020 Style D | |
| 4 | `pager` | 寻呼机 / 单色 LCD | Handjet + Silkscreen + Ark Pixel | |
| 5 | `tape` | 磁带 / 录音设备 | UglyTypist + League Mono | |
| 6 | `poster` | 海报 / 实验艺术 | League Gothic + Blackout 2AM + Prociono | |
| 7 | `lexicon` | 中日英混排 / 辞书 | 朱雀仿宋 + Sorts Mill Goudy | |

顺序即交付顺序（无硬技术依赖）；每套完成即交付用户验收；下一套的启动时点由用户决定。

## Acceptance Criteria

**每套（子任务级，全部满足才算完成）**
- [ ] A1 `npm run build` 绿（页面数 = 既有 + 3×语言），`astro check` 0 错误 / 0 警告 / 0 提示。
- [ ] A2 `impeccable detect --json src/designs/<id>` 0 条。
- [ ] A3 探针全绿：console 0；「视口内隐藏」四口径（加载 / 滚底 / 跳转兜底 / 横向平移——按该套实际布局适配）均 0；断点与移动端（含共享菜单集成）按该套定义实测。
- [ ] A4 桌面 / 移动 / 日文截图目检通过；字体取证（字形指纹或覆盖实测）与缺字回退实操。
- [ ] A5 `docs/verification/<id>.md` 更新式记录（口径与 receipt 记录同构）。
- [ ] A6 DESIGN.md 含六项字体选型记录；CSS 隔离抽查通过（本页仅链接自身 CSS，不混入他套选择器）。
- [ ] A7 用户验收通过（逐个验收；否决则回到该子任务修复）。

**父任务级（最终整合复查）**
- [ ] A8 7 套全部完成后：全站页面计数、dist 隔离复查（无库文件 / 无本机路径 / 无第三方域名）、docs 索引与交叉引用完整、change-log 与版本号决策执行。

## Out of Scope

- receipt 精修实施（R6，另行处理）。
- 既有 6 套主题的任何修改。
- 新增生产依赖；把候选字体批量复制进生产资源；改动 `.local-fonts` 工具契约。
- 继续扩充在线字体候选（如确需，按 selection-guide §2.5 单独立项）。

## Open Questions

- 无阻塞项。每套的布局 / 交互 / 字体组合细节在各子任务规划阶段收敛，不阻塞父任务。

## 执行状态（2026-10-17 更新）

- 7 套子任务全部实施完成并已归档（`archive / radio / fax / pager / tape / poster / lexicon`，各 3 语言页面）。
- 统一验证通过：`npm run build` 73 页 / `astro check` 0·0·0 / 7 套 impeccable 检测器 0 / CDP 探针（桌面 1440、移动 375、日文）console 0、外链 0、无横向溢出、视口内隐藏 0 / CSS 隔离与 dist 隔离通过 / 各套预期字体均实测加载。
- 验证记录：`docs/verification/<id>.md` ×7；截图：`.local-fonts/dev/preview/skeuo/`。
- **父任务保持 planning**：等待用户实机复核与逐套调整（调整按新任务处理）；全部确认后再归档父任务。
