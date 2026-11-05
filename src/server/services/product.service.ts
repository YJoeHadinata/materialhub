import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import { db, type Database } from "@/db";
import {
  applications,
  finishes,
  materialTypes,
  productApplications,
  productImages,
  products,
} from "@/db/schema";
import {
  catalogueQuerySchema,
  createProductSchema,
  updateProductSchema,
  type CatalogueQueryInput,
} from "@/server/validators";
import { AppError } from "@/lib/utils/api-response";
import { recordAuditLog } from "./audit.service";
import type { PaginationMeta, ProductListItem, ProductStatus } from "@/types";

async function hydrateProductListItems(
  productRows: Array<typeof products.$inferSelect>,
  tx: Database = db,
): Promise<ProductListItem[]> {
  if (productRows.length === 0) {
    return [];
  }

  const productIds = productRows.map((p) => p.id);
  const materialTypeIds = Array.from(new Set(productRows.map((p) => p.materialTypeId)));
  const finishIds = Array.from(new Set(productRows.map((p) => p.finishId)));

  const [materials, finishList, appLinks, images] = await Promise.all([
    tx
      .select()
      .from(materialTypes)
      .where(inArray(materialTypes.id, materialTypeIds)),
    tx.select().from(finishes).where(inArray(finishes.id, finishIds)),
    tx
      .select({
        productId: productApplications.productId,
        id: applications.id,
        name: applications.name,
        slug: applications.slug,
      })
      .from(productApplications)
      .innerJoin(
        applications,
        eq(productApplications.applicationId, applications.id),
      )
      .where(inArray(productApplications.productId, productIds))
      .orderBy(asc(applications.name)),
    tx
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)),
  ]);

  const materialMap = new Map(materials.map((m) => [m.id, m]));
  const finishMap = new Map(finishList.map((f) => [f.id, f]));

  const appsByProduct = new Map<
    string,
    Array<{ id: string; name: string; slug: string }>
  >();
  for (const link of appLinks) {
    const existing = appsByProduct.get(link.productId) ?? [];
    existing.push({ id: link.id, name: link.name, slug: link.slug });
    appsByProduct.set(link.productId, existing);
  }

  const imagesByProduct = new Map<
    string,
    Array<typeof productImages.$inferSelect>
  >();
  for (const img of images) {
    const existing = imagesByProduct.get(img.productId) ?? [];
    existing.push(img);
    imagesByProduct.set(img.productId, existing);
  }

  return productRows.map((row) => {
    const material = materialMap.get(row.materialTypeId) ?? {
      id: row.materialTypeId,
      name: "Unknown Material",
      slug: "unknown",
    };
    const finish = finishMap.get(row.finishId) ?? {
      id: row.finishId,
      name: "Unknown Finish",
      slug: "unknown",
    };
    const prodImages = imagesByProduct.get(row.id) ?? [];
    const primary = prodImages.find((i) => i.isPrimary) ?? prodImages[0] ?? null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      description: row.description,
      dimensionText: row.dimensionText,
      widthMm: row.widthMm ?? null,
      heightMm: row.heightMm ?? null,
      thicknessMm: row.thicknessMm ?? null,
      moqValue: row.moqValue,
      moqUnit: row.moqUnit,
      status: row.status,
      isFeatured: row.isFeatured,
      materialType: {
        id: material.id,
        name: material.name,
        slug: material.slug,
      },
      finish: {
        id: finish.id,
        name: finish.name,
        slug: finish.slug,
      },
      applications: appsByProduct.get(row.id) ?? [],
      primaryImage: primary
        ? {
            id: primary.id,
            imageUrl: primary.imageUrl,
            altText: primary.altText,
            width: primary.width,
            height: primary.height,
          }
        : null,
      images: prodImages.map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        width: img.width,
        height: img.height,
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null,
    };
  });
}

