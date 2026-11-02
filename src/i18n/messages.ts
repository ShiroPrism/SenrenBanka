/**
 * 共享基础设施文案（SPEC §5.5 / §7.5 · ADR 0007）。
 *
 * - 只覆盖**项目 chrome** 与基础设施页的用户可见文案：全站共享操作菜单（含桌面浮层
 *   形态、移动端底部动作面板、悬浮球与运行时 Toast）、切换页、根入口页、404、语言选择器。
 * - 各套设计自身的文案在 `src/designs/<id>/messages.ts`，按其视觉语言单独撰写。
 * - 本模块是纯数据：**不得 import 任何 CSS、Page.astro 或 style.css**（否则会破坏
 *   每套设计只加载自身样式的隔离约定，见 SPEC §3.2）。
 */

export interface LocaleMessages {
  /** 共享操作菜单（Action menu）的组件内静态文案；桌面浮层与移动端面板共用。 */
  contextMenu: {
    currentDesignTag: string;
    menuLabel: string;
    /** 移动端悬浮球的无障碍名称。 */
    launcherLabel: string;
    /** 底部面板关闭按钮的无障碍名称。 */
    closeLabel: string;
    /** 面板底部「取消」按钮文案（iOS action sheet 的关闭位）。 */
    cancel: string;
    /** 面板内「页面操作」分组的组标题。 */
    pageGroup: string;
    /** 面板内「设计操作」分组的组标题。 */
    designGroup: string;
    reload: string;
    toTop: string;
    copyLink: string;
    print: string;
    share: string;
    random: string;
    switchDesign: string;
    /** 语言分组的组标题。 */
    languageGroup: string;
  };
  /** 菜单运行时 Toast 文案（src/lib/context-menu.ts 消费）。 */
  toast: {
    copied: string;
    copyFailed: string;
    shared: string;
    shareCancelled: string;
    shareFailed: string;
    noOtherDesign: string;
  };
  /** 主题切换页 /designs/（三语言各一份）。 */
  switcher: {
    titleSuffix: string;
    description: string;
    heading: string;
    body: string;
    currentBadge: string;
  };
  /** 根入口页与各 locale 入口页。 */
  entry: {
    redirecting: string;
    noscriptHeading: string;
    noscriptBody: string;
  };
  /** 404 页。 */
  notFound: {
    titleSuffix: string;
    body: string;
    backToEntry: string;
    allDesigns: string;
  };
  /** 语言选择器（共享组件的辅助文本与 aria）。 */
  language: {
    navLabel: string;
    label: string;
  };
  /** 旧无语言前缀路径的兼容跳转页。 */
  legacyRedirect: {
    body: string;
  };
}

/** 键名集合由 zh-CN 定义，其余语言必须结构一致（缺键在构建期报错）。 */
const zhCN: LocaleMessages = {
  contextMenu: {
    currentDesignTag: '当前设计',
    menuLabel: '快捷操作',
    launcherLabel: '打开快捷操作菜单',
    closeLabel: '关闭菜单',
    cancel: '取消',
    pageGroup: '页面',
    designGroup: '设计',
    reload: '重新加载',
    toTop: '回到页面顶部',
    copyLink: '复制当前页面链接',
    print: '打印 / 保存为 PDF',
    share: '分享页面',
    random: '随机一个设计',
    switchDesign: '全部设计',
    languageGroup: '语言',
  },
  toast: {
    copied: '已复制页面链接',
    copyFailed: '复制失败，请手动复制地址栏链接',
    shared: '已分享',
    shareCancelled: '已取消分享',
    shareFailed: '分享失败',
    noOtherDesign: '没有其他设计可选',
  },
  switcher: {
    titleSuffix: '全部设计',
    description: '一个资料，多套设计。点击任意一套即可手动切换。',
    heading: '全部设计',
    body: '同一份个人资料的 {count} 套设计。随机分配的选择会被记住一段时间，点击任意一套即可手动切换。',
    currentBadge: '当前',
  },
  entry: {
    redirecting: '正在进入你的设计…',
    noscriptHeading: '选择一个设计',
    noscriptBody: 'JavaScript 已禁用，未能自动进入随机设计。请手动选择：',
  },
  notFound: {
    titleSuffix: '页面未找到',
    body: '这个地址没有对应的页面或设计。',
    backToEntry: '回到入口',
    allDesigns: '查看全部设计',
  },
  language: {
    navLabel: '语言选择',
    label: '语言',
  },
  legacyRedirect: {
    body: '正在跳转到默认语言版本…',
  },
};

