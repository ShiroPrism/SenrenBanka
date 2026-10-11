import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { allDesigns, enabledDesigns, type DesignEntry } from '../designs/registry';
import { storageKeyFor } from './router-script';
import { BASE, withBase } from './urls';
import type { ContextMenuRuntimeConfig } from './context-menu';

export type ProfileData = CollectionEntry<'profile'>['data'];
export type SiteConfigData = CollectionEntry<'site'>['data'];

/** avatar 解析结果：本地图片（ImageMetadata）或外部 URL（string）或 null。 */
export type ResolvedProfile = Omit<ProfileData, 'avatar'> & {
  avatar: ImageMetadata | string | null;
};

/** 桌面右键快捷操作菜单的构建期配置（SPEC §7.5；运行时见 src/lib/context-menu.ts）。 */
export interface ContextMenuConfig extends ContextMenuRuntimeConfig {
  /** manualSwitch 关闭时为 false：整菜单不渲染（运行时与样式也不注入）。 */
  enabled: boolean;
  /** 身份条展示的当前设计名。 */
  designName: string;
  /** 当前设计的强调色（design.json.accent，可选）——身份条圆点用，与切换页芯片同源。 */
  accent?: string;
}

/** 传给每套设计页面的统一数据接口（SPEC §6.4）。 */
export interface DesignView {
  profile: ResolvedProfile;
  site: {
    title: string;
    description: string;
    lang: string;
    manualSwitch: boolean;
  };
  design: {
    id: string;
    displayName: string;
    description: string;
    isDefault: boolean;
  };
  /** 由框架统一计算的 head 元信息（设计必须原样传给 HeadMeta）。 */
  head: {
    title: string;
    description: string;
    canonical: string;
    robots: string;
    lang: string;
  };
  /** 设计切换入口：桌面右键快捷操作菜单（manualSwitch 语义见 SPEC §7.5）。 */
  contextMenu: ContextMenuConfig;
}

export interface SiteModel {
  site: SiteConfigData['site'] & { url: string | null };
  profile: ResolvedProfile;
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

function resolveAvatar(avatar: string | undefined): ImageMetadata | string | null {
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
      `[senrenbanka] profile.yaml 的 avatar "${avatar}" 未找到。请把文件放入 src/data/assets/，可选：${available}`,
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
  if (profileEntries.length !== 1) {
    throw new Error('[senrenbanka] src/data/ 下必须恰好有一个 profile.yaml（内容集合 profile）');
  }
  if (siteEntries.length !== 1) {
    throw new Error('[senrenbanka] src/data/ 下必须恰好有一个 site.config.yaml（内容集合 site）');
  }
  const profileEntry = profileEntries[0]!;
  const siteEntry = siteEntries[0]!;

  const cfg = siteEntry.data;
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

  const siteUrl = import.meta.env.SITE ?? cfg.site.url ?? null;

  return {
    site: { ...cfg.site, url: siteUrl },
    profile: { ...profileEntry.data, avatar: resolveAvatar(profileEntry.data.avatar) },
    mode: cfg.design.mode,
    random: {
      cacheHours: cfg.design.random.cacheHours,
      avoidRepeat: cfg.design.random.avoidImmediateRepeat,
    },
    base: BASE,
    storageKey: storageKeyFor(BASE, cfg.site.storageKey),
    designs: allDesigns,
    enabled: enabledDesigns,
    default: defaultDesign,
    switcherEnabled: cfg.design.manualSwitch,
  };
}

/** 由 SiteModel 与某套设计派生页面数据（含 head 元信息与索引策略，SPEC §7.4）。 */
export function buildDesignView(model: SiteModel, design: DesignEntry): DesignView {
  const isDefault = design.id === model.default.id;
  const headTitle = isDefault ? model.site.title : `${design.meta.displayName} · ${model.site.title}`;
  return {
    profile: model.profile,
    site: {
      title: model.site.title,
      description: model.site.description,
      lang: model.site.lang,
      manualSwitch: model.switcherEnabled,
    },
    design: {
      id: design.id,
      displayName: design.meta.displayName,
      description: design.meta.description,
      isDefault,
    },
    head: {
      title: headTitle,
      description: model.site.description,
      canonical: `${model.site.url ?? ''}${withBase(`${design.id}/`)}`,
      robots: isDefault ? 'index, follow' : 'noindex, follow',
      lang: model.site.lang,
    },
    contextMenu: {
      enabled: model.switcherEnabled,
      designName: design.meta.displayName,
      accent: design.meta.accent,
      currentId: design.id,
      switcherHref: withBase('designs/'),
      shareTitle: headTitle,
      // 随机池 = 全部启用设计（含自身；运行时执行"排除当前"与 avoidRepeat，见 SPEC §7.5）
      targets: model.enabled.map((entry) => ({ id: entry.id, href: withBase(`${entry.id}/`) })),
      mode: model.mode,
      cacheHours: model.random.cacheHours,
      avoidRepeat: model.random.avoidRepeat,
      storageKey: model.storageKey,
    },
  };
}

/** 供设计页使用：按 id 取自己的 view（含 head 元信息与索引策略等框架计算结果）。 */
export async function loadDesignView(id: string): Promise<DesignView> {
  const model = await loadSite();
  const design = model.designs.find((entry) => entry.id === id);
  if (!design) {
    throw new Error(
      `[senrenbanka] 未找到设计 "${id}"。请检查 src/designs/${id}/ 是否包含 design.json / DESIGN.md / Page.astro / style.css。`,
    );
  }
  return buildDesignView(model, design);
}