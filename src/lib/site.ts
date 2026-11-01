import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { allDesigns, enabledDesigns, type DesignEntry } from '../designs/registry';
import { designDescriptions } from '../designs/descriptions';
import { storageKeyFor } from './router-script';
import { BASE, pathSegments, withBase } from './urls';
import type { ContextMenuRuntimeConfig, PageContext } from './context-menu';
import { messages as sharedMessages, type LocaleMessages, type MessageLocaleCode } from '../i18n/messages';
import { sharedMessagesFor } from '../i18n/resolve';

// 设计文案是纯数据，不含 CSS/Page 边；构建期在这里做「覆盖 locale 必须有文案」的全量校验。
const designMessageModules = import.meta.glob('../designs/*/messages.ts', { eager: true }) as Record<
  string,
  { messages?: Record<string, unknown> }
>;

export type ProfileData = CollectionEntry<'profile'>['data'];
export type SiteConfigData = CollectionEntry<'site'>['data'];
export type LocaleCode = MessageLocaleCode;

/** avatar 解析结果：本地图片（ImageMetadata）或外部 URL（string）或 null。 */
export type ResolvedProfile = Omit<ProfileData, 'avatar'> & {
  avatar: ImageMetadata | string | null;
};

/** 语言配置（来自 site.config.yaml 的 i18n.locales，构建期已校验唯一性）。 */
export interface LocaleEntry {
  /** BCP 47 语言代码：HTML lang、翻译字典键。 */
  code: string;
  /** URL 语言前缀（同时是 src/data/profiles/<path>.yaml 的文件名）。 */
  path: string;
  /** 语言自称，用于语言选择器。 */
  label: string;
  /** 该语言的站点 SEO 元数据。 */
  title: string;
  description: string;
  /** 显式文字系统档位（latin / vietnamese / cjk / korean / traditional-chinese）；不从语言代码推断。 */
  fontProfile?: 'latin' | 'vietnamese' | 'cjk' | 'korean' | 'traditional-chinese';
}

/**
 * 全站共享操作菜单的构建期配置（ADR 0007；运行时见 src/lib/context-menu.ts）。
 *
 * 菜单本体恒渲染（页面操作与语言切换在任何配置下都可达）；`designActionsEnabled`
 * 只控制主题切换项组（随机 / 切换设计…），`manualSwitch: false` 时它为 false。
 */
export interface ActionMenuConfig extends ContextMenuRuntimeConfig {
  /** 当前语言的共享文案：组件静态标签（组件本身不判断语言）。 */
  messages: LocaleMessages;
  /** 语言切换项：目标由 `context.kind` 决定——design 页保持同一主题，切换页保持同一切换页，404 指向语言入口。 */
  languages: LanguageSwitcherData['items'];
  /**
   * 是否渲染主题切换项（随机 / 切换设计…）。
   * `manualSwitch: false` 时为 false——但**语言项仍渲染**（SPEC §7.5）。
   */
  designActionsEnabled: boolean;
}

/** 语言切换器所需的最小数据（共享组件只负责结构，不引入任何主题 CSS）。 */
export interface LanguageSwitcherData {
  /** 当前语言 code（用于 aria-current 与 hreflang）。 */
  current: string;
  /** 各语言的展示名与目标 URL（目标 = 同设计的该语言版本）。 */
  items: Array<{
    code: string;
    label: string;
    href: string;
    isCurrent: boolean;
  }>;
  navLabel: string;
  /** 可见标签文本；传 null 表示该设计选择纯图标式呈现。 */
  label: string;
}

/** 传给每套设计页面的统一数据接口（SPEC §6.4）。 */
export interface DesignView {
  profile: ResolvedProfile;
  locale: LocaleEntry;
  locales: LocaleEntry[];
  messages: LocaleMessages;
  site: {
    manualSwitch: boolean;
  };
  design: {
    id: string;
    displayName: string;
    description: string;
    isDefault: boolean;
    /** 该设计声明的 locale code；未覆盖的 locale 不生成页面。 */
    locales: string[];
    /** 目标 locale 未覆盖当前设计时的回退设计。 */
    defaultDesignId: string;
  };
  /** 由框架统一计算的 head 元信息（设计必须原样传给 HeadMeta）。 */
  head: {
    title: string;
    description: string;
    canonical: string;
    robots: string;
    lang: string;
    /** hreflang 关联：各语言默认主题页面 + x-default（仅默认设计非空）。 */
    alternates: Array<{ hreflang: string; href: string }>;
  };
  /** 全站共享操作菜单（Action menu）的配置。design 页 = kind 'design'（ADR 0007）。 */
  contextMenu: ActionMenuConfig;
}

