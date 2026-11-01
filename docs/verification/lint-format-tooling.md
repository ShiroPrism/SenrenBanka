# Prettier + ESLint + LF 行尾工具链验证

> **验证日期**：2026-11-01
> **范围**：新增 Prettier / ESLint / EditorConfig / gitattributes / 行尾门禁；全量格式化源码与 CSS；修复存量 lint；接入 `check` / `build` / CI。
> **决策**：`docs/adr/0020-lint-format-and-lf-line-endings.md`。

## 基线

- `git ls-files --eol`：674 个文本文件 **index LF / worktree CRLF**，43 个 LF/LF，1 个 mixed，53 个二进制，35 个无换行；`core.autocrlf=true`。
- ESLint 10.14.0 基线：**69 errors / 0 warnings**（35 `preserve-caught-error`、27 `astro/no-exports-from-components`、5 `no-control-regex`、2 `no-useless-assignment`）。
- 代码规模：Astro 66 / CSS 52 / TS 43 / MJS 32（`src` + `scripts`），约 52,782 行（不含 137,162 行 generated.ts）。
- Prettier 基线：未归一化行尾时 198 个文件 check 失败；副本实测格式化约 104 个源码文件、约 1 万行空白变化。

## 工具链

| 包 | 版本 |
|---|---|
| prettier / prettier-plugin-astro | 3.9.10 / 1.1.2 |
| eslint / @eslint/js | 10.14.0 / 10.0.1 |
| typescript-eslint / eslint-plugin-astro | 8.72.1 / 3.2.1 |
| globals | 17.14.0 |

- `engines.node`：`^22.22.3 || ^24.16.0 || >=26.3.0`；`.nvmrc` 保持 24。
- 配置：`prettier.config.mjs`、`.prettierignore`、`eslint.config.mjs`、`.editorconfig`、`.gitattributes`。
- 脚本：`lint`、`format`、`format:check`、`check:eol`；`check` 已接入全部四项，`build` 自动继承。

## 变更

- 全量格式化受跟踪源码与配置：**152 文件，+8,576 / -5,055 行**（Astro 65、CSS 27、TS 12、MJS 33、JSON 13、YAML 6 等）；新增工具链文件未计入。
- 未格式化：`docs/`、Markdown、`src/fonts/generated.ts`、`fonts.catalog.json`、`fonts.lock.json`、`package-lock.json`。
- lint 修复：35 处 `{ cause: error }`；5 处 `no-control-regex` 局部豁免（tar/HTML 解析）；2 处计数器末尾自增局部豁免；27 个 Preview `fonts` 导出通过路径级配置豁免。
- 行尾：`.gitattributes` 固定 LF；工作区一次性归一化；新增 `scripts/check-line-endings.mjs`（4 个单元测试）与 `check:eol`。

## 结果

| 检查 | 结果 |
|---|---|
| `npm run lint` | 0 error / 0 warning |
| `npm run format:check` | 通过 |
| `npm run check:eol` | 通过 |
| `npm test` | **84/84** |
| `npm run build` | 通过，175 页 |
| `astro check` | 0 error / 1 既有 hint（lexicon unused `entry`） |
| `fonts:audit` | 0 部署缺口 / 0 孤儿 / 64 条既有源字体缺字警告 |
| `dist` | **7,632,396 → 7,634,316 B**（+1,920 B，+0.025%） |
| `git ls-files --eol` | 文本文件全部 `i/lf w/lf`；0 `w/crlf` / `w/mixed` |

## 行为与视觉

- 175 个页面 `extractVisibleText` SHA-256 与格式化前 **全部一致**（0 missing / 0 added / 0 changed）。
- 为排除动效与随机状态，额外创建 HEAD（格式化前）临时 worktree 构建，并在 `prefers-reduced-motion: reduce` + 禁用 animation/transition 的相同条件下截图：
  - 6 个代表页（`zh-tw/archive`、`zh-tw/terminal`、`zh-cn/little-forest`、`ko/editorial`、`ja/pager`、`en/html-only`）× 1440×900 / 375×812 = **12/12 像素差 0**。
  - 直接对比旧基线截图时，archive / terminal 出现动效帧与光标闪烁差异；确定性对比证明与格式化无关。
- `/zh-cn/designs/`：**27 个卡片 / 27 个预览**，console 0 error；`Preview.astro` 的 `fonts` 导出契约未破坏。
- 构建日志无新增 404 或资源缺失。

## 未测项

- Firefox / Safari / iOS / Android 真机、200% 缩放、`--base /demo`。
- 未重跑 28 套设计的完整 `design-page-verify` 全矩阵；本次以 175 页可见文本哈希 + 6 个代表页确定性像素对比 + 完整 build/audit 作为格式化改动证据。
- CDP 平台字体信息未采集（字体行为未变，沿用上一轮验证）。

## 环境备注

- 安装依赖时 `npm ci` 被上一轮遗留的 Astro dev/preview 进程锁住 `lightningcss`；停止这两个开发服务后完成干净安装。源码与产物不受影响。
- 调研阶段的临时 `node_modules.bak` 已删除；`git status` 无残留。
