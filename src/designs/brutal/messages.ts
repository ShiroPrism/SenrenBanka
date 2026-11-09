/**
 * brutal 主题文案（SPEC §4）。
 *
 * - 语域：告示 / 标签 / 台账，短词、命令式、全大写（拉丁）。
 * - 不翻译项：`BT` 是设计标记（由 CSS 伪元素 / 装饰元素承担，不进本文件）；
 *   `SENRENBANKA` 若出现在页脚则作为品牌名保留，不翻译。
 * - 主分区标准标签由 `src/i18n/sections.ts` 提供，不在本文件重复。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface BrutalMessages {
  portfolio: string;
  notice: string;
  index: string;
  noContact: string;
}

export const messages: Record<string, BrutalMessages> = {
  'zh-CN': {
    portfolio: '作品集',
    notice: '告示',
    index: '索引',
    noContact: '未配置联系方式',
  },
  'zh-TW': {
    portfolio: '作品集',
    notice: '告示',
    index: '索引',
    noContact: '未配置聯絡方式',
  },
  ja: {
    portfolio: 'ポートフォリオ',
    notice: '告知',
    index: '索引',
    noContact: '連絡先未設定',
  },
  en: {
    portfolio: 'PORTFOLIO',
    notice: 'NOTICE',
    index: 'INDEX',
    noContact: 'NO CONTACT CONFIGURED',
  },
  ko: {
    portfolio: '포트폴리오',
    notice: '공지',
    index: '색인',
    noContact: '연락처 미설정',
  },
};

export type MessageLocale = keyof typeof messages;
