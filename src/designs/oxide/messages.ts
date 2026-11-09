/**
 * oxide 主题文案（SPEC §4）。
 *
 * - 分区标题（`Links / 链接` 一类双语标识）由共享标准标签 `src/i18n/sections` 提供，
 *   随语言切换；英文主题词（IDENTITY / CHANNELS / CAPABILITIES / DEPLOYMENTS /
 *   OPERATIONS）留在 Page.astro 里作等宽大写 kicker——它们是设计语言，不是分区名。
 * - 本文件只承载真正承担信息传达、需要随语言切换的文案（空态、页脚等）。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface OxideMessages {
  /** profile.location 缺省时的占位（数据缺省才出现）。 */
  locationFallback: string;
  /** 未配置联系邮箱时的空态文案。 */
  noChannel: string;
  periodFallback: string;
}

export const messages: Record<string, OxideMessages> = {
  'zh-CN': {
    locationFallback: '远程',
    noChannel: '尚未配置联系方式',
    periodFallback: '----',
  },
  'zh-TW': {
    locationFallback: '遠端',
    noChannel: '尚未配置聯絡方式',
    periodFallback: '----',
  },
  ja: {
    locationFallback: 'リモート',
    noChannel: '連絡先が未設定です',
    periodFallback: '----',
  },
  en: {
    locationFallback: 'REMOTE',
    noChannel: 'no channel configured',
    periodFallback: '----',
  },
  ko: {
    locationFallback: '원격',
    noChannel: '연락처가 설정되지 않음',
    periodFallback: '----',
  },
};

export type MessageLocale = keyof typeof messages;
