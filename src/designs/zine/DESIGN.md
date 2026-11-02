# Zine — Riso / 复印朋克

> **来源**：自产（`self-produced`）。本规范先于实现；实现与规范不一致时先改规范。
>
> **一句话**：把个人资料做成一本 photocopied 地下小杂志——2–3 个专色、错位套印、颗粒、复印条纹、剪贴标题、手写圈注与邮购回执；粗糙可以，但阅读顺序必须清楚。

## 1. 设计隐喻

不是丝网印刷海报，也不是热敏小票。它是一本 ** photocopied 地下小杂志**：刊头、期号、宣言、分类广告、跨页、贡献者注记、印章与邮购回执。纸面有复印条纹和颗粒，标题有错位套印，胶带和裁切线让页面像被手工装订过。

三条不可让渡的骨架：

1. **正文永远墨色**：荧光红/粉只做装饰、大字、印章和底纹；正文与描述一律 `--zn-ink` / `--zn-ink-soft`。
2. **错位不复制正文**：错位套印只作用于刊名/标题/标签的装饰层；正文不偏移、不叠影。
3. **纹理不抢阅读**：复印条纹与颗粒低透明度、层数受控；不做闪烁、无限 marquee 或全页噪点。

## 2. 色板

所有色值只在 `tokens.css` 定义一次（`--zn-*`），作用域 `:is(.zine, .zine-pv)`。对比度为 WCAG 2.x 相对亮度公式实算（2026-11-02，node 一次性脚本）。

| 令牌 | 色值 | 用途 | 实测对比度 |
|---|---|---|---|
| `--zn-paper` | `#f3efe6` | 纸底 | 墨 `#111111` **16.46:1** |
| `--zn-paper-2` | `#e8e2d5` | 次级纸面/跨页卡 | 墨约 **14.5:1**（实施时复算） |
| `--zn-paper-3` | `#ded6c5` | 更深纸面 | 墨约 **13:1** |
| `--zn-ink` | `#111111` | 主文字 | 纸 **16.46:1** |
| `--zn-ink-soft` | `#2b2b2b` | 次级正文 | 纸约 **13:1** |
| `--zn-red` | `#ff3b5c` | 荧光红：装饰/大字/印章底 | 纸 **3.03:1**，**只做装饰/大字** |
| `--zn-red-ink` | `#c81e3a` | 深红：链接/小字/焦点 | 纸 **4.94:1**；白字 **5.67:1** |
| `--zn-blue` | `#1f4bff` | 第二专色：链接/装饰 | 纸 **5.22:1** |
| `--zn-pink` | `#ff8fb1` | 可选第三专色：装饰 | 只做装饰 |
| `--zn-rule` | `#b9b2a4` | 1px 分隔线 | 装饰 |
| `--zn-rule-strong` | `#6f6a5e` | 虚线/边框 | 装饰，≥3:1 非文字 |

- 荧光红/粉永远不写正文；正文用 `--zn-ink`。
- 小字链接用深红 **4.94:1** 或蓝色 **5.22:1**；同页只保留一个链接色。
- 任何新增色值先算对比度、登记本表，再进 `tokens.css`。

## 3. 字体（六项记录）

1. **隐喻与特征**：地下小杂志需要窄、重、像刊头的展示字，打字机/等宽标签，以及能读长文的正文字；中文要保证覆盖，不为风格新增字体。
2. **角色分配**：
   - 展示（刊名 / 分区标题 / 邮购标题）：`League Gothic`（拉丁）+ 现有 CJK 核心
   - 正文（headline / bio / 描述 / 经验）：`Inter`（拉丁）+ 现有 CJK 核心
   - 标签 / 期号 / 分类广告 / 页脚：`Courier Prime`（拉丁）+ 现有 CJK 核心
3. **为什么是它们**：League Gothic 的窄体重字面是 zine 刊头/海报的骨架；Inter 在小字号长文下稳定；Courier Prime 提供打字机/分类广告的机械感；三者都是项目既有 family。未新增字体资源。
4. **实际覆盖**：League Gothic / Inter / Courier Prime 覆盖拉丁 ASCII 与常用标点；`Zhuque Fangsong` 按 GB2312 / JIS 参考集承接简中、日文与共享汉字；`zh-TW` 使用 `Noto Sans TC`；`ko` 使用 `Gothic A1`；缺字时按第 6 项顺序回退系统 CJK。
5. **字重 / 轴 / 体积 / 许可**：League Gothic 单字重；Inter 使用 400–800；Courier Prime 使用 400–700；Zhuque / Noto Sans TC / Gothic A1 使用常规字重。全部为项目已启用的生产 family，本设计不新增字体资源、不附 `SOURCE-LICENSE.txt`。
6. **回退顺序**（与 `style.css` / `Preview.astro` 逐字一致）：
   - 展示：`var(--font-league-gothic), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`
   - 正文：`var(--font-inter), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`
   - 标签：`var(--font-courier-prime), var(--font-gothic-a1), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', monospace`