export async function queryPublicCatalogue(rawQuery: Partial<CatalogueQueryInput> = {}): Promise<{
  items: ProductListItem[];
  meta: PaginationMeta;
  activeFilters: {
    q?: string;
    material?: string;
    finish?: string;
    application?: string;
    sort: string;
  };
}> {
  const query = catalogueQuerySchema.parse(rawQuery);
  const conditions: SQL[] = [eq(products.status, "PUBLISHED")];

  if (query.q) {
    const pattern = `%${query.q}%`;
    const searchCondition = or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
      ilike(products.description, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.material) {
    const mat = await db.query.materialTypes.findFirst({
      where: eq(materialTypes.slug, query.material),
    });
    if (!mat) {
      return {
        items: [],
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          totalCount: 0,
          totalPages: 0,
        },
        activeFilters: {
          q: query.q,
          material: query.material,
          finish: query.finish,
          application: query.application,
          sort: query.sort,
        },
      };
    }
    conditions.push(eq(products.materialTypeId, mat.id));
  }

  if (query.finish) {
    const fin = await db.query.finishes.findFirst({
      where: eq(finishes.slug, query.finish),
    });
    if (!fin) {
      return {
        items: [],
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          totalCount: 0,
          totalPages: 0,
        },
        activeFilters: {
          q: query.q,
          material: query.material,
          finish: query.finish,
          application: query.application,
          sort: query.sort,
        },
      };
    }
    conditions.push(eq(products.finishId, fin.id));
  }

  if (query.application) {
    const app = await db.query.applications.findFirst({
      where: eq(applications.slug, query.application),
    });
    if (!app) {
      return {
        items: [],
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          totalCount: 0,
          totalPages: 0,
        },
        activeFilters: {
          q: query.q,
          material: query.material,
          finish: query.finish,
          application: query.application,
          sort: query.sort,
        },
      };
    }
    const matchingLinks = await db
      .select({ productId: productApplications.productId })
      .from(productApplications)
      .where(eq(productApplications.applicationId, app.id));

    if (matchingLinks.length === 0) {
      return {
        items: [],
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          totalCount: 0,
          totalPages: 0,
        },
        activeFilters: {
          q: query.q,
          material: query.material,
          finish: query.finish,
          application: query.application,
          sort: query.sort,
        },
      };
    }
    conditions.push(
      inArray(
        products.id,
        matchingLinks.map((l) => l.productId),
      ),
    );
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ total: count() })
    .from(products)
    .where(whereClause);

  const totalCount = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(totalCount / query.pageSize);
  const offset = (query.page - 1) * query.pageSize;

  let orderByClauses: SQL[] = [
    desc(products.isFeatured),
    desc(products.createdAt),
  ];

  if (query.sort === "newest") {
    orderByClauses = [desc(products.createdAt), asc(products.name)];
  } else if (query.sort === "name_asc") {
    orderByClauses = [asc(products.name)];
  } else if (query.sort === "name_desc") {
    orderByClauses = [desc(products.name)];
  }

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(...orderByClauses)
    .limit(query.pageSize)
    .offset(offset);

  const items = await hydrateProductListItems(rows);

  return {
    items,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      totalCount,
      totalPages,
    },
    activeFilters: {
      q: query.q,
      material: query.material,
      finish: query.finish,
      application: query.application,
      sort: query.sort,
    },
  };
}

export async function getPublishedProductBySlug(slug: string): Promise<{
  product: ProductListItem;
  relatedProducts: ProductListItem[];
}> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "PUBLISHED")),
  });

  if (!row) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  const [hydrated] = await hydrateProductListItems([row]);
  if (!hydrated) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  const relatedRows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "PUBLISHED"),
        eq(products.materialTypeId, row.materialTypeId),
        ne(products.id, row.id),
      ),
    )
    .orderBy(desc(products.isFeatured), desc(products.createdAt))
    .limit(4);

  const relatedProducts = await hydrateProductListItems(relatedRows);

  return {
    product: hydrated,
    relatedProducts,
  };
}

export async function getFeaturedProducts(limit = 6): Promise<ProductListItem[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "PUBLISHED"), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  return hydrateProductListItems(rows);
}

export async function listAdminProducts(options: {
  q?: string;
  status?: ProductStatus | "ALL";
  materialTypeId?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ items: ProductListItem[]; meta: PaginationMeta }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 24));
  const conditions: SQL[] = [];

  if (options.q && options.q.trim().length > 0) {
    const pattern = `%${options.q.trim()}%`;
    const searchCond = or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
      ilike(products.slug, pattern),
    );
    if (searchCond) {
      conditions.push(searchCond);
    }
  }

  if (options.status && options.status !== "ALL") {
    conditions.push(eq(products.status, options.status));
  }

  if (options.materialTypeId) {
    conditions.push(eq(products.materialTypeId, options.materialTypeId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ total: count() })
    .from(products)
    .where(whereClause);

  const totalCount = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(desc(products.updatedAt))
    .limit(pageSize)
    .offset(offset);

  const items = await hydrateProductListItems(rows);

  return {
    items,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  };
}

