/**
 * zine 主题文案（SPEC §4）。
 *
 * - 语域：地下小杂志的刊头、宣言、分类广告、跨页、贡献者注记、邮购回执。
 * - 不翻译项：`ZINE` 是设计标记，作为刊名保留；人名/项目名/组织名来自资料文件。
 * - 纯数据：不 import 任何 CSS / Page.astro / style.css。
 */
export interface ZineMessages {
  /** 设计标记 / 刊名。 */
  portfolio: string;
  /** 期号。 */
  issue: string;
  /** Bio 的引首标签。 */
  manifesto: string;
  /** Links 的引首标签。 */
  classifieds: string;
  /** Projects 的引首标签。 */
  spreads: string;
  /** Experience 的引首标签。 */
  notes: string;
  /** Skills 的引首标签。 */
  stamps: string;
  /** Contact 的引首标签。 */
  coupon: string;
  /** 裁切提示。 */
  cutHere: string;
  /** 无联系方式。 */
  noContact: string;
  /** 页脚示例声明。 */
  sampleNote: string;
  /** 地点缺失时的回退。 */
  local: string;
}

export const messages: Record<string, ZineMessages> = {
  'zh-CN': {
    portfolio: 'ZINE',
    issue: '第 01 期',
    manifesto: '宣言',
    classifieds: '分类广告',
    spreads: '跨页',
    notes: '贡献者注记',
    stamps: '印章',
    coupon: '邮购回执',
    cutHere: '沿此裁切',
    noContact: '未配置联系方式',
    sampleNote: '示例资料・仅作演示',
    local: '本地',
  },
  'zh-TW': {
    portfolio: 'ZINE',
    issue: '第 01 期',
    manifesto: '宣言',
    classifieds: '分類廣告',
    spreads: '跨頁',
    notes: '貢獻者註記',
    stamps: '印章',
    coupon: '郵購回執',
    cutHere: '沿此裁切',
    noContact: '未配置聯絡方式',
    sampleNote: '示例資料・僅作演示',
    local: '本地',
  },
  ja: {
    portfolio: 'ZINE',
    issue: '第 01 号',
    manifesto: 'マニフェスト',
    classifieds: 'クラシファイド',
    spreads: '見開き',
    notes: '寄稿者ノート',
    stamps: 'スタンプ',
    coupon: '郵便振替',
    cutHere: 'ここで切る',
    noContact: '連絡先未設定',
    sampleNote: 'サンプル・デモ用',
    local: 'ローカル',
  },
  en: {
    portfolio: 'ZINE',
    issue: 'ISSUE 01',
    manifesto: 'MANIFESTO',
    classifieds: 'CLASSIFIEDS',
    spreads: 'SPREADS',
    notes: 'CONTRIBUTOR NOTES',
    stamps: 'STAMPS',
    coupon: 'MAIL-IN COUPON',
    cutHere: 'CUT HERE',
    noContact: 'NO CONTACT CONFIGURED',
    sampleNote: 'SAMPLE PROFILE — DEMO ONLY',
    local: 'LOCAL',
  },
  ko: {
    portfolio: 'ZINE',
    issue: '제 01 호',
    manifesto: '선언',
    classifieds: '분류 광고',
    spreads: '펼침면',
    notes: '기고자 노트',
    stamps: '스탬프',
    coupon: '우편 주문 쿠폰',
    cutHere: '여기서 자르기',
    noContact: '연락처 미설정',
    sampleNote: '샘플 자료 · 데모용',
    local: '로컬',
  },
};
