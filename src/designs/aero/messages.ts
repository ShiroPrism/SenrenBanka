/**
 * aero 主题文案（SPEC §4）。
 *
 * - 语域：2000s 个人设备的界面/欢迎语——短、友好、带一点系统提示感。
 * - 不翻译项：`AERO` 是设计标记，作为产品名保留；人名/项目名/组织名来自资料文件。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface AeroMessages {
  /** 设计标记 / 产品名。 */
  portfolio: string;
  /** 设备类型标签。 */
  device: string;
  /** 状态条在线提示。 */
  status: string;
  /** Bio 的引首标签。 */
  about: string;
  /** Links 的引首标签。 */
  links: string;
  /** Projects 的引首标签。 */
  projects: string;
  /** Experience 的引首标签。 */
  experience: string;
  /** Skills 的引首标签。 */
  skills: string;
  /** Contact 的引首标签。 */
  contact: string;
  /** 无联系方式时的说明。 */
  noContact: string;
  /** 地点缺失时的回退。 */
  local: string;
}

export const messages: Record<string, AeroMessages> = {
  'zh-CN': {
    portfolio: 'AERO',
    device: '个人设备',
    status: '系统在线',
    about: '关于本设备',
    links: '桌面',
    projects: '窗口',
    experience: '系统时间线',
    skills: '功能',
    contact: '发送消息',
    noContact: '未配置联系方式',
    local: '本地',
  },
  'zh-TW': {
    portfolio: 'AERO',
    device: '個人裝置',
    status: '系統在線',
    about: '關於本裝置',
    links: '桌面',
    projects: '視窗',
    experience: '系統時間線',
    skills: '功能',
    contact: '傳送訊息',
    noContact: '未配置聯絡方式',
    local: '本地',
  },
  ja: {
    portfolio: 'AERO',
    device: 'パーソナルデバイス',
    status: 'システムオンライン',
    about: 'このデバイスについて',
    links: 'デスクトップ',
    projects: 'ウィンドウ',
    experience: 'システム年表',
    skills: '機能',
    contact: 'メッセージを送る',
    noContact: '連絡先未設定',
    local: 'ローカル',
  },
  en: {
    portfolio: 'AERO',
    device: 'PERSONAL DEVICE',
    status: 'SYSTEM ONLINE',
    about: 'ABOUT THIS DEVICE',
    links: 'DESKTOP',
    projects: 'WINDOWS',
    experience: 'SYSTEM TIMELINE',
    skills: 'FEATURES',
    contact: 'SEND MESSAGE',
    noContact: 'NO CONTACT CONFIGURED',
    local: 'LOCAL',
  },
  ko: {
    portfolio: 'AERO',
    device: '개인 장치',
    status: '시스템 온라인',
    about: '이 장치에 대하여',
    links: '데스크톱',
    projects: '창',
    experience: '시스템 타임라인',
    skills: '기능',
    contact: '메시지 보내기',
    noContact: '연락처 미설정',
    local: '로컬',
  },
};
