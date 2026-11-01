import { z } from 'zod';

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const WEIGHT_PATTERN =
  /^(?:100|200|300|400|500|600|700|800|900)(?: (?:100|200|300|400|500|600|700|800|900))?$/;
const STRETCH_PATTERN = /^(?:\d{1,3}(?:\.\d+)?%|\d{1,3}(?:\.\d+)?% \d{1,3}(?:\.\d+)?%)$/;
const UNICODE_RANGE_PATTERN = /^U\+[0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?$/i;
const CSS_VARIABLE_PATTERN = /^--[a-z0-9-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RELEASE_TAG_PATTERN =
  /^[a-z][a-z0-9-]*-v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function isSafeRelativePath(value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 240 ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.includes(':') ||
    /(^|\/)\.{1,2}(\/|$)/.test(value) ||
    // eslint-disable-next-line no-control-regex -- catalog paths must reject control characters
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false;
  }
  return value
    .split('/')
    .every(
      (part) =>
        part.length > 0 &&
        part !== '.' &&
        part !== '..' &&
        !part.endsWith('.') &&
        !part.endsWith(' '),
    );
}

function isSafeFileName(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 200 &&
    !value.includes('/') &&
    !value.includes('\\') &&
    !value.includes(':') &&
    value !== '.' &&
    value !== '..' &&
    !value.endsWith('.') &&
    !value.endsWith(' ') &&
    // eslint-disable-next-line no-control-regex -- catalog file names must reject control characters
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function isLoopbackHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  );
}

export function isAllowedUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && isLoopbackHost(url.hostname));
  } catch {
    return false;
  }
}

const safeRelativePathSchema = z
  .string()
  .refine(isSafeRelativePath, 'must be a safe relative POSIX path');
const safeFileNameSchema = z.string().refine(isSafeFileName, 'must be a safe file name');
const sha256Schema = z.string().regex(SHA256_PATTERN, 'must be a lowercase SHA-256 digest');
const idSchema = z.string().regex(ID_PATTERN, 'must be a lowercase kebab-case id');
const versionSchema = z.string().regex(SEMVER_PATTERN, 'must be a semantic version');
const allowedUrlSchema = z
  .string()
  .refine(isAllowedUrl, 'must use HTTPS or a loopback HTTP fixture');
const unicodeRangeSchema = z.string().regex(UNICODE_RANGE_PATTERN, 'must be a valid unicode range');
const scriptsSchema = z
  .array(z.enum(['cjk', 'hangul', 'han-traditional']))
  .min(1)
  .optional();

const releaseAssetSchema = z
  .object({
    releaseTag: z.string().regex(RELEASE_TAG_PATTERN),
    fileName: safeFileNameSchema,
    sha256: sha256Schema,
    size: z
      .number()
      .int()
      .positive()
      .max(512 * 1024 * 1024),
  })
  .strict();

const catalogFamilySchema = z
  .object({
    version: versionSchema,
    role: z.enum(['fixed', 'core-cjk']),
    scripts: scriptsSchema,
    package: releaseAssetSchema,
    source: releaseAssetSchema,
  })
  .strict();

export const catalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalogVersion: versionSchema,
    baseUrl: allowedUrlSchema.refine((value) => !value.endsWith('/'), 'must not end with /'),
    families: z.record(idSchema, catalogFamilySchema),
  })
  .strict()
  .superRefine((catalog, context) => {
    for (const [id, family] of Object.entries(catalog.families)) {
      const expectedPackageTag = `font-${id}-v${family.version}`;
      if (family.package.releaseTag !== expectedPackageTag) {
        context.addIssue({
          code: 'custom',
          path: ['families', id, 'package', 'releaseTag'],
          message: `must be ${expectedPackageTag}`,
        });
      }
      if (family.source.releaseTag !== expectedPackageTag) {
        context.addIssue({
          code: 'custom',
          path: ['families', id, 'source', 'releaseTag'],
          message: `must be ${expectedPackageTag}`,
        });
      }
      if (family.package.fileName !== `${id}-v${family.version}.tar.gz`) {
        context.addIssue({
          code: 'custom',
          path: ['families', id, 'package', 'fileName'],
          message: 'unexpected package file name',
        });
      }
      if (family.source.fileName !== `${id}-v${family.version}-source.tar.gz`) {
        context.addIssue({
          code: 'custom',
          path: ['families', id, 'source', 'fileName'],
          message: 'unexpected source file name',
        });
      }
    }
  });