export interface SiteModel {
  site: SiteConfigData['site'] & { url: string | null };
  defaultLocale: string;
  locales: LocaleEntry[];
  /** locale path → 资料条目（构建期校验一一对应）。 */
  profiles: Map<string, ResolvedProfile>;
  mode: 'random' | 'fixed';
  random: { cacheHours: number; avoidRepeat: boolean };
  base: string;
  storageKey: string;
  designs: readonly DesignEntry[];
  enabled: readonly DesignEntry[];
  default: DesignEntry;
  switcherEnabled: boolean;
}

const assetModules = import.meta.glob('../data/assets/*', { eager: true }) as Record<
  string,
  { default: ImageMetadata }
>;

function resolveAvatar(avatar: string | undefined, localePath: string): ImageMetadata | string | null {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const key = `../data/assets/${avatar.replace(/^assets\//, '')}`;
  const asset = assetModules[key];
  if (!asset) {
    const available =
      Object.keys(assetModules)
        .map((k) => k.replace('../data/assets/', ''))
        .join(', ') || '（目录为空）';
    throw new Error(
      `[senrenbanka] profiles/${localePath}.yaml 的 avatar "${avatar}" 未找到。请把文件放入 src/data/assets/，可选：${available}`,
    );
  }
  return asset.default;
}

