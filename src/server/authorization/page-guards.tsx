import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdminUser, canAccessTradeWorkspace } from "./index";
import { WorkspaceNotice } from "@/components/ui/workspace-notice";
import type { AuthenticatedUser } from "@/types";

export type PageAuthResult =
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: ReactElement };

export function renderAdminForbiddenView(user: AuthenticatedUser): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <WorkspaceNotice
        eyebrow="Access Restricted // 403 Forbidden"
        title="Administrator Privileges Required"
        description={
          <>
            Your account ({user.email}) has role{" "}
            <strong className="font-mono text-stone-900">{user.role}</strong>
            {user.tradeStatus === "SUSPENDED" ? " (SUSPENDED)" : ""}.
            Administrative operations are restricted to verified platform administrators.
          </>
        }
        actions={
          <>
            <Link
              href="/account"
              className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800"
            >
              Return to Trade Account
            </Link>
            <Link
              href="/catalogue"
              className="border border-stone-300 bg-white px-4 py-2 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:border-stone-900"
            >
              Browse Catalogue
            </Link>
          </>
        }
      />
    </div>
  );
}

export function renderTradeRequiredView(user: AuthenticatedUser): ReactElement {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <WorkspaceNotice
        eyebrow="Trade Workspace Access"
        title="Approved Trade Account Required"
        description={
          <>
            Your trade account is currently{" "}
            <strong className="font-mono text-stone-900">
              {user.tradeStatus}
            </strong>
            . Only approved trade members may create and manage project
            moodboards. You can continue exploring the public material
            catalogue while your application is under review.
          </>
        }
        actions={
          <>
            <Link
              href="/account"
              className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800"
            >
              View Account Status
            </Link>
            <Link
              href="/catalogue"
              className="border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:border-stone-900"
            >
              Browse Material Catalogue
            </Link>
          </>
        }
      />
    </div>
  );
}

export async function requireAuthenticatedUserPage(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<AuthenticatedUser> {
  const user =
    overrideUser !== undefined
      ? overrideUser
      : await getCurrentUser(requestHeaders);
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdminPage(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<PageAuthResult> {
  const user =
    overrideUser !== undefined
      ? overrideUser
      : await getCurrentUser(requestHeaders);

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user) || user.tradeStatus === "SUSPENDED") {
    return {
      authorized: false,
      response: renderAdminForbiddenView(user),
    };
  }

  return { authorized: true, user };
}

export async function requireApprovedTradeMemberPage(
  requestHeaders?: Headers,
  overrideUser?: AuthenticatedUser | null,
): Promise<PageAuthResult> {
  const user =
    overrideUser !== undefined
      ? overrideUser
      : await getCurrentUser(requestHeaders);

  if (!user) {
    redirect("/login");
  }

  if (!canAccessTradeWorkspace(user)) {
    return {
      authorized: false,
      response: renderTradeRequiredView(user),
    };
  }

  return { authorized: true, user };
}
