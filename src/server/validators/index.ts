import { z } from "zod";
import { CATALOGUE_DEFAULTS } from "@/lib/constants";

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const skuRegex = /^[A-Z0-9][A-Z0-9-_]{2,31}$/;

export const catalogueQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  material: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  finish: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  application: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  sort: z
    .enum(["featured", "newest", "name_asc", "name_desc"])
    .optional()
    .default("featured"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(CATALOGUE_DEFAULTS.MAX_PAGE_SIZE)
    .optional()
    .default(CATALOGUE_DEFAULTS.DEFAULT_PAGE_SIZE),
});

export type CatalogueQueryInput = z.infer<typeof catalogueQuerySchema>;

export const productImageInputSchema = z.object({
  id: z.string().uuid().optional(),
  storageKey: z.string().trim().min(1, "Storage key is required."),
  imageUrl: z.string().trim().min(1, "Image URL is required."),
  altText: z.string().trim().min(2, "Alt text is required for accessibility.").max(240),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  width: z.coerce.number().int().positive().default(1200),
  height: z.coerce.number().int().positive().default(900),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters.").max(160),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      skuRegex,
      "SKU must be 3-32 uppercase alphanumeric characters, hyphens, or underscores.",
    ),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "Slug must be lowercase kebab-case (e.g. honed-limestone-slab)."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(4000),
  materialTypeId: z.string().uuid("A valid material type is required."),
  finishId: z.string().uuid("A valid finish is required."),
  dimensionText: z
    .string()
    .trim()
    .min(2, "Dimension specification is required.")
    .max(160),
  widthMm: z.coerce.number().int().positive().nullable().optional(),
  heightMm: z.coerce.number().int().positive().nullable().optional(),
  thicknessMm: z.coerce.number().int().positive().nullable().optional(),
  moqValue: z.coerce.number().int().positive("MOQ value must be greater than zero."),
  moqUnit: z.string().trim().min(1, "MOQ unit is required.").max(32),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  applicationIds: z
    .array(z.string().uuid("Application ID must be a valid UUID."))
    .min(1, "Select at least one architectural application."),
  images: z.array(productImageInputSchema).optional().default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const taxonomyItemSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "Slug must be lowercase kebab-case."),
  description: z.string().trim().max(500).optional().default(""),
});

export const createMoodboardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Moodboard name must be at least 2 characters.")
    .max(120),
  description: z.string().trim().max(1000).optional().default(""),
});

export const updateMoodboardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Moodboard name must be at least 2 characters.")
    .max(120)
    .optional(),
  description: z.string().trim().max(1000).optional(),
});

export const addMoodboardItemSchema = z.object({
  productId: z.string().uuid("A valid product ID is required."),
});

export const reorderMoodboardItemsSchema = z.object({
  itemIds: z
    .array(z.string().uuid("Each item ID must be a valid UUID."))
    .min(1, "At least one moodboard item ID is required."),
});

export const registerTradeAccountSchema = z.object({
  name: z.string().trim().min(2, "Full name is required.").max(120),
  email: z.string().trim().email("A valid business email address is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
  companyName: z.string().trim().min(2, "Company name is required.").max(160),
  companyWebsite: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => !v || /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(v),
      "Company website must be a valid URL starting with http:// or https://.",
    ),
  jobTitle: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Full name is required.").max(120),
  companyName: z.string().trim().min(2, "Company name is required.").max(160),
  companyWebsite: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => !v || /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(v),
      "Company website must be a valid URL starting with http:// or https://.",
    ),
  jobTitle: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export const updateTradeAccountStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  reason: z.string().trim().max(500).optional(),
});

export const csvRowSchema = z.object({
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(skuRegex, "Invalid SKU format."),
  name: z.string().trim().min(2, "Product name is required."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugRegex, "Invalid slug format."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  material_type: z.string().trim().min(1, "material_type is required."),
  finish: z.string().trim().min(1, "finish is required."),
  dimension: z.string().trim().min(2, "dimension is required."),
  moq_value: z.coerce.number().int().positive("moq_value must be a positive integer."),
  moq_unit: z.string().trim().min(1, "moq_unit is required."),
  applications: z.string().trim().min(1, "At least one application is required."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});
