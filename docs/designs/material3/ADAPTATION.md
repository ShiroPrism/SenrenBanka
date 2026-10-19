# material3 — 项目侧适配记录（ADAPTATION）

> `src/designs/material3/DESIGN.md` 为 Google Material 3 官方指南（[m3.material.io](https://m3.material.io/)，CC BY 4.0）与官方开源 token 源码（[material-components/material-web](https://github.com/material-components/material-web)，Apache-2.0）的整合汇编（**整合完成即冻结**，只读、不得修改）；许可与逐节来源见同目录 `SOURCE-LICENSE.txt` 与 DESIGN.md 附录。
> 本文件记录项目实现相对规范的适配、增补与例外；当前验证状态见 `docs/verification/material3.md`；归属规则见 `docs/README.md`。

## 商标与来源边界

- 不使用 Google / Material 商标资产（logo、wordmark）与 Google 品牌声明文案；页面不出现 "Google" / "官方" 表述。
- displayName "Material 3" 仅作指示性描述；`design.json` 与切换页描述均注明汇编来源与「非 Google 官方发布」。

## 字体（OFL-1.1，构建期自托管）

- 型阶族为 **Roboto**（baseline tokens）；项目以同源可变字体 **Roboto Flex**（`@fontsource-variable/roboto-flex`，轴 wght）实现——更低体积、覆盖 400–500–700 全档；上游明确 Roboto Flex「尚未纳入 M3 型阶」，此处按编辑性用法采用（见 DESIGN.md 字体章）。
- 页面只使用 400 / 500 / 700 三档（regular / medium / bold），与型阶表一致。
- 接线：`astro.config.mjs` 注册（npm provider、`remote: false`）→ 页面 `<Font cssVariable="--font-roboto-flex" />` → `style.css` `@theme inline` 注册。

## 图标（Material Symbols + 品牌 mark）

- 上游默认图标集为 Material Symbols；项目侧**不引入可变字体**（不为个位数标记付出完整字体成本），改为 **vendored 单色 SVG**（outlined 风格、24px、fill 0 / wght 400 / grad 0 默认档）：
  - `src/designs/material3/assets/mail_24px.svg`、`assets/arrow_outward_24px.svg`
  - provenance：来源仓库 [google/material-design-icons](https://github.com/google/material-design-icons)（Apache-2.0），获取日期 2026-10-11，路径 `symbols/web/{mail,arrow_outward}/materialsymbolsoutlined/{name}_24px.svg`（master 分支）；文件原样入库（未修改）。
  - 着色 `fill: currentColor`（CSS 继承），尺寸由设计控制。
- 链接标记映射（ADR 0002 / 0.5.3 口径）：`github` → 共享品牌 mark（`src/assets/brand/github.svg`）；`mail` → vendored `mail_24px.svg`；未配置 / 未映射 slug 一律不打标。
- 装饰性标记 `aria-hidden`；可访问名由文本标签承担。

## 阴影配方（web 近似）

- 上游层级 token 只定义 dp 值、不含阴影（各平台自定）；项目侧定义最小 web 阴影配方近似（`docs/designs/material3` 与实现注释同步）：
  - level1：`0 1px 2px 0 rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)`
  - level2：`0 1px 2px 0 rgb(0 0 0 / 0.30), 0 2px 6px 2px rgb(0 0 0 / 0.15)`
  - level3：`0 1px 3px 0 rgb(0 0 0 / 0.30), 0 4px 8px 3px rgb(0 0 0 / 0.15)`
- 使用范围：静息卡片 level1；hover 升一级（level2，对应「hover 层级 +1」）；其余深度优先用 tonal 面层（surface-container 档）。

## 深浅双模

- 页面按 `prefers-color-scheme` 切换 M3 baseline 深色方案（数值取 sys-color 深色映射），`color-scheme: light dark`；不提供手动切换（避免额外交互机关）。

## 交互态近似

- 状态层：hover 8% / press 10%（按官方指南现值；tokens v0.192 为 12%，见 DESIGN.md 注），以 `color-mix()` 与 `:active` 近似；不还原 ripple 涟漪（web 静态近似）。
- 焦点：`:focus-visible` 2px primary 描边 + 2px offset（键盘焦点指示环的 web 近似，上游未在汇编内给出数值）。
- 触控：`pointer: coarse` 下按钮 / 芯片命中高度 ≥ 48px（对齐「24dp 符号 → 48dp 目标」口径）。

## 动效（DESIGN.md Motion 章节范围内）

- 入场：`emphasized-decelerate` 400ms（指南「进入屏幕」建议配对）；hero 逐项错落 30ms（总 ≤ 500ms）。
- hover 类微交互：`standard` 200ms（`short4`，低强调淡入淡出）。
- 滚动显现：复用共享 `Reveal`（机制见 ADR 0001 / 0003），揭示时长同 `emphasized-decelerate` 400ms、卡片错落 60ms。
- 减动态：全部静止、内容自然可见。

## 布局近似

- 窗口尺寸类断点按 `600 / 840 / 1200` 三个关键转折（compact / medium / expanded / large 起）；边距随尺寸类递进（16 → 24 → 32px），正文列宽受限保证桌面留白。
- **首屏两窗格（1024px 起）**：窄屏为「头像在正文之上」的单列堆叠（compact / medium 唯一站得住的排法）；≥1024px 改 canonical 两窗格——`minmax(0,1fr) auto`，文本为主窗格、头像为右侧支撑窗格（`clamp(11rem, 16vw, 14rem)`，`align-items: start`），并解除首屏原有的 `max-width: 46rem` 限制，使头像右缘与下方分区、卡片网格右缘严格对齐（实测 1024 / 1280 / 1440 / 1920 误差均为 **0px**）。
  - **断点取 1024 而非尺寸类的 840**：840 下主列仅 776px，减去头像与 48px 间隔后正文不足 550px，`display-medium`（45px）标题被挤成 4 行，并排反而更差；1024 起主列 ≥960px，两窗格才成立。此为项目侧判断，非上游规定。
  - 改动动机：原实现把 `46rem` 的首屏限制与「下方分区通栏」并置，在宽屏下造成右侧约 288px 的死白，且头像被迫退化为正文上方的装饰。
  - `profile.avatar` 缺省时（`site.ts` 解析为 `null`、不渲染 `<img>`）由 `:not(:has(.m3-avatar))` 收回单列——否则 `auto` 列宽虽为 0 但 `column-gap` 仍生效，正文右缘会与下方分区差出一个间隔。
  - 正文列宽限制改由 `.m3-title`（26ch）与 `.m3-bio`（60ch）自身承担，两窗格下标题实测稳定 2 行。

## 区块取舍（profile 字段）

- 核心字段全部渲染（name / headline / bio / links）；扩展区块取 **projects / experience / skills / contact** 四类——以 M3 容器语言呈现（elevated 卡片 / 列表行 / filter 芯片 / 大圆角 primary-container 面块）。
- 实现细节与实测数值在 `docs/verification/material3.md` 记录。

## 语言切换入口适配（v0.9.0 · 2026-10-12）

官方规范未定义语言切换入口。v0.9.0 起语言切换入口并入共享操作菜单的语言分组（`.cm-lang`），v0.10.0 起桌面二级子菜单与移动端平铺两种形态都可达（ADR 0007），本设计**不渲染**可见语言切换器，其 `style.css` 中亦无语言切换样式——语言项属项目 chrome 的中性外观，不模仿本设计视觉语言。

## 未测 / 限制

- 同 `docs/verification/material3.md`；汇编原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。
- ripple / spring 等平台动效未还原（静态 web；按规范边界注记）；M3 Expressive 不在汇编内。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **形态**：primary / tonal 双按钮、可扫描的分组标签、大圆角疏水面层；宽屏预览保留两层 surface 的层次，不缩成通用卡片。
- **令牌抽取**：浅 / 深两套系统色彩与状态参数迁入 `tokens.css`，作用域 `:is(.m3, .m3-pv)`；正式页只改声明位置。
- **字体**：导出 `--font-roboto-flex`，按族去重声明一次；无额外图标字体请求。
- **检测器**：0 条；缩略预览未引入新的 design-system 信号。
