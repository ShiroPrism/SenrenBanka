/**
 * 404 页面数据与首屏 Locale 解析（ADR 0025）。
 *
 * 静态托管只会在未知路径返回根 `404.html`，构建期拿不到请求路径。因此本模块把
 * 所有 Locale 的 404 内容预渲染进同一份 HTML，并生成一个只读 Locale 偏好的内联
 * 解析脚本；页面本身不生成每语言 404，也不依赖托管平台的路径级路由。
 */
import type { LocaleMessages } from '../i18n/messages';
import type { ContextMenuLocaleVariant } from './context-menu';
import { localeMatchTags } from './locale-match.ts';
import type { ActionMenuConfig, LocaleEntry, SiteModel } from './site';

export interface NotFoundPanel {
  locale: LocaleEntry;
  messages: LocaleMessages;
  heading: string;
  body: string;
  backToEntry: string;
  allDesigns: string;
  allDesignsHref: string | null;
  defaultDesignHref: string;
  defaultDesignName: string;
  contextMenu: ActionMenuConfig;
}

export interface NotFoundLocaleEntry {
  code: string;
  path: string;
  matchTags: string[];
}

export interface NotFoundLocaleConfig {
  base: string;
  defaultPath: string;
  storageKey: string;
  locales: NotFoundLocaleEntry[];
  titles: Record<string, string>;
}

export interface NotFoundView {
  defaultPanel: NotFoundPanel;
  panels: NotFoundPanel[];
  panelCss: string;
  localeScript: NotFoundLocaleConfig;
  menuLocaleVariants: Record<string, ContextMenuLocaleVariant>;
}

/**
 * 构建期注入的站点 helper。`not-found.ts` 保持可在 Node 测试中直接加载：
 * 不在模块顶层静态 import `site.ts`（它依赖 Astro 内容层），只接收调用方传入的
 * 纯函数依赖。
 */
export interface NotFoundBuildHelpers {
  sharedMessagesFor: (code: string) => LocaleMessages;
  buildActionMenuConfig: (
    model: SiteModel,
    locale: LocaleEntry,
    context: { kind: 'not-found' },
    shareTitle: string,
  ) => ActionMenuConfig;
  localeHref: (localePath: string, sub?: string) => string;
  localeDesignHref: (localePath: string, designId: string) => string;
}

/** 序列化为可安全内联进 <script> 的 JSON（转义 '<' 防止提前闭合标签）。 */
function safeInlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * 构建单份 404 的全部 Locale 区块、首屏脚本配置与菜单本地化变体。
 * 所有链接都经 `localeHref` / `localeDesignHref` 生成，确保 base 与语言前缀不遗漏。
 */
export function buildNotFoundView(model: SiteModel, helpers: NotFoundBuildHelpers): NotFoundView {
  const defaultLocale =
    model.locales.find((locale) => locale.code === model.defaultLocale) ?? model.locales[0]!;

  const panels: NotFoundPanel[] = model.locales.map((locale) => {
    const messages = helpers.sharedMessagesFor(locale.code);
    const heading = `404 · ${messages.notFound.titleSuffix} · ${locale.title}`;
    return {
      locale,
      messages,
      heading,
      body: messages.notFound.body,
      backToEntry: messages.notFound.backToEntry,
      allDesigns: messages.notFound.allDesigns,
      allDesignsHref: model.switcherEnabled ? helpers.localeHref(locale.path, 'designs/') : null,
      defaultDesignHref: helpers.localeDesignHref(locale.path, model.default.id),
      defaultDesignName: model.default.meta.displayName,
      contextMenu: helpers.buildActionMenuConfig(model, locale, { kind: 'not-found' }, heading),
    };
  });

  const defaultPanel =
    panels.find((panel) => panel.locale.code === defaultLocale.code) ?? panels[0]!;

  const panelCss = [
    '[data-404-panel] { display: none; }',
    'html:not([data-404-locale]) [data-404-panel][data-default] { display: block; }',
    ...panels.map(
      (panel) =>
        `html[data-404-locale="${panel.locale.path}"] [data-404-panel="${panel.locale.path}"] { display: block; }`,
    ),
  ].join('\n');

  const titles: Record<string, string> = {};
  const menuLocaleVariants: Record<string, ContextMenuLocaleVariant> = {};
  for (const panel of panels) {
    titles[panel.locale.path] = panel.heading;
    menuLocaleVariants[panel.locale.path] = {
      switcherHref: panel.contextMenu.switcherHref,
      shareTitle: panel.contextMenu.shareTitle,
      targets: panel.contextMenu.targets,
      toast: panel.contextMenu.toast,
      launcherLabel: panel.contextMenu.launcherLabel,
      menuLabel: panel.contextMenu.menuLabel,
      closeLabel: panel.contextMenu.closeLabel,
      cancel: panel.contextMenu.cancel,
      languages: panel.contextMenu.languages,
      contextMenu: panel.messages.contextMenu,
    };
  }

  return {
    defaultPanel,
    panels,
    panelCss,
    localeScript: {
      base: model.base,
      defaultPath: defaultLocale.path,
      storageKey: model.localeStorageKey,
      locales: model.locales.map((locale) => ({
        code: locale.code,
        path: locale.path,
        matchTags: localeMatchTags(locale),
      })),
      titles,
    },
    menuLocaleVariants,
  };
}

