# design.md — pager（寻呼机 / 单色 LCD）

> 本文件 = 该套的**实施简报**（隐喻 / 版式 / 配色 / 字体 / 动效 / 分区映射）。
> 另一个同名文件 `src/designs/pager/DESIGN.md` 是交付物（设计系统令牌），需按本简报 + 实际值撰写。

## 设计简报：pager — 寻呼机 / 单色 LCD

**世界**：一台别在腰上的寻呼机（Motorola Advisor 气质）。整页是这台机器：上方机壳 + 扬声器槽，中间是 LCD 屏（偏橄榄绿），下方是按键行与滚轮。屏里是「收件箱」：状态栏（信号格 / 电池 / MSG 计数）+ 一条条消息 = 各个分区。

**版式（桌面）**：机器 `min(27rem, 100%)` 居中，机壳有厚度（外阴影 + 内高光）；屏幕内边距紧凑；状态栏用 Silkscreen 小字 + CSS 画信号格/电池；消息条目 = 编号（Handjet）+ 标题（Silkscreen 小写大写化）+ 正文（正文用 Silkscreen 400 或 Handjet？正文可读性优先 → 正文用 Silkscreen 400，标题可用 Handjet 加粗轴）；分隔 = 点线。
**版式（移动）**：机器满宽、机壳减薄、屏幕内边距缩小。

**配色**
- 桌面 back: `#141613`，机壳 shell: `#3b403a`，壳暗 shell-2: `#2c302b`
- LCD 底 lcd: `#b9c6a6`，LCD 深 lcd-2: `#a9b795`
- 像素墨 ink: `#20281c`，淡 pixel dim: `#4a5540`
- 唯一彩色：背光绿光 `#7fae4e`（仅状态/强调，极小面积）

**字体**
- 屏幕标签/小字：Silkscreen（`--font-silkscreen`）
- 大数字/编号/状态：Handjet（`--font-handjet`，可变：weight 400–700，ELGR/ELSH 轴可调点阵形状）
- 中文：Ark Pixel 12px（`--font-ark-pixel`）

**分区映射**：屏幕头（name / headline / location）→ 备注（bio）→ 明细（links）→ 订单（projects）→ 纪录（experience）→ 技能（skills）→ 结账（contact + 合计）→ 页脚（「-- END OF MESSAGES --」+ 样例声明）。
**细节**：LCD 像素感来自字体与 1px 点线，不加扫描线动画；按键/滚轮是 aria-hidden 的 CSS 形状；状态栏 MSG 数 = links.length（真实数据）；不要用 emoji 当图标。
**动效（一个作者时刻）**：开机——屏幕亮度两段跳变（2 步 flicker）后稳定；消息逐条出现用 2 步而不是淡入。
**注意**：屏幕内正文必须 ≥4.5:1（ink on lcd 已满足）；不要让像素字失去可读性——正文 14–15px、行高 1.7。

## 分区清单（h2 层级，按序）

1. 屏幕头（姓名/副标题/地点）
2. 备注（bio）
3. 明细（links）
4. 订单（projects）
5. 纪录（experience）
6. 技能（skills）
7. 结账（contact+合计）
8. 页脚

## 交付物

- `src/designs/pager/design.json`（参考 receipt/design.json：id / displayName / description / source: { type: 'self-produced' }）
- `src/designs/pager/DESIGN.md`（隐喻、配色/字体令牌、Named Rules、Layout、动效、六项字体记录 — 参考 receipt/DESIGN.md 结构）
- `src/designs/pager/Page.astro`（完整 `<html>` 文档；HeadMeta / Font / Reveal / ContextMenu）
- `src/designs/pager/style.css`（`@import "tailwindcss" source(none); @source "./";` + 全部样式，类前缀 `pa-`）
- `src/designs/pager/messages.ts`（三语；参考 receipt/messages.ts 的键设计）
