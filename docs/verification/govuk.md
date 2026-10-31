# verification — govuk（厂商来源：GOV.UK Design System 官方文档汇编，OGL v3 / MIT）

> 本文件是该主题**当前**的完整验证状态；重复验证时**更新本文件**，不追加历史快照（历史由 Git 保留）。
> 验证步骤与通过标准见 `design-page-verify` skill（`.agents/skills/design-page-verify/SKILL.md`）；记录归属见 `docs/README.md`。
> 汇编 `DESIGN.md` 为整合完成即冻结（只读，2026-10-11 按 2025 品牌刷新后的上游现状整合）；适配与例外记录在 `docs/designs/govuk/ADAPTATION.md`。
> 最近全流程验证：2026-10-11（v0.8.0 首建 + 全流程）；**2026-11-01 全设计字体层（ADR 0017）**：Arial / Helvetica → Gothic A1 → 系统韩文；`/ko/govuk/` 实测 `lang=ko`、Gothic A1 加载、0 console；1440 截图 `assets/korean-govuk-desktop.png`；未重跑完整浏览器矩阵。

## 构建与产物

- `npm run build` 11 页绿（`astro check` 0 错误 / 0 警告 / 0 提示）；注册表校验通过（`official-docs-derived` provenance 字段齐全）。
- CSS 隔离成立：本页恰 1 条自身样式链接（`Page.trtHX8ZC.css`，11,773 B）；`.gv-*` 选择器 64 个；其余 6 个设计 CSS 中 `.gv-` 计数全 **0**；根页 / 切换页 / 404 不链接任何设计 CSS。
- `BASE_PATH=/demo` 全链路前缀正确（HTML 内链 / CSS 全带 `/demo`；无未加前缀的 `/_astro` 引用）。
- 字体：**无自托管字体、`rel="preload"` 计数 0**——上游 GDS Transport 不可分发，按官方回退用 `Arial, Helvetica, sans-serif` 系统栈（本项目首个无字体资产的设计；与 fast 同机制）。
- 核心字段全部渲染（name 于页眉 / headline 为 h1 / bio / links）× 扩展区块四类（projects / experience / skills / contact）。

## 结构、token 与 a11y（桌面实测，1280×900）

- 标题层级：H1（headline）×1 → H2 ×4（Projects / Experience / Skills / Contact）→ H3 ×3（项目）无跳级；五个 `<section>` 全部具可访问名称（实测 5 处）。
- 链接可访问名干净（`GitHub` / `Email` / `博客` / 项目标题 ×2 / 邮箱按钮）；`aria-hidden` 标记 4 处（按钮 mark ×2、外链箭头 ×2）。
- 骨架实测：页眉 **brand 蓝 `rgb(29,112,184)`** + 白字（name 30px）；`.gv-container` 宽 **1020px**（1280 视口左右各 130px，内容左缘 160px——无贴边）；h1 **48 / 50px**；h2 36px。
- token 复核（computed）：按钮底 `#0F7A52` / 圆角 **0** / `box-shadow: #083D29 0 2px 0` / 高 38px（桌面原尺寸）；tag `#D2E2F1` 底 + `#0F385C` 字 / 圆角 **1px** / 19px **bold**（`<strong>` 渲染）；inset text 左界 **10px `#CECECE`**；链接 `#1A65A6` / 下划线 1px / offset ≈3px；summary list 桌面为 table、key 列 **288px（30%）**。
- Skip link：默认 `left: -9999px`（实测）；Tab 聚焦后 bg `#FFDD00` + 字 `#0B0C0C` + left 0（黄黑焦点实测）。
- **静态设计实测**：`[data-reveal]` 计数 **0**、门控属性未写入（DESIGN.md Motion 决定静止的论证；不接入共享 Reveal）。
- console：0 错误 / 0 警告；网络 0 请求失败 / 0 个 ≥400。

## 对比度（核算，实测 computed）

| 组合 | 对比度 |
|---|---|
| text `#0B0C0C` / white（h1 / 正文 / summary / inset） | 19.59 |
| secondary-text `#484949` / white（bio） | 9.03 |
| 白字 / brand `#1D70B8`（页眉，最低文字档之一） | 5.17 |
| link `#1A65A6` / white（最低文字档） | 6.08 |
| 白字 / 按钮绿 `#0F7A52` | 5.35 |
| tag `#0F385C` / `#D2E2F1` | 9.13 |
| text / footer 底 `#F4F8FB` | 18.34 |

- 全部 ≥4.5:1（AA 硬底线），最低 **5.17**（页眉白字 / brand 蓝）。

## 触控与移动端（375×812 + hasTouch / isMobile，dpr 2）

