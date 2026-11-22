import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {
  localeMatchTags,
  matchBrowserLanguages,
  matchLocaleTag,
  normalizeLanguageTag,
} from '../src/lib/locale-match.ts';
import {
  localeStorageKeyFor,
  renderRouterScript,
  storageKeyFor,
} from '../src/lib/router-script.ts';

const locales = [
  { code: 'zh-CN', path: 'zh-cn' },
  { code: 'zh-TW', path: 'zh-tw' },
  { code: 'ja', path: 'ja' },
  { code: 'en', path: 'en' },
  { code: 'ko', path: 'ko' },
];

test('normalizeLanguageTag trims, lowercases and normalizes underscores', () => {
  assert.equal(normalizeLanguageTag('  zh_Hant_TW  '), 'zh-hant-tw');
});

test('localeMatchTags includes explicit tags plus code/path without duplicates', () => {
  assert.deepEqual(localeMatchTags({ code: 'zh-TW', path: 'zh-tw' }), [
    'zh-hant',
    'zh-tw',
    'zh-hk',
    'zh-mo',
  ]);
  assert.deepEqual(localeMatchTags({ code: 'fr', path: 'fr' }), ['fr']);
});

test('traditional Chinese tags resolve to zh-TW with longest-tag priority', () => {
  for (const tag of ['zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant-TW']) {
    assert.equal(matchLocaleTag(tag, locales), 'zh-tw', tag);
  }
});

test('simplified Chinese and bare zh resolve to zh-CN', () => {
  for (const tag of ['zh-CN', 'zh-Hans-CN', 'zh-SG', 'zh']) {
    assert.equal(matchLocaleTag(tag, locales), 'zh-cn', tag);
  }
});

test('ja/en/ko language-region tags resolve to their configured Locale', () => {
  assert.equal(matchLocaleTag('ja-JP', locales), 'ja');
  assert.equal(matchLocaleTag('en-US', locales), 'en');
  assert.equal(matchLocaleTag('ko-KR', locales), 'ko');
});

test('unsupported tags return null and ordered fallback skips them', () => {
  assert.equal(matchLocaleTag('fr-FR', locales), null);
  assert.equal(matchBrowserLanguages(['fr-FR', 'ja-JP'], locales), 'ja');
});

test('a future non-Chinese locale can match by primary language prefix', () => {
  assert.equal(matchLocaleTag('fr-CA', [{ code: 'fr', path: 'fr' }]), 'fr');
});

test('locale storage key is namespaced by base and independent of design override', () => {
  assert.equal(localeStorageKeyFor('/'), 'senrenbanka.locale.v1:root');
  assert.equal(localeStorageKeyFor('/demo/'), 'senrenbanka.locale.v1:demo');
  assert.equal(storageKeyFor('/', 'my-portfolio'), 'my-portfolio');
});

function runRouter(
  cfg,
  {
    languages = [],
    language = null,
    localeValue = null,
    localeStorageKey = null,
    designValue = null,
  } = {},
) {
  const values = new Map();
  if (localeValue !== null && localeStorageKey) values.set(localeStorageKey, localeValue);
  if (designValue !== null) values.set(cfg.storageKey, designValue);
  const removed = [];
  const navigations = [];
  const reads = [];
  const localStorage = {
    getItem(key) {
      reads.push(key);
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
      removed.push(key);
    },
  };

  vm.runInNewContext(renderRouterScript(cfg), {
    Date: { now: () => 1_700_000_000_000 },
    Math: { floor: Math.floor, random: () => 0 },
    localStorage,
    location: {
      replace(url) {
        navigations.push(url);
      },
    },
    navigator: language === null ? { languages } : { languages, language },
  });
  return { navigations, reads, removed, values };
}

const entryConfig = {
  mode: 'random',
  manualSwitch: true,
  defaultId: 'editorial',
  cacheHours: 0,
  avoidRepeat: true,
  base: '/',
  storageKey: 'senrenbanka.design.v1:root',
  localeNegotiation: {
    storageKey: 'senrenbanka.locale.v1:root',
    defaultPath: 'zh-cn',
    entries: [
      { path: 'zh-cn', code: 'zh-CN', matchTags: ['zh-hans', 'zh'], enabled: ['editorial'] },
      { path: 'zh-tw', code: 'zh-TW', matchTags: ['zh-hant', 'zh-tw'], enabled: ['editorial'] },
      { path: 'ja', code: 'ja', matchTags: ['ja'], enabled: ['editorial'] },
      { path: 'en', code: 'en', matchTags: ['en'], enabled: ['editorial'] },
    ],
  },
};

test('entry router negotiates browser language and writes a zero-window design', () => {
  const result = runRouter(entryConfig, { languages: ['en-US'] });
  assert.deepEqual(result.navigations, ['/en/editorial/']);
  assert.equal(
    result.values.get('senrenbanka.design.v1:root'),
    JSON.stringify({ designId: 'editorial', expiresAt: 0 }),
  );
});

test('entry router prefers a stored locale and clears an invalid one', () => {
  const preferred = runRouter(entryConfig, {
    languages: ['en-US'],
    localeValue: 'ja',
    localeStorageKey: 'senrenbanka.locale.v1:root',
  });
  assert.deepEqual(preferred.navigations, ['/ja/editorial/']);

  const invalid = runRouter(entryConfig, {
    languages: ['zh-Hant-HK'],
    localeValue: 'xx',
    localeStorageKey: 'senrenbanka.locale.v1:root',
  });
  assert.deepEqual(invalid.navigations, ['/zh-tw/editorial/']);
  assert.deepEqual(invalid.removed, ['senrenbanka.locale.v1:root']);
});

test('fixed Locale entry ignores locale preference', () => {
  const result = runRouter(
    {
      ...entryConfig,
      localeNegotiation: undefined,
      enabled: ['editorial'],
      localePrefix: 'ja',
    },
    {
      languages: ['en-US'],
      localeValue: 'ja',
      localeStorageKey: 'senrenbanka.locale.v1:root',
    },
  );
  assert.deepEqual(result.navigations, ['/ja/editorial/']);
  assert.deepEqual(result.removed, []);
  assert.equal(result.reads.includes('senrenbanka.locale.v1:root'), false);
});

test('entry router falls back to navigator.language when languages is missing', () => {
  const result = runRouter(entryConfig, { languages: [], language: 'ja-JP' });
  assert.deepEqual(result.navigations, ['/ja/editorial/']);
});

test('fixed mode negotiates Locale and ignores a selection outside that pool', () => {
  const config = {
    ...entryConfig,
    mode: 'fixed',
    storageKey: 'senrenbanka.design.v1:root',
  };
  const stored = JSON.stringify({ designId: 'retired', expiresAt: null });
  const result = runRouter(config, { languages: ['en-US'], designValue: stored });
  assert.deepEqual(result.navigations, ['/en/editorial/']);
  assert.equal(result.values.get(config.storageKey), stored);
});

test('fixed mode with manualSwitch disabled ignores a valid manual selection', () => {
  const config = {
    ...entryConfig,
    mode: 'fixed',
    manualSwitch: false,
    localeNegotiation: {
      ...entryConfig.localeNegotiation,
      entries: entryConfig.localeNegotiation.entries.map((entry) => ({
        ...entry,
        enabled: ['editorial', 'aero'],
      })),
    },
  };
  const stored = JSON.stringify({ designId: 'aero', expiresAt: null });
  const result = runRouter(config, { languages: ['en-US'], designValue: stored });
  assert.deepEqual(result.navigations, ['/en/editorial/']);
  assert.equal(result.values.get(config.storageKey), stored);
});
