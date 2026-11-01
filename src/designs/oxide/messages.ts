/**
 * oxide 主题文案（SPEC §4）。
 *
 * - 顶部的 `IDENTITY / 身份` 一类标签是该设计**刻意的双语标识**（终端频道语言），
 *   按项目决定不随语言切换：它们与等宽大写排版同属设计语言的一部分。
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
