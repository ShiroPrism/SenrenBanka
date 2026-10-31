# 六套可爱风独立设计批次

## Background

项目现有 16 套启用设计、版本 0.16.1，核心价值是同一份三语 Profile 生成视觉与信息结构完全不同的独立主页。本批次新增六套“可爱”方向设计，但必须避免把可爱收束成同一套粉彩卡片风格，也不能复用现有 `tape` / `archive` / `fax` / `receipt` / `poster` / `pager` 的结构近亲。

## Goal

并行新增 Fairy Kei、Sticker Diary、Pixel Pet RPG、Little Forest、Cute-alism、Magical Girl 六个独立 `styled design`，由主线程完成字体、注册、描述、文档、版本和最终验证集成，同时保持现有设计、Profile 契约、共享菜单和 CSS 隔离不回归。

## In Scope

- 六套设计的 `DESIGN.md`、`design.json`、`Page.astro`、`messages.ts`、`style.css`，以及按需提供的 `tokens.css`、`Preview.astro`、设计私有客户端入口。
- `Fredoka Variable` 与 `LXGW WenKai GB Medium` 两个生产字体族的新增、许可归档与子集化；其余角色复用现有字体。
- `src/designs/descriptions.ts` 的三语描述、主题自动发现校验、版本 `0.17.0`、`change-log/0.17.0.md`、六份验证记录与必要的共享验证更新。
- 三语静态页面、共享操作菜单、主题预览、CSS 隔离、字体回退、桌面/375px 布局、对比度、键盘、减动态和设计脚本降级验证。

## Requirements

- 六套设计构成一个 **Design batch**，只共享质量门禁与交付流程，不共享视觉系统、卡片骨架、配色、图标语言或装饰母题。
- 全部核心字段必须呈现；`avatar` / `location` / `projects` / `experience` / `skills` / `contact` 存在时全部条件渲染。不得虚构资料、等级、任务进度、成就或用户配置。
- 视觉：Fairy Kei 为打开的玩具收藏盒；Sticker Diary 为跨页手帐；Pixel Pet RPG 为地图探索与 HUD；Little Forest 为林间小径；Cute-alism 为贯穿全页的几何拼贴系统；Magical Girl 为角色档案与舞台登场。
- JS 只用于 Sticker Diary 的跨页浏览、Pixel Pet RPG 的地图状态和 Magical Girl 的登场编排。Fairy Kei、Little Forest、Cute-alism 不创建主题脚本。
- 主题 JS 严格渐进增强、每套单一入口、零第三方交互依赖、≤12KB gzip；无 JS / 加载失败 / 初始化失败时核心与可选内容全部可见。减动态可取消动画，但不得取消功能。
- 素材仅使用 CSS、原创内联 SVG、HTML 几何和已有头像；不新增外部位图、热链、框架、WebGL、Canvas-only 文本或滚动劫持。
- 桌面可使用空间构图；移动端按 DOM 顺序单列重排，不做整页缩放或主题级横向滚动。
- 共享改动只由主线程完成；六个设计代理只写自己的 `src/designs/<id>/`。

## Out of Scope

- 新 Profile 字段、自定义内容模型、通用区块渲染、主题专用用户数据。
- 新切换页分组、主题收藏或“可爱系列”运行时分类。
- 新增第三方图片、可再分发条件不明的字体、前端框架或交互依赖。
- 修改既有主题视觉、共享菜单语义、随机/固定主题策略或部署路径规则。

## Acceptance Criteria

- [ ] 六套设计全部包含现行 `styled` 必交文件；`Preview.astro` 均为自包含视觉签名，不 import 正式页 CSS。
- [ ] 六套设计在截图层面能指出至少四个结构性差异：页面骨架、内容映射、字体角色、动效/交互；不能由同一模板换色得到。
- [ ] `Fredoka Variable` 与 `LXGW WenKai GB Medium` 完成许可、样张、覆盖、子集、体积与回退记录；生产产物不含 `.local-fonts` 路径或第三方字体请求。
- [ ] 三语六套页面全部生成，核心与非空可选字段呈现；`lang`、HeadMeta、canonical、robots、内部链接与语言目标正确。
- [ ] 六套页面均无条件接入共享 `ContextMenu`，按需接入 `Reveal`；无重复语言入口或旧主题切换入口。
- [ ] 切换页展示六套新 Preview；正式页 CSS 不包含 Preview 规则，切换页不出现主题 `:root` 令牌泄漏。
- [ ] Sticker Diary、Pixel Pet RPG、Magical Girl 在脚本成功、脚本失败和无 JS 三种路径下均保留全部真实内容与导航能力；三个主题脚本均 ≤12KB gzip。
- [ ] 桌面和 375px 触控视口无横向溢出；键盘焦点、触控目标、分区名称、装饰隐藏、对比度与减动态通过实测。
- [ ] `npm run check`、`npm run build`、HTML-only 门禁、CSS 隔离、`BASE_PATH=/demo` 抽查与 `design-page-verify` 完成；未执行项如实记录。
- [ ] 版本、变更日志、六份 `docs/verification/<id>.md`、共享验证/菜单记录与文档索引一致，既有 Profile 和其他设计无回归。
