# Transit — 交通导视

> **来源**：自产（`self-produced`）。本规范先于实现；实现与规范不一致时先改规范。
>
> **一句话**：把个人资料做成一张城市轨道网络图 + 站台导视——线路色带、站点圆点、换乘、方向箭头、站台牌与时刻表；姓名是终点站，项目是站点，经历是时刻表。

## 1. 设计隐喻

不是政务网页，也不是工业仪表。它是 **一张城市轨道网络图 + 站台导视**：浅色纸面上的线路、站点、换乘节点、方向箭头、站台牌和时刻表。个人资料被组织成一张可读的网络。

三条不可让渡的骨架：

1. **直角与网格优先**：所有结构都由 1px 线、矩形色带、站点圆点和模块网格表达；不用圆角卡片、玻璃、软阴影。
2. **线路色是编码，不是装饰**：一种线路色 + 编号/名称共同承担识别；颜色永不单独承载信息。
3. **信息姿态是“导航”**：页面像一张可读的线路图，而不是仪表盘；不做 KPI、图表、数据卡片。

## 2. 色板

所有色值只在 `tokens.css` 定义一次（`--tr-*`），作用域 `:is(.transit, .transit-pv)`。对比度为 WCAG 2.x 相对亮度公式实算（2026-11-02，node 一次性脚本）。

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--tr-paper` | `#f5f4ef` | 页面/卡片底 | 墨 `#101418` **16.80:1** |
| `--tr-paper-2` | `#e9e7de` | 次级面/悬停底 | 墨 **14.6:1**（实施时复算） |
| `--tr-paper-3` | `#dedbd0` | 深色面板上的弱化文字 | 对 `#101418` 约 **12:1** |
| `--tr-ink` | `#101418` | 主文字/网络条线 | 纸 **16.80:1** |
| `--tr-ink-soft` | `#3b4248` | 次级正文 | 纸约 **10:1** |
| `--tr-muted` | `#5d646b` | 弱化元信息 | 纸约 **6:1** |
| `--tr-line` | `#0b7a5c` | 主线（绿）/徽章/焦点 | 纸 **4.82:1**；白字 **5.31:1** |
| `--tr-line-2` | `#d7263d` | 第二线（红） | 纸 **4.50:1**；白字 **4.96:1** |
| `--tr-line-3` | `#f2b705` | 第三线（黄） | 纸约 **1.9:1**，**只做非文字/深色字底** |
| `--tr-rule` | `#c9c7bd` | 1px 网格/分隔线 | 装饰，≥3:1 非文字 |
| `--tr-accent` | `#0b7a5c` | 焦点环 | 纸 **4.82:1** |

- 线路色只用于色带/圆点/边框；正文与线路名用 ink。
- 黄色线永不承载白字；黄色徽章用 ink 字。
- 白字 on 线路色只用于 ≥18.66px bold / ≥24px 大字号；小字用 ink on paper。
- 任何新增色值先算对比度、登记本表，再进 `tokens.css`。

## 3. 字体（六项记录）

1. **隐喻与特征**：交通导视需要中性、清晰、可压缩的 grotesque 正文，以及机械感的站码/时刻数字；中文要有稳定覆盖，不为风格新增字体。
2. **角色分配**：
   - 展示 / 正文：`Inter`（拉丁）+ 现有 CJK 核心
   - 站码 / 期间 / 网络元信息：`JetBrains Mono`（拉丁）+ 现有 CJK 核心
3. **为什么是它们**：Inter 的中性无衬线与导视系统同源，且是项目既有 npm family；JetBrains Mono 为站码/时刻提供机械感；CJK 核心保证五语言覆盖。未新增字体资源。
4. **实际覆盖**：Inter / JetBrains Mono 覆盖拉丁 ASCII 与常用标点；`Zhuque Fangsong` 按 GB2312 / JIS 参考集承接简中、日文与共享汉字；`zh-TW` 使用 `Noto Sans TC`；`ko` 使用 `Gothic A1`；缺字时按第 6 项顺序回退系统 CJK。
5. **字重 / 轴 / 体积 / 许可**：Inter 使用 400–800；JetBrains Mono 使用 400–700；Zhuque / Noto Sans TC / Gothic A1 使用常规字重。全部为项目已启用的生产 family，本设计不新增字体资源、不附 `SOURCE-LICENSE.txt`。
6. **回退顺序**（与 `style.css` / `Preview.astro` 逐字一致）：
   - 展示 / 正文：`var(--font-inter), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`
   - 站码 / 时刻：`var(--font-jetbrains-mono), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', monospace`

