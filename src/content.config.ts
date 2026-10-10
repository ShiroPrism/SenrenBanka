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

const siteConfigSchema = z
  .object({
    site: z
      .object({
        title: z.string().min(1),
        description: z.string().default(''),
        lang: z.string().min(1).default('en'),
        url: z.string().min(1).nullable().default(null),
        storageKey: z.string().min(1).nullable().default(null),
      })
      .strict(),
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
  loader: glob({ base: './src/data', pattern: 'profile.yaml' }),
  schema: profileSchema,
});

const site = defineCollection({
  loader: glob({ base: './src/data', pattern: 'site.config.yaml' }),
  schema: siteConfigSchema,
});

export const collections = { profile, site };