# Homepage '99 早期个人主页

> 父任务：`.trellis/tasks/10-28-web1-html-only/`。**前置条件：`10-28-html-only` 已完成实现自测，`descriptions.ts` 的串行写入已释放；不得与其并行。两套主题的最终提交都等待用户实机验收。**

## Goal

新增 `homepage99`：一套像个人站点作者在 1998–1999 年手工搭建的 GeoCities / Web 1.0 个人主页。它的辨识度来自页面组织方式、粗边框、密集链接、表格式信息、徽章与状态装饰，而不是给现代卡片换一套复古颜色。

## Requirements

- **R1 标准主题交付**：提供 `DESIGN.md`、`design.json`、`Page.astro`、`style.css`、`messages.ts`，以及 `tokens.css` 和 `Preview.astro`；`renderMode` 显式写为 `styled`。
- **R2 视觉语言**：语义 `header/nav/main/aside/footer` + CSS Grid 模拟旧网页骨架；锁定左目录、主内容、右徽章轨的非对称三区；桌面粗边框与有限高对比调色板，375px 单列。
- **R3 非设备拟物**：不得复制 Terminal / Radio / Fax / Pager / Tape / Receipt / Archive 的 CRT、仪表、纸张、票券或硬件外壳语法。
- **R4 数据**：渲染 `name` / `headline` / `bio` / `links`，并渲染所有实际存在的 `avatar` / `location` / `projects` / `experience` / `skills` / `contact`。
- **R5 字体**：只用系统字体：标题 Times 系、正文 Arial / Helvetica 系、技术标签 Courier New 系；不新增 `Font`、`astro.config.mjs` 字体注册或字体文件。
- **R6 时代装饰**：允许静态 Under Construction 条、2–3 枚纯 CSS 文字徽章、明确标注“离线 / 未接线”的 Visitor Counter。不得加入 Guestbook、Webring、远程 GIF、虚假访问量或不可用控件。
- **R7 语义**：真实 `<table>` 只用于经历等结构化数据，必须含 `caption` / `th scope`；不得用 table 搭整页骨架。
- **R8 共享机制**：`HeadMeta`、`view.head.lang`、三语数据、`ContextMenu` 与既有权重/随机/手选机制全部按 `styled` 契约接入。
- **R9 动效**：不接入 Reveal；不做 blink / marquee 文本 / 滚动入场。唯一循环为施工条低速斜纹，`prefers-reduced-motion: reduce` 下完全静止。
- **R10 文案**：所有设计界面文案来自 `messages.ts` 三语；装饰徽章、品牌与无需翻译项在文件头说明理由。
- **R11 预览与令牌**：调色板只在 `tokens.css` 定义，作用域为 `:is(.h99,.h99-pv)`；`Preview.astro` 不 import 正式页 CSS、不声明 Font、无焦点元素，导出空字体数组。
- **R12 集成**：在 `descriptions.ts` 增加 `homepage99` 三语说明；更新 `docs/verification/homepage99.md`，必要时更新 `shared.md`。
- **R13 依赖**：不新增第三方依赖、远程素材或后端。

## Acceptance Criteria

- [ ] **A1** `npm run build` 绿；新增 `homepage99` 三语页面，整体页数符合父任务基线。
- [ ] **A2** 三语页面核心字段与全部存在可选资料可见；avatar 仅在数据存在时渲染且有合适 alt 与比例。
- [ ] **A3** 视觉检测能一眼识别为个人主页式三区布局，而不是现代卡片、CRT、仪表、纸张或票券；同一视觉语言在三语间一致。
- [ ] **A4** 字号 / 色彩 / 间距 / 边框属于有限令牌集合；正文与低强度文本达到 WCAG AA，并记录实测值。
- [ ] **A5** 桌面 1280–1536px 有明确左右留白；375px 无横向溢出，导航与内容 DOM 顺序一致；粗边框、长 URL 与表格均不撑破视口。
- [ ] **A6** 标题层级为单一 `h1` 后连续 `h2/h3`；每个 section 有可访问名称；徽章与装饰符号不进入链接可访问名；表格有 caption 与表头关联。
- [ ] **A7** Under Construction 斜纹是唯一无限循环；reduced-motion 下无动画；无 Reveal、无闪烁、无文字跑马灯。
- [ ] **A8** 系统字体实际命中；网络请求只含本页 HTML、自身 CSS、favicon 与数据需要图片，无生产字体、远程装饰或第三方脚本。
- [ ] **A9** Visitor Counter 明确显示为离线装饰，没有伪造访问数；Guestbook / Webring / 不可用按钮均不存在。
- [ ] **A10** shared ContextMenu 在桌面与 375px 触控下正常，本设计不新增语言/主题切换入口。
- [ ] **A11** 随机池、切换页、旧路径、三语语言切换、`manualSwitch:false` 与 `BASE_PATH=/demo` 均正确。
- [ ] **A12** `Preview.astro` 在切换页呈现可识别的迷你主页签名；正式页不出现预览选择器；无 `:root` 令牌泄漏。
- [ ] **A13** `impeccable detect --json src/designs/homepage99` 0 条，或新档位/信号已按规则登记。
- [ ] **A14** `docs/verification/homepage99.md` 含桌面、移动、日语、字体回退、对比度、动效降级、CSS 隔离与截图路径。

## Out of Scope

- 修改默认主题、全局随机策略或其他 17 套设计。
- 新增字体、图标库、图片包、远程 GIF 或前端依赖。
- 真实 Guestbook、Webring、访问统计或任何后端服务。
- 修复 ContextMenu 无 JS 回退等既有问题。
