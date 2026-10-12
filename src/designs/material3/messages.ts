/**
 * material3 主题文案（SPEC §4）。
 * Material 3 的语气：功能导向的标签 + 克制的说明句。
 * 页脚的 'Material 3' 是**品牌专有名词**，不翻译；仅本地化其余部分。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface Material3Messages {
  portfolio: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
  footerSource: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', Material3Messages> = {
  'zh-CN': {
    portfolio: '作品集',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
    footerSource: 'Material 3 设计系统汇编',
  },
  ja: {
    portfolio: 'ポートフォリオ',
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
    footerSource: 'Material 3 デザインシステム編纂',
  },
  en: {
    portfolio: 'Portfolio',
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    contact: 'Contact',
    footerSource: 'Material 3 design system compilation',
  },
};

export type MessageLocale = keyof typeof messages;
