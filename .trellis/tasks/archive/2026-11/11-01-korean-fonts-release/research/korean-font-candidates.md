# 韩文字体候选调研

> 调研日期：2026-11-01。只读调研：未修改 `F:\SenrenBanka` 与 `F:\SenrenBanka-fonts`。下载/测量在临时目录完成。
>
> 目的：为「韩语覆盖全部 27 套设计」选定可进入字体仓库的韩语核心族，并验证许可、源文件、谚文覆盖、Hanja 风险与部署体积。

## 1. 结论摘要

- 选定 6 个韩语核心族，全部 `OFL-1.1`、无 RFN、单 Regular 400：
  - **Gothic A1**：中性无衬线基线，0 Hanja。
  - **Gowun Batang**：衬线/明朝体，0 Hanja。
  - **Galmuri11**：韩文像素，带 Hanja（用 Hangul-only 路由隔离）。
  - **Noto Sans Mono CJK KR**：韩文等宽，带 Hanja（用 Hangul-only 路由隔离）。
  - **Dongle**：圆体/可爱，0 Hanja。
  - **Poor Story**：手写/马克笔，0 Hanja。
- 不用 Noto Sans KR / Noto Serif KR：带 Hanja，全站语料子集 256/390 KB；Gothic A1/Gowun Batang 更小且无 RFN。
- 不用 Black Han Sans：只覆盖 2,581/11,172 个谚文音节，缺字会静默 tofu。
- 不用 D2Coding / Pretendard / Nanum / IBM Plex：字体仓库 `renameSfntFont` 对真实 TTF 失败，RFN 无法满足；修复后再评估替换 Gothic A1 / Noto Mono。
- 韩语族必须排在 LXGW 之前，并使用 Hangul-only `unicode-range`：
  - LXGW 自带 11,172 个谚文音节，7 套设计在用；排在它后面永远不会命中韩语。
  - 韩文字体普遍带 Hanja（Spoqa 912/912、Noto 653/912、Noto Mono 912/912、Galmuri 690/912）；只靠栈顺序会劫持汉字。
- Hangul-only 子集估算合计约 **178 KB**；四语 `dist` 预计约 **5.35 MB**，低于 10 MiB 门禁。

## 2. 字体仓库管线约束

来自 `F:\SenrenBanka-fonts\docs\ADDING-A-FONT.md`、`docs/LICENSING.md`、`schemas/family.schema.json`、`scripts/lib/build-family.mjs`、`scripts/lib/font.mjs`：

| # | 约束 | 对韩语候选的影响 |
|---|---|---|
| 1 | `core-cjk` = 一个未压缩 TTF/OTF 源、一个 face、`chunkSize 71680`、`languageAreas:true`、`fontFeature:true` | 多字重族只能选一个静态 face，或走 `fixed` |
| 2 | 主站 `subset.mjs` `coreFaces()` 对 >1 个 face 直接抛错；`loadCoreSource()` 要求恰好一个源文件 | 每族只发 Regular |
| 3 | `fixed` = 预构建 WOFF2、可多 face，但不做内容子集 | 韩语族不能走 `fixed`，否则体积不可控 |
| 4 | SPDX 允许 `OFL-1.1` / `Apache-2.0` / `CC0-1.0` | PF Stardust / Cafe24 / Gmarket Sans 等不在允许列表 |
| 5 | RFN `renamed` 要求 `output.rename.to` 且必须是 TrueType TTF；CFF/OTF 失败关闭 | Pretendard / Spoqa / D2Coding / IBM Plex / Nanum 都需要 rename |
| 6 | `renameSfntFont` 在真实 TTF 上失败（见 §7） | 5/6 RFN 候选当前不可用 |
| 7 | schema 支持可变字体 `weight: "100 900"`，但主站合成 `@font-face` 只有一个 weight 字符串 | 用静态 Regular，不用 VF |
| 8 | Google Noto KR VF 默认实例是 Thin（Sans）/ ExtraLight（Serif） | 不能用 VF 直接部署 |
| 9 | 主站 10 MiB `dist` 门禁；当前 5,147,903 B | 约 5.3 MB 余量 |
| 10 | `scripts/fonts/audit.mjs` 的 `CJK_RANGES` 不含 Hangul | 韩语缺字不会被现有审计捕获 |
| 11 | `scripts/fonts/typography.mjs` 硬编码 3 个 CJK 核心变量、无韩文系统字体、硬编码 20 families / 26 styled | 主站接入必须扩展 |
| 12 | 主站已有 `:lang(zh-CN)` 作用域先例（`archive/style.css:237`） | `:lang(ko)` 可用，但首选 Hangul-only `unicode-range` |

