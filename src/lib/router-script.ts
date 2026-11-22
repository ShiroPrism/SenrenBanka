export interface LocaleRouterEntry {
  path: string;
  code: string;
  matchTags: string[];
  enabled: string[];
}

export interface LocaleNegotiationConfig {
  storageKey: string;
  defaultPath: string;
  entries: LocaleRouterEntry[];
}

export interface RouterRuntimeConfig {
  mode: 'random' | 'fixed';
  manualSwitch: boolean;
  defaultId: string;
  /** 固定 Locale 入口的设计池；根入口改用 localeNegotiation。 */
  enabled?: string[];
  cacheHours: number;
  avoidRepeat: boolean;
  base: string;
  storageKey: string;
  /** 固定 Locale 入口使用；根入口改用 localeNegotiation。 */
  localePrefix?: string;
  /** 仅根入口提供。 */
  localeNegotiation?: LocaleNegotiationConfig;
}

export interface SwitcherRuntimeConfig {
  mode: 'random' | 'fixed';
  cacheHours: number;
  storageKey: string;
}

function baseKeyFor(base: string): string {
  const normalized = base.replace(/^\/+|\/+$/g, '');
  return normalized === '' ? 'root' : normalized;
}

/** 存储键：默认按 base 路径命名空间化，避免同域（如 GitHub Pages 同账号多项目）互相覆盖。 */
export function storageKeyFor(base: string, override?: string | null): string {
  if (override) return override;
  return `senrenbanka.design.v1:${baseKeyFor(base)}`;
}

/**
 * 语言偏好键：始终按 base 派生，不读取 `site.storageKey` 覆盖值。
 * 设计偏好与语言偏好是两份独立数据，不能让自定义设计键碰撞语言选择。
 */
export function localeStorageKeyFor(base: string): string {
  return `senrenbanka.locale.v1:${baseKeyFor(base)}`;
}

/** 序列化为可安全内联进 <script> 的 JSON（转义 '<' 防止提前闭合标签）。 */
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * 入口路由脚本（SPEC §7.2 / ADR 0024）：
 * - 根入口先协商 Locale（手动偏好 → navigator.languages → 默认 Locale），
 *   再从该 Locale 的启用池选择设计；
 * - 固定 Locale 入口（`/<locale>/`）不读语言偏好，只用自己的设计池；
 * - fixed：有合法手选 → 手选；否则 default（根路径不写存储）
 * - random：存储未过期 → 用存储；否则重随机（avoidRepeat 时排除上次）并写入新窗口
 *
 * 主题偏好跨语言共享：storageKey 不含 locale，因此切换语言不会重置随机窗口，
 * 也不会为每种语言形成互相覆盖的独立选择（SPEC §7.5）。
 */
