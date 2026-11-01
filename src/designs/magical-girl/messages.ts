/**
 * magical-girl copy: a formal character dossier spoken in a stage-debut voice.
 *
 * Every visible control and section label is localized here. Profile facts,
 * project names, URLs and contact details come from the profile data and are not
 * rewritten by this theme. The short navigation labels differ from the fuller
 * section titles deliberately: the masthead must remain a compact ribbon index.
 *
 * This module is pure data and imports no CSS or page modules.
 */

export interface MagicalGirlMessages {
  skipToContent: string;
  pageLabel: string;
  crest: string;
  stageStamp: string;
  navLabel: string;
  linksNav: string;
  projectsNav: string;
  experienceNav: string;
  skillsNav: string;
  contactNav: string;
  locationLabel: string;
  linksTitle: string;
  emptyLinks: string;
  projectsTitle: string;
  episodeLabel: string;
  tagsLabel: string;
  experienceTitle: string;
  skillsTitle: string;
  contactTitle: string;
  emailLabel: string;
  footerMark: string;
  footerLabel: string;
  backToTop: string;
}

export const messages: Record<string, MagicalGirlMessages> = {
  'zh-CN': {
    skipToContent: '跳到档案正文',
    pageLabel: '魔法少女角色档案',
    crest: '星辉档案',
    stageStamp: '舞台登场',
    navLabel: '档案目录',
    linksNav: '道具',
    projectsNav: '章回',
    experienceNav: '年表',
    skillsNav: '封印',
    contactNav: '信笺',
    locationLabel: '所在地',
    linksTitle: '魔法道具',
    emptyLinks: '尚未登记魔法道具。',
    projectsTitle: '星轨章回',
    episodeLabel: '章回',
    tagsLabel: '章回标记',
    experienceTitle: '变身年表',
    skillsTitle: '技能封印',
    contactTitle: '蜡封信笺',
    emailLabel: '电子信址',
    footerMark: '星辉档案 · 舞台终幕',
    footerLabel: '档案页脚',
    backToTop: '回到开场',
  },
  ja: {
    skipToContent: '本文へ',
    pageLabel: '魔法少女キャラクターファイル',
    crest: '星読みのファイル',
    stageStamp: '舞台登場',
    navLabel: 'ファイル目次',
    linksNav: '魔法の品',
    projectsNav: '章',
    experienceNav: '年表',
    skillsNav: '封印',
    contactNav: '手紙',
    locationLabel: '所在地',
    linksTitle: '魔法の品々',
    emptyLinks: '魔法の品はまだ登録されていません。',
    projectsTitle: '星路の章',
    episodeLabel: '章',
    tagsLabel: '章の印',
    experienceTitle: '変身年表',
    skillsTitle: '封印の技',
    contactTitle: '封蝋の手紙',
    emailLabel: 'メール',
    footerMark: '星読みのファイル · 終幕',
    footerLabel: 'ファイルのフッター',
    backToTop: '開幕へ戻る',
  },
  en: {
    skipToContent: 'Skip to the dossier',
    pageLabel: 'Magical-girl character dossier',
    crest: 'Starlight dossier',
    stageStamp: 'Stage debut',
    navLabel: 'Dossier index',
    linksNav: 'Keepsakes',
    projectsNav: 'Chapters',
    experienceNav: 'Chronicle',
    skillsNav: 'Seals',
    contactNav: 'Letter',
    locationLabel: 'Location',
    linksTitle: 'Enchanted keepsakes',
    emptyLinks: 'No magical keepsakes are recorded yet.',
    projectsTitle: 'Star-trail chapters',
    episodeLabel: 'Chapter',
    tagsLabel: 'Chapter marks',
    experienceTitle: 'Transformation chronicle',
    skillsTitle: 'Sealed arts',
    contactTitle: 'Letter under wax',
    emailLabel: 'Email',
    footerMark: 'Starlight dossier · final curtain',
    footerLabel: 'Dossier footer',
    backToTop: 'Return to the opening',
  },
  ko: {
    skipToContent: '기록 본문으로 건너뛰기',
    pageLabel: '마법소녀 캐릭터 기록',
    crest: '별빛 기록',
    stageStamp: '무대 등장',
    navLabel: '기록 목차',
    linksNav: '소품',
    projectsNav: '장',
    experienceNav: '연표',
    skillsNav: '봉인',
    contactNav: '편지',
    locationLabel: '소재지',
    linksTitle: '마법 소품',
    emptyLinks: '아직 기록된 마법 소품이 없습니다.',
    projectsTitle: '별길의 장',
    episodeLabel: '장',
    tagsLabel: '장 표식',
    experienceTitle: '변신 연표',
    skillsTitle: '봉인된 기예',
    contactTitle: '밀랍 봉인 편지',
    emailLabel: '이메일',
    footerMark: '별빛 기록 · 종막',
    footerLabel: '기록 바닥글',
    backToTop: '개막으로 돌아가기',
  },
};

export type MessageLocale = keyof typeof messages;
