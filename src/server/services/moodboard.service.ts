import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  finishes,
  materialTypes,
  moodboardItems,
  moodboards,
  productImages,
  products,
} from "@/db/schema";
import {
  addMoodboardItemSchema,
  createMoodboardSchema,
  reorderMoodboardItemsSchema,
  updateMoodboardSchema,
} from "@/server/validators";
import { assertMoodboardOwnership } from "@/server/authorization";
import { AppError } from "@/lib/utils/api-response";

export interface MoodboardDetailItem {
  id: string;
  productId: string;
  sortOrder: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    dimensionText: string;
    moqValue: number;
    moqUnit: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    materialTypeName: string;
    finishName: string;
    primaryImageUrl: string | null;
    primaryImageAlt: string;
  };
}

export interface MoodboardSummary {
  id: string;
  userId: string;
  name: string;
  description: string;
  itemCount: number;
  previewImages: Array<{ imageUrl: string; altText: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface MoodboardDetail {
  id: string;
  userId: string;
  name: string;
  description: string;
  itemCount: number;
  items: MoodboardDetailItem[];
  createdAt: string;
  updatedAt: string;
}

export async function listUserMoodboards(
  userId: string,
): Promise<MoodboardSummary[]> {
  const userBoards = await db
    .select()
    .from(moodboards)
    .where(eq(moodboards.userId, userId))
    .orderBy(desc(moodboards.updatedAt));

  if (userBoards.length === 0) {
    return [];
  }

  const boardIds = userBoards.map((b) => b.id);
  const allItems = await db
    .select()
    .from(moodboardItems)
    .where(inArray(moodboardItems.moodboardId, boardIds))
    .orderBy(asc(moodboardItems.sortOrder));

  const productIds = Array.from(new Set(allItems.map((i) => i.productId)));
  const images =
    productIds.length > 0
      ? await db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
      : [];

  const primaryByProduct = new Map<
    string,
    { imageUrl: string; altText: string }
  >();
  for (const img of images) {
    if (!primaryByProduct.has(img.productId)) {
      primaryByProduct.set(img.productId, {
        imageUrl: img.imageUrl,
        altText: img.altText,
      });
    }
  }

  return userBoards.map((board) => {
    const boardItems = allItems.filter((i) => i.moodboardId === board.id);
    const previewImages = boardItems
      .map((item) => primaryByProduct.get(item.productId))
      .filter((v): v is { imageUrl: string; altText: string } => Boolean(v))
      .slice(0, 4);

    return {
      id: board.id,
      userId: board.userId,
      name: board.name,
      description: board.description,
      itemCount: boardItems.length,
      previewImages,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  });
}

export async function getMoodboardByIdForUser(
  moodboardId: string,
  userId: string,
): Promise<MoodboardDetail> {
  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  const items = await db
    .select()
    .from(moodboardItems)
    .where(eq(moodboardItems.moodboardId, board.id))
    .orderBy(asc(moodboardItems.sortOrder), asc(moodboardItems.createdAt));

  if (items.length === 0) {
    return {
      id: board.id,
      userId: board.userId,
      name: board.name,
      description: board.description,
      itemCount: 0,
      items: [],
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const [prodRows, matRows, finRows, imgRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    db.select().from(materialTypes),
    db.select().from(finishes),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)),
  ]);

  const prodMap = new Map(prodRows.map((p) => [p.id, p]));
  const matMap = new Map(matRows.map((m) => [m.id, m.name]));
  const finMap = new Map(finRows.map((f) => [f.id, f.name]));
  const imgMap = new Map<string, { url: string; alt: string }>();

  for (const img of imgRows) {
    if (!imgMap.has(img.productId)) {
      imgMap.set(img.productId, { url: img.imageUrl, alt: img.altText });
    }
  }

  const hydratedItems: MoodboardDetailItem[] = [];
  for (const item of items) {
    const prod = prodMap.get(item.productId);
    if (!prod) continue;
    const primaryImg = imgMap.get(prod.id);

    hydratedItems.push({
      id: item.id,
      productId: item.productId,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      product: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        dimensionText: prod.dimensionText,
        moqValue: prod.moqValue,
        moqUnit: prod.moqUnit,
        status: prod.status,
        materialTypeName: matMap.get(prod.materialTypeId) ?? "Material",
        finishName: finMap.get(prod.finishId) ?? "Finish",
        primaryImageUrl: primaryImg?.url ?? null,
        primaryImageAlt: primaryImg?.alt ?? prod.name,
      },
    });
  }

  return {
    id: board.id,
    userId: board.userId,
    name: board.name,
    description: board.description,
    itemCount: hydratedItems.length,
    items: hydratedItems,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
}

export async function createMoodboard(
  rawInput: unknown,
  userId: string,
): Promise<MoodboardDetail> {
  const input = createMoodboardSchema.parse(rawInput);

  const [created] = await db
    .insert(moodboards)
    .values({
      userId,
      name: input.name,
      description: input.description ?? "",
    })
    .returning();

  if (!created) {
    throw new AppError("CREATE_FAILED", "Failed to create moodboard.", 500);
  }

  return getMoodboardByIdForUser(created.id, userId);
}

export async function updateMoodboard(
  moodboardId: string,
  rawInput: unknown,
  userId: string,
): Promise<MoodboardDetail> {
  const input = updateMoodboardSchema.parse(rawInput);

  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  await db
    .update(moodboards)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(moodboards.id, moodboardId));

  return getMoodboardByIdForUser(moodboardId, userId);
}

export async function deleteMoodboard(
  moodboardId: string,
  userId: string,
): Promise<void> {
  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  await db.delete(moodboards).where(eq(moodboards.id, moodboardId));
}

export async function addProductToMoodboard(
  moodboardId: string,
  rawInput: unknown,
  userId: string,
): Promise<MoodboardDetail> {
  const { productId } = addMoodboardItemSchema.parse(rawInput);

  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) {
    throw new AppError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }

