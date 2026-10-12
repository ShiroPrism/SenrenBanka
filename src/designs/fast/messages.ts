/**
 * fast 主题文案（SPEC §4）。
 * 极简单色语言：短词、无修饰语，接近 UI 标签而非编辑文案。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface FastMessages {
  portfolio: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', FastMessages> = {
  'zh-CN': {
    portfolio: '作品集',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
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
};

export type MessageLocale = keyof typeof messages;
