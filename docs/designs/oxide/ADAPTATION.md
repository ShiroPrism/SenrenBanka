# oxide — 项目侧适配记录（ADAPTATION）

> `src/designs/oxide/DESIGN.md` 为厂商官方快照（[oxidecomputer/design-system](https://github.com/oxidecomputer/design-system)，MPL-2.0；许可声明见同目录 `SOURCE-LICENSE.txt`），**只读、不得修改**。
> 本文件记录项目实现相对快照的适配、增补与例外；当前验证状态见 `docs/verification/oxide.md`；归属规则见 `docs/README.md`。

## 动效（快照 Motion 章节范围内）

- 入场动画（hero 4 项 260ms `ease-out` / 40ms 错落）+ 共享滚动显现（行 30ms、上限 5）——依据快照 "Motion explains a change"；机制见 ADR 0001。
- 顶部 2px 滚动进度线（CSS Scroll-Driven、`@supports` 门控、零 JS；装饰性，**不用于内容显隐**）——参数与压缩器合并坑见 `docs/verification/oxide.md` 与 `change-log/0.4.0.md`。
- ASCII 波形流动（32s linear；顶部与页脚同轨）——依据快照 "ASCII can drive motion" 与 "linear 用于恒定动效"。
- 链接 / 切换态 150ms ease 颜色过渡——依据快照 "plain ease for hover and color"。

## 图标（ADR 0002）

- CHANNELS：品牌 mark（filled、本地 vendored SVG）替换原 `▸`；功能图标 Mail 采用 lucide **outlined**、1.5 描边（无 icon 配置不打标，2026-10-11 修订）——快照 Icons 章节允许 outlined variants。
- `▸` 保留于列表面之外的原生 affordance（页脚联系）；全部装饰符 `aria-hidden`。

## 字体（2026-10-19 字体审计）

快照要求 `SuisseIntl`（正文 / 标题）与 `GT America Mono`（UI chrome / 技术标记）的双声部，但两族均未随项目注册或加载；2026-10-19 浏览器实测 `document.fonts` 为空，计算值只是字体字符串，实际由系统字体静默兜底。两族不可再分发的原始副本不得入库，因此保留**文字声部 + 技术等宽声部**的关系，复用已核许可的 Geist 双族。

1. **隐喻与特征**: 工程仪表与可见网格 → 文字声部要中性、紧致、适合 15px 正文与 500 字重标题；技术声部要等宽、方硬，能承担大写频道标签、编号、状态徽章与 ASCII 波形。两族需同源或至少共享相近骨架，避免“正文一套、标签另一套”的拼贴感。
2. **角色分配**: 正文、标题、姓名、链接文字与页脚 = Geist Variable（`--font-oxide`）；频道标签、编号、徽章、行内标签、波形与页脚小波形 = Geist Mono Variable（`--font-oxide-mono`）。OKLCH 强调色只改变颜色，不改变声部分配。
3. **为什么是它而非其他**:
   - Geist 而非继续写 `SuisseIntl`：后者没有注册、没有 `<Font>`、没有可再分发文件，浏览器只会回退；继续保留字符串会把“未接线”伪装成字体选择。
   - Geist Mono 而非引入 GT America Mono 的未知副本：GT America Mono 的商用许可不允许直接随开源仓库再分发；Geist Mono 已在 kern 生产使用，许可与体积已核，且覆盖本页需要的 ASCII、块字符与数字。
   - 不新增第三种“艺术字体”：Oxide 的识别力来自网格、等宽大写、青绿信号与 ASCII 波形，而不是花体；新增展示字体只会扩大切换页并集，不能修复实际缺陷。
4. **实际覆盖与回退**:
   - Geist Variable：latin 95/95 ASCII、latin-ext；无 CJK / 假名。英文正文实测命中；简体中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`。
   - Geist Mono Variable：latin ASCII、数字与常用标点；symbols2 子集实测覆盖 `▁▂▃▄▅▆▇█└─`。不覆盖 `● ■ → ▸ ↗ ▣ □ ○ ▲ ▶ ▼ ◀`；这些装饰由 `Segoe UI Symbol` / `Apple Symbols` 先承接，再回退系统中日文字体。
   - 波形字符只用已覆盖的 U+2581–2588；页脚 `▸`、品牌 `●` 与预览箭头 `↗` 保留原设计字符，不靠改字规避缺字。
5. **字重 / 轴 / 体积 / 许可**: Geist Variable 为可变字体，站点使用 400–600 `wght`，latin 主文件约 29,400 B；Geist Mono Variable 使用 400–500，latin 主文件约 23,128 B、symbols2 约 5,812 B。两族均 OFL-1.1（无 RFN 障碍，原样分发）；均来自既有 `@fontsource-variable/*` npm 包，不新增依赖。
6. **缺失回退顺序**:
   - 文字：`--font-oxide → -apple-system → BlinkMacSystemFont → Segoe UI Symbol → Apple Symbols → PingFang SC → Microsoft YaHei → Hiragino Sans → Yu Gothic UI → Helvetica → Arial → sans-serif`。
   - 技术：`--font-oxide-mono → ui-monospace → SFMono-Regular → Menlo → Consolas → Segoe UI Symbol → Apple Symbols → PingFang SC → Microsoft YaHei → Hiragino Sans → Yu Gothic UI → monospace`。
   - 两条链都以系统中文与通用族收尾；字体加载失败、断网或无 JS 时正文与装饰仍可读。

## a11y 增补（快照未覆盖）

- 六个分区 `aria-labelledby` 指向同区可见标签（hero / channels 两栏 / 两个 section / footer）；`.ox-columns` 由 `<section>` 降为布局 `<div>`、两栏升为具名 `<section>`（CSS 无需改动）。
- 装饰符（`●`、全部 `▸`）不得进入链接可访问名。

## 触控增补（快照未规定）

- `@media (pointer: coarse)`：`.ox-link` 等纵向 padding 0.95rem（命中 min 44.8px）；`.ox-row-title a` 的下划线在触控下改用同色 `text-decoration`。

## 修复（实现层，非规范层）

- 页脚 nowrap ASCII 波形横向溢出 → flex 子项 `min-width: 0` + 波形 `max-width: 100%`。
- 页脚小波形此前静态（仅顶部有流动轨道）→ 补 `.ox-wave-track`（v0.4.1），两处同轨（减动态均静止）。

## 检测器例外

- `codex-grid-background` advisory ×1：两轴网格底纹源自快照 "Visible grids" 原则，**有意保留**（2026-10-10 经项目所有者确认）；该信号同时作为检测器**有效性反证**目标。除此之外零发现（最近状态见 `docs/verification/oxide.md`）。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **形态**：等宽频道标签、ASCII 波形、发丝分隔与青绿信号点；缩略版保留“仪表读数”而非首屏大段落。
- **令牌抽取**：核心声部迁入 `tokens.css`，作用域 `:is(.ox, .ox-pv)`；正式页仅将 hex fallback 改为引用同值 token，OKLCH 覆盖与视觉不变。
- **字体**：导出 `--font-geist` / `--font-geist-mono`，预览直接引用框架变量、由切换页按族去重；两族均已在生产字体池，切换页不新增字体族。
- **字符**：预览保留 `●`、`↗` 与块字符波形；Geist Mono 缺 `●` / `↗`，由显式 `Segoe UI Symbol` / `Apple Symbols` 回退承接，不改用临时替代字符。
- **检测器**：仍为 1 条 `codex-grid-background`（上方既有例外）；预览未新增字号、颜色或圆角发现。

## 语言切换入口适配（v0.9.0 · 2026-10-12）

官方规范未定义语言切换入口。v0.9.0 起语言切换入口并入共享操作菜单的语言分组（`.cm-lang`），v0.10.0 起桌面二级子菜单与移动端平铺两种形态都可达（ADR 0007），本设计**不渲染**可见语言切换器，其 `style.css` 中亦无语言切换样式——语言项属项目 chrome 的中性外观，不模仿本设计视觉语言。

## 未测 / 限制

- 滚动进度线在 Firefox stable（2026-10 仍在 flag 后）按设计整条隐藏，未在该引擎实证；其余同 `docs/verification/oxide.md`。
- 快照原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。
