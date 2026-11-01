import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';

/**
 * 设计注册表：目录存在即注册（SPEC §6）。
 * - 只负责"发现 + 校验 + 元数据"；页面路由由 astro.config 的 injectRoute 注入。
 * - 文件存在性用 node:fs 检查（而不是 import.meta.glob）：任何页面对本模块的引用
 *   都不应产生指向 Page.astro / style.css 的动态 import 边，否则 Vite 会把所有设计的
 *   CSS 聚合进每个引用方的 <link>（本机已实测的坑，见 SPEC §3.2）。
 * - 共同齐备：DESIGN.md / design.json / Page.astro / messages.ts。
 * - styled 设计必须提供 style.css；html-only 设计必须不提供 style.css。
 * - html-only 设计不得提供 tokens.css 或 style.css；可提供自包含 Preview.astro
 *   （ADR 0009：预览只属于切换页，不改变正式 HTML-only 页面的资源契约）。
 * - 任何违规在构建期抛错并明确指出目录与原因。
 */

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const RESERVED_IDS = new Set(['designs']);

// 假设构建/开发进程的工作目录是项目根（npm scripts 与 CI 均如此）。
const designsRoot = path.join(process.cwd(), 'src', 'designs');

const sourceSchema = z
  .object({
    type: z.enum([
      'official-vendor',
      'official-docs-derived',
      'third-party-analysis',
      'self-produced',
    ]),
    url: z.string().min(1).optional(),
    fetchedAt: z.string().min(1).optional(),
    license: z.string().min(1).optional(),
    attribution: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((source, ctx) => {
    if (source.type === 'self-produced') return;
    const required: Array<[keyof typeof source, string]> = [
      ['url', '来源 URL'],
      ['fetchedAt', '获取日期'],
      ['license', '许可'],
    ];
    for (const [field, label] of required) {
      if (!source[field]) {
        ctx.addIssue({
          code: 'custom',
          message: `非自产设计必须记录 provenance：source.${String(field)}（${label}）缺失`,
        });
      }
    }
  });

export const designMetaSchema = z
  .object({
    displayName: z.string().min(1),
    description: z.string().min(1),
    enabled: z.boolean(),
    /** 该设计承诺提供完整界面文案的 locale code 列表；默认设计必须覆盖全部配置 locale。 */
    locales: z.array(z.string().min(1)).min(1),
    renderMode: z.enum(['styled', 'html-only']).default('styled'),
    accent: z.string().min(1).optional(),
    source: sourceSchema,
    generatedBy: z.string().min(1).optional(),
  })
  .strict();

export type DesignMeta = z.infer<typeof designMetaSchema>;

// design.json 是纯数据（eager JSON 导入不产生样式边，安全）。
const metaModules = import.meta.glob('./*/design.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export interface DesignEntry {
  id: string;
  meta: DesignMeta;
}

function idFromKey(key: string): string {
  // key 形如 './editorial/design.json'
  return key.slice(2).split('/')[0] ?? '';
}

function fail(id: string, message: string): never {
  throw new Error(`[senrenbanka] 设计校验失败（src/designs/${id}）：${message}`);
}

function hasFile(id: string, file: string): boolean {
  return fs.existsSync(path.join(designsRoot, id, file));
}

const entries: DesignEntry[] = [];

for (const [key, rawMeta] of Object.entries(metaModules)) {
  const id = idFromKey(key);
  if (!ID_RE.test(id)) {
    fail(id, `目录名必须匹配 ${ID_RE}（小写字母/数字/连字符）`);
  }
  if (RESERVED_IDS.has(id)) {
    fail(id, `"${id}" 是保留路径（切换页使用），不能作为设计 id`);
  }
  const parsed = designMetaSchema.safeParse(rawMeta);
  if (!parsed.success) {
    fail(id, `design.json 校验失败：\n${parsed.error.message}`);
  }
  if (!hasFile(id, 'DESIGN.md')) {
    fail(id, '缺少 DESIGN.md（设计规范快照）');
  }
  if (!hasFile(id, 'Page.astro')) {
    fail(id, '缺少 Page.astro（该设计的完整页面）');
  }
  // locale 消息契约：每套设计必须提供三语言文案（SPEC §4）
  if (!hasFile(id, 'messages.ts')) {
    fail(
      id,
      '缺少 messages.ts（该设计的界面文案）。契约：export const messages 需覆盖 design.json locales 中声明的每种语言 code，缺键在构建期报错。',
    );
  }
  const hasStyleEntry = hasFile(id, 'style.css');
  if (parsed.data.renderMode === 'styled' && !hasStyleEntry) {
    fail(id, 'renderMode 为 "styled" 时必须提供 style.css（CSS 入口）');
  }
  if (parsed.data.renderMode === 'html-only' && hasStyleEntry) {
    fail(id, 'renderMode 为 "html-only" 时禁止提供 style.css');
  }
  if (parsed.data.renderMode === 'html-only' && hasFile(id, 'tokens.css')) {
    fail(id, 'renderMode 为 "html-only" 时禁止提供 tokens.css');
  }
  entries.push({ id, meta: parsed.data });
}

if (entries.length === 0) {
  throw new Error(
    '[senrenbanka] src/designs/ 下没有发现任何设计。至少需要一个 <id>/ 目录，内含 design.json / DESIGN.md / Page.astro / messages.ts；styled 设计还必须提供 style.css。',
  );
}

entries.sort((a, b) => a.id.localeCompare(b.id));

export const allDesigns: readonly DesignEntry[] = entries;
export const enabledDesigns: readonly DesignEntry[] = entries.filter((entry) => entry.meta.enabled);
