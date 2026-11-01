/**
 * frost 主题文案（SPEC §4）。
 * Apple HIG 式的克制语气：短标题、名词化、无感叹。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface FrostMessages {
  projects: string;
  experience: string;
  skills: string;
  contact: string;
}

export const messages: Record<string, FrostMessages> = {
  'zh-CN': {
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
  },
  'zh-TW': {
    projects: '專案',
    experience: '經歷',
    skills: '技能',
    contact: '聯絡',
  },
  ja: {
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
  },
  en: {
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    contact: 'Contact',
  },
  ko: {
    projects: '프로젝트',
    experience: '경력',
    skills: '기술',
    contact: '연락처',
  },
};

export type MessageLocale = keyof typeof messages;
