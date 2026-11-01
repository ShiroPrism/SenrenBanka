# 22 套设计韩语文案与页面 · 执行计划

> 前置：C1 catalog v1.1.0 已发布；C2 主站字体接入已完成（commit `2447de2`），5 套现有 ko 页与构建/审计通过。

## 0. 前置检查

- [ ] `npm run fonts:coverage` 当前 5 套通过；`npm run build` 124 页基线。
- [ ] 读 `prd.md` / `design.md`；确认 22 套列表与字体映射。
- [ ] 当前工作树干净（C2 已提交）。
- [ ] 确认 `src/designs/<id>/messages.ts` 的三语与文件头注释；禁止把不翻译项译掉。

## 1. 批次实现（3 个 implement agent，可并行）

每个 agent 的 prompt 以 `Active task: .trellis/tasks/11-01-korean-content-rollout` 开头，并明确：

- 只改自己批次的 8/7/7 套设计：`design.json` / `messages.ts` / `Page.astro`。
- `design.json.locales` 末尾加 `"ko"`，保留原顺序。
- `messages.ts` 为每个 key 加 `ko`；遵循文件头注释、设计语域、不翻译项；不新增句子；保留占位符/ASCII/品牌名；韩语自然、避免机翻腔。
- `Page.astro` 加映射的 `<Font cssVariable="--font-..."/>`；没有 `Font` import 的补 import；不改其他内容。
- 不碰 `descriptions.ts`、CSS/Preview、fonts/scripts/docs/shared 组件、其他批次。
- 不运行 `npm run fonts:coverage`（其他批次未完成会失败）；可运行 `npm run fonts:typography`、`npx astro check`、`npm test` 自检。
- 不 commit。
- 报告：每套的韩语描述建议、不翻译项、任何语域不确定项。

批次：

- A：archive, brutal, cute-alism, deco, fairy-kei, fax, homepage99, ink
- B：kern, lexicon, little-forest, magical-girl, material3, oxide, pager
- C：pixel-pet-rpg, poster, radio, receipt, sticker-diary, tape, terminal

## 2. 合并 descriptions.ts

- [ ] 为 22 套设计在 `src/designs/descriptions.ts` 增加 `ko` 描述；使用批次报告的建议，统一检查语域/长度。
- [ ] 5 套现有 ko 描述不变。
- [ ] 27 套 descriptions 全部有 `ko`。

## 3. 文案自检（人工审校前）

- [ ] 逐套检查：不翻译项保持原样；没有新增解释性句子；`ko` key 集合与 `en`/`zh-CN` 完全一致。
- [ ] 抽查韩语自然度与设计语域；记录“AI 起草，待人工审校”。
- [ ] 不在验证记录中宣称已人工审校。

## 4. 门禁与构建

```bash
npm run fonts:coverage
npm test
npm run check
npm run build
du -sb dist
```

- [ ] `fonts:coverage`：27 套 ko 设计通过。
- [ ] `npm test` / `npm run check`：0 error。
- [ ] `npm run build`：146 页；`fonts:subset` 6 个韩语族都有更大子集；`fonts:prune` ≤10 MiB；`verify:html-only` 4 页；`fonts:audit` 0 部署缺口。
- [ ] `/ko/designs/` 列出 27 套；27 个 `/ko/<design>/` 存在；5 套现有页面无回归。
- [ ] 非 ko 页面抽查（如 `/ja/archive/`）`document.fonts` 不含已加载韩语族。

## 5. 浏览器冒烟（22 套）

- [ ] 1280×800 + 375×812 逐页：HTTP 200、`lang=ko`、声明的韩语字体加载、0 console、无横向溢出。
- [ ] 每族至少 1 套截图；关键设计（archive / brutal / pager / terminal / sticker-diary）额外目检。
- [ ] 非 ko 页面不下载韩语子集。
- [ ] 记录矩阵与截图到 `docs/verification/`；完整逐页 1440/375/菜单/无 JS/对比度/动效全矩阵可作为后续验证任务。

## 6. 文档

- [ ] `docs/verification/shared.md` 增加 22 套内容扩覆盖的批次记录（页面数、dist、字体、audit、冒烟范围）。
- [ ] 22 套 `docs/verification/<id>.md` 各加一行韩语覆盖说明；可先统一批次记录，再逐设计补。
- [ ] `docs/README.md` / SPEC / rules 如已有字体说明，不重复；如需引用 ADR 0017 即可。
- [ ] 文案审校待办写入任务 Notes / verification。

## 7. 提交

- [ ] `git status` 只含预期变更：22 套 design.json/messages/Page.astro、descriptions.ts、verification/docs、任务产物（忽略）。
- [ ] 本地 commit（不 push 字体仓库；主站是否 push/PR 由用户决定）：
      `feat: add Korean content for all designs`
- [ ] 报告：27 套覆盖、146 页、dist、audit、冒烟矩阵、审校待办。

## 8. 回滚

- 移除 22 套 `ko`（design.json / messages / descriptions / `<Font>`）；C2 字体层与 5 套现有 ko 页面不受影响。
- 不删除字体仓库 release / catalog；不改 10 MiB 门禁。