const fontMetadataSchema = z
  .object({
    familyName: z.string().min(1),
    subfamilyName: z.string().min(1),
    postscriptName: z.string().min(1),
    format: z.enum(['TTF', 'OTF', 'WOFF', 'WOFF2']),
    weight: z.number().int(),
    widthClass: z.number().int(),
    italicAngle: z.number(),
    coverageCount: z.number().int().nonnegative(),
    variationAxes: z.record(
      z.string(),
      z
        .object({
          min: z.number(),
          default: z.number(),
          max: z.number(),
        })
        .strict(),
    ),
  })
  .strict();

const manifestVariantSchema = z
  .object({
    file: safeRelativePathSchema
      .refine((value) => value.startsWith('fonts/'), 'must use the fonts/ directory')
      .refine((value) => /\.woff2$/i.test(value), 'must be a WOFF2 file'),
    sha256: sha256Schema,
    size: z.number().int().positive(),
    weight: z.string().regex(WEIGHT_PATTERN),
    style: z.enum(['normal', 'italic', 'oblique']),
    stretch: z.string().regex(STRETCH_PATTERN).optional(),
    display: z.enum(['auto', 'block', 'swap', 'fallback', 'optional']),
    unicodeRange: z.array(unicodeRangeSchema).min(1).optional(),
    cmapAliases: z.array(z.number().int().min(0).max(0x10ffff)).optional(),
    features: z.array(z.string().min(1)).optional(),
    variationSettings: z.record(z.string(), z.number()).optional(),
    font: fontMetadataSchema,
  })
  .strict();

const licenseFileSchema = z
  .object({
    file: safeRelativePathSchema.refine(
      (value) => value.startsWith('licenses/'),
      'must use the licenses/ directory',
    ),
    sha256: sha256Schema,
    size: z.number().int().positive(),
  })
  .strict();

const rfnSchema = z
  .object({
    status: z.enum(['not-applicable', 'unmodified-distribution', 'permission-granted', 'renamed']),
    basis: z.string().min(1),
    permissionEvidenceUrl: allowedUrlSchema.optional(),
    permissionText: z.string().min(1).optional(),
  })
  .strict();

const licenseSchema = z
  .object({
    spdx: z.enum(['OFL-1.1', 'Apache-2.0', 'CC0-1.0']),
    approvedForRedistribution: z.literal(true),
    reviewedAt: z.string().regex(DATE_PATTERN),
    reviewedBy: z.string().min(1),
    evidenceUrl: allowedUrlSchema,
    files: z.array(licenseFileSchema).min(1),
    reservedFontNames: z.array(z.string().min(1)),
    rfn: rfnSchema,
  })
  .strict();

