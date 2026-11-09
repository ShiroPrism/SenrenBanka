/**
 * terminal 主题文案（SPEC §4）。
 *
 * - 分区标准标签由 `src/i18n/sections.ts` 提供（随语言切换）；命令
 *   （`whoami`、`ls links/`）保持不翻译，命令长度受打字级联时序约束
 *   （≤18 字符），翻译会破坏动画。
 * - 本文件只承载真正承担信息传达、需要随语言切换的文案。
 * - `sessionEnd` 保持终端会话收尾的多语惯例，不翻译。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface TerminalMessages {
  basedIn: string;
  sayHello: string;
  noMail: string;
  sessionEnd: string;
}

export const messages: Record<string, TerminalMessages> = {
  'zh-CN': {
    basedIn: '常驻',
    sayHello: 'Say hello',
    noMail: 'no mail configured',
    sessionEnd: 'session ends — 谢谢访问 / EOF',
  },
  'zh-TW': {
    basedIn: '常駐',
    sayHello: 'Say hello',
    noMail: 'no mail configured',
    sessionEnd: 'session ends — 謝謝訪問 / EOF',
  },
  ja: {
    basedIn: '拠点',
    sayHello: 'Say hello',
    noMail: 'no mail configured',
    sessionEnd: 'session ends — ありがとう / EOF',
  },
  en: {
    basedIn: 'based in',
    sayHello: 'Say hello',
    noMail: 'no mail configured',
    sessionEnd: 'session ends — 谢谢访问 / EOF',
  },
  ko: {
    basedIn: '거점',
    sayHello: 'Say hello',
    noMail: 'no mail configured',
    sessionEnd: 'session ends — 감사합니다 / EOF',
  },
};

export type MessageLocale = keyof typeof messages;
