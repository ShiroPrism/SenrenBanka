# 六套可爱风独立设计 — 技术设计

## Architecture and Ownership

- 六个设计均采用现有目录自动发现机制；不新增注册清单，不新增依赖。
- 当前子代理平台没有独立 worktree 入口，六个实现代理共享同一 checkout，因此以绝对路径边界隔离：每个代理只可创建或修改 `src/designs/<id>/`。
- 主线程独占 `astro.config.mjs`、`src/designs/descriptions.ts`、`package.json`、`package-lock.json`、`src/assets/fonts/`、共享组件/库、`docs/`、`change-log/` 与其他设计目录。
- 并行期间禁止代理运行共享 `dist/` 的完整构建；代理只做主题目录内的静态检查和脚本体积检查。六个目录齐全后，主线程串行执行完整构建和浏览器验证，避免并发写 `.astro/`、`dist/` 产生假失败。

## Shared Data Contract

- 每页 frontmatter 调用 `loadDesignView('<id>', Astro.url.pathname)`；不读取语言文件或自行解析路径。
- `<html lang={view.head.lang}>`，`<head>` 原样包含 `<HeadMeta {...view.head} />`。
- `<body>` 末尾无条件渲染 `<ContextMenu config={view.contextMenu} />`。
- 核心字段始终渲染；可选字段以真实数据非空为条件。头像可省略，不得成为页面成立前提。
- 主题文案完整覆盖 `zh-CN` / `ja` / `en`；控制标签、状态文本、无内容提示均来自主题 `messages.ts`。

## Visual Isolation

| id | root / prefix | planned JS | runtime fonts |
|---|---|---|---|
| `fairy-kei` | `.fk` / `fk-` | none | Fredoka, LXGW WenKai, Inter |
| `sticker-diary` | `.sd` / `sd-` | `script.ts` | UglyTypist, LXGW WenKai, Inter |
| `pixel-pet-rpg` | `.pxt` / `pxt-` | `script.ts` | Silkscreen, Ark Pixel, Handjet |
| `little-forest` | `.lf` / `lf-` | none | Fraunces, LXGW WenKai |
| `cute-alism` | `.cal` / `cal-` | none | Fredoka, LXGW WenKai, Inter, League Mono |
| `magical-girl` | `.mg` / `mg-` | `script.ts` | Fraunces, LXGW WenKai, Inter |

- 每个 `style.css` 固定以 `@import "tailwindcss" source(none);` 与 `@source "./";` 开始，并添加 `@source not "./Preview.astro";`。
- 调色板放 `tokens.css` 时只使用 `:is(.xx, .xx-pv)` 命名空间，不写设计级 `:root`；字体角色只在 `style.css` 的 `@theme inline` 声明。
- 预览为自包含 SSR 碎片，不导入正式页 CSS、不声明 `<Font>`、不包含可聚焦元素；导出真实使用的 `fonts`。
- 任何共享模块不得对设计页面或 CSS 建立动态导入边。

## Font Pipeline

- 新增 `Fredoka Variable`：latin 29,784 B + latin-ext 4,576 B，wght 300–700，OFL-1.1，官方来源 Google Fonts。
- 新增 `LXGW WenKai GB Medium`：OFL-1.1，源覆盖 GB2312 6763/6763、假名 176/176、JIS X 0208 6953/6953；完整源文件约 24.4MB，只允许发布站内用字子集。
- 生产字体进入 `src/assets/fonts/fredoka/` 与 `src/assets/fonts/lxgw-wenkai/`，许可文件同目录；`astro.config.mjs` 使用 `fontProviders.local()` 注册 `--font-fredoka` 与 `--font-lxgw`。
- 为保证子代理可构建，主线程在派发前先接入两个字体与暂定子集；六个 `messages.ts` 齐全后再重生成 LXGW 子集并复验字形覆盖。缺字不得静默当作通过。
- 字体回退链必须包含系统简中/日文字体与通用族；字体默认 `display: swap`，不 preload CJK。
- 不新增第三族。`UglyTypist`、`Fraunces`、`Silkscreen`、`Ark Pixel`、`Handjet`、`Inter`、`League Mono` 继续复用。

## Design-specific JavaScript

- 只有 `sticker-diary`、`pixel-pet-rpg`、`magical-girl` 允许一个私有 `script.ts`；其他目录若出现主题脚本视为越界。
- Astro 页面入口以普通 `<script>` 引入设计私有模块，不 `is:inline` 铺开逻辑，不 import CSS，不建立共享交互运行时。
- 脚本必须 IIFE/模块内自包含，初始化成功后才增状态；捕获异常并恢复静态终态。无 JS 时 HTML 必须本身完整可读。
- `sticker-diary`：书签/前后按钮切换跨页；无 JS 时所有跨页顺序展开。键盘 `←` / `→` 可切换；`aria-current` 与可访问名称同步；不形成焦点陷阱。
- `pixel-pet-rpg`：地图节点是真实锚点；无 JS 时锚点到可见区块。JS 成功后切换当前地点面板并移动玩家标记；不得伪造等级/HP/XP/任务完成度。
- `magical-girl`：仅编排一次 ≤1.2 秒的星轨、缎带和档案卡落位；正文不等待、无覆盖层、无声音。减动态或无脚本直接显示最终态。
- 主题 JS 的压缩体积按所属页面独立 chunk 测量，目标 ≤12KB gzip；所有持续 `requestAnimationFrame` 在页面隐藏或交互结束时停止。

## Integration Flow

1. 主线程完成字体资源、许可、注册与基线构建。
2. 并行启动六个 `trellis-implement` 子代理，每个提示词以对应 `Active task: .trellis/tasks/10-29-<id>-design` 开头，并列出唯一写路径。
3. 子代理提交文件清单、字体/JS 决策、静态自查和未解决问题；主线程逐个审查，不以“构建通过”替代设计审查。
4. 主线程补齐 `descriptions.ts`、必要字体子集、预览字体并集、版本与验证文档。
5. 主线程串行运行 `npm run check`、`npm run build`、CSS/产物/预览/多语言/base 路径检查。
6. 对六套执行 `design-page-verify` 桌面、375px 触控、对比度、检测器与截图；对三个脚本主题增加成功/失败/无 JS 路径。
7. 仅在所有验证完成后更新 `docs/verification/`、`change-log/0.17.0.md` 并做最终交付汇总。

## Compatibility and Rollback

- 新设计目录可独立移除；共享注册为自动发现，不新增路由配置。
- 若新字体方案失败，设计内容仍可用系统回退字体；不得临时引用 `.local-fonts` 或远程字体。
- 若某个主题脚本失败，页面退回无 JS 长文档，不影响其他主题。
- 若单个设计未达质量门槛，退回该子任务修正，不阻塞其他五个目录的独立实现与审查。

## Risks

- 六套同时扩展可能诱发“同模板换皮”；通过六份非目标清单、截图对比和不同 DOM 骨架阻止。
- `LXGW WenKai` 源体积过大；通过站内用字子集与 `document.fonts.check()` 验证控制。
- 共享 checkout 的并发构建可能互写产物；代理只改私有目录，完整验证串行。
- 手帐跨页与像素地图可能隐藏内容；门控失败路径和真实锚点回退是硬验收项。
- 新预览并集会增大切换页 CSS/HTML；保持预览 1–8KB，并记录实测成本变化。
