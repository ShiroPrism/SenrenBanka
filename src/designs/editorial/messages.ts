/**
 * editorial 主题文案（SPEC §4）。
 *
 * - 遵循杂志编排的视觉语言：期号、栏目名、克制的编辑腔调。
 * - `tagline` 是该设计**刻意保留的双语装饰**（杂志封面式中英并置），按项目决定不随语言切换。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface EditorialMessages {
  issueMark: string;
  personalEdition: string;
  navLabel: string;
  tocWorks: string;
  tocLinks: string;
  worksHeading: string;
  worksLabel: string;
  elsewhereHeading: string;
  elsewhereLabel: string;
  colophon: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', EditorialMessages> = {
  'zh-CN': {
    issueMark: '第 01 期',
    personalEdition: '个人特刊',
    navLabel: '本期导航',
    tocWorks: '精选作品',
    tocLinks: '外部链接',
    worksHeading: 'Selected Works',
    worksLabel: '精选作品',
    elsewhereHeading: 'Elsewhere',
    elsewhereLabel: '外部链接',
    colophon: 'Designed in the shape of a magazine',
  },
  ja: {
    issueMark: '第 01 号',
    personalEdition: '個人特集',
    navLabel: '今号のナビゲーション',
    tocWorks: '主な作品',
    tocLinks: '外部リンク',
    worksHeading: 'Selected Works',
    worksLabel: '主な作品',
    elsewhereHeading: 'Elsewhere',
    elsewhereLabel: '外部リンク',
    colophon: 'Designed in the shape of a magazine',
  },
  en: {
    issueMark: 'Issue 01',
    personalEdition: 'Personal Edition',
    navLabel: 'Issue navigation',
    tocWorks: 'Selected Works',
    tocLinks: 'External links',
    worksHeading: 'Selected Works',
    worksLabel: 'Selected Works',
    elsewhereHeading: 'Elsewhere',
    elsewhereLabel: 'External links',
    colophon: 'Designed in the shape of a magazine',
  },
};

export type MessageLocale = keyof typeof messages;
