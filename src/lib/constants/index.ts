export const CATALOGUE_DEFAULTS = {
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 48,
  SORT_OPTIONS: [
    { value: "featured", label: "Featured First" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "name_asc", label: "Product Name (A-Z)" },
    { value: "name_desc", label: "Product Name (Z-A)" },
  ] as const,
} as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const MAX_CSV_IMPORT_ROWS = 500;

export const REQUIRED_CSV_HEADERS = [
  "sku",
  "name",
  "slug",
  "description",
  "material_type",
  "finish",
  "dimension",
  "moq_value",
  "moq_unit",
  "applications",
  "status",
] as const;
