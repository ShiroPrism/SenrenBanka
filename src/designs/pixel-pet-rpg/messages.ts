/**
 * pixel-pet-rpg messages.
 *
 * `gameTitle`, `playerLabel`, and `periodLabel` are game-HUD marks and stay
 * identical in every locale. Everything else is localized UI copy. `liveTemplate` is read by
 * script.ts only to update the visible/announced current-stop status from the
 * selected anchor. Chinese and Japanese UI strings use the complete Ark Pixel
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
};

export type MessageLocale = keyof typeof messages;
