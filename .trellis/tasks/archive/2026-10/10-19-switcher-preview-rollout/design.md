# design.md — 16 套预览全铺 + 三列栅格

## 1. 承接的既有架构（已实测，不再推翻）

`10-18-switcher-design-preview` 定稿三条硬约束：

1. `Preview.astro` 不 import `style.css`（否则带进 Tailwind preflight 与整页规则）；样式走组件 `<style>`。
2. 令牌不得在 `:root`——迁入同目录 `tokens.css`，作用域为命名空间类 `:is(.ar, .ar-pv)`。组件内联的 `:root` 不被 Astro 作用域化。
3. 预览组件不得从**共享模块** glob；glob 写在切换页 entrypoint 内（eager），可自动发现、容忍缺失。

本次不改变这三条。`SwitcherPage.astro` 的 glob 已就绪，**新增预览无需改动切换页代码**——这是 `10-18` 设计的直接收益。

## 2. 现状扫描（2026-10-19 实测）

| 设计 | 令牌位置 | 令牌数 | 字体变量 | 备注 |
|---|---|---|---|---|
| `editorial` | 类规则内 | 1 | fraunces | 令牌极少，需新增颜色令牌 |
| `fax` | 类规则内 | 14 | courier / tt2020 / zhuque | |
| `frost` | 类规则内 | 46 | inter / fr | 令牌最多 |
| `govuk` | 类规则内 | 18 | **0** | 系统字体 |
| `kern` | 类规则内 | 21 | geist / geist-mono | |
| `lexicon` | 类规则内 | 12 | sorts-mill-goudy / lexicon / zhuque | |
| `material3` | 类规则内 | 52 | roboto-flex / m3 | 令牌最多之一 |
| `oxide` | 类规则内 | 5 | **0** | 系统字体 |
| `pager` | **`:root`** | 20 | silkscreen / handjet / ark-pixel | **必须迁移** |
| `poster` | 类规则内 | 10 | league-gothic / blackout / prociono / zhuque | 7 个字体变量 |
| `radio` | 类规则内 | 35 | share-tech-mono / format-1452 / dseg14 / ark-pixel | 8 个字体变量 |
| `receipt` | 类规则内 | 10 | cutive-mono / ark-pixel / dseg7 | |
| `tape` | 类规则内 | 20 | uglytypist / league-mono / zhuque | |

**关键观察**

- 只有 `pager` 是 `:root`；其余令牌已在 body 类作用域内，抽取是「搬位置 + 加命名空间」，不改变继承语义（不像 `archive` 那样存在 `html` 祖先消费）。
- 但需逐套检查**祖先选择器**：任何 `html` / `body` 级规则消费令牌，都要像 `archive` 一样改字面量。
- `editorial` 只有 1 个字体变量、无颜色令牌——颜色直接写在规则里，抽取时需**新增**颜色令牌（值不变，不改视觉）。

## 3. 每套预览的视觉签名（不得通用化）

| 设计 | 签名形态 | 必须保留 |
|---|---|---|
| `editorial` | 暖纸底 + 不对称双栏 + 发丝线 + 单点焦赭 | 不对称网格、衬线标题、发丝线 |
| `fax` | 传输纸 + 两侧走纸孔 + 表单表头 + 红章 | 走纸孔、`FAX TRANSMISSION` 表头、磨损打字机字面 |
| `frost` | 极光底 + 双层毛玻璃 + 胶囊控件 | 半透明层叠、胶囊圆角、iOS 蓝 |
| `govuk` | 蓝黑栏 + 粗横线 + 高对比黄焦点 | 顶部粗蓝条、黑色栏、方角 |
| `kern` | 纯黑白 + 发丝网格 + 反转按钮 | 零阴影、发丝网格、黑白反转 |
| `lexicon` | 辞典跨页 + 双栏词条 + 页边索引签 | 双栏、词条头牛血红、书眉页码 |
| `material3` | 大圆角面层 + tonal 按钮 + 动态色 | 大圆角、tonal/filled 双按钮、surface 层级 |
| `oxide` | 等宽 + 频道标签 + 滚动进度线 | 等宽、`CH.0x` 标签、细进度线 |
| `pager` | 塑料机身 + 单色 LCD + 状态栏 | 机身外壳、LCD 绿、信号/电量/MSG |
| `poster` | 双色丝印 + 巨幅窄体 + 套准标记 | 超大字、套准十字、粗规线、双色 |
| `radio` | 面板 + 刻度盘 + 段码读数 | 刻度盘、琥珀段码、旋钮/螺钉 |
| `receipt` | 长票 + 齿孔边 + 点引导 + 红章 | 齿孔、点引导、段码数字、红章 |
| `tape` | 磁带壳 + J 卡 + 双卷轴窗 | 双卷轴、手写贴标、螺钉、曲目栏 |

