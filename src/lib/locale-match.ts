/**
 * 根入口的语言匹配纯函数（ADR 0024）。
 *
 * 不依赖 Astro、站点模型或 CSS，便于 Node 测试直接加载。
 * 显式标签表只覆盖当前需要特殊处理的 Locale；其他语言仍可用 code / path
 * 与主语言前缀匹配，不在此处重复维护完整语言清单。
 */
export interface LocaleTagSource {
  code: string;
  path: string;
}

const EXPLICIT_MATCH_TAGS: Record<string, readonly string[]> = {
  'zh-cn': ['zh-hans', 'zh-cn', 'zh-sg', 'zh'],
  'zh-tw': ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'],
  ja: ['ja'],
  en: ['en'],
  ko: ['ko'],
};

/** 统一浏览器与配置中的语言标签：去空白、转小写、下划线改为连字符。 */
export function normalizeLanguageTag(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-');
}

/** 某个 Locale 参与匹配的标签：显式标签 + code + path，去重并保持顺序。 */
export function localeMatchTags(locale: LocaleTagSource): string[] {
  const explicit = EXPLICIT_MATCH_TAGS[normalizeLanguageTag(locale.path)] ?? [];
  return [
    ...new Set(
      [...explicit, locale.code, locale.path]
        .map((tag) => normalizeLanguageTag(tag))
        .filter(Boolean),
    ),
  ];
}

/**
 * 按最长标签优先匹配单个浏览器语言标签。
 * 例如 `zh-TW` 同时命中 `zh` 与 `zh-tw` 时返回 `zh-TW` Locale。
 */
export function matchLocaleTag(tag: string, locales: readonly LocaleTagSource[]): string | null {
  const normalizedTag = normalizeLanguageTag(tag);
  if (!normalizedTag) return null;

  let bestPath: string | null = null;
  let bestLength = 0;
  for (const locale of locales) {
    for (const rawMatch of localeMatchTags(locale)) {
      const match = normalizeLanguageTag(rawMatch);
      if (!match) continue;
      if (
        (normalizedTag === match || normalizedTag.startsWith(`${match}-`)) &&
        match.length > bestLength
      ) {
        bestPath = locale.path;
        bestLength = match.length;
      }
    }
  }
  return bestPath;
}

/** 按浏览器偏好顺序逐项匹配；全部失败时返回 null。 */
export function matchBrowserLanguages(
  tags: readonly string[],
  locales: readonly LocaleTagSource[],
): string | null {
  for (const tag of tags) {
    const matched = matchLocaleTag(tag, locales);
    if (matched) return matched;
  }
  return null;
}
