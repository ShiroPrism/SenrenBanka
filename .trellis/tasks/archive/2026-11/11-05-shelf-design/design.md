# Shelf — 实现设计

> 设计源以 `src/designs/shelf/DESIGN.md` 为准；本文件是任务级技术设计。零新增字体发布；只复用现有 family。

## 1. 文件与职责

`DESIGN.md` / `design.json` / `Page.astro` / `messages.ts` / `style.css` / `tokens.css` / `Preview.astro`，职责同 `zine`。另改 `src/designs/descriptions.ts`、`README.md`、`docs/README.md`、`docs/verification/{shelf,shared}.md`、`SPEC.md` §4.4.1。

## 2. 令牌（候选，实施时复算）

```css
:is(.shelf, .shelf-pv) {
  --sh-red: #d7261e;
  --sh-red-deep: #9e1b16;
  --sh-yellow: #ffd23f;
  --sh-black: #141414;
  --sh-cream: #f7e8c3;
  --sh-white: #fffdf5;
  --sh-rule: #d9c69b;
  --sh-accent: #9e1b16;
  --sh-max: 64rem;
  --sh-pad: clamp(1rem, 4vw, 3rem);
}
```

对比度（WCAG 2.x 相对亮度，2026-11-05 计算）：

| 前景 / 背景 | 比值 | 用途 |
|---|---:|---|
| `#141414` / `#f7e8c3` | 15.16:1 | 奶油底正文 |
| `#141414` / `#ffd23f` | 12.76:1 | 黄底正文 / 标题 |
| `#141414` / `#fffdf5` | 18.09:1 | 白底正文 |
| `#fffdf5` / `#d7261e` | 4.93:1 | 红底小字（仅 white） |
| `#9e1b16` / `#f7e8c3` | 6.59:1 | 奶油底链接 |
| `#9e1b16` / `#ffd23f` | 5.55:1 | 黄底强调 |
| `#fffdf5` / `#9e1b16` | 7.86:1 | 深红底小字 |
| `#ffd23f` / `#141414` | 12.76:1 | 黑底黄字 |
| `#ffd23f` / `#d7261e` | 3.47:1 | **仅大字号 / 展示** |
| `#141414` / `#d7261e` | 3.67:1 | **仅大字号** |
| `#d7261e` / `#f7e8c3` | 4.13:1 | **仅大字号** |
| `#fffdf5` / `#ffd23f` | 1.42:1 | **禁止文字** |
| `#ffd23f` / `#f7e8c3` | 1.19:1 | **禁止文字** |
| `#141414` / `#9e1b16` | 2.30:1 | **禁止文字** |

规则：正文 / 小字只用 black on cream/white/yellow、white on red、red-deep on cream/yellow；黄 / 红只做展示大字或装饰；条码 / 封签等装饰不承载信息。

## 3. 字体（零新增发布）

### 角色

- 展示（姓名 / 大字编号 / 分区标签）：`Inter`（拉丁）+ `Noto Sans TC`（CJK）+ `Gothic A1`（韩文）+ `Zhuque`（兜底）。
- 正文（bio / 描述 / 经历）：`Inter` + `Zhuque` + `Gothic A1`。
- 标签 / 批次 / 条码文字：`JetBrains Mono` + `Zhuque` + `Gothic A1`。
- 展示字重：`font-weight: 900` + `font-synthesis: weight` + `-webkit-text-stroke` + 多层 `text-shadow`；**不新增字体文件 / family / 字重发布**。

### `@theme inline`

```css
@theme inline {
  --font-sh-display: var(--font-noto-sans-tc);
  --font-sh-body: var(--font-inter);
  --font-sh-cjk: var(--font-zhuque);
  --font-sh-mono: var(--font-jetbrains-mono);
}
```

### 完整栈

```css
.shelf {
  --sh-type-display:
    var(--font-inter), var(--font-noto-sans-tc), var(--font-gothic-a1), var(--font-zhuque),
    'PingFang SC', 'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR',
    sans-serif;
  --sh-type-body:
    var(--font-inter), var(--font-zhuque), var(--font-gothic-a1), 'PingFang SC', 'Microsoft YaHei',
    'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
  --sh-type-mono:
    var(--font-jetbrains-mono), var(--font-zhuque), var(--font-gothic-a1), 'PingFang SC',
    'Microsoft YaHei', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', monospace;
}

/* 繁体中文：TC 字体只在 zh-TW 页面注册；韩文伴生槽位不承担汉字角色。 */
html:lang(zh-TW) {
  --font-gothic-a1: __senrenbanka_tc_skip__;
  --font-zhuque: var(--font-noto-sans-tc);
}
```

