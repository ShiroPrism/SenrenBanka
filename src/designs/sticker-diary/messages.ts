/**
 * sticker-diary interface copy.
 *
 * Untranslatable strings: `SENRENBANKA` is the site's brand name; numeric page
 * marks and the diamond/arrow ornaments are layout marks rather than language.
 * The three dictionaries use the voice of a personal scrapbook instead of
 * mechanically copying labels from other designs.
 *
 * Pure data only: do not import CSS, Astro pages or the page stylesheet here.
 */

export interface StickerDiaryMessages {
  brand: string;
  bookLabel: string;
  navLabel: string;
  profileTab: string;
  linksTab: string;
  projectsTab: string;
  experienceTab: string;
  skillsTab: string;
  contactTab: string;
  aboutTitle: string;
  linksTitle: string;
  projectsTitle: string;
  experienceTitle: string;
  skillsTitle: string;
  contactTitle: string;
  linksUnit: string;
  projectsUnit: string;
  experienceUnit: string;
  skillsUnit: string;
  tagsLabel: string;
  contactLabel: string;
  noLinks: string;
  noContact: string;
  prevLabel: string;
  nextLabel: string;
  statusTemplate: string;
  closing: string;
  sampleNote: string;
}

export const messages: Record<string, StickerDiaryMessages> = {
  'zh-CN': {
    brand: 'SENRENBANKA',
    bookLabel: '贴纸手帐',
    navLabel: '手帐书签',
    profileTab: '关于我',
    linksTab: '收藏',
    projectsTab: '企划',
    experienceTab: '足迹',
    skillsTab: '技能贴纸',
    contactTab: '留言',
    aboutTitle: '写在扉页',
    linksTitle: '喜欢的地方',
    projectsTitle: '做过的事',
    experienceTitle: '走过的地方',
    skillsTitle: '会一点的事',
    contactTitle: '最后一页',
    linksUnit: '个去处',
    projectsUnit: '件事',
    experienceUnit: '站',
    skillsUnit: '枚贴纸',
    tagsLabel: '标签',
    contactLabel: '写信给我',
    noLinks: '还没有收藏链接',
    noContact: '这一页还没有留言',
    prevLabel: '上一页',
    nextLabel: '下一页',
    statusTemplate: '第 {n} 页，共 {total} 页：{label}',
    closing: '写到这里，先合上手帐。',
    sampleNote: '示例手帐 · 仅作演示',
  },
  ja: {
    brand: 'SENRENBANKA',
    bookLabel: 'ステッカー手帳',
    navLabel: '手帳のしおり',
    profileTab: 'プロフィール',
    linksTab: 'リンク',
    projectsTab: '企画',
    experienceTab: '足あと',
    skillsTab: 'スキル',
    contactTab: 'メッセージ',
    aboutTitle: '扉のページ',
    linksTitle: 'お気に入り',
    projectsTitle: 'つくったもの',
    experienceTitle: '歩いた道',
    skillsTitle: 'できること',
    contactTitle: '最後のページ',
    linksUnit: '件',
    projectsUnit: '件',
    experienceUnit: '駅',
    skillsUnit: '枚',
    tagsLabel: 'タグ',
    contactLabel: 'メール',
    noLinks: 'まだリンクがありません',
    noContact: 'このページはまだ空白です',
    prevLabel: '前のページ',
    nextLabel: '次のページ',
    statusTemplate: '見開き {n} / {total}：{label}',
    closing: 'ここまで。そっと手帳を閉じます。',
    sampleNote: 'サンプル手帳・デモ用',
  },
  en: {
    brand: 'SENRENBANKA',
    bookLabel: 'Sticker diary',
    navLabel: 'Diary bookmarks',
    profileTab: 'Profile',
    linksTab: 'Links',
    projectsTab: 'Work',
    experienceTab: 'Past',
    skillsTab: 'Skills',
    contactTab: 'Note',
    aboutTitle: 'On the first page',
    linksTitle: 'Places I like',
    projectsTitle: 'Things I made',
    experienceTitle: 'Places I have been',
    skillsTitle: 'Things I can do',
    contactTitle: 'The last page',
    linksUnit: 'saved',
    projectsUnit: 'made',
    experienceUnit: 'stops',
    skillsUnit: 'stickers',
    tagsLabel: 'Tags',
    contactLabel: 'Email',
    noLinks: 'No links tucked in yet',
    noContact: 'This page is still blank',
    prevLabel: 'Previous page',
    nextLabel: 'Next page',
    statusTemplate: 'Spread {n} of {total}: {label}',
    closing: 'The end, for now.',
    sampleNote: 'Sample diary / demo only',
  },
};

export type MessageLocale = keyof typeof messages;
