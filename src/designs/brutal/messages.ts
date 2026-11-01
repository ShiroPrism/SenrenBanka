/**
 * brutal 主题文案（SPEC §4）。
 *
 * - 语域：告示 / 标签 / 台账，短词、命令式、全大写（拉丁）。
 * - 不翻译项：`BT` 是设计标记（由 CSS 伪元素 / 装饰元素承担，不进本文件）；
 *   `SENRENBANKA` 若出现在页脚则作为品牌名保留，不翻译。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface BrutalMessages {
  portfolio: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
  notice: string;
  index: string;
  noContact: string;
  sampleNote: string;
}

export const messages: Record<string, BrutalMessages> = {
  'zh-CN': {
    portfolio: '作品集',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
    notice: '告示',
    index: '索引',
    noContact: '未配置联系方式',
    sampleNote: '示例资料・仅作演示',
  },
  ja: {
    portfolio: 'ポートフォリオ',
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
    notice: '告知',
    index: '索引',
    noContact: '連絡先未設定',
    sampleNote: 'サンプル・デモ用',
  },
  en: {
    portfolio: 'PORTFOLIO',
    projects: 'PROJECTS',
    experience: 'EXPERIENCE',
    skills: 'SKILLS',
    contact: 'CONTACT',
    notice: 'NOTICE',
    index: 'INDEX',
    noContact: 'NO CONTACT CONFIGURED',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
  },
  ko: {
    portfolio: '포트폴리오',
    projects: '프로젝트',
    experience: '경력',
    skills: '기술',
    contact: '연락처',
    notice: '공지',
    index: '색인',
    noContact: '연락처 미설정',
    sampleNote: '샘플 자료 · 데모용',
  },
};

export type MessageLocale = keyof typeof messages;
