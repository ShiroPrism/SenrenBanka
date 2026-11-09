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
  linksUnit: string;
  projectsUnit: string;
  experienceUnit: string;
  skillsUnit: string;
  emailLabel: string;
  contactMissing: string;
  footerMark: string;
}

export const messages: Record<string, CuteAlismMessages> = {
  'zh-CN': {
    pageLabel: '硬糖几何拼贴主页',
    heroStamp: '个人资料拼贴',
    collageCue: '剪 / 贴 / 再拼',
    portraitLabel: '头像',
    locationLabel: '坐标',
    linksUnit: '条',
    projectsUnit: '件',
    experienceUnit: '段',
    skillsUnit: '枚',
    emailLabel: '发信',
    contactMissing: '暂无联系信息',
    footerMark: 'SENRENBANKA · 硬糖几何拼贴',
  },
  'zh-TW': {
    pageLabel: '硬糖幾何拼貼主頁',
    heroStamp: '個人資料拼貼',
    collageCue: '剪 / 貼 / 再拼',
    portraitLabel: '頭像',
    locationLabel: '座標',
    linksUnit: '條',
    projectsUnit: '件',
    experienceUnit: '段',
    skillsUnit: '枚',
    emailLabel: '發信',
    contactMissing: '暫無聯絡資訊',
    footerMark: 'SENRENBANKA · 硬糖幾何拼貼',
  },
  ja: {
    pageLabel: 'ハードキャンディの幾何学コラージュ',
    heroStamp: 'プロフィール・コラージュ',
    collageCue: '切る / 貼る / 重ねる',
    portraitLabel: 'ポートレート',
    locationLabel: '現在地',
    linksUnit: '件',
    projectsUnit: '件',
    experienceUnit: '件',
    skillsUnit: '個',
    emailLabel: 'メール',
    contactMissing: '連絡先は未設定',
    footerMark: 'SENRENBANKA · 硬質キャンディ・コラージュ',
  },
  en: {
    pageLabel: 'Hard-candy geometric collage',
    heroStamp: 'PROFILE COLLAGE',
    collageCue: 'CUT / PASTE / REPEAT',
    portraitLabel: 'PORTRAIT',
    locationLabel: 'COORDINATES',
    linksUnit: 'LINKS',
    projectsUnit: 'PIECES',
    experienceUnit: 'BANDS',
    skillsUnit: 'BADGES',
    emailLabel: 'WRITE TO',
    contactMissing: 'No contact info yet',
    footerMark: 'SENRENBANKA · HARD CANDY COLLAGE',
  },
  ko: {
    pageLabel: '하드 캔디 기하학 콜라주',
    heroStamp: '프로필 콜라주',
    collageCue: '자르고 / 붙이고 / 반복',
    portraitLabel: '포트레이트',
    locationLabel: '좌표',
    linksUnit: '개',
    projectsUnit: '점',
    experienceUnit: '줄',
    skillsUnit: '장',
    emailLabel: '메일 쓰기',
    contactMissing: '아직 연락처 정보 없음',
    footerMark: 'SENRENBANKA · 하드 캔디 콜라주',
  },
};

export type MessageLocale = keyof typeof messages;