> 实施约束：每个 `font` / `font-family` 都写完整显式回退；系统 CJK 一律排在 `var(--font-zhuque)` 之后；每个字体变量栈（含预览）都保留 `var(--font-zhuque)`。非 zh-TW 页面注册 `--font-gothic-a1` 作为伴生槽位，保证变量完整；zh-TW 由 `html:lang(zh-TW)` 重映射。

## 4. 版式

- **外壳**：`--tr-max: 72rem`；宽度 `min(72rem, calc(100% - 2 * --tr-pad))`，居中；1px 边框 + 极浅外阴影；直角。
- **背景**：纸底 + 1.5rem 点阵网格（radial-gradient），只做测量纸/地图质感，不承载信息。
- **网络条**：绿色 T 徽章 + `TRANSIT` + 城市路网；右侧地点 + 终点站；2px 下边框。
- **Hero**：两列 `minmax(0, 1.15fr) minmax(0, .85fr)`；左列 kicker / 姓名 / headline / bio；右列装饰线路图（绿色主线 + 红色支线 + 4 个站点圆点 + 站码）；≤1024 单列。
- **分区**：1px 上边线 + 编号方块 + 标题 + 计数；线路列表为行式链接；站点为三列卡片；时刻表为两列行式列表；徽章为胶囊；售票处为深色面板。
- 字号：姓名 `clamp(2.8rem, 7.5vw, 6.5rem)` / 0.98；headline `clamp(1.05rem, 1.9vw, 1.35rem)`；bio 0.98rem / 1.8；分区标题 `clamp(1.4rem, 3vw, 2.1rem)`；正文 0.9–1rem。
- 无圆角卡片、无玻璃、无软阴影；体积感来自线路色带、1px 框和深色售票处。

## 5. 组件

- **网络条（`.tr-network`）**：T 徽章、网络名、地点/终点站；2px 黑线。
- **线路图（`.tr-diagram`）**：装饰性；绿色主线、红色支线、四个站点圆点、站码；`aria-hidden`；不承载信息。
- **线路链接（`.tr-line-link`）**：三列（线路码 / 标签 / 箭头），左侧 0.4rem 线路色带；min-height 52px；hover 右移 3px。
- **站点卡（`.tr-station`）**：站点码 + 圆点 + 标题 + 描述 + 标签；三列 → 两列 → 单列。
- **时刻表（`.tr-timetable`）**：左期间列（等宽）+ 右侧机构/角色/描述；2px 上边框 + 1px 行分隔；窄屏单列。
- **线路徽章（`.tr-badge`）**：胶囊 + 线路色圆点；非交互。
- **售票处（`.tr-ticket`）**：深色面板、纸白字、绿色顶边；邮箱主链接；无 email/note 时整块不渲染。
- **页脚**：等宽小字；姓名 + 可选站点声明。

### 5.1 切换页预览的缩略档位（`Preview.astro`）

预览是装饰性缩略（16/10，`min-height: 9rem`），保留网络条、线路码、站点圆点与线路色带；按下列档位整体缩小：

| 元素 | 预览值 | 正式页值 |
|---|---|---|
| 网络条 | 0.42rem | 0.72rem |
| 姓名 | 0.94rem | `clamp(2.8rem, 7.5vw, 6.5rem)` |
| headline | 0.46rem / 2 行截断 | `clamp(1.05rem, 1.9vw, 1.35rem)` |
| 线路图 | 5.2rem 宽 / 3.2rem 高 | `min-height: 16rem` |
| 线路码 | 0.36rem | 0.66rem |

## 6. 动效（Motion）

- **动效语言**：一次性线路展开 + 站点点亮；之后页面静止，只有交互态的短促右移。
- **入场**：`.tr-rise` `opacity 0 → 1` + `translateY(10px) → 0`，520ms，按 `--tr-delay` 0 / 80 / 160 / 240ms 错落；只播一次。
- **线路展开**：`.tr-diagram-line` `scaleX(0) → 1`，600ms，只播一次；不使用 `stroke-dashoffset`。
- **滚动显现**：共享 `Reveal`；分区与站点 `data-reveal`；`html[data-reveal-ready]` 是唯一隐藏门控；站点第 2/3 项错落 50 / 100ms。
- **交互**：线路链接 hover 右移 3px、底纸加深；站点 hover 底纸加深；只动 `transform` / 颜色。
- **减动态**：关闭入场、线路展开与 hover 位移；内容始终可见。
- **不做**：无限翻牌、滚动劫持、光标替换、自动播放声音、设计专属 JS、`filter` / `clip-path` 动画。