## 3. 语料与测量方法

- 语料：`src/data/profiles/ko.yaml` + 27 套 `messages.ts` 的 `ko` 块 + `descriptions.ts` 的 `ko` 描述，合并当前 `dist` 文本。
- 规模：**1,444 个唯一码位**（280 个谚文音节、912 个汉字、66 个 ASCII），179 个文本文件。
- 用 `subset-font 2.9.0` 生成 WOFF2；用 `fontkitten 1.0.3` 读取真实 cmap。
- 两列尺寸：
  - **merged W2**：按全站语料子集（含 Hanja/Latin），是当前核心子集管线的上界。
  - **ko W2**：只按韩文文本子集，接近 Hangul-only 路由的实际部署成本。
- 部署结论以 **ko W2** 为准；merged W2 用于说明 Hanja 体积风险。

## 4. 候选矩阵

| 族（face） | 来源 / 版本 | 格式, 字节 | 谚文音节 | Hanja（语料 912） | merged W2 | ko W2 | 许可 / RFN | 结论 |
|---|---|---|---:|---:|---:|---:|---|---|
| **Gothic A1 Regular** | Google Fonts `ofl/gothica1` | 静态 TTF 2,295,400 | 11,172 + 256 Jamo | 0 | 50,208 | 33,620 | OFL-1.1，无 RFN | **选：中性无衬线** |
| **Gowun Batang Regular** | Google Fonts `ofl/gowunbatang` | 静态 TTF 8,433,296 | 11,172 | 0 | 49,688 | 42,584 | OFL-1.1，无 RFN | **选：衬线/明朝** |
| **Galmuri11 Regular** | `quiple/galmuri` v2.40.4 | 静态 TTF 5,376,428 | 11,172 | 6,477（690/912） | 44,836 | 8,960 | OFL-1.1，无 RFN | **选：像素** |
| **Noto Sans Mono CJK KR Regular** | `notofonts/noto-cjk` Sans2.004 | 静态 OTF 16,389,532 | 11,172 + Jamo | 20,976（912/912） | 441,788 | 53,152 | OFL-1.1，无 RFN | **选：等宽**（替代 D2Coding） |
| **Dongle Regular** | Google Fonts `ofl/dongle` | 静态 TTF 4,458,600 | 11,172 | 0 | 19,580 | 15,264 | OFL-1.1，无 RFN | **选：圆体/可爱** |
| **Poor Story Regular** | Google Fonts `ofl/poorstory` | 静态 TTF 3,966,768 | 11,172 | 0 | 29,088 | 24,420 | OFL-1.1，无 RFN | **选：手写** |
| Noto Sans KR Regular | noto-cjk Sans2.004 | 静态 OTF 4,644,748 | 11,172 + Jamo | 8,138（653/912） | 256,488 | 53,808 | OFL-1.1，无 RFN | 否决：Hanja + 体积 |
| Noto Serif KR Regular | noto-cjk Serif2.003 | 静态 OTF 7,669,020 | 11,172 + Jamo | 8,138（653/912） | 390,300 | 101,328 | OFL-1.1，无 RFN | 否决：Hanja + 体积 |
| Pretendard Regular | orioncactus v1.3.9 | TTF 2,725,828 / OTF 1,574,352 | 11,172 | 0 | 48,356 | 29,496 | OFL-1.1，RFN `Pretendard` | 暂缓：rename 失败 |
| Spoqa Han Sans Neo Regular | spoqa v3.3.0 | TTF 13,452,464 | 11,172 + Jamo | 20,945（912/912） | 169,688 | 21,108 | OFL-1.1，RFN `Spoqa Han Sans Neo` | 否决：Hanja + 源巨大 + rename |
| IBM Plex Sans KR Regular | IBM plex-sans-kr 1.1.0 | TTF 2,539,548 / OTF 1,051,004 | 11,172 | 0 | 34,836 | 28,140 | OFL-1.1，RFN `Plex` | 暂缓：rename + 商标命名 |
| Gowun Dodum Regular | Google Fonts | TTF 7,229,088 | 11,172 | 0 | 39,384 | 33,696 | OFL-1.1，无 RFN | 备选：过软 |
| Nanum Gothic / Myeongjo / Coding / Pen | Google Fonts | 2.0–3.2 MB | 11,172 | 0 | 45–80 KB | 38–69 KB | OFL-1.1，RFN `Nanum…` | 否决：rename 硬失败 |
| Song Myung | Google Fonts | TTF 2,035,300 | **2,350** | 0 | 58,080 | 51,128 | OFL-1.1，无 RFN | 否决：仅 21% 谚文 |
| Hahmlet VF | Google Fonts | VF 3,559,144 | **2,788** | 0 | 132,056 | 112,228 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Galmuri11 Condensed | 同 Galmuri | TTF 2,668,536 | 11,172 | 0 | 12,044 | 8,020 | OFL-1.1，无 RFN | 备选：过窄；用 normal + 路由即可 |
| Galmuri11Bitmap-* | 同 Galmuri | 0.78 MB | 11,172 | 10,909 | subset-font 失败 | — | OFL-1.1 | 否决：bitmap 破坏 HarfBuzz |
| NeoDunggeunmo | `neodgm` v1.601 | TTF 651,044 | 11,172 | 0 | 6,104 | 5,136 | OFL-1.1，RFN `NeoDunggeunmo` | 备选：rename 可用，但 16px 点阵 |
| D2Coding Regular | naver VER1.4.0 | TTF 4,119,796 | 11,172 | 4,620（576/912） | 145,492 | 37,040 | OFL-1.1，RFN `D2Coding` | 暂缓：rename 失败；未来替换 Noto Mono |
| Black Han Sans | Google Fonts | TTF 998,424 | **2,581** | 0 | 31,276 | 27,332 | OFL-1.1，无 RFN | 否决：谚文仅 23% |
| Do Hyeon | Google Fonts | TTF 879,764 | **2,437** | 0 | 31,140 | 25,792 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Jua | Google Fonts | TTF 2,119,352 | **2,367** | 0 | 77,840 | 68,396 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Gaegu | Google Fonts | TTF 3,165,816 | **2,350** | 0 | 61,556 | 53,304 | OFL-1.1，无 RFN | 否决：谚文不全 + 3 faces |
| Cute Font | Google Fonts | TTF 1,027,936 | **2,350** | 0 | 30,976 | 26,744 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Bagel Fat One | Google Fonts | TTF 1,585,984 | **2,783** | 0 | 61,812 | 52,648 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Gasoek One | Google Fonts | TTF 1,061,372 | **2,780** | 2 | 44,812 | 37,764 | OFL-1.1，无 RFN | 否决：谚文不全 |
| Gamja Flower | Google Fonts | TTF 12,615,444 | 11,172 | 0 | 75,952 | 48,524 | OFL-1.1，无 RFN | 备选手写：源过大 |
| Hi Melody | Google Fonts | TTF 12,623,412 | 11,172 | 0 | 71,336 | 45,256 | OFL-1.1，无 RFN | 备选手写：源过大 |
| DotGothic16 | Google Fonts | TTF 2,069,236 | **0** | 6,714 | 73,712 | 8,072 | OFL-1.1，无 RFN | 否决：无谚文 |

