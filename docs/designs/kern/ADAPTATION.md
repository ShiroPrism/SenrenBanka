# kern — 项目侧适配记录（ADAPTATION）

> `src/designs/kern/DESIGN.md` 为**第三方分析复刻**（`third-party-analysis`）的**自撰规范**：对 Vercel Geist 视觉语言的分析与重述，不含任何上游文本、素材或品牌资产（定性见 `design.json.source`）。
> 本文件记录项目实现的适配、增补与例外；当前验证状态见 `docs/verification/kern.md`；归属规则见 `docs/README.md`。

## 来源与商标边界

- **非官方致敬复刻**：id `kern` / displayName "Kern" 为项目自定名（2026-10-11 经项目所有者按 SPEC §4.4 复刻席规则确认，方案 A），不使用 Vercel / Geist 商标名作设计命名。
- 页面不出现 Vercel / Geist 品牌声明文案与商标资产；不复用上游任何文本、图片、组件代码。
- 实现与规范均为自有产出：配色（黑 / 白 / 六级灰）、网格骨架、单元网格、十字号均为本项目自定参数，与参照对象仅共享"视觉语言"层面的取向。

## 字体（OFL-1.1，构建期自托管）

- **Geist Variable**（`@fontsource-variable/geist`，轴 wght 100–900）+ **Geist Mono Variable**（`@fontsource-variable/geist-mono`）——SIL OFL-1.1，保留字体名、不重命名、不衍生。
- 页面只用 400 / 500 / 600 三档；中文回退 PingFang SC / Microsoft YaHei（Geist 不含 CJK），等宽场景仅 ASCII 元数据。
- 接线：`astro.config.mjs` 注册（npm provider、`remote: false`）→ 页面 `<Font cssVariable="--font-geist" />` + `--font-geist-mono` → `style.css` `@theme inline` 注册。

## 图标（lucide + 品牌 mark）

- 通用功能图标 `@lucide/astro`（构建期内联 SVG）：`Mail`（链接标记 / Contact 按钮）、`ArrowUpRight`（项目外链），1.5 描边、随文字色。
- `github` → 共享品牌 mark（`src/assets/brand/github.svg`，simple-icons / CC0）；未配置 / 未映射链接一律不打标（0.5.3 口径）。
- 装饰标记 `aria-hidden`；可访问名由文本承担。

## 网格骨架（复刻要点）

- 竖引导线 ×2（容器两侧贯穿全页）+ 横规则线 ×分区 + 交点 `+` 十字号（CSS 空内容伪元素绘制，不进入无障碍树）。
- **不使用平铺背景网格底纹**（与 oxide 的已记录 advisory 同类，主动回避）；骨架线是结构性边框与分隔。
- 项目单元共享边界（容器左上 + 单元右下 1px），像坐标网格的一部分。

## 动效（DESIGN.md Motion 章节范围内）

- 曲线 `cubic-bezier(0.22, 1, 0.36, 1)`；进场 260ms / 40ms 错落；显现复用共享 `Reveal`（300ms，单元 60ms / 经历行 50ms 错落）；hover / active 反馈 140ms。
- **无持续动效**（论证见 DESIGN.md Motion 节）；减动态时全部静止、内容自然可见。

## 区块取舍（profile 字段）

- 核心字段全部渲染（name 为 Display 档 h1 / headline / bio / links 幽灵按钮组）；扩展区块四类全取（projects 单元网格 / experience 规则线行 / skills 等宽芯片 / contact 声明 + 反转主按钮）。
- 实现细节与实测数值在 `docs/verification/kern.md` 记录。

## 语言切换入口适配（v0.9.0 · 2026-10-12）

官方规范未定义语言切换入口。v0.9.0 起语言切换入口并入共享右键菜单的语言分组（`.cm-lang`），本设计**不再**单独渲染可见语言切换器，其 `style.css` 中亦无语言切换样式——语言项属项目 chrome 的中性外观，不模仿本设计视觉语言。

## 未测 / 限制

- 同 `docs/verification/kern.md`；复刻规范为自撰、可修订（修订时同步实现与验证记录）。