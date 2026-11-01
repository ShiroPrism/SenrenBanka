# verification — oxide（厂商来源：oxidecomputer/design-system，MPL-2.0）

> **2026-11-01 韩语覆盖（C3）**：新增 `/ko/oxide/` 与韩语文案；375×812 / 1280×800 冒烟通过（`lang=ko`、韩语字体加载、无横向溢出、0 console）；文案已人工审校（用户确认 2026-11-01）。

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 厂商快照 `DESIGN.md` 只读；实现偏离与增补记录在 `docs/designs/oxide/ADAPTATION.md`。
> 最近全流程验证：2026-10-10（v0.4.0 动效全流程）；v0.5.0–0.5.1 菜单改动的全站回归已复核本页；2026-10-11 文档治理迁移，无页面代码改动；2026-10-11 v0.5.3 链接标记按配置化的聚焦回归已复核本页。

## 构建与产物

- `npm run build` 7 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过。
- CSS 隔离成立：本页恰 1 条自身样式链接；`.ox-*` 选择器只出现在自身 CSS；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确；`rel="preload"` 计数 0；无外链资源（`src="http` = 0）。
- 图标（不含共享菜单 chrome）：4 枚（品牌 mark ×2 / Mail ×2），全部 `aria-hidden`；未配置 icon 的链接不打标（2026-10-11 修订，Globe 残留 0）。

## 结构、内容与 a11y

- 核心字段 `name` / `headline` / `bio` / `links` 全部渲染；扩展区块取舍见 `DESIGN.md` Project Contract。
- 两轴「Visible grids」网格底纹为设计特征（对应检测器例外的来源，见下）；CHANNELS 链接列表按配置逐条标记（5/5 渲染）。
- 分区具名：hero / channels 两栏 / capabilities / deployments / operations / footer 共 6 处 `aria-labelledby`（指向同区可见标签）；`.ox-columns` 为布局 `<div>`、两栏为具名 `<section>`。
- 装饰符 `●` / 全部 `▸` `aria-hidden`；链接可访问名干净（实测 `GitHub` / `Email`，不以前缀装饰符开头）。
- 响应式：桌面 `.ox-columns` 两列 → 375px 单列。

## 对比度（最近实测）

- dim / label 档 **5.76:1**、name **17.41:1**、body **9.97:1**、number **10.35:1**（2026-10-10 口径；该轮工具链对 oklch 未重算，色值未改动时沿用）。
- 每次新增 / 调整色值必须实测并更新本表。

## 动效（Motion language「仪表」）

- 入场（纯 CSS）：hero 4 项 260ms `ease-out`、40ms 错落（`translateY(10px)`）；列表行 30ms 错落（上限 5）。
- 滚动显现：`.ox-columns` 整块 + 项目/经历行 + 页脚（v0.4.0 纳入）；只播一次。
- 顶部 2px 滚动进度线：CSS Scroll-Driven（`animation-timeline: scroll(root)`），`@supports` 门控；**压缩器会把 `animation-timeline` 合并进 `animation` 简写导致整条失效——以 `var()` 传入 timeline 阻断合并后实测生效**（top `scaleX(0)` → 中位 `0.5004` → 底 `1`）；不支持 / 减动态时整条隐藏（默认态即"无此元素"）。
- ASCII 波形流动：顶部与页脚两处，32s linear、4 份首尾相接无缝循环（实测 1.5s 内位移推进：顶部 −21.6→−56.6、页脚 −18.8→−49.3）；移动端仍流动；减动态静止。
- 链接 / 交换态 150ms ease 颜色过渡（快照 "plain ease for hover and color"）。
- 契约：跳转式滚动兜底后隐藏元素 **0**（6/6）；reduced-motion 全关；无 JS / 无 IO / 脚本抛错四情形隐藏元素均 **0**。

## 触控与移动端（375×812 + 触控仿真）

