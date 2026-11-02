import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const linkSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1),
    icon: z.string().min(1).optional(),
  })
  .strict();

const projectSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    url: z.string().optional(),
    tags: z.array(z.string().min(1)).optional(),
  })
  .strict();

const experienceSchema = z
  .object({
    org: z.string().min(1),
    role: z.string().optional(),
    period: z.string().optional(),
    description: z.string().optional(),
  })
  .strict();

/** 个人资料契约：三种语言共用同一套字段，不为语言拆分 schema（SPEC §5.5）。 */
const profileSchema = z
  .object({
    name: z.string().min(1),
    headline: z.string().min(1),
    bio: z.string().min(1),
    avatar: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    links: z.array(linkSchema),
    projects: z.array(projectSchema).optional(),
    experience: z.array(experienceSchema).optional(),
    skills: z.array(z.string().min(1)).optional(),
    contact: z
      .object({
        email: z.string().min(1).optional(),
        note: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/** 语言路径：URL 前缀 + 资料文件名。须为合法相对路径片段（SPEC §5.5）。 */
const localePathSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, '语言 path 必须是小写字母/数字/连字符');

/** 语言条目：code 用于 HTML lang 与字典键，path 用于 URL 与资料文件。 */
const localeSchema = z
  .object({
    code: z.string().min(1),
    path: localePathSchema,
    label: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    /** 站点声明：示例数据提示等单行纯文本；缺省不渲染，不进入人物资料契约。 */
    notice: z.string().trim().min(1).optional(),
    /** 显式声明文字系统档位；不从 BCP 47 推断。 */
    fontProfile: z.enum(['latin', 'vietnamese', 'cjk', 'korean', 'traditional-chinese']).optional(),
  })
  .strict();

/** site 级配置（url / storageKey）；yaml 中整段注释掉时等价于全默认。 */
const siteSectionSchema = z
  .object({
    url: z.string().min(1).nullable().default(null),
    storageKey: z.string().min(1).nullable().default(null),
  })
  .strict();

const siteConfigSchema = z
  .object({
    // 注意：yaml 里整段被注释掉时 `site:` 会解析成 **null**（不是缺失），
    // 因此这里先把 null 归一化成 {} 再校验；用 preprocess 而非 transform，
    // 是为了保留子 schema 的输出类型（transform 会把它擦成 {}）。
    site: z.preprocess((value) => value ?? {}, siteSectionSchema),
    i18n: z
      .object({
        defaultLocale: z.string().min(1),
        locales: z.array(localeSchema).min(1),
      })
      .strict()
      .superRefine((i18n, ctx) => {
        const codes = new Set<string>();
        const paths = new Set<string>();
        i18n.locales.forEach((locale, index) => {
          if (codes.has(locale.code)) {
            ctx.addIssue({
              code: 'custom',
              path: ['locales', index, 'code'],
              message: `语言 code 重复："${locale.code}"`,
            });
          }
          if (paths.has(locale.path)) {
            ctx.addIssue({
              code: 'custom',
              path: ['locales', index, 'path'],
              message: `语言 path 重复："${locale.path}"`,
            });
          }
          codes.add(locale.code);
          paths.add(locale.path);
        });
        // 默认语言必须存在：缺失即为配置错误，不允许静默回退（SPEC §5.5）
        if (!codes.has(i18n.defaultLocale)) {
          ctx.addIssue({
            code: 'custom',
            path: ['defaultLocale'],
            message: `defaultLocale "${i18n.defaultLocale}" 不在 locales 中（可用：${[...codes].join(', ')}）`,
          });
        }
      }),
    design: z
      .object({
        mode: z.enum(['random', 'fixed']),
        default: z.string().min(1),
        manualSwitch: z.boolean().default(true),
        random: z
          .object({
            cacheHours: z.number().min(0).default(24),
            avoidImmediateRepeat: z.boolean().default(true),
          })
          .strict()
          .default({ cacheHours: 24, avoidImmediateRepeat: true }),
      })
      .strict(),
  })
  .strict();

const profile = defineCollection({
  loader: glob({ base: './src/data', pattern: 'profiles/*.yaml' }),
  schema: profileSchema,
});

const site = defineCollection({
  loader: glob({ base: './src/data', pattern: 'site.config.yaml' }),
  schema: siteConfigSchema,
});

export const collections = { profile, site };
