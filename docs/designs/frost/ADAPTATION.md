# frost — 项目侧适配记录（ADAPTATION）

> `src/designs/frost/DESIGN.md` 为**第三方分析复刻**（`third-party-analysis`）的**自撰规范**：对 Apple Human Interface Guidelines「材料与层次」语言的分析与重述，不含任何上游文本、素材或品牌资产（定性见 `design.json.source`）。
> 本文件记录项目实现的适配、增补与例外；当前验证状态见 `docs/verification/frost.md`；归属规则见 `docs/README.md`。

## 来源与商标边界

- **非官方致敬复刻**：id `frost` / displayName "Frost" 为项目自定名（2026-10-11 按 SPEC §4.4 复刻席规则提案）；不使用 Apple / iOS / Mac 等商标名作设计命名，页面不出现 Apple 品牌声明文案。
- 取向核对来源：HIG `materials` 页（2026-10-11 抓取）——其「两种材料」教义（功能层玻璃 vs 内容层标准材料、厚度与对比权衡、克制使用）被映射为本设计的双层材料规则；原文与图像不移植。
- 不复用上游任何文本、图片、组件代码或图标；系统色值为公开的事实性色值（iOS 系统调色板），本设计取其近似实现。

## 字体（OFL-1.1，构建期自托管）

- **SF Pro 不可内嵌**（Apple 平台字体许可限制）→ 采用 **Inter Variable**（`@fontsource-variable/inter`，SIL OFL-1.1）作为几何人文主义替代；回退 system-ui / -apple-system / PingFang SC / Microsoft YaHei。
- iOS 型阶数值（34 / 22 / 17 / 15 / 13 / 12；17 基线、1.47 行高等）保留为规范值，由 Inter 呈现。

## 材料实现与回退（关键适配）

- 玻璃 = `backdrop-filter: blur(20px) saturate(180%)` + rgba 材料底（导航 / 卡片两种厚度）；
- **回退一**：`@supports not (backdrop-filter: blur(1px))` → 材料升为近实底（不透明度 0.97），文字对比不变；
- **回退二**：`prefers-reduced-transparency: reduce` → 同上传实底策略（尊重系统"降低透明度"；本机 headless 环境默认即 reduce，实测玻璃路径需显式仿真 no-preference）；
- **Accent Solid**：Filled 胶囊底固定为 `#0071E3`（深浅同值）——白字在深色档系统蓝 `#0A84FF` 上仅 3.65:1（AA 不过），填充底收紧到过线档（见 DESIGN.md Colors）。
- 极光层为 `z-index: -1` 固定装饰（`aria-hidden`），是玻璃的"背景内容"；不支持 backdrop 的环境下极光仍在但只作为底色彩。
- 材料层不做 box-shadow 分层（深度 = 透明与模糊）。

## 图标（lucide + 品牌 mark）

- `github` → 共享品牌 mark；`mail` → `@lucide/astro` Mail（胶囊内 1em、`aria-hidden`）；外链 → `ArrowUpRight`（行标题内 0.8em）。
- 未配置 / 未映射 slug 一律不打标（0.5.3 口径）。

## 深浅双模

- 按 `prefers-color-scheme` 切换系统浅 / 深两套（画布、三档灰、accent、材料、tint / fill 全量成对）；`color-scheme: light dark`；无手动切换。

## 动效（DESIGN.md Motion 章节范围内）

- 弹簧曲线 `cubic-bezier(0.32, 1.25, 0.5, 1)`（轻微过冲）：进场 500ms / 40ms 错落；显现复用共享 `Reveal`（450ms，行 50ms / 卡组 70ms 错落）；hover 200ms、`:active` 缩放 130ms。
- 极光静止（无持续动效，论证见 DESIGN.md）；减动态全部关闭、内容自然可见。

## 区块取舍（profile 字段）

- 核心字段全部渲染（name = Large Title h1 + 导航 Headline；headline / bio / links）；扩展区块四类全取：projects（分组卡内行 + 芯片）、experience（分组卡内行）、skills（芯片组）、contact（22px 大幅面卡 + Filled 胶囊）。
- 实现细节与实测数值在 `docs/verification/frost.md` 记录。

## 未测 / 限制

- 同 `docs/verification/frost.md`；复刻规范为自撰、可修订（修订时同步实现与验证记录）。
- backdrop-filter 的实际模糊观感随浏览器与 GPU 而异（Chromium 仿真实测；回退路径保证功能等价）。

## 检测器例外（有意为之 · 2026-10-11）

- `bounce-easing` ×2（`cubic-bezier(0.32, 1.25, 0.5, 1)`，进场与显现）：**弹簧过冲是本设计核心语言**（HIG 弹簧阻尼的 CSS 近似，见 DESIGN.md Motion 节），不以检测器的通用"避免回弹"建议覆盖；超出幅度受控（1.25 控制点，轻微过冲）。
- 极光色值已作为设计系统值补入 `DESIGN.md`（`colors.aurora-*`），非漂移。