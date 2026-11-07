# Shelf 设计：90s–00s 中国商品包装

> **2026-11-05 决策：退役，不合并。** 首轮视觉评审后判定“商品包装”概念与求职语义冲突（主分区被“生产信息 / 配料 / 购买渠道”替换，“非卖品 / 净含量 1 人”误导求职状态）。实现已删除；原因与后续见 [`decision.md`](./decision.md)。本 PRD 保留为失败实验记录。

## Goal

把个人资料做成一件摆在 90s–00s 中国超市货架上的商品：红黄黑色块、中轴对称、WordArt 字效、满版信息、价签 / 条码 / 配料表。5 语言、纯 CSS、无设计专属 JS、无图片、复用现有字体。

## 与现有设计的差异（必须写进 DESIGN.md Do/Don't）

- vs `brutal`：不是左对齐粗野告示板；不做硬偏移阴影 / 酸黄标签 / 可见网格，而是**中轴对称、满版色块、商品自夸**。
- vs `poster`：不是双色丝网海报；不做套准标记与克制留白，而是**三色高饱和 + 描边字 + 信息过载**。
- vs `zine`：不是复印朋克 / 地下小杂志；不做错位套印、颗粒、胶带与反商业语气，而是**主流电视购物式的过度商业**。
- vs `receipt` / `fax`：不是热敏小票 / 传真纸；不做等宽小字、点线、走纸孔，而是**粗黑大字 + 价签 + 包装面**。
- vs `homepage99`：不是 90s 个人主页 / 网站目录；它是**实体包装**，不是网页导航。
- vs `ink` / `deco`：不是宋式册页 / Art Deco 剧院节目单；不做文人气、留白与金属奢华，而是县域货架的直白叫卖。

## Scope / Files

```text
src/designs/shelf/
  DESIGN.md
  design.json
  Page.astro
  messages.ts
  style.css
  tokens.css
  Preview.astro
src/designs/descriptions.ts          # 增加 shelf 五语言说明
docs/verification/shelf.md           # 新增完整验证记录
docs/verification/shared.md          # 当前基线 28 → 29 套
README.md                            # 28 套 → 29 套；27 styled → 28 styled
docs/README.md                       # 当前 28 套预览 → 29 套
SPEC.md                              # §4.4.1 矩阵、计数与批次记录
```

- `design.json` 草案：
  - `displayName: "Shelf"`
  - `description: "90s–00s 中国商品包装：红黄黑色块、中轴对称、WordArt 字效与满版信息，把个人资料摆上货架。"`
  - `enabled: true`
  - `locales: ["zh-CN","zh-TW","ja","en","ko"]`
  - `accent: "#D7261E"`
  - `source: { "type": "self-produced" }`
  - `generatedBy: "impeccable · 2026-11-05（90s–00s 中国商品包装方向）"`

## Requirements

### R1 — 规范先行

- 先写 `DESIGN.md`，至少包含：隐喻、色板（含实测对比度）、字体六项、版式、组件、动效、响应式、无障碍、内容映射、Do/Don't、验证。
- 色板候选（实施时复算并登记）：
  - `--sh-red #D7261E` / `--sh-red-deep #9E1B16` / `--sh-yellow #FFD23F`
  - `--sh-black #141414` / `--sh-cream #F7E8C3` / `--sh-white #FFFDF5`
  - 已实测：black/cream 15.16；black/yellow 12.76；white/red 4.93；red-deep/cream 6.59；red-deep/yellow 5.55；yellow/black 12.76；yellow/red 3.47（仅大字/展示）；black/red 3.67（仅大字）；red/cream 4.13（仅大字）；white/yellow 1.42 与 yellow/cream 1.19 **禁止用于文字**。
- 禁止把黄色 / 红色小字放在低对比底色上；正文优先 black on cream/white/yellow；红底小字只用 white（4.93:1）。
- 任何新增色值先算对比度并登记。

### R2 — 零新增字体

