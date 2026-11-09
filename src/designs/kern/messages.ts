/**
 * kern 主题文案（SPEC §4）。
 * 瑞士排版语言：标签式、极短、不加句号。
 * 主分区标准标签由 `src/i18n/sections.ts` 提供，不在本文件重复。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface KernMessages {
  portfolio: string;
}

export const messages: Record<string, KernMessages> = {
  'zh-CN': {
    portfolio: '作品集',
  },
  'zh-TW': {
    portfolio: '作品集',
  },
  ja: {
    portfolio: 'ポートフォリオ',
  },
  en: {
    portfolio: 'Portfolio',
  },
  ko: {
    portfolio: '포트폴리오',
  },
};

export type MessageLocale = keyof typeof messages;
