/**
 * html-only 主题文案：原生 HTML 文档的导航与分区标签。
 *
 * 不翻译项：无。所有显示文本均随语言切换。
 * 纯数据：不 import 任何 CSS / Astro 组件。
 */
export interface HtmlOnlyMessages {
  navigation: string;
  contents: string;
  languages: string;
  designs: string;
  allDesigns: string;
  backToTop: string;
  location: string;
  tags: string;
}

export const messages: Record<string, HtmlOnlyMessages> = {
  'zh-CN': {
    navigation: '页面导航',
    contents: '目录',
    languages: '语言',
    designs: '设计',
    allDesigns: '全部设计',
    backToTop: '回到顶部',
    location: '所在地',
    tags: '标签',
  },
  'zh-TW': {
    navigation: '頁面導航',
    contents: '目錄',
    languages: '語言',
    designs: '設計',
    allDesigns: '全部設計',
    backToTop: '回到頂部',
    location: '所在地',
    tags: '標籤',
  },
  ja: {
    navigation: 'ページ内ナビゲーション',
    contents: '目次',
    languages: '言語',
    designs: 'デザイン',
    allDesigns: 'すべてのデザイン',
    backToTop: 'ページ上部へ戻る',
    location: '所在地',
    tags: 'タグ',
  },
  en: {
    navigation: 'Page navigation',
    contents: 'Contents',
    languages: 'Languages',
    designs: 'Designs',
    allDesigns: 'All designs',
    backToTop: 'Back to top',
    location: 'Location',
    tags: 'Tags',
  },
  ko: {
    navigation: '페이지 내비게이션',
    contents: '목차',
    languages: '언어',
    designs: '디자인',
    allDesigns: '모든 디자인',
    backToTop: '맨 위로',
    location: '위치',
    tags: '태그',
  },
};

export type MessageLocale = keyof typeof messages;