- 只用现有 family：`Inter` / `Noto Sans TC` / `Zhuque Fangsong` / `Gothic A1` / `League Gothic` / `JetBrains Mono`；**不得**修改 `fonts.config.json`、`fonts.lock.json`、`src/fonts/generated.ts`，不得新增字体发布包。
- 展示：`Noto Sans TC 400` + `-webkit-text-stroke` + 多层 `text-shadow` + `font-synthesis: weight` 模拟粗黑 / WordArt；正文：`Inter` + `Zhuque`；韩文伴生：`Gothic A1`；编号 / 批次：`JetBrains Mono`。
- 每个字体栈写完整 fallback，Zhuque 必须排在系统中文之前；`zh-TW` 用 `html:lang(zh-TW)` 把 `--font-zhuque` 重映射到 `--font-noto-sans-tc`，`--font-gothic-a1` 设为 `__senrenbanka_tc_skip__`。
- 若首轮视觉实测显示 Noto Sans TC 合成粗黑不可接受，或 `dist` 超过 **8.5 MiB 软目标**，则回退为 **非 TC 页用 Zhuque 描边展示**，并在 `DESIGN.md` / 验证记录中登记；本任务不新增字体。
- `npm run fonts:typography` / `npm run fonts:coverage` 必须通过。

### R3 — 页面与内容

- 页面结构：货架条 → 包装正面（品牌行 / 巨型姓名 / headline / 规格章 / 非卖品封签）→ 产品说明（bio）→ 配料（skills）→ 产品系列（projects）→ 生产信息（experience）→ 购买渠道（links）→ 联系经销商（contact）→ 页脚（声明 / 条码）。
- 必渲染 `name` / `headline` / `bio` / `links`；`projects` / `experience` / `skills` / `contact` 条件渲染；`avatar` 本版不呈现；`location` 进入“产地”规格章，缺失时省略。
- 内容映射只使用真实资料：`skills` 作为“配料”，`projects` 作为“产品系列”，`experience` 作为“生产信息”，`links` 作为“购买渠道”，`contact` 作为“联系经销商”。**禁止**伪造生产日期、价格、净重、认证标志、条形码数字或个人事实。
- 内部链接用 `withBase()` / locale 辅助函数；外部链接直接用 `link.url`。
- 共享 `<ContextMenu>` 无条件渲染；不渲染 `<LanguageSwitcher>`。

### R4 — 视觉与组件

- 货架背景：奶油纸底 + 极淡横向货架线 + 顶部红色货架条；包装主体 `max-width 64rem`，红色正面 + 黑 / 黄面板 + 粗黑外框；不使用软阴影 / 玻璃 / 渐变按钮，保持平面包装感。
- 巨型姓名：中轴对称，黄色主字 + 黑色描边层 + 红色偏移层；装饰层 `aria-hidden`，主字保持实色可读。
- headline 放在黄色标语块；规格章为白底黑框小方块（净含量 / 产地 / 系列 / 配料）；“非卖品”圆形封签可旋转，窄屏隐藏或静态。
- 分区标题用黄底黑字标签 + 红色编号；项目卡为白底黑框 + 黄色编号；生产信息用批次标签 + 组织 / 角色 / 描述；购买渠道为黄底黑字行；条码为纯 CSS 装饰，`aria-hidden`，不写真实条码号。
- 不复制任何具体品牌：无椰树 logo、椰树瓶型、椰树广告语、真实认证标志、真实价格 / 日期 / 条码；`DESIGN.md` 明确列出不复制项。

### R5 — 动效

- 封签落下：`scale(1.4) rotate(-14deg) → scale(1) rotate(-8deg)`，220ms，`steps(3, end)`，只播一次。
- 共享 Reveal：分区 180–240ms、位移 ≤10px、错落 40ms；内容默认可见，隐藏态只由 `html[data-reveal-ready]` 门控。
- 不做无限循环、marquee、闪烁、滚动劫持；`prefers-reduced-motion` 下封签不旋转、内容直接可见。
- 无设计专属 JS；`<Reveal />` 只放一次。