- `matchMedia('(pointer: coarse)').matches === true`。
- 零横向溢出（`scrollWidth == innerWidth == 375`）。
- 命中高度：`.gv-button` **46px**（coarse 下 padding 12/11，保持 1px 阴影补偿）；hero 链接 **49px**；项目标题链接 **49px**（coarse 下 0.75rem padding）。
- 折行与对齐：容器贴边 0 + 内容 15px 内边距（h1 左缘 15px）；标签组、summary 行单列正常换行。

## 检测器（impeccable）

- `detect --json src/designs/govuk` → **1 条** `overused-font`（`font-family: Arial`，severity warning）——**已记录例外**：Arial 为上游回退口径（GDS Transport 不可分发），非漂移（见 `ADAPTATION.md`「检测器例外」）。design/motion 类信号为零。
- 有效性反证：同命令对 oxide 命中 1 条已记录 advisory（`codex-grid-background`），检测器非空转。

## 切换页预览碎片（`Preview.astro`，2026-10-19）

- **视觉签名**：蓝色页眉、白底正文、方角链接与绿色实体按钮、底部粗横线；保留 GDS 的强对比与方形网格，不套用圆角卡片。
- **令牌抽取**：18 个颜色抽入 `tokens.css`，作用域 `:is(.gv, .gv-pv)`；正式页仅改声明位置。
- **字体**：预览与正式页共用 Arial / Helvetica 系统栈，导出 `fonts: []`，不新增请求。
- **隔离与字体边界**：预览不 import 正式页 `style.css`，无 `:root`、无可聚焦元素；本套未改字体接线与回退链，正式页仍与 HEAD 基线等价。
- **检测器**：预览与正式页各 1 条 `overused-font`，均属既有 Arial 上游回退例外；预览未新增字号或颜色发现。

## 字体审计（2026-10-19）

- **接线**：无自托管字体、无 `<Font>`、`Preview.astro` 导出 `fonts: []`；正式页与预览均使用 `Arial, Helvetica, sans-serif`。
- **保留理由**：GDS Transport 仅限 GOV.UK 服务使用、不可再分发；Arial 是上游明确回退口径。替换为 Inter / Geist 会偏离汇编忠实度并增加切换页请求，GOV.UK 的识别力来自蓝黑页眉、方形网格与信息层级。
- **覆盖与回退**：Arial 覆盖英文、数字与常用标点；无 CJK / 假名，中文回退 `PingFang SC` / `Microsoft YaHei`，日文回退 `Hiragino Sans` / `Yu Gothic UI`，通用族 `sans-serif` 收尾。
- **加载**：零字体请求、0 preload、无第三方字体域名；断网不影响版式。
- **记录归属**：完整六项记录见 `docs/designs/govuk/ADAPTATION.md`「字体选型记录」。

## 已定事项（结论）

- **2025 品牌刷新口径**：本次整合按当日上游现状（蓝页眉 / 功能 link `#1A65A6` / border `#CECECE` / 绿按钮 `#0F7A52` / 蓝 tint 标签），旧版黑页眉口径不在本汇编内——已记入 ADAPTATION。
- **静态设计**：无入场 / 显现动画（DESIGN.md 论证）；唯一运动为按钮按压位移（`top: 2px`，上游行为原样）——降级矩阵不适用（无门控机制；无 JS 时内容自始可见）。
- skip link 聚焦态实测通过（黄底黑字 + left 0）；页眉品牌位为资料姓名，未使用任何政府标识 / 纹章。

## 多语言（v0.9.0，2026-10-12）

- **语言切换入口 = 共享操作菜单内的语言分组**（`.cm-lang`，桌面二级子菜单 / 移动端平铺）：本设计**不渲染**可见语言切换器，`style.css` 中也**没有**语言切换样式。中性外观属项目 chrome，不模仿本设计。跨设计、跨输入环境的完整实测矩阵见 `docs/verification/action-menu.md`。
- 四语言页面：`<html lang>` 正确、robots 与 hreflang 策略正确（仅默认设计标注 hreflang）、二级菜单内 4 个语言项且目标**保持本设计 id**、**恰好 1 个** `aria-current="page"`、0 console 错误。
- 键盘可达：↑↓ 可遍历至语言项，焦点环可见（实测 `outline: 1.6px solid`）。
- 本设计 `style.css` 与改动前**逐字节一致**（仅末尾换行差异）——文案本地化与语言入口重构**未造成任何视觉漂移**。
- 跨语言路由与共享机制的完整测试矩阵见 `docs/verification/shared.md`。

## 未测 / 限制

- 真机（iOS / Android）与 Safari / Firefox 引擎未实测；触控实测基于 Chromium 1200 仿真。
- 本会话内置浏览器截图不可用（tab offscreen），截图与触控实测经本机 Playwright 同引擎执行。
- 截图归档：`C:\Users\lovelive\.trae-cn\trae-browser-screenshots\6acb6fb2351723235e449814\`（`verify-080-govuk-desktop-full.png`、`verify-080-govuk-mobile-375.png`；为验证机器本地路径，未随仓库分发）。