/** 构建期交叉校验 + 合并，产出页面共用的 SiteModel（SPEC §5.1 / §6.4）。 */
export async function loadSite(): Promise<SiteModel> {
  // 注意：glob loader 会对 id 做归一化（如 site.config.yaml → "siteconfig"），
  // 因此按"单文件集合"约定取唯一条目，而不是猜测 id（SPEC §3.2）。
  const [profileEntries, siteEntries] = await Promise.all([
    getCollection('profile'),
    getCollection('site'),
  ]);
  if (siteEntries.length !== 1) {
    throw new Error('[senrenbanka] src/data/ 下必须恰好有一个 site.config.yaml（内容集合 site）');
  }
  const siteEntry = siteEntries[0]!;
  const cfg = siteEntry.data;

  const locales: LocaleEntry[] = cfg.i18n.locales.map((locale) => ({ ...locale }));
  const localeByPath = new Map(locales.map((locale) => [locale.path, locale]));

  // 每种语言必须有且仅有一份资料；缺失即构建失败，不静默回退（SPEC §5.5）
  // glob loader 的条目 id 含目录前缀（如 'profiles/zh-cn'），此处按路径末段匹配 locale.path。
  const profileIdByPath = new Map(
    profileEntries.map((entry) => [entry.id.split('/').pop()!, entry] as const),
  );
  const profiles = new Map<string, ResolvedProfile>();
  for (const locale of locales) {
    const entry = profileIdByPath.get(locale.path);
    if (!entry) {
      throw new Error(
        `[senrenbanka] 语言 "${locale.code}"（path: ${locale.path}）已在 site.config.yaml 的 i18n.locales 中声明，但缺少资料文件：期望 src/data/profiles/${locale.path}.yaml。现有：${[...profileIdByPath.keys()].join(', ') || '（无）'}。\n修法：① 补齐该 profile 文件；② 如果只想保留一种语言，请同时从 site.config.yaml 的 i18n.locales 删除 "${locale.code}" 条目（design.json 中残留的 code 会被忽略并告警）。`,
      );
    }
    profiles.set(locale.path, {
      ...entry.data,
      avatar: resolveAvatar(entry.data.avatar, locale.path),
    });
  }
  const extraProfiles = [...profileIdByPath.keys()].filter((id) => !localeByPath.has(id));
  if (extraProfiles.length > 0) {
    throw new Error(
      `[senrenbanka] src/data/profiles/ 存在未在 i18n.locales 中声明的资料：${extraProfiles.join(', ')}。\n修法：① 如果保留这些语言，请在 site.config.yaml 的 i18n.locales 补充对应条目；② 如果刚删除语言，请删除这些 profile 文件。`,
    );
  }

  // 语言字典必须覆盖全部语言（缺键在构建期暴露，不在运行时回退）
  for (const locale of locales) {
    if (!(locale.code in sharedMessages)) {
      throw new Error(
        `[senrenbanka] 语言 "${locale.code}" 缺少共享文案字典（src/i18n/messages.ts）。现有：${Object.keys(sharedMessages).join(', ')}。\n修法：① 在 src/i18n/messages.ts 补齐该语言；② 从 site.config.yaml 的 i18n.locales 删除该语言。`,
      );
    }
  }

  if (enabledDesigns.length === 0) {
    throw new Error(
      '[senrenbanka] 没有已启用的设计：请在至少一个 design.json 中设置 "enabled": true',
    );
  }
  const defaultDesign = enabledDesigns.find((design) => design.id === cfg.design.default);
  if (!defaultDesign) {
    throw new Error(
      `[senrenbanka] site.config.yaml 的 design.default "${cfg.design.default}" 不是已启用的设计。可用：${enabledDesigns
        .map((design) => design.id)
        .join(', ')}`,
    );
  }

  const configuredCodes = new Set(locales.map((locale) => locale.code));
  const designMessagesById = new Map<string, Record<string, unknown>>();
  for (const [key, mod] of Object.entries(designMessageModules)) {
    const id = key.split('/').at(-2);
    if (id && mod.messages) designMessagesById.set(id, mod.messages);
  }

  // 覆盖契约：默认设计全量；声明覆盖的 locale 必须有设计文案与切换页描述。
  // 未在 site.config.yaml 配置的 code 忽略并告警，便于单语言 fork 不必逐套清理 design.json。
  for (const design of enabledDesigns) {
    const declared = design.meta.locales;
    const unknown = declared.filter((code) => !configuredCodes.has(code));
    if (unknown.length > 0) {
      console.warn(
        `[senrenbanka] 设计 "${design.id}" 声明了未配置的 locale：${unknown.join(', ')}，已忽略。`,
      );
    }
    const covered = declared.filter((code) => configuredCodes.has(code));
    if (covered.length === 0) {
      throw new Error(
        `[senrenbanka] 设计 "${design.id}" 没有任何可用 locale：design.json 的 locales 与 site.config.yaml 的 i18n.locales 无交集。\n修法：在 design.json 的 locales 中加入至少一个已配置的 code，或检查 site.config.yaml 的语言 code 是否拼写一致。`,
      );
    }
    if (design.id === defaultDesign.id) {
      const missing = [...configuredCodes].filter((code) => !covered.includes(code));
      if (missing.length > 0) {
        throw new Error(
          `[senrenbanka] 默认设计 "${design.id}" 必须覆盖全部 locale；缺少：${missing.join(', ')}。\n修法：① 在 src/designs/${design.id}/design.json 的 locales 中补齐；② 从 site.config.yaml 删除这些 locale。`,
        );
      }
    }
    const messages = designMessagesById.get(design.id);
    if (!messages) {
      throw new Error(`[senrenbanka] 设计 "${design.id}" 缺少 messages.ts 导出的 messages。`);
    }
    const descriptions = designDescriptions[design.id];
    for (const code of covered) {
      if (!(code in messages)) {
        throw new Error(
          `[senrenbanka] 设计 "${design.id}" 声明覆盖 locale "${code}"，但 src/designs/${design.id}/messages.ts 缺少该语言的文案。\n修法：① 补齐该语言文案；② 从该设计 design.json 的 locales 移除 "${code}"。`,
        );
      }
      if (!descriptions || !(code in descriptions)) {
        throw new Error(
          `[senrenbanka] 设计 "${design.id}" 声明覆盖 locale "${code}"，但 src/designs/descriptions.ts 缺少该语言的切换页描述。\n修法：① 在 descriptions.ts 补齐描述；② 从该设计 design.json 的 locales 移除 "${code}"。`,
        );
      }
    }
  }

  const siteUrl = import.meta.env.SITE ?? cfg.site.url ?? null;

  return {
    site: { ...cfg.site, url: siteUrl },
    defaultLocale: cfg.i18n.defaultLocale,
    locales,
    profiles,
    mode: cfg.design.mode,
    random: {
      cacheHours: cfg.design.random.cacheHours,
      avoidRepeat: cfg.design.random.avoidImmediateRepeat,
    },
    base: BASE,
    // 主题偏好跨语言共享：storageKey 只按 base 派生，不含locale（SPEC §7.5）
    storageKey: storageKeyFor(BASE, cfg.site.storageKey),
    designs: allDesigns,
    enabled: enabledDesigns,
    default: defaultDesign,
    switcherEnabled: cfg.design.manualSwitch,
  };
}

/**
 * 从请求路径解析当前语言（SPEC §5.5）。
 * 语言识别只认路径的**第一段**并与 i18n.locales 的 path 精确匹配，
 * 因此部署 base（/demo）不会被误当成语言代码。解析不到时回退默认语言。
 */