/**
 * 生成 404 首屏 Locale 解析脚本。
 *
 * 解析顺序与现有入口契约一致：路径首段 → Locale preference → 浏览器语言 → 默认
 * Locale。404 只读偏好，绝不写入或清除；所有存储访问都在 try/catch 内，异常时
 * `data-404-locale` 不设置，默认区块保持可见。
 */
export function renderNotFoundLocaleScript(config: NotFoundLocaleConfig): string {
  return `(function () {
  var C = ${safeInlineJson(config)};
  function stripBase(pathname) {
    var rest = typeof pathname === 'string' && pathname ? pathname : '/';
    var base = C.base || '/';
    if (base !== '/') {
      var baseWithoutSlash = base.charAt(base.length - 1) === '/' ? base.slice(0, -1) : base;
      if (rest === base || rest === baseWithoutSlash) return '/';
      if (rest.indexOf(base) === 0) rest = rest.slice(base.length - 1);
    }
    return rest;
  }
  function pathSegments(pathname) {
    var rest = stripBase(pathname);
    var parts = rest.split('/');
    var result = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) result.push(parts[i]);
    }
    return result;
  }
  function localeByPath(path) {
    for (var i = 0; i < C.locales.length; i++) {
      if (C.locales[i].path === path) return C.locales[i];
    }
    return null;
  }
  function normalizeTag(value) {
    return typeof value === 'string' ? value.trim().toLowerCase().replace(/_/g, '-') : '';
  }
  function findLocaleForTag(tag) {
    var best = null;
    var bestLength = 0;
    for (var i = 0; i < C.locales.length; i++) {
      var entry = C.locales[i];
      for (var j = 0; j < entry.matchTags.length; j++) {
        var match = normalizeTag(entry.matchTags[j]);
        if (!match) continue;
        if ((tag === match || tag.indexOf(match + '-') === 0) && match.length > bestLength) {
          best = entry;
          bestLength = match.length;
        }
      }
    }
    return best;
  }
  function browserLanguageTags() {
    var tags = [];
    try {
      if (typeof navigator !== 'undefined' && navigator) {
        if (navigator.languages && navigator.languages.length) {
          for (var i = 0; i < navigator.languages.length; i++) {
            tags.push(navigator.languages[i]);
          }
        } else if (navigator.language) {
          tags.push(navigator.language);
        }
      }
    } catch (e) {}
    return tags;
  }
  function pickLocale() {
    var segments = pathSegments(location.pathname);
    if (segments.length) {
      var pathLocale = localeByPath(segments[0]);
      if (pathLocale) return pathLocale;
    }
    var stored = null;
    try {
      stored = localStorage.getItem(C.storageKey);
    } catch (e) {}
    if (stored !== null && stored !== undefined) {
      var storedPath = String(stored);
      while (storedPath.charAt(0) === '/') storedPath = storedPath.slice(1);
      while (storedPath.charAt(storedPath.length - 1) === '/') {
        storedPath = storedPath.slice(0, -1);
      }
      var preferred = localeByPath(storedPath);
      if (preferred) return preferred;
    }
    var tags = browserLanguageTags();
    for (var i = 0; i < tags.length; i++) {
      var matched = findLocaleForTag(normalizeTag(tags[i]));
      if (matched) return matched;
    }
    return localeByPath(C.defaultPath) || C.locales[0] || null;
  }
  try {
    var selected = pickLocale();
    if (!selected) return;
    var root = document.documentElement;
    root.setAttribute('lang', selected.code);
    root.setAttribute('data-404-locale', selected.path);
    if (C.titles && C.titles[selected.path]) document.title = C.titles[selected.path];
  } catch (e) {}
})();`;
}
