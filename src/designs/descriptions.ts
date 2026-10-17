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
  receipt: {
    'zh-CN': '热敏小票机：一卷从票机吐出的长票，撕边、点引导线与七段数字。',
    ja: 'サーマルレシート——レシート機から出てくる長い紙、ミシン目とセグメント数字。',
    en: 'A thermal receipt: a long printed slip with torn edges, dot leaders and seven-segment digits.',
  },
  archive: {
    'zh-CN': '图书馆卡片目录：一屉拉开的索引卡，打字机条目与归档印章。',
    ja: '図書館のカード目録——引き出した索引カードとタイプの記録、収蔵印。',
    en: 'A library card catalogue: a pulled-open drawer of index cards, typed entries and an archive stamp.',
  },
  radio: {
    'zh-CN': '短波收音机面板：刻度盘、琥珀指示灯与仪表模块。',
    ja: '短波受信機のパネル——ダイヤル、琥珀色のランプ、計器モジュール。',
    en: 'A shortwave receiver faceplate: tuning dial, amber lamps and instrument modules.',
  },
  fax: {
    'zh-CN': '传真机传输纸：传输表头、走纸孔与磨损的打字机字面。',
    ja: 'ファックスの送信紙——ヘッダー表、送り穴、かすれたタイプ文字。',
    en: 'A fax transmission sheet: header table, tractor holes and worn typewriter type.',
  },
  pager: {
    'zh-CN': '寻呼机：单色 LCD、状态栏与逐条消息。',
    ja: 'ポケットベル——単色 LCD、ステータスバー、メッセージ一覧。',
    en: 'A pager: monochrome LCD, status bar and a list of messages.',
  },
  tape: {
    'zh-CN': '磁带与 J 卡：手写标签、曲目单与卷轴窗。',
    ja: 'カセットと J カード——手書きラベル、曲目リスト、リール窓。',
    en: 'A cassette and its J-card: handwritten label, track list and reel windows.',
  },
  poster: {
    'zh-CN': '丝网印刷海报：巨幅窄体标题、镂空字与套准标记。',
    ja: 'シルクスクリーンのポスター——巨大なコンデンス体、ステンシル、見当マーク。',
    en: 'A screen-print poster: oversized condensed display, stencil cuts and registration marks.',
  },
  lexicon: {
    'zh-CN': '三语辞典跨页：词条头、释义与参照项。',
    ja: '三言語の辞書見開き——見出し語、語義、参照項目。',
    en: 'A trilingual dictionary spread: headwords, definitions and cross-references.',
  },
};