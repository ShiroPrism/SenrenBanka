/**
 * Homepage '99 interface copy (SPEC section 4).
 *
 * Non-translated strings and why:
 * - `SENRENBANKA` is the site brand.
 * - `VOL. 99 / HTML` is a period masthead mark, not a sentence.
 * - The three 88x31 badge inscriptions (`BEST VIEWED 800x600`,
 *   `MADE WITH HTML`, `NO FRAMES`) are 1990s web artifacts. They remain
 *   English in every locale so the badges read as collected web objects.
 *   `NO FRAMES` is also kept in `statusLine` for the same reason.
 * - `//`, the dotted rule, `[x]`, and the 01/02 numbering are ASCII
 *   ornament and structure, not prose.
 *
 * Every other visible string, including the offline counter and table labels,
 * is localized. Pure data: no CSS, Astro component, or style.css imports.
 */
export interface Homepage99Messages {
  skipLink: string;
  navigation: string;
  brand: string;
  volume: string;
  statusLine: string;
  homepageLabel: string;
  locationLabel: string;
  contentsTitle: string;
  elsewhere: string;
  contactHint: string;
  writeToMe: string;
  railTitle: string;
  construction: string;
  badges: readonly [string, string, string];
  counterTitle: string;
  counterDisplay: string;
  counterOffline: string;
  counterNote: string;
  links: string;
  linksMark: string;
  projects: string;
  projectsMark: string;
  experience: string;
  experienceMark: string;
  experienceCaption: string;
  org: string;
  role: string;
  period: string;
  description: string;
  skills: string;
  skillsMark: string;
  contact: string;
  contactMark: string;
  emailLabel: string;
  noEmail: string;
  tagsLabel: string;
  avatarAlt: string;
  backToTop: string;
  footerNote: string;
}

export const messages: Record<string, Homepage99Messages> = {
  'zh-CN': {
    skipLink: '跳到主要内容',
    navigation: '页面目录',
    brand: 'SENRENBANKA',
    volume: 'VOL. 99 / HTML',
    statusLine: '手工维护 / NO FRAMES',
    homepageLabel: '一个个人主页',
    locationLabel: '所在地',
    contentsTitle: '本页目录',
    elsewhere: '别处',
    contactHint: '信箱在页面底部',
    writeToMe: '写信给我',
    railTitle: '告示与徽章',
    construction: '本页仍在施工',
    badges: ['BEST VIEWED 800x600', 'MADE WITH HTML', 'NO FRAMES'],
    counterTitle: '访客计数器',
    counterDisplay: '- - - - -',
    counterOffline: '离线 / 未接线',
    counterNote: '计数器没有接线，不统计访问。',
    links: '链接',
    linksMark: '[ 链接目录 ]',
    projects: '项目',
    projectsMark: '[ 文件 ]',
    experience: '经历',
    experienceMark: '[ 记录 ]',
    experienceCaption: '工作记录',
    org: '机构',
    role: '角色',
    period: '时间',
    description: '说明',
    skills: '技能',
    skillsMark: '[ 清单 ]',
    contact: '联系',
    contactMark: '[ 信件 ]',
    emailLabel: '电子邮件',
    noEmail: '未登记电子邮件',
    tagsLabel: '标签',
    avatarAlt: '{name}的头像',
    backToTop: '回到顶部',
    footerNote: '外链将离开本页。',
  },
  ja: {
    skipLink: 'メインコンテンツへスキップ',
    navigation: 'ページ目次',
    brand: 'SENRENBANKA',
    volume: 'VOL. 99 / HTML',
    statusLine: '手作り運営 / NO FRAMES',
    homepageLabel: '個人ホームページ',
    locationLabel: '所在地',
    contentsTitle: 'このページの目次',
    elsewhere: '外部リンク',
    contactHint: 'メールはページ下部にあります',
    writeToMe: 'メールを書く',
    railTitle: 'お知らせとバッジ',
    construction: 'このページは工事中です',
    badges: ['BEST VIEWED 800x600', 'MADE WITH HTML', 'NO FRAMES'],
    counterTitle: '訪問者カウンター',
    counterDisplay: '- - - - -',
    counterOffline: 'オフライン / 未接続',
    counterNote: 'カウンターは未接続で、訪問数は記録しません。',
    links: 'リンク',
    linksMark: '[ リンク集 ]',
    projects: 'プロジェクト',
    projectsMark: '[ ファイル ]',
    experience: '経歴',
    experienceMark: '[ 記録 ]',
    experienceCaption: '職務記録',
    org: '所属',
    role: '役割',
    period: '期間',
    description: '説明',
    skills: 'スキル',
    skillsMark: '[ 一覧 ]',
    contact: '連絡先',
    contactMark: '[ 手紙 ]',
    emailLabel: 'メール',
    noEmail: 'メール未登録',
    tagsLabel: 'タグ',
    avatarAlt: '{name} のポートレート',
    backToTop: 'ページ上部へ戻る',
    footerNote: '外部リンクはこのページを離れます。',
  },
  en: {
    skipLink: 'Skip to main content',
    navigation: 'Page directory',
    brand: 'SENRENBANKA',
    volume: 'VOL. 99 / HTML',
    statusLine: 'HAND-CODED / NO FRAMES',
    homepageLabel: 'A PERSONAL HOMEPAGE',
    locationLabel: 'LOCATION',
    contentsTitle: 'ON THIS PAGE',
    elsewhere: 'ELSEWHERE',
    contactHint: 'The mailbox is at the bottom',
    writeToMe: 'WRITE TO ME',
    railTitle: 'NOTICES & BADGES',
    construction: 'UNDER CONSTRUCTION',
    badges: ['BEST VIEWED 800x600', 'MADE WITH HTML', 'NO FRAMES'],
    counterTitle: 'VISITOR COUNTER',
    counterDisplay: '- - - - -',
    counterOffline: 'OFFLINE / NOT CONNECTED',
    counterNote: 'The counter is not wired. No visits are counted.',
    links: 'LINKS',
    linksMark: '[ LINK DIRECTORY ]',
    projects: 'PROJECTS',
    projectsMark: '[ FILES ]',
    experience: 'EXPERIENCE',
    experienceMark: '[ RECORD ]',
    experienceCaption: 'WORK RECORD',
    org: 'ORGANIZATION',
    role: 'ROLE',
    period: 'PERIOD',
    description: 'DESCRIPTION',
    skills: 'SKILLS',
    skillsMark: '[ LIST ]',
    contact: 'CONTACT',
    contactMark: '[ MAIL ]',
    emailLabel: 'E-MAIL',
    noEmail: 'NO E-MAIL LISTED',
    tagsLabel: 'TAGS',
    avatarAlt: 'Portrait of {name}',
    backToTop: 'BACK TO TOP',
    footerNote: 'External links leave this page.',
  },
};

export type MessageLocale = keyof typeof messages;
