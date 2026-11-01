# C1 Handoff：韩语字体 catalog v1.1.0

- catalog URL：https://github.com/whitehair-failure/SenrenBanka-fonts/releases/download/catalog-v1.1.0/catalog.json
- catalog SHA-256：`a61b225c5edca6a3b023fdfa1d3ef2ffdb0c1b3b98f81cd4c5c0dbe26b399029`
- catalog 版本：1.1.0；家族数：26
- bootstrap：`bootstrap-sources-v1.1.0.zip`，SHA-256 `be37a7f0c2aa828776fd91d4e8fd5825fbd2cb012d21670ddf313144d92376f9`（含 12 个既有 bootstrap-only 源；6 个韩语源均有直链）
- 自测：`npm test` 61/61；`catalog:validate` 26 families（9 core / 17 fixed）；`release:verify --dir artifacts --compare-dir artifacts-repro` → `reproducible: true`
- 既有 20 族：catalog v1.0.0 → v1.1.0 的 package/source SHA 零漂移

## 6 个韩语核心族

| id | version | role | scripts | package | package sha256 | package size | source | source sha256 | source size |
|---|---|---|---|---|---|---|---|---|---|
| dongle | 1.0.0 | core-cjk | hangul | dongle-v1.0.0.tar.gz | 6747a64710c2702bf05094a1c51c5421392bfd9ba02fb16c6c2ddefcf8da88ac | 560993 | dongle-v1.0.0-source.tar.gz | eccd5d507dd0881e9dde1705068fe984937d1a5cd6f85202d8975afd3357b4a4 | 588955 |
| galmuri11 | 1.0.0 | core-cjk | hangul | galmuri11-v1.0.0.tar.gz | ff0bddadc948b17da57d837c2bccea528ae09cd1ee9e0a396c33138f079329d4 | 958025 | galmuri11-v1.0.0-source.tar.gz | 855d09544486c05df7b8da3812ab33579438b1cf0e57f0b649f60ce5e4caf4b1 | 822561 |
| gothic-a1 | 1.0.0 | core-cjk | hangul | gothic-a1-v1.0.0.tar.gz | 0676a713da31934e213044ce8407314e74adb95751edb82ce794100f47d7c0b2 | 1076181 | gothic-a1-v1.0.0-source.tar.gz | ba342698cde5e06653cae6628c98d430f8ffa0cd54aa529b134fa5f2c0a66846 | 705408 |
| gowun-batang | 1.0.0 | core-cjk | hangul | gowun-batang-v1.0.0.tar.gz | cf0169c3649b2cd5be4e3c437d729715f8fd07e448701d59b07ce0c93798c62d | 1550101 | gowun-batang-v1.0.0-source.tar.gz | 923e1c71a1be746a7ebadd37702d857d426902126b385fc48a6a526c44af764d | 1791459 |
| noto-sans-mono-cjk-kr | 1.0.0 | core-cjk | hangul | noto-sans-mono-cjk-kr-v1.0.0.tar.gz | 9648b3d72d54a55d63c9664107419fe170b2211ce2f6e45beddc25725d49aec5 | 13359018 | noto-sans-mono-cjk-kr-v1.0.0-source.tar.gz | dfc462e8a1f7121e3e6d88317939a2f83d8660a538cff33a81ea2c08335943bc | 13658884 |
| poor-story | 1.0.0 | core-cjk | hangul | poor-story-v1.0.0.tar.gz | 7b46ae909810f1f5cd518edc22cdf00c27784e962b3f17832d6e96536542e9d7 | 1104724 | poor-story-v1.0.0-source.tar.gz | 3c9bf189c842cb51e3f7beacc3b338fafa5f8b02b2028b2bf4fd713bb67398d5 | 1003394 |

## 源固定

- Gothic A1 / Gowun Batang / Dongle / Poor Story：Google Fonts commit `6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec`。
- Galmuri11：`quiple/galmuri` v2.40.4。
- Noto Sans Mono CJK KR：`notofonts/noto-cjk` Sans2.004；使用 noto-cjk 静态 OTF，不用 Google Fonts VF。
- 6 族均 OFL-1.1、无 RFN；license 文件已入 `licenses/<id>/LICENSE.txt`。

## 主站接入要点（C2）

- `fonts.config.json` 增加 6 条（cssVariable：`--font-gothic-a1` / `--font-gowun-batang` / `--font-galmuri11` / `--font-noto-sans-mono-cjk-kr` / `--font-dongle` / `--font-poor-story`）。
- `fonts:update --catalog-url <上述 URL> --catalog-sha256 <上述 SHA>` 更新 lock/snapshot/generated。
- `fonts:prepare` 会下载 6 个 package + 6 个 source archive；`fonts:check` 离线复核。
- `scripts` 字段已写入 catalog；主站 catalog loader 必须保留该字段。
- Noto Sans Mono CJK KR 的 descriptor 使用 `output.subsetStrategy: "subset-font"`：cn-font-split 的最终分片对该字体不稳定，改用确定性码位分块 + subset-font；主站内容子集不受影响。

## 已知风险

- 6 个 source archive 合计约 41 MB；`fonts:prepare` 构建期下载量增加，访客 dist 不受影响。
- Noto Mono 带 Hanja；主站必须用 Hangul-only `unicode-range` 隔离。
- 现有 20 族包字节已逐字节复核不变；发布时仍由 `release:verify` 再校验。
