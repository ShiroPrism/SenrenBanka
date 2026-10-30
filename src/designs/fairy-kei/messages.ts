/**
 * fairy-kei 主题文案（SPEC §4）。
 *
 * - 不翻译项：`SENRENBANKA`（站名 / 品牌）、目录编号（01 / 02 …）与
 *   彩色分隔条内的纯数字——它们是收藏盒的物件标记，不是界面文案。
 * - 语域：一只打开的复古少女玩具收藏盒。分区名像盒内标签、抽屉卡纸和
 *   收藏卡背面，而不是通用网页卡片标题。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface FairyKeiMessages {
  brand: string;
  skipToContent: string;
  /** 页面主标题上方的收藏系列名。 */
  collectionLabel: string;
  /** 盒盖内侧的收藏盒名。 */
  caseTitle: string;
  portraitLabel: string;
  /** 头像替代文本模板；`{name}` 由页面替换为当前语言姓名。 */
  avatarAlt: string;
  locationLabel: string;
  linksTitle: string;
  linkUnit: string;
  noLinks: string;
  bioTitle: string;
  packageSeal: string;
  projectsTitle: string;
  drawerHint: string;
  tagsLabel: string;
  projectLink: string;
  experienceTitle: string;
  skillsTitle: string;
  contactTitle: string;
  emailLabel: string;
  noMail: string;
  footerTitle: string;
  footerLine: string;
  sampleNote: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', FairyKeiMessages> = {
  'zh-CN': {
    brand: 'SENRENBANKA',
    skipToContent: '跳到打开的收藏盒',
    collectionLabel: '糖果玩具收藏',
    caseTitle: '打开的宝贝盒',
    portraitLabel: '收藏窗',
    avatarAlt: '{name} 的收藏窗头像',
    locationLabel: '收藏地',
    linksTitle: '挂着的小玩意',
    linkUnit: '件',
    noLinks: '收藏盒里还没有挂饰',
    bioTitle: '盒底说明卡',
    packageSeal: '从这里打开',
    projectsTitle: '玩具抽屉',
    drawerHint: '拉开抽屉',
    tagsLabel: '标签',
    projectLink: '看看这件收藏',
    experienceTitle: '丝带卷轴',
    skillsTitle: '贴纸册',
    contactTitle: '留给你的便签',
    emailLabel: '投递地址',
    noMail: '还没有留下投递地址',
    footerTitle: '收藏卡背面',
    footerLine: '从一只旧玩具盒里，把喜欢的东西一件件摆出来。',
    sampleNote: '示例收藏卡 · 仅作演示',
  },
  ja: {
    brand: 'SENRENBANKA',
    skipToContent: 'ひらいた宝物箱へ進む',
    collectionLabel: 'キャンディ玩具コレクション',
    caseTitle: 'ひらいた宝物箱',
    portraitLabel: 'コレクション窓',
    avatarAlt: '{name} のコレクション窓',
    locationLabel: 'コレクションの場所',
    linksTitle: 'ぶら下がりチャーム',
    linkUnit: '個',
    noLinks: 'チャームはまだありません',
    bioTitle: '箱の説明カード',
    packageSeal: 'ここから開ける',
    projectsTitle: 'おもちゃの引き出し',
    drawerHint: '引き出しを開く',
    tagsLabel: 'タグ',
    projectLink: 'このコレクションを見る',
    experienceTitle: 'リボンの巻物',
    skillsTitle: 'シール帳',
    contactTitle: 'あなたへのメモ',
    emailLabel: '宛先',
    noMail: '宛先はまだありません',
    footerTitle: 'コレクションカードの裏',
    footerLine: '古いおもちゃ箱から、好きなものをひとつずつ。',
    sampleNote: 'サンプルのコレクションカード · デモ用',
  },
  en: {
    brand: 'SENRENBANKA',
    skipToContent: 'Skip to the open keepsake case',
    collectionLabel: 'CANDY TOY COLLECTION',
    caseTitle: 'OPEN TREASURE CASE',
    portraitLabel: 'COLLECTOR WINDOW',
    avatarAlt: 'Collector portrait of {name}',
    locationLabel: 'KEPT IN',
    linksTitle: 'DANGLING CHARMS',
    linkUnit: 'charms',
    noLinks: 'No charms in the case yet',
    bioTitle: 'PACKAGE NOTES',
    packageSeal: 'OPEN HERE',
    projectsTitle: 'TOY DRAWERS',
    drawerHint: 'PULL THE DRAWER',
    tagsLabel: 'TAGS',
    projectLink: 'VISIT THIS KEEPSAKE',
    experienceTitle: 'RIBBON ROLL',
    skillsTitle: 'STICKER SHEET',
    contactTitle: 'A NOTE FOR YOU',
    emailLabel: 'POST TO',
    noMail: 'No return address tucked in yet',
    footerTitle: 'BACK OF THE COLLECTOR CARD',
    footerLine: 'A few favourite things, tucked into an old toy case.',
    sampleNote: 'SAMPLE COLLECTION CARD · DEMO ONLY',
  },
};

export type MessageLocale = keyof typeof messages;