export function resolveLocale(model: SiteModel, pathname: string): LocaleEntry {
  const [first] = pathSegments(pathname);
  return (
    model.locales.find((locale) => locale.path === first) ??
    model.locales.find((locale) => locale.code === model.defaultLocale)!
  );
}

/** 某语言下某设计的固定 URL（带语言前缀）。 */
export function localeDesignHref(localePath: string, designId: string): string {
  return withBase(`${localePath}/${designId}/`);
}

/** 某语言下切换页 / locale 根入口的 URL。sub 省略时返回语言根；传入以 / 结尾则原样保留。 */
export function localeHref(localePath: string, sub = ''): string {
  const suffix = sub ? sub.replace(/^\/+/, '') : '';
  return withBase(suffix ? `${localePath}/${suffix}` : `${localePath}/`);
}

/** 该设计是否声明覆盖某 locale。 */
export function designCovers(design: DesignEntry, locale: LocaleEntry): boolean {
  return design.meta.locales.includes(locale.code);
}

/** 当前 locale 下实际生成页面的设计集合。 */
export function designsForLocale(model: SiteModel, locale: LocaleEntry): readonly DesignEntry[] {
  return model.enabled.filter((design) => designCovers(design, locale));
}

/** 语言切换目标：覆盖则保持当前设计，否则落到目标 locale 的默认设计。 */
export function designHrefForLocale(
  model: SiteModel,
  design: DesignEntry,
  targetLocale: LocaleEntry,
): string {
  return localeDesignHref(
    targetLocale.path,
    designCovers(design, targetLocale) ? design.id : model.default.id,
  );
}

/**
 * 页面上下文 → 语言切换目标（ADR 0007）。
 * 切换语言时**保持页面上下文**：design 页进同一主题，切换页进同一切换页，404 进语言入口。
 */
export function actionMenuLanguageItems(
  model: SiteModel,
  locale: LocaleEntry,
  context: PageContext,
): LanguageSwitcherData['items'] {
  const design =
    context.kind === 'design'
      ? model.designs.find((entry) => entry.id === context.designId)
      : undefined;
  return model.locales.map((entry) => ({
    code: entry.code,
    label: entry.label,
    href:
      context.kind === 'design' && design
        ? designHrefForLocale(model, design, entry)
        : context.kind === 'switcher'
          ? localeHref(entry.path, 'designs/')
          : localeHref(entry.path),
    isCurrent: entry.code === locale.code,
  }));
}

/**
 * 由页面上下文派生共享操作菜单的完整配置（ADR 0007）。
 * design 页 / 切换页 / 404 共用此函数——只有 `context` 不同，
 * 操作数据、随机池、存储语义与文案在三种页面间完全一致。
 */
export function buildActionMenuConfig(
  model: SiteModel,
  locale: LocaleEntry,
  context: PageContext,
  shareTitle: string,
): ActionMenuConfig {
  const messages = sharedMessages[locale.code as LocaleCode];
  return {
    context,
    // 主题切换目标保留当前语言前缀（SPEC §7.5）
    switcherHref: localeHref(locale.path, 'designs/'),
    shareTitle,
    // 随机池 = 当前 locale 下实际生成页面的设计（"排除当前"由运行时按 context 执行）
    targets: designsForLocale(model, locale).map((entry) => ({
      id: entry.id,
      href: localeDesignHref(locale.path, entry.id),
    })),
    mode: model.mode,
    cacheHours: model.random.cacheHours,
    avoidRepeat: model.random.avoidRepeat,
    storageKey: model.storageKey,
    toast: messages.toast,
    launcherLabel: messages.contextMenu.launcherLabel,
    menuLabel: messages.contextMenu.menuLabel,
    closeLabel: messages.contextMenu.closeLabel,
    cancel: messages.contextMenu.cancel,
    messages,
    languages:
      model.locales.length < 2 ? [] : actionMenuLanguageItems(model, locale, context),
    designActionsEnabled: model.switcherEnabled,
  };
}

