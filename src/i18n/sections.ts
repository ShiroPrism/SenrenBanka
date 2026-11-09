/**
 * 主分区标准标签（SPEC §4 · ADR 0023）。
 *
 * - 标准标签是项目契约，不是主题文案；所有设计从这里取 h2 文本。
 * - 主题词仍由各设计 `messages.ts` 提供，只能出现在 h2 之外。
 * - 纯数据：不 import CSS / Page.astro / style.css。
 */
import raw from './sections.json';
import type { MessageLocaleCode } from './messages';

export type SectionKey = 'profile' | 'projects' | 'experience' | 'skills' | 'contact' | 'links';

export interface SectionLabel {
  /** 当前 Locale 的 canonical 标签。 */
  label: string;
  /** 英文 canonical 标签；en 下与 label 相同。 */
  enLabel: string;
  /** 检查器接受的显式同义词；不得包含主题词。 */
  aliases: string[];
}

export const sectionLabels: Record<MessageLocaleCode, Record<SectionKey, SectionLabel>> = raw;

export function getSectionLabels(locale: string): Record<SectionKey, SectionLabel> {
  const labels = sectionLabels[locale as MessageLocaleCode];
  if (!labels) {
    throw new Error(`Unknown locale for section labels: ${locale}`);
  }
  return labels;
}

export const sectionKeys = [
  'profile',
  'projects',
  'experience',
  'skills',
  'contact',
  'links',
] as const satisfies readonly SectionKey[];
