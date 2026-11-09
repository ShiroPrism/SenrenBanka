/**
 * frost 主题文案（SPEC §4）。
 * 所有可见分区标签来自 `src/i18n/sections.ts`；本设计没有额外的主题文案。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export type FrostMessages = Record<never, never>;

export const messages: Record<string, FrostMessages> = {
  'zh-CN': {},
  'zh-TW': {},
  ja: {},
  en: {},
  ko: {},
};

export type MessageLocale = keyof typeof messages;
