/**
 * fax 主题文案（SPEC §4）。
 *
 * - 不翻译项（刻意保留机打英文，必须在此登记理由）：
 *   1. `masthead`（FAX TRANSMISSION）、`fieldTo/From/Date/Pages`（TO / FROM / DATE / PAGES）、
 *      `footerEnd`（END OF TRANSMISSION）——这些是**传真机自己打印**的表单行，
 *      不是作者写的句子。世界各地的传真封面纸都印同一批英文词，译成中文反而破坏物件逻辑。
 *   2. `brand`（SENRENBANKA）为站名 / 品牌。
 * - 其余全部随语言切换；语域取"办公室里传真机旁边的语气"：短、事务性、带编号感，
 *   不做成营销文案（en 用 MEMO / ENCLOSURES / SETTLEMENT 而不是 ABOUT / LINKS / CONTACT）。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface FaxMessages {
  /** 机打抬头（传真表单固定英文行）。 */
  masthead: string;
  /** 站名（品牌，不翻译）。 */
  brand: string;
  /** 四个字段标签（传真表单固定英文行）。 */
  fieldTo: string;
  fieldFrom: string;
  fieldDate: string;
  fieldPages: string;
  /** TO 字段的值：这份传真发给谁。 */
  toValue: string;
  /** 发信地标签。 */
  originLabel: string;
  /** PAGES 字段的单位。 */
  pagesUnit: string;
  /** 分区标题（h2）。 */
  memoTitle: string;
  itemsTitle: string;
  ordersTitle: string;
  logTitle: string;
  skillsTitle: string;
  checkoutTitle: string;
  /** 结账区的合计。 */
  totalLabel: string;
  totalUnit: string;
  /** 回传地址标签。 */
  returnLabel: string;
  noMail: string;
  /** 红章字样（全页唯一彩色）。 */
  stamp: string;
  /** 页脚机打行（固定英文行）。 */
  footerEnd: string;
}

export const messages: Record<string, FaxMessages> = {
  'zh-CN': {
    masthead: 'FAX TRANSMISSION',
    brand: 'SENRENBANKA',
    fieldTo: 'TO',
    fieldFrom: 'FROM',
    fieldDate: 'DATE',
    fieldPages: 'PAGES',
    toValue: '各位读者',
    originLabel: '发信地',
    pagesUnit: '页',
    memoTitle: '备注',
    itemsTitle: '明细',
    ordersTitle: '订单',
    logTitle: '纪录',
    skillsTitle: '技能',
    checkoutTitle: '结账',
    totalLabel: '合计',
    totalUnit: '件',
    returnLabel: '回传地址',
    noMail: '未登记回传地址',
    stamp: '已收',
    footerEnd: 'END OF TRANSMISSION',
  },
  'zh-TW': {
    masthead: 'FAX TRANSMISSION',
    brand: 'SENRENBANKA',
    fieldTo: 'TO',
    fieldFrom: 'FROM',
    fieldDate: 'DATE',
    fieldPages: 'PAGES',
    toValue: '各位讀者',
    originLabel: '發信地',
    pagesUnit: '頁',
    memoTitle: '備註',
    itemsTitle: '明細',
    ordersTitle: '訂單',
    logTitle: '紀錄',
    skillsTitle: '技能',
    checkoutTitle: '結賬',
    totalLabel: '合計',
    totalUnit: '件',
    returnLabel: '回傳地址',
    noMail: '未登記回傳地址',
    stamp: '已收',
    footerEnd: 'END OF TRANSMISSION',
  },
  ja: {
    masthead: 'FAX TRANSMISSION',
    brand: 'SENRENBANKA',
    fieldTo: 'TO',
    fieldFrom: 'FROM',
    fieldDate: 'DATE',
    fieldPages: 'PAGES',
    toValue: '閲覧者 各位',
    originLabel: '送信元',
    pagesUnit: '枚',
    memoTitle: '連絡事項',
    itemsTitle: '同封書類',
    ordersTitle: '発注案件',
    logTitle: '稼働記録',
    skillsTitle: '技能',
    checkoutTitle: '清算',
    totalLabel: '合計',
    totalUnit: '件',
    returnLabel: '返信先',
    noMail: '返信先が未登録です',
    stamp: '受領',
    footerEnd: 'END OF TRANSMISSION',
  },
  en: {
    masthead: 'FAX TRANSMISSION',
    brand: 'SENRENBANKA',
    fieldTo: 'TO',
    fieldFrom: 'FROM',
    fieldDate: 'DATE',
    fieldPages: 'PAGES',
    toValue: 'THE READER',
    originLabel: 'ORIGIN',
    pagesUnit: 'SHEETS',
    memoTitle: 'MEMO',
    itemsTitle: 'ENCLOSURES',
    ordersTitle: 'ORDERS',
    logTitle: 'LOG',
    skillsTitle: 'SKILLS',
    checkoutTitle: 'SETTLEMENT',
    totalLabel: 'TOTAL',
    totalUnit: 'ITEMS',
    returnLabel: 'RETURN TO',
    noMail: 'no return number on file',
    stamp: 'RECEIVED',
    footerEnd: 'END OF TRANSMISSION',
  },
  ko: {
    masthead: 'FAX TRANSMISSION',
    brand: 'SENRENBANKA',
    fieldTo: 'TO',
    fieldFrom: 'FROM',
    fieldDate: 'DATE',
    fieldPages: 'PAGES',
    toValue: '열람자 여러분',
    originLabel: '발신지',
    pagesUnit: '매',
    memoTitle: '메모',
    itemsTitle: '동봉물',
    ordersTitle: '주문 건',
    logTitle: '기록',
    skillsTitle: '기술',
    checkoutTitle: '정산',
    totalLabel: '합계',
    totalUnit: '건',
    returnLabel: '회신 주소',
    noMail: '회신 주소 미등록',
    stamp: '수신',
    footerEnd: 'END OF TRANSMISSION',
  },
};

export type MessageLocale = keyof typeof messages;