## 7. 响应式

- **≥1440px**：外壳 72rem；Hero 两列；站点三列。
- **1024–1439px**：Hero 两列；站点三列/两列。
- **768–1023px**：Hero 单列；线路图 13rem；站点两列。
- **≤760px**：外壳 `calc(100% - 1.25rem)`；站点单列；时刻表单列；网络条可换行；页脚纵向。
- **375×812**：正文 16px；无横向滚动；长 URL / 长词 `overflow-wrap: anywhere`；线路图站码在 ≤420px 隐藏。
- 触控（`pointer: coarse`）：线路链接 ≥52px；项目标题 / 售票处邮箱 ≥44px；hover 只在 `(hover: hover) and (pointer: fine)` 生效。

## 8. 无障碍

- 姓名是唯一 `h1`；分区标题 `h2`；站点标题 `h3`；层级 h1 → h2 → h3 不跳级。
- 每个 `<section>` 都有 `aria-labelledby` 指向同区可见标题（Hero 指向 `#tr-name`）。
- 装饰全部 `aria-hidden`：线路图、站点圆点、线路码、箭头、计数、平台标签。链接可访问名只由文本标签承担。
- 焦点：`.transit a:focus-visible { outline: 3px solid var(--tr-accent); outline-offset: 3px }`；深色售票处内用纸白焦点环。
- 线路色不单独承载信息：线路名/编号始终可见；色盲安全。
- 对比度：正文 ≥6:1（纸底）；弱化档 ≥6:1；大字号展示 ≥10:1；非文字线条 ≥3:1。
- 键盘顺序 = DOM 顺序；无 `tabindex` 把戏；无隐藏可聚焦元素。

## 9. 内容映射与取舍

| 资料字段 | 本设计的角色 | 呈现 |
|---|---|---|
| `name` | 终点站 / 线路名 | `h1` + 网络条 |
| `headline` | 服务说明 | Hero 副题 |
| `bio` | 网络公告 | Hero 正文 |
| `links` | 线路 / 换乘 | 线路链接列表 |
| `projects` | 站点 | 站点卡片 |
| `experience` | 时刻表 | 行式时刻表 |
| `skills` | 线路徽章 | 胶囊徽章 |
| `contact` | 售票处 | 深色面板 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 网络条地点 | 缺失时显示 `t.local`，不虚构地名 |

- **不呈现**：`avatar`；图标映射 `links[].icon`（本设计用线路码 + 文字，不引入图标语言）。
- **不虚构**：页脚只有姓名 + 「示例资料・仅作演示」声明。
- **语言入口**：由共享操作菜单承担；页面不渲染 `<LanguageSwitcher>`。

## 10. Do / Don't

### Do

- Do 用 1px 线、直角、线路色带和站点圆点建立导视语言。
- Do 让姓名成为终点站，项目成为站点，经历成为时刻表。
- Do 让线路色 + 编号/名称共同承担识别。
- Do 在窄屏把线路/时刻表重排为纵向单列，保证 375px 可读。
- Do 把字体栈写全回退，系统 CJK 排在 Zhuque 之后。

### Don't

- Don't 做政务 Web 的蓝幅/黄 focus/表单语言；那是政务服务的语言，不是交通导视。
- Don't 做深色工业 HUD/ASCII 波形/扫描线；那是 `oxide`。
- Don't 做 KPI、图表、数据卡或仪表盘。
- Don't 用线路色单独承载信息；Don't 用黄色线承载白字。
- Don't 用圆角卡片、玻璃、软阴影或发光效果。
- Don't 加无限翻牌、滚动劫持、光标替换或设计专属 JS。
- Don't 新增字体、图片、第三方图标库。
- Don't 在 `Preview.astro` 里 import `style.css`、写 `:root`、渲染 `<Font>` 或放可聚焦元素。

## 11. 验证

按 `.agents/skills/design-page-verify/SKILL.md` 执行：构建、CSS 隔离、5 语言、1440 / 768 / 375×812、键盘与焦点、减动态 / 无 JS / 无 IO、对比度、预览、dist 体积。当前状态见 `docs/verification/transit.md`。
