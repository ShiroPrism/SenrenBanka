/**
 * kern 主题文案（SPEC §4）。
 * 瑞士排版语言：标签式、极短、不加句号。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface KernMessages {
  portfolio: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
}

export const messages: Record<string, KernMessages> = {
  'zh-CN': {
    portfolio: '作品集',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
  },
  'zh-TW': {
    portfolio: '作品集',
    projects: '專案',
    experience: '經歷',
    skills: '技能',
    contact: '聯絡',
  },
  ja: {
    portfolio: 'ポートフォリオ',
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
  },
  en: {
    portfolio: 'Portfolio',
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    contact: 'Contact',
  },
  ko: {
    portfolio: '포트폴리오',
    projects: '프로젝트',
    experience: '경력',
    skills: '기술',
    contact: '연락처',
  },
};

export type MessageLocale = keyof typeof messages;
