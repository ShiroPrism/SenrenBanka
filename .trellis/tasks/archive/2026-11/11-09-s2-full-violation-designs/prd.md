# S2 修复全违规设计（8 套）

## Goal

把 8 套主分区全部被主题词替换的设计改为：h2 使用共享 canonical 标准标签，主题词移到 h2 之外作为可选 kicker；补 `data-section`；从 allowlist 删除这 8 套。保持各设计原有视觉语言与语域。

## Scope

设计：aero、deco、fairy-kei、ink、little-forest、sticker-diary、transit、zine。

依赖：S1 的 `src/i18n/sections.ts`、检查脚本与 allowlist。开始前确认 S1 已归档或至少已冻结词表。

## 逐套映射

| 设计 | links | projects | experience | skills | contact | 简介 / 备注 |
|---|---|---|---|---|---|---|
| aero | 桌面 → 链接 | 窗口 → 项目 | 系统时间线 → 经历 | 功能 → 技能 | 发送消息 → 联系 | 关于本设备（未使用）按需保留为 kicker |
| deco | 剧目表 → 链接 | 幕次 → 项目 | 演出单 → 经历 | 演职员表 → 技能 | 售票处 → 联系 | 序言保留为 profile kicker |
| fairy-kei | 挂着的小玩意 → 链接 | 玩具抽屉 → 项目 | 丝带卷轴 → 经历 | 贴纸册 → 技能 | 留给你的便签 → 联系 | 盒底说明卡保留为 profile kicker |
| ink | 印谱 → 链接 | 卷帙 → 项目 | 年表 → 经历 | 笔触 → 技能 | 落款 → 联系 | 小引保留为 profile kicker |
| little-forest | 路口木牌 → 链接 | 沿途地点 → 项目 | 树轮 → 经历 | 野花标本 → 技能 | 林中小屋 → 联系 | 林间留白保留为 profile kicker |
| sticker-diary | 喜欢的地方 → 链接 | 做过的事 → 项目 | 走过的地方 → 经历 | 会一点的事 → 技能 | 最后一页 → 联系 | 写在扉页保留为 kicker；修正 h2/kicker 倒置 |
| transit | 线路 / 换乘 → 链接 | 站点 → 项目 | 时刻表 → 经历 | 线路徽章 → 技能 | 售票处 → 联系 | hero bio |
| zine | 分类广告 → 链接 | 跨页 → 项目 | 贡献者注记 → 经历 | 印章 → 技能 | 邮购回执 → 联系 | 宣言保留为 profile kicker |

## Requirements

### R1 — h2 标准标签

- 每个已渲染主分区的 h2 使用 `sectionLabels[locale].<key>.label`。
- 双语设计可输出 `enLabel + label`；`en` Locale 下不得重复。
- h2 内不得出现主题词。

### R2 — 主题词位置

- 原主题词移到 h2 之外：优先保留为 kicker（前置小字）或 subtitle（后置小字）；纯装饰时 `aria-hidden="true"`。
- 主题词必须可选：移除后标题仍成立。
- sticker-diary 修正倒置：原 kicker「关于我 / 技能贴纸」等标准词移入 h2；原主题词 h2 降为 kicker。

### R3 — 结构与可访问性

- 每个主分区加 `data-section`。
- `aria-labelledby` 指向 h2；若使用 `aria-label`，内容使用标准标签，不得只含主题词。
- 保持 DOM 顺序与视觉层级一致。

### R4 — 视觉配平

- 标签变短可能改变换行、留白、标题区节奏；按设计微调 CSS。
- 不改变配色、字体、组件结构或动效语言。
- 375px 无横向溢出；桌面内容区保持左右留白。

### R5 — 清理

- 删除 `messages.ts` 中仅用于标准标签的键；主题词键保留。
- 从 `scripts/section-labels.allowlist.json` 删除这 8 套（19 → 11）。

## Acceptance Criteria

- [ ] 8 套在 5 个 Locale 下 `verify:sections` 全部通过。
- [ ] 每个已渲染非 profile 主分区 h2 只含标准词元；无主题词-only h2。
- [ ] 主题词仍可读，但不在 h2 内；移除 kicker 后标题成立。
- [ ] 每套 `data-section` 完整；`aria-labelledby` / `aria-label` 有效。
- [ ] allowlist 精确减少 8 条，剩余 11 条。
- [ ] `npm run build` 通过；`npm run verify:html-only` 通过。
- [ ] 每套执行 `design-page-verify` 并记录证据。
- [ ] 不改变视觉语言；无横向溢出；无新增客户端 JS。

## Out of Scope

- 不修改共享词表 / alias 白名单 / 检查脚本。
- 不修复 S3 的 9 套部分违规与 oxide / editorial。
- 不退役设计；不改 profile schema。

## Verification

```bash
npm run check
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

每套：桌面 + 375px + 减动态 + 无 JS（如适用）+ 截图归档；写入 `docs/verification/section-labels.md`。