## 4. 令牌抽取策略

### 4.1 通用步骤（每套）

1. 从 `style.css` 识别该设计的设计令牌（`--<prefix>-*`），移动到 `tokens.css`。
2. 作用域改为 `:is(.<bodyClass>, .<prefix>-pv)`。
3. `style.css` 加 `@import "./tokens.css";` 与 `@source not "./Preview.astro";`。
4. 检查 `html` / `body` 等**祖先选择器**是否消费令牌；如有，改字面量并注释。
5. 构建后比对正式页产物（归一化 CSS 文件名）与基线 sha256。

### 4.2 特殊情况

- **`pager`**：`:root` → `:is(.pg, .pg-pv)`；检查 `html`/`body` 消费。
- **`editorial`**：无颜色令牌，需从现有规则提取颜色到 `tokens.css`（值不变）。这是唯一「新增令牌」的套，仍属等价重构。
- **字体角色不抽入 `tokens.css`**：`@theme inline` 在 `html` 层，令牌在 body 层；祖先取不到后代变量会导致字体静默回退（`10-18` 实测）。预览直接引用 `--font-*` 框架变量。

## 5. 栅格设计

### 5.1 现状

```css
.infra { width: min(42rem, calc(100% - 3rem)); }
.infra-list { display: grid; gap: 0.75rem; }
```

### 5.2 目标

```css
.infra { width: min(74rem, calc(100% - 3rem)); }
.infra-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: stretch;
}
@media (max-width: 60rem) {
  .infra-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 48rem) {
  .infra-list { grid-template-columns: minmax(0, 1fr); }
}
```

**为什么正确**：默认 3 列由显式列模板保证「每行最多 3 张」，不依赖 `auto-fit` 的剩余宽度推断；1024px（64rem）仍为 3 列，960px（60rem）降 2 列，768px（48rem）降 1 列。卡片由 `stretch` 与 `height: 100%` 让同一行等高。

### 5.3 风险

- **卡片高度不一致**：预览高度不同（`receipt` 纵向长、`terminal` 横向宽）。同一行用 `stretch` 拉齐；预览本身 `min-height` + 文案量受控，未出现明显空洞。
- **预览内部重排**：列宽从 42rem 变 ≈24rem 时内容会重排，需逐套实测 375 / 1024 / 1536。
- **`receipt` 三联**：正式页 ≥1024px 三语并排；预览只取**单联**骨架，不复制三语并排。

## 6. 字体成本

16 套设计实际导出 **23 个唯一字体变量**。切换页按族去重后声明 `<Font>`；`@font-face` 随族数增长（每族 1–8 个 subset face）。16 套实测为 **82 个 face**（38 个生成族名）。

**控制手段**：预览只渲染姓名 + 一行副标题 + ≤2 条链接；不 preload；CJK 子集按 `unicode-range` 惰性下载（用户已批准）。

## 7. 不变量

- 正式页视觉零变化（字节级等价）。
- 切换页仍是中性基础设施页，不模仿任何设计。
- 预览仍是装饰：`aria-hidden`、无焦点、不进可访问名。
- 不新增依赖、不新增路由、不新增运行时 JS。

## 8. 回滚

每套设计独立：删除该套 `Preview.astro` 即回退该卡片为色点形态；删除 `tokens.css` 并还原 `style.css` 的 `@import` 即回退令牌抽取。栅格改动集中在 `InfraStyles.astro` 一处。
