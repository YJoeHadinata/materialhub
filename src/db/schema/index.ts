import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", ["MEMBER", "ADMIN"]);

export const tradeStatusEnum = pgEnum("trade_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

// -----------------------------------------------------------------------------
// BETTER AUTH + APPLICATION USER TABLES
// -----------------------------------------------------------------------------

export const user = pgTable(
  "user",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum("role").default("MEMBER").notNull(),
    companyName: text("company_name").default("").notNull(),
    companyWebsite: text("company_website"),
    jobTitle: text("job_title"),
    tradeStatus: tradeStatusEnum("trade_status").default("PENDING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_email_idx").on(table.email),
    index("user_role_idx").on(table.role),
    index("user_trade_status_idx").on(table.tradeStatus),
  ],
);

export const session = pgTable(
  "session",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_idx").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// -----------------------------------------------------------------------------
// TAXONOMY TABLES: MATERIAL TYPES, FINISHES, APPLICATIONS
// -----------------------------------------------------------------------------

export const materialTypes = pgTable(
  "material_types",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("material_types_slug_idx").on(table.slug)],
);

export const finishes = pgTable(
  "finishes",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("finishes_slug_idx").on(table.slug)],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("applications_slug_idx").on(table.slug)],
);

// -----------------------------------------------------------------------------
// PRODUCTS, PRODUCT APPLICATIONS, PRODUCT IMAGES
// -----------------------------------------------------------------------------

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().unique(),
    description: text("description").notNull(),
    materialTypeId: uuid("material_type_id")
      .notNull()
      .references(() => materialTypes.id, { onDelete: "restrict" }),
    finishId: uuid("finish_id")
      .notNull()
      .references(() => finishes.id, { onDelete: "restrict" }),
    dimensionText: text("dimension_text").notNull(),
    widthMm: integer("width_mm"),
    heightMm: integer("height_mm"),
    thicknessMm: integer("thickness_mm"),
    moqValue: integer("moq_value").notNull(),
    moqUnit: text("moq_unit").notNull(),
    status: productStatusEnum("status").default("DRAFT").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdBy: uuid("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedBy: uuid("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_sku_idx").on(table.sku),
    index("products_status_idx").on(table.status),
    index("products_material_type_idx").on(table.materialTypeId),
    index("products_finish_idx").on(table.finishId),
    index("products_featured_idx").on(table.isFeatured),
    index("products_created_at_idx").on(table.createdAt),
  ],
);

export const productApplications = pgTable(
  "product_applications",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.applicationId] }),
    index("product_applications_product_idx").on(table.productId),
    index("product_applications_application_idx").on(table.applicationId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    width: integer("width").default(1200).notNull(),
    height: integer("height").default(900).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("product_images_product_idx").on(table.productId),
    index("product_images_primary_idx").on(table.productId, table.isPrimary),
  ],
);

// -----------------------------------------------------------------------------
// MOODBOARDS & MOODBOARD ITEMS
// -----------------------------------------------------------------------------

export const moodboards = pgTable(
  "moodboards",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("moodboards_user_idx").on(table.userId),
    index("moodboards_updated_at_idx").on(table.updatedAt),
  ],
);

export const moodboardItems = pgTable(
  "moodboard_items",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    moodboardId: uuid("moodboard_id")
      .notNull()
      .references(() => moodboards.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("moodboard_items_unique_product_idx").on(
      table.moodboardId,
      table.productId,
    ),
    index("moodboard_items_moodboard_idx").on(table.moodboardId),
    index("moodboard_items_product_idx").on(table.productId),
  ],
);

// -----------------------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

// -----------------------------------------------------------------------------
// DRIZZLE RELATIONS
// -----------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  moodboards: many(moodboards),
  auditLogs: many(auditLogs),
}));

export const materialTypesRelations = relations(materialTypes, ({ many }) => ({
  products: many(products),
}));

export const finishesRelations = relations(finishes, ({ many }) => ({
  products: many(products),
}));

export const applicationsRelations = relations(applications, ({ many }) => ({
  productApplications: many(productApplications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  materialType: one(materialTypes, {
    fields: [products.materialTypeId],
    references: [materialTypes.id],
  }),
  finish: one(finishes, {
    fields: [products.finishId],
    references: [finishes.id],
  }),
  productApplications: many(productApplications),
  images: many(productImages),
  moodboardItems: many(moodboardItems),
}));

export const productApplicationsRelations = relations(
  productApplications,
  ({ one }) => ({
    product: one(products, {
      fields: [productApplications.productId],
      references: [products.id],
    }),
    application: one(applications, {
      fields: [productApplications.applicationId],
      references: [applications.id],
    }),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const moodboardsRelations = relations(moodboards, ({ one, many }) => ({
  user: one(user, {
    fields: [moodboards.userId],
    references: [user.id],
  }),
  items: many(moodboardItems),
}));

export const moodboardItemsRelations = relations(moodboardItems, ({ one }) => ({
  moodboard: one(moodboards, {
    fields: [moodboardItems.moodboardId],
    references: [moodboards.id],
  }),
  product: one(products, {
    fields: [moodboardItems.productId],
    references: [products.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(user, {
    fields: [auditLogs.actorUserId],
    references: [user.id],
  }),
}));
