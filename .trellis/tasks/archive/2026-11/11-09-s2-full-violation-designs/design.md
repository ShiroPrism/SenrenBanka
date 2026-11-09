# S2 技术设计：8 套全违规设计

整体契约见父任务 `design.md`；本文只记录这 8 套的设计落点。

## 1. 统一渲染模式

```astro
---
import { sectionLabels } from '../../i18n/sections';
const sections = sectionLabels[view.locale.code];
---

<section data-section="projects" aria-labelledby="x-projects-title">
  <p class="x-kicker" aria-hidden="true">{t.projects}</p>   <!-- 主题词，可选 -->
  <h2 id="x-projects-title" class="x-section-title">
    {sections.projects.label}
  </h2>
  ...
</section>
```

- 主题词放在 h2 之前（kicker）或之后（subtitle），不得进入 h2。
- 若原设计用主题词作为视觉主标题（如 aero「窗口」），改为 h2 标准词 + 同位置 kicker 主题词；需要时调整字号 / 字重 / 间距，保持视觉重心。
- `aria-hidden` 只用于纯装饰主题词；若主题词提供语境（如「桌面」），可以保留可读性，不强制 aria-hidden。

## 2. 逐套要点

### aero

- 原 h2：桌面 / 窗口 / 系统时间线 / 功能 / 发送消息。
- 结构：section-head 已有 hint 数字；把主题词改为 kicker（`aero-kicker` 或新类），h2 用标准词。
- 风险：窗口卡片依赖「窗口」语域；视觉由窗口 chrome 承担，移除 h2 主题词不影响。
- `messages.ts` 的 `about`（关于本设备）当前未使用；保留或删除由实现决定，不进入 h2。

### deco

- 原 h2：剧目表 / 幕次 / 演出单 / 演职员表 / 售票处。
- 结构：装饰艺术版式；h2 标准词可能比「幕次」长，需检查标题区栅格。
- 「序言」是 p，不是 h2；保留为 profile kicker，不新增 h2。

### fairy-kei

- 原 h2：挂着的小玩意 / 玩具抽屉 / 丝带卷轴 / 贴纸册 / 留给你的便签。
- 语域高度主题化；标准词会更中性。用 kicker 保留「玩具 / 贴纸」语域，视觉靠贴纸 / 丝带装饰承担。
- 「盒底说明卡」保留为 profile kicker。

### ink

- 原 h2：印谱 / 卷帙 / 年表 / 笔触 / 落款。
- 水墨版式；标准词字数少，注意竖排 / 横排与印章位置。
- 「小引」是 p，保留为 profile kicker。

### little-forest

- 原 h2：路口木牌 / 沿途地点 / 树轮 / 野花标本 / 林中小屋。
- 次级标签也全是主题词；本次只改主分区 h2，次级标签可保留（不承担 heading 语义）。
- 标准词与自然语域的落差最大；kicker 尽量保留原词。

### sticker-diary

- 原 h2：喜欢的地方 / 做过的事 / 走过的地方 / 会一点的事 / 最后一页；kicker 反而是「关于我 / 技能贴纸」。
- 必须翻转：标准词进 h2，主题词降 kicker；修正 `messages.ts` 的键位语义。
- 「写在扉页」保留为 profile kicker。

### transit

- 原 h2：线路 / 换乘 / 站点 / 时刻表 / 线路徽章 / 售票处。
- 站牌 / 时刻表版式；标准词与线路语域差异大；用 kicker 保留「线路 / 换乘」等词。
- links 原为「线路 / 换乘」两个词；h2 用「链接」，kicker 可保留「线路 / 换乘」。

### zine

- 原 h2：分类广告 / 跨页 / 贡献者注记 / 印章 / 邮购回执。
- 拼贴 / 独立杂志版式；标准词进入 h2 后，用 kicker 保留「分类广告 / 邮购回执」语域。
- 「宣言」保留为 profile kicker。

## 3. CSS 风险

- h2 变短后可能出现标题区空洞、栅格错位、装饰线长度不匹配。
- 只调整标题区相关类：字号、字重、字距、margin / padding、装饰线长度；不改配色与布局骨架。
- 375px 下检查长标准词（如 zh-TW「專案」、ja「プロジェクト」）是否溢出。
- 主题词 kicker 与 h2 的对比度仍需满足 AA；kicker 不得成为唯一可读标签。

## 4. 验证

- 每套至少 1 个 Locale 的桌面 + 375px 截图；全部 5 Locale 通过 `verify:sections`。
- 减动态、无 JS 终态抽检；确保内容可见。
- 记录 h2 前后值、kicker 去留、CSS 调整点。
