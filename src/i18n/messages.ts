/**
 * 共享基础设施文案（SPEC §5.5 / §7.5）。
 *
 * - 只覆盖**项目 chrome** 与基础设施页的用户可见文案：右键快捷操作菜单（含运行时
 *   Toast）、切换页、根入口页、404、语言选择器。
 * - 各套设计自身的文案在 `src/designs/<id>/messages.ts`，按其视觉语言单独撰写。
 * - 本模块是纯数据：**不得 import 任何 CSS、Page.astro 或 style.css**（否则会破坏
 *   每套设计只加载自身样式的隔离约定，见 SPEC §3.2）。
 */

export interface LocaleMessages {
  /** 右键快捷操作菜单（组件内静态文案）。 */
  contextMenu: {
    currentDesignTag: string;
    menuLabel: string;
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
  /** 右键菜单运行时 Toast 文案（src/lib/context-menu.ts 消费）。 */
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
    reload: '重新加载',
    toTop: '回到页面顶部',
    copyLink: '复制当前页面链接',
    print: '打印 / 保存为 PDF',
    share: '分享页面',
    random: '随机一个设计',
    switchDesign: '切换设计…',
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
    titleSuffix: '切换设计',
    description: '一个资料，多套设计。点击任意一套即可手动切换。',
    heading: '切换设计',
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

const ja: LocaleMessages = {
  contextMenu: {
    currentDesignTag: '現在のデザイン',
    menuLabel: 'クイック操作',
    reload: '再読み込み',
    toTop: 'ページ先頭へ',
    copyLink: 'このページのリンクをコピー',
    print: '印刷 / PDF で保存',
    share: 'ページを共有',
    random: 'ランダムにデザインを選ぶ',
    switchDesign: 'デザインを変更…',
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
    titleSuffix: 'デザインを変更',
    description: '1 つのプロフィールに、複数のデザイン。好きなものを選んでください。',
    heading: 'デザインを変更',
    body: '同じプロフィールの {count} 種類のデザインです。ランダムに選ばれた選択はしばらく記憶されます。好きなデザインをクリックして切り替えられます。',
    currentBadge: '現在',
  },
  entry: {
    redirecting: 'デザインへ移動しています…',
    noscriptHeading: 'デザインを選択',
    noscriptBody: 'JavaScript が無効なため、ランダムに自動遷移できませんでした。以下から手動で選択してください：',
  },
  notFound: {
    titleSuffix: 'ページが見つかりません',
    body: 'このアドレスに対応するページや 디자인はありません。',
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

const en: LocaleMessages = {
  contextMenu: {
    currentDesignTag: 'Current design',
    menuLabel: 'Quick actions',
    reload: 'Reload',
    toTop: 'Back to top',
    copyLink: 'Copy link to this page',
    print: 'Print / Save as PDF',
    share: 'Share page',
    random: 'Random design',
    switchDesign: 'Switch design…',
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
    titleSuffix: 'Switch design',
    description: 'One profile, many designs. Pick any one to switch.',
    heading: 'Switch design',
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
  ja,
  en,
} satisfies Record<string, LocaleMessages>;

export type MessageLocaleCode = keyof typeof messages;