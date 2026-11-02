# Aero — 2000s 科技乐观

> **来源**：自产（`self-produced`）。本规范先于实现；实现与规范不一致时先改规范。
>
> **一句话**：把个人资料做成一台 2007 年个人设备刚开机时的桌面——天蓝与草绿、玻璃泡、凝胶按钮、镜头光晕与半透明层；姓名是设备名，资料是窗口、图标和时间线。

## 1. 设计隐喻

不是 90 年代个人主页，也不是 Apple 毛玻璃。它是 **2000 年代中期的科技乐观**：明亮的天空、草地、白色塑料与玻璃、果冻质感的按钮、气泡和镜头光晕。信息像桌面图标和窗口一样被摆在一个友好的设备面板里。

三条不可让渡的骨架：

1. **天蓝 / 草绿 / 白是主角**：页面底色必须亮、饱和、通透；不能滑向灰色或纯白极简。
2. **光泽不是模糊**：用高光、内阴影、凝胶渐变和玻璃球建立 2000s 质感，限制大面积 `backdrop-filter`（那是 `frost` 的领域）。
3. **设备外壳是容器，不是假 OS**：状态条、窗口标题栏、图标按钮都是装饰性容器；不伪造可交互的系统控件，不使用 OS 商标或真实截图。

## 2. 色板

所有色值只在 `tokens.css` 定义一次（`--ae-*`），作用域 `:is(.aero, .aero-pv)`。对比度为 WCAG 2.x 相对亮度公式实算（2026-11-02，node 一次性脚本）。

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--ae-sky` | `#bfe9ff` | 天空底 | 墨 `#123247` **10.37:1** |
| `--ae-sky-2` | `#e8f8ff` | 天空过渡 | 墨 **12.4:1**（实施时复算） |
| `--ae-sky-deep` | `#0f6f9e` | 深色状态条/消息面板 | 纸白 `#f7fdff` **5.54:1** |
| `--ae-sky-deeper` | `#0b5a83` | 深色渐变末端 | 白 **7.49:1** |
| `--ae-grass` | `#7fcf6a` | 草地/强调面 | 墨 **7.02:1** |
| `--ae-paper` | `#f7fdff` | 设备面板/卡片底 | 墨 **13.00:1** |
| `--ae-white` | `#ffffff` | 凝胶高光/白字 | — |
| `--ae-ink` | `#123247` | 主文字 | 天空 **10.37:1**；纸白 **13.00:1** |
| `--ae-ink-soft` | `#2c536b` | 次级正文 | 纸白 **8.00:1**；天空 **6.38:1** |
| `--ae-ink-muted` | `#3d6076` | 弱化元信息 | 纸白 **6.53:1**；天空 **5.21:1** |
| `--ae-accent` | `#2f9fe0` | 签名天空蓝/装饰 | 不承载正文 |
| `--ae-accent-ink` | `#0b6fa4` | 链接/焦点环 | 纸白 **5.35:1** |

- 正文只用 `--ae-ink` / `--ae-ink-soft`；弱化元信息用 `--ae-ink-muted`，最低 **5.21:1**。
- 白色只用于深色底上的大字号/按钮/状态条；`--ae-sky-deep` 上白字 **5.54:1**，`--ae-sky-deeper` 上 **7.49:1**。
- 天空蓝/草绿不单独承载链接或状态；链接始终有下划线或文字标签。
- 任何新增色值必须先算对比度、登记本表，再进 `tokens.css`。

## 3. 字体（六项记录）

1. **隐喻与特征**：2000s 设备界面需要圆润、友好、略带玩具感的展示字，以及稳定、中性的正文字；中文要有可读的无衬线感，但项目现有核心 CJK 是宋/楷/仿宋，因此由拉丁展示字承担时代感，CJK 由核心字体保证覆盖。
2. **角色分配**：
   - 展示（姓名 / 分区标题 / 消息标题）：`Fredoka`（拉丁）+ 现有 CJK 核心
   - 正文（headline / bio / 描述 / 标签）：`Inter`（拉丁）+ 现有 CJK 核心
   - 状态条 / 编号：正文角色 + 大写 + 宽字距，不额外引入等宽体
3. **为什么是它们**：Fredoka 的圆润几何与 2000s 消费电子/玩具界面同源，且是项目既有 local family；Inter 在小字号与长文下稳定；两者都不需要新增字体资源。没有为 Aero 新增 `Frutiger` 之类字体，避免许可与体积风险。
4. **实际覆盖**：Fredoka / Inter 覆盖拉丁 ASCII 与常用标点；`Zhuque Fangsong` 按 GB2312 / JIS 参考集承接简中、日文与共享汉字；`zh-TW` 使用 `Noto Sans TC`；`ko` 使用 `Gothic A1`；缺字时按第 6 项顺序回退系统 CJK。
5. **字重 / 轴 / 体积 / 许可**：Fredoka 使用 400–600；Inter 使用 400–700；Zhuque 使用常规字重；Noto Sans TC / Gothic A1 使用常规字重。全部为项目已启用的生产 family，本设计不新增字体资源、不附 `SOURCE-LICENSE.txt`。
6. **回退顺序**（与 `style.css` / `Preview.astro` 逐字一致）：
   - 展示：`var(--font-fredoka), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`
   - 正文：`var(--font-inter), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`

