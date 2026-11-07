# Shelf — 执行计划

## 0. 前置

- [ ] `python ./.trellis/scripts/task.py current` 指向 `11-05-shelf-design`（`start` 后确认）。
- [ ] 读 `AGENTS.md`、`docs/rules/{design-contract,visual-language,accessibility-responsive,data-and-i18n,pitfalls}.md`、`docs/fonts/selection-guide.md`。
- [ ] 确认 `src/designs/shelf/` 不存在；记录 `dist` 基线 **8,036,433 B / 181 页 / 45 字体文件**（2026-11-04 当前基线）。
- [ ] 不修改 `fonts.config.json` / `fonts.lock.json` / `src/fonts/generated.ts`；本任务零新增字体发布。

## 1. 规范先行（评审门 A）

- [ ] 写 `src/designs/shelf/DESIGN.md`：隐喻、色板实测表、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't（含“不复制椰树 trade dress”清单）、验证。
- [ ] 写 `src/designs/shelf/tokens.css`：`:is(.shelf, .shelf-pv)`，禁止 `:root`；§2 色板与尺度。
- [ ] 写 `src/designs/shelf/design.json`：`Shelf`、5 locale、`self-produced`、accent `#D7261E`。
- [ ] 写 `src/designs/shelf/messages.ts`：5 语言键（brand / profile / notForSale / netContent / netContentValue / origin / series / ingredients / productNotes / production / channels / contact / batch / local / noContact / shelfTag）。
- [ ] 写 `src/designs/descriptions.ts` 的 `shelf` 五语言切换页说明。
- [ ] **评审门 A**：给用户看 DESIGN.md 的隐喻、色板对比度、字体路线、Do/Don't；确认后再进入实现。

## 2. 实现

- [ ] `style.css` 首两行 `@import 'tailwindcss' source(none); @source "./";`，加 `@source not "./Preview.astro";`，再 `@import './tokens.css';`。
- [ ] `@theme inline` 注册展示 / 正文 / 标签字体角色；`.shelf` 写完整字体栈；`html:lang(zh-TW)` 重映射 `--font-zhuque` → `--font-noto-sans-tc`、`--font-gothic-a1` → `__senrenbanka_tc_skip__`。
- [ ] 实现货架背景、包装正面、姓名三层 WordArt、headline 黄块、规格章、非卖品封签、分区面板、项目卡、生产信息、购买渠道、联系经销商、页脚条码。
- [ ] `Page.astro`：`loadDesignView('shelf', Astro.url.pathname)`；`HeadMeta` / `Font` / `Reveal` / `ContextMenu`；5 语言 `messages`；条件区块；内部链接走 `withBase()` / locale 辅助。
- [ ] 非 zh-TW 注册 `Inter` / `Noto Sans TC` / `Zhuque` / `Gothic A1` / `JetBrains Mono`；zh-TW 注册 `Inter` / `Noto Sans TC` / `JetBrains Mono`。
- [ ] `Preview.astro`：自包含 16/10；只 import `./tokens.css` / `./messages`；导出实际字体；无可聚焦元素；不 import `style.css`。
- [ ] 动效：封签 220ms `steps(3, end)` 只播一次；共享 Reveal 180–240ms / 位移 ≤10px；`prefers-reduced-motion` 下全部自然可见。
- [ ] 对比度：正文只用合格组合；黄 / 红只做展示大字；条码 / 封签装饰 `aria-hidden`。

## 3. 首次视觉检查（评审门 B）

- [ ] `npm run dev`（或 `npm run build && npm run preview`）打开 `/zh-cn/shelf/`。
- [ ] 截图 1440 全页 + 375 全页；检查：姓名是否真的像“粗黑 WordArt”、黄 / 红 / 黑比例、满版但不拥挤、正文可读、封签 / 条码不抢阅读。
- [ ] 检查 5 语言：`/zh-cn/shelf/`、`/zh-tw/shelf/`、`/ja/shelf/`、`/en/shelf/`、`/ko/shelf/`；长文本不溢出。
- [ ] **展示字体决策**：Noto Sans TC 合成粗黑可接受 → 保留；否则回退非 TC 页 `Zhuque` 描边，更新 DESIGN.md。
- [ ] 量 `dist`；若 >8.5 MiB 软目标，先回退展示字体路线，记录数值。
- [ ] **评审门 B**：给用户看截图与体积；确认视觉方向后再跑完整验证。

