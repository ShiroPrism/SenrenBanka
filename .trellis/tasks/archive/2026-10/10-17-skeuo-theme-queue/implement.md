# implement.md — 拟物主题队列：执行计划

> **父任务不上 start**；实施发生在各子任务。本文件 = 执行协议 + 每套检查清单 + 验证命令 + 回滚点。
> 前置阅读：`prd.md`（需求与验收）、`design.md`（机制 / 字体资产 / 决策缘由）。

## 执行模式（每套 = 一个子任务）

1. 创建子任务：`python ./.trellis/scripts/task.py create "<id>（<隐喻>）" --slug <id> --parent 10-17-skeuo-theme-queue`
2. 子任务规划：读 `docs/rules/visual-language.md` 字体节 + `docs/fonts/selection-guide.md` + 本队列 `design.md` → 收敛该套「隐喻 / 信息结构 / 布局机制 / 字体组合」→ 写子任务 prd / design / implement → **用户确认后 `task.py start`**。
3. 实施（按下方检查清单）→ 验证全绿 → 交付用户验收 → `task.py archive` 子任务。
4. 7 套全部完成后：父任务整合复查（prd A8）→ 归档父任务。

**顺序**：archive → radio → fax → pager → tape → poster → lexicon（无硬技术依赖；建议 archive 先行，完整复刻 receipt 流水线作为第二基准）。每套完成即交付验收；下一套启动时点由用户决定。

## 每套检查清单（子任务级）

- [ ] 1. **字体复核**：预选组合 → 必要时样张（8795 在线池 / 8794 本地库）目检 → DESIGN.md 六项选型记录草案
- [ ] 2. **五件套实现**：`design.json`（`source: self-produced`）/ `DESIGN.md`（令牌 + 隐喻 + 六项记录）/ `Page.astro` / `style.css` / `messages.ts`（三语）
- [ ] 3. **接线**：registry 自动（目录存在即注册）；`descriptions.ts` 增三语条目；字体 `<Font>` + `@theme inline` 映射
- [ ] 4. `npm run build` 绿且 `astro check` 0/0/0
- [ ] 5. **探针**：`node .local-fonts/dev/design-probe.mjs http://localhost:4321/zh-cn/<id>/`（console 0；四口径视口内隐藏 0；断点 + 移动端菜单集成按该套定义）
- [ ] 6. **检测器**：`.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/<id>` = 0
- [ ] 7. **截图**：桌面（断点两侧）/ 移动 375 / 日文页 → `.local-fonts/dev/preview/`
- [ ] 8. **验证记录**：`docs/verification/<id>.md`（结构对照 `docs/verification/receipt.md`）
- [ ] 9. **隔离抽查**：本页仅链接自身 CSS；不混入他套选择器；dist 无库文件 / 本机路径 / 第三方域名
- [ ] 10. **交付用户验收**（预览 + 截图 + 验证摘要；否决则回炉）

## 验证命令速查

```bash
npm run build
npm run preview   # http://localhost:4321
node .local-fonts/dev/design-probe.mjs <url>
.agents/skills/impeccable/scripts/impeccable.cmd detect --json src/designs/<id>

# 截图（示例：桌面 1440）
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --no-first-run --no-default-browser-check \
  --user-data-dir="F:/SenrenBanka/.local-fonts/dev/chrome-rc" \
  --screenshot="F:/SenrenBanka/.local-fonts/dev/preview/<id>-1440.png" --window-size=1440,900 \
  --virtual-time-budget=15000 "http://localhost:4321/zh-cn/<id>/"

# 背景/颜色像素采样（改色后必做）
python -c "from PIL import Image; im=Image.open('<png>').convert('RGB'); print(im.getpixel((10,400)))"
```

## 风险文件 / 回滚点

| 文件 | 变更方式 | 回滚 |
|---|---|---|
| `src/designs/<id>/` | 新增目录（五件套） | 删除目录 |
| `src/designs/descriptions.ts` | 只增条目（三语） | 删条目 |
| `astro.config.mjs` | 仅当该套需要**池外**字体（需先回报用户） | 删该条目 |
| `src/lib/site.ts` | 预期不动 | — |
| `docs/verification/<id>.md` | 新增（更新式） | 删文件 |
| `docs/README.md` / `docs/rules/` / `AGENTS.md` | 仅当索引/规则需要（通配已覆盖时不改） | 还原 |

- **版本号 / change-log**：**全部 7 套完成后**统一决策（备选 0.11.0）；中途不升版本（沿用 0.10.0+「未升版本」提交先例）。
- 每套档案记录在用户验收通过后归档子任务；父任务等 7 套全部归档后做 A8 整合复查。

## 交付给用户的验收包（每套）

1. 预览链接（`npm run preview` + `/zh-cn/<id>/`）
2. 截图 3~4 张（桌面全景 / 细节 / 移动 / 日文）
3. 验证摘要（构建 / 检测器 / 探针关键值 / 字体字形证据）
4. `docs/verification/<id>.md` 链接

## 与 receipt 待办的关系（R6）

- receipt 精修清单由用户给出后：小改动随下一套任务顺带处理；较大改动（布局级）单开任务。
- `descriptions.ts` 的 receipt 条目在 receipt 精修时一并补录。
