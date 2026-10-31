/**
 * tape 主题文案（SPEC §4）。
 *
 * - 不翻译项：`SENRENBANKA`（站名 / 品牌）、`REC`、`C-60 · TYPE II · NR ON` 等磁带机
 *   机身丝印标记——它们是物件的物理标记，不是界面文案，由 CSS / Page.astro 直接承担。
 * - 语域：J 卡内页（磁带包装里的手写曲目单）。分区标题按「曲目单」语域翻译，
 *   不做机械直译：zh 备注 / 曲目 / 企划 / 纪录 / 技能 / 结算；ja ライナーノーツ /
 *   曲目 / 企画 / 記録 / スキル / 精算；en LINER NOTES / TRACKLIST / PROGRAMME /
 *   LOGBOOK / SKILLS / CHECKOUT。
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
  skillsTitle: string;
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
  sampleNote: string;
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
    skillsTitle: '技能',
    contactTitle: '结算',
    totalLabel: '合计',
    totalUnit: '曲',
    mailLabel: '联络',
    noMail: '未配置联系方式',
    labelNote: '手写贴标',
    sideEnd: 'A 面结束 · 请翻面',
    sampleNote: '示例磁带 · 仅作演示',
  },
  ja: {
    cardTag: 'ライナー',
    sideLabel: 'A 面',
    recAt: '収録場所',
    memoTitle: 'ライナーノーツ',
    tracksTitle: '曲目',
    projectsTitle: '企画',
    logTitle: '記録',
    skillsTitle: 'スキル',
    contactTitle: '精算',
    totalLabel: '合計',
    totalUnit: '曲',
    mailLabel: '連絡',
    noMail: '連絡先未設定',
    labelNote: '手書きラベル',
    sideEnd: 'A 面終了 · 裏返してください',
    sampleNote: 'サンプルテープ · デモ用',
  },
  en: {
    cardTag: 'J-CARD',
    sideLabel: 'SIDE A',
    recAt: 'REC AT',
    memoTitle: 'LINER NOTES',
    tracksTitle: 'TRACKLIST',
    projectsTitle: 'PROGRAMME',
    logTitle: 'LOGBOOK',
    skillsTitle: 'SKILLS',
    contactTitle: 'CHECKOUT',
    totalLabel: 'TOTAL',
    totalUnit: 'TRKS',
    mailLabel: 'MAIL',
    noMail: 'no contact configured',
    labelNote: 'handwritten',
    sideEnd: 'END OF SIDE A / PLEASE TURN OVER',
    sampleNote: 'SAMPLE TAPE / DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
