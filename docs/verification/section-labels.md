# 主分区标准标签验证记录

## 状态

- 2026-11-09：S1 / S2 / S3 全部完成。27 套设计的主分区 h2 全部使用共享标准标签；`scripts/section-labels.allowlist.json` 为空。
- 历史验证记录不回写；本文件记录本次契约与三个批次。

## 审计基线

27 套设计审计（2026-11-09，详见 `.trellis/tasks/11-09-standard-section-labels/research/audit-2026-11-09.md`）：

| 分类 | 数量 | 设计 |
|---|---|---|
| 语义合规 | 8 | brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal |
| 部分违规 | 9 | archive、fax、lexicon、pager、pixel-pet-rpg、poster、radio、receipt、tape |
| 全违规 | 8 | aero、deco、fairy-kei、ink、little-forest、sticker-diary、transit、zine |
| 结构待统一 | 2 | oxide、editorial |

未发现「购买渠道 / 非卖品 / 生产信息 / 净含量」等商品化文案。

## S1 交付

- `src/i18n/sections.json` / `src/i18n/sections.ts`：5 Locale × 6 SectionKey 的 canonical / enLabel / aliases。
- `scripts/check-section-labels.mjs` + 8 个单元测试：扫描 `dist` 的 `data-section` 与 h2；支持多词 alias、双语标准词、`sr-only` h2、profile hero 无 h2；主题词与混合标题失败。
- `package.json`：`verify:sections` 接入 `build`；`test` 加入检查脚本测试。
- `data-section` 契约：主分区元素标记；旧路径 meta refresh 重定向页跳过。
- 8 套合规设计迁移：h2 使用共享 `label`；`messages.ts` 删除仅用于标准标签的键；`Preview.astro` 同步使用共享词表。
- 规则 / 文档：`design-contract.md`「信息架构与主题文案」、`AGENTS.md` 第 9 条门禁、`operations.md`、`accessibility-responsive.md`、`data-and-i18n.md`、`design-page-verify`、ADR 0023、`CONTEXT.md` 三个术语。

## 构建门禁

```bash
npm run build
node scripts/check-section-labels.mjs
```

2026-11-09 实测：

```text
section-label check: 40 页, 210 个分区, 19 套 allowlist 设计跳过
section-label check: OK
```

- 40 页 = 8 套合规设计 × 5 Locale；210 个分区。
- `astro check`：0 errors（仅 lexicon 既有 hint，与本任务无关）。
- Astro build：175 页构建成功。

## 浏览器实测（S1 的 8 套）

环境：`npm run preview`（端口 4322，上一会话遗留服务），Playwright MCP；桌面 1038×900，移动 375×812。

| 设计 | Locale | data-section | h2 | 桌面溢出 | 375px 溢出 | console |
|---|---|---|---|---|---|---|
| brutal | zh-CN | profile / projects / experience / skills / contact | 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| cute-alism | zh-CN | profile / links / projects / experience / skills / contact | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| frost | zh-CN | profile / projects / experience / skills / contact | 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| homepage99 | zh-CN | links / projects / experience / skills / contact | 链接 / 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| html-only | zh-CN | links / projects / experience / skills / contact | 链接 / 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| kern | zh-CN | profile / projects / experience / skills / contact | 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| material3 | zh-CN | profile / projects / experience / skills / contact | 项目 / 经历 / 技能 / 联系 | 无 | 无 | 0 |
| terminal | zh-CN | profile / links / experience / projects / skills / contact | 链接 / 经历 / 项目 / 技能 / 联系 | 无 | 无 | 0 |

- profile hero 没有 h2 是预期：brutal / frost / kern / material3 / terminal 的简介由 h1 + bio 承担；homepage99 / html-only 没有独立 profile `data-section`。
- terminal 的 `sr-only` h2 与可见 `# 简介 / # 链接 / # 经历 / # 项目 / # 技能 / # 联系` 均存在；可见注释是标准标签，h2 也是标准标签。

### 标题层级与可访问名称

实测 8 套均满足 `h1 → h2 → h3`，无 h3 早于 h2；`[aria-label]` / `[aria-labelledby]` 计数 10–15；`data-section` 内空 h2 数为 0。homepage99 的「本页目录 / 别处 / 告示与徽章」是导航 / 侧栏标题，不属于主分区 h2，未参与标签检查。

### 完整门禁（2026-11-09）