  if (product.status === "ARCHIVED") {
    throw new AppError(
      "PRODUCT_ARCHIVED",
      "Archived products cannot be newly added to a moodboard.",
      422,
    );
  }

  if (product.status !== "PUBLISHED") {
    throw new AppError(
      "PRODUCT_NOT_PUBLISHED",
      "Only published products can be added to a moodboard.",
      422,
    );
  }

  const existingItem = await db.query.moodboardItems.findFirst({
    where: and(
      eq(moodboardItems.moodboardId, moodboardId),
      eq(moodboardItems.productId, productId),
    ),
  });

  if (existingItem) {
    throw new AppError(
      "DUPLICATE_MOODBOARD_PRODUCT",
      "This product is already in the selected moodboard.",
      409,
    );
  }

  const currentItems = await db
    .select()
    .from(moodboardItems)
    .where(eq(moodboardItems.moodboardId, moodboardId));

  const nextSortOrder =
    currentItems.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

  await db.transaction(async (tx) => {
    await tx.insert(moodboardItems).values({
      moodboardId,
      productId,
      sortOrder: nextSortOrder,
    });

    await tx
      .update(moodboards)
      .set({ updatedAt: new Date() })
      .where(eq(moodboards.id, moodboardId));
  });

  return getMoodboardByIdForUser(moodboardId, userId);
}

export async function removeMoodboardItem(
  moodboardId: string,
  itemId: string,
  userId: string,
): Promise<MoodboardDetail> {
  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  const item = await db.query.moodboardItems.findFirst({
    where: and(
      eq(moodboardItems.id, itemId),
      eq(moodboardItems.moodboardId, moodboardId),
    ),
  });

  if (!item) {
    throw new AppError(
      "MOODBOARD_ITEM_NOT_FOUND",
      "Moodboard item not found.",
      404,
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(moodboardItems).where(eq(moodboardItems.id, itemId));
    await tx
      .update(moodboards)
      .set({ updatedAt: new Date() })
      .where(eq(moodboards.id, moodboardId));
  });

  return getMoodboardByIdForUser(moodboardId, userId);
}

export async function reorderMoodboardItems(
  moodboardId: string,
  rawInput: unknown,
  userId: string,
): Promise<MoodboardDetail> {
  const { itemIds } = reorderMoodboardItemsSchema.parse(rawInput);

  const board = await db.query.moodboards.findFirst({
    where: eq(moodboards.id, moodboardId),
  });

  if (!board) {
    throw new AppError("MOODBOARD_NOT_FOUND", "Moodboard not found.", 404);
  }

  assertMoodboardOwnership(board.userId, userId);

  const currentItems = await db
    .select()
    .from(moodboardItems)
    .where(eq(moodboardItems.moodboardId, moodboardId));

  const currentIds = new Set(currentItems.map((i) => i.id));
  for (const id of itemIds) {
    if (!currentIds.has(id)) {
      throw new AppError(
        "INVALID_MOODBOARD_ITEM",
        `Item "${id}" does not belong to this moodboard.`,
        422,
      );
    }
  }

  await db.transaction(async (tx) => {
    for (let idx = 0; idx < itemIds.length; idx++) {
      const id = itemIds[idx];
      if (!id) continue;
      await tx
        .update(moodboardItems)
        .set({ sortOrder: idx })
        .where(
          and(
            eq(moodboardItems.id, id),
            eq(moodboardItems.moodboardId, moodboardId),
          ),
        );
    }

    await tx
      .update(moodboards)
      .set({ updatedAt: new Date() })
      .where(eq(moodboards.id, moodboardId));
  });

  return getMoodboardByIdForUser(moodboardId, userId);
}