> 注：`merged W2` / `ko W2` 是调研环境的实测值；正式部署以主站 `fonts:subset` 的 Hangul-only 结果为准，允许少量差异。

## 5. 六族短名单

| # | 族 | 角色 | 映射设计 | 理由 | 风险 |
|---|---|---|---|---|---|
| 1 | Gothic A1 Regular | 中性无衬线 | brutal, fast, frost, govuk, homepage99, kern, material3, poster | 无 RFN、0 Hanja、11,172 音节、9 个静态字重上游 | 拉丁一般（但拉丁由设计字体先行） |
| 2 | Gowun Batang Regular | 衬线/明朝 | archive, deco, editorial, ink, lexicon, little-forest | 无 RFN、0 Hanja、11,172 音节、书卷气 | 字面较宽，密集正文需目检 |
| 3 | Galmuri11 Regular | 像素 | pager, pixel-pet-rpg, radio, receipt | 无 RFN、11,172 音节、与 Ark Pixel 12px 搭配 | 6,477 Hanja（路由隔离）；11px 栅格 |
| 4 | Noto Sans Mono CJK KR Regular | 等宽 | fax, oxide, terminal | 无 RFN、11,172 音节、真正的等宽 | 源 16.4 MB；912/912 Hanja（路由隔离） |
| 5 | Dongle Regular | 圆体/可爱 | cute-alism, fairy-kei, magical-girl | 无 RFN、0 Hanja、11,172 音节、圆角与 Fredoka 匹配 | 上游 3 个 face，只发 Regular |
| 6 | Poor Story Regular | 手写/马克笔 | sticker-diary, tape | 无 RFN、0 Hanja、11,172 音节、马克笔气质 | 单一字重；更「马克笔」而非「钢笔」 |

