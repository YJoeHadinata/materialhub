import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, finishes, materialTypes } from "@/db/schema";
import { taxonomyItemSchema } from "@/server/validators";
import { AppError } from "@/lib/utils/api-response";
import { recordAuditLog } from "./audit.service";

export async function listMaterialTypes() {
  return db
    .select()
    .from(materialTypes)
    .orderBy(asc(materialTypes.name));
}

export async function listFinishes() {
  return db
    .select()
    .from(finishes)
    .orderBy(asc(finishes.name));
}

export async function listApplications() {
  return db
    .select()
    .from(applications)
    .orderBy(asc(applications.name));
}

export async function getAllTaxonomies() {
  const [materials, finishList, applicationList] = await Promise.all([
    listMaterialTypes(),
    listFinishes(),
    listApplications(),
  ]);

  return {
    materialTypes: materials,
    finishes: finishList,
    applications: applicationList,
  };
}

export async function createMaterialType(
  rawInput: unknown,
  actorUserId: string,
) {
  const input = taxonomyItemSchema.parse(rawInput);

  const existing = await db.query.materialTypes.findFirst({
    where: eq(materialTypes.slug, input.slug),
  });

  if (existing) {
    throw new AppError(
      "DUPLICATE_SLUG",
      `Material type with slug "${input.slug}" already exists.`,
      409,
    );
  }

  const [created] = await db
    .insert(materialTypes)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
    })
    .returning();

  if (!created) {
    throw new AppError("CREATE_FAILED", "Failed to create material type.", 500);
  }

  await recordAuditLog({
    actorUserId,
    action: "CATEGORY_CREATED",
    entityType: "TAXONOMY",
    entityId: created.id,
    metadata: { taxonomy: "material_type", name: created.name, slug: created.slug },
  });

  return created;
}

export async function createFinish(rawInput: unknown, actorUserId: string) {
  const input = taxonomyItemSchema.parse(rawInput);

  const existing = await db.query.finishes.findFirst({
    where: eq(finishes.slug, input.slug),
  });

  if (existing) {
    throw new AppError(
      "DUPLICATE_SLUG",
      `Finish with slug "${input.slug}" already exists.`,
      409,
    );
  }

  const [created] = await db
    .insert(finishes)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
    })
    .returning();

  if (!created) {
    throw new AppError("CREATE_FAILED", "Failed to create finish.", 500);
  }

  await recordAuditLog({
    actorUserId,
    action: "CATEGORY_CREATED",
    entityType: "TAXONOMY",
    entityId: created.id,
    metadata: { taxonomy: "finish", name: created.name, slug: created.slug },
  });

  return created;
}

export async function createApplication(
  rawInput: unknown,
  actorUserId: string,
) {
  const input = taxonomyItemSchema.parse(rawInput);

  const existing = await db.query.applications.findFirst({
    where: eq(applications.slug, input.slug),
  });

  if (existing) {
    throw new AppError(
      "DUPLICATE_SLUG",
      `Application with slug "${input.slug}" already exists.`,
      409,
    );
  }

  const [created] = await db
    .insert(applications)
    .values({
      name: input.name,
      slug: input.slug,
    })
    .returning();

  if (!created) {
    throw new AppError("CREATE_FAILED", "Failed to create application.", 500);
  }

  await recordAuditLog({
    actorUserId,
    action: "CATEGORY_CREATED",
    entityType: "TAXONOMY",
    entityId: created.id,
    metadata: { taxonomy: "application", name: created.name, slug: created.slug },
  });

  return created;
}
