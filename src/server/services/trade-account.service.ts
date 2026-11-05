import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, type Database } from "@/db";
import { moodboards, products, user } from "@/db/schema";
import {
  updateProfileSchema,
  updateTradeAccountStatusSchema,
} from "@/server/validators";
import { AppError } from "@/lib/utils/api-response";
import { recordAuditLog, type AuditAction } from "./audit.service";
import type { TradeStatus } from "@/types";

export interface TradeAccountRecord {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  companyName: string;
  companyWebsite: string | null;
  jobTitle: string | null;
  tradeStatus: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

export function resolveTradeStatusAuditAction(
  previousStatus: TradeStatus,
  nextStatus: TradeStatus,
): AuditAction {
  if (nextStatus === "APPROVED" && previousStatus === "SUSPENDED") {
    return "TRADE_ACCOUNT_REACTIVATED";
  }
  if (nextStatus === "APPROVED") {
    return "TRADE_ACCOUNT_APPROVED";
  }
  if (nextStatus === "REJECTED") {
    return "TRADE_ACCOUNT_REJECTED";
  }
  if (nextStatus === "SUSPENDED") {
    return "TRADE_ACCOUNT_SUSPENDED";
  }
  return "TRADE_ACCOUNT_APPROVED";
}

export async function listTradeAccounts(options: {
  q?: string;
  status?: TradeStatus | "ALL";
} = {}): Promise<TradeAccountRecord[]> {
  const conditions: SQL[] = [eq(user.role, "MEMBER")];

  if (options.q && options.q.trim().length > 0) {
    const pattern = `%${options.q.trim()}%`;
    const searchCond = or(
      ilike(user.name, pattern),
      ilike(user.email, pattern),
      ilike(user.companyName, pattern),
    );
    if (searchCond) {
      conditions.push(searchCond);
    }
  }

  if (options.status && options.status !== "ALL") {
    conditions.push(eq(user.tradeStatus, options.status));
  }

  const rows = await db
    .select()
    .from(user)
    .where(and(...conditions))
    .orderBy(desc(user.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    companyName: row.companyName,
    companyWebsite: row.companyWebsite ?? null,
    jobTitle: row.jobTitle ?? null,
    tradeStatus: row.tradeStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function updateTradeAccountStatus(
  targetUserId: string,
  rawInput: unknown,
  actorUserId: string,
): Promise<TradeAccountRecord> {
  const input = updateTradeAccountStatusSchema.parse(rawInput);

  if (targetUserId === actorUserId) {
    throw new AppError(
      "SELF_STATUS_MODIFICATION_FORBIDDEN",
      "You cannot modify your own trade account approval status.",
      403,
    );
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(user.id, targetUserId),
  });

  if (!targetUser) {
    throw new AppError("USER_NOT_FOUND", "Trade account not found.", 404);
  }

  if (targetUser.role === "ADMIN") {
    throw new AppError(
      "CANNOT_MODIFY_ADMIN_STATUS",
      "Administrator accounts cannot be modified through trade account workflows.",
      403,
    );
  }

  const auditAction = resolveTradeStatusAuditAction(
    targetUser.tradeStatus,
    input.status,
  );

  const [updated] = await db.transaction(async (tx) => {
    const rows = await tx
      .update(user)
      .set({
        tradeStatus: input.status,
        updatedAt: new Date(),
      })
      .where(eq(user.id, targetUserId))
      .returning();

    await recordAuditLog(
      {
        actorUserId,
        action: auditAction,
        entityType: "USER",
        entityId: targetUserId,
        metadata: {
          email: targetUser.email,
          companyName: targetUser.companyName,
          previousStatus: targetUser.tradeStatus,
          newStatus: input.status,
          ...(input.reason ? { reason: input.reason } : {}),
        },
      },
      tx as unknown as Database,
    );

    return rows;
  });

  if (!updated) {
    throw new AppError("UPDATE_FAILED", "Failed to update account status.", 500);
  }

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    companyName: updated.companyName,
    companyWebsite: updated.companyWebsite ?? null,
    jobTitle: updated.jobTitle ?? null,
    tradeStatus: updated.tradeStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function updateMemberProfile(
  userId: string,
  rawInput: unknown,
): Promise<TradeAccountRecord> {
  const input = updateProfileSchema.parse(rawInput);

  const [updated] = await db
    .update(user)
    .set({
      name: input.name,
      companyName: input.companyName,
      companyWebsite: input.companyWebsite ?? null,
      jobTitle: input.jobTitle ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  if (!updated) {
    throw new AppError("USER_NOT_FOUND", "User account not found.", 404);
  }

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    companyName: updated.companyName,
    companyWebsite: updated.companyWebsite ?? null,
    jobTitle: updated.jobTitle ?? null,
    tradeStatus: updated.tradeStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export interface AdminDashboardMetrics {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  pendingTradeAccounts: number;
  approvedTradeAccounts: number;
  totalMoodboards: number;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [
    totalProdRes,
    pubProdRes,
    draftProdRes,
    archProdRes,
    pendingAccRes,
    approvedAccRes,
    moodboardRes,
  ] = await Promise.all([
    db.select({ c: count() }).from(products),
    db
      .select({ c: count() })
      .from(products)
      .where(eq(products.status, "PUBLISHED")),
    db
      .select({ c: count() })
      .from(products)
      .where(eq(products.status, "DRAFT")),
    db
      .select({ c: count() })
      .from(products)
      .where(eq(products.status, "ARCHIVED")),
    db
      .select({ c: count() })
      .from(user)
      .where(and(eq(user.role, "MEMBER"), eq(user.tradeStatus, "PENDING"))),
    db
      .select({ c: count() })
      .from(user)
      .where(and(eq(user.role, "MEMBER"), eq(user.tradeStatus, "APPROVED"))),
    db.select({ c: count() }).from(moodboards),
  ]);

  return {
    totalProducts: Number(totalProdRes[0]?.c ?? 0),
    publishedProducts: Number(pubProdRes[0]?.c ?? 0),
    draftProducts: Number(draftProdRes[0]?.c ?? 0),
    archivedProducts: Number(archProdRes[0]?.c ?? 0),
    pendingTradeAccounts: Number(pendingAccRes[0]?.c ?? 0),
    approvedTradeAccounts: Number(approvedAccRes[0]?.c ?? 0),
    totalMoodboards: Number(moodboardRes[0]?.c ?? 0),
  };
}
