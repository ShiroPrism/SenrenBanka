/**
 * deco 主题文案（SPEC §4）。
 *
 * - 语域：剧院节目单——分区标题是印刷节目单上的栏目标签（剧目表 / 幕次 / 演出单 /
 *   演职员表 / 售票处），不用产品化措辞（「项目」「技能」这类词会被替换成节目单用语）。
 * - 不翻译项（均为刻意保留，非漏译）：
 *   1. 幕次罗马数字 `I`–`XII`：编号是装饰性版式元素（`aria-hidden`），跨语言恒用罗马数字；
 *   2. monogram 标记：由姓名首字派生（拉丁取词首字母、CJK 取姓名前两字），不是译文；
 *   3. 菱形、线—菱形—线等装饰：纯 CSS 伪元素，不产生文本节点；
 *   4. 资料内的专有名词（项目名 / 组织名 / URL / 邮箱）由资料契约原样呈现，不进本文件；
 *   5. 本设计不渲染品牌字标，故无品牌名保留项。
 * - 全大写只由 CSS 的 `text-transform` 承担；仅 `en` 因语域需要按英文印刷惯例直接写成
 *   大写字母串（避免 zh/ja 文案被大小写化）。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface DecoMessages {
  /** 页眉 / 首屏 kicker：节目单本身的名字。 */
  portfolio: string;
  /** 序言块（bio）的栏目标签。 */
  overtureLabel: string;
  /** links 分区标题（剧目表）。 */
  linksTitle: string;
  /** projects 分区标题（幕次）。 */
  projectsTitle: string;
  /** experience 分区标题（演出单）。 */
  experienceTitle: string;
  /** skills 分区标题（演职员表）。 */
  skillsTitle: string;
  /** contact 分区标题（售票处）。 */
  contactTitle: string;
  /** 幕次卡片序号前的类别词（装饰性，作用于 `aria-hidden` 容器）。 */
  actWord: string;
  /** 页脚：资料是示例数据的声明。 */
  sampleNote: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', DecoMessages> = {
  'zh-CN': {
    portfolio: '节目单',
    overtureLabel: '序言',
    linksTitle: '剧目表',
    projectsTitle: '幕次',
    experienceTitle: '演出单',
    skillsTitle: '演职员表',
    contactTitle: '售票处',
    actWord: '幕次',
    sampleNote: '示例资料・仅作演示',
  },
  ja: {
    portfolio: 'プログラム',
    overtureLabel: '序文',
    linksTitle: '演目',
    projectsTitle: '上演作品',
    experienceTitle: '出演記録',
    skillsTitle: 'クレジット',
    contactTitle: '当日券売所',
    actWord: '幕',
    sampleNote: 'サンプル資料・デモ用',
  },
  en: {
    portfolio: 'PROGRAMME',
    overtureLabel: 'OVERTURE',
    linksTitle: 'THE BILL',
    projectsTitle: 'ACTS',
    experienceTitle: 'ENGAGEMENTS',
    skillsTitle: 'CREDITS',
    contactTitle: 'BOX OFFICE',
    actWord: 'ACT',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
  },
};

export type DecoMessageLocale = keyof typeof messages;
