# Brutal — 新粗野告示板

> **来源**：自产（`self-produced`）。本规范先于实现；实现与规范不一致时先改规范。
>
> **一句话**：把个人资料做成一组贴在城市墙上的告示、货运标签和抗议海报——粗黑描边、硬偏移阴影、酸性高亮、超大字号，信息必须比装饰更响。

## 1. 设计隐喻

不是 90 年代个人主页，也不是印刷海报。它是一块**公共告示板**：纸张、胶带、印章、编号、粗体警告语；所有内容都像被钉在板子上。视觉可以吵，但阅读顺序必须清楚。

## 2. 色板

| 令牌 | 色值 | 用途 | 对比度备注 |
|---|---|---|---|
| `--bt-paper` | `#f2efe6` | 页面底色 | 墨黑文字约 18:1 |
| `--bt-paper-2` | `#e6e0d2` | 次级纸块 / 卡片交替 | 墨黑文字 ≥ 15:1 |
| `--bt-white` | `#fffdf7` | 卡片 / 标签底 | 墨黑文字 ≥ 18:1 |
| `--bt-ink` | `#0b0b0b` | 主文字、边框、阴影 | 纸底 ≥ 18:1 |
| `--bt-ink-soft` | `#2a2a2a` | 次级正文 | 纸底 ≥ 13:1 |
| `--bt-muted` | `#5a564c` | 弱化说明 / 页脚 | 纸底约 6.4:1 |
| `--bt-orange` | `#ff4d00` | 强调块 / 第一枚按钮 | 配墨黑约 5.4:1；**不配白字** |
| `--bt-blue` | `#1f4bff` | 链接 / 第二枚按钮 / 焦点 | 配白字约 8:1 |
| `--bt-acid` | `#d8ff00` | 贴纸 / 标签高亮 | 只配墨黑，约 16:1 |

- 酸性黄只作底色，正文不使用酸黄。
- 橙色上的文字只用墨黑；蓝色上的文字只用白/纸白。
- 任何新增色值必须先实测对比度并登记到本表。

## 3. 字体（六项记录）

1. **隐喻与特征**：告示板需要「远看是重块、近看能读」的字体。展示字要窄、重、紧；正文要中性、清晰；编号/标签要有机械感。CJK 需要一套能承接任意资料文字的核心字体，并保留古典/纸张气质以对抗过度光滑的屏幕感。
2. **角色分配**：
   - 展示（姓名 / 分区标题）：League Gothic（拉丁）+ Zhuque Fangsong（CJK）
   - 正文（headline / bio / 描述）：Inter Variable（拉丁）+ Zhuque Fangsong（CJK）
   - 标签 / 编号 / 页脚：JetBrains Mono（拉丁）+ Zhuque Fangsong（CJK）
3. **为什么是它们**：League Gothic 的窄体重字面是告示/海报的骨架；Inter 在小字号和长文下稳定；JetBrains Mono 提供编号与字段标签的机械感；Zhuque Fangsong 是项目现有核心 CJK 中唯一带明显书写/纸张气质的字体，能和粗黑边框形成「硬框 + 软字」的对照。未选择新字体，避免为风格增加许可与体积风险。
4. **实际覆盖**：League Gothic / Inter / JetBrains Mono 覆盖拉丁 ASCII 与常用标点；Zhuque Fangsong 按 catalog 的 GB2312 / JIS 参考集承接中文、日文与共享汉字。三者都不承诺覆盖生僻字；源字体缺字时按下方顺序回退系统 CJK。
5. **字重 / 轴 / 体积 / 许可**：展示用 League Gothic 单字重（大字号下不依赖多字重）；Inter 使用 500 / 700 / 900；JetBrains Mono 使用 500；Zhuque 使用常规字重。均为项目已启用的生产 family，许可已过闸门；本设计不新增字体资源。
6. **回退顺序**：
   - 展示：`var(--font-league-gothic), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', sans-serif`
   - 正文：`var(--font-inter), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', sans-serif`
   - 标签：`var(--font-jetbrains-mono), var(--font-zhuque), 'PingFang SC', 'Microsoft YaHei', monospace`

> 实施约束：每个 `font` / `font-family` 都必须写完整回退；`--font-*` 只暴露主 face；不得把系统 CJK 写进 Astro registration 的 fallback 数组。`npm run fonts:typography` 是门禁。

## 4. 版式

- 页面最大宽度 `72rem`，桌面内容左右留白由 `clamp(1.25rem, 4vw, 3.5rem)` 控制。
- 背景是一层极淡的 2rem 方格（墨色 6%），只作纸张/工程纸质感，不参与信息层级。
- 顶部条：姓名 / 索引 / 地点；4px 下边框；等宽小字大写。
- Hero：标签 → 巨型姓名 → headline → 告示块 → 链接按钮组；右上角一枚旋转贴纸（窄屏隐藏）。
- 分区：`01 / PROJECTS`、`02 / EXPERIENCE`、`03 / SKILLS`、`04 / CONTACT`；每个分区 4px 上边框；编号为黑底纸字方块。
- 分区标题用展示字体，`clamp(2rem, 5vw, 4rem)`；正文最大 68ch。

