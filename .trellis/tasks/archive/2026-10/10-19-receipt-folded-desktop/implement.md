# implement.md — receipt 桌面折叠双栏执行计划

## 执行顺序

1. 读取本任务 `prd.md` / `design.md`，并复核 receipt 当前源码与验证记录。
2. 修改 `src/designs/receipt/Page.astro`：改用 `loadDesignView`，只渲染一份 `<Ticket>`。
3. 修改 `src/designs/receipt/Ticket.astro`：移除 `isCurrent`，把正文分区包进 `rc-fold-body`，保留自然 DOM 顺序。
4. 修改 `src/designs/receipt/style.css`：实现宽票、CSS 多栏自动平衡双栏、折痕、断点与移动端单栏；清理三联规则。
5. 修改 `src/designs/receipt/messages.ts`：删除 `railTitle`，三语言同步。
6. 修改 `src/designs/receipt/DESIGN.md`：把 Triplicate Rule 与布局 / 组件 / Motion / Project Contract 更新为折叠双栏。
7. 运行构建与类型检查，修复编译 / 样式问题。
8. 启动 preview，按验证清单实测桌面、断点、移动端、三语言、动效和降级。
9. 更新 `docs/verification/receipt.md` 为当前事实。
10. 运行检测器与产物抽查，确认 CSS 隔离和字体不变。
11. 清理临时文件，向用户汇总改动与验证结果。

## 验证命令

```bash
npm run build
npm run check
npm run preview
node .local-fonts/dev/design-probe.mjs http://localhost:4321/zh-cn/receipt/
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/receipt
```

浏览器实测：

- 1440×900：双栏、无横向滚动、左右台面留白、字段完整。
- 1024×800：双栏且可读。
- 1000×800：单栏。
- 375×812 + 触控：单栏、无横向溢出、共享菜单可开合、链接命中区。
- `/zh-cn/receipt/`、`/ja/receipt/`、`/en/receipt/` 三语言文案与 `lang`。
- reduced-motion / 无 JS / 无 IO / IO 抛错四情形。

## 验证门槛

- 构建绿，`astro check` 0 错误 / 0 警告。
- 检测器零发现或已记录例外。
- CSS 隔离成立，无第三方运行时资源。
- 桌面 1440 的纸张宽度约 68–72rem，左右留白约 8–15%。
- 双栏正文行宽约 40–50ch，左右栏高度自然平衡，英文不溢出。
- 所有 `[data-reveal]` 场景隐藏元素为 0。

## 风险文件

| 文件 | 风险 | 回滚 |
|---|---|---|
| `src/designs/receipt/Page.astro` | 数据接口切换、菜单配置 | 恢复 `loadDesignStrips` |
| `src/designs/receipt/Ticket.astro` | DOM 结构与 id | 恢复三联组件 |
| `src/designs/receipt/style.css` | 双栏网格、撕边、动效 | 恢复三联规则 |
| `src/designs/receipt/messages.ts` | 删除 `railTitle` 影响三语类型 | 恢复键 |
| `src/designs/receipt/DESIGN.md` | 规范与实现不同步 | 恢复 Triplicate Rule |
| `docs/verification/receipt.md` | 过期断言 | 恢复旧记录 |

## 完成条件

- PRD 所有 AC 有实测证据。
- 设计规范、验证记录、代码三者一致。
- 用户验收前不归档任务、不提交无关改动。
