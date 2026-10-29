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
  links: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
  tags: string;
}

export const messages: Record<'zh-CN' | 'ja' | 'en', HtmlOnlyMessages> = {
  'zh-CN': {
    navigation: '页面导航',
    contents: '目录',
    languages: '语言',
    designs: '设计',
    allDesigns: '全部设计',
    backToTop: '回到顶部',
    location: '所在地',
    links: '链接',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
    tags: '标签',
  },
  ja: {
    navigation: 'ページ内ナビゲーション',
    contents: '目次',
    languages: '言語',
    designs: 'デザイン',
    allDesigns: 'すべてのデザイン',
    backToTop: 'ページ上部へ戻る',
    location: '所在地',
    links: 'リンク',
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
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
    links: 'Links',
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    contact: 'Contact',
    tags: 'Tags',
  },
};

export type MessageLocale = keyof typeof messages;
