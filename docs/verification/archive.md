# verification — archive

> 本文件是该主题**当前**的验证状态；重复验证时更新本文件，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill；本套属「八方向拟物主题」批次（父任务 `10-17-skeuo-theme-queue`），2026-10-17 由编排方统一验证。

## 设计摘要

- **隐喻**：图书馆卡片目录：一只拉开的胡桃木抽屉，7 张马尼拉索引卡（卡头 + 六个分区）叠放，类目签凸出，红章「已归档」。
- **字体**：Sorts Mill Goudy（卡头/合计）· Courier Prime（打字条目）· Zhuque Fangsong（中文）
- **页面**：`/zh-cn/archive/`、`/ja/archive/`、`/en/archive/`

## 构建与产物

- `npm run build` 绿：**73 页**（3 语言 × 16 设计 + 基础设施页）；`astro check` **0 错误 / 0 警告 / 0 提示**（56 文件）。
- 本套三语言页面均已生成：`dist/{zh-cn,ja,en}/archive/index.html`。
- CSS 隔离：本页仅链接自身 1 条 CSS；该文件不被其他设计页引用（7 套批量核对通过）。
- 字体经 local provider 进入产物；构建期零网络；`dist` 无 ttf/otf/ttc、无 `.local-fonts` / `F:\Fonts` 路径泄漏、无第三方域名请求。
- 本套实测加载字体（逐字体 document.fonts.check() 判定，滚动后）：Sorts Mill Goudy、Courier Prime、Zhuque Fangsong。

## 探针（CDP，2026-10-17）

| 口径 | 桌面 1440 | 移动 375 | 日文 1440 |
|---|---|---|---|
| console 错误/警告 | 0 | 0 | 0 |
| 外部请求 | 0 | 0 | 0 |
| 横向溢出 | 无 | 无 | 无 |
| h1 / h2 | 1 / 7 | 1 / 7 | 1 / 7 |
| 视口内隐藏（加载时） | 0 | 0 | 0 |
| 视口内隐藏（滚底后） | 0 | 0 | 0 |
| 共享 Reveal 门控 | ready（8 个目标） | ready | ready |

- 图片 0、空可访问名链接 0；分区均有 `aria-labelledby`。
- 截图：`.local-fonts/dev/preview/skeuo/archive-desktop.png`（1440 全页）、`archive-mobile.png`（375×2x）。

## 检测器

- `impeccable detect --json src/designs/archive` → **0 条**（DESIGN.md 已登记 CSS 字面量）。

## 切换页预览碎片（`Preview.astro`，2026-10-19 全铺复验）

- **形态**：木抽屉 + 马尼拉索引卡 + 凸出的类目签（`01 卡片头`）+ 印刷横线 + 点引导条目 + `SB · 03 · 03` 索书号 + 红章「已归档」+ 卡底打孔。与本设计正式页「一眼可认」。
- **令牌抽取**：调色板自 `style.css` 的 `:root` 迁入同目录 `tokens.css`，作用域改为命名空间类 `:is(.ar, .ar-pv)`（原 `:root` 在预览内联时会成为切换页全局令牌泄漏）。`style.css` 改为 `@import "./tokens.css"`。
- **F5 祖先消费**：`html { background: …; scrollbar-color: … }` 是 `.ar` 的**祖先**，取不到作用域在 `.ar` 的自定义属性——取值改为字面量（`#1a120d` / `#6b5e4a`，与 `--ar-back-deep` / `--ar-dim` 同值）。浏览器实测计算值不变（`rgb(26,18,13)` / `rgb(107,94,74) rgb(26,18,13)`）。
- **等价重构**：`dist/zh-cn/archive/index.html` 与改动前基线**逐字节一致**（归一化 `Page.*.css` 文件名后 sha256 相等）。
- **`@source not "./Preview.astro"`**：本页 `style.css` 的 `@source "./"` 曾连带扫描预览文件，把其 `<style>` 属性文本当工具类注进**正式页** CSS（约 +1.3KB/页）；已排除。
- **预览缩略档位登记**：`DESIGN.md` 的 `typography` 增补 `preview-micro`（0.5rem）/ `preview-display`（1.2rem）/ `preview-display-compact`（1.05rem）三档——预览是卡片的**缩微引述**，不并入正式页阶梯。据此检测器保持 0 条。
- **全铺复验**：三语言切换页均渲染本套预览；预览导出 3 个字体变量（Sorts Mill Goudy / Courier Prime / Zhuque Fangsong），由切换页按族去重；预览内 0 可聚焦元素，卡片可访问名不含预览文字。

## 设计要点与已知偏差

- 卡片叠放 + 类目签 h2；页脚为抽屉前沿著录签（可见 h2「著录」）。
- 动效：卡片 60ms 步进升起 + 图章落下；reduced-motion 全静态。
- `design.json` 无 id 字段（registry 由目录名派生，schema 为 strict）；类目签小号大写词归 Courier 声部。

## 待用户实机复核

- 用户将在本机对每套主题做视觉复核与逐项调整（版式微调、文案、动效手感）；调整按新任务处理。
