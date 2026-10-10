# 四套设计的差异化动效增强：规范先行、各设计自持视觉、滚动进度用 CSS Scroll-Driven

## 背景与决定

v0.2.0 的动效只覆盖"厂商规范已授权"的 oxide / fast；editorial / terminal 按各自自产规范的限定保持静止（ADR 0001 决定 1）。v0.4.0 增强四套设计的动画表现力，同时保持差异与克制，决定：

1. **自产规范先行。** editorial / terminal 突破原有"唯一动效"限定之前，先修订各自 `DESIGN.md` 的 Motion 章节（含 Don't 条款），再实现代码——规范与实现不允许互相矛盾。
2. **差异化优先，每套一个可辨识的"动效声音"。** editorial = 印刷（墨色渗入 + 发丝线绘制）；terminal = 字符网格上的离散步进（打字级联 / 落屏 / 闪烁 / 呼吸灯）；oxide = 仪表（滚动进度线 + ASCII 波形流动 + 短促悬停过渡）；fast = 层次与触感（错落入场 + 卡片悬停面层/描边/浮起 + 按压缩放）。禁止四套收敛为同一套"淡入 + 上移 + 延迟"。
3. **oxide 滚动进度线用 CSS Scroll-Driven Animations**（`animation-timeline: scroll(root block)`），`@supports` 门控、零 JS；不支持（Firefox stable 截至 2026-10 仍在 flag 后）或 `prefers-reduced-motion: reduce` 时整条隐藏——默认态即"无此元素"。进度线**不得用于内容显隐**，仅为装饰性读数。
4. **不新增任何运行时 JavaScript / 依赖。** 打字 = Astro 构建期切分字符 + CSS 离散步进（`steps()`）；波形流动 = `transform` 位移（linear 恒定动效）；级联延迟 = 内联 `--d` / `--reveal-delay` 变量。共享 `src/lib/reveal.ts` 保持不变，editorial / terminal 以同一门控契约接入。
5. **性能与可读性约束照旧：** 运动只动 `opacity` / `transform`（交互态短促颜色过渡除外）；核心内容不等待（首屏 ≤0.8s 全部落定；正文不做逐字打印）；持续动效仅限小范围元素。
6. **厂商快照（oxide / fast 的 `DESIGN.md`）不改动；** 实现相对快照的取舍记录在 `SPEC §18` 与 `change-log/0.4.0.md`（如：ASCII 波形流动是对"Motion explains a change"的有意扩展，依据规范自身的"ASCII can drive motion"与"linear 用于恒定动效"条款）。

## 被否决的选项

- **JS 滚动监听做进度条**：增加脚本与主线程开销；CSS Scroll-Driven 已可零 JS 达成，且不引入第二套滚动观察器。
- **统一动画配置引擎 / 全局参数表**：四套设计视觉语言互不相同，抽象会制造耦合；动效参数留在各自 `style.css`。
- **给所有区块统一加 Reveal**：违背各设计节奏。editorial 只让栏目头 / 作品行 / Elsewhere 链接 / 页脚参与；terminal 只做块级级联；oxide / fast 在既有目标集上新增列表项与页脚目标。
- **终端对正文逐字打印**：要等待才能阅读，违背"内容及时可见"。
- **editorial 用位移 / 回弹表达**：与"印刷"隐喻冲突（墨不跳），改用 opacity + 划线。

## 后果

- 四套设计均加载共享 reveal 脚本并接受门控契约（无 JS / 无 IO / 减动态 / 脚本失败 → 内容始终可见）。
- editorial / terminal 的 `DESIGN.md` Motion 章节与 Don't 条款已同步修订（2026-10-10）；`AGENTS.md` 动效约定、`CONTEXT.md` 术语同步。
- oxide / fast 的偏差与取舍记录在 `SPEC §18`；验证按 `design-page-verify` 全流程执行（含四套动效实测与降级仿真）。