> 实施约束：每个 `font` / `font-family` 都写完整显式回退；系统 CJK 一律排在 `var(--font-zhuque)` 之后；每个字体变量栈（含预览）都保留 `var(--font-zhuque)`。非 zh-TW 页面注册 `--font-gothic-a1` 作为伴生槽位；zh-TW 由 `html:lang(zh-TW)` 重映射。

## 4. 版式

- **纸面**：`--zn-max: 72rem`；宽度 `min(72rem, calc(100% - 2 * --zn-pad))`，居中；1px 实线 + 内侧虚线裁切框；纸底 + 5px 周期复印条纹 + 3px 颗粒。
- **刊头**：期号（荧光红底）+ ZINE + 地点；刊名为 League Gothic 巨字，红/蓝两层错位副本 + 墨色主层；下方 cover line（headline）。
- **宣言**：bio 68ch，首字母 drop cap（荧光红，装饰）；分区标题为窄体大写 + 黑色编号。
- **分类广告**：两列 dotted-leader 行；序号深红、链接墨色下划线、箭头蓝色。
- **跨页**：三列卡片，交替纸色与 ±0.4° 旋转；编号荧光红底；标签等宽小字。
- **贡献者注记**：左侧 period（深红等宽），右侧机构/角色/描述；3px 黑色顶线。
- **印章**：技能为旋转描边标签，红/蓝/虚线三态。
- **邮购回执**：虚线边框 + 右上角裁切提示；邮箱深红大链接。
- **页脚**：3px 黑色顶线；姓名 + 可选站点声明；等宽小字大写。

## 5. 组件

- **刊名（`.zn-name`）**：主层 + 红/蓝两层 `aria-hidden` 绝对定位副本；错位 0.03–0.035em；≤420px 收窄错位。
- **胶带（`.zn-tape`）**：两条静态半透明胶带，`aria-hidden`；窄屏隐藏。
- **分类广告（`.zn-ad`）**：三列（序号 / 链接 / 箭头）；min-height 48px；hover 纸底加深。
- **跨页卡（`.zn-spread`）**：纸色交替 + 轻微旋转；标题链接下划线蓝色；标签等宽。
- **印章（`.zn-stamp`）**：2px 描边 + 旋转；非交互。
- **邮购回执（`.zn-coupon`）**：2px 虚线边框；cut-here 标签旋转；邮箱主链接。
- **复印扫描带（`.zn-sheet::before`）**：一次性低透明度红/蓝渐变扫过；`pointer-events: none`；减动态隐藏。

### 5.1 切换页预览的缩略档位（`Preview.astro`）

预览是装饰性缩略（16/10，`min-height: 9rem`），保留刊头、错位刊名与两枚分类广告 chip；按下列档位整体缩小：

| 元素 | 预览值 | 正式页值 |
|---|---|---|
| 期号 | 0.36rem | 0.72rem |
| 刊名 | 1.45rem | `clamp(4rem, 15vw, 11rem)` |
| headline | 0.46rem / 2 行截断 | `clamp(1.1rem, 2.2vw, 1.55rem)` |
| chip | 0.36rem | 0.9rem |
| 刊头线 | 2px | 4px |

## 6. 动效（Motion）

- **动效语言**：复印机扫过 + 印章落下；之后页面静止，只有交互态的短促颜色/位移。
- **入场**：`.zn-rise` `opacity 0 → 1` + `translateY(8px) → 0`，520ms，只播一次。
- **复印扫描**：`.zn-sheet::before` 一次 900ms 的低透明度红/蓝扫过；`opacity` 基态 0；减动态不播。
- **滚动显现**：共享 `Reveal`；分区与跨页 `data-reveal`；`html[data-reveal-ready]` 是唯一隐藏门控；跨页第 2/3 项错落 50 / 100ms。
- **交互**：分类广告 hover 纸底加深；跨页 hover 回正 + 上移 2px；只动 `transform` / 颜色。
- **不做**：无限 marquee、闪烁/频闪、滚动劫持、光标替换、自动播放声音、设计专属 JS、`filter` / `clip-path` 动画。
- **减动态**：关闭入场、扫描与 hover 位移；内容始终可见。

