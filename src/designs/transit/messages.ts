/**
 * transit 主题文案（SPEC §4）。
 *
 * - 语域：城市轨道网络的导视/站台广播——线路、站点、换乘、时刻表、售票处。
 * - 不翻译项：`TRANSIT` 是设计标记，作为网络名保留；人名/项目名/组织名来自资料文件。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface TransitMessages {
  /** 设计标记 / 网络名。 */
  portfolio: string;
  /** 网络条标签。 */
  network: string;
  /** 姓名角色：终点站。 */
  terminus: string;
  /** 分区：线路 / 换乘。 */
  lines: string;
  /** 分区：站点。 */
  stations: string;
  /** 分区：时刻表。 */
  timetable: string;
  /** 分区：线路徽章。 */
  badges: string;
  /** 分区：售票处。 */
  ticket: string;
  /** 无联系方式。 */
  noContact: string;
  /** 页脚示例声明。 */
  sampleNote: string;
  /** 地点缺失时的回退。 */
  local: string;
  /** 装饰性站台标签。 */
  platform: string;
}

export const messages: Record<string, TransitMessages> = {
  'zh-CN': {
    portfolio: 'TRANSIT',
    network: '城市路网',
    terminus: '终点站',
    lines: '线路 / 换乘',
    stations: '站点',
    timetable: '时刻表',
    badges: '线路徽章',
    ticket: '售票处',
    noContact: '未配置联系方式',
    sampleNote: '示例资料・仅作演示',
    local: '本地',
    platform: '站台',
  },
  'zh-TW': {
    portfolio: 'TRANSIT',
    network: '城市路網',
    terminus: '終點站',
    lines: '路線 / 轉乘',
    stations: '站點',
    timetable: '時刻表',
    badges: '路線徽章',
    ticket: '售票處',
    noContact: '未配置聯絡方式',
    sampleNote: '示例資料・僅作演示',
    local: '本地',
    platform: '月台',
  },
  ja: {
    portfolio: 'TRANSIT',
    network: '都市ネットワーク',
    terminus: '終点',
    lines: '路線 / 乗換',
    stations: '駅',
    timetable: '時刻表',
    badges: '路線バッジ',
    ticket: '切符売り場',
    noContact: '連絡先未設定',
    sampleNote: 'サンプル・デモ用',
    local: 'ローカル',
    platform: 'ホーム',
  },
  en: {
    portfolio: 'TRANSIT',
    network: 'CITY NETWORK',
    terminus: 'TERMINUS',
    lines: 'LINES / INTERCHANGES',
    stations: 'STATIONS',
    timetable: 'TIMETABLE',
    badges: 'LINE BADGES',
    ticket: 'TICKET OFFICE',
    noContact: 'NO CONTACT CONFIGURED',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
    local: 'LOCAL',
    platform: 'PLATFORM',
  },
  ko: {
    portfolio: 'TRANSIT',
    network: '도시 네트워크',
    terminus: '종점',
    lines: '노선 / 환승',
    stations: '역',
    timetable: '시간표',
    badges: '노선 배지',
    ticket: '매표소',
    noContact: '연락처 미설정',
    sampleNote: '샘플 자료 · 데모용',
    local: '로컬',
    platform: '승강장',
  },
};
