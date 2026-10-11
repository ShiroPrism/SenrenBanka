# fast — 项目侧适配记录（ADAPTATION）

> `src/designs/fast/DESIGN.md` 为厂商官方快照（[microsoft/fast](https://github.com/microsoft/fast)，MIT；许可声明见同目录 `SOURCE-LICENSE.txt`），**只读、不得修改**。
> 本文件记录项目实现相对快照的适配与增补；当前验证状态见 `docs/verification/fast.md`；归属规则见 `docs/README.md`。

## 动效（复用快照 token，零新增）

- 入场动画（hero 4 项，复用 `--fast-duration-normal` / `--fast-curve-easy-ease`，30ms 错落）+ 共享滚动显现（卡片 / 经历行 60 / 50ms 错落）——机制见 ADR 0001 / 0003。
- 交互态：卡片 hover（面层 + 描边 + `translate: 0 -2px`）、按钮 `:active` `scale(0.97)`、页脚链接 hover——仅 `(hover: hover) and (pointer: fine)` 生效。

## 图标（ADR 0002）

- hero 按钮前置图标（品牌 mark / Mail；无 icon 配置不打标——2026-10-11 修订）+ 项目卡外链箭头；行内 svg 显式 `inline-block`（Preflight 兼容，坑已记入 `AGENTS.md` 已知坑）。

## 触控增补（快照未规定）

- `@media (pointer: coarse)`：`.fs-btn` `padding-block: 0.8rem`、其余 0.78rem（实测 46.8 / 44.2px）。

## 检测器

- 零发现（无例外）。

## 未测 / 限制

- 同 `docs/verification/fast.md`；快照原文见同目录 `DESIGN.md`（只读，不随项目适配改写）。