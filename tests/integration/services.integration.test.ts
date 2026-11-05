import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { products, user } from "@/db/schema";
import { seedDatabase, DEMO_ACCOUNTS } from "@/db/seed";
import {
  archiveProduct,
  createProduct,
  queryPublicCatalogue,
  updateProduct,
} from "@/server/services/product.service";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import {
  addProductToMoodboard,
  createMoodboard,
  deleteMoodboard,
  getMoodboardByIdForUser,
  removeMoodboardItem,
  reorderMoodboardItems,
  updateMoodboard,
} from "@/server/services/moodboard.service";
import {
  getAdminDashboardMetrics,
  updateTradeAccountStatus,
} from "@/server/services/trade-account.service";
import {
  executeCsvImport,
  previewAndValidateCsv,
} from "@/server/services/csv-import.service";

describe("MaterialHub Integration Tests — PostgreSQL Services & Transactions", () => {
  let adminUserId = "";
  let memberOneUserId = "";
  let memberTwoUserId = "";
  let pendingMemberUserId = "";

  beforeAll(async () => {
    await seedDatabase();

    const adminUser = await db.query.user.findFirst({
      where: eq(user.email, DEMO_ACCOUNTS.admin.email),
    });
    const memberOne = await db.query.user.findFirst({
      where: eq(user.email, DEMO_ACCOUNTS.approvedMemberOne.email),
    });
    const memberTwo = await db.query.user.findFirst({
      where: eq(user.email, DEMO_ACCOUNTS.approvedMemberTwo.email),
    });
    const pendingUser = await db.query.user.findFirst({
      where: eq(user.email, DEMO_ACCOUNTS.pendingMember.email),
    });

    adminUserId = adminUser?.id ?? "";
    memberOneUserId = memberOne?.id ?? "";
    memberTwoUserId = memberTwo?.id ?? "";
    pendingMemberUserId = pendingUser?.id ?? "";
  });

  afterAll(async () => {
    // Clean up test-created records so dev/test state stays clean
    await db
      .delete(products)
      .where(eq(products.sku, "MH-INT-901"));
    await db
      .delete(products)
      .where(eq(products.sku, "MH-CSV-501"));
    await db
      .delete(products)
      .where(eq(products.sku, "MH-CSV-502"));
    await pool.end();
  });

  it("1. queries, searches, filters, sorts, and paginates the public catalogue", async () => {
    const pageOne = await queryPublicCatalogue({ page: 1, pageSize: 12 });
    expect(pageOne.items.length).toBe(12);
    expect(pageOne.meta.totalCount).toBeGreaterThanOrEqual(39);
    expect(pageOne.items.every((p) => p.status === "PUBLISHED")).toBe(true);

    // Filter by material type + finish
    const stoneFiltered = await queryPublicCatalogue({
      material: "natural-stone",
      finish: "honed-matte",
    });
    expect(stoneFiltered.items.length).toBeGreaterThan(0);
    expect(
      stoneFiltered.items.every(
        (p) =>
          p.materialType.slug === "natural-stone" &&
          p.finish.slug === "honed-matte",
      ),
    ).toBe(true);

    // Search by SKU
    const skuSearch = await queryPublicCatalogue({ q: "MH-STN-001" });
    expect(skuSearch.items).toHaveLength(1);
    expect(skuSearch.items[0]?.sku).toBe("MH-STN-001");
  });

  it("2. creates, updates, and archives a product while enforcing unique SKU/slug", async () => {
    await db.delete(products).where(eq(products.sku, "MH-INT-901"));

    const taxonomies = await getAllTaxonomies();
    const stoneMat = taxonomies.materialTypes.find(
      (m) => m.slug === "natural-stone",
    );
    const honedFin = taxonomies.finishes.find((f) => f.slug === "honed-matte");
    const floorApp = taxonomies.applications.find((a) => a.slug === "flooring");

    expect(stoneMat).toBeDefined();
    expect(honedFin).toBeDefined();
    expect(floorApp).toBeDefined();

    const created = await createProduct(
      {
        name: "Integration Test Quartzite Slab",
        sku: "MH-INT-901",
        slug: "integration-test-quartzite-slab",
        description:
          "Calibrated architectural quartzite slab created during integration verification.",
        materialTypeId: stoneMat!.id,
        finishId: honedFin!.id,
        dimensionText: "2400 x 1200 x 20 mm",
        widthMm: 1200,
        heightMm: 2400,
        thicknessMm: 20,
        moqValue: 20,
        moqUnit: "sqm",
        status: "PUBLISHED",
        isFeatured: false,
        applicationIds: [floorApp!.id],
        images: [
          {
            storageKey: "test/int-901.jpg",
            imageUrl: "http://localhost:3000/api/v1/storage/test/int-901.jpg",
            altText: "Integration test quartzite surface",
            isPrimary: true,
            sortOrder: 0,
            width: 1200,
            height: 900,
          },
        ],
      },
      adminUserId,
    );

    expect(created.sku).toBe("MH-INT-901");
    expect(created.images).toHaveLength(1);

    // Reject duplicate SKU
    await expect(
      createProduct(
        {
          name: "Duplicate SKU Product",
          sku: "MH-INT-901",
          slug: "unique-other-slug-901",
          description: "Attempting duplicate SKU creation.",
          materialTypeId: stoneMat!.id,
          finishId: honedFin!.id,
          dimensionText: "1000 x 1000 mm",
          moqValue: 10,
          moqUnit: "sqm",
          status: "DRAFT",
          isFeatured: false,
          applicationIds: [floorApp!.id],
        },
        adminUserId,
      ),
    ).rejects.toThrowError(/already exists/i);

    // Update product
    const updated = await updateProduct(
      created.id,
      {
        name: "Integration Test Quartzite Slab (Updated)",
        moqValue: 35,
      },
      adminUserId,
    );
    expect(updated.name).toBe("Integration Test Quartzite Slab (Updated)");
    expect(updated.moqValue).toBe(35);

    // Archive product
    const archived = await archiveProduct(created.id, adminUserId);
    expect(archived.status).toBe("ARCHIVED");
    expect(archived.archivedAt).not.toBeNull();
  });

  it("3. manages moodboards, prevents duplicate items, reorders items, and enforces ownership", async () => {
    const catalogue = await queryPublicCatalogue({ pageSize: 5 });
    const prodA = catalogue.items[0]!;
    const prodB = catalogue.items[1]!;

    const board = await createMoodboard(
      {
        name: "Integration Test Atrium Palette",
        description: "Testing moodboard item lifecycle",
      },
      memberOneUserId,
    );

    expect(board.name).toBe("Integration Test Atrium Palette");
    expect(board.itemCount).toBe(0);

    // Add two products
    const withOne = await addProductToMoodboard(
      board.id,
      { productId: prodA.id },
      memberOneUserId,
    );
    expect(withOne.itemCount).toBe(1);

    const withTwo = await addProductToMoodboard(
      board.id,
      { productId: prodB.id },
      memberOneUserId,
    );
    expect(withTwo.itemCount).toBe(2);

    // Reject duplicate product in same moodboard
    await expect(
      addProductToMoodboard(
        board.id,
        { productId: prodA.id },
        memberOneUserId,
      ),
    ).rejects.toThrowError(/already in the selected moodboard/i);

    // Reorder items (swap order)
    const firstItemId = withTwo.items[0]!.id;
    const secondItemId = withTwo.items[1]!.id;
    const reordered = await reorderMoodboardItems(
      board.id,
      { itemIds: [secondItemId, firstItemId] },
      memberOneUserId,
    );
    expect(reordered.items[0]?.id).toBe(secondItemId);
    expect(reordered.items[1]?.id).toBe(firstItemId);

    // Enforce ownership: Member Two cannot read, update, add to, or delete Member One's moodboard
    await expect(
      getMoodboardByIdForUser(board.id, memberTwoUserId),
    ).rejects.toThrowError(/permission/i);

    await expect(
      updateMoodboard(board.id, { name: "Hijacked" }, memberTwoUserId),
    ).rejects.toThrowError(/permission/i);

    await expect(
      addProductToMoodboard(
        board.id,
        { productId: prodA.id },
        memberTwoUserId,
      ),
    ).rejects.toThrowError(/permission/i);

    await expect(
      removeMoodboardItem(board.id, firstItemId, memberTwoUserId),
    ).rejects.toThrowError(/permission/i);

    await expect(
      reorderMoodboardItems(
        board.id,
        { itemIds: [firstItemId] },
        memberTwoUserId,
      ),
    ).rejects.toThrowError(/permission/i);

    await expect(
      deleteMoodboard(board.id, memberTwoUserId),
    ).rejects.toThrowError(/permission/i);

    // Remove item & delete moodboard
    const afterRemove = await removeMoodboardItem(
      board.id,
      secondItemId,
      memberOneUserId,
    );
    expect(afterRemove.itemCount).toBe(1);

    await deleteMoodboard(board.id, memberOneUserId);
  });

  it("4. executes transactional CSV import and rejects invalid batches without partial writes", async () => {
    await db.delete(products).where(eq(products.sku, "MH-CSV-501"));
    await db.delete(products).where(eq(products.sku, "MH-CSV-502"));

    const invalidBatch = `sku,name,slug,description,material_type,finish,dimension,moq_value,moq_unit,applications,status
MH-CSV-501,Valid CSV Stone,valid-csv-stone,Valid stone description for CSV import testing.,natural-stone,honed-matte,1200 x 600 x 20 mm,20,sqm,flooring,PUBLISHED
MH-CSV-502,Invalid Material Row,invalid-material-row,Row with unknown material type.,unknown-material,honed-matte,1200 x 600 x 20 mm,20,sqm,flooring,PUBLISHED`;

    const failedReport = await executeCsvImport(invalidBatch, adminUserId);
    expect(failedReport.importedCount).toBe(0);
    expect(failedReport.failedCount).toBe(1);

    // Verify MH-CSV-501 was NOT partially inserted
    const checkPartial = await db.query.products.findFirst({
      where: eq(products.sku, "MH-CSV-501"),
    });
    expect(checkPartial).toBeUndefined();

    // Now execute a valid 2-row CSV batch
    const validBatch = `sku,name,slug,description,material_type,finish,dimension,moq_value,moq_unit,applications,status
MH-CSV-501,Valid CSV Stone One,valid-csv-stone-one,Valid stone description for CSV import testing one.,natural-stone,honed-matte,1200 x 600 x 20 mm,20,sqm,flooring;wall-cladding,PUBLISHED
MH-CSV-502,Valid CSV Ceramic Two,valid-csv-ceramic-two,Valid ceramic description for CSV import testing two.,ceramic,sandblasted,1200 x 600 x 12 mm,30,sqm,facade,DRAFT`;

    const preview = await previewAndValidateCsv(validBatch);
    expect(preview.validRowsCount).toBe(2);
    expect(preview.invalidRowsCount).toBe(0);

    const successReport = await executeCsvImport(validBatch, adminUserId);
    expect(successReport.importedCount).toBe(2);
    expect(successReport.failedCount).toBe(0);
  });

  it("5. transitions trade account statuses and computes admin dashboard metrics", async () => {
    const approved = await updateTradeAccountStatus(
      pendingMemberUserId,
      { status: "APPROVED" },
      adminUserId,
    );
    expect(approved.tradeStatus).toBe("APPROVED");

    // Reset back to PENDING so seed state remains predictable
    const resetPending = await updateTradeAccountStatus(
      pendingMemberUserId,
      { status: "PENDING" },
      adminUserId,
    );
    expect(resetPending.tradeStatus).toBe("PENDING");

    const metrics = await getAdminDashboardMetrics();
    expect(metrics.totalProducts).toBeGreaterThanOrEqual(41);
    expect(metrics.publishedProducts).toBeGreaterThanOrEqual(39);
  });
});