合计 Hangul-only 子集约 **178 KB**：

```text
Gothic A1       33,620
Gowun Batang    42,584
Galmuri11        8,960
Noto Mono       53,152
Dongle          15,264
Poor Story      24,420
----------------------
合计           178,000 B ≈ 174 KiB
```

四语 `dist` 预计 5,147,903 + ~178,000 + CSS/HTML 增量 ≈ **5.35 MB**，低于 10 MiB。

## 6. 设计映射

| 韩语族 | 设计 |
|---|---|
| Gothic A1 | brutal, fast, frost, govuk, homepage99, kern, material3, poster |
| Gowun Batang | archive, deco, editorial, ink, lexicon, little-forest |
| Galmuri11 | pager, pixel-pet-rpg, radio, receipt |
| Noto Sans Mono CJK KR | fax, oxide, terminal |
| Dongle | cute-alism, fairy-kei, magical-girl |
| Poor Story | sticker-diary, tape |
| 豁免 | html-only（零字体契约） |

现有 5 套 ko：

- `editorial` → Gowun Batang（替换 LXGW 韩文）
- `frost` / `fast` / `govuk` → Gothic A1
- `html-only` → 不变

判断点（视觉验收可微调）：

- `archive`：Gowun Batang（书卷气）vs Noto Mono（打字机/卡片目录）
- `poster`：Gothic A1（重标题）vs Gowun Batang（Zhuque 正文）
- `receipt`：Galmuri11（像素/热敏）vs Noto Mono（可读性）
- `tape`：Poor Story（手写标签）vs Noto Mono（曲目单）

## 7. RFN / 许可证据

全部短名单为 **OFL-1.1、无 Reserved Font Name**：

- Gothic A1 / Gowun Batang / Dongle / Poor Story：Google Fonts `ofl/<family>/OFL.txt`；版权行见文件头。
- Galmuri11：`quiple/galmuri` v2.40.4 `LICENSE.txt`；OFL-1.1，无 RFN。
- Noto Sans Mono CJK KR：`notofonts/noto-cjk` `LICENSE`；OFL-1.1，无 RFN。
  - 不要用 Google Fonts 的 `NotoSansKR[wght].ttf` / `NotoSerifKR[wght].ttf`：OFL 声明 RFN `'Source'`，且默认实例为 Thin/ExtraLight。

### `renameSfntFont` 实测

用字体仓库自带 `scripts/lib/font.mjs` 对真实文件执行：

| 源 | 结果 |
|---|---|
| `neodgm.ttf`（RFN `NeoDunggeunmo`） | OK → family 改成 `Senren Dot`，post 表完整 |
| `Pretendard-Regular.ttf` | FAIL：`Cannot read properties of undefined (reading 'italicAngle')` |
| `SpoqaHanSansNeo-Regular.ttf` | FAIL：同上 |
| `D2Coding-Ver1.4.0.ttf` | FAIL：同上 |
| `IBMPlexSansKR-Regular.ttf` | FAIL：同上 |
| `Galmuri11.ttf`（无 RFN 对照组） | FAIL：同上 → 与 RFN 无关，是 font-shape 问题 |
| `NanumGothic-Regular.ttf` | FAIL：`RFN rename requires pure ASCII for legacy Mac name records` |
| `Pretendard-Regular.otf` | FAIL：CFF 不支持 |

