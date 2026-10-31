/**
 * poster 主题文案（SPEC §4）。
 *
 * - 不翻译项（已在下方三语中逐处保持一致，理由是"印刷品本身的语言"，不是漏译）：
 *   - `SENRENBANKA`：站名 / 品牌，全站不译。
 *   - `*Mark`：分区标题前的镂空拉丁字（MEMO / INDEX / ORDERS / RECORD / SKILLS /
 *     CHECKOUT）——这是海报的排印装置（Blackout 2AM 只能打拉丁），三语共用同一组词，
 *     与本地语言的分区名并列；英文版因此另取近义词（NOTES / LINKS / WORKS / HISTORY /
 *     TOOLS / CONTACT），避免与装置字重复。
 *   - `imprint`：`SENRENBANKA · PRINTED MATTER` 是海报的印刷署名行（colophon），
 *     与品牌名同属不译项。
 * - 语域：海报 / 实验艺术的"栏目名"——短、名词性、可作大字；不是网页的 section 标题。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface PosterMessages {
  /** 页面语义标签（main 的可访问名）。 */
  sheetLabel: string;
  /** 报头附注：印刷方式。 */
  medium: string;
  /** 报头附注：地点字段名。 */
  placeLabel: string;
  memoMark: string;
  memoTitle: string;
  itemsMark: string;
  itemsTitle: string;
  ordersMark: string;
  ordersTitle: string;
  logMark: string;
  logTitle: string;
  skillsMark: string;
  skillsTitle: string;
  checkoutMark: string;
  checkoutTitle: string;
  totalLabel: string;
  totalUnit: string;
  payVia: string;
  noMail: string;
  /** 页脚印刷署名（不译，见文件头）。 */
  imprint: string;
  sampleNote: string;
}

export const messages: Record<string, PosterMessages> = {
  'zh-CN': {
    sheetLabel: '丝网印刷海报',
    medium: '双色丝网印刷',
    placeLabel: '地点',
    memoMark: 'MEMO',
    memoTitle: '备注',
    itemsMark: 'INDEX',
    itemsTitle: '明细',
    ordersMark: 'ORDERS',
    ordersTitle: '订单',
    logMark: 'RECORD',
    logTitle: '纪录',
    skillsMark: 'SKILLS',
    skillsTitle: '技能',
    checkoutMark: 'CHECKOUT',
    checkoutTitle: '结账',
    totalLabel: '合计',
    totalUnit: '项',
    payVia: '联络',
    noMail: '未配置联系方式',
    imprint: 'SENRENBANKA · PRINTED MATTER',
    sampleNote: '示例资料・仅作演示',
  },
  ja: {
    sheetLabel: 'シルクスクリーンのポスター',
    medium: '2色シルクスクリーン',
    placeLabel: '場所',
    memoMark: 'MEMO',
    memoTitle: '備考',
    itemsMark: 'INDEX',
    itemsTitle: '一覧',
    ordersMark: 'ORDERS',
    ordersTitle: '註文',
    logMark: 'RECORD',
    logTitle: '記録',
    skillsMark: 'SKILLS',
    skillsTitle: '技能',
    checkoutMark: 'CHECKOUT',
    checkoutTitle: '会計',
    totalLabel: '合計',
    totalUnit: '点',
    payVia: '連絡先',
    noMail: '連絡先未設定',
    imprint: 'SENRENBANKA · PRINTED MATTER',
    sampleNote: 'サンプル・デモ用',
  },
  en: {
    sheetLabel: 'SCREENPRINT POSTER',
    medium: 'TWO-COLOUR SCREENPRINT',
    placeLabel: 'PLACE',
    memoMark: 'MEMO',
    memoTitle: 'NOTES',
    itemsMark: 'INDEX',
    itemsTitle: 'LINKS',
    ordersMark: 'ORDERS',
    ordersTitle: 'WORKS',
    logMark: 'RECORD',
    logTitle: 'HISTORY',
    skillsMark: 'SKILLS',
    skillsTitle: 'TOOLS',
    checkoutMark: 'CHECKOUT',
    checkoutTitle: 'CONTACT',
    totalLabel: 'TOTAL',
    totalUnit: 'PCS',
    payVia: 'WRITE TO',
    noMail: 'no contact configured',
    imprint: 'SENRENBANKA · PRINTED MATTER',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
