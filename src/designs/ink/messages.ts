/**
 * ink 主题文案（SPEC §4）。
 *
 * - 语域：宋式册页的题跋——分区标题取「卷帙 / 年表 / 笔触 / 落款」这类题签语，
 *   引首标签用「小引 / 印谱」，不用「项目 / 经历 / 技能」这类产品界面词。
 * - 不翻译项与理由：
 *   - 页内装饰编号 `numerals`（一/二/三/四 或 I/II/III/IV）是版面记号，不进可访问名，
 *     但仍随语言切换，避免日文页出现英文序号；
 *   - `leaf`（页次）在三种语言里都保持「第X叶」的名词形态，因为它是册页的物理页次，
 *     不是导航文案；
 *   - 专有名词（人名、项目名、组织名、`niconico` 等）来自资料文件，本文件不涉及。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface InkMessages {
  /** 页眉题签：这张册页是什么。 */
  portfolio: string;
  /** 小引（bio）引首标签。 */
  preface: string;
  /** 印谱（links）引首标签。 */
  imprint: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
  /** 页眉右端页次。 */
  leaf: string;
  /** 页脚声明：说明资料为示例。 */
  footerNote: string;
  /** 装饰用引首编号（一一对应分区顺序）。 */
  numerals: string[];
}

export const messages: Record<string, InkMessages> = {
  'zh-CN': {
    portfolio: '册页',
    preface: '小引',
    imprint: '印谱',
    projects: '卷帙',
    experience: '年表',
    skills: '笔触',
    contact: '落款',
    leaf: '第一叶',
    footerNote: '示例资料・仅作演示',
    numerals: ['一', '二', '三', '四'],
  },
  ja: {
    portfolio: '画帖',
    preface: '小引',
    imprint: '印譜',
    projects: '作品',
    experience: '年譜',
    skills: '筆致',
    contact: '落款',
    leaf: '第一葉',
    footerNote: 'サンプル・デモ用',
    numerals: ['一', '二', '三', '四'],
  },
  en: {
    portfolio: 'Album',
    preface: 'Preface',
    imprint: 'Seals',
    projects: 'Works',
    experience: 'Chronology',
    skills: 'Brushwork',
    contact: 'Colophon',
    leaf: 'Leaf I',
    footerNote: 'Sample profile — demo only',
    numerals: ['I', 'II', 'III', 'IV'],
  },
};

export type MessageLocale = keyof typeof messages;