### 页面注册

- 非 zh-TW：`Inter` / `Noto Sans TC` / `Zhuque` / `Gothic A1` / `JetBrains Mono`。
- zh-TW：`Inter` / `Noto Sans TC` / `JetBrains Mono`；不注册 `Zhuque` / `Gothic A1`。
- 所有注册只使用现有 `--font-*`；不改字体配置 / 锁 / 生成注册。

### 回退决策

首轮使用 Noto Sans TC 合成粗黑。若出现以下任一情况，回退到 **非 TC 页用 Zhuque 描边展示**：

1. 大字号下 Noto Sans TC 合成粗黑边缘明显发虚 / 字面不统一；
2. `dist` 超过 **8.5 MiB** 软目标；
3. `fonts:audit` 因 Noto Sans TC 在非 TC 页产生新增部署缺口。

回退只改 `style.css` / `Page.astro` 的展示栈与注册，不新增字体。

## 4. 布局与类名

```text
body.shelf
  .sh-shelf
    .sh-rail                 SH-29 / 个人资料 / 非卖品
    .sh-package
      header.sh-front
        .sh-brandrow         SHELF / PROFILE / NO.29
        h1.sh-name           主字 + 黑描边层 + 红偏移层
        p.sh-headline        黄底黑字标语块
        .sh-specs            净含量 / 产地 / 系列 / 配料
        .sh-seal             非卖品圆封签（装饰）
      main
        section.sh-notes       产品说明（bio）
        section.sh-ingredients 配料（skills）
        section.sh-series      产品系列（projects）
        section.sh-production  生产信息（experience）
        section.sh-channels    购买渠道（links）
        section.sh-contact     联系经销商（contact）
      footer.sh-footer         姓名 / notice / 条码
    .sh-price-rail             底部价签条 / 非卖品 / 仅供展示
  ContextMenu
```

- 包装主体 `width: min(var(--sh-max), calc(100% - 2 * var(--sh-pad)))`；正面居中；红底 + 黑 / 黄面板 + `border: 5px solid var(--sh-black)`；内部 `box-shadow: inset 0 0 0 3px var(--sh-yellow)` 做包装压边；不使用软阴影。
- 货架背景用一层极淡横向线（`repeating-linear-gradient`）+ 奶油底；顶部 `sh-rail` 红底黄字；底部 `sh-price-rail` 黄底黑字 + CSS 条码。
- 分区为白 / 奶油面板，3px 黑框；标题标签黄底黑字 + 红色编号；项目卡两列（≤1024 一列）；链接两列（≤768 一列）。
- 窄屏：包装边框 4px；规格章 2 列；封签改为静态或隐藏；长词 / URL `overflow-wrap: anywhere`。

## 5. 组件与内容映射

| 资料字段 | 包装角色 | 位置 |
|---|---|---|
| `name` | 产品名 / 唯一 h1 | 正面 |
| `headline` | 卖点 | 正面黄块 |
| `location` | 产地 | 规格章 |
| `bio` | 产品说明 | `sh-notes` |
| `skills` | 配料 | `sh-ingredients` |
| `projects` | 产品系列 | `sh-series` |
| `experience` | 生产信息 | `sh-production` |
| `links` | 购买渠道 | `sh-channels` |
| `contact` | 联系经销商 | `sh-contact` |
| `avatar` | 不呈现 | — |
| `notice` | 页脚声明 | `sh-footer` |

- 规格章：`净含量 1 人`、`产地 {location}`、`系列 {projects.length}`、`配料 {skills.length}`；没有对应数据时省略该项。
- 产品系列：编号方块 + 标题（有 `url` 时为链接）+ 描述 + 标签；没有项目时整区省略。
- 生产信息：`period` 作为批次标签（缺失时不显示标签），`org` / `role` / `description` 真实渲染；没有经历时整区省略。
- 购买渠道：每行 `序号 + link.label + 箭头`，链接文本即可访问名；没有 links 时整区省略（核心字段缺失本身违反资料契约）。
- 联系经销商：email 为主链接，note 为补充；两者都没有时整区省略。
- **不伪造**：不写生产日期、保质期、价格、净重、认证号、条码数字；条码纯装饰 `aria-hidden`。

## 6. 视觉与 WordArt