- `npm run check`：通过（docs / eol / lint / format / fonts typography / fonts coverage / astro check）；仅 lexicon 既有 `entry` hint。
- `npm run test`：92 tests passed，含 8 个 `check-section-labels` 单元测试。
- `npm run build`：通过；`verify:html-only` 5 页；`verify:sections` 40 页 / 210 分区 / 19 套 allowlist 跳过；`fonts:audit` 仅既有 CJK 覆盖警告（pager / pixel-pet-rpg / radio / receipt 等），与本任务无关。

### Locale 冒烟

| URL | lang | h2 |
|---|---|---|
| `/en/terminal/` | en | Links / Experience / Projects / Skills / Contact；可见 `# Profile / # Links / # Experience / # Projects / # Skills / # Contact` |
| `/ja/brutal/` | ja | プロジェクト / 経歴 / スキル / 連絡先 |

### 截图

目录：`docs/verification/assets/section-labels/`

- 每套设计：`<id>-desktop.png`（fullPage，1038px）与 `<id>-375.png`（fullPage，375px）。
- 覆盖：brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal。

## S2（8 套全违规设计）

2026-11-09 完成：aero、deco、fairy-kei、ink、little-forest、sticker-diary、transit、zine。allowlist 19 → 11。

| 设计 | data-section | h2（zh-CN） | 桌面 / 375px 溢出 | console |
|---|---|---|---|---|
| aero | profile / links / projects / experience / skills / contact | 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| deco | 同上 | 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| fairy-kei | links / profile / projects / experience / skills / contact | 链接 / 简介 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| ink | profile / links / projects / experience / skills / contact | 链接 / 项目 / 经历 / 技能 / 联系（profile 无 h2） | 无 / 无 | 0 |
| little-forest | profile / links / projects / experience / skills / contact | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| sticker-diary | 同上 | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| transit | profile / links / projects / experience / skills / contact | 链接 / 项目 / 经历 / 技能 / 联系（profile 无 h2） | 无 / 无 | 0 |
| zine | profile / links / projects / experience / skills / contact | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |

- 主题词全部移到 h2 之外的 kicker（aero 桌面 / deco 剧目表 / fairy-kei 挂着的小玩意 / ink 印谱 / little-forest 路口木牌 / sticker-diary 喜欢的地方 / transit 线路·换乘 / zine 分类广告等）。
- sticker-diary 的 h2/kicker 倒置已修正：标准词进 h2，主题词降 kicker。
- ink 的 links 分区嵌在 profile 区段内（保留原 `.ink-hero` 布局）；`verify:sections` 按 `data-section` 边界切片校验，profile 区段无 h2，links 区段 h2 为「链接」。浏览器 `querySelector` 的 descendant 查询会误读为 profile 的 h2，已人工确认结构。
- deco 首张 fullPage 截图曾出现空白，原因是截图脚本一次性跳到底部导致 Reveal 未触发；改为分段滚动后 `data-reveal-in` 齐全、内容完整，不是布局缺陷。
- 截图：`docs/verification/assets/section-labels/<id>-desktop.png` 与 `<id>-375.png`，覆盖上述 8 套。

## S3（11 套部分 / 结构违规）

2026-11-09 完成：archive、editorial、fax、lexicon、oxide、pager、pixel-pet-rpg、poster、radio、receipt、tape。allowlist 11 → 0。

| 设计 | data-section | h2（zh-CN） | 桌面 / 375px 溢出 | console |
|---|---|---|---|---|
| archive | profile / links / projects / experience / skills / contact | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| editorial | projects / links | 项目 / 链接 | 无 / 无 | 0 |
| fax | 六分区 | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| lexicon | 六分区 | 同上 | 无 / 无 | 0 |
| oxide | profile / links / skills / projects / experience / contact | Links / 链接 · Skills / 技能 · Projects / 项目 · Experience / 经历 · Contact / 联系 | 无 / 无 | 0 |
| pager | 六分区 | 简介 / 链接 / 项目 / 经历 / 技能 / 联系 | 无 / 无 | 0 |
| pixel-pet-rpg | 六分区 | 同上 | 无 / 无 | 0 |
| poster | 六分区 | 同上 | 无 / 无 | 0 |
| radio | 六分区 | 同上 | 无 / 无 | 0 |
| receipt | 六分区（Ticket.astro 渲染） | 同上 | 无 / 无 | 0 |
| tape | 六分区 | 同上 | 无 / 无 | 0 |

