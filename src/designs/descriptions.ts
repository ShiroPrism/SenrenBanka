/**
 * 各套设计在**切换页**上的本地化说明（SPEC §4）。
 *
 * - 与 `src/designs/<id>/messages.ts` 同源：这里只是把各设计的 `description`
 *   汇总成切换页可一次取用的索引，避免切换页去 import 8 个设计模块
 *   （那会给切换页带来不必要的模块边）。
 * - 纯数据，**不 import 任何 CSS / Page.astro / style.css**。
 * - 缺键时回退 `design.json.description`（英文/原始描述），由调用方处理。
 */

export type DescriptionLocale = 'zh-CN' | 'ja' | 'en';

export const designDescriptions: Record<string, Record<DescriptionLocale, string>> = {
  editorial: {
    'zh-CN': '杂志编排：一期一人，克制而讲究的留白与发丝线。',
    ja: '雑誌の組版——一期に一人。抑制的で、余白と罫線を重んじる。',
    en: 'Magazine layout: one person per issue, restrained whitespace and hairline rules.',
  },
  fast: {
    'zh-CN': '极简单色：紧凑栅格、无装饰，优先保证信息密度与加载速度。',
    ja: '極簡のモノクロ——密なグリッドと装飾なし。情報密度と速度を優先。',
    en: 'Minimal monochrome: a tight grid, no decoration, prioritising density and speed.',
  },
  frost: {
    'zh-CN': '毛玻璃与极光：柔和渐层、悬浮卡片，苹果风光的克制复刻。',
    ja: 'グラスとオーロラ——柔らかなレイヤーと浮遊するカード。Apple HIG の再現。',
    en: 'Frosted glass and aurora: soft layers, floating cards, a restrained Apple HIG echo.',
  },
  govuk: {
    'zh-CN': 'GOV.UK 设计系统：强对比、方正栅格与标志性的黄色焦点样式。',
    ja: 'GOV.UK Design System——高いコントラストと正味のあるグリッド。',
    en: 'The GOV.UK Design System: high contrast, a strict grid and unmistakable focus styles.',
  },
  kern: {
    'zh-CN': '瑞士排版：网格骨架、十字准星与紧凑的标签式信息组织。',
    ja: 'スイス・タイポグラフィ——グリッド骨格と十字、そして簡潔なラベル構成。',
    en: 'Swiss typography: a grid skeleton, crosshairs and tightly labelled information.',
  },
  material3: {
    'zh-CN': 'Material 3 设计系统：圆角、动态配色与大触控目标的宽屏双窗格。',
    ja: 'Material 3——角丸とダイナミックカラー、大きなタッチターゲット。',
    en: 'Material 3: rounded geometry, dynamic colour and generous touch targets.',
  },
  oxide: {
    'zh-CN': '终端风格：等宽排版、频道标签与顶部滚动进度线。',
    ja: 'ターミナル風——等幅書体、チャンネルラベルとスクロール進捗線。',
    en: 'Terminal-flavoured: monospace type, channel labels and a scroll progress line.',
  },
  terminal: {
    'zh-CN': '真实终端会话：命令、逐字输入级联与输出式分区。',
    ja: '本物のターミナルセッション——コマンドとタイピング表示。',
    en: 'A real terminal session: commands, a typing cascade and output-shaped sections.',
  },
};