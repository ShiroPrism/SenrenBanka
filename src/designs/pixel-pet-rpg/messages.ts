/**
 * pixel-pet-rpg messages.
 *
 * `gameTitle`, `playerLabel`, and `periodLabel` are game-HUD marks and stay
 * identical in every locale. Everything else is localized UI copy. `liveTemplate` is read by
 * script.ts only to update the visible/announced current-stop status from the
 * selected anchor. Section h2s come from the shared label table
 * (`src/i18n/sections`); the `*Title` values below are the station names shown on
 * the map and as the panel kicker, never as heading text. Chinese and Japanese UI strings use the complete Ark Pixel
 * core-cjk shards; source-missing glyphs may still fall back per glyph.
 * Station indexes (`01`, `02`, ...) are generated in Page.astro as aria-hidden
 * DOM-order marks, so they are not language copy.
 */
export interface PixelPetMessages {
  gameTitle: string;
  pageLabel: string;
  skipLink: string;
  hudLabel: string;
  playerLabel: string;
  locationLabel: string;
  mapTitle: string;
  mapHint: string;
  mapNavLabel: string;
  currentStopLabel: string;
  panelLabel: string;
  identityTitle: string;
  linksTitle: string;
  projectsTitle: string;
  experienceTitle: string;
  /** 经历分区的语域词（kicker）：地名「经历日志」之外的屏显短词。 */
  experienceKicker: string;
  skillsTitle: string;
  contactTitle: string;
  avatarAlt: string;
  emptyLinks: string;
  periodLabel: string;
  tagsLabel: string;
  emailLabel: string;
  noEmail: string;
  liveTemplate: string;
}

export const messages: Record<string, PixelPetMessages> = {
  'zh-CN': {
    gameTitle: 'PIXEL PET TOWN',
    pageLabel: '资料页面',
    skipLink: '跳到路标',
    hudLabel: '资料信息',
    playerLabel: 'PLAYER',
    locationLabel: '地点',
    mapTitle: '地点路标',
    mapHint: '选择地名，查看地点。',
    mapNavLabel: '地点',
    currentStopLabel: '当前地点',
    panelLabel: '资料地点',
    identityTitle: '个人资料',
    linksTitle: '随身物品',
    projectsTitle: '远方路标',
    experienceTitle: '经历日志',
    experienceKicker: '日志',
    skillsTitle: '工具',
    contactTitle: '联系',
    avatarAlt: '{name} 的个人形象',
    emptyLinks: '随身物品是空的。',
    periodLabel: 'WHEN',
    tagsLabel: '标签',
    emailLabel: '邮箱',
    noEmail: '没有地址。',
    liveTemplate: '现在来到{place}。',
  },
  'zh-TW': {
    gameTitle: 'PIXEL PET TOWN',
    pageLabel: '資料頁面',
    skipLink: '跳到路標',
    hudLabel: '資料資訊',
    playerLabel: 'PLAYER',
    locationLabel: '地點',
    mapTitle: '地點路標',
    mapHint: '選擇地名，檢視地點。',
    mapNavLabel: '地點',
    currentStopLabel: '當前地點',
    panelLabel: '資料地點',
    identityTitle: '個人資料',
    linksTitle: '隨身物品',
    projectsTitle: '遠方路標',
    experienceTitle: '經歷日誌',
    experienceKicker: '日誌',
    skillsTitle: '工具',
    contactTitle: '聯絡',
    avatarAlt: '{name} 的個人形象',
    emptyLinks: '隨身物品是空的。',
    periodLabel: 'WHEN',
    tagsLabel: '標籤',
    emailLabel: '郵箱',
    noEmail: '沒有地址。',
    liveTemplate: '現在來到{place}。',
  },
  ja: {
    gameTitle: 'PIXEL PET TOWN',
    pageLabel: 'ピクセルペットタウン',
    skipLink: '地点へ',
    hudLabel: 'プレイヤー情報',
    playerLabel: 'PLAYER',
    locationLabel: '場所',
    mapTitle: 'タウン案内',
    mapHint: '地名を選んで、地点を見よう。',
    mapNavLabel: 'タウンの場所',
    currentStopLabel: '現在地',
    panelLabel: '地点の情報',
    identityTitle: 'プロフィール',
    linksTitle: '持ちもの',
    projectsTitle: '目的地',
    experienceTitle: '記録',
    experienceKicker: 'ログ',
    skillsTitle: '道具',
    contactTitle: '連絡先',
    avatarAlt: '{name} のプロフィール写真',
    emptyLinks: '持ちものは空です。',
    periodLabel: 'WHEN',
    tagsLabel: 'タグ',
    emailLabel: 'メール',
    noEmail: '住所はありません。',
    liveTemplate: '現在地は{place}。',
  },
  en: {
    gameTitle: 'PIXEL PET TOWN',
    pageLabel: 'Pixel Pet Town profile',
    skipLink: 'Skip to the town map',
    hudLabel: 'Player information',
    playerLabel: 'PLAYER',
    locationLabel: 'LOCATION',
    mapTitle: 'TOWN MAP',
    mapHint: 'Choose a place to visit.',
    mapNavLabel: 'Town places',
    currentStopLabel: 'CURRENT STOP',
    panelLabel: 'Station details',
    identityTitle: 'TRAVELER FILE',
    linksTitle: 'POCKET ITEMS',
    projectsTitle: 'DISTANT MARKERS',
    experienceTitle: 'FOOTPRINT LOG',
    experienceKicker: 'LOG',
    skillsTitle: 'TOOL RACK',
    contactTitle: 'TOWN POST',
    avatarAlt: 'Portrait of {name}',
    emptyLinks: 'The pocket is still empty.',
    periodLabel: 'WHEN',
    tagsLabel: 'TAGS',
    emailLabel: 'POST TO',
    noEmail: 'No address was left in the postbox.',
    liveTemplate: 'Now at {place}.',
  },
  ko: {
    gameTitle: 'PIXEL PET TOWN',
    pageLabel: '픽셀 펫 타운 프로필',
    skipLink: '마을 지도로 건너뛰기',
    hudLabel: '플레이어 정보',
    playerLabel: 'PLAYER',
    locationLabel: '위치',
    mapTitle: '마을 지도',
    mapHint: '지명을 골라 장소를 확인하세요.',
    mapNavLabel: '마을 장소',
    currentStopLabel: '현재 위치',
    panelLabel: '장소 정보',
    identityTitle: '프로필',
    linksTitle: '소지품',
    projectsTitle: '먼 곳 표지판',
    experienceTitle: '발자취 기록',
    experienceKicker: '기록',
    skillsTitle: '도구',
    contactTitle: '마을 우체국',
    avatarAlt: '{name}의 프로필 그림',
    emptyLinks: '소지품이 비어 있습니다.',
    periodLabel: 'WHEN',
    tagsLabel: '태그',
    emailLabel: '메일',
    noEmail: '주소가 남아 있지 않습니다.',
    liveTemplate: '지금 {place}에 있습니다.',
  },
};

export type MessageLocale = keyof typeof messages;
