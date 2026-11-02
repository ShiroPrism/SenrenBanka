# 实施清单：设计打包范围配置

## 0. 规划与上下文

- [x] `prd.md` / `design.md` / `implement.md` 完成
- [x] `implement.jsonl` / `check.jsonl` 写入规则与决策文档
- [x] `python ./.trellis/scripts/task.py validate 11-02-design-packaging-scope`
- [x] `python ./.trellis/scripts/task.py start 11-02-design-packaging-scope`

## 1. 配置与 Schema

- [x] `src/data/site.config.yaml` 的 `design` 段增加 `exclude: []` 与注释（示例 `[magical-girl]`）
- [x] 更新文件头注释：注册仍由目录发现，站点配置只维护部署级排除名单
- [x] `src/content.config.ts` 的 `design` 段增加 `exclude: z.array(z.string().min(1)).default([])`

## 2. 路由注入

- [x] `astro.config.mjs` 的 `readSiteConfig()` 读取 `design.exclude`（字符串数组，缺省 `[]`）
- [x] `astro:config:setup` 计算 `packagedIds = ids - exclude`
- [x] 多语言设计页循环与旧路径 `/<id>/` 循环改用 `packagedIds`
- [x] 确认 `/magical-girl` 旧跳转也不会注入

## 3. SiteModel 与校验

- [x] `SiteModel` 增加 `packaged`
- [x] `loadSite()` 校验 exclude 重复 / 未知 ID / 排除全部 / default 被排除 / 无启用设计
- [x] `packagedDesigns = allDesigns - exclude`；`visibleDesigns = packaged ∩ enabled`
- [x] 语言覆盖 / messages / descriptions 循环改为 packagedDesigns
- [x] `enabled` 返回 visibleDesigns；`designsForLocale` 继续基于 enabled
- [x] `buildDesignView()` 增加 packaged 检查
- [x] 确认 `loadDesignView` / `loadDesignStrips` 对未打包设计报错

## 4. 文档与术语

- [x] `CONTEXT.md` 增加 Registered / Packaged / Enabled / Default 四层术语；更新 Default design 定义
- [x] 新增 `docs/adr/0022-design-packaging-scope.md`
- [x] `SPEC.md` Q6 / §5.4 / §6.2 / §6.3 更新
- [x] README 增加 `design.exclude` 打包范围说明
- [x] `docs/rules/data-and-i18n.md` 增加打包范围规则与校验
- [x] `npm run check:docs && npm run check:eol && npm run format:check`

## 5. 默认构建

- [x] `npm run build` 通过；确认仍为 193 页、无 exclude 时 30 套全部打包
- [x] `npm test` 全绿
- [x] `npm run check` 全绿
- [x] 抽查默认构建 `/magical-girl/` 与 `/zh-cn/magical-girl/` 仍存在

## 6. 排除构建

- [x] 备份 `src/data/site.config.yaml`，设置 `exclude: [magical-girl]`
- [x] `npx astro build --outDir .cache/verify-packaged` 成功
- [x] 断言：187 页；无 `*/magical-girl/` HTML；无 `/magical-girl/` 旧跳转；每语言切换页 29 项；随机池不含 magical-girl
- [x] 检查被排除设计的 Page CSS 未生成（预览 CSS 允许残留，记录为已知限制）
- [x] 恢复配置；`git diff` 只含预期改动
- [x] 错误构建抽查：default 被排除 / 未知 ID / 重复 ID / 排除全部 → 非零退出且文案可读

## 7. 浏览器与验证记录

- [x] 静态服务器/预览验证排除构建：切换页不出现 magical-girl；直达 `/zh-cn/magical-girl/` 404；无横向溢出
- [x] 375×812 抽查切换页与 404；截图归档
- [x] 更新 `docs/verification/shared.md`：默认/排除构建证据、已知预览限制、未测项
- [x] 抽查受影响的入口页 / 切换页 / 404 验证文档
- [x] 最终 `npm run build` / `npm test` / `npm run check` 全绿
- [ ] 需要提交时按项目流程询问用户，不自动 commit
