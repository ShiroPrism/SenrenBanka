/**
 * radio 主题文案（SPEC §4）。
 *
 * - 不翻译项（已在设计规范中登记）：
 *   1) `SENRENBANKA`——站名 / 品牌，留在 Page.astro 的品牌锁排里，不进本文件；
 *   2) `band`（`BAND: 41m · SW`）与 `channelKey`（`CH`）——机面丝印的波段 / 频道标记，
 *      属收音机的铭牌文字，三种语言的机器上刻的是同一行 ASCII，故三语取同值；
 *   3) 模块编号 `01`–`06` 与刻度数字——DSEG14 段码本身，`aria-hidden`、不进无障碍树，
 *      由 Page.astro 的构建期循环生成。
 * - 分栏标题取「收信机面板」的语域，而不是机械直译：链接 = 频道（收信机的输入端口）、
 *   项目 = 节目（这台机器播出的东西）、经历 = 日志（值班记录）、联络 = 交信（ja 用交信）。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface RadioMessages {
  /** 整块面板的可访问名（main 的 aria-label 名词部分）。 */
  panelLabel: string;
  /** 品牌行后半：机型铭牌。 */
  brandTag: string;
  /** 刻度盘读数窗的小标签：名字所在的位置。 */
  callSignLabel: string;
  /** 频道计数前缀（机面丝印，三语同值）。 */
  channelKey: string;
  /** 地点标签：收信机的台址。 */
  qthLabel: string;
  memoTitle: string;
  channelsTitle: string;
  programsTitle: string;
  logTitle: string;
  skillsTitle: string;
  contactTitle: string;
  totalLabel: string;
  totalUnit: string;
  contactVia: string;
  noMail: string;
  /** 页脚波段铭牌（同时也是页脚的可访问名，三语同值）。 */
  band: string;
}

export const messages: Record<string, RadioMessages> = {
  'zh-CN': {
    panelLabel: '短波收信机',
    brandTag: 'SW 收信机',
    callSignLabel: '呼号',
    channelKey: 'CH',
    qthLabel: '台址',
    memoTitle: '备注',
    channelsTitle: '频道',
    programsTitle: '节目',
    logTitle: '日志',
    skillsTitle: '技能',
    contactTitle: '联络',
    totalLabel: '频道',
    totalUnit: '个',
    contactVia: '来信',
    noMail: '未配置联络方式',
    band: 'BAND: 41m · SW',
  },
  'zh-TW': {
    panelLabel: '短波收信機',
    brandTag: 'SW 收信機',
    callSignLabel: '呼號',
    channelKey: 'CH',
    qthLabel: '臺址',
    memoTitle: '備註',
    channelsTitle: '頻道',
    programsTitle: '節目',
    logTitle: '日誌',
    skillsTitle: '技能',
    contactTitle: '聯絡',
    totalLabel: '頻道',
    totalUnit: '個',
    contactVia: '來信',
    noMail: '未配置聯絡方式',
    band: 'BAND: 41m · SW',
  },
  ja: {
    panelLabel: '短波受信機',
    brandTag: 'SW 受信機',
    callSignLabel: 'コールサイン',
    channelKey: 'CH',
    qthLabel: '所在地',
    memoTitle: '備考',
    channelsTitle: 'チャンネル',
    programsTitle: '番組',
    logTitle: '記録',
    skillsTitle: 'スキル',
    contactTitle: '交信',
    totalLabel: 'チャンネル',
    totalUnit: '局',
    contactVia: '連絡先',
    noMail: '連絡先未設定',
    band: 'BAND: 41m · SW',
  },
  en: {
    panelLabel: 'SHORTWAVE RECEIVER',
    brandTag: 'SW RECEIVER',
    callSignLabel: 'CALL SIGN',
    channelKey: 'CH',
    qthLabel: 'QTH',
    memoTitle: 'MEMO',
    channelsTitle: 'CHANNELS',
    programsTitle: 'PROGRAMS',
    logTitle: 'LOG',
    skillsTitle: 'SKILLS',
    contactTitle: 'CONTACT',
    totalLabel: 'CHANNELS',
    totalUnit: 'RX',
    contactVia: 'MAIL',
    noMail: 'no contact configured',
    band: 'BAND: 41m · SW',
  },
  ko: {
    panelLabel: '단파 수신기',
    brandTag: 'SW 수신기',
    callSignLabel: '콜사인',
    channelKey: 'CH',
    qthLabel: '위치',
    memoTitle: '메모',
    channelsTitle: '채널',
    programsTitle: '프로그램',
    logTitle: '기록',
    skillsTitle: '기술',
    contactTitle: '교신',
    totalLabel: '채널',
    totalUnit: '국',
    contactVia: '메일',
    noMail: '연락처 미설정',
    band: 'BAND: 41m · SW',
  },
};

export type MessageLocale = keyof typeof messages;
