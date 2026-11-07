# Retire magical-girl — 技术设计

> 退役是删除 + 当前态引用同步，不改视觉 / 数据契约。默认设计保持 `editorial`；不新增重定向。

## 1. 删除与保留

- 删除 `src/designs/magical-girl/`：目录自动发现，`registry.ts` / `astro.config.mjs` 不需要改代码。
- 删除 `docs/verification/magical-girl.md`；`docs/verification/assets/` 中带日期的截图 / JSON 保留为历史。
- 保留 `change-log/` 历史文件、`docs/adr/`、`.trellis/tasks/archive/`、workspace journal。
- 不建 `design.exclude` 占位；旧路由自然 404。

## 2. 当前态 vs 历史态

`docs/verification/shared.md` 同时含当前态与带日期的历史条目：

- **当前态**：顶部基线、默认构建段、切换页当前计数、`/zh-cn/designs/` 当前卡片数、检测器当前汇总。
- **历史态**：`>` 引用块、2026-10-29 六套可爱风、2026-11-02 exclude 实验、字体逐页表——保持原样，不回写成“现在时”。
- `docs/verification/action-menu.md` 第 142 行的 exclude 实验属于历史记录，保留。

## 3. 计数与版本

- 设计：28 → 27（27 styled + html-only → 26 styled + html-only）。
- 页面：181 → 175（每套 5 locale + 1 旧路径 = 6；以实际构建为准）。
- 字体脚本：`typography.mjs` / `typography.test.mjs` expected styled 27 → 26；`generatedFamilies` 仍 31。
- `fonts:coverage` 的 enforced scripts 计数按实际结果记录，不手改期望。
- 版本：`0.21.0` → `0.21.1`；新增 `change-log/0.21.1.md`。

## 4. 字体与产物

- `magical-girl` 使用 Fraunces / LXGW / Inter 等共享族；删除设计不删除字体配置。
- 删除后 `fonts:subset` / `fonts:prune` / `fonts:audit` 会按剩余引用页重算；记录字体文件数、核心子集体积与 dist 变化。
- 若 `generatedFamilies` 不为 31，暂停核对是否某族只被 magical-girl 使用；不要直接改期望值。

## 5. 路由与浏览器

- `/magical-girl/`、`/zh-cn/magical-girl/`、`/zh-tw/magical-girl/`、`/ja/magical-girl/`、`/en/magical-girl/`、`/ko/magical-girl/` 期望 404。
- 切换页 / 随机池 / 语言菜单 / 旧路径入口不出现 magical-girl。
- 375px 切换页无横向溢出；console 0。

## 6. 回滚

- 删除目录前记录 HEAD；如果误删，`git restore` 恢复 tracked 文件。
- 文档 / 版本改动可单文件 `git restore` 回退；不使用 `git reset --hard` / `git clean -fd`。
- 不提交、不归档直到用户确认（评审门）。
