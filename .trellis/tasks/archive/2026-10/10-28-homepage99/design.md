# 技术设计：Homepage '99

> 本文件是任务技术设计，不是交付物 `src/designs/homepage99/DESIGN.md`。

## 1. 设计命题

**不是“复古皮肤”，而是“早期个人主页的组织方式”**：

```text
个人站点标题
├─ 左侧：常驻目录 / 更新消息 / 联系提示
├─ 中间：自传、链接、项目、经历、技能、联系
└─ 右侧：状态条、施工标识、88×31 徽章、离线计数器
```

页面应显得被作者长期手工维护：边框不统一但同属一套有限规则，信息密度高，目录永远可见，链接带明显下划线。避免现代 hero、玻璃、圆角卡片、阴影浮层、均匀 8px 间距系统。

## 2. 文件与 manifest

```text
src/designs/homepage99/
├─ DESIGN.md
├─ design.json
├─ Page.astro
├─ messages.ts
├─ style.css
├─ tokens.css
├─ Preview.astro
└─ assets/            # 预期不需要；如新增必须重新论证
```

`design.json` 关键值：

```json
{
  "displayName": "Homepage '99",
  "description": "A hand-built personal homepage from the late 1990s.",
  "enabled": true,
  "renderMode": "styled",
  "accent": "#000080",
  "source": { "type": "self-produced" }
}
```

## 3. 视觉系统

### 3.1 字体角色

| 角色 | 字体栈 | 用途 |
|---|---|---|
| Display | `Georgia, "Times New Roman", Times, "Songti SC", SimSun, "Hiragino Mincho ProN", "Yu Mincho", serif` | 页名、主标题、印章式年份 |
| Body | `Arial, Helvetica, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Yu Gothic UI", sans-serif` | 正文、导航、表格 |
| Technical | `"Courier New", Courier, ui-monospace, "PingFang SC", "Microsoft YaHei", monospace` | 计数器、更新日期、徽章、字段标签 |

不使用 `<Font>`。`DESIGN.md` 写六项字体记录：隐喻、角色、取舍、三语覆盖、体积/许可（系统字体 0 下载）、回退顺序。

### 3.2 调色板

`tokens.css` 作用域：`:is(.h99, .h99-pv)`。建议值：

```css
--h99-paper: #fffbea;
--h99-panel: #f1edcf;
--h99-white: #ffffff;
--h99-ink: #111111;
--h99-navy: #000080;
--h99-blue: #0000ee;
--h99-visited: #551a8b;
--h99-teal: #006b6b;
--h99-lime: #d7ff9e;
--h99-rule: #202020;
--h99-red: #b00020;
--h99-silver: #c0c0c0;
```

以上仅为初始色板；实施时按真实底色核算对比度，只允许在 `tokens.css` 调值并同步 `DESIGN.md`。文字不使用低对比彩虹色。

### 3.3 背景与边框

- 页面背景：米白 + 5/10px 的低对比交叉点或方格 `repeating-linear-gradient`，无图片文件。
- 主框架：至少 3px 现实线 + 1px 双线组合；标题栏可用深蓝底白字或纸底黑字，不追求每块都不同。
- 分区：粗下划线、彩色 inset 边、浅色底交错；圆角为 0。
- 链接：默认蓝色下划线，visited 紫色；focus 用 2px 实线黑/白反差，不依赖颜色。

## 4. 布局

### 4.1 桌面

```text
outer page  max-width: 74rem, side margin >= 1.5rem
┌───────────────────────────── masthead ─────────────────────────────┐
│ site title / tagline / updated stamp                               │
├────────────┬──────────────────────────────────┬────────────────────┤
│ nav 10rem  │ main minmax(0,1fr)               │ rail 11rem         │
└────────────┴──────────────────────────────────┴────────────────────┘
```

- `nav` 放区段锚点、短链接目录与联系提示。
- `main` 按 Links → Projects → Experience → Skills → Contact 排列。
- `aside` 放施工条、3 枚徽章、离线计数器和装饰状态；小于 64rem 时移到正文后，不浮在内容上方。
- 小于 48rem：单列，`nav` 成为正文前的普通目录，徽章组在页尾。

### 4.2 内容组件

- **Masthead**：大号衬线姓名 + 等宽更新时间/状态；`name` 为唯一 `h1`。
- **Intro**：headline 与 bio；头像存在时放在 text wrap 区域，固定 128×128，粗边框，不覆盖文字。
- **Link directory**：两列链接列表，每项有可见 URL（长 URL 可 `overflow-wrap:anywhere`）。
- **Projects**：项目编号 + 标题/链接 + 描述 + tags；视觉像旧目录条目。
- **Experience**：真实 `<table>`，caption 可读或 sr-only；列 org / role / period / description，窄屏改为可访问的块级列表或允许表格局部滚动，不得横向撑破页面。
- **Skills**：一行一行列出，使用项目符号或 `[x]` 文本，不用图标库。
- **Contact**：`<address>`，mailto 链接，note 作为正文。

