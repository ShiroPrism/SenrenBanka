/**
 * material3 主题文案（SPEC §4）。
 * Material 3 的语气：功能导向的标签 + 克制的说明句。
 * 页脚的 'Material 3' 是**品牌专有名词**，不翻译；仅本地化其余部分。
 * 主分区标准标签由 `src/i18n/sections.ts` 提供，不在本文件重复。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface Material3Messages {
  portfolio: string;
  footerSource: string;
}

export const messages: Record<string, Material3Messages> = {
  'zh-CN': {
    portfolio: '作品集',
    footerSource: 'Material 3 设计系统汇编',
  },
  'zh-TW': {
    portfolio: '作品集',
    footerSource: 'Material 3 設計系統彙編',
  },
  ja: {
    portfolio: 'ポートフォリオ',
    footerSource: 'Material 3 デザインシステム編纂',
  },
  en: {
    portfolio: 'Portfolio',
    footerSource: 'Material 3 design system compilation',
  },
  ko: {
    portfolio: '포트폴리오',
    footerSource: 'Material 3 디자인 시스템 편찬',
  },
};

export type MessageLocale = keyof typeof messages;
