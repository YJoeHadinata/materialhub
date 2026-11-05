import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { AppError } from "@/lib/utils/api-response";
import type { AuthenticatedUser, TradeStatus, UserRole } from "@/types";

export * from "./page-guards";

export function canAccessTradeWorkspace(user: {
  role: UserRole;
  tradeStatus: TradeStatus;
}): boolean {
  if (user.role === "ADMIN") {
    return true;
  }
  return user.role === "MEMBER" && user.tradeStatus === "APPROVED";
}

export function isAdminUser(user: { role: UserRole }): boolean {
  return user.role === "ADMIN";
}

export function assertMoodboardOwnership(
  moodboardUserId: string,
  actorUserId: string,
): void {
  if (moodboardUserId !== actorUserId) {
    throw new AppError(
      "FORBIDDEN",
      "You do not have permission to access or modify this moodboard.",
      403,
    );
  }
}

export async function getCurrentUser(
  requestHeaders?: Headers,
): Promise<AuthenticatedUser | null> {
  const resolvedHeaders = requestHeaders ?? (await headers());
  const session = await auth.api.getSession({
    headers: resolvedHeaders,
  });

  if (!session?.user?.id) {
    return null;
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    companyName: dbUser.companyName,
    companyWebsite: dbUser.companyWebsite,
    jobTitle: dbUser.jobTitle,
    tradeStatus: dbUser.tradeStatus,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
  };
}

export async function requireAuthenticatedUser(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<AuthenticatedUser> {
  const currentUser =
    overrideUser !== undefined
      ? overrideUser
      : await getCurrentUser(requestHeaders);

  if (!currentUser) {
    throw new AppError(
      "UNAUTHENTICATED",
      "Authentication is required to access this resource.",
      401,
    );
  }

  if (currentUser.tradeStatus === "SUSPENDED") {
    throw new AppError(
      "ACCOUNT_SUSPENDED",
      "Your trade account is currently suspended.",
      403,
    );
  }

  return currentUser;
}

export async function requireApprovedTradeMember(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<AuthenticatedUser> {
  const currentUser = await requireAuthenticatedUser(
    requestHeaders,
    overrideUser,
  );
  if (!canAccessTradeWorkspace(currentUser)) {
    throw new AppError(
      "TRADE_ACCOUNT_NOT_APPROVED",
      "An approved trade account is required to access the moodboard workspace.",
      403,
    );
  }
  return currentUser;
}

export async function requireAdministrator(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<AuthenticatedUser> {
  const currentUser = await requireAuthenticatedUser(
    requestHeaders,
    overrideUser,
  );
  if (!isAdminUser(currentUser)) {
    throw new AppError(
      "FORBIDDEN",
      "Administrator privileges are required for this operation.",
      403,
    );
  }
  return currentUser;
}