export async function getAdminProductById(id: string): Promise<ProductListItem> {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  if (!row) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  const [hydrated] = await hydrateProductListItems([row]);
  if (!hydrated) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  return hydrated;
}

export async function createProduct(
  rawInput: unknown,
  actorUserId: string,
): Promise<ProductListItem> {
  const input = createProductSchema.parse(rawInput);

  const [existingSku, existingSlug] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.sku, input.sku) }),
    db.query.products.findFirst({ where: eq(products.slug, input.slug) }),
  ]);

  if (existingSku) {
    throw new AppError(
      "DUPLICATE_SKU",
      `A product with SKU "${input.sku}" already exists.`,
      409,
      { sku: [`SKU "${input.sku}" is already in use.`] },
    );
  }

  if (existingSlug) {
    throw new AppError(
      "DUPLICATE_SLUG",
      `A product with slug "${input.slug}" already exists.`,
      409,
      { slug: [`Slug "${input.slug}" is already in use.`] },
    );
  }

  const [material, finish, validApps] = await Promise.all([
    db.query.materialTypes.findFirst({
      where: eq(materialTypes.id, input.materialTypeId),
    }),
    db.query.finishes.findFirst({
      where: eq(finishes.id, input.finishId),
    }),
    db
      .select()
      .from(applications)
      .where(inArray(applications.id, input.applicationIds)),
  ]);

  if (!material) {
    throw new AppError(
      "INVALID_MATERIAL_TYPE",
      "The selected material type does not exist.",
      422,
      { materialTypeId: ["Invalid material type reference."] },
    );
  }

  if (!finish) {
    throw new AppError(
      "INVALID_FINISH",
      "The selected finish does not exist.",
      422,
      { finishId: ["Invalid finish reference."] },
    );
  }

  if (validApps.length !== new Set(input.applicationIds).size) {
    throw new AppError(
      "INVALID_APPLICATIONS",
      "One or more selected application references are invalid.",
      422,
      { applicationIds: ["Invalid application reference."] },
    );
  }

  const createdProductId = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(products)
      .values({
        name: input.name,
        sku: input.sku,
        slug: input.slug,
        description: input.description,
        materialTypeId: input.materialTypeId,
        finishId: input.finishId,
        dimensionText: input.dimensionText,
        widthMm: input.widthMm ?? null,
        heightMm: input.heightMm ?? null,
        thicknessMm: input.thicknessMm ?? null,
        moqValue: input.moqValue,
        moqUnit: input.moqUnit,
        status: input.status,
        isFeatured: input.isFeatured,
        createdBy: actorUserId,
        updatedBy: actorUserId,
        archivedAt: input.status === "ARCHIVED" ? new Date() : null,
      })
      .returning();

    if (!inserted) {
      throw new AppError("CREATE_FAILED", "Failed to create product.", 500);
    }

    const uniqueAppIds = Array.from(new Set(input.applicationIds));
    await tx.insert(productApplications).values(
      uniqueAppIds.map((applicationId) => ({
        productId: inserted.id,
        applicationId,
      })),
    );

    if (input.images && input.images.length > 0) {
      const hasPrimary = input.images.some((img) => img.isPrimary);
      await tx.insert(productImages).values(
        input.images.map((img, idx) => ({
          productId: inserted.id,
          storageKey: img.storageKey,
          imageUrl: img.imageUrl,
          altText: img.altText,
          isPrimary: hasPrimary ? img.isPrimary : idx === 0,
          sortOrder: img.sortOrder ?? idx,
          width: img.width ?? 1200,
          height: img.height ?? 900,
        })),
      );
    }

    await recordAuditLog(
      {
        actorUserId,
        action:
          input.status === "PUBLISHED" ? "PRODUCT_PUBLISHED" : "PRODUCT_CREATED",
        entityType: "PRODUCT",
        entityId: inserted.id,
        metadata: {
          sku: inserted.sku,
          slug: inserted.slug,
          status: inserted.status,
        },
      },
      tx as unknown as Database,
    );

    return inserted.id;
  });

  return getAdminProductById(createdProductId);
}

