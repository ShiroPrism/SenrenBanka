# Transit — 实现设计

> 子任务技术设计。设计源以 `src/designs/transit/DESIGN.md` 为准；父任务见 `../11-02-next-style-batch/design.md` §2/§4。

## 1. 文件与职责

`DESIGN.md` / `design.json` / `Page.astro` / `messages.ts` / `style.css` / `tokens.css` / `Preview.astro`，职责同 Aero。

## 2. 令牌

```css
:is(.transit, .transit-pv) {
  --tr-paper: #f5f4ef;
  --tr-paper-2: #e9e7de;
  --tr-ink: #101418;
  --tr-ink-soft: #3b4248;
  --tr-muted: #5d646b;
  --tr-line: #0b7a5c;
  --tr-line-2: #d7263d;
  --tr-line-3: #f2b705;
  --tr-rule: #c9c7bd;
  --tr-accent: #0b7a5c;
  --tr-max: 72rem;
  --tr-pad: clamp(1.15rem, 4vw, 3.5rem);
}
```

已实测：ink/paper 16.80:1；green/paper 4.82:1；red/paper 4.50:1；white/green 5.31:1；white/red 4.96:1；yellow/paper ≈1.9:1（只做非文字）。

## 3. 字体

- 展示/正文：`Inter` + CJK 核心。
- 站码/时刻：`JetBrains Mono` + CJK 核心。
- 不新增 family；每个栈写完整 fallback；系统 CJK 排在 Zhuque 之后。
- `zh-TW` 用 `Noto Sans TC`；`ko` 用 `Gothic A1`；非 zh-TW 页面注册 Gothic A1 作为伴生槽位，保证字体栈变量完整。

## 4. 布局与类名

```text
body.transit
  .transit-shell
    header.transit-network     线路徽章 / 终点站 / 地点
    main
      section.transit-hero     h1 姓名 + headline + bio + 装饰线路图
      section.transit-lines    links 线路/换乘
      section.transit-stations projects 站点卡片
      section.transit-timetable experience 时刻表
      section.transit-badges   skills 线路徽章
      section.transit-ticket   contact 售票处
    footer.transit-footer
  ContextMenu
```

- Hero 两列；≤1024 单列。
- 线路图：CSS grid + 伪元素；装饰性 `aria-hidden`；站点信息用真实列表承载。
- 站点卡：站点码 + 标题 + 描述 + 标签；三列 → 两列 → 单列。
- 时刻表：`<ol>` 行式布局；期间列在窄屏换行。
- 链接 min-height 48px；项目标题/邮箱 ≥44px；焦点环 3px `--tr-accent` + 3px offset。

## 5. 动效

- 线路展开：伪元素 `scaleX(0) → 1`，600ms，只播一次。
- 站点圆点：`opacity + scale` 240ms，错落 40ms。
- 共享 Reveal；减动态内容可见；无设计专属 JS。

## 6. 响应式与无障碍

- 1440 / 1024 / 768 / 375；375 无横向滚动；线路图纵向重排。
- 唯一 h1；分区 h2；站点 h3；section `aria-labelledby`；装饰 `aria-hidden`。
- 线路色不单独承载信息；黄色线不承载文字；白字只用于合格大字号；触控 ≥44px。

## 7. 验证

`design-page-verify` + `docs/verification/transit.md`；重点检查线路色、图标可访问名、窄屏重排。
