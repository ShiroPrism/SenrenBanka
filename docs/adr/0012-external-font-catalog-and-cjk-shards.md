# 外部字体目录与核心 CJK 分片：锁定发行物，设计 CSS 拥有回退链

SenrenBanka 将 20 个项目自有字体族从主仓库二进制迁出，改用独立 `SenrenBanka-fonts` 仓库发布的版本化目录与家族包。主项目通过 `fonts.lock.json` 固定目录版本、家族版本、包哈希、文件清单和覆盖元数据；普通构建只读取经 `fonts:prepare` 校验的 `.cache/fonts/`。Zhuque Fangsong、LXGW WenKai GB 与 Ark Pixel 12px 使用源字体完整 cmap 的 `unicode-range` 分片，不再按当前仓库文案生成站点子集。

Astro 生成的每个 `--font-*` 变量只暴露主 face：所有 npm 与 local registration 都使用 `fallbacks: []`，local registration 同时设置 `optimizedFallbacks: false`。完整 fallback 顺序由各设计自己的 `style.css` / 预览样式拥有；核心 CJK 变量之后必须依次出现系统中文字体与通用族兜底，系统 CJK 不得被封装在拉丁字体变量内部并抢在 Zhuque / LXGW / Ark Pixel 之前命中。

## 背景

- 旧链路把四个核心 CJK 字体按站内固定文本裁成单体 WOFF2。资料内容一旦新增字符，裁字不会自动重跑，页面会无提示地回退系统字体。
- `.local-fonts/` 与字体源文件只存在于开发者本机，干净 clone、CI 和 fork 无法重建裁字结果。
- 六个 Fontsource npm provider family 虽可在本地解析，但 Astro 若把完整系统 fallback 写进注册变量，拉丁字体变量内部会先命中系统中文，使后置的 core-cjk 变量看似存在却没有参与普通排版。
- 单一“总字体包”会把未启用 family 和许可证一起塞进每个构建，并让新增字体继续修改主项目工具代码。独立 family package、目录快照和显式锁更符合许可与缓存边界。

## 决策

### 1. 目录与家族发行物

- `SenrenBanka-fonts` 是发布源；每个 family 使用独立 SemVer 与 `font-<id>-v<version>` Release，目录版本使用独立 `catalog-v<version>` Release。
- 每个 family package 包含 manifest、生产字体、许可与覆盖信息；完整源字体另包发布，不进入站点普通构建。
- catalog 只记录不可变 Release 指针与 SHA-256。主项目显式执行 `fonts:update` 才更新 lock、离线快照和生成注册；安装与普通构建不得追 latest。

### 2. 完整 CJK 分片

- `role: core-cjk` 的 family 按源字体完整 cmap 生成互不重叠的 `unicode-range` 分片。
- 当前锁定的 catalog v1.0.0 包含 Zhuque 161 分片、LXGW 328 分片、Ark Pixel 55 分片。
- 分片完整性由 package manifest 与逐文件 SHA 保证；源 cmap 本身缺字只由 `fonts:audit` 告警，不能伪装成打包失败。

### 3. Primary-face Font variables

- `astro.config.mjs` 中六个 npm family 与 `src/fonts/generated.ts` 展开的全部 local family 都设置 `fallbacks: []`。
- 所有 registration 设置 `optimizedFallbacks: false`，避免 Astro 为 fallback metrics 建立额外构建期路径。
- `fonts.config.json` 与 catalog manifest 中的 fallback 字段只作为目录元数据和人工映射校验，不得写进浏览器 `--font-*` 变量。
- `npm run fonts:typography` 对配置、生成注册与所有 `styled` 设计（含预览样式）执行静态门禁：使用字体变量的 `font` / `font-family` 必须以显式 fallback 收尾；系统 CJK 不得排在 core-cjk 变量之前。

### 4. 设计 CSS 拥有排版顺序

典型顺序为：

```css
font-family:
  var(--font-latin),
  var(--font-zhuque),
  "Songti SC",
  "SimSun",
  serif;
```

每套设计按自己的文字角色组合变量；拉丁字体可以继续用于纯拉丁声部，但只要同一栈承诺 CJK，就必须在系统中文之前放入相应 core-cjk 变量。浏览器验证必须使用真实页面普通排版产生的字体请求或 CDP 平台字体信息，不得用强制 `document.fonts.load()` 制造命中。

## 考虑过的替代方案

| 方案 | 否决理由 |
|---|---|
| 继续提交按站内文案裁出的 WOFF2 | fork 后新增字符无法覆盖；每次资料变化都要求本机源文件与裁字工具，违背可移植性。 |
| 主仓库提交完整单体 CJK 字体 | 体积过大，首访下载不可控；字体许可与二进制生命周期仍混在应用仓库。 |
| 每个设计按需裁字 | 把构建变成内容相关流水线，缓存与发布不可复现，且新增语言 / 资料会重新引入缺字。 |
| 把所有系统 fallback 留在 Astro 字体变量 | 拉丁变量内部先命中系统中文字体，后置核心字体不参与正常排版；多字体声部无法按字符正确组合。 |
| 运行时请求第三方字体服务 | 违反自托管、离线构建与隐私边界。 |

## 后果

- 主仓库只保存锁、快照、生成注册与来源索引，不再跟踪生产字体二进制。
- 干净 clone 多一个显式 `npm run fonts:prepare`；准备后 `fonts:check` 与普通构建完全离线。
- 新增字体继续需要人工决定 app-only 启用关系与设计 CSS 回退顺序，但无需复制下载器、解包器或分片生成代码。
- 首访可能请求多枚核心 CJK 分片；浏览器只按命中的 `unicode-range` 取件，换取任意资料文字时不再依赖重裁。
- 设计 CSS 的维护责任略增；`fonts:typography`、HTML 审计与浏览器普通排版证据共同防止回退顺序回退。

## 回滚

- 应用回滚：恢复上一组 `fonts.lock.json`、`fonts.catalog.json` 与 `src/fonts/generated.ts`，再执行 `npm run fonts:prepare`。
- 字体发布回滚：不得覆盖既有 Release；恢复旧目录快照并发布新的 catalog version 指向旧 family version。
- 代码回滚：主仓库与字体仓库独立提交。主仓库恢复旧提交可重新引入当时跟踪的字体资产；发布流程仍不得重写既有标签或资产。