const zhTW: LocaleMessages = {
  contextMenu: {
    currentDesignTag: '目前設計',
    menuLabel: '快速操作',
    launcherLabel: '開啟快速操作選單',
    closeLabel: '關閉選單',
    cancel: '取消',
    pageGroup: '頁面',
    designGroup: '設計',
    reload: '重新載入',
    toTop: '回到頁面頂端',
    copyLink: '複製目前頁面連結',
    print: '列印 / 儲存為 PDF',
    share: '分享頁面',
    random: '隨機一個設計',
    switchDesign: '全部設計',
    languageGroup: '語言',
  },
  toast: {
    copied: '已複製頁面連結',
    copyFailed: '複製失敗，請手動複製網址列連結',
    shared: '已分享',
    shareCancelled: '已取消分享',
    shareFailed: '分享失敗',
    noOtherDesign: '沒有其他設計可選',
  },
  switcher: {
    titleSuffix: '全部設計',
    description: '一份資料，多套設計。點選任意一套即可手動切換。',
    heading: '全部設計',
    body: '同一份個人資料的 {count} 套設計。隨機分配的選擇會被記住一段時間，點選任意一套即可手動切換。',
    currentBadge: '目前',
  },
  entry: {
    redirecting: '正在進入你的設計…',
    noscriptHeading: '選擇一個設計',
    noscriptBody: 'JavaScript 已停用，未能自動進入隨機設計。請手動選擇：',
  },
  notFound: {
    titleSuffix: '找不到頁面',
    body: '這個網址沒有對應的頁面或設計。',
    backToEntry: '回到入口',
    allDesigns: '查看全部設計',
  },
  language: {
    navLabel: '語言選擇',
    label: '語言',
  },
  legacyRedirect: {
    body: '正在跳轉到預設語言版本…',
  },
};

const ja: LocaleMessages = {
  contextMenu: {
    currentDesignTag: '現在のデザイン',
    menuLabel: 'クイック操作',
    launcherLabel: 'クイック操作メニューを開く',
    closeLabel: 'メニューを閉じる',
    cancel: 'キャンセル',
    pageGroup: 'ページ',
    designGroup: 'デザイン',
    reload: '再読み込み',
    toTop: 'ページ先頭へ',
    copyLink: 'このページのリンクをコピー',
    print: '印刷 / PDF で保存',
    share: 'ページを共有',
    random: 'ランダムにデザインを選ぶ',
    switchDesign: 'すべてのデザイン',
    languageGroup: '言語',
  },
  toast: {
    copied: 'ページのリンクをコピーしました',
    copyFailed: 'コピーに失敗しました。アドレスバーから手動でコピーしてください',
    shared: '共有しました',
    shareCancelled: '共有をキャンセルしました',
    shareFailed: '共有に失敗しました',
    noOtherDesign: '他のデザインがありません',
  },
  switcher: {
    titleSuffix: 'すべてのデザイン',
    description: '1 つのプロフィールに、複数のデザイン。好きなものを選んでください。',
    heading: 'すべてのデザイン',
    body: '同じプロフィールの {count} 種類のデザインです。ランダムに選ばれた選択はしばらく記憶されます。好きなデザインをクリックして切り替えられます。',
    currentBadge: '現在',
  },
  entry: {
    redirecting: 'デザインへ移動しています…',
    noscriptHeading: 'デザインを選択',
    noscriptBody:
      'JavaScript が無効なため、ランダムに自動遷移できませんでした。以下から手動で選択してください：',
  },
  notFound: {
    titleSuffix: 'ページが見つかりません',
    body: 'このアドレスに対応するページやデザインはありません。',
    backToEntry: 'エントリに戻る',
    allDesigns: 'すべてのデザインを見る',
  },
  language: {
    navLabel: '言語を選択',
    label: '言語',
  },
  legacyRedirect: {
    body: 'デフォルト言語のページへ移動しています…',
  },
};