## 5. 时代装饰

### 5.1 Under Construction

- 静态文字来自 `messages.ts`，如“本页仍在施工”。
- 视觉是 1 条 16–24px 高的斜纹带；唯一动画让 `background-position` 缓慢移动。
- `prefers-reduced-motion: reduce`：`animation: none`。
- 不闪烁、不做跑马灯、不靠动画传达状态。

### 5.2 88×31 徽章

用普通 `<span>` + 边框 + 等宽小字绘制，固定 88×31 CSS 像素，2–3 枚：

- `BEST VIEWED 800×600`
- `MADE WITH HTML`
- `NO FRAMES`

徽章无链接、无按钮语义，整体 `aria-hidden="true"`。若实施时发现文案在三种语言下无意义，可保持这三句为时代装置并在 `messages.ts` 文件头记录不翻译理由。

### 5.3 离线计数器

显示类似：

```text
VISITOR COUNTER
[ - - - - - ]
OFFLINE / NOT CONNECTED
```

不得伪造数字。可见的离线标签是功能边界的一部分；全部文案进 `messages.ts`。不使用 `<output>` 等暗示实时输出的语义。

### 5.4 明确不做

- Guestbook：没有后端，入口必然是假的。
- Webring：没有真实网络环，伪造 prev/random/next 会误导。
- 远程 hit counter、guestbook badge、GIF 或外链装饰。
- `<marquee>` / `<blink>` / 兼容脚本。

## 6. 动效

依据 `docs/adr/0001` 与 `0003`，但本设计**不采用 Reveal**：

- 内容首帧即完整可见；
- 施工斜纹为唯一 `infinite` 动画，持续 7–10 秒一循环，只动背景位置；
- hover / focus 仅做短促颜色与下划线变化；
- 不设置延迟入场，不推迟正文。

`DESIGN.md` Motion 章必须明确“决定不采用共享显现”的理由：早期个人主页以即时可读与手工静态感为先，滚动显现会制造现代编辑设计语气。

## 7. 无障碍与响应式

- 所有装饰（徽章、点线、施工花纹）`aria-hidden` 或伪元素呈现。
- 每个 section 使用 `aria-labelledby`；表格有 caption 和 `th scope`。
- 链接可访问名只由真实标签承担，不以前缀符号开头。
- 正文字号不低于 16px，技术小字不低于 12px 且只用于辅助信息。
- 色板逐组合实测：正文/links/nav/table 在对应底色 ≥4.5:1；大字与边框按 WCAG。
- 375px 无横向溢出；长 URL、长日文标题、表格内容分别测试。
- 触屏目标：主导航链接与资料链接有足够垂直 padding；共享菜单自身继续由项目 chrome 负责。

## 8. 预览与令牌

- `tokens.css` 只放调色板，不放字体角色；作用域 `:is(.h99, .h99-pv)`。
- `style.css` 首两行保持 Tailwind source contract，并 `@source not "./Preview.astro";`。
- `Preview.astro` 用 `.h99-pv` 呈现迷你 masthead + 左目录 + 主区 + 一枚徽章；只呈现视觉签名，不放可聚焦链接。
- `Preview.astro` 导出 fonts 为 `[]`（系统字体）；不得声明 `<Font>`。

## 9. 数据与共享机制

- `Page.astro` 使用 `loadDesignView('homepage99', Astro.url.pathname)`。
- `HeadMeta` 原样接收 `view.head`；`html lang` 用 `view.head.lang`。
- 末尾无条件 `<ContextMenu config={view.contextMenu} />`。
- 所有语言/主题切换继续由共享操作菜单承担，页面内不放独立切换器。
- 所有内部链接走 `localeDesignHref()` / `localeHref()` / `withBase()`。
- `messages.ts` 三语键集合一致；命令式 / 装饰性不翻译文本在文件头说明。

## 10. 风险与回滚

| 风险 | 防护 | 回滚 |
|---|---|---|
| 现代卡片化 | 视觉签名固定为三区与粗框，审查“换掉颜色仍像现代页面吗” | 删除主题目录 |
| 与 Terminal / Archive 重叠 | 禁用 CRT、扫描线、命令、打字机卡片、抽屉等既有符号 | DESIGN.md 视觉差异复核 |
| 文字过密/低对比 | 正文 16px 起、对比度计算、375px 实测 | 调 tokens 并同步 DESIGN.md |
| 表格横向撑破 | 桌面可读、窄屏改用块级或局部滚动 | 保留语义，不靠全局 overflow 隐藏 |
| 预览污染正式页 | 不 import style.css、排除 Preview source、`:root` 禁令 | 删除 Preview / tokens 回滚 |
| 假功能误导 | Guestbook/Webring 直接不做，计数器明确离线 | 移除该装饰 |
