/**
 * lexicon 主题文案（SPEC §4）。
 *
 * 语域：一部中日英三语辞典的词条页。分区名是**辞典的类目名**，不是网页标题；
 * 拉丁小大写字（NOTA / NEXVS / OPERA / CHRONICA / ARTES / RATIO）是辞书里的
 * 拉丁对应词，词性标记（n. / n. pl. / n. prop.）是文法缩写——这些**不翻译**：
 * 三语版本都保留同一套拉丁字形与文法缩写，这正是「中日英混排辞书」的版面事实。
 * 同理不翻译：`LEXICON`（书眉上的辞书名，品牌性标识）、`SENRENBANKA`（由
 * Page.astro 直接书写，见下）、词条编号（算术序号，不进本文件）。
 *
 * - 本文件承载全部随语言切换的可见文案；页面级 `lexiconWord` 只用作书眉的辞书名。
 * - 翻译纪律：不做解释性增译，三语读者获得等量信息（例：明细 / 明細 / INDEX 都指
 *   "参照项清单"，不写成 "交叉引用索引" 之类的说明句）。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface LexiconMessages {
  /** 书眉上的辞书名（不翻译）。 */
  lexiconWord: string;
  /** 书眉词条范围：`第 1–6 条` / `ENTRIES 1–6` 的前后件。 */
  rangeBefore: string;
  rangeAfter: string;
  /** 主词条（姓名）的词性标记（文法缩写，不翻译）。 */
  posProper: string;
  /** 地点行的字段名（著录项标签）。 */
  originLabel: string;
  memoTitle: string;
  memoLatin: string;
  memoPos: string;
  linksTitle: string;
  linksLatin: string;
  linksPos: string;
  projectsTitle: string;
  projectsLatin: string;
  projectsPos: string;
  logTitle: string;
  logLatin: string;
  logPos: string;
  skillsTitle: string;
  skillsLatin: string;
  skillsPos: string;
  contactTitle: string;
  contactLatin: string;
  contactPos: string;
  /** 联系方式的著录字段名。 */
  mailLabel: string;
  /** 结账栏的合计 = 参照项条数。 */
  tallyLabel: string;
  tallyUnit: string;
  noMail: string;
  /** 页脚终记号（含破折号，随语言）。 */
  finis: string;
  sampleNote: string;
}

/** 拉丁对应词与文法缩写：三语共用（辞典的拉丁声部，不随界面语言翻译）。 */
const LATIN = {
  proper: 'n. prop.',
  memo: 'NOTA',
  links: 'NEXVS',
  projects: 'OPERA',
  log: 'CHRONICA',
  skills: 'ARTES',
  contact: 'RATIO',
  singular: 'n.',
  plural: 'n. pl.',
} as const;

export const messages: Record<string, LexiconMessages> = {
  'zh-CN': {
    lexiconWord: 'LEXICON',
    rangeBefore: '第',
    rangeAfter: '条',
    posProper: LATIN.proper,
    originLabel: '所在',
    memoTitle: '备注',
    memoLatin: LATIN.memo,
    memoPos: LATIN.singular,
    linksTitle: '明细',
    linksLatin: LATIN.links,
    linksPos: LATIN.singular,
    projectsTitle: '订单',
    projectsLatin: LATIN.projects,
    projectsPos: LATIN.plural,
    logTitle: '纪录',
    logLatin: LATIN.log,
    logPos: LATIN.plural,
    skillsTitle: '技能',
    skillsLatin: LATIN.skills,
    skillsPos: LATIN.plural,
    contactTitle: '结账',
    contactLatin: LATIN.contact,
    contactPos: LATIN.singular,
    mailLabel: '信函',
    tallyLabel: '参照数',
    tallyUnit: '条',
    noMail: '未配置联系方式',
    finis: '— 终 —',
    sampleNote: '示例词条・仅作演示',
  },
  ja: {
    lexiconWord: 'LEXICON',
    rangeBefore: '第',
    rangeAfter: '条',
    posProper: LATIN.proper,
    originLabel: '所在',
    memoTitle: '備考',
    memoLatin: LATIN.memo,
    memoPos: LATIN.singular,
    linksTitle: '明細',
    linksLatin: LATIN.links,
    linksPos: LATIN.singular,
    projectsTitle: '注文',
    projectsLatin: LATIN.projects,
    projectsPos: LATIN.plural,
    logTitle: '記録',
    logLatin: LATIN.log,
    logPos: LATIN.plural,
    skillsTitle: '技能',
    skillsLatin: LATIN.skills,
    skillsPos: LATIN.plural,
    contactTitle: '連絡',
    contactLatin: LATIN.contact,
    contactPos: LATIN.singular,
    mailLabel: '書簡',
    tallyLabel: '参照数',
    tallyUnit: '件',
    noMail: '連絡先未設定',
    finis: '— 終 —',
    sampleNote: 'サンプル項目・デモ用',
  },
  en: {
    lexiconWord: 'LEXICON',
    rangeBefore: 'ENTRIES',
    rangeAfter: '',
    posProper: LATIN.proper,
    originLabel: 'LOCATION',
    memoTitle: 'NOTES',
    memoLatin: LATIN.memo,
    memoPos: LATIN.singular,
    linksTitle: 'INDEX',
    linksLatin: LATIN.links,
    linksPos: LATIN.singular,
    projectsTitle: 'WORKS',
    projectsLatin: LATIN.projects,
    projectsPos: LATIN.plural,
    logTitle: 'RECORD',
    logLatin: LATIN.log,
    logPos: LATIN.plural,
    skillsTitle: 'SKILLS',
    skillsLatin: LATIN.skills,
    skillsPos: LATIN.plural,
    contactTitle: 'CONTACT',
    contactLatin: LATIN.contact,
    contactPos: LATIN.singular,
    mailLabel: 'MAIL',
    tallyLabel: 'CROSS-REFS',
    tallyUnit: 'ITEMS',
    noMail: 'no contact configured',
    finis: '— FINIS —',
    sampleNote: 'SAMPLE ENTRY — DEMO ONLY',
  },
  ko: {
    lexiconWord: 'LEXICON',
    rangeBefore: '표제어',
    rangeAfter: '',
    posProper: LATIN.proper,
    originLabel: '소재지',
    memoTitle: '비고',
    memoLatin: LATIN.memo,
    memoPos: LATIN.singular,
    linksTitle: '색인',
    linksLatin: LATIN.links,
    linksPos: LATIN.singular,
    projectsTitle: '작품',
    projectsLatin: LATIN.projects,
    projectsPos: LATIN.plural,
    logTitle: '기록',
    logLatin: LATIN.log,
    logPos: LATIN.plural,
    skillsTitle: '기술',
    skillsLatin: LATIN.skills,
    skillsPos: LATIN.plural,
    contactTitle: '연락',
    contactLatin: LATIN.contact,
    contactPos: LATIN.singular,
    mailLabel: '서신',
    tallyLabel: '참조',
    tallyUnit: '건',
    noMail: '연락처가 설정되지 않음',
    finis: '— 끝 —',
    sampleNote: '예시 표제어・데모용',
  },
};

export type MessageLocale = keyof typeof messages;
