# govuk — 项目侧适配记录（ADAPTATION）

> `src/designs/govuk/DESIGN.md` 为 GOV.UK Design System 官方指南（[design-system.service.gov.uk](https://design-system.service.gov.uk/)，OGL v3）与 govuk-frontend 源码（MIT，© Crown copyright / GDS）的整合汇编（**整合完成即冻结**，只读、不得修改）；许可与逐节来源见同目录 `SOURCE-LICENSE.txt` 与 DESIGN.md 附录。
> 本文件记录项目实现相对规范的适配、增补与例外；当前验证状态见 `docs/verification/govuk.md`；归属规则见 `docs/README.md`。

## 来源与商标边界

- 不使用皇家纹章（Royal Arms）、GOV.UK 标识（logotype / 圆点 logo）或任何政府徽标——OGL v3 明确豁免 logos / crests / Royal Arms，且本项目无官方地位。
- 页面不出现 "GOV.UK" 品牌声明文案（页眉品牌位渲染的是资料姓名）；`design.json` 与切换页描述注明汇编来源与「非 GOV.UK 官方发布」；OGL 非背书条款（Non-endorsement）已核。
- 页脚采用 OGL 通用署名句式（见 `SOURCE-LICENSE.txt` 文末）。

## 字体（无自托管字体）

- 上游品牌字体 **GDS Transport** 仅限 GOV.UK 服务使用、不对外分发；官方回退口径即 Arial / Helvetica 系统栈（govuk-frontend 默认字族栈为 `"GDS Transport", arial, sans-serif`）。
- 页面按官方回退实施：`Arial, Helvetica, sans-serif` 系统栈，不注册 `astro.config` 字体、不新增依赖（本项目首个无自托管字体的设计，与 fast 同机制）。

## 图标与标记（项目约定）

- 不引入 GDS 图标资源；需要标记处沿用项目通用方案：`github` → 共享品牌 mark、`mail` → `@lucide/astro` Mail、外链 → `ArrowUpRight`（ADR 0002；仅映射存在才渲染，0.5.3 口径）。
- 按钮不渲染 start 箭头图标（未使用 `govuk-button--start` 的 arrow SVG 资产——本项目不复用 GDS 图像资源）。

## 组件实现口径（手写 CSS，不引入 govuk-frontend）

- button / tag / inset-text / summary list / section break 均为**结构复刻的手写实现**，数值逐条取自 govuk-frontend SCSS（MIT；对应文件见 DESIGN.md 附录 B）；**未引入 govuk-frontend 包或任何组件运行时**（项目惯例：个人主页不引入组件库）。
- 页眉品牌位 = 资料姓名（等宽? 否——30px 白色文本 + hover 3px 下划线，取值自 generic-header 的 logo 链接样式），不渲染任何官方 logo。

## 颜色事实（2026-10-11 上游状态）

- 上游 2025 品牌刷新后的**现行**功能色体系已按本次抓取实施（含：brand 蓝页眉 / 页脚 10px brand 顶边、功能 link `#1a65a6`、border `#cecece`、绿按钮 `#0f7a52`、蓝 tint 标签）；旧版黑页眉口径不在本汇编内。

## 动效（DESIGN.md Motion 章节范围内）

- **静态设计（决定静止，论证见 DESIGN.md）**：不采用入场动画、不接入共享 `Reveal`；唯一运动是按钮按压位移（`:active` 下移 2px 压入阴影，上游行为原样）。
- `prefers-reduced-motion` 下按压位移保持不变（瞬时状态变化，非动画）；无持续动效。

## 区块取舍（profile 字段）

- 核心字段全部渲染（name / headline / bio / links——links 以正文链接列表呈现）；扩展区块四类全取：projects（标题 + 段落 + 蓝标签）、experience（summary list 键值行）、skills（蓝标签行）、contact（inset text + 绿色按钮）。
- 实现细节与实测数值在 `docs/verification/govuk.md` 记录。

## 未测 / 限制

- 同 `docs/verification/govuk.md`；汇编原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。

## 检测器例外（有意为之 · 2026-10-11）

- `overused-font`（`font-family: Arial`，severity warning）：Arial 不是本设计的"选择"，而是**上游回退口径**——GDS Transport 不可分发、官方字族栈即 `"GDS Transport", arial, sans-serif`；不引入自托管替代字体以保持汇编忠实度（见上「字体」节）。检测器的"换一支有个性的字"建议与上游忠实度冲突，按上游优先。