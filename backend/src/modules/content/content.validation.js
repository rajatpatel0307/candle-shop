import { z } from 'zod';
import { CONTENT_FORMATS, CONTENT_STATUS, DEFAULT_SECTION_KEY, PAGE_TYPES, PROMOTION_LAYOUTS, ROBOTS_DIRECTIVES, SEO_ENTITY_TYPES } from './content.constants.js';

const guid = z.string().uuid();
const optionalGuid = guid.optional();
const pathSchema = z.string().trim().regex(/^\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=:%]*$/, 'Path must be a safe relative URL.').max(500);
const slugSchema = z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and URL friendly.');

function safeUrl(value) {
  if (!value) return true;
  if (value.startsWith('/')) return !value.startsWith('//') && /^[\w\-./?#[\]@!$&'()*+,;=:%]+$/.test(value);
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const urlField = z.string().trim().max(1000).refine(safeUrl, 'URL must be http, https, or a safe relative path.').optional().nullable();
const imageUrlField = z.string().trim().max(1000).refine((value) => !value || (!value.startsWith('/') ? safeUrl(value) : safeUrl(value)), 'Image URL must be http, https, or a safe relative path.').optional().nullable();
const dateField = z.coerce.date().optional().nullable();

const scheduleFields = { startAtUtc: dateField, endAtUtc: dateField };
const scheduleSchema = z.object(scheduleFields).refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const idSchema = z.object({ id: guid });
export const slugParamSchema = z.object({ slug: slugSchema });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(CONTENT_STATUS).optional(),
});

const bannerFields = {
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  desktopImageUrl: imageUrlField,
  mobileImageUrl: imageUrlField,
  altText: z.string().trim().max(250).optional().nullable(),
  buttonText: z.string().trim().max(80).optional().nullable(),
  buttonUrl: urlField,
  secondaryButtonText: z.string().trim().max(80).optional().nullable(),
  secondaryButtonUrl: urlField,
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(CONTENT_STATUS).default('DRAFT'),
  ...scheduleFields,
};

export const bannerSchema = z.object(bannerFields).refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const bannerPatchSchema = z.object(bannerFields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.').refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

const promotionFields = {
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(1500).optional().nullable(),
  imageUrl: imageUrlField,
  backgroundImageUrl: imageUrlField,
  layoutType: z.enum(PROMOTION_LAYOUTS).default('IMAGE_LEFT'),
  buttonText: z.string().trim().max(80).optional().nullable(),
  buttonUrl: urlField,
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(CONTENT_STATUS).default('DRAFT'),
  ...scheduleFields,
};

export const promotionSchema = z.object(promotionFields).refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const promotionPatchSchema = z.object(promotionFields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.').refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: slugSchema,
  pageType: z.enum(PAGE_TYPES).default('CUSTOM'),
  summary: z.string().trim().max(500).optional().nullable(),
  content: z.string().trim().min(1).max(50_000),
  contentFormat: z.enum(CONTENT_FORMATS).default('HTML'),
  status: z.enum(CONTENT_STATUS).default('DRAFT'),
  publishedAtUtc: dateField,
  revisionNote: z.string().trim().max(500).optional().nullable(),
});

export const pagePatchSchema = pageSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

export const seoQuerySchema = z.object({
  path: pathSchema.optional(),
  entityType: z.enum(SEO_ENTITY_TYPES).optional(),
  entityId: optionalGuid,
}).refine((value) => value.path || (value.entityType && value.entityId), 'Use path or entity lookup.');

const seoFields = {
  entityType: z.enum(SEO_ENTITY_TYPES),
  entityId: guid.optional().nullable(),
  path: pathSchema.optional().nullable(),
  metaTitle: z.string().trim().min(3).max(70),
  metaDescription: z.string().trim().min(10).max(170),
  canonicalUrl: urlField,
  robotsDirective: z.enum(ROBOTS_DIRECTIVES).optional().nullable(),
  ogTitle: z.string().trim().max(100).optional().nullable(),
  ogDescription: z.string().trim().max(220).optional().nullable(),
  ogImageUrl: imageUrlField,
};

export const seoSchema = z.object(seoFields).refine((value) => value.entityId || value.path, {
  message: 'SEO metadata needs either entityId or path.',
  path: ['path'],
});

export const seoPatchSchema = z.object(seoFields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const featuredFields = {
  productId: guid,
  sectionKey: z.string().trim().min(2).max(80).default(DEFAULT_SECTION_KEY),
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(CONTENT_STATUS).default('DRAFT'),
  ...scheduleFields,
};

export const featuredSchema = z.object(featuredFields).refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const featuredPatchSchema = z.object(featuredFields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.').refine((value) => !value.startAtUtc || !value.endAtUtc || value.endAtUtc >= value.startAtUtc, {
  message: 'End date must be after start date.',
  path: ['endAtUtc'],
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: guid, displayOrder: z.coerce.number().int().min(0) })).min(1).max(200),
});
