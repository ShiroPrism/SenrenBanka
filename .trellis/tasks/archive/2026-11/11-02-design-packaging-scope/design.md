# 设计：设计打包范围配置

## 配置契约

```yaml
design:
  mode: random
  default: editorial
  manualSwitch: true
  exclude: []          # 部署级打包排除；缺省 [] = 全部注册设计
  random: { ... }
```

- `design.exclude` 为可选 `string[]`；ID 必须是已注册目录名。
- 缺省 `[]`：30 套全部打包。
- 全站全局一份，不按 locale 拆分。

## 四层术语

| 层 | 定义 | 来源 |
|---|---|---|
| Registered design | 目录存在且四件套/元数据通过 registry 校验 | `src/designs/<id>/` |
| Packaged design | 当前部署实际构建的设计集合 | registry 减去 `design.exclude` |
| Enabled design | 打包集合中进入随机池/切换页的设计 | `packaged ∩ design.json.enabled` |
| Default design | 必须是 packaged + enabled，承担默认页/无 JS 回退 | `design.default` |

`enabled` 不再隐含“页面一定构建”：页面是否构建由 packaged 决定；`enabled` 只在 packaged 内生效。

## 数据流与代码点

### 1. Schema

`src/content.config.ts` 的 `design` 段加入：

```ts
exclude: z.array(z.string().min(1)).default([]),
```

### 2. Astro 路由注入

`astro.config.mjs` 的 `readSiteConfig()` 增加 `exclude`：

- 读取 `raw.design.exclude`，只保留字符串；缺省 `[]`。
- `astro:config:setup` 中先得到全部目录 ID，再计算 `packagedIds = ids.filter(id => !exclude.includes(id))`。
- 多语言设计页循环、旧路径 `/<id>/` 循环都改用 `packagedIds`；`/<locale>/designs` 与 `/designs/` 仍按 `manualSwitch` 注入。
- 被排除设计不注入任何路由（包括旧跳转），因此不会生成 HTML，也不会生成该设计的 Page CSS。

### 3. SiteModel

`src/lib/site.ts`：

- `SiteModel` 增加 `packaged: readonly DesignEntry[]`。
- `enabled` 的含义改为“打包 ∩ 启用”，用于随机池、切换页、语言入口与菜单目标。
- 新增校验：
  - `exclude` 去重；重复 ID → 构建失败；
  - 未知 ID（不在 `allDesigns`）→ 构建失败；
  - `packagedDesigns` 为空 → 构建失败；
  - `design.default` 不在 packaged → 区分“被排除”与“未启用”的报错；
  - `visibleDesigns = packaged.filter(meta.enabled)` 为空 → 构建失败（保留“至少 1 个启用设计”）。
- 语言覆盖 / messages / descriptions 的循环从 `enabledDesigns` 改为 **packagedDesigns**；被排除设计不再要求这些内容完整。registry 仍对全部目录校验四件套与元数据。
- `buildDesignView()` 增加 packaged 检查：对未打包设计直接抛错，避免自定义页面绕过范围。`loadDesignView` / `loadDesignStrips` 自然继承。
- `designsForLocale()` 继续 `model.enabled.filter(designCovers)`，自动排除被排除设计。
- `model.designs` 仍是全部注册设计；`default` 仍是 `DesignEntry`。

### 4. 切换页与预览

- `SwitcherPage` 使用 `designsForLocale`（enabled），不列出被排除设计。
- `Preview.astro` 仍是 eager glob；被排除设计的预览 CSS / 描述可能仍在切换页 bundle 中，**已知限制**（PRD Out of Scope）。不修改预览 glob，避免引入构建期清单机制。
- `descriptions.ts` 继续包含全部设计描述；只有 enabled 设计会被渲染。

### 5. 配置与文档

- `src/data/site.config.yaml`：`design.exclude: []`，注释说明示例 `[magical-girl]`。
- `README`：新增“打包范围”条目；说明 exclude 缺省全部、被排除不构建、随机/切换页不出现、`enabled` 只在打包内生效。
- `SPEC` Q6 改写“站点配置不含设计清单”为“注册由目录发现；站点配置只含部署级 exclude”；§5.4 示例、§6.2 `enabled` 注释、§6.3 校验规则同步。
- `docs/rules/data-and-i18n.md`：加入四层术语与 `design.exclude` 契约；`design-contract.md` 不改。
- `CONTEXT.md`：Registered / Packaged / Enabled / Default design 四层术语。
- 新增 `docs/adr/0022-design-packaging-scope.md`，记录与 SPEC Q6 的关系、预览限制与替代方案。

## 校验错误文案（示例）

- 未知 ID：`design.exclude 包含未知设计 "foo"；可用：...`
- 重复 ID：`design.exclude 重复列出 "magical-girl"`
- 排除全部：`design.exclude 排除了所有设计；至少保留一套打包设计`
- 默认设计被排除：`design.default "editorial" 被 design.exclude 排除；默认设计必须打包`
- 默认设计未启用：`design.default "editorial" 不是已启用设计；...`

## 替代方案

- **每套 design.json 加 `packaged`**：不新增站点清单，但 fork 选多套要改多份；与“站点配置打包范围”的部署语义不符。
- **复用 `enabled` 兼任打包**：会改变既有语义（enabled:false 页面仍构建可直达），并破坏直接 URL 场景。
- **include 白名单**：适合小站，但默认全部 30 套的展示场景需要维护 30 个 ID；本轮先不做，留作后续扩展。
- **严格清除预览 CSS**：需要在构建期生成预览清单，超出本轮；先记录已知限制。

## 验证矩阵

- 默认构建：193 页；30 套设计页 + 30 个旧跳转 + 基础设施页不变。
- 排除构建：`design.exclude: [magical-girl]` → 187 页；每语言 29 套设计；无 `/locale/magical-girl/`、无 `/magical-girl/`；切换页 29 项；随机池 29。
- 错误构建：默认设计被排除、未知 ID、重复 ID、排除全部，均非零退出。
- 浏览器：排除构建的切换页不出现 magical-girl；直达 `/zh-cn/magical-girl/` 404；默认构建仍 30 套。
- 文档：ADR/术语/SPEC/README/rules 检查通过。
