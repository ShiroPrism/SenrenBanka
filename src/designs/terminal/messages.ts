/**
 * terminal 主题文案（SPEC §4）。
 *
 * - 分区标题（`Links / 链接` 等）、命令（`whoami`、`ls links/`）与行尾注释
 *   （`# 简介`）是该设计**刻意的双语终端会话语言**，按项目决定不随语言切换；
 *   命令长度还受打字级联的时序约束（≤18 字符），翻译会破坏动画。
 * - 本文件只承载真正承担信息传达、需要随语言切换的文案。
 * - `sessionEnd` 保持终端会话收尾的三语惯例，不翻译。
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
