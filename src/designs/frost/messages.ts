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

export const messages: Record<'zh-CN' | 'ja' | 'en', FrostMessages> = {
  'zh-CN': {
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
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
};

export type MessageLocale = keyof typeof messages;
