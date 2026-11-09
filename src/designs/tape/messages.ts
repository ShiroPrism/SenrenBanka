/**
 * tape 主题文案（SPEC §4）。
 *
 * - 不翻译项：`SENRENBANKA`（站名 / 品牌）、`REC`、`C-60 · TYPE II · NR ON` 等磁带机
 *   机身丝印标记——它们是物件的物理标记，不是界面文案，由 CSS / Page.astro 直接承担。
 * - 语域：J 卡内页（磁带包装里的手写曲目单）。分区语域词按「曲目单」语域翻译，
 *   不做机械直译：zh 备注 / 曲目 / 企划 / 纪录 / 结算；ja ライナーノーツ /
 *   曲目 / 企画 / 記録 / 精算；en LINER NOTES / TRACKLIST / PROGRAMME / LOGBOOK / CHECKOUT。
 *   这些语域词现在是分区 h2 **上方的套印小字 kicker**；h2 文本来自共享标准标签
 *   （`src/i18n/sections`），技能分区的标准词与语域本已一致，故不再单独保留键。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface TapeMessages {
  /** 内页落款处的物件名（与品牌名并排）。 */
  cardTag: string;
  /** 磁带贴标上的面别。 */
  sideLabel: string;
  /** 收录地点字段标签。 */
  recAt: string;
  memoTitle: string;
  tracksTitle: string;
  projectsTitle: string;
  logTitle: string;
  contactTitle: string;
  totalLabel: string;
  totalUnit: string;
  /** 联络方式字段标签。 */
  mailLabel: string;
  noMail: string;
  /** 贴标上的手写批注。 */
  labelNote: string;
  /** A 面收尾句。 */
  sideEnd: string;
}

export const messages: Record<string, TapeMessages> = {
  'zh-CN': {
    cardTag: '磁带内页',
    sideLabel: 'A 面',
    recAt: '收录地点',
    memoTitle: '备注',
    tracksTitle: '曲目',
    projectsTitle: '企划',
    logTitle: '纪录',
    contactTitle: '结算',
    totalLabel: '合计',
    totalUnit: '曲',
    mailLabel: '联络',
    noMail: '未配置联系方式',
    labelNote: '手写贴标',
    sideEnd: 'A 面结束 · 请翻面',
  },
  'zh-TW': {
    cardTag: '磁帶內頁',
    sideLabel: 'A 面',
    recAt: '收錄地點',
    memoTitle: '備註',
    tracksTitle: '曲目',
    projectsTitle: '企劃',
    logTitle: '紀錄',
    contactTitle: '結算',
    totalLabel: '合計',
    totalUnit: '曲',
    mailLabel: '聯絡',
    noMail: '未配置聯絡方式',
    labelNote: '手寫貼標',
    sideEnd: 'A 面結束 · 請翻面',
  },
  ja: {
    cardTag: 'ライナー',
    sideLabel: 'A 面',
    recAt: '収録場所',
    memoTitle: 'ライナーノーツ',
    tracksTitle: '曲目',
    projectsTitle: '企画',
    logTitle: '記録',
    contactTitle: '精算',
    totalLabel: '合計',
    totalUnit: '曲',
    mailLabel: '連絡',
    noMail: '連絡先未設定',
    labelNote: '手書きラベル',
    sideEnd: 'A 面終了 · 裏返してください',
  },
  en: {
    cardTag: 'J-CARD',
    sideLabel: 'SIDE A',
    recAt: 'REC AT',
    memoTitle: 'LINER NOTES',
    tracksTitle: 'TRACKLIST',
    projectsTitle: 'PROGRAMME',
    logTitle: 'LOGBOOK',
    contactTitle: 'CHECKOUT',
    totalLabel: 'TOTAL',
    totalUnit: 'TRKS',
    mailLabel: 'MAIL',
    noMail: 'no contact configured',
    labelNote: 'handwritten',
    sideEnd: 'END OF SIDE A / PLEASE TURN OVER',
  },
  ko: {
    cardTag: 'J카드',
    sideLabel: 'A면',
    recAt: '녹음 장소',
    memoTitle: '라이너 노트',
    tracksTitle: '수록곡',
    projectsTitle: '기획',
    logTitle: '기록',
    contactTitle: '정산',
    totalLabel: '합계',
    totalUnit: '곡',
    mailLabel: '연락처',
    noMail: '연락처 미설정',
    labelNote: '손글씨 라벨',
    sideEnd: 'A면 끝 · 뒷면으로 넘겨 주세요',
  },
};

export type MessageLocale = keyof typeof messages;