### R6 — 响应式与无障碍

- 1440 / 1024 / 768 / 375×812 验证；375px 无横向滚动；长词 / 长 URL `overflow-wrap: anywhere`；包装边框与规格章在窄屏不挤压正文。
- 每页唯一 `h1` = 姓名；分区 `h2`；项目 / 经历 `h3`；每个 section `aria-labelledby`。
- 装饰（姓名描边层、封签、条码、货架线、箭头）`aria-hidden` 或伪元素；链接可访问名只由文本承担。
- 焦点环使用黑 + 黄双层（`outline` + `box-shadow`），在红 / 黄 / 奶油底上都可见；触控目标 ≥44px；不以颜色单独传达状态。
- 正文对比 ≥4.5:1；大字 ≥3:1；黄 / 红小字只出现在合格组合；纹理不造成阅读疲劳。

### R7 — 预览与验证

- `Preview.astro` 自包含、16/10、1–8KB、`aria-hidden`、无可聚焦元素；不 import `style.css`，只 import `./tokens.css`；`export const fonts` 列出实际用到的 family。
- `style.css` 必须加 `@source not "./Preview.astro";`。
- 更新 `docs/verification/shelf.md`：构建、5 语言、1440/768/375、键盘 / 焦点、对比度、减动态 / 无 JS / 无 IO、预览、CSS 隔离、字体子集与 dist 增量、截图归档。
- 更新 `README.md`、`docs/README.md`、`docs/verification/shared.md` 与 `SPEC.md` 的当前计数 / 矩阵；历史记录不回写。

## Acceptance Criteria

- [ ] A1 `src/designs/shelf/` 七个文件齐备；`design.json` 通过注册表校验；5 语言页面可达。
- [ ] A2 `DESIGN.md` 包含色板实测表、字体六项、动效、响应式、无障碍、内容映射、Do/Don't、不复制清单、验证章节。
- [ ] A3 无新增字体 / 图片 / 第三方图标库 / 设计专属 JS；字体栈保留核心 CJK；`fonts:typography` / `fonts:coverage` 通过。
- [ ] A4 5 语言 `messages.ts` 键齐全；`descriptions.ts` 增加 shelf 五语言说明；共享菜单、Reveal、`withBase()`、`aria-labelledby` 通过验证。
- [ ] A5 姓名 / headline / bio / links 全部渲染；可选区块条件渲染；无伪造事实；375px 无横向滚动。
- [ ] A6 对比度达标；黄 / 红小字不落在不合格底色；触控 ≥44px；减动态 / 无 JS / 无 IO 内容可见。
- [ ] A7 `Preview.astro` 自包含且无聚焦元素；切换页 29 张预览；CSS 隔离无聚合；`impeccable detect` 为 `[]`。
- [ ] A8 `docs/verification/shelf.md` 完成；dist 与字体子集增量记录；`npm test` / `npm run build` / `fonts:audit` 通过。

## Open Decisions（评审确认）

- 展示字体最终路线：首轮用 `Noto Sans TC 400 + CSS 描边`；若观感或体积不接受，回退 `Zhuque` 描边。两者都不新增字体。
- 货架标记用 `SH-29`（第 29 套）还是 `SH-90S`（年代标记）；默认 `SH-29`。
- `avatar` 本版不呈现；如需要“产品实拍”位，后续再加。
- 分区最终措辞：产品说明 / 配料 / 产品系列 / 生产信息 / 购买渠道 / 联系经销商。

## References

- `AGENTS.md` 硬门禁。
- `docs/rules/design-contract.md`、`visual-language.md`、`accessibility-responsive.md`、`data-and-i18n.md`、`pitfalls.md`。
- `docs/fonts/selection-guide.md`。
- `SPEC.md` §4.4.1 视觉差异化矩阵。
- `.agents/skills/design-page-verify/SKILL.md`。
- 参考结构：`src/designs/zine/`；反面参照：`src/designs/brutal/`、`poster/`、`receipt/`、`homepage99/`。
