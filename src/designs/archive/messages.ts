/**
 * archive 主题文案（SPEC §4）：图书馆卡片目录。
 *
 * - 不翻译项：品牌名 `SENRENBANKA`、目录编号（`DRAWER 03 · ARCHIVE`、卡脊编号
 *   `01–07`、索书号）与数据本身——它们是藏书标记，不是界面文案。
 * - 分区标签走「目录柜」语域而不是小票语域：备注 / 索引 / 编目 / 履历 / 主题词 /
 *   借阅，分别对应 bio / links / projects / experience / skills / contact。
 * - 本文件承载全部随语言切换的可见文案；纯数据，不 import CSS / Astro 组件。
 */
export interface ArchiveMessages {
  /** 品牌行后的资料类型（SENRENBANKA · 索引卡）。 */
  archiveTag: string;
  /** 卡头那张卡凸片上的类目词（装饰，整块 aria-hidden）。 */
  headTab: string;
  locationLabel: string;
  memoTitle: string;
  itemsTitle: string;
  ordersTitle: string;
  logTitle: string;
  skillsTitle: string;
  contactTitle: string;
  totalLabel: string;
  totalUnit: string;
  contactLabel: string;
  noMail: string;
  tagsLabel: string;
  stamp: string;
  colophonTitle: string;
  dueLabel: string;
  footerThanks: string;
  drawerLine: string;
}

export const messages: Record<string, ArchiveMessages> = {
  'zh-CN': {
    archiveTag: '索引卡',
    headTab: '卡片头',
    locationLabel: '所在地',
    memoTitle: '备注',
    itemsTitle: '索引',
    ordersTitle: '编目',
    logTitle: '履历',
    skillsTitle: '主题词',
    contactTitle: '借阅',
    totalLabel: '合计',
    totalUnit: '张',
    contactLabel: '联系方式',
    noMail: '未登记联系方式',
    tagsLabel: '主题词',
    stamp: '已归档',
    colophonTitle: '著录',
    dueLabel: '借阅期限',
    footerThanks: '感谢查阅・欢迎再来',
    drawerLine: 'DRAWER 03 · ARCHIVE',
  },
  'zh-TW': {
    archiveTag: '索引卡',
    headTab: '卡片頭',
    locationLabel: '所在地',
    memoTitle: '備註',
    itemsTitle: '索引',
    ordersTitle: '編目',
    logTitle: '履歷',
    skillsTitle: '主題詞',
    contactTitle: '借閱',
    totalLabel: '合計',
    totalUnit: '張',
    contactLabel: '聯絡方式',
    noMail: '未登記聯絡方式',
    tagsLabel: '主題詞',
    stamp: '已歸檔',
    colophonTitle: '著錄',
    dueLabel: '借閱期限',
    footerThanks: '感謝查閱・歡迎再來',
    drawerLine: 'DRAWER 03 · ARCHIVE',
  },
  ja: {
    archiveTag: 'カード目録',
    headTab: 'カード見出し',
    locationLabel: '所在地',
    memoTitle: '備考',
    itemsTitle: '索引',
    ordersTitle: '目録',
    logTitle: '経歴',
    skillsTitle: '件名',
    contactTitle: '貸出',
    totalLabel: '合計',
    totalUnit: '枚',
    contactLabel: '連絡先',
    noMail: '連絡先未登録',
    tagsLabel: '件名',
    stamp: '登録済',
    colophonTitle: '奥付',
    dueLabel: '返却期限',
    footerThanks: 'ご閲覧ありがとうございました',
    drawerLine: 'DRAWER 03 · ARCHIVE',
  },
  en: {
    archiveTag: 'CARD CATALOG',
    headTab: 'HEAD CARD',
    locationLabel: 'LOCATION',
    memoTitle: 'NOTES',
    itemsTitle: 'INDEX',
    ordersTitle: 'CATALOG',
    logTitle: 'RECORD',
    skillsTitle: 'SUBJECTS',
    contactTitle: 'CIRCULATION',
    totalLabel: 'TOTAL',
    totalUnit: 'CARDS',
    contactLabel: 'CONTACT',
    noMail: 'NO CONTACT ON FILE',
    tagsLabel: 'SUBJECTS',
    stamp: 'ARCHIVED',
    colophonTitle: 'COLOPHON',
    dueLabel: 'DATE DUE',
    footerThanks: 'THANK YOU FOR LOOKING',
    drawerLine: 'DRAWER 03 · ARCHIVE',
  },
  ko: {
    archiveTag: '색인 카드',
    headTab: '카드 머리',
    locationLabel: '소장처',
    memoTitle: '비고',
    itemsTitle: '색인',
    ordersTitle: '목록',
    logTitle: '이력',
    skillsTitle: '주제어',
    contactTitle: '대출',
    totalLabel: '합계',
    totalUnit: '장',
    contactLabel: '연락처',
    noMail: '연락처 미등록',
    tagsLabel: '주제어',
    stamp: '보관 완료',
    colophonTitle: '판권',
    dueLabel: '대출 기한',
    footerThanks: '열람해 주셔서 감사합니다 · 다시 오세요',
    drawerLine: 'DRAWER 03 · ARCHIVE',
  },
};

export type MessageLocale = keyof typeof messages;