## 5. 组件

- **链接按钮**：3px 墨边、4px 硬阴影、最小高度 44px；橙/蓝/酸黄/纸白四色循环；hover 抬起 2px、阴影增至 6px；active 压回 2px、阴影 2px。
- **告示块**：4px 左边框 + 4px 硬阴影 + `paper-2` 底；左上角 `NOTICE` 等宽标签。
- **项目卡**：4px 墨边、8px 硬阴影、`paper` / `white` 交替；编号为酸黄小方块；标题链接下划线厚度 3px；标签为 2px 小框。
- **经历台账**：3px 上边框 + 2px 行分隔；org 粗体、role 常规、period 等宽；描述跨两列。
- **技能贴纸**：3px 墨边、4px 硬阴影、轻微旋转；只在小屏以上旋转，375px 取消旋转避免横向溢出。
- **联系框**：墨黑底、纸白字、酸黄链接、8px 橙红硬阴影；无 email 且无 note 时整个区块不渲染。
- **页脚**：4px 上边框；姓名 + 可选站点声明；等宽小字。

## 6. 动效（Motion）

- **动效语言**：硬切、短促、像贴纸被拍上去。不是淡入上移的通用动画。
- **入场**：Hero 子元素 `bt-snap`，180ms、`steps(2, end)`、`translate(-6px, 6px) → 0`；延迟 0 / 30 / 60 / 90ms；只播一次。
- **滚动显现**：共享 `Reveal`；分区与卡片 `data-reveal`；`html[data-reveal-ready]` 门控；180ms、位移 12px；卡片按 60ms 错落（上限 3 个）。
- **交互**：hover 抬起 / active 压回；只动 `transform` 与 `box-shadow`；颜色变化短促。
- **减动态**：`prefers-reduced-motion: reduce` 下关闭入场、显现位移与 hover/active 位移；内容始终可见。
- **禁止**：无限循环、滚动劫持、光标替换、自动播放声音、设计专属 JS。

## 7. 响应式

- `> 1024px`：项目三列；内容 72rem；hero 大字。
- `768–1024px`：项目两列；hero 字号略降。
- `640–768px`：项目一列；顶部条可换行；贴纸隐藏。
- `<= 640px`：技能贴纸取消旋转；按钮可整行；分区标题降档。
- `375px`：正文 16px 起、无横向溢出；URL / 长词 `overflow-wrap: anywhere`；触控目标 ≥44px。

## 8. 无障碍

- 每个 `<section>` 用 `aria-labelledby` 指向同区可见 `h2`；Hero 用 `h1`。
- 装饰编号、贴纸、箭头、方格背景 `aria-hidden` 或不进入可访问树。
- 焦点：`outline: 3px solid var(--bt-blue); outline-offset: 3px`；蓝底按钮上用酸黄焦点环。
- 不靠颜色单独传达状态；链接有下划线/箭头/文字标签。
- 键盘顺序 = DOM 顺序；无 `tabindex` 把戏。
- 正文与低强度文本对比度 ≥4.5:1；大字号展示文本 ≥3:1。

## 9. 内容映射与取舍

- **必渲染**：`name`、`headline`、`bio`、`links`。
- **条件渲染**：`projects`、`experience`、`skills`、`contact`；不存在时不渲染空区块。
- **省略**：`avatar` 不呈现（本设计以文字与色块为主，避免图片管线与外部 URL 差异）；`location` 在顶部条呈现（缺失时显示索引标签）。
- **不虚构**：可选站点声明、空状态文案只描述设计状态，不补写个人事实。
- **链接标记**：本设计不渲染 `links[].icon` 映射；以文字标签 + 箭头承担识别，避免图标风格分散粗野语言。

## 10. Do / Don't

### Do

- Do 让姓名成为页面最响的元素，但保持 headline / bio 的阅读顺序。
- Do 用 4px 边框、8px 硬阴影、酸黄标签建立「贴上去」的物理感。
- Do 让每个分区有编号和清晰标题；装饰可以吵，结构必须静。
- Do 在 375px 取消旋转、缩小阴影、保持 44px 触控目标。
- Do 用现有生产字体与纯 CSS 纹理；不新增图片。

### Don't

- Don't 做成 90s 网页（彩虹渐变、表格边框、闪烁 GIF 语汇）。
- Don't 用无限滚动 marquee、故障闪烁或鼠标跟随特效。
- Don't 把橙色配白字、酸黄配浅色字；Don't 用颜色单独表达链接状态。
- Don't 给每个标题机械加图标；Don't 引入第三方交互库。
- Don't 在 `Preview.astro` 里 import `style.css`、写 `:root` 或声明 `<Font>`。

## 11. 验证

实现完成后按 `.agents/skills/design-page-verify/SKILL.md` 执行，并更新 `docs/verification/brutal.md`：构建、1440/768/375px、键盘、对比度、减动态、无 JS、预览、`dist` 体积。