## 4. 集成与文档

- [ ] `src/designs/descriptions.ts` 增加 shelf 五语言说明；检查切换页 29 张卡。
- [ ] 更新 `README.md`：28 套 → 29 套；27 styled → 28 styled。
- [ ] 更新 `docs/README.md`：当前 28 套预览 → 29 套。
- [ ] 更新 `SPEC.md` §4.4.1：锚点矩阵加 shelf 行；覆盖缺口段落加“2026-11-05 shelf 补上中国县域商品包装 / 货架姿态”；批次记录加第 29 套；历史记录不回写。
- [ ] 更新 `docs/verification/shared.md` 当前基线：29 套 / 187 页（以实际构建为准）/ dist；历史数字保留。
- [ ] 新建 `docs/verification/shelf.md`：设计状态、构建 / 测试、检测器、产物隔离、浏览器矩阵、降级、五语言与网络、对比度、预览、截图归档、体积增量。

## 5. 完整验证

- [ ] `npm run fonts:typography`：通过；确认 shelf 的展示 / 正文 / 标签栈包含核心 CJK，系统中文在 Zhuque 之后。
- [ ] `npm run fonts:coverage`：通过；zh-TW 有 han-traditional 注册 / 重映射；ko 有 Hangul 伴生。
- [ ] `npm test`：84/84（或当前基线）。
- [ ] `npm run check`：0 error / 0 warning（允许既有 lexicon hint）。
- [ ] `npm run build`：通过；记录页数、字体文件数、核心子集体积、dist 总量；`fonts:audit` 0 孤儿 / 0 部署缺口（shelf 不新增缺口）。
- [ ] `.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/shelf`：期望 `[]`；命中则修复或登记例外。
- [ ] 桌面 1440×900：无横向溢出；唯一 h1；标题序列 h1 → h2 ×6 → h3 ×N；每 section 有可访问名；核心字段 + 可选区块；console 0；请求仅自身 CSS / 字体。
- [ ] 平板 768×1024：项目 / 链接降列；无横向溢出；滚动显现全亮。
- [ ] 375×812 + 触控：`(pointer: coarse)` 为 true；无横向溢出；悬浮球 52×52；链接 / 邮箱 ≥44px；打开 / 关闭菜单后滚动锁恢复。
- [ ] 降级：`prefers-reduced-motion: reduce`、无 JS、无 IO、IO 抛错四种情形隐藏元素均为 0；封签静止。
- [ ] 五语言：`html lang` / `robots` / `canonical` / 菜单语言项 6 个 `.cm-lang` / 2 个 `aria-current`（双份 DOM）/ 语言切换保持同一 id。
- [ ] CSS 隔离：设计唯一 CSS；不含其他设计选择器；根页 / 404 / 语言入口 / 切换页不链接 shelf CSS；预览 CSS 只在切换页。
- [ ] `base` 前缀冒烟（`MSYS2_ARG_CONV_EXCL='*' npx astro build --outDir dist-demo --base /demo`）抽查内部链接。
- [ ] 截图归档 `.cache/verification/shelf-{1440,768,375}.png`；把实测值写进 `docs/verification/shelf.md`。
- [ ] **评审门 C**：给用户看验证摘要与最终截图；确认后进入提交。

## 6. 回滚

- [ ] 删除 `src/designs/shelf/` 与 `docs/verification/shelf.md`。
- [ ] 撤销 `src/designs/descriptions.ts` 的 shelf 条目、README / docs/README / SPEC / shared 的 shelf 计数与矩阵改动。
- [ ] 保留 Git 历史；不删除其他设计或历史验证记录。

## 7. 提交边界

- [ ] 只提交本任务相关文件；不把 `.cache/verification/*.png`、`dist/`、`fonts` 缓存加入 Git。
- [ ] 提交前 `git status` 检查；确认无字体配置 / 生成注册改动。
- [ ] 提交信息按仓库近期风格（`feat(designs): add shelf ...`）。
