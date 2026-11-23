import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { renderNotFoundLocaleScript } from '../src/lib/not-found.ts';

const localeConfig = {
  base: '/',
  defaultPath: 'zh-cn',
  storageKey: 'locale-root',
  locales: [
    { code: 'zh-CN', path: 'zh-cn', matchTags: ['zh-hans', 'zh-cn', 'zh-sg', 'zh'] },
    { code: 'zh-TW', path: 'zh-tw', matchTags: ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'] },
    { code: 'ja', path: 'ja', matchTags: ['ja'] },
    { code: 'en', path: 'en', matchTags: ['en'] },
  ],
  titles: {
    'zh-cn': '404 · 页面未找到 · 示例站点',
    'zh-tw': '404 · 找不到頁面 · 範例站點',
    ja: '404 · ページが見つかりません · サンプル',
    en: '404 · Page not found · Sample site',
  },
};

function runNotFoundScript(
  config,
  { pathname = '/', stored = null, languages = [], language = null, throwingStorage = false } = {},
) {
  const attributes = new Map();
  const removed = [];
  const writes = [];
  const values = new Map();
  if (stored !== null) values.set(config.storageKey, stored);

  const localStorage = {
    getItem(key) {
      if (throwingStorage) throw new Error('storage unavailable');
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      writes.push([key, value]);
    },
    removeItem(key) {
      removed.push(key);
    },
  };
  const document = {
    title: 'default title',
    documentElement: {
      setAttribute(name, value) {
        attributes.set(name, String(value));
      },
      getAttribute(name) {
        return attributes.get(name) ?? null;
      },
    },
  };

  vm.runInNewContext(renderNotFoundLocaleScript(config), {
    location: { pathname },
    navigator: language === null ? { languages } : { languages, language },
    localStorage,
    document,
  });

  return {
    attributes,
    title: document.title,
    removed,
    writes,
  };
}

test('404 path Locale wins over stored preference and browser language', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/en/missing/',
    stored: 'ja',
    languages: ['zh-Hant-HK'],
  });
  assert.equal(result.attributes.get('lang'), 'en');
  assert.equal(result.attributes.get('data-404-locale'), 'en');
  assert.equal(result.title, localeConfig.titles.en);
});

test('404 stored preference wins over browser language when path has no Locale', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    stored: 'ja',
    languages: ['en-US'],
  });
  assert.equal(result.attributes.get('lang'), 'ja');
  assert.equal(result.attributes.get('data-404-locale'), 'ja');
  assert.equal(result.title, localeConfig.titles.ja);
});

test('404 browser matching uses the longest configured tag', () => {
  const traditional = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    languages: ['zh-Hant-HK'],
  });
  assert.equal(traditional.attributes.get('data-404-locale'), 'zh-tw');

  const english = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    languages: ['en-US'],
  });
  assert.equal(english.attributes.get('data-404-locale'), 'en');
});

test('404 browser fallback uses navigator.language when languages is missing', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    languages: [],
    language: 'ja-JP',
  });
  assert.equal(result.attributes.get('data-404-locale'), 'ja');
});

test('404 ignores an invalid stored preference without removing it', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    stored: 'xx',
    languages: ['en-US'],
  });
  assert.equal(result.attributes.get('data-404-locale'), 'en');
  assert.deepEqual(result.removed, []);
});

test('404 treats an unknown first path segment as no path Locale', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/fr/missing/',
    languages: ['ja-JP'],
  });
  assert.equal(result.attributes.get('data-404-locale'), 'ja');
});

test('404 strips the deployment base before matching the path Locale', () => {
  const demoConfig = {
    ...localeConfig,
    base: '/demo/',
  };
  const result = runNotFoundScript(demoConfig, {
    pathname: '/demo/en/missing/',
    languages: ['ja-JP'],
  });
  assert.equal(result.attributes.get('lang'), 'en');
  assert.equal(result.attributes.get('data-404-locale'), 'en');
});

test('404 falls back to the default Locale when nothing matches', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
  });
  assert.equal(result.attributes.get('lang'), 'zh-CN');
  assert.equal(result.attributes.get('data-404-locale'), 'zh-cn');
  assert.equal(result.title, localeConfig.titles['zh-cn']);
});

test('404 does not write or remove the Locale preference', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    stored: 'ja',
    languages: ['en-US'],
  });
  assert.deepEqual(result.writes, []);
  assert.deepEqual(result.removed, []);
});

test('404 still renders the default Locale when storage throws', () => {
  const result = runNotFoundScript(localeConfig, {
    pathname: '/missing/',
    throwingStorage: true,
  });
  assert.equal(result.attributes.get('data-404-locale'), 'zh-cn');
});