export const familyManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    kind: z.literal('family'),
    id: idSchema,
    familyName: z.string().min(1),
    sourceFamilyName: z.string().min(1),
    role: z.enum(['fixed', 'core-cjk']),
    scripts: scriptsSchema,
    version: versionSchema,
    cssVariable: z.string().regex(CSS_VARIABLE_PATTERN),
    fallbacks: z.array(z.string().min(1)).min(1),
    buildTools: z
      .object({
        cnFontSplit: z.string().min(1),
        fontkitten: z.string().min(1),
        schema: z.literal(1),
      })
      .strict(),
    source: z
      .object({
        archiveFileName: safeFileNameSchema,
        files: z
          .array(
            z
              .object({
                fileName: safeFileNameSchema,
                sha256: sha256Schema,
                size: z.number().int().positive(),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    license: licenseSchema,
    css: z.literal('font.css'),
    variants: z.array(manifestVariantSchema).min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    const sourceFiles = new Set();
    for (const [index, file] of manifest.source.files.entries()) {
      if (sourceFiles.has(file.fileName)) {
        context.addIssue({
          code: 'custom',
          path: ['source', 'files', index, 'fileName'],
          message: `duplicate source file ${file.fileName}`,
        });
      }
      sourceFiles.add(file.fileName);
    }

    const reservedNames = new Set();
    for (const [index, name] of manifest.license.reservedFontNames.entries()) {
      if (reservedNames.has(name)) {
        context.addIssue({
          code: 'custom',
          path: ['license', 'reservedFontNames', index],
          message: `duplicate reserved font name ${name}`,
        });
      }
      reservedNames.add(name);
    }
    if (
      manifest.license.reservedFontNames.length > 0 &&
      manifest.license.rfn.status === 'not-applicable'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['license', 'rfn', 'status'],
        message: 'cannot be not-applicable when reserved font names are declared',
      });
    }
    if (
      manifest.license.rfn.status === 'permission-granted' &&
      !manifest.license.rfn.permissionEvidenceUrl &&
      !manifest.license.rfn.permissionText
    ) {
      context.addIssue({
        code: 'custom',
        path: ['license', 'rfn'],
        message: 'permission-granted requires evidence URL or permission text',
      });
    }

    if (manifest.role === 'core-cjk') {
      for (const [index, variant] of manifest.variants.entries()) {
        if (!variant.unicodeRange) {
          context.addIssue({
            code: 'custom',
            path: ['variants', index, 'unicodeRange'],
            message: 'core-cjk variants require unicode ranges for offline auditing',
          });
        }
      }
    }
  });

const variantOverrideSchema = z
  .object({
    file: safeFileNameSchema,
    weight: z.string().regex(WEIGHT_PATTERN).optional(),
    style: z.enum(['normal', 'italic', 'oblique']).optional(),
    stretch: z.string().regex(STRETCH_PATTERN).optional(),
    display: z.enum(['auto', 'block', 'swap', 'fallback', 'optional']).optional(),
    unicodeRange: z.array(unicodeRangeSchema).min(1).optional(),
  })
  .strict();

const configFamilySchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    cssVariable: z.string().regex(CSS_VARIABLE_PATTERN),
    fallbacks: z.array(z.string().min(1)).min(1),
    variantOverrides: z.array(variantOverrideSchema).optional(),
  })
  .strict()
  .superRefine((family, context) => {
    const files = new Set();
    for (const [index, variant] of (family.variantOverrides ?? []).entries()) {
      if (files.has(variant.file)) {
        context.addIssue({
          code: 'custom',
          path: ['variantOverrides', index, 'file'],
          message: `duplicate variant override ${variant.file}`,
        });
      }
      files.add(variant.file);
    }
  });

export const fontsConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    baseUrl: allowedUrlSchema.refine((value) => !value.endsWith('/'), 'must not end with /'),
    families: z.array(configFamilySchema).min(1),
  })
  .strict()
  .superRefine((config, context) => {
    const ids = new Set();
    const cssVariables = new Set();
    for (const [index, family] of config.families.entries()) {
      if (ids.has(family.id)) {
        context.addIssue({
          code: 'custom',
          path: ['families', index, 'id'],
          message: `duplicate family id ${family.id}`,
        });
      }
      if (cssVariables.has(family.cssVariable)) {
        context.addIssue({
          code: 'custom',
          path: ['families', index, 'cssVariable'],
          message: `duplicate CSS variable ${family.cssVariable}`,
        });
      }
      ids.add(family.id);
      cssVariables.add(family.cssVariable);
    }
  });

export const packageFileSchema = z
  .object({
    path: safeRelativePathSchema,
    sha256: sha256Schema,
    size: z.number().int().nonnegative(),
  })
  .strict();

export const snapshotFamilySchema = z
  .object({
    version: versionSchema,
    role: z.enum(['fixed', 'core-cjk']),
    package: releaseAssetSchema,
    source: releaseAssetSchema,
    manifest: familyManifestSchema,
    files: z.array(packageFileSchema).min(1),
  })
  .strict();

export const catalogSnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalogVersion: versionSchema,
    catalogUrl: allowedUrlSchema,
    catalogSha256: sha256Schema,
    baseUrl: allowedUrlSchema.refine((value) => !value.endsWith('/'), 'must not end with /'),
    families: z.record(idSchema, snapshotFamilySchema),
  })
  .strict();

const lockFamilySchema = z
  .object({
    version: versionSchema,
    package: releaseAssetSchema,
    source: releaseAssetSchema,
    manifestSha256: sha256Schema,
    packageFilesSha256: sha256Schema,
  })
  .strict();

export const fontLockSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalog: z
      .object({
        version: versionSchema,
        url: allowedUrlSchema,
        sha256: sha256Schema,
        snapshotSha256: sha256Schema,
      })
      .strict(),
    baseUrl: allowedUrlSchema.refine((value) => !value.endsWith('/'), 'must not end with /'),
    families: z.record(idSchema, lockFamilySchema),
  })
  .strict();

export function parseWithSchema(schema, value, label) {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const issues = result.error.issues
    .map((issue) => `${issue.path.length > 0 ? issue.path.join('.') : '<root>'}: ${issue.message}`)
    .join('; ');
  throw new Error(`${label} is invalid: ${issues}`);
}
