/**
 * govuk 主题文案（SPEC §4）。
 * GOV.UK Design System 的语气：直白、指示性、二元（不解释、不推销）。
 * `licenceNotice` 是 OGL v3.0 的**法律署名文本**：按项目决定不翻译，
 * 译文可能损害署名效力；保持英文原文（见 docs/designs/govuk/ADAPTATION.md）。
 * 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface GovukMessages {
  skipLink: string;
  projects: string;
  experience: string;
  skills: string;
  contact: string;
  licenceNotice: string;
}

export const messages: Record<string, GovukMessages> = {
  'zh-CN': {
    skipLink: '跳到主要内容',
    projects: '项目',
    experience: '经历',
    skills: '技能',
    contact: '联系',
    licenceNotice:
      'Contains public sector information licensed under the Open Government Licence v3.0.',
  },
  ja: {
    skipLink: 'メインコンテンツへスキップ',
    projects: 'プロジェクト',
    experience: '経歴',
    skills: 'スキル',
    contact: '連絡先',
    licenceNotice:
      'Contains public sector information licensed under the Open Government Licence v3.0.',
  },
  en: {
    skipLink: 'Skip to main content',
    projects: 'Projects',
    experience: 'Experience',
    skills: 'Skills',
    contact: 'Contact',
    licenceNotice:
      'Contains public sector information licensed under the Open Government Licence v3.0.',
  },
  ko: {
    skipLink: '주요 콘텐츠로 건너뛰기',
    projects: '프로젝트',
    experience: '경력',
    skills: '기술',
    contact: '연락처',
    licenceNotice:
      'Contains public sector information licensed under the Open Government Licence v3.0.',
  },
};

export type MessageLocale = keyof typeof messages;
