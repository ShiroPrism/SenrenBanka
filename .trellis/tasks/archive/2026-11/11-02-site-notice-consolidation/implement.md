# 实施清单：站点级示例声明与 fork 配置约束

## 0. 规划与上下文

- [x] `prd.md` / `design.md` / `implement.md` 完成
- [x] `implement.jsonl` / `check.jsonl` 填入选定的规则与决策文档
- [x] `python ./.trellis/scripts/task.py validate 11-02-site-notice-consolidation`
- [x] `python ./.trellis/scripts/task.py start 11-02-site-notice-consolidation`

## 1. 数据层

- [x] `src/content.config.ts`：`localeSchema` 增加 `notice: z.string().trim().min(1).optional()`
- [x] `src/lib/site.ts`：`LocaleEntry` 增加 `notice?: string` 注释与字段
- [x] `src/data/site.config.yaml`：五个 locale 加 `notice`；注释说明示例站专用、fork 删除；同时保留 `title` / `description` / `locales` 的 fork 必改说明
- [x] 确认 `buildDesignView()` / `loadDesignStrips()` 无需额外映射即可携带 `notice`

## 2. 设计文案清理

- [x] 删除 16 套 `sampleNote` 接口字段与五语言值：aero / archive / brutal / cute-alism / deco / fairy-kei / fax / lexicon / pager / poster / radio / receipt / sticker-diary / tape / transit / zine
- [x] 删除 `ink.footerNote` 的示例声明字段与五语言值
- [x] 保留 `homepage99.footerNote` 与 `govuk.licenceNotice`
- [x] 检查：`grep -rn "sampleNote" src/designs` 应为 0；`grep -rn "footerNote" src/designs` 只剩 homepage99

## 3. 页面条件渲染（17 套）

- [x] aero / brutal / transit / zine：页脚 `<span>` 条件渲染
- [x] archive / cute-alism / deco / fax / lexicon / pager / poster / radio / sticker-diary：页脚 `<p>` 条件渲染
- [x] fairy-kei：品牌 `<span>` 后的 notice `<span>` 条件渲染
- [x] ink：`<span>{t.footerNote}</span>` 改为 `view.locale.notice` 条件渲染
- [x] receipt：`Ticket.astro` 的 `<p class="rc-sample">` 改为 `locale.notice` 条件渲染
- [x] tape：`SENRENBANKA · {t.cardTag}{view.locale.notice && <> · {view.locale.notice}</>}`
- [x] 每套检查 notice 缺失时无孤立 `·`、空 `<p>`、空 `<span>` 或多余间距
- [x] `npx prettier --write` 影响的 `.astro` / `.ts` 文件

## 4. 设计规范与文档

- [x] 更新受影响设计的 `DESIGN.md` 页脚描述：示例站显示可选站点声明，真实资料可省略（含 `receipt`）
- [x] `CONTEXT.md`：新增 **Site notice（站点声明）** 术语与 `_Avoid_`
- [x] 新增 `docs/adr/0021-site-notice-configuration.md`（背景 / 决策 / 结果 / 取舍 / 回滚）
- [x] `SPEC.md` §5.4 site 配置示例加入 `notice`；§6.4 `view.locale` 字段列表加入 `notice`
- [x] README 的 fork 必改列表加入 `notice`，说明示例站专用、真实资料删除
- [x] `docs/rules/data-and-i18n.md`：`view.locale` 加入 `notice`；fork 配置义务加入 `notice`
- [x] `npm run check:docs && npm run check:eol && npm run format:check`

## 5. 构建与静态验证

- [x] `npm run build` 通过（193 页；schema / astro check / html-only / 字体审计）
- [x] `npm test` 全绿
- [x] `npm run check` 全绿
- [x] 示例站 HTML：17 套页脚 notice 文案各出现；`sampleNote` / `footerNote` 旧键计数 0
- [x] 五语言 `notice` 文案抽查（zh-CN / zh-TW / ja / en / ko）

## 6. 浏览器与无声明构建

- [x] `npm run preview` 启动；Playwright 打开示例站 17 套设计，断言 notice 元素可见、文案正确、无 console 错误
- [x] 代表性设计（aero / tape / ink / cute-alism）1280 桌面 + 375×812 触控截图；无横向溢出
- [x] 备份 `src/data/site.config.yaml`，移除五处 `notice`，运行 `npx astro build --outDir .cache/verify-no-notice`
- [x] 无声明构建：17 套 notice 元素计数 0；tape 不含尾部孤立 `·`；无空 `<p>` / 空 `<span>` 占位
- [x] 恢复 `src/data/site.config.yaml`，确认 `git diff` 只含预期改动
- [x] 重新运行 `npm run build`（恢复示例 notice 后的最终产物）

## 7. 验证记录与收口

- [x] 更新 `docs/verification/shared.md`：本轮范围、构建/浏览器/无声明构建证据、未测项
- [x] 更新受影响设计的 `docs/verification/<id>.md`：页脚声明改为站点 notice，示例站可见 / 缺省隐藏；截图或共享记录引用
- [x] `impeccable detect` 抽查代表性设计；无新增发现
- [x] 最终 `npm run build` / `npm test` / `npm run check` 全绿
- [ ] 需要提交时按项目流程询问用户，不自动 commit