const ko: LocaleMessages = {
  contextMenu: {
    currentDesignTag: '현재 디자인',
    menuLabel: '빠른 작업',
    launcherLabel: '빠른 작업 메뉴 열기',
    closeLabel: '메뉴 닫기',
    cancel: '취소',
    pageGroup: '페이지',
    designGroup: '디자인',
    reload: '새로 고침',
    toTop: '페이지 맨 위로',
    copyLink: '현재 페이지 링크 복사',
    print: '인쇄 / PDF로 저장',
    share: '페이지 공유',
    random: '무작위 디자인',
    switchDesign: '모든 디자인',
    languageGroup: '언어',
  },
  toast: {
    copied: '페이지 링크를 복사했습니다',
    copyFailed: '복사하지 못했습니다. 주소창 링크를 직접 복사해 주세요',
    shared: '공유했습니다',
    shareCancelled: '공유를 취소했습니다',
    shareFailed: '공유하지 못했습니다',
    noOtherDesign: '선택할 다른 디자인이 없습니다',
  },
  switcher: {
    titleSuffix: '모든 디자인',
    description: '하나의 프로필, 여러 디자인. 원하는 디자인을 선택하세요.',
    heading: '모든 디자인',
    body: '하나의 프로필로 만든 {count}개의 디자인입니다. 무작위 선택은 잠시 기억되며, 원하는 디자인을 클릭해 직접 전환할 수 있습니다.',
    currentBadge: '현재',
  },
  entry: {
    redirecting: '디자인으로 이동하는 중…',
    noscriptHeading: '디자인 선택',
    noscriptBody: 'JavaScript가 비활성화되어 자동으로 이동하지 못했습니다. 직접 선택해 주세요:',
  },
  notFound: {
    titleSuffix: '페이지를 찾을 수 없음',
    body: '이 주소에 해당하는 페이지나 디자인이 없습니다.',
    backToEntry: '입구로 돌아가기',
    allDesigns: '모든 디자인 보기',
  },
  language: {
    navLabel: '언어 선택',
    label: '언어',
  },
  legacyRedirect: {
    body: '기본 언어 페이지로 이동하는 중…',
  },
};

const en: LocaleMessages = {
  contextMenu: {
    currentDesignTag: 'Current design',
    menuLabel: 'Quick actions',
    launcherLabel: 'Open quick actions menu',
    closeLabel: 'Close menu',
    cancel: 'Cancel',
    pageGroup: 'Page',
    designGroup: 'Design',
    reload: 'Reload',
    toTop: 'Back to top',
    copyLink: 'Copy link to this page',
    print: 'Print / Save as PDF',
    share: 'Share page',
    random: 'Random design',
    switchDesign: 'All designs',
    languageGroup: 'Language',
  },
  toast: {
    copied: 'Page link copied',
    copyFailed: 'Copy failed — copy the address bar link manually',
    shared: 'Shared',
    shareCancelled: 'Share cancelled',
    shareFailed: 'Share failed',
    noOtherDesign: 'No other design available',
  },
  switcher: {
    titleSuffix: 'All designs',
    description: 'One profile, many designs. Pick any one to switch.',
    heading: 'All designs',
    body: '{count} designs built from a single profile. A random pick is remembered for a while; click any design to switch to it.',
    currentBadge: 'Current',
  },
  entry: {
    redirecting: 'Taking you to a design…',
    noscriptHeading: 'Choose a design',
    noscriptBody: 'JavaScript is disabled, so no automatic redirect happened. Please pick one:',
  },
  notFound: {
    titleSuffix: 'Page not found',
    body: 'No page or design found at this address.',
    backToEntry: 'Back to the entry',
    allDesigns: 'All designs',
  },
  language: {
    navLabel: 'Choose language',
    label: 'Language',
  },
  legacyRedirect: {
    body: 'Redirecting to the default language…',
  },
};

/** 全部语言文案；键以语言 code 索引（与 site.config.yaml 的 i18n.locales 对应）。 */
export const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  en,
  ko,
} satisfies Record<string, LocaleMessages>;

export type MessageLocaleCode = keyof typeof messages;
