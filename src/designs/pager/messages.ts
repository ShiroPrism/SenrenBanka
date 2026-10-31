/**
 * pager 主题文案（SPEC §4）。
 *
 * - 不翻译项（理由写在键旁）：
 *   - `brand`：站名 / 品牌，全语言同形；
 *   - `msgLabel`：屏显技术标记（`MSG`），寻呼机屏上的量纲不是界面文案；
 *   - `endLine`：ASCII 屏显分隔符（`-- END OF MESSAGES --`），是机器的屏显收尾，不是句子。
 * - 语域：寻呼机屏幕只有几行字，标题一律取「屏显短词」而不是票据 / 网页的分区名
 *   （链接 / 经历 / 联系，而非明细 / 纪录 / 结账台），这是本套与 receipt 刻意分开的声部。
 * - 中文短词按寻呼机屏幕语域控制长度；CJK 字形由完整 Ark Pixel core-cjk 分片承接，
 *   源字体缺字再由系统字体回退并通过 `fonts:audit` 报告。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface PagerMessages {
  /** 品牌名，不翻译（站名）。 */
  brand: string;
  /** `<main>` 的可访问名。 */
  pageLabel: string;
  /** 地点行的屏显标签。 */
  locLabel: string;
  /** 状态栏的量纲标记，不翻译（技术标记）。 */
  msgLabel: string;
  memoTitle: string;
  linksTitle: string;
  projectsTitle: string;
  experienceTitle: string;
  skillsTitle: string;
  contactTitle: string;
  /** 联系方式前的屏显标签。 */
  replyTo: string;
  noMail: string;
  totalLabel: string;
  totalUnit: string;
  /** 屏显收尾分隔，不翻译（ASCII 装饰 + 机器语）。 */
  endLine: string;
  /** 页脚分区的可访问名。 */
  endLabel: string;
  sampleNote: string;
}

export const messages: Record<string, PagerMessages> = {
  'zh-CN': {
    brand: 'SENRENBANKA',
    pageLabel: '消息机主页',
    locLabel: '地点',
    msgLabel: 'MSG',
    memoTitle: '备注',
    linksTitle: '链接',
    projectsTitle: '项目',
    experienceTitle: '经历',
    skillsTitle: '技能',
    contactTitle: '联系',
    replyTo: '回信',
    noMail: '未登记联系方式',
    totalLabel: '合计',
    totalUnit: '件',
    endLine: '-- END OF MESSAGES --',
    endLabel: '消息结束',
    sampleNote: '示例消息・仅作演示',
  },
  ja: {
    brand: 'SENRENBANKA',
    pageLabel: 'ポケットベル',
    locLabel: '場所',
    msgLabel: 'MSG',
    memoTitle: 'メモ',
    linksTitle: 'リンク',
    projectsTitle: '案件',
    experienceTitle: '経歴',
    skillsTitle: 'スキル',
    contactTitle: '連絡先',
    replyTo: 'メール',
    noMail: '連絡先未登録',
    totalLabel: '件数',
    totalUnit: '件',
    endLine: '-- END OF MESSAGES --',
    endLabel: 'メッセージここまで',
    sampleNote: 'サンプルポケベル・デモ用',
  },
  en: {
    brand: 'SENRENBANKA',
    pageLabel: 'PAGER',
    locLabel: 'LOC',
    msgLabel: 'MSG',
    memoTitle: 'MEMO',
    linksTitle: 'LINKS',
    projectsTitle: 'PROJECTS',
    experienceTitle: 'HISTORY',
    skillsTitle: 'SKILLS',
    contactTitle: 'CONTACT',
    replyTo: 'REPLY',
    noMail: 'NO CONTACT ON FILE',
    totalLabel: 'TOTAL',
    totalUnit: 'MSG',
    endLine: '-- END OF MESSAGES --',
    endLabel: 'END OF MESSAGES',
    sampleNote: 'SAMPLE PAGER - DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
