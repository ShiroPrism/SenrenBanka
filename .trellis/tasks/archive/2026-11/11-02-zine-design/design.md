# Zine — 实现设计

> 子任务技术设计。设计源以 `src/designs/zine/DESIGN.md` 为准；父任务见 `../11-02-next-style-batch/design.md` §2/§5。

## 1. 文件与职责

`DESIGN.md` / `design.json` / `Page.astro` / `messages.ts` / `style.css` / `tokens.css` / `Preview.astro`。

## 2. 令牌

```css
:is(.zine, .zine-pv) {
  --zn-paper: #f3efe6;
  --zn-paper-2: #e8e2d5;
  --zn-ink: #111111;
  --zn-ink-soft: #2b2b2b;
  --zn-red: #ff3b5c;
  --zn-red-ink: #c81e3a;
  --zn-blue: #1f4bff;
  --zn-pink: #ff8fb1;
  --zn-rule: #b9b2a4;
  --zn-max: 72rem;
}
```

已实测：ink/paper 16.46:1；荧光红/paper 3.03:1（只做装饰/大字）；深红/paper 4.94:1；蓝/paper 5.22:1；白/深红 5.67:1。

## 3. 字体

- 展示/刊名：`League Gothic` + CJK 核心。
- 正文：`Inter` + CJK 核心。
- 标签/引文：`Courier Prime` + CJK 核心。
- 不新增 family；每栈完整 fallback；非 zh-TW 注册 Gothic A1；zh-TW 重映射 Noto Sans TC。

## 4. 布局与类名

```text
body.zine
  .zn-sheet
    header.zn-masthead     issue / name / location / headline
    main
      section.zn-manifesto  bio
      section.zn-classifieds links
      section.zn-spreads    projects
      section.zn-notes      experience
      section.zn-stamps     skills
      section.zn-coupon     contact
    footer.zn-footer
  ContextMenu
```

- 刊名 League Gothic 巨字 + 1–2px 错位红/蓝副本；正文 ink。
- 分类广告两列；跨页三列；窄屏单列。
- 装饰：复印条纹、颗粒、胶带、印章、裁切虚线；静态 `clip-path`，不参与动画。

## 5. 动效

- 印章落下 180ms `steps(2, end)`；复印扫描带一次性 300ms；共享 Reveal。
- 不做无限 marquee / 闪烁；减动态内容可见；无设计专属 JS。

## 6. 响应式与无障碍

- 1440 / 768 / 375；无横向滚动；跨页/笔记单列。
- 唯一 h1；分区 h2；跨页 h3；section `aria-labelledby`；装饰 `aria-hidden`。
- 荧光红/粉不承载正文；深红/蓝小字 ≥4.5:1；触控 ≥44px。

## 7. 验证

`design-page-verify` + `docs/verification/zine.md`；重点检查荧光色、错位可读性、纹理疲劳、375px。