> 实施约束：每个 `font` / `font-family` 都写完整显式回退；`--font-*` 只暴露主 face；系统 CJK 一律排在 `var(--font-zhuque)` 之后；本设计已选用核心 CJK，因此每个字体变量栈（含预览）都保留 `var(--font-zhuque)`。

## 4. 版式

- **设备外壳**：`--ae-max: 74rem`、`--ae-radius: 30px`；宽度 `min(74rem, calc(100% - 2 * var(--ae-pad)))`，居中；外阴影 + 顶部 1px 白色内高光；`overflow: hidden` 让状态条/内容共享圆角。
- **状态条**：深色渐变（`--ae-sky-deep` → `--ae-sky-deeper`），左 AERO + 绿色状态点，右地点 + 在线状态；0.68rem / 字距 0.14em / 全大写。
- **背景**：固定天空渐变 + 太阳径向光 + 两朵模糊云 + 底部草坡；全部 `aria-hidden`，不承载信息。
- **Hero**：桌面两列 `minmax(0, 1.1fr) minmax(0, .9fr)`；左列 kicker / 姓名 / headline / bio；右列玻璃球 + 三枚气泡；≤1024 单列。
- **分区**：1px 上边线 + 分区头（展示字标题 + 右侧计数）；Dock 为凝胶按钮组；窗口为三列卡片；时间线为 2px 渐变线 + 圆点；功能为胶囊；联系为深色消息面板。
- 字号：姓名 `clamp(3rem, 8vw, 7rem)` / 0.95；headline `clamp(1.1rem, 2vw, 1.45rem)`；bio 1rem / 1.8；分区标题 `clamp(1.5rem, 3vw, 2.2rem)`；正文 0.9–1rem。
- 无圆角照片、无图片、无阴影堆叠；体积感来自玻璃球、凝胶按钮和面板层次。

## 5. 组件

- **状态条（`.aero-statusbar`）**：深色渐变、纸白字、绿色状态点；地点缺失时用 `t.local`，不虚构地名。
- **玻璃球（`.aero-orb`）**：纯 CSS 径向渐变 + 内阴影 + 高光；`aria-hidden`；只用一枚，作为 Hero 的视觉锚点。
- **气泡（`.aero-bubble`）**：三枚，`aria-hidden`；只做静态装饰，不做无限漂浮。
- **凝胶按钮（`.aero-dock-link`）**：48px 高、圆角 16px、白→浅蓝渐变、内高光；左侧圆形字母标记；hover 抬起 2px，active 压回；焦点环 3px `--ae-accent-ink`。
- **窗口卡片（`.aero-window`）**：20px 圆角、标题栏三个装饰点（`aria-hidden`）、编号、标题链接、描述、标签；三列 → 两列 → 单列。
- **时间线（`.aero-timeline`）**：2px 渐变线 + 圆点；机构 / 角色 / 期间 / 描述；期间右对齐，窄屏换行。
- **功能徽章（`.aero-feature`）**：胶囊、浅蓝渐变、内高光；非交互元素。
- **消息面板（`.aero-message`）**：深蓝渐变、白字、邮箱主链接；无 email 且无 note 时整个分区不渲染。
- **页脚（`.aero-footer`）**：1px 上边线；姓名 + 可选站点声明；小字大写。

### 5.1 切换页预览的缩略档位（`Preview.astro`）

预览是装饰性缩略（16/10，`min-height: 9rem`），保留天空/草地、设备条、玻璃球和两枚凝胶 chip；按下列档位整体缩小：

| 元素 | 预览值 | 正式页值 |
|---|---|---|
| 设备条 | 0.42rem / 字距 0.12em | 0.68rem / 字距 0.14em |
| 姓名 | 0.98rem | `clamp(3rem, 8vw, 7rem)` |
| headline | 0.5rem / 2 行截断 | `clamp(1.1rem, 2vw, 1.45rem)` |
| 玻璃球 | 3.1rem | `clamp(12rem, 22vw, 18rem)` |
| chip | 0.4rem | 0.9rem / 48px 高 |

## 6. 动效（Motion）

- **动效语言**：一次性开机——状态条/面板淡入、内容轻微上浮、玻璃球与气泡落定；之后页面静止，只有交互态的短促抬起。
- **入场**：`.aero-boot` `opacity 0 → 1` + `translateY(12px) → 0`，700ms，`cubic-bezier(0.22, 0.61, 0.24, 1)`，按 `--ae-delay` 0 / 90 / 180 / 270ms 错落；只播一次。
- **滚动显现**：共享 `Reveal`；分区与窗口 `data-reveal`；`html[data-reveal-ready]` 是唯一隐藏门控；窗口第 2/3 项错落 70 / 140ms。
- **交互**：Dock 按钮 hover 抬起 2px、阴影加深；窗口 hover 抬起 2px；只动 `transform` / `box-shadow` / 颜色。
- **减动态**：`prefers-reduced-motion: reduce` 下关闭入场、显现位移与 hover 位移；内容始终可见。
- **不做**：无限气泡、滚动劫持、光标替换、自动播放声音、设计专属 JS、`filter` / `clip-path` 动画。

