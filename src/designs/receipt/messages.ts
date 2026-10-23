/**
 * receipt 主题文案（SPEC §4）。
 *
 * - 不翻译项：`SENRENBANKA`（站名 / 品牌）与段码数字本身；小数票上的 `NO.` 之类的
 *   纯符号标记不承载语义，不进本文件（由 CSS 伪元素承担、不进无障碍树）。
 * - 页面只渲染当前语言的一张票据；语言自称（简体中文 / 日本語 / English）
 *   直接取配置 `locales[].label`，不进本文件。
 * - 本文件承载全部随语言切换的可见文案；分栏标题原则上保持"小票帮腔"的语域
 *   （zh：明细/订单/纪录；ja：明細/ご注文/記録；en：ITEMS/ORDERS/LOG），
 *   而不是机械直译——「お品書き」「ご案内」一类偏菜单/旅馆的语域已被否掉。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface ReceiptMessages {
  receiptTag: string;
  addrLabel: string;
  memoTitle: string;
  itemsTitle: string;
  ordersTitle: string;
  logTitle: string;
  skillsTitle: string;
  totalLabel: string;
  totalUnit: string;
  contactTitle: string;
  payVia: string;
  noMail: string;
  stamp: string;
  footerThanks: string;
  sampleNote: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', ReceiptMessages> = {
  'zh-CN': {
    receiptTag: '小票',
    addrLabel: '地址',
    memoTitle: '备注',
    itemsTitle: '明细',
    ordersTitle: '订单',
    logTitle: '纪录',
    skillsTitle: '技能',
    totalLabel: '合计',
    totalUnit: '项',
    contactTitle: '结账台',
    payVia: '收款方式',
    noMail: '未配置联系方式',
    stamp: '受领',
    footerThanks: '谢谢惠顾・请多指教',
    sampleNote: '示例小票・仅作演示',
  },
  ja: {
    receiptTag: 'レシート',
    addrLabel: '住所',
    memoTitle: 'ご案内',
    itemsTitle: '明細',
    ordersTitle: 'ご注文',
    logTitle: '記録',
    skillsTitle: 'スキル',
    totalLabel: '合計',
    totalUnit: '点',
    contactTitle: 'お会計',
    payVia: 'お支払い',
    noMail: '連絡先未設定',
    stamp: '受領',
    footerThanks: 'ありがとうございました。またのお越しを。',
    sampleNote: 'サンプルレシート・デモ用',
  },
  en: {
    receiptTag: 'RECEIPT',
    addrLabel: 'ADDR',
    memoTitle: 'MEMO',
    itemsTitle: 'ITEMS',
    ordersTitle: 'ORDERS',
    logTitle: 'LOG',
    skillsTitle: 'SKILLS',
    totalLabel: 'TOTAL',
    totalUnit: 'PCS',
    contactTitle: 'CHECKOUT',
    payVia: 'PAY VIA',
    noMail: 'no contact configured',
    stamp: 'RECEIVED',
    footerThanks: 'THANK YOU — COME AGAIN',
    sampleNote: 'SAMPLE RECEIPT — DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
