# 执行计划：主分区标准标签

## 执行顺序

```
S1 共享契约 + 8 套合规设计迁移
      │  allowlist = 19
      ▼
S2 8 套全违规设计
      │  allowlist = 11
      ▼
S3 11 套部分 / 结构违规
      │  allowlist = 0
      ▼
最终集成审查 + 全量验证
```

S2 与 S3 文件集不重叠；S2 完成后即可启动 S3。两者都以 S1 冻结的词表与检查脚本为准。

## S1 — 共享分区契约与合规设计迁移

### 清单

- [ ] 新增 `src/i18n/sections.ts`：6 个 `SectionKey` × 5 个 Locale；`label` / `enLabel` / `aliases`。
- [ ] 新增 `scripts/check-section-labels.mjs` 与 `scripts/check-section-labels.test.mjs`。
- [ ] 新增 `scripts/section-labels.allowlist.json`，初版 19 套待修设计。
- [ ] `package.json` 增加 `verify:sections`；接入 `build` 与 `test`。
- [ ] 8 套合规设计（brutal、cute-alism、frost、homepage99、html-only、kern、material3、terminal）：
  - [ ] `Page.astro` 导入共享词表，h2 使用共享 `label`。
  - [ ] 主分区加 `data-section`。
  - [ ] `messages.ts` 删除不再使用的标准标签键。
  - [ ] terminal 保留 `sr-only` h2 + 可见标准词模式。
- [ ] 规则 / 文档：`design-contract.md`、`AGENTS.md`（第 9 条门禁）、`operations.md`、`accessibility-responsive.md`、`data-and-i18n.md`、`design-page-verify`。
- [ ] ADR `docs/adr/0023-standard-section-labels.md`。
- [ ] `docs/verification/section-labels.md` 新建并记录 S1 证据。