- 姓名主字 `--sh-yellow`，后面两层装饰：黑描边层（`-webkit-text-stroke`）与红偏移层；装饰层 `aria-hidden`。主字自身用 `text-shadow` 少量黑边保证在红底上的边缘对比，不用 `background-clip: text`。
- 展示字 `font-size: clamp(3.2rem, 13vw, 8.5rem)`，`line-height: 0.9`，`letter-spacing: -0.02em`，`word-break: keep-all`，`overflow-wrap: anywhere`。
- headline 黄底黑字，`font-size: clamp(1.1rem, 2.2vw, 1.6rem)`，不用红色小字。
- 封签：双圈 + 两行字（`非卖品` / `PERSONAL PROFILE`），`transform: rotate(-8deg)`；装饰，窄屏静态。
- 条码：白底黑条 `repeating-linear-gradient`，下方只写 `SH-29`，不写数字串；`aria-hidden`。
- 动效：封签落下 220ms `steps(3, end)`；分区共享 Reveal；hover 只做黄黑反转，不做位移。

## 7. 响应式与无障碍

- 1440 / 1024 / 768 / 375；375 无横向滚动；`html:has(.shelf) { overflow-x: clip; }`。
- 标题序列：h1（姓名）→ h2（六个分区）→ h3（项目 / 经历）；每个 section `aria-labelledby` 指向可见 h2。
- 装饰层、封签、条码、箭头、货架线全部 `aria-hidden` 或伪元素；链接可访问名只由文本承担。
- 焦点：`:focus-visible { outline: 3px solid var(--sh-black); outline-offset: 3px; box-shadow: 0 0 0 6px var(--sh-yellow); }`；在红 / 黄 / 奶油底上均可见。
- 触控：链接行 / 按钮 / 邮箱 ≥44px；`pointer: coarse` 下补 min-height。
- 对比度按 §2 表执行；正文 ≥4.5:1；大字 ≥3:1；禁止 white/yellow、yellow/cream、black/red-deep 文字组合。
- `prefers-reduced-motion: reduce`：封签不旋转、Reveal 不位移；内容默认可见。
- `forced-colors: active`：隐藏装饰层，主字改为 `CanvasText`，去掉 text-shadow / stroke；封签 / 条码保留边框。

## 8. 预览

- `Preview.astro` 自包含；只 import `./tokens.css` 与 `./messages`；`.shelf-pv` 作用域；16/10。
- 签名：红底包装面 + 黄色姓名 + 黄底 headline + 两枚标签 + 小条码；无动画、无聚焦元素。
- `export const fonts`：`--font-inter`、`--font-noto-sans-tc`、`--font-zhuque`、`--font-gothic-a1`、`--font-jetbrains-mono`（按实际使用裁剪）。
- 不 import `style.css`；不声明 `<Font>`；不出现 `:root`。

## 9. 验证与回退

- 构建 / 类型：`npm run check`、`npm run build`；5 语言页面、`fonts:typography`、`fonts:coverage`、`fonts:audit`。
- 静态：CSS 隔离、预览不聚合、`@source not "./Preview.astro"`、`base` 前缀冒烟。
- 浏览器：1440 / 768 / 375；console 0；核心字段；标题序列；`aria-hidden` 计数；焦点；触控 ≥44；无横向溢出。
- 动效：封签 animation 只播一次；Reveal 滚动到底全显现；直接跳底不隐藏；减动态 / 无 JS / 无 IO 内容可见。
- 对比度：按 §2 表实测；截图归档 `.cache/verification/shelf-{1440,768,375}.png`。
- 检测器：`impeccable detect --json src/designs/shelf` 期望 `[]`；若命中，逐条修复或写入 `DESIGN.md` 有意例外。
- 体积：记录 `dist` 总量、字体文件数、核心子集体积；若 >8.5 MiB 软目标，先回退展示字体路线，再考虑压缩 HTML / CSS；不得放宽 10 MiB 硬门禁。
- 回退：删除 `src/designs/shelf/`、`docs/verification/shelf.md`，撤销 `descriptions.ts` / README / SPEC / shared 的 shelf 条目；历史记录不回写。

## 10. 风险与取舍

- **品牌边界**：只做“商品包装”品类，不复制椰树 trade dress；`DESIGN.md` 明确不复制清单。风险是读成 parody；用真实资料、正语气、非夸张价格 / 日期规避。
- **合成粗黑**：Noto Sans TC 只有 400；合成粗黑可能边缘不匀。用描边 / 阴影补强，并在首轮截图后决定是否回退 Zhuque。
- **字体子集体积**：Noto Sans TC 部署到非 TC 页会扩大子集；先量，超软目标即回退。
- **满版可读性**：正文放在奶油 / 白面板；红 / 黄只做展示；避免小字落在 3–4:1 组合。
- **五语言**：英 / 日 / 韩文本更长；用 clamp + 单列 + `overflow-wrap`，不固定高度。
- **检测器误报**：高饱和三色与货架线可能触发视觉启发式；若命中且属设计意图，登记为例外，不为过检测器牺牲核心视觉。