## 7. 响应式

- **≥1440px**：纸面 72rem；跨页三列；分类广告两列。
- **1024–1439px**：跨页三列/两列；分类广告两列。
- **768–1023px**：跨页两列；分类广告单列。
- **≤760px**：纸面 `calc(100% - 1.25rem)`；跨页单列；注记单列；胶带隐藏；页脚纵向。
- **≤420px**：纸面 `calc(100% - 1rem)`；错位收窄；分类广告箭头隐藏。
- **375×812**：正文 16px；无横向滚动；长 URL / 长词 `overflow-wrap: anywhere`。
- 触控（`pointer: coarse`）：分类广告 ≥48px；跨页标题 / 邮购邮箱 ≥44px；hover 只在 `(hover: hover) and (pointer: fine)` 生效。

## 8. 无障碍

- 姓名是唯一 `h1`；分区标题 `h2`；跨页标题 `h3`；层级 h1 → h2 → h3 不跳级。
- 每个 `<section>` 都有 `aria-labelledby` 指向同区可见标题（Hero 指向 `#zn-name` 所在的刊头）。
- 装饰全部 `aria-hidden`：刊名错位副本、期号、胶带、裁切提示、编号、箭头、印章底纹。链接可访问名只由文本标签承担。
- 焦点：`.zine a:focus-visible { outline: 3px solid var(--zn-red-ink); outline-offset: 3px }`。
- 荧光红/粉不承载正文；小字链接用深红/蓝（≥4.5:1）；不以颜色单独传达状态。
- 对比度：正文 ≥13:1；弱化档 ≥13:1；大字号展示 ≥16:1；非文字线条 ≥3:1。
- 键盘顺序 = DOM 顺序；无 `tabindex` 把戏；无隐藏可聚焦元素。

## 9. 内容映射与取舍

| 资料字段 | 本设计的角色 | 呈现 |
|---|---|---|
| `name` | 刊名 / Masthead | `h1` + 错位装饰层 |
| `headline` | Cover line | 刊头副题 |
| `bio` | Manifesto | 宣言块 + drop cap |
| `links` | Classifieds | 分类广告列表 |
| `projects` | Spreads | 跨页卡片 |
| `experience` | Contributor notes | 贡献者注记 |
| `skills` | Stamps | 印章标签 |
| `contact` | Mail-in coupon | 邮购回执 |
| `avatar` | 不呈现 | 避免图片管线 |
| `location` | 期号/地点行 | 缺失时显示 `t.local`，不虚构地名 |

- **不呈现**：`avatar`；图标映射 `links[].icon`（用文字/箭头，不引入图标语言）。
- **不虚构**：页脚只有姓名 + 「示例资料・仅作演示」声明；不抄真实杂志刊头、品牌 Logo、ISBN/条码。
- **语言入口**：由共享操作菜单承担；页面不渲染 `<LanguageSwitcher>`。

## 10. Do / Don't

### Do

- Do 用荧光红/粉 + 墨 + 纸白建立 Riso 专色感；正文永远墨色。
- Do 让刊名成为页面最响的元素，但保持 headline / bio 的阅读顺序。
- Do 用错位套印、颗粒、复印条纹和剪贴建立“被复印过”的物理感。
- Do 在窄屏单列重排，保证 375px 可读、无横向滚动。
- Do 把字体栈写全回退，系统 CJK 排在 Zhuque 之后。

### Don't

- Don't 用荧光红/粉写正文；Don't 让错位复制正文。
- Don't 做无限 marquee、闪烁/频闪、滚动劫持或全页噪点。
- Don't 抄真实杂志刊头、品牌 Logo、ISBN/条码。
- Don't 做成丝网印刷海报（那是 `poster`）或热敏小票（那是 `receipt`）。
- Don't 用大面积黑色块或圆角卡片；保持纸、专色、剪贴。
- Don't 加设计专属 JS、字体、图片、第三方图标库。
- Don't 在 `Preview.astro` 里 import `style.css`、写 `:root`、渲染 `<Font>` 或放可聚焦元素。

## 11. 验证

按 `.agents/skills/design-page-verify/SKILL.md` 执行：构建、CSS 隔离、5 语言、1440 / 768 / 375×812、键盘与焦点、减动态 / 无 JS / 无 IO、对比度、预览、dist 体积。当前状态见 `docs/verification/zine.md`。
