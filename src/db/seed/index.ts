import "dotenv/config";
import { eq, like, or } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  applications,
  finishes,
  materialTypes,
  moodboardItems,
  moodboards,
  productApplications,
  productImages,
  products,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  buildArchitecturalSwatchDataUrl,
  SEED_APPLICATIONS,
  SEED_FINISHES,
  SEED_MATERIAL_TYPES,
  SEED_PRODUCTS,
} from "./data";

export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@materialhub.arch",
    password: "AdminPassword123!",
    name: "Elena Vance",
    companyName: "MaterialHub Architectural Curators",
    companyWebsite: "https://materialhub.arch",
    jobTitle: "Principal Materials Director",
    role: "ADMIN" as const,
    tradeStatus: "APPROVED" as const,
  },
  approvedMemberOne: {
    email: "architect@atelier-nord.arch",
    password: "TradePassword123!",
    name: "Marcus Lindqvist",
    companyName: "Atelier Nord Architecture",
    companyWebsite: "https://atelier-nord.arch",
    jobTitle: "Senior Specification Architect",
    role: "MEMBER" as const,
    tradeStatus: "APPROVED" as const,
  },
  approvedMemberTwo: {
    email: "studio@kengo-interiors.arch",
    password: "TradePassword123!",
    name: "Sora Takahashi",
    companyName: "Takahashi Spatial Design",
    companyWebsite: "https://kengo-interiors.arch",
    jobTitle: "Lead Interior Partner",
    role: "MEMBER" as const,
    tradeStatus: "APPROVED" as const,
  },
  pendingMember: {
    email: "pending@veritas-build.arch",
    password: "TradePassword123!",
    name: "Julian Sterling",
    companyName: "Veritas Property Development",
    companyWebsite: "https://veritas-build.arch",
    jobTitle: "Procurement Manager",
    role: "MEMBER" as const,
    tradeStatus: "PENDING" as const,
  },
};

async function ensureDemoUser(accountConfig: {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companyWebsite: string;
  jobTitle: string;
  role: "ADMIN" | "MEMBER";
  tradeStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}): Promise<string> {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, accountConfig.email),
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email: accountConfig.email,
        password: accountConfig.password,
        name: accountConfig.name,
        companyName: accountConfig.companyName,
        companyWebsite: accountConfig.companyWebsite,
        jobTitle: accountConfig.jobTitle,
      },
    });
  }

  const [updated] = await db
    .update(user)
    .set({
      name: accountConfig.name,
      companyName: accountConfig.companyName,
      companyWebsite: accountConfig.companyWebsite,
      jobTitle: accountConfig.jobTitle,
      role: accountConfig.role,
      tradeStatus: accountConfig.tradeStatus,
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.email, accountConfig.email))
    .returning();

  if (!updated) {
    throw new Error(`Failed to provision seed user ${accountConfig.email}`);
  }

  return updated.id;
}