### 验证

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
```

浏览器：8 套设计各抽 1 个 Locale 做桌面 + 375px 实测；terminal 重点验证 sr-only h2 与可见标准词。

### 审查门

- 词表 canonical / alias 逐项评审，确认 alias 不含主题词。
- 检查脚本单元测试必须覆盖通过 / 失败 / sr-only / profile 无 h2 / 条件缺失五类。
- `verify:sections` 在当前 allowlist 下必须通过；不得用宽泛正则或跳过整页来“通过”。

### 回滚

删除 `sections.ts` 导入、`data-section`、检查脚本与 build 接入；恢复 8 套 `messages.ts` 的标签键。allowlist 与 ADR 可保留为计划记录。

## S2 — 8 套全违规设计

### 清单

- [ ] aero：桌面 → 链接；窗口 → 项目；系统时间线 → 经历；功能 → 技能；发送消息 → 联系。
- [ ] deco：剧目表 → 链接；幕次 → 项目；演出单 → 经历；演职员表 → 技能；售票处 → 联系；序言按需保留为 profile kicker。
- [ ] fairy-kei：挂着的小玩意 → 链接；玩具抽屉 → 项目；丝带卷轴 → 经历；贴纸册 → 技能；留给你的便签 → 联系；盒底说明卡 → 简介 kicker。
- [ ] ink：印谱 → 链接；卷帙 → 项目；年表 → 经历；笔触 → 技能；落款 → 联系；小引 → 简介 kicker。
- [ ] little-forest：路口木牌 → 链接；沿途地点 → 项目；树轮 → 经历；野花标本 → 技能；林中小屋 → 联系；林间留白 → 简介 kicker。
- [ ] sticker-diary：喜欢的地方 → 链接；做过的事 → 项目；走过的地方 → 经历；会一点的事 → 技能；最后一页 → 联系；写在扉页 → 简介 kicker；修正 kicker / h2 倒置。
- [ ] transit：线路 / 换乘 → 链接；站点 → 项目；时刻表 → 经历；线路徽章 → 技能；售票处 → 联系。
- [ ] zine：分类广告 → 链接；跨页 → 项目；贡献者注记 → 经历；印章 → 技能；邮购回执 → 联系；宣言 → 简介 kicker。
- [ ] 每套：h2 使用共享 `label`；主题词移到 h2 之外，保留为可选 kicker；加 `data-section`；微调 CSS。
- [ ] 从 allowlist 删除这 8 套（19 → 11）。

### 验证

```bash
npm run check
npm run build
npm run verify:html-only
```

每套执行 `design-page-verify`；重点：标签变短后的换行 / 留白、kicker 与 h2 的视觉层级、`aria-labelledby`、375px、减动态、无 JS。

### 审查门

- 8 套的 h2 在 5 个 Locale 下全部通过检查。
- 主题词仍可读但不再承担 heading 语义。
- allowlist 精确减少 8 条；没有额外豁免。

### 回滚

按设计回滚单个目录；allowlist 恢复对应 id。S2 不修改共享词表，回滚不影响 S1。

## S3 — 11 套部分 / 结构违规

### 清单

- [ ] archive：备注 → 简介；编目 → 项目；主题词 → 技能；借阅 → 联系；索引 → 链接；履历保留。
- [ ] fax：备注 → 简介；订单 → 项目；纪录 → 经历；结账 → 联系；明细 → 链接；技能保留。
- [ ] lexicon：同 fax。
- [ ] pager：备注 → 简介；其余保留。
- [ ] pixel-pet-rpg：个人资料按 alias 保留或统一为简介；远方路标 → 项目；经历日志 → 经历 + kicker「日志」；工具 → 技能；随身物品 → 链接；联系保留。
- [ ] poster：备注 → 简介；订单 → 项目；纪录 → 经历；结账 → 联系；明细 → 链接；技能保留。
- [ ] radio：备注 → 简介；频道 → 链接；节目 → 项目；日志 → 经历；联络按 alias 保留；技能保留。
- [ ] receipt：备注 → 简介；订单 → 项目；纪录 → 经历；结账台 → 联系；明细 → 链接；技能保留。
- [ ] tape：备注 → 简介；曲目 → 链接；企划 → 项目；纪录 → 经历；结算 → 联系；技能保留。
- [ ] oxide：`<p class="ox-label">` 转 `<h2>`；IDENTITY / CHANNELS / CAPABILITIES / DEPLOYMENTS / OPERATIONS 降为 kicker；contact footer 加 `data-section`。
- [ ] editorial：links h2 `Elsewhere` → 标准 `Links` / `链接` + kicker；projects 的 `Selected Works` 按 alias 保留或统一为 canonical；补 `data-section`。
- [ ] 从 allowlist 删除这 11 套并清空清单。
- [ ] `docs/verification/section-labels.md` 记录最终全量证据。

### 验证

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
```

最终全量：27 套 × 5 Locale 构建；抽查 27 套的桌面与 375px；`verify:sections` 在空 allowlist 下通过；`design-page-verify` 记录归档。

### 审查门

- allowlist 为空；`verify:sections` 无跳过项。
- 全量构建页数与字体基线不变。
- 无新增 CSS / JS 到 `html-only`；无横向溢出。

### 回滚

按设计回滚；allowlist 恢复对应 id。最终交付前必须再次清空。

## 最终集成审查（父任务）

- [ ] 27 套设计的 h2 词元全部合规；主题词只出现在 h2 之外。
- [ ] `design-contract.md` / `AGENTS.md` / `CONTEXT.md` / ADR 0023 / `design-page-verify` / `operations.md` / verification 一致。
- [ ] `npm run build` 全绿，`verify:sections` 无 allowlist 跳过。
- [ ] dist 体积增量与页面数、字体基线已记录。
- [ ] 历史验证记录未被回写；新证据集中在 `docs/verification/section-labels.md`。

## 子代理派遣

- 每个子任务开始前先 `task.py start <child>`，派遣提示以 `Active task: <task path>` 开头。
- 实现 / 检查子代理不得 commit；每个子任务完成后由父任务统一审查。
- S2 / S3 文件集不重叠；若并行，禁止同时修改 `src/i18n/sections.ts`、检查脚本与公共规则文件。
- 子代理的结论必须回到父任务复核，尤其是“检查通过”和“视觉无回归”两类声明。

## 验证命令总表

```bash
npm run check
npm run test
npm run build
npm run verify:html-only
node scripts/check-section-labels.mjs
```

浏览器验证按 `.agents/skills/design-page-verify/SKILL.md` 执行；`npm run build` 通过不代表设计验证通过。