export async function updateProduct(
  productId: string,
  rawInput: unknown,
  actorUserId: string,
): Promise<ProductListItem> {
  const input = updateProductSchema.parse(rawInput);

  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!existing) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  if (input.sku && input.sku !== existing.sku) {
    const skuCollision = await db.query.products.findFirst({
      where: and(eq(products.sku, input.sku), ne(products.id, productId)),
    });
    if (skuCollision) {
      throw new AppError(
        "DUPLICATE_SKU",
        `SKU "${input.sku}" is already used by another product.`,
        409,
        { sku: [`SKU "${input.sku}" is already in use.`] },
      );
    }
  }

  if (input.slug && input.slug !== existing.slug) {
    const slugCollision = await db.query.products.findFirst({
      where: and(eq(products.slug, input.slug), ne(products.id, productId)),
    });
    if (slugCollision) {
      throw new AppError(
        "DUPLICATE_SLUG",
        `Slug "${input.slug}" is already used by another product.`,
        409,
        { slug: [`Slug "${input.slug}" is already in use.`] },
      );
    }
  }

  if (input.applicationIds) {
    const validApps = await db
      .select()
      .from(applications)
      .where(inArray(applications.id, input.applicationIds));
    if (validApps.length !== new Set(input.applicationIds).size) {
      throw new AppError(
        "INVALID_APPLICATIONS",
        "One or more application IDs are invalid.",
        422,
        { applicationIds: ["Invalid application reference."] },
      );
    }
  }

  await db.transaction(async (tx) => {
    const nextStatus = input.status ?? existing.status;
    const archivedAt =
      nextStatus === "ARCHIVED"
        ? (existing.archivedAt ?? new Date())
        : null;

    await tx
      .update(products)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.materialTypeId !== undefined
          ? { materialTypeId: input.materialTypeId }
          : {}),
        ...(input.finishId !== undefined ? { finishId: input.finishId } : {}),
        ...(input.dimensionText !== undefined
          ? { dimensionText: input.dimensionText }
          : {}),
        ...(input.widthMm !== undefined ? { widthMm: input.widthMm } : {}),
        ...(input.heightMm !== undefined ? { heightMm: input.heightMm } : {}),
        ...(input.thicknessMm !== undefined
          ? { thicknessMm: input.thicknessMm }
          : {}),
        ...(input.moqValue !== undefined ? { moqValue: input.moqValue } : {}),
        ...(input.moqUnit !== undefined ? { moqUnit: input.moqUnit } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.isFeatured !== undefined
          ? { isFeatured: input.isFeatured }
          : {}),
        updatedBy: actorUserId,
        archivedAt,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    if (input.applicationIds) {
      await tx
        .delete(productApplications)
        .where(eq(productApplications.productId, productId));

      const uniqueAppIds = Array.from(new Set(input.applicationIds));
      await tx.insert(productApplications).values(
        uniqueAppIds.map((applicationId) => ({
          productId,
          applicationId,
        })),
      );
    }

    if (input.images) {
      await tx
        .delete(productImages)
        .where(eq(productImages.productId, productId));

      if (input.images.length > 0) {
        const hasPrimary = input.images.some((img) => img.isPrimary);
        await tx.insert(productImages).values(
          input.images.map((img, idx) => ({
            productId,
            storageKey: img.storageKey,
            imageUrl: img.imageUrl,
            altText: img.altText,
            isPrimary: hasPrimary ? img.isPrimary : idx === 0,
            sortOrder: img.sortOrder ?? idx,
            width: img.width ?? 1200,
            height: img.height ?? 900,
          })),
        );
      }
    }

    const auditAction =
      input.status === "ARCHIVED" && existing.status !== "ARCHIVED"
        ? "PRODUCT_ARCHIVED"
        : input.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? "PRODUCT_PUBLISHED"
          : "PRODUCT_UPDATED";

    await recordAuditLog(
      {
        actorUserId,
        action: auditAction,
        entityType: "PRODUCT",
        entityId: productId,
        metadata: {
          sku: input.sku ?? existing.sku,
          previousStatus: existing.status,
          newStatus: nextStatus,
        },
      },
      tx as unknown as Database,
    );
  });

  return getAdminProductById(productId);
}

export async function archiveProduct(
  productId: string,
  actorUserId: string,
): Promise<ProductListItem> {
  const existing = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!existing) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        status: "ARCHIVED",
        archivedAt: new Date(),
        updatedBy: actorUserId,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    await recordAuditLog(
      {
        actorUserId,
        action: "PRODUCT_ARCHIVED",
        entityType: "PRODUCT",
        entityId: productId,
        metadata: {
          sku: existing.sku,
          previousStatus: existing.status,
        },
      },
      tx as unknown as Database,
    );
  });

  return getAdminProductById(productId);
}
