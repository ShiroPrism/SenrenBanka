/**
 * cute-alism 主题文案（SPEC §4）。
 *
 * - `SENRENBANKA` 是站名 / 品牌，三语保持一致，不翻译。
 * - 语域：切纸拼贴工作室的标签与包装背面说明。分区名短、可做大字，
 *   计数单位服务于拼贴版面，不替代真实条目。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface CuteAlismMessages {
  /** main 的可访问名。 */
  pageLabel: string;
  /** 首屏身份块上的小标签。 */
  heroStamp: string;
  /** 拼贴动作标语；在首屏只作装饰性重复。 */
  collageCue: string;
  portraitLabel: string;
  locationLabel: string;
  bioTitle: string;
  linksTitle: string;
  linksUnit: string;
  projectsTitle: string;
  projectsUnit: string;
  experienceTitle: string;
  experienceUnit: string;
  skillsTitle: string;
  skillsUnit: string;
  contactTitle: string;
  emailLabel: string;
  contactMissing: string;
  footerMark: string;
  sampleNote: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', CuteAlismMessages> = {
  'zh-CN': {
    pageLabel: '硬糖几何拼贴主页',
    heroStamp: '个人资料拼贴',
    collageCue: '剪 / 贴 / 再拼',
    portraitLabel: '头像',
    locationLabel: '坐标',
    bioTitle: '简介',
    linksTitle: '链接',
    linksUnit: '条',
    projectsTitle: '项目',
    projectsUnit: '件',
    experienceTitle: '经历',
    experienceUnit: '段',
    skillsTitle: '技能',
    skillsUnit: '枚',
    contactTitle: '联系',
    emailLabel: '发信',
    contactMissing: '暂无联系信息',
    footerMark: 'SENRENBANKA · 硬糖几何拼贴',
    sampleNote: '示例资料 · 仅作演示',
  },
  ja: {
    pageLabel: 'ハードキャンディの幾何学コラージュ',
    heroStamp: 'プロフィール・コラージュ',
    collageCue: '切る / 貼る / 重ねる',
    portraitLabel: 'ポートレート',
    locationLabel: '現在地',
    bioTitle: 'プロフィール',
    linksTitle: 'リンク',
    linksUnit: '件',
    projectsTitle: 'プロジェクト',
    projectsUnit: '件',
    experienceTitle: '経歴',
    experienceUnit: '件',
    skillsTitle: 'スキル',
    skillsUnit: '個',
    contactTitle: '連絡先',
    emailLabel: 'メール',
    contactMissing: '連絡先は未設定',
    footerMark: 'SENRENBANKA · 硬質キャンディ・コラージュ',
    sampleNote: 'サンプルプロフィール · デモ用',
  },
  en: {
    pageLabel: 'Hard-candy geometric collage',
    heroStamp: 'PROFILE COLLAGE',
    collageCue: 'CUT / PASTE / REPEAT',
    portraitLabel: 'PORTRAIT',
    locationLabel: 'COORDINATES',
    bioTitle: 'PROFILE',
    linksTitle: 'LINKS',
    linksUnit: 'LINKS',
    projectsTitle: 'PROJECTS',
    projectsUnit: 'PIECES',
    experienceTitle: 'EXPERIENCE',
    experienceUnit: 'BANDS',
    skillsTitle: 'SKILLS',
    skillsUnit: 'BADGES',
    contactTitle: 'CONTACT',
    emailLabel: 'WRITE TO',
    contactMissing: 'No contact info yet',
    footerMark: 'SENRENBANKA · HARD CANDY COLLAGE',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
