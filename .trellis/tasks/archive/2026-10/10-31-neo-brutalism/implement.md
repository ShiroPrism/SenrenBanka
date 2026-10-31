# `brutal` 实施清单

## 0. 前置

- [ ] 确认 `fonts.config.json` 已启用 `league-gothic` / `inter` / `jetbrains-mono` / `zhuque-fangsong`；未启用则先走选型/许可/`fonts:update`/`fonts:prepare`，不得手改生成文件。
- [ ] 确认 `src/designs/brutal/` 不存在同名目录。
- [ ] 读 `docs/rules/design-contract.md` / `visual-language.md` / `accessibility-responsive.md` / `pitfalls.md` / `data-and-i18n.md`。

## 1. 规范先行

- [ ] 写 `src/designs/brutal/DESIGN.md`：概念、色板、字体六项记录、版式、组件、Motion 章节、Do/Don't、响应式、无障碍、内容映射。
- [ ] 写 `design.json`：`displayName: "Brutal"`、`description`、`enabled: true`、`accent`、`source: { type: "self-produced" }`、`generatedBy`。
- [ ] 写 `messages.ts`：zh-CN / ja / en 三语言，短标签语域；不翻译项写注释。

## 2. 样式与令牌

- [ ] 写 `tokens.css`：`:is(.bt, .bt-pv)` 作用域；纸/墨/橙/蓝/酸黄/muted；边框、阴影、间距、时长、曲线。
- [ ] 写 `style.css`：Tailwind 两行 + `@source not "./Preview.astro";` + `@import "./tokens.css";`；`@theme inline` 注册三个字体角色；布局、组件、动效、响应式、焦点、减动态。
- [ ] 用对比度工具核对每个文字/底色组合；酸黄只配墨黑。

## 3. 页面

- [ ] 写 `Page.astro`：`loadDesignView('brutal', ...)`、`HeadMeta`、四个 `<Font>`、`Reveal`、`ContextMenu`、`body.bt`。
- [ ] 渲染四字段 + 条件扩展区块；链接经 `withBase()` / `localeDesignHref()`；装饰 `aria-hidden`。
- [ ] 每个 section 有可访问名称；键盘 Tab 顺序符合 DOM 顺序。
- [ ] 375px 单列、无横向溢出；1440/768 有内容左右留白。

## 4. 预览

- [ ] 写 `Preview.astro`：自包含、只 import `./tokens.css`、无 `:root`、无 `<Font>`、无可聚焦元素；`fonts` 导出四族。
- [ ] 切换页预览不执行设计脚本；卡片画幅 16/10 内不溢出。

## 5. 验证

- [ ] `npm run fonts:typography`
- [ ] `npm run build`
- [ ] 记录构建前后 `dist` 字节数与增量。
- [ ] 执行 `.agents/skills/design-page-verify/SKILL.md`：桌面 / 平板 / 375px / 键盘 / 对比度 / 减动态 / 无 JS / 构建产物 / 预览。
- [ ] 更新 `docs/verification/brutal.md`；若共享机制或切换页变化，更新 `docs/verification/shared.md`。
- [ ] 若 `dist` > 10 MiB：记录并另开容量任务，不降低设计质量。

## 6. 收口

- [ ] `git diff --stat` 只包含本设计目录与验证文档。
- [ ] 任务归档；批次父任务记录子任务完成状态。
- [ ] 不 commit，除非用户明确要求。

## 回滚点

- 删除 `src/designs/brutal/` 与 `docs/verification/brutal.md` 即可完全回滚；无共享文件改动。
- 若字体注册有改动：按 `fonts.config.json` 回退并重新 `fonts:update` / `fonts:prepare`，不手改生成文件。
