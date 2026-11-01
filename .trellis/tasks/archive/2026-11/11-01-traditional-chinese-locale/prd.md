# 繁体中文全设计覆盖

## Goal

新增第 5 语言 `zh-TW`（繁體中文，台湾国语用词），让全部 27 套设计在繁中下同时满足两个独立维度：

- **Design locale coverage**：页面可达 + 审校文案完整，未覆盖设计不生成页面。
- **Locale typography coverage**：繁中文字系统由已部署 webfont 接管，不得用系统字体静默顶替。

字体层由独立字体仓库先发布 TC 族与 catalog v1.2.0，再由主站接入；内容分四批铺开，首批完成即可发布。

## Requirements

### R1 语言与路由

- Locale：`code: zh-TW`、`path: zh-tw`、`label: 繁體中文`，用词标准为台湾国语；在 `site.config.yaml` 中排在 `zh-CN` 之后。
- `title` / `description`、HTML `lang`、hreflang、语言菜单、404、切换页全部从 locale 配置派生。
- 路由保持静态多路由：仅当 `design.json.locales` 包含 `zh-TW` 时生成 `/<design>/` 与 `/zh-tw/<design>/`；未覆盖设计在 TC 下 404。
- 语言切换保持当前设计；目标 locale 未覆盖该设计时落到目标 locale 默认设计 `editorial`。
- 随机设计池按 locale 覆盖过滤。

### R2 内容

- 新增 `src/data/profiles/zh-tw.yaml`，字段契约不变，不得虚构个人事实。
- `src/i18n/messages.ts` 新增繁中共享文案；27 套 `src/designs/<id>/messages.ts` 新增繁中文案；`src/designs/descriptions.ts` 新增 27 条繁中描述。
- 27 套 `design.json` 的 `locales` 追加 `zh-TW`；`editorial` 必须覆盖全部已配置 locale。
- `src/designs/archive/style.css` 的免合成斜体 `:lang()` 列表补 `zh-TW`。
- 生产流程：OpenCC `s2twp` 初转 → 逐设计按视觉语言改写 → 用户终审后才发布；不接受未审校机翻。
- 专名本地化（野獣先輩 → 野獸先輩），罗马字 `Tadokoro Koji` 保留；各设计的 Untranslatable 字符串按原说明保持原样。

### R3 字体

- 字体仓库新增 5 个阅读角色 TC 族（各族 v1.0.0，catalog v1.2.0）：Noto Sans TC、Noto Serif TC、LXGW WenKai TC、Ark Pixel TC、Noto Sans Mono CJK TC。
- 装饰角色（圆体/手写）先用最接近的阅读族替代并显式记录；仅当实测 `dist` 有 headroom 时再补 1–2 个装饰族。
- 字体族元数据：`scripts: ["cjk", "han-traditional"]`；`cjk` 必须保留以继续参与汉字覆盖审计。
- 主站新增 `fontProfile: traditional-chinese`，映射到 `han-traditional` 覆盖门禁。
- TC 字体仅在 `zh-TW` 页面注册；简体核心与韩文伴生不在 TC 页注册。
- 18 套有 CJK 核心的设计用 `html:lang(zh-TW)` 变量重映射；8 套系统 CJK 设计用 locale 作用域的字体栈插入。
- 韩文伴生槽位在 TC 页不得提升为新的字形角色；映射到该设计的主 TC 族或哨兵，保持原 Han 排版意图。
- `fonts:subset` 沿用全站 dist 语料，TC 族不按码位过滤。
- 体积：10 MiB 硬门禁不变，软目标 ≤8.5 MiB；超限先砍装饰族/同角色替代，不抬门禁。
- 发布顺序：family releases → catalog；公开 Release 不可变；push 前由用户逐族确认许可、样张与资产清单。

### R4 分批与发布

- 首批 6 套：`editorial`、`archive`、`pager`、`fast`、`terminal`、`html-only`，覆盖 5 个 TC 族、两种接入机制、默认设计与 html-only 豁免。
- 其余 21 套按 7/7/7 三批。
- 首批完成即可发布；未覆盖设计在 TC 下 404 并回落到 TC 默认设计；后续增量发布。

### R5 验证与文档

- 每批做设计级验证：字体加载、TC 字形、排版溢出、缺字。
- 收尾统一跑一次 TC 跨页矩阵：菜单、语言切换、无 JS、对比度、减动态、375px；同时补掉韩语遗留的矩阵缺口。
- 新 ADR 0018；更新 SPEC、README、`docs/rules/`、`CONTEXT.md`、`docs/verification/`、`change-log/`。
- 字体仓库更新 README、ADDING-A-FONT、RELEASING、LICENSING、schemas、tests。

### R6 硬约束

- 不引入运行时 JS 语言切换；不重开 ADR 0006。
- 不抬 10 MiB 体积门禁；不恢复全量分片部署。
- 不修改已发布的 catalog v1.1.0 或任何已发布 family 版本。
- 不把系统字体回退当作 TC 的排版覆盖。
- 不新增用户自定义资料字段或区块。
- 不把繁中做成简中的运行时文本转换。

## Acceptance Criteria

- [ ] `site.config.yaml` 含 `zh-TW`；27 套 `design.json` 全部声明 `zh-TW`；构建产出 27 个 `/zh-tw/<design>/` 页面。
- [ ] 全部 TC 页面加载映射后的 TC 字体；不存在设计已覆盖却回退简体字形的情况。
- [ ] `fonts:typography`、`fonts:coverage`、`fonts:audit`、`check`、`test` 全部通过。
- [ ] `dist` ≤ 10 MiB，目标 ≤ 8.5 MiB，并记录实际字节数。
- [ ] 繁中资料与 27 套设计文案经用户终审；无未审校机翻、无未翻译占位。
- [ ] 语言切换、404、随机池、hreflang 在覆盖与未覆盖设计上都符合既有契约。
- [ ] 字体仓库 catalog v1.2.0 发布：5 族、许可证据、SHA256、双构建复现、不可变资产。
- [ ] TC 跨页矩阵与设计级验证记录归档到 `docs/verification/`；韩语遗留矩阵缺口已补。
- [ ] ADR 0018 与所有文档更新完成。

## Child task map

| 顺序 | 子任务 | 依赖 |
|---|---|---|
| 1 | `11-01-traditional-chinese-font-research` | 无 |
| 2 | `11-01-traditional-chinese-fonts-release` | 1 |
| 3 | `11-01-traditional-chinese-font-integration` | 2 |
| 4 | `11-01-traditional-chinese-content-rollout` | 3（首批）；其余批次可与 5 并行 |
| 5 | `11-01-traditional-chinese-docs-verify` | 3 起可并行，4 完成后收尾 |

## Out of scope

- `zh-HK`、`zh-Hans` 或其他新语言。
- 为繁中重新设计现有简中/日语页面。
- 在没有实测 headroom 的情况下追加圆体/手写装饰族。
- 把系统 CJK 设计的简中页面也改成 webfont。
- 运行时语言切换、地理路由、自动语言检测。
- 修改既有 catalog v1.1.0 或已发布字体资产。
