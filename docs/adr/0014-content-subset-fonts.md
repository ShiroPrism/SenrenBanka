# 核心字体内容子集：源字体保持完整，部署按最终文本生成字形子集

SenrenBanka 在 `astro build` 之后、`fonts:prune` 之前新增 `fonts:subset`：从外部字体目录的 source archive 读取三套核心 CJK 源字体，按最终 `dist` 的文本生成每族一个 HarfBuzz/WASM 字形子集，替换页面上的分片 `@font-face` 规则。源字体、catalog、lock 与生成注册保持不变；部署只带当前构建需要的字形。`dist` 上限从 15 MiB 收紧到 10 MiB。

## 背景

- ADR 0013 的分片裁剪把 `dist` 从 33.50 MiB 降到 13.85 MiB，但核心字体仍占 7.85 MiB：LXGW 4.00、Zhuque 3.04、Ark Pixel 0.81 MiB。
- 站点最终文本只有约 1,261 个不同字符；70 KiB 目标分片携带了远多于实际需要的字形槽。继续缩小分片目标收益有限（Zhuque 16 KiB 目标实测只从 3.04 MiB 降到 2.71 MiB），还会增加请求数。
- 外部字体目录已经发布 source archive（含源 TTF/OTF、license、source-manifest），`fonts.lock.json` 已记录 source 指针与哈希；fork 用户可以通过 `fonts:prepare` 获取，不需要本机字体。
- `subset-font@2.9.0` 使用 HarfBuzz WASM，跨平台、无需 Python/fontTools；实测三套核心字体子集合计 691,332 B，保留全部 OpenType layout features。
- LXGW 的 OFL 附加许可允许 web-only 子集化/WOFF2 转换（不得作为可安装桌面字体分发）；Zhuque / Ark Pixel 无 Reserved Font Name。

## 决策

### 1. 源字体完整、部署子集化

- `fonts:prepare` 为 `role: core-cjk` 的 family 下载并验证 source archive；source cache 位于 `.cache/font-sources/`，包含 source font、license、source-manifest 与 marker。
- `fonts:check` 完全离线校验 source cache；缺失时构建失败并提示 `fonts:prepare`。
- `fonts:subset` 扫描最终 `dist` 的全部文本资产（HTML/CSS/JS/JSON/SVG/XML/TXT，解码实体与 CSS 转义），用固定版本的 `subset-font` 为每个核心 family 生成一个 WOFF2 子集，写到 `dist/_astro/fonts/<family>-subset-<hash>.woff2`。
- 逐页把核心 family 的全部分片 `@font-face` 规则替换为一条不带 `unicode-range` 的子集规则；其他 CSS、字体变量、设计页面与文案不变。
- `fonts:prune` 随后外置字体 CSS、删除已无引用的核心分片，并保留非核心字体的分片裁剪；`dist` 上限为 10 MiB。

### 2. 审计按真实子集 cmap

- `fonts:audit` 遇到无 `unicode-range` 的规则时，用 `fontkitten` 解析部署字体并读取 `characterSet`，不再把无范围规则当作全覆盖。
- 源字体覆盖但部署子集缺失的 CJK 字符 = 构建失败；源字体本身缺字仍警告。
- 悬空 URL、孤儿字体文件、第三方 URL 与机器路径检查保持不变。

### 3. 许可与 provenance

- source cache 保留 source archive 的 license 与 `source-manifest.json`；部署子集仅为 Web WOFF2，不发布可安装桌面字体。
- `subset-font`（BSD-3-Clause）与 `fontkitten`（MIT）固定版本；subset report 记录源文件、语料、subsetter 版本与输出哈希，保证可复现。
- 新增本 ADR；ADR 0013 的分片裁剪继续承担非核心字体与回退路径，但其“拒绝字形子集”在 10 MiB 目标下由本 ADR 取代。

### 4. fork / CI 流程

```text
npm ci
npm run fonts:prepare   # packages + three core source archives
npm run build           # fonts:check -> check -> astro build -> fonts:subset -> fonts:prune -> audit
```

prepare 之后构建完全离线；source cache 不入库，CI 按 lock/source 哈希复用。fork 用户不需要 Python、fontTools 或本地字体。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| 继续使用完整分片（ADR 0013） | 核心字体仍 7.85 MiB，dist 13.85 MiB；分片粒度造成大量未用字形。 |
| 更小分片 chunk | Zhuque 16 KiB 目标只降到 2.71 MiB；增加请求数，收益不足。 |
| 只用 switcher 预览字体裁剪 | 仅省约 1.9 MiB，且降低切换页设计保真。 |
| 把子集字体提交进主仓库 | 资料/文案变化后失效，fork 无法覆盖自己的内容。 |
| 要求 fork 用户安装 Python/fontTools 或本地字体 | 违背可移植性；source archive + WASM subsetter 已能完成。 |
| 保留全部字形、只外置 CSS | 仍约 27 MiB，无法满足体积目标。 |

## 后果

- 核心字体从 7.85 MiB 降到约 0.67 MiB；当前 `dist` 从 13.85 MiB 降到约 5.76 MiB；代表页面核心字体请求从 30+ 分片降为 1 个文件。
- 资料或文案变化会改变语料哈希与子集文件哈希，需要重新构建；这是静态站点的正常行为。源字体与锁不变。
- `fonts:prepare` 需要额外下载约 20 MB source archive（缓存一次）；构建仍离线。
- 子集器/字体解析器成为固定 devDependencies；升级需要重新验证确定性、layout features 与许可。
- 审计必须解析部署字体的真实 cmap；不能用“无 unicode-range = 全覆盖”的假设。

## 回滚

- 从 `package.json` 移除 `fonts:subset`、新增依赖与 build 步骤，删除 `scripts/fonts/subset.mjs`、source-cache 模块、`subset-font`/`fontkitten` 依赖及对应测试。
- 恢复 `SIZE_LIMIT_BYTES` 与文档为 15 MiB，重新构建即可回到 ADR 0013 的分片裁剪产物。
- source cache 在 `.cache/`，不需回滚；catalog、lock、generated 与源字体从未被修改。