- oxide：`<p class="ox-label">` 的五个分区标签改为 `<h2>`，英文主题词 IDENTITY / CHANNELS / CAPABILITIES / DEPLOYMENTS / OPERATIONS 降为 kicker；contact 在 `<footer data-section="contact">`；行标题由 h2 降为 h3，标题层级恢复 `h1 → h2 → h3`。
- oxide 的 profile hero 保留 `<p class="ox-label">`（不加 h2），避免 h2 先于 h1；hero 仍由 `aria-labelledby` 指向该 p，`data-section="profile"` 保留，`verify:sections` 对 profile 无 h2 跳过。
- editorial：`Selected Works` → `项目` + `Selected Works` kicker；`Elsewhere` → `链接` + `Elsewhere` kicker；TOC 锚点与 `worksLabel` / `elsewhereLabel` 保留。
- radio / tape：分区编号（01 / A1 等）原在 h2 内，`verify:sections` 判为非法文本；已移到 h2 外的 flex 头容器，h2 只剩标准标签。对应 CSS 用逐属性继承（`font-size` / `font-weight` / `line-height` / `letter-spacing`）而非 `font` 简写，避免触发韩语字体栈门禁。
- pixel-pet-rpg：`经历日志` → `经历` + `日志` kicker；`个人资料` 统一为 `简介` + kicker。
- poster：英文展示词改为共享 `enLabel`（PROFILE / LINKS / PROJECTS / EXPERIENCE / SKILLS / CONTACT），中文主题 kicker（备注 / 明细 / 订单 / 纪录 / 结账）删除；`messages.ts` 的 `*Mark` / `*Title` 键移除；`Preview.astro` 与 `DESIGN.md` 同步。
- radio：分区 kicker 从机面语域词（备注 / 频道 / 节目 / 日志 / 联络）改为共享 `enLabel`（PROFILE / LINKS / PROJECTS / EXPERIENCE / SKILLS / CONTACT）；`messages.ts` 的 `*Title` 键移除；en 下所有 kicker 与 h2 同名而全部省略，其他 Locale 保留英文 kicker；`DESIGN.md` 同步。
- 截图：`docs/verification/assets/section-labels/<id>-desktop.png` 与 `<id>-375.png`，覆盖上述 11 套。

### kicker 去重（2026-11-09）

规则：kicker 文本与当前 Locale 的 h2 标准标签同名（忽略大小写）时省略 kicker；只省略 kicker，不移除 h2。

- radio：en 下六个标准英文 kicker 与 h2 同名，全部省略；其他 Locale 保留。
- poster：en 下六个 `ps-sec-mark` 与 h2 同名，全部省略；`Preview.astro` 同步。
- archive：ja 下 experience 的 `ar-tab-kicker`「経歴」与 h2 同名，省略。
- lexicon：en 下 contact 的 `lx-word`「CONTACT」与 h2 同名，省略。
- pixel-pet-rpg：zh-CN / zh-TW 的 contact、ja 的 profile / contact、ko 的 profile，`pxt-panel-kicker` 与 h2 同名时省略。
- 字段标签（`ar-field` / `ps-pay-label` / `rd-meta-key` / `tp-mail-label`）与计数单位（cute-alism `LINKS`）不是 kicker，保留。
- 全量静态扫描 27 套 × 5 Locale：无标题 kicker 重复；剩余同名文本均为字段标签 / 计数单位。

## 最终门禁（2026-11-09）

- `npm run check`：通过（docs / eol / lint / format / fonts typography / fonts coverage / astro check）；仅 lexicon 既有 `entry` hint。
- `npm run test`：92 tests passed。
- `npm run build`：通过；`verify:html-only` 5 页；`verify:sections` **135 页 / 760 个分区 / 0 套 allowlist 跳过**；`fonts:audit` 仅既有 CJK 覆盖警告。
- 浏览器实测 27 套：桌面 1038px 与 375px 均无横向溢出；console 0；标题层级无跳级；每套有 `data-section` 与标准 h2。
- `scripts/section-labels.allowlist.json` 为 `{ "designs": [] }`。

## 后续清理（不阻塞本次验收）

- deco / ink / fairy-kei 等自产 `DESIGN.md` 仍用主题词描述分区标题；poster 已同步为标准词。若后续做文档同步，应把「分区标题」改为「kicker / 主题词」，不改变设计语言。
- pager 的 en / ja / ko 主题语域词（HISTORY / 案件 / 작업）随标准标签替换被删除；如需保留语域，可为对应分区补 kicker 键。
- archive 的 ja kicker `経歴` 与 h2 `経歴` 重复（aria-hidden），如需去重可加条件渲染。
