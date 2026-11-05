import { desc } from "drizzle-orm";
import { db, type Database } from "@/db";
import { auditLogs, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AuditAction =
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_PUBLISHED"
  | "PRODUCT_ARCHIVED"
  | "TRADE_ACCOUNT_APPROVED"
  | "TRADE_ACCOUNT_REJECTED"
  | "TRADE_ACCOUNT_SUSPENDED"
  | "TRADE_ACCOUNT_REACTIVATED"
  | "CSV_IMPORT_COMPLETED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED";

export interface CreateAuditLogInput {
  actorUserId: string | null;
  action: AuditAction;
  entityType: "PRODUCT" | "USER" | "CSV_IMPORT" | "TAXONOMY";
  entityId: string;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "accessToken",
  "refreshToken",
  "idToken",
  "authorization",
]);

function sanitizeMetadata(
  input: Record<string, unknown> = {},
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

export async function recordAuditLog(
  input: CreateAuditLogInput,
  tx: Database = db,
): Promise<void> {
  await tx.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: sanitizeMetadata(input.metadata),
  });
}

export async function listRecentAuditLogs(limit = 50) {
  const rows = await db
    .select({
      id: auditLogs.id,
      actorUserId: auditLogs.actorUserId,
      actorName: user.name,
      actorEmail: user.email,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.actorUserId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows;
}
