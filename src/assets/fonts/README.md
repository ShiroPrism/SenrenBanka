# src/assets/fonts — 生产字体资产

> 本目录是**生产字体**的唯一来源：`astro.config.mjs` 的 `fonts` 以 `fontProviders.local()` 读取本目录文件；
> 构建期零网络、全平台可复现。选型流程与六项记录见 `docs/fonts/selection-guide.md`；
> 隔离决策见 `docs/adr/0008-local-font-library-isolation.md`。
> **不要**手工修改字体文件；如需更新或扩字，用 `.local-fonts/tools/` 下的脚本重新生成（见文末）。

## 清单（本地 18 个目录 / 20 个注册族，56 文件（其中 37 个字体文件）≈1.49MiB；许可文本与字体同目录）

| 目录 | 家族 / 注册名 | 来源 | 许可 | 说明 |
|---|---|---|---|---|
| `cutive-mono/` | Cutive Mono | @fontsource/cutive-mono | OFL-1.1 | 拉丁等宽，latin + latin-ext |
| `courier-prime/` | Courier Prime | @fontsource/courier-prime | OFL-1.1 | 400/700 × 正/斜 × latin/ext |
| `sorts-mill-goudy/` | Sorts Mill Goudy | @fontsource/sorts-mill-goudy | OFL-1.1（RFN） | oldstyle 衬线 + 斜体 |
| `share-tech-mono/` | Share Tech Mono | @fontsource/share-tech-mono | OFL-1.1（RFN "Share"） | 工业等宽 |
| `league-mono/` | League Mono | @fontsource/league-mono | OFL-1.1 | 400/700 技术等宽 |
| `silkscreen/` | Silkscreen | @fontsource/silkscreen | OFL-1.1 | 像素 400/700 |
| `prociono/` | Prociono | @fontsource/prociono | OFL-1.1（RFN） | 罗马衬线 |
| `handjet/` | Handjet Variable | @fontsource-variable/handjet | OFL-1.1 | 可变像素（wght/ELGR/ELSH） |
| `league-gothic/` | League Gothic Variable | @fontsource-variable/league-gothic | OFL-1.1 | 窄体 wdth 75–100 |
| `blackout/` | Blackout 2AM | theleagueof/blackout | OFL-1.1（RFN） | stencil 镂空 |
| `uglytypist/` | UglyTypist | fontlibrary.org（CSS 资产通道） | OFL-1.1（内嵌声明） | 手写 |
| `format-1452/` | Format 1452 | velvetyne/Format_1452 | OFL-1.1 | DIN 式面板字 |
| `fredoka/` | Fredoka Variable | @fontsource-variable/fredoka | OFL-1.1 | 圆润拉丁展示字；wght 300–700，latin + latin-ext |
| `dseg/` | DSEG7 / DSEG14 Classic | keshikan/DSEG（npm dseg） | OFL-1.1（RFN "DSEG"） | 7 段 / 14 段，400/700 |
| `tt2020/` | TT2020 Base / Style D | ctrlcctrlv/TT2020 | OFL-1.1 | 磨损打字机；Style D 为**子集** |
| `zhuque-fangsong/` | Zhuque Fangsong（朱雀仿宋） | TrionesType/zhuque v0.212 | OFL-1.1 | 简中 GB2312 全量，**站内用字子集** |
| `ark-pixel-12px/` | Ark Pixel 12px（方舟像素） | TakWolf/ark-pixel-font | OFL-1.1 | 12px 网格中文像素，**子集** |
| `lxgw-wenkai/` | LXGW WenKai GB Medium（霞鹜文楷） | lxgw/LxgwWenkaiGB | OFL-1.1 | 简中 / 假名暖手写声部，**站内用字子集（294KB）** |

- **既有 6 款 npm provider 字体**（Fraunces / JetBrains Mono / Roboto Flex / Geist / Geist Mono / Inter）不在本目录，仍由 `@fontsource-variable/*` 包提供。
- **RFN（Reserved Font Name）**：DSEG / Share Tech Mono / Sorts Mill Goudy / Prociono / Blackout——当前均为**原样分发**；若对它们做子集或修改产生新文件，须遵守改名要求。
- 子集现状：`ZhuqueFangsong-Regular-subset.woff2`（≈246KB）、`ark-pixel-12px-monospaced-zh_hans-subset.woff2`（≈39KB）、`TT2020StyleD-Regular-subset.woff2`（≈304KB）、`LXGWWenKaiGB-Medium-subset.woff2`（≈294KB）——字符集为站内现有用字。
- **新设计引入新汉字时**：重跑子集脚本并复验字形覆盖（子集缺字会静默回退系统字体，需用 `document.fonts.check()` 与字形指纹验证）。

## 再生成（本机工作台，不入库）

```bash
# npm 包 → 入库 + 许可文本（.local-fonts/tools/vendor-fonts.sh）
bash .local-fonts/tools/vendor-fonts.sh
# CJK / 磨损字体子集（.local-fonts/tools/make-web-subsets.py）
python .local-fonts/tools/make-web-subsets.py
```

> `.local-fonts/` 已被 `.gitignore` 的 `.*/` 规则排除；个人字体库（`F:\Fonts`）只作发现与样张，**不得**被 `src/` / `public/` / `astro.config.mjs` 直接引用。
