# 繁体中文字体调研

共享需求见父任务 `prd.md` / `design.md` / `implement.md`；本文件只写本子任务范围与验收。

## Goal

在字体仓库与主站语料上冻结 TC 字体方案：候选族、许可证据、真实 subset 体积、逐设计角色映射，产出可被字体发布任务直接消费的冻结清单。

## Scope

- 候选族：Noto Sans TC、Noto Serif TC、LXGW WenKai TC、Ark Pixel TC、Noto Sans Mono CJK TC；装饰族（Huninn、Iansui 等）只作为可选补充评估。
- 事实核查：上游仓库与版本、静态 regional OTF、OFL-1.1 / RFN、Ark Pixel 12px `zh_tr` 产物、LXGW TC 的 `permission-granted` 是否覆盖 TC。
- 体积：用真实 TC 语料（可临时用 OpenCC `s2twp` 转换现有语料）对每族跑 `subset-font`，记录 bytes/字与 4 / 5 / 6 / 7 族总预算。
- 映射：18 套 CJK 核心设计 + 8 套系统 CJK 设计 + `html-only` 豁免；遵循父 `design.md` §4 的角色规则（伴生槽位不得提升为新的字形角色）。
- 结论：冻结族集、族 id、上游 URL / version、许可文件 SHA、样张判断、逐设计映射表。

## Out of scope

- 不发布 Release、不改 catalog、不改主站代码。
- 不在本任务决定内容文案。

## Acceptance Criteria

- [ ] `research/` 文档含：许可证据表、候选族 cmap/覆盖证据、subset 实测表、逐设计映射表、冻结族集与体积预算。
- [ ] 4 / 5 / 7 族方案分别给出 `dist` 估算并与 8.5 MiB 软目标对照。
- [ ] LXGW TC 与 Ark Pixel TC 的不确定性有明确结论或替代方案。
- [ ] 用户确认冻结族集（GATE-1）。
- [ ] 字体仓库 `npm test` 通过。

## Dependencies

无。