结论：当前只有 NeoDunggeunmo 可 rename；Pretendard / D2Coding / Nanum / IBM Plex 不可用。修复 `renameSfntFont` 是独立工具链任务，不在本轮范围。

## 8. 源文件与固定策略

### Google Fonts（pin commit `6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec`）

```bash
GF=https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl
curl -sSLo GothicA1-Regular.ttf      $GF/gothica1/GothicA1-Regular.ttf
curl -sSLo GowunBatang-Regular.ttf   $GF/gowunbatang/GowunBatang-Regular.ttf
curl -sSLo Dongle-Regular.ttf        $GF/dongle/Dongle-Regular.ttf
curl -sSLo PoorStory-Regular.ttf     $GF/poorstory/PoorStory-Regular.ttf
curl -sSLo gothica1-OFL.txt          $GF/gothica1/OFL.txt
curl -sSLo gowunbatang-OFL.txt       $GF/gowunbatang/OFL.txt
curl -sSLo dongle-OFL.txt            $GF/dongle/OFL.txt
curl -sSLo poorstory-OFL.txt         $GF/poorstory/OFL.txt
```

调研阶段的截断哈希（实现时必须重算完整 SHA-256）：

- Gothic A1 `211151be…76c21ac`
- Gowun Batang `466c593e…74e9849`
- Dongle `2966e7a9…ce9741`
- Poor Story `831ab87f…b7ee2`

### Galmuri11

```bash
curl -sSLo Galmuri-v2.40.4.zip https://github.com/quiple/galmuri/releases/download/v2.40.4/Galmuri-v2.40.4.zip
unzip -j Galmuri-v2.40.4.zip "Galmuri11.ttf" "LICENSE.txt" -d galmuri
# Galmuri11.ttf 截断 sha256: e24256f4…a5def1
```

### Noto Sans Mono CJK KR

```bash
curl -sSLo 12_NotoSansMonoCJKkr.zip https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/12_NotoSansMonoCJKkr.zip
unzip -j 12_NotoSansMonoCJKkr.zip "NotoSansMonoCJKkr-Regular.otf" "LICENSE" -d noto-mono
# NotoSansMonoCJKkr-Regular.otf 截断 sha256: d5afed99…79a472
```

## 9. 为什么不是 Noto Sans/Serif KR

- 带 Hanja：语料中 653/912 个汉字会被带进子集；全站语料子集 256/390 KB。
- 纯韩文子集 54/101 KB，仍大于 Gothic A1/Gowun Batang 的 34/43 KB。
- Noto Sans/Serif KR 是优秀的通用字体，但本项目需要的是「脚本伴生」而非「全 CJK 覆盖」；无 RFN、0 Hanja 的替代族更符合管线与体积约束。
- ADR 0016 把 Noto KR 作为未来目标；本任务用实测结果替代该计划，并在 ADR 0017 记录原因。

## 10. 风险 / 后续

- **Hangul-only 路由必须实现**：否则 Galmuri11 / Noto Mono 的 Hanja 会劫持汉字，LXGW 会抢走韩文。
- **主站门禁缺口**：`audit.mjs` 不含 Hangul；`typography.mjs` 只检查含 `--font-*` 的栈且硬编码 20/26；必须扩展并补测试。
- **合成粗体**：每族只有 Regular；韩文标题的合成粗体需目检，不合格再扩两个 face。
- **预加载**：Astro `<Font>` 可能预加载；非 ko 设计暂不注册。
- **源体积**：Noto Mono 16.4 MB、Gowun Batang 8.4 MB、Galmuri 5.4 MB；`fonts:prepare` 下载量与 CI 缓存需验证。
- **未来替换**：修复 `renameSfntFont` 后，可评估 Pretendard（0 Hanja、29 KB ko）替换 Gothic A1，D2Coding（37 KB ko）替换 Noto Mono。
