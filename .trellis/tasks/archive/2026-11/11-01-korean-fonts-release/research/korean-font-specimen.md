# 韩语字体样张目检

- 日期：2026-11-01
- 方法：本地 HTTP 服务 + Playwright 全页截图；6 个源字体；正文 17px、标题 30px；Galmuri11 额外 11px；Noto Sans Mono 额外 15px。
- 截图：`korean-font-specimen.png`（同目录）。
- 控制台：仅 favicon 404，无字体加载错误。

| 族 | 结论 | 备注 |
|---|---|---|
| Gothic A1 | 通过 | 中性无衬线，正文灰度均匀；合成粗体可接受；Hanja 样本正常显示。 |
| Gowun Batang | 通过 | 明朝体正文自然，长文可读；合成粗体可接受；字面较宽但不影响 17px 正文。 |
| Galmuri11 | 通过 | 11px 像素网格清晰，30px 标题呈像素化；用于 pixel 设计的目标字号成立；Hanja 样本正常。 |
| Noto Sans Mono CJK KR | 通过 | 等宽网格稳定，Hangul/Latin/数字对齐；15px 正文可读；Hanja 样本正常。 |
| Dongle | 通过 | 圆体气质明显，17px 正文可读；合成粗体可接受。 |
| Poor Story | 通过 | 马克笔手写气质明显，17px 正文可读；合成粗体可接受；适合标签/短段落，不适合大段密集正文。 |

结论：6 族均保留在原映射中，无需换族。Galmuri11 仅用于 pixel 设计并在目标字号使用；Poor Story 仅用于 sticker-diary / tape 的短文案与标签场景。Hanja 覆盖不作为设计要求，主站用 Hangul-only `unicode-range` 隔离。