/** 由 SiteModel 与某套设计派生页面数据（含 head 元信息与索引策略，SPEC §7.4）。 */
export function buildDesignView(model: SiteModel, design: DesignEntry, locale: LocaleEntry): DesignView {
  if (!designCovers(design, locale)) {
    throw new Error(
      `[senrenbanka] 设计 "${design.id}" 未声明支持 locale "${locale.code}"（design.json locales），不应生成该页面。`,
    );
  }
  const isDefault = design.id === model.default.id;
  const headTitle = isDefault ? locale.title : `${design.meta.displayName} · ${locale.title}`;
  const messages = sharedMessages[locale.code as LocaleCode];

  // hreflang 只在**各语言的默认设计页**之间互指；noindex 的非默认主题不参与（SPEC §7.4）
  const alternates = isDefault
    ? [
        ...model.locales.map((entry) => ({
          hreflang: entry.code,
          href: `${model.site.url ?? ''}${localeDesignHref(entry.path, design.id)}`,
        })),
        {
          hreflang: 'x-default',
          href: `${model.site.url ?? ''}${localeDesignHref(
            (model.locales.find((entry) => entry.code === model.defaultLocale) ?? model.locales[0]!).path,
            design.id,
          )}`,
        },
      ]
    : [];

  return {
    profile: model.profiles.get(locale.path)!,
    locale,
    locales: model.locales,
    messages,
    site: {
      manualSwitch: model.switcherEnabled,
    },
    design: {
      id: design.id,
      displayName: design.meta.displayName,
      description: design.meta.description,
      isDefault,
      locales: design.meta.locales,
      defaultDesignId: model.default.id,
    },
    head: {
      title: headTitle,
      description: locale.description,
      canonical: `${model.site.url ?? ''}${localeDesignHref(locale.path, design.id)}`,
      robots: isDefault ? 'index, follow' : 'noindex, follow',
      lang: locale.code,
      alternates,
    },
    contextMenu: buildActionMenuConfig(model, locale, {
      kind: 'design',
      designId: design.id,
      designName: design.meta.displayName,
      accent: design.meta.accent,
    }, headTitle),
  };
}

/** 语言切换项（切换页与 404 的独立 `LanguageSwitcher` 用）：目标由调用方按上下文决定。 */
export function languageItems(
  model: SiteModel,
  locale: LocaleEntry,
  designId: string,
): LanguageSwitcherData['items'] {
  return model.locales.map((entry) => ({
    code: entry.code,
    label: entry.label,
    href: localeDesignHref(entry.path, designId),
    isCurrent: entry.code === locale.code,
  }));
}

/** 语言切换器的完整数据（基础设施页用；href 由调用方按目标决定）。 */
export function languageSwitcherData(
  model: SiteModel,
  locale: LocaleEntry,
  hrefFor: (entry: LocaleEntry) => string,
): LanguageSwitcherData {
  return {
    current: locale.code,
    items: model.locales.map((entry) => ({
      code: entry.code,
      label: entry.label,
      href: hrefFor(entry),
      isCurrent: entry.code === locale.code,
    })),
    navLabel: sharedMessagesFor(locale.code).language.navLabel,
    label: sharedMessagesFor(locale.code).language.label,
  };
}

/** 供设计页使用：按 id + 当前请求路径取自己的 view（locale 由路径统一解析，页面不各自判断）。 */
export async function loadDesignView(id: string, pathname: string): Promise<DesignView> {
  const model = await loadSite();
  const design = model.designs.find((entry) => entry.id === id);
  if (!design) {
    throw new Error(
      `[senrenbanka] 未找到设计 "${id}"。请检查 src/designs/${id}/ 是否包含 design.json / DESIGN.md / Page.astro / messages.ts；styled 设计还需 style.css，html-only 设计不得包含 style.css。`,
    );
  }
  return buildDesignView(model, design, resolveLocale(model, pathname));
}

/** 多语言同屏设计用的一条语言资料。 */
export interface DesignLocaleStrip {
  locale: LocaleEntry;
  profile: ResolvedProfile;
  isCurrent: boolean;
}

/**
 * 供**多语言同屏**设计使用：返回当前 view 与全部语言的资料条。
 * 与 loadDesignView 同一数据源与构建期校验，仅额外取齐各语言 profile；
 * 页面仍然不接触文件路径、不自行判断语言（语言识别只经 resolveLocale）。
 */
export async function loadDesignStrips(
  id: string,
  pathname: string,
): Promise<{ view: DesignView; strips: DesignLocaleStrip[] }> {
  const model = await loadSite();
  const design = model.designs.find((entry) => entry.id === id);
  if (!design) {
    throw new Error(
      `[senrenbanka] 未找到设计 "${id}"。请检查 src/designs/${id}/ 是否包含 design.json / DESIGN.md / Page.astro / messages.ts；styled 设计还需 style.css，html-only 设计不得包含 style.css。`,
    );
  }
  const view = buildDesignView(model, design, resolveLocale(model, pathname));
  const strips: DesignLocaleStrip[] = model.locales.map((locale) => ({
    locale,
    profile: model.profiles.get(locale.path)!,
    isCurrent: locale.code === view.locale.code,
  }));
  return { view, strips };
}