export function renderRouterScript(cfg: RouterRuntimeConfig): string {
  return `(function () {
  var C = ${safeJson(cfg)};
  var now = Date.now();
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(C.storageKey) || 'null'); } catch (e) { stored = null; }
  if (stored && (typeof stored.designId !== 'string' || !(stored.expiresAt === null || typeof stored.expiresAt === 'number'))) {
    stored = null;
  }
  function normalizeTag(value) {
    return typeof value === 'string' ? value.trim().toLowerCase().replace(/_/g, '-') : '';
  }
  function localeByPath(path) {
    if (!C.localeNegotiation) return null;
    for (var i = 0; i < C.localeNegotiation.entries.length; i++) {
      if (C.localeNegotiation.entries[i].path === path) return C.localeNegotiation.entries[i];
    }
    return null;
  }
  function findLocaleForTag(tag) {
    if (!C.localeNegotiation) return null;
    var best = null;
    var bestLength = 0;
    for (var i = 0; i < C.localeNegotiation.entries.length; i++) {
      var entry = C.localeNegotiation.entries[i];
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
      if (navigator && navigator.languages && navigator.languages.length) {
        for (var i = 0; i < navigator.languages.length; i++) tags.push(navigator.languages[i]);
      } else if (navigator && navigator.language) {
        tags.push(navigator.language);
      }
    } catch (e) {}
    return tags;
  }
  function hasPool(entry) {
    return !!(entry && entry.enabled && entry.enabled.length);
  }
  function pickLocale() {
    if (!C.localeNegotiation) return null;
    var storedLocale = null;
    try { storedLocale = localStorage.getItem(C.localeNegotiation.storageKey); } catch (e) {}
    if (storedLocale !== null) {
      var storedPath = String(storedLocale).replace(/^\\/+|\\/+$/g, '');
      var preferred = localeByPath(storedPath);
      if (preferred) return preferred;
      try { localStorage.removeItem(C.localeNegotiation.storageKey); } catch (e) {}
    }
    var tags = browserLanguageTags();
    for (var i = 0; i < tags.length; i++) {
      var matched = findLocaleForTag(normalizeTag(tags[i]));
      if (matched) return matched;
    }
    return localeByPath(C.localeNegotiation.defaultPath) || C.localeNegotiation.entries[0] || null;
  }
  var prefix = '';
  var enabled = C.enabled || [];
  if (C.localeNegotiation) {
    var locale = pickLocale();
    if (!hasPool(locale)) {
      var defaultLocale = localeByPath(C.localeNegotiation.defaultPath);
      if (hasPool(defaultLocale)) {
        locale = defaultLocale;
      } else {
        for (var i = 0; i < C.localeNegotiation.entries.length; i++) {
          if (hasPool(C.localeNegotiation.entries[i])) {
            locale = C.localeNegotiation.entries[i];
            break;
          }
        }
      }
    }
    if (hasPool(locale)) {
      enabled = locale.enabled.slice();
      prefix = locale.path + '/';
    }
  } else if (C.localePrefix) {
    prefix = C.localePrefix + '/';
  }
  var valid = !!(stored && enabled.indexOf(stored.designId) !== -1);
  var target;
  if (C.mode === 'fixed') {
    // 固定模式：manualSwitch 关闭时不读存储，永远 default（SPEC §7.2）
    target = C.manualSwitch && valid ? stored.designId : C.defaultId;
  } else if (valid && stored.expiresAt > now) {
    target = stored.designId;
  } else {
    var pool = enabled.slice();
    if (C.avoidRepeat && stored && pool.length > 1) {
      var filtered = pool.filter(function (d) { return d !== stored.designId; });
      if (filtered.length) pool = filtered;
    }
    target = pool[Math.floor(Math.random() * pool.length)];
    var expiresAt = C.cacheHours > 0 ? now + C.cacheHours * 3600000 : 0;
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({ designId: target, expiresAt: expiresAt }));
    } catch (e) {}
  }
  location.replace(C.base + prefix + target + '/');
})();`;
}

/**
 * 切换页：点击写入手选（random → 重开窗口；fixed → 永久记住），无 JS 时仅导航、不持久化。
 * 「当前」标记是切换页模板里的真实元素（而非 CSS content 生成），本脚本负责按存储显隐，
 * 这样它才能随语言本地化（SPEC §4/§7.5）。
 */
export function renderSwitcherScript(cfg: SwitcherRuntimeConfig): string {
  return `(function () {
  var C = ${safeJson(cfg)};
  function mark(id) {
    var cur = document.querySelector('[data-design="' + id + '"]');
    if (!cur) return;
    cur.setAttribute('data-current', 'true');
    var badge = cur.querySelector('[data-lang-badge]');
    if (badge) badge.removeAttribute('hidden');
  }
  try {
    var stored = JSON.parse(localStorage.getItem(C.storageKey) || 'null');
    if (stored && stored.designId) mark(stored.designId);
  } catch (e) {}
  document.addEventListener('click', function (e) {
    var el = e.target;
    var link = el && el.closest ? el.closest('a[data-design]') : null;
    if (!link) return;
    var id = link.getAttribute('data-design');
    var expiresAt = C.mode === 'random' ? (C.cacheHours > 0 ? Date.now() + C.cacheHours * 3600000 : 0) : null;
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({ designId: id, expiresAt: expiresAt }));
    } catch (err) {}
  });
})();`;
}
