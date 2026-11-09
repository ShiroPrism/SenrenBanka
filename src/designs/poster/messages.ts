/**
 * poster 主题文案（SPEC §4）。
 *
 * - 不翻译项：`SENRENBANKA` 是站名 / 品牌；`imprint` 是海报的印刷署名行
 *   （colophon），与品牌名同属不译项。
 * - 分区抬头：镂空拉丁装置与 h2 都使用共享标准标签
 *   （`src/i18n/sections` 的 `enLabel` / `label`），不再维护主题词；
 *   Blackout 2AM 只能打拉丁，因此英文展示词固定取英文 canonical。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface PosterMessages {
  /** 页面语义标签（main 的可访问名）。 */
  sheetLabel: string;
  /** 报头附注：印刷方式。 */
  medium: string;
  /** 报头附注：地点字段名。 */
  placeLabel: string;
  totalLabel: string;
  totalUnit: string;
  payVia: string;
  noMail: string;
  /** 页脚印刷署名（不译，见文件头）。 */
  imprint: string;
}

export const messages: Record<string, PosterMessages> = {
  'zh-CN': {
    sheetLabel: '丝网印刷海报',
    medium: '双色丝网印刷',
    placeLabel: '地点',
    totalLabel: '合计',
    totalUnit: '项',
    payVia: '联络',
    noMail: '未配置联系方式',
    imprint: 'SENRENBANKA · PRINTED MATTER',
  },
  'zh-TW': {
    sheetLabel: '絲網印刷海報',
    medium: '雙色絲網印刷',
    placeLabel: '地點',
    totalLabel: '合計',
    totalUnit: '項',
    payVia: '聯絡',
    noMail: '未配置聯絡方式',
    imprint: 'SENRENBANKA · PRINTED MATTER',
  },
  ja: {
    sheetLabel: 'シルクスクリーンのポスター',
    medium: '2色シルクスクリーン',
    placeLabel: '場所',
    totalLabel: '合計',
    totalUnit: '点',
    payVia: '連絡先',
    noMail: '連絡先未設定',
    imprint: 'SENRENBANKA · PRINTED MATTER',
  },
  en: {
    sheetLabel: 'SCREENPRINT POSTER',
    medium: 'TWO-COLOUR SCREENPRINT',
    placeLabel: 'PLACE',
    totalLabel: 'TOTAL',
    totalUnit: 'PCS',
    payVia: 'WRITE TO',
    noMail: 'no contact configured',
    imprint: 'SENRENBANKA · PRINTED MATTER',
  },
  ko: {
    sheetLabel: '실크스크린 포스터',
    medium: '2색 실크스크린',
    placeLabel: '장소',
    totalLabel: '합계',
    totalUnit: '건',
    payVia: '연락처',
    noMail: '연락처 미설정',
    imprint: 'SENRENBANKA · PRINTED MATTER',
  },
};

export type MessageLocale = keyof typeof messages;
