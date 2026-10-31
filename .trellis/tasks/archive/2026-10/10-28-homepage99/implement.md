# 执行计划：Homepage '99

## 前置

> **Prerequisite:** `10-28-html-only` 必须已完成实现自测；其渲染模式、构建门禁和文档变更已稳定。`descriptions.ts` 的共享写点必须空闲。用户实机验收与归档在提交前统一完成，不阻塞本子任务的自测。

- [x] 确认 `task.py current --source` 指向本任务、HTML-only 子任务自测已完成。
- [x] 阅读本任务 `prd.md` / `design.md`、父任务文档、`AGENTS.md`、`docs/fonts/selection-guide.md`、`docs/adr/0001` / `0003`。
- [x] 记录当前构建页数、既有 17 套设计基线与 `descriptions.ts` HEAD 版本。

## 阶段 1 · 设计规范与数据

- [x] 1.1 写 `DESIGN.md`：隐喻、信息架构、视觉差异矩阵、令牌、字体六项记录、Motion、a11y、预览约束。
- [x] 1.2 写 `design.json`：`Homepage '99`、`enabled:true`、`renderMode:"styled"`、accent、`source.type:"self-produced"`。
- [x] 1.3 写 `messages.ts`：三语导航/分区/施工/计数器/回顶/links 等文案；文件头登记徽章与品牌类不翻译项。
- [x] 1.4 实施前复核调色板对比度，所有值先进入 `DESIGN.md` 与 `tokens.css`。

## 阶段 2 · 正式页

- [x] 2.1 建 `Page.astro` 完整文档，接入 `loadDesignView`、`HeadMeta`、`ContextMenu`。
- [x] 2.2 页面用 `header/nav/main/aside/footer` 与 CSS Grid，不用 table 搭整页。
- [x] 2.3 渲染核心字段及所有存在扩展数据；头像按数据条件出现。
- [x] 2.4 经历专用 `<table>` 实现 caption / th scope；窄屏采用经实测可读的结构。
- [x] 2.5 实现施工条、徽章、离线计数器；不加 Guestbook / Webring / 外链假控件。
- [x] 2.6 建 `style.css` 与 mandatory Tailwind directives；字体角色直接引用系统字体，不新增 `@theme` 字体 alias（无自定义字体）。
- [x] 2.7 建 `tokens.css`：只放调色板，作用域 `:is(.h99,.h99-pv)`，无 `:root`。

## 阶段 3 · 动效与无障碍

- [x] 3.1 施工条只使用 `background-position` 动画；无其他 infinite，无 Reveal，无闪烁/跑马灯。
- [x] 3.2 reduced-motion 关闭施工动画，内容保持完整。
- [x] 3.3 section 可访问名、标题层级、表格关联、装饰 aria-hidden、链接可访问名全量检查。
- [x] 3.4 键盘 focus-visible、长 URL、日文内容、表格与 375px 布局测试。

## 阶段 4 · 预览与集成

- [x] 4.1 建 `Preview.astro`：迷你 masthead / 左目录 / 主区 / 徽章，无 Font、无 style.css、无可聚焦元素。
- [x] 4.2 `style.css` 增加 `@source not "./Preview.astro";`。
- [x] 4.3 `src/designs/descriptions.ts` 只新增 `homepage99` zh-CN / ja / en 说明。
- [x] 4.4 检查 `astro.config.mjs` 无需变更。

## 阶段 5 · 验证

- [x] 5.1 `npm run build` 绿；三语言页面存在；HTML-only 门禁仍绿。
- [x] 5.2 产物：本页恰一条自身 CSS；不含预览选择器；不混入其他设计 CSS。
- [x] 5.3 浏览器桌面 1440 / 1280：console 0、网络仅自有资源、系统字体命中、布局 token 符合 DESIGN。
- [x] 5.4 375px 触控：无横向溢出、导航/表格/长 URL 正常、共享菜单全流程通过。
- [x] 5.5 reduced-motion：施工条 animation none；无其他持续动效。
- [x] 5.6 三语核心/可选数据与 SEO；语言切换保持 `homepage99`；`manualSwitch:false` 仍正常。
- [x] 5.7 `BASE_PATH=/demo` 构建并抽查链接。
- [x] 5.8 切换页预览：卡片可识别、无 focus、无 :root 泄漏、无字体重复。
- [x] 5.9 `impeccable detect --json src/designs/homepage99` 0 或登记例外。
- [x] 5.10 截图归档：桌面全景、细节、375px、日语；记录路径和实测值。

## 阶段 6 · 收口

- [x] 6.1 新增 `docs/verification/homepage99.md` 当前完整状态。
- [x] 6.2 如共享预览/页面数有变化，更新 `docs/verification/shared.md`。
- [ ] 6.3 用户实机验收通过后才提交并归档本子任务；change-log / 版本留给父任务。

## 验证命令

```powershell
npm run build
npm run preview
.agents\skills\impeccable\scripts\impeccable.cmd detect --json src/designs/homepage99
node .local-fonts/dev/generic-probe.mjs http://localhost:4321/zh-cn/homepage99/
node .local-fonts/dev/generic-probe.mjs http://localhost:4321/ja/homepage99/
```

## 风险与回滚

- 如果三区骨架在 375px 无法保持可读，优先保持 DOM 顺序和内容，退回单列并调整间距，不横向缩字。
- 如果系统字体在某平台差异过大，只能调整字体栈与字号，不引入新字体依赖。
- 如果视觉落成现代卡片，回到 `DESIGN.md` 的“旧网页组织方式”而非继续装饰。
- 全部回滚点：删除 `homepage99` 目录 + descriptions 条目 + `docs/verification/homepage99.md`；无全局代码改动。
