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
  'zh-TW': {
    skipLink: '跳到主要內容',
    navigation: '頁面目錄',
    brand: 'SENRENBANKA',
    volume: 'VOL. 99 / HTML',
    statusLine: '手工維護 / NO FRAMES',
    homepageLabel: '一個個人主頁',
    locationLabel: '所在地',
    contentsTitle: '本頁目錄',
    elsewhere: '別處',
    contactHint: '信箱在頁面底部',
    writeToMe: '寫信給我',
    railTitle: '告示與徽章',
    construction: '本頁仍在施工',
    badges: ['BEST VIEWED 800x600', 'MADE WITH HTML', 'NO FRAMES'],
    counterTitle: '訪客計數器',
    counterDisplay: '- - - - -',
    counterOffline: '離線 / 未接線',
    counterNote: '計數器沒有接線，不統計訪問。',
    links: '連結',
    linksMark: '[ 連結目錄 ]',
    projects: '專案',
    projectsMark: '[ 檔案 ]',
    experience: '經歷',
    experienceMark: '[ 記錄 ]',
    experienceCaption: '工作記錄',
    org: '機構',
    role: '角色',
    period: '時間',
    description: '說明',
    skills: '技能',
    skillsMark: '[ 清單 ]',
    contact: '聯絡',
    contactMark: '[ 信件 ]',
    emailLabel: '電子郵件',
    noEmail: '未登記電子郵件',
    tagsLabel: '標籤',
    avatarAlt: '{name}的頭像',
    backToTop: '回到頂部',
    footerNote: '外鏈將離開本頁。',
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
  ko: {
    skipLink: '주요 내용으로 건너뛰기',
    navigation: '페이지 목차',
    brand: 'SENRENBANKA',
    volume: 'VOL. 99 / HTML',
    statusLine: '직접 관리 / NO FRAMES',
    homepageLabel: '개인 홈페이지',
    locationLabel: '위치',
    contentsTitle: '이 페이지의 목차',
    elsewhere: '다른 곳',
    contactHint: '메일함은 페이지 맨 아래에 있습니다',
    writeToMe: '메일 쓰기',
    railTitle: '공지와 배지',
    construction: '이 페이지는 아직 공사 중',
    badges: ['BEST VIEWED 800x600', 'MADE WITH HTML', 'NO FRAMES'],
    counterTitle: '방문자 카운터',
    counterDisplay: '- - - - -',
    counterOffline: '오프라인 / 미연결',
    counterNote: '카운터는 연결되지 않아 방문 수를 세지 않습니다.',
    links: '링크',
    linksMark: '[ 링크 목록 ]',
    projects: '프로젝트',
    projectsMark: '[ 파일 ]',
    experience: '경력',
    experienceMark: '[ 기록 ]',
    experienceCaption: '업무 기록',
    org: '소속',
    role: '역할',
    period: '기간',
    description: '설명',
    skills: '기술',
    skillsMark: '[ 목록 ]',
    contact: '연락처',
    contactMark: '[ 편지 ]',
    emailLabel: '이메일',
    noEmail: '이메일 미등록',
    tagsLabel: '태그',
    avatarAlt: '{name}의 프로필 사진',
    backToTop: '맨 위로',
    footerNote: '외부 링크는 이 페이지를 떠납니다.',
  },
};

export type MessageLocale = keyof typeof messages;