## 7. 响应式

- **≥1440px**：设备 74rem 居中；Hero 两列；窗口三列。
- **1024–1439px**：Hero 两列；窗口三列/两列（内容宽度不足时按断点降）。
- **768–1023px**：Hero 单列；玻璃球缩到 14rem；窗口两列。
- **≤760px**：窗口单列；状态条换行；姓名降到 `clamp(2.4rem, 12vw, 3.4rem)`；页脚纵向。
- **≤420px**：设备宽度 `calc(100% - 1.25rem)`；Dock 按钮整行；时间线期间换行。
- **375×812**：正文 16px；无横向滚动；长 URL / 长词 `overflow-wrap: anywhere`。
- 触控（`pointer: coarse`）：Dock / 消息链接 ≥48px；桌面 hover 效果只在 `(hover: hover) and (pointer: fine)` 生效。

## 8. 无障碍

- 姓名是唯一 `h1`；分区标题 `h2`；窗口标题 `h3`；层级 h1 → h2 → h3 不跳级。
- 每个 `<section>` 都有 `aria-labelledby` 指向同区可见标题（Hero 指向 `#ae-name`）。
- 装饰全部 `aria-hidden`：玻璃球、气泡、天空/云/草坡、状态点、窗口三点、计数。链接可访问名只由文本标签承担。
- 焦点：`.aero a:focus-visible { outline: 3px solid var(--ae-accent-ink); outline-offset: 3px }`；深色消息面板内用白色焦点环。
- 不靠颜色单独传达状态；链接始终带下划线/文字标签。
- 对比度：正文 ≥6.38:1（天空底）/ ≥8.00:1（纸白底）；弱化档 ≥5.21:1；大字号展示 ≥10:1；非文字线条 ≥3:1。
- 键盘顺序 = DOM 顺序；无 `tabindex` 把戏；无隐藏可聚焦元素。

## 9. 内容映射与取舍

| 资料字段 | 本设计的角色 | 呈现 |
|---|---|---|
| `name` | 设备名 / 开机标识 | `h1` + 状态条设备名 |
| `headline` | 产品标语 | Hero 副题 |
| `bio` | About this device | Hero 正文 |
| `links` | 桌面图标 / 工具栏 | 凝胶按钮组 |
| `projects` | 窗口 / 相册 | 窗口卡片 |
| `experience` | 系统时间线 | 时间线 |
| `skills` | 功能 | 胶囊徽章 |
| `contact` | 发送消息 | 深色消息面板 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 状态条地点 | 缺失时显示 `t.local`，不虚构地名 |

- **不呈现**：`avatar`；图标映射 `links[].icon`（本设计用文字首字母圆标，不引入图标语言）。
- **不虚构**：页脚只有姓名 + 「示例资料・仅作演示」声明；不补写任何未在资料中出现的事实。
- **语言入口**：由共享操作菜单承担；页面不渲染 `<LanguageSwitcher>`，也没有设计内切换入口。

## 10. Do / Don't

### Do

- Do 用饱和天空/草绿 + 强高光 + 凝胶质感建立 2000s 科技乐观。
- Do 让姓名成为设备名/开机标识，信息像图标和窗口一样排列。
- Do 用玻璃球作为唯一 Hero 视觉锚点；它的稀少就是它的强调。
- Do 让窗口标题栏只是装饰容器，不伪造可交互的系统控件。
- Do 在 ≤760px 单列重排，保证 375px 可读、无横向滚动。
- Do 把每个字体栈写全回退，系统 CJK 排在 Zhuque 之后。

### Don't

- Don't 做 90 年代表格/像素/彩虹分隔线/闪烁 GIF 语汇。
- Don't 做 Apple 毛玻璃大模糊；大面积 `backdrop-filter` 是 `frost` 的领域。
- Don't 用 Windows/Apple 商标、真实系统截图、开始菜单/任务栏复刻。
- Don't 让窗口三点、状态条看起来像可点击控件；不加入 focusable 假按钮。
- Don't 加无限气泡、滚动劫持、光标替换或设计专属 JS。
- Don't 新增字体、图片、第三方依赖。
- Don't 在 `Preview.astro` 里 import `style.css`、写 `:root`、渲染 `<Font>` 或放可聚焦元素。

## 11. 验证

按 `.agents/skills/design-page-verify/SKILL.md` 执行：构建、CSS 隔离、5 语言、1440 / 768 / 375×812、键盘与焦点、减动态 / 无 JS / 无 IO、对比度、预览、dist 体积。当前状态见 `docs/verification/aero.md`。
