# Magical Girl — 技术设计

## Page and Data

- `loadDesignView('magical-girl', Astro.url.pathname)`；完整文档、HeadMeta、末尾 ContextMenu。
- 根节点 `data-mg-root`；hero 身份档案、links 道具栏、projects 星轨章回、experience 年表、skills 封印、contact 信件。
- 头像存在时进入徽章/相框；不存在时使用原创轮廓与星轨构图，不出现空白占位。

## Visual System

- `.mg` / `mg-*`；冷白、深莓红、玫粉、浅金、少量紫罗兰；不使用默认紫白渐变。
- 原创 SVG 绘制星形轨迹、丝带、魔法阵与网点框线；装饰层级低于文字，关键信息使用不透明底。
- 字体：Fraunces italic display → LXGW → Inter body；中文标题可单独落 LXGW。

## JS Entrance

- `script.ts` 只在非减动态环境执行；使用 Web Animations API 编排 SVG 轨迹与卡片 transform/opacity，总时长 800–1200ms。
- 内容初始即为最终可访问态；动画失败由 catch 忽略，不设置会隐藏内容的持久属性，不使用全屏遮罩。
- 不在页面隐藏后继续循环；不得自动播放音频，装饰星点不无限闪烁。

## A11y, Responsive, Preview

- 每个 stage/章回 section 有可访问名称；装饰 SVG、星轨、网点 `aria-hidden`。
- 移动端去除绝对轨道偏移，hero 和章回按 DOM 顺序单列；375px 无横向溢出。
- Preview：莓红包边档案卡、两道星轨、丝带和一封小封印；导出 `--font-fraunces`, `--font-lxgw`, `--font-inter`。
