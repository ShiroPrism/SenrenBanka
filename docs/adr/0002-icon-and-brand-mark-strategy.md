# 图标与品牌标志：唯一图标库 lucide、品牌 marks 本地 vendored、按设计语言分发、缺省回退

## 背景与决定

要为四套设计补充图标与视觉元素（链接标识、外链提示），同时满足：静态部署无运行时图标请求、各设计互不统一风格、Tailwind CSS 4 的设计级 CSS 隔离不被破坏。决定：

1. **唯一图标库 = `@lucide/astro`**（Lucide 官方包，ISC）：构建期输出内联 SVG、零客户端 JS、按需 tree-shaking；只承担功能图标，不引入第二个图标库。Lucide 官方不含品牌 logo（其指引外部品牌标志使用 Simple Icons），品牌标志另行处理（见 2）。
2. **品牌标志 = 本地 vendored SVG**：数据取自 simple-icons（CC0-1.0），以文件形式落在 `src/assets/brand/<slug>.svg`（构建期内联、单色 `currentColor`），不安装 simple-icons 为依赖；每个资产的 url / 获取日期 / 许可 / 商标核对结论记入 `docs/verification/shared.md`（品牌资产 provenance 节）。**使用任何品牌标志前核对该品牌使用规范**（如 X 仅黑白、LinkedIn 官方色、GitHub 允许个人链接用途；无法核实的品牌不使用）。
3. **按设计语言分发，不强加统一风格**：editorial 克制（仅品牌 mark + 外链箭头，灰墨静态）；terminal 零 SVG，标记由既有字符语言承担（`label → url`）；oxide 仅品牌 marks（贴厂商 filled 图标语言，不引入 stroke 图标库）；fast 功能图标 + 品牌 marks（贴其 token 颜色角色）。
4. **接线：`links[].icon` 可选 slug + 各设计私有映射**：slug → 标记的映射写在各设计 `Page.astro`（几行条件渲染），未识别或缺省一律纯文本回退；不建共享映射模块、不做构建期 slug 校验（契约保持宽松）。标记一律 `aria-hidden`，可访问名由文本标签承担。
5. **样式归属各设计**：尺寸 / 描边 / 颜色 / 间距 / hover 全由各设计 `style.css` 控制；跨设计共享的只有资产文件本身（静态 SVG，无 CSS 边），不新增共享组件（避免 SPEC §3.2 的 CSS 聚合陷阱）。

## 被否决的选项

- **手绘全部图标**：风格不可控、来源不可溯，且无法利用 lucide 的 tree-shaking 与维护。
- **安装 simple-icons 为 npm 依赖**：当前仅需个别品牌资产，引入整包徒增依赖与 lockfile 面；vendored 文件已满足"本地、离线、静态"。
- **共享 Icon 封装组件**：增加跨设计共享边界（需维护 `@source` 与样式归属），违背"样式由设计自持"；各设计几行条件渲染的成本远低于此。
- **editorial / terminal 通用图标化**：editorial 自产规范要求克制、terminal 自产规范把标记限定为字符语言；引入图形图标违背两者规范。
- **oxide 引入 lucide**：lucide 为 stroke 风格，与厂商规范 Icons 章节的 filled 语言冲突。

## 后果

- 新增链接 slug 时：在目标设计的映射中加一行条件渲染，并按需从 simple-icons 增补资产文件（记录 provenance 与商标核对结论）。
- 图标视觉回归由各设计 `style.css` 承担；新增设计若要用图标，须先在 DESIGN.md 记录其图标语言。
- lucide 版本升级属于平台级变更，需重跑 `design-page-verify`。
- 厂商 `DESIGN.md`（oxide / fast）不改动；相关决策与验证记录见 `change-log/0.3.0.md` 与 `docs/verification/`。

## 修订（2026-10-10，v0.3.1）

项目所有者裁定「要么不用，要么全用」——同一链接列表面内不允许部分链接有标记、部分裸链接（fast 按钮行与 oxide CHANNELS 的"半用"截图实证）。本文件决定 3、4 修订如下：

1. **链接列表面 100% 标记**：`links[]` 枚举渲染的链接面（editorial Elsewhere / oxide CHANNELS / fast hero buttons；terminal 的 `→` 原本即全量）中，未映射或缺省 slug 的链接渲染该设计的**通用功能图标**（`@lucide/astro` 的 `Globe`），不再纯文本回退。初版「纯文本回退是特性」因造成同一列表半用视觉不一致，**被否决**。
2. **oxide 功能图标改用 lucide（outlined 呈现）**：厂商规范 Icons 章节允许 outlined variants，故品牌仍为本地 mark（filled）、功能图标（Mail / Globe）以 1.5 描边呈现；原「oxide 不引入 lucide」收窄为「oxide 的品牌不使用图标库近似、功能图标可 outlined」。
3. **边界不变**：链接列表面之外的链接（页脚邀请、Contact CTA、切换器）保留各设计原生 affordance（无图标或 `▸`），不受"全用"约束。

## 修订（2026-10-11）

项目所有者裁定：**未配置 `icon` 的链接不得渲染默认标记**（旧「Globe 回退」在无 icon 配置的链接上造成误导）。2026-10-10 修订（v0.3.1）第 1 条「链接列表面 100% 标记」与第 3 条的「全用」表述即行失效；现行口径：

1. **按配置逐条标记**：`links[].icon` 仅当目标设计存在映射时渲染对应标记（editorial / oxide：`github` → 品牌 mark、`mail` → Mail；fast 同）；未配置 / 未映射一律不渲染图标（可访问名由文本标签承担）。同一列表允许按配置混合带标 / 无标链接。
2. **oxide 功能图标 outlined 呈现**（2026-10-10 修订第 2 条）维持有效。
3. **边界不变**：链接列表面之外（页脚邀请 / Contact CTA / 切换器）保留各设计原生 affordance。

同时：editorial 移除 mailto distill 去重——Elsewhere 全量渲染 `links[]`，与数据契约「links 必须全部渲染」对齐。