export async function seedDatabase(): Promise<void> {
  console.log("Seeding MaterialHub database...");

  // Clean up any automated E2E test artifacts
  await db
    .delete(products)
    .where(or(like(products.sku, "MH-E2E-%"), like(products.sku, "MH-CSV-%")));
  await db.delete(user).where(like(user.email, "e2e.architect.%"));

  // 1. Ensure Demo Accounts
  const adminId = await ensureDemoUser(DEMO_ACCOUNTS.admin);
  const memberOneId = await ensureDemoUser(DEMO_ACCOUNTS.approvedMemberOne);
  const memberTwoId = await ensureDemoUser(DEMO_ACCOUNTS.approvedMemberTwo);
  await ensureDemoUser(DEMO_ACCOUNTS.pendingMember);

  // 2. Seed Material Types
  const materialIdBySlug = new Map<string, string>();
  for (const item of SEED_MATERIAL_TYPES) {
    const existing = await db.query.materialTypes.findFirst({
      where: eq(materialTypes.slug, item.slug),
    });

    if (existing) {
      await db
        .update(materialTypes)
        .set({
          name: item.name,
          description: item.description,
          updatedAt: new Date(),
        })
        .where(eq(materialTypes.id, existing.id));
      materialIdBySlug.set(item.slug, existing.id);
    } else {
      const [inserted] = await db
        .insert(materialTypes)
        .values(item)
        .returning();
      if (inserted) {
        materialIdBySlug.set(item.slug, inserted.id);
      }
    }
  }

  // 3. Seed Finishes
  const finishIdBySlug = new Map<string, string>();
  for (const item of SEED_FINISHES) {
    const existing = await db.query.finishes.findFirst({
      where: eq(finishes.slug, item.slug),
    });

    if (existing) {
      await db
        .update(finishes)
        .set({
          name: item.name,
          description: item.description,
          updatedAt: new Date(),
        })
        .where(eq(finishes.id, existing.id));
      finishIdBySlug.set(item.slug, existing.id);
    } else {
      const [inserted] = await db.insert(finishes).values(item).returning();
      if (inserted) {
        finishIdBySlug.set(item.slug, inserted.id);
      }
    }
  }

  // 4. Seed Applications
  const appIdBySlug = new Map<string, string>();
  for (const item of SEED_APPLICATIONS) {
    const existing = await db.query.applications.findFirst({
      where: eq(applications.slug, item.slug),
    });

    if (existing) {
      await db
        .update(applications)
        .set({
          name: item.name,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, existing.id));
      appIdBySlug.set(item.slug, existing.id);
    } else {
      const [inserted] = await db.insert(applications).values(item).returning();
      if (inserted) {
        appIdBySlug.set(item.slug, inserted.id);
      }
    }
  }

  // 5. Seed 41 Architectural Products
  const productIdBySku = new Map<string, string>();
  for (const prod of SEED_PRODUCTS) {
    const materialTypeId = materialIdBySlug.get(prod.materialSlug);
    const finishId = finishIdBySlug.get(prod.finishSlug);
    if (!materialTypeId || !finishId) {
      throw new Error(`Missing taxonomy for product ${prod.sku}`);
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.sku, prod.sku),
    });

    let productId: string;
    if (existing) {
      await db
        .update(products)
        .set({
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          materialTypeId,
          finishId,
          dimensionText: prod.dimensionText,
          widthMm: prod.widthMm,
          heightMm: prod.heightMm,
          thicknessMm: prod.thicknessMm,
          moqValue: prod.moqValue,
          moqUnit: prod.moqUnit,
          status: prod.status,
          isFeatured: prod.isFeatured,
          updatedBy: adminId,
          archivedAt: prod.status === "ARCHIVED" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id));
      productId = existing.id;
    } else {
      const [inserted] = await db
        .insert(products)
        .values({
          sku: prod.sku,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          materialTypeId,
          finishId,
          dimensionText: prod.dimensionText,
          widthMm: prod.widthMm,
          heightMm: prod.heightMm,
          thicknessMm: prod.thicknessMm,
          moqValue: prod.moqValue,
          moqUnit: prod.moqUnit,
          status: prod.status,
          isFeatured: prod.isFeatured,
          createdBy: adminId,
          updatedBy: adminId,
          archivedAt: prod.status === "ARCHIVED" ? new Date() : null,
        })
        .returning();

      if (!inserted) {
        throw new Error(`Failed to insert product ${prod.sku}`);
      }
      productId = inserted.id;
    }

    productIdBySku.set(prod.sku, productId);

    // Sync Product Applications
    await db
      .delete(productApplications)
      .where(eq(productApplications.productId, productId));

    const appIds = prod.applicationSlugs
      .map((s) => appIdBySlug.get(s))
      .filter((v): v is string => Boolean(v));

    if (appIds.length > 0) {
      await db.insert(productApplications).values(
        appIds.map((applicationId) => ({
          productId,
          applicationId,
        })),
      );
    }

    // Sync Product Images (2 images per product: Primary Swatch + Detail Texture)
    await db
      .delete(productImages)
      .where(eq(productImages.productId, productId));

    const primaryUrl = buildArchitecturalSwatchDataUrl(
      prod.sku,
      prod.materialSlug,
      prod.primaryColorHex,
      prod.secondaryColorHex,
      "primary",
    );
    const detailUrl = buildArchitecturalSwatchDataUrl(
      prod.sku,
      prod.materialSlug,
      prod.primaryColorHex,
      prod.secondaryColorHex,
      "detail",
    );

    await db.insert(productImages).values([
      {
        productId,
        storageKey: `seed/${prod.slug}-primary.svg`,
        imageUrl: primaryUrl,
        altText: `${prod.name} primary surface elevation swatch`,
        isPrimary: true,
        sortOrder: 0,
        width: 1200,
        height: 900,
      },
      {
        productId,
        storageKey: `seed/${prod.slug}-detail.svg`,
        imageUrl: detailUrl,
        altText: `${prod.name} macro texture and edge profile detail`,
        isPrimary: false,
        sortOrder: 1,
        width: 1200,
        height: 900,
      },
    ]);
  }

  // 6. Seed Sample Moodboards for Approved Members
  const sampleBoards = [
    {
      userId: memberOneId,
      name: "Nordic Civic Museum Atrium",
      description:
        "Warm limestone, acoustic ash slats, and champagne anodized metal palette for the main public concourse.",
      skus: ["MH-STN-001", "MH-TMB-002", "MH-MTL-001", "MH-GLS-001"],
    },
    {
      userId: memberOneId,
      name: "Waterfront Thermal Spa & Pavilion",
      description:
        "Slip-resistant serpentinite, basaltina slabs, and charred cypress cladding for wet zones and exterior decks.",
      skus: ["MH-STN-002", "MH-STN-006", "MH-TMB-003", "MH-CER-004"],
    },
    {
      userId: memberTwoId,
      name: "Kyoto Flagship Retail Gallery",
      description:
        "Tactile celadon stoneware, phosphor bronze portals, and laminated mesh partitions.",
      skus: ["MH-CER-003", "MH-MTL-002", "MH-GLS-002", "MH-TMB-004"],
    },
  ];

  for (const boardDef of sampleBoards) {
    const existingBoards = await db
      .select()
      .from(moodboards)
      .where(eq(moodboards.userId, boardDef.userId));

    const match = existingBoards.find((b) => b.name === boardDef.name);
    let boardId: string;

    if (match) {
      await db
        .update(moodboards)
        .set({
          description: boardDef.description,
          updatedAt: new Date(),
        })
        .where(eq(moodboards.id, match.id));
      boardId = match.id;
    } else {
      const [created] = await db
        .insert(moodboards)
        .values({
          userId: boardDef.userId,
          name: boardDef.name,
          description: boardDef.description,
        })
        .returning();
      if (!created) continue;
      boardId = created.id;
    }

    await db
      .delete(moodboardItems)
      .where(eq(moodboardItems.moodboardId, boardId));

    const validProductIds = boardDef.skus
      .map((sku) => productIdBySku.get(sku))
      .filter((v): v is string => Boolean(v));

    if (validProductIds.length > 0) {
      await db.insert(moodboardItems).values(
        validProductIds.map((productId, idx) => ({
          moodboardId: boardId,
          productId,
          sortOrder: idx,
        })),
      );
    }
  }

  console.log(
    `Seed completed: ${SEED_MATERIAL_TYPES.length} materials, ${SEED_FINISHES.length} finishes, ${SEED_APPLICATIONS.length} applications, ${SEED_PRODUCTS.length} products, 4 demo accounts, and 3 sample moodboards.`,
  );
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Failed to seed database:", error);
      await pool.end();
      process.exit(1);
    });
}
