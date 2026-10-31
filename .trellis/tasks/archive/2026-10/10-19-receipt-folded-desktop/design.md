# design.md — receipt 桌面折叠双栏

## 1 · 目标与边界

把「三份语言副本并排」改为「一张当前语言票据」：

- 单一数据源：`loadDesignView('receipt', Astro.url.pathname)`。
- 单一 DOM 票据：`Ticket.astro` 只渲染当前 locale 的一份内容。
- 宽屏是一张纸的内部排版，不是多个组件并排，也不是两套独立页面。
- 数据、locale、菜单和 head 仍由 `src/lib/site.ts` 统一提供。

## 2 · 结构设计

### 2.1 页面骨架

```
main.rc-scene
  article.rc-paper
    header.rc-head           // 品牌、姓名、headline、location、图章
    section.rc-block.rc-memo // bio
    div.rc-fold-body         // 桌面双栏；窄屏单列
      section.rc-block       // 明细
      section.rc-block       // 订单
      section.rc-block       // 纪录
      section.rc-block       // 技能
      section.rc-block       // 结账
    footer.rc-foot           // 致谢、条码、示例声明
```

DOM 采用自然阅读顺序：明细 → 订单 → 纪录 → 技能 → 结账。
桌面用 CSS Grid 将 `rc-fold-body` 分成两栏，并用显式 `grid-column` 分配区块；
不重排 DOM，也不使用 `order` 打乱屏幕阅读器顺序。

### 2.2 双栏分配

建议的稳定分配（可按实际高度微调，但必须写入 DESIGN.md）：

- 左栏：明细、订单
- 右栏：纪录、技能、结账

理由：明细与订单都是高密度的条目列表，放在同侧形成连续扫描；纪录、技能与结账是较短的纵向块，
放在另一侧平衡高度。若英文订单过长，可改为左栏「明细 + 纪录」、右栏「订单 + 技能 + 结账」，
以实测高度为准，但不能破坏阅读顺序。

### 2.3 宽度与断点

- `<1024px`：`.rc-scene` 为单列容器，`.rc-paper` 保持 `min(30rem, 100%)` 同级可读宽度。
- `>=1024px`：`.rc-scene` 的可用宽度 `min(72rem, calc(100% - 2 * clamp(1rem, 4vw, 3rem)))`；
  `.rc-paper` 填满该宽度，内部 `padding-inline` 约 `clamp(2rem, 4vw, 4rem)`。
- 1440 视口：纸张目标约 1100px，左右台面约 160px；实际数字由浏览器实测确认。
- 1024 视口：纸张接近全宽但保留至少 16px 台面，正文栏约 300px，仍可读。
- 所有内部宽度用 `minmax(0, 1fr)`，避免英文 URL 或长单词撑破网格。

### 2.4 折痕

折痕是纯 CSS 的纸面压线，不使用第二层纸、不使用阴影：

- 在 `.rc-fold-body::before` 或伪元素上，用 1px 的 `linear-gradient` / `box-shadow: none` 实现。
- 颜色从 `--rc-line` 取，透明度低于正文分隔线；宽度约 1px，不成为强视觉中心。
- 仅桌面显示；移动端不显示折痕。
- 折痕不进入无障碍树（伪元素天然不朗读）。

## 3 · 组件与数据契约

- `Ticket.astro` 的 Props 收敛为 `{ locale, profile }`；删除 `isCurrent`。
- `Page.astro` 不再 import `loadDesignStrips`，改为 `loadDesignView`。
- `Ticket.astro` 中所有 id 使用当前 locale 后缀，保持唯一性；单份 DOM 不冲突。
- `contextMenu` 仍由 `view.contextMenu` 提供，`<ContextMenu config={contextMenu} />` 保持在 body 末尾。
- `HeadMeta`、`Font`、`Reveal` 原样保留。
- `messages.ts` 删除仅用于旧三联轨道的 `railTitle`，三语言同步删除。
- `DESIGN.md` 的 Project Contract 改为 `loadDesignView`。

## 4 · 动效

保留既有「票据机印刷」：

- 首屏 `rc-print` 与图章落章不变。
- 滚动显现仍由共享 `IntersectionObserver` 驱动；双栏区块的延迟仍按 DOM 顺序编排，
  不因视觉左右位置而改变节奏。
- 双栏首次进入视口时，左右两栏均应在同一秒级窗口内落定；不让右栏等待左栏。
- 折痕不参与动画；不做翻折 / 3D / 拖动交互。
- `prefers-reduced-motion: reduce` 时不生成动画，内容原样可见。

## 5 · 可访问性

- 一份 `article`，一个 `h1`，每个 section 一个可见 `h2`。
- 双栏只改变布局，不改 DOM 顺序。
- 折痕、序号、URL、点线、条码、图章、地址 `#` 等装饰 `aria-hidden`。
- 链接可访问名保持原文本，不附加视觉装饰。
- 菜单语言项仍由共享组件输出，设计页不新增控件。

## 6 · 兼容与回滚

- 只改 receipt 私有文件与对应文档；`src/lib/site.ts` 不删除 `loadDesignStrips`，避免影响其他任务 / 未来多语言同屏设计。
- 若双栏在 1024px 下不可读，优先提高断点或调整栏宽，不压缩字号到 12px 以下。
- 回滚：恢复 `Page.astro` / `Ticket.astro` / `style.css` / `messages.ts` / `DESIGN.md` / 验证记录到本次提交前版本。

## 7 · 已知坑与防呆

- 不能用 `.rc` 的 `grid` 居中把宽纸左侧裁出视口；宽屏 `.rc` 改为块级，`.rc-scene` 负责居中。
- 不能把 `rc-paper` 写死 `max-width: 30rem`；桌面需覆盖宽度。
- `clip-path` 撕边仍按整张宽票构建，不能只套在某一栏。
- 英文长 URL 在双栏中需要 `min-width: 0` + `overflow-wrap: anywhere`（或窄屏隐藏 URL）；不得出现网格横向溢出。
- `@source not "./Preview.astro"` 必须保留。
