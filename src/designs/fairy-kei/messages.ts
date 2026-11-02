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
}

export const messages: Record<string, FairyKeiMessages> = {
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
  },
  'zh-TW': {
    brand: 'SENRENBANKA',
    skipToContent: '跳到開啟的收藏盒',
    collectionLabel: '糖果玩具收藏',
    caseTitle: '開啟的寶貝盒',
    portraitLabel: '收藏窗',
    avatarAlt: '{name} 的收藏窗頭像',
    locationLabel: '收藏地',
    linksTitle: '掛著的小玩意',
    linkUnit: '件',
    noLinks: '收藏盒裡還沒有掛飾',
    bioTitle: '盒底說明卡',
    packageSeal: '從這裡開啟',
    projectsTitle: '玩具抽屜',
    drawerHint: '拉開抽屜',
    tagsLabel: '標籤',
    projectLink: '看看這件收藏',
    experienceTitle: '絲帶卷軸',
    skillsTitle: '貼紙冊',
    contactTitle: '留給你的便籤',
    emailLabel: '投遞地址',
    noMail: '還沒有留下投遞地址',
    footerTitle: '收藏卡背面',
    footerLine: '從一隻舊玩具盒裡，把喜歡的東西一件件擺出來。',
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
  },
  ko: {
    brand: 'SENRENBANKA',
    skipToContent: '열린 보물 상자로 건너뛰기',
    collectionLabel: '캔디 장난감 컬렉션',
    caseTitle: '열린 보물 상자',
    portraitLabel: '컬렉션 창',
    avatarAlt: '{name}의 컬렉션 창',
    locationLabel: '컬렉션 장소',
    linksTitle: '매달린 장식',
    linkUnit: '개',
    noLinks: '아직 상자에 걸린 장식이 없습니다',
    bioTitle: '상자 속 설명 카드',
    packageSeal: '여기서 열기',
    projectsTitle: '장난감 서랍',
    drawerHint: '서랍 열기',
    tagsLabel: '태그',
    projectLink: '이 컬렉션 보기',
    experienceTitle: '리본 두루마리',
    skillsTitle: '스티커 앨범',
    contactTitle: '당신에게 남기는 메모',
    emailLabel: '보낼 곳',
    noMail: '아직 보낼 주소가 없습니다',
    footerTitle: '컬렉션 카드 뒷면',
    footerLine: '낡은 장난감 상자에서 좋아하는 것들을 하나씩 꺼내 놓았습니다.',
  },
};

export type MessageLocale = keyof typeof messages;