- `pointer: coarse` 生效；零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度实测 min **44.8px**（`.ox-link` 47.2px）；`@media (pointer: coarse)` 纵向 padding 0.95rem；`.ox-row-title a` 的下划线在触控下改用同色 `text-decoration`。

## 检测器（impeccable）

- 最近状态：**1 条已记录例外**——`codex-grid-background` advisory（两轴网格底纹源自快照 "Visible grids" 原则，有意保留；2026-10-10 确认）；该信号同时作为检测器**有效性反证**目标。除此之外零发现。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：等宽频道标签、ASCII 波形、发丝分隔与青绿信号点；缩略版保留“仪表读数”而非首屏大段落。
- **令牌抽取**：背景、线、前景、品牌与强调色抽入 `tokens.css`，作用域 `:is(.ox, .ox-pv)`；正式页仅将同值 token 改到共享文件。
- **字体**：导出 `--font-geist` / `--font-geist-mono`，与正式页同源、由切换页按族去重；不新增字体族或 preload。
- **隔离**：预览不 import 正式页 `style.css`，无 `:root` 设计令牌、无可聚焦元素；本轮正式页字体栈按字体审计预期改变，不再沿用“与 HEAD 基线 sha256 相等”的旧等价结论。
- **检测器**：仍为 1 条 `codex-grid-background` 既有例外；预览未新增字号、颜色或圆角发现。

## 字体审计（2026-10-19）

- **接线**：`astro.config.mjs` 注册 Geist Variable / Geist Mono Variable → `Page.astro` 两个 `<Font>` → `style.css` `@theme inline` 别名 `--font-oxide` / `--font-oxide-mono`。浏览器实测 `document.fonts` 非空，两族均命中；不再保留无文件的 `SuisseIntl` / `GT America Mono` 字符串。
- **实际请求**：latin 主文件 Geist 约 29,400 B、Geist Mono 约 23,128 B；Geist Mono symbols2 约 5,812 B（波形块字符按需）。三语言均无第三方字体域名，0 preload。
- **覆盖与回退**：Geist 无 CJK / 假名；中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`。Geist Mono 覆盖 `▁▂▃▄▅▆▇█└─`，不覆盖 `● ■ → ▸ ↗ ▣ □ ○ ▲ ▶ ▼ ◀`；这些装饰由 `Segoe UI Symbol` / `Apple Symbols` 先行承接。页脚 `▸`、品牌 `●`、预览 `↗` 均保留原字符。
- **降级**：字体加载失败 / 断网时正文仍按系统无衬线可读；装饰符由系统符号字体承接或自然缺字，不改变可访问文本。预览文字允许触发 CJK 子集下载，但切换页不 preload。
- **记录归属**：厂商 `DESIGN.md` 未改；完整六项记录见 `docs/designs/oxide/ADAPTATION.md`「字体（2026-10-19 字体审计）」。

## 已定事项与历史修复要点（结论保留；过程与中间快照见 Git）

- 页脚 nowrap ASCII 波形横向溢出 → flex 子项 `min-width: 0` + 波形 `max-width: 100%`。
- a11y 收口：分区 `aria-labelledby` ×6、装饰符 `aria-hidden`（v0.2.x 演练暴露后修复）；`.ox-columns` 由 `<section>` 降为布局 `<div>`（CSS 无需改动）。
- 触控命中增强（v0.2.x 补）；页脚小波形补 `.ox-wave-track` 同步流动（v0.4.1）。
- 切换入口历史：v0.5.0 起页脚无切换入口，改由共享操作菜单承担（ADR 0004 → ADR 0007）。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 三语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 4 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎、横屏、200% 缩放未实测；滚动进度线在 Firefox stable（2026-10 仍在 flag 后）按设计整条隐藏，未在该引擎实证。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\`（`verify-v040-oxide-*`、`verify-0.4.1-oxide-footer-wave.png`、`verify-051-oxide-menu.png`、`verify-053-oxide-links.jpg` 等；为验证机器本地路径，未随仓库分发）。
