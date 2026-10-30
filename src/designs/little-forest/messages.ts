/**
 * little-forest theme copy.
 *
 * The voice is a quiet field book: directions are gentle, section names refer
 * to real parts of the trail, and nothing claims a personal fact that is not
 * present in the profile. All visible interface copy is localized; numerals
 * and drawn ornaments are decorative and do not need translation.
 *
 * Pure data: this module must not import CSS, Page.astro or style.css.
 */
export interface LittleForestMessages {
  trailLabel: string;
  entranceKicker: string;
  entranceNote: string;
  locationLabel: string;
  observationLabel: string;
  observationCaption: string;
  noAvatar: string;
  clearingTitle: string;
  clearingLabel: string;
  linksTitle: string;
  linksLabel: string;
  noLinks: string;
  projectsTitle: string;
  projectsLabel: string;
  placeLabel: string;
  experienceTitle: string;
  experienceLabel: string;
  skillsTitle: string;
  skillsLabel: string;
  specimenLabel: string;
  contactTitle: string;
  contactLabel: string;
  emailLabel: string;
  noContact: string;
  footerColophon: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', LittleForestMessages> = {
  'zh-CN': {
    trailLabel: '森林小径',
    entranceKicker: '一本林间观察簿',
    entranceNote: '沿着小径慢慢走，木牌会替你指路。',
    locationLabel: '发现于',
    observationLabel: '观察卡 · 01',
    observationCaption: '一页留给遇见的人',
    noAvatar: '这一页夹着一枚叶子',
    clearingTitle: '林间留白',
    clearingLabel: '沿路手记',
    linksTitle: '路口木牌',
    linksLabel: '可去的地方',
    noLinks: '小径暂时没有分岔。',
    projectsTitle: '沿途地点',
    projectsLabel: '地图上的停靠处',
    placeLabel: '地点',
    experienceTitle: '树轮',
    experienceLabel: '一圈，一季',
    skillsTitle: '野花标本',
    skillsLabel: '在路边采下',
    specimenLabel: '标本',
    contactTitle: '林中小屋',
    contactLabel: '窗里亮着灯',
    emailLabel: '写信',
    noContact: '小径在这里轻轻转弯。',
    footerColophon: '一间纸上的森林 · 慢慢走，仔细看',
  },
  ja: {
    trailLabel: '森の小道',
    entranceKicker: '森の観察帖',
    entranceNote: '小道をゆっくり。木の看板が道を示します。',
    locationLabel: '見つけた場所',
    observationLabel: '観察カード・01',
    observationCaption: '出会った人のための一ページ',
    noAvatar: 'このページには一枚の葉',
    clearingTitle: '森の余白',
    clearingLabel: '道すがらの手記',
    linksTitle: '分かれ道の木札',
    linksLabel: '立ち寄れる場所',
    noLinks: '小道にはまだ分かれ道がありません。',
    projectsTitle: '道中の場所',
    projectsLabel: '地図の立ち寄り先',
    placeLabel: '地点',
    experienceTitle: '年輪',
    experienceLabel: 'ひと巡り、ひと季',
    skillsTitle: '野花の標本',
    skillsLabel: '道ばたで採集',
    specimenLabel: '標本',
    contactTitle: '森の小屋',
    contactLabel: '窓に灯がともる',
    emailLabel: '手紙を書く',
    noContact: '小道はここで、そっと曲がる。',
    footerColophon: '紙の森から · ゆっくり、よく見て',
  },
  en: {
    trailLabel: 'Forest trail',
    entranceKicker: 'A forest field book',
    entranceNote: 'Walk slowly along the path; the signs will point the way.',
    locationLabel: 'Found at',
    observationLabel: 'Field note · 01',
    observationCaption: 'A page for the one we meet',
    noAvatar: 'A single leaf is pressed here',
    clearingTitle: 'A clearing',
    clearingLabel: 'Notes along the way',
    linksTitle: 'Trailheads',
    linksLabel: 'Places to wander',
    noLinks: 'For now, the path has no turning.',
    projectsTitle: 'Places along the path',
    projectsLabel: 'Stops on the map',
    placeLabel: 'Place',
    experienceTitle: 'Tree rings',
    experienceLabel: 'One ring, one season',
    skillsTitle: 'Wildflower specimens',
    skillsLabel: 'Gathered by the path',
    specimenLabel: 'Specimen',
    contactTitle: 'The cottage',
    contactLabel: 'A light in the window',
    emailLabel: 'Write a letter',
    noContact: 'Here, the path turns quietly.',
    footerColophon: 'A forest on paper · walk slowly, look closely',
  },
};

export type MessageLocale = keyof typeof messages;
