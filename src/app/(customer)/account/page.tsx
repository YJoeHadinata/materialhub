import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderKanban, ShieldCheck } from "lucide-react";
import { canAccessTradeWorkspace, getCurrentUser } from "@/server/authorization";
import { listUserMoodboards } from "@/server/services/moodboard.service";
import { Badge } from "@/components/ui/badge";
import { ProfileEditor } from "@/components/moodboards/profile-editor";
import { WorkspaceNotice } from "@/components/ui/workspace-notice";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const isApproved = canAccessTradeWorkspace(currentUser);
  const moodboards = isApproved
    ? await listUserMoodboards(currentUser.id)
    : [];

  const statusBadgeVariant =
    currentUser.tradeStatus === "APPROVED"
      ? "approved"
      : currentUser.tradeStatus === "PENDING"
        ? "pending"
        : currentUser.tradeStatus === "REJECTED"
          ? "rejected"
          : "suspended";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
            Trade Account Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            {currentUser.name}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {currentUser.companyName || "Architectural Practice"} ·{" "}
            {currentUser.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={statusBadgeVariant}>
            Trade Status: {currentUser.tradeStatus}
          </Badge>
          <Badge variant="neutral">Role: {currentUser.role}</Badge>
          {currentUser.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-medium tracking-wider text-white uppercase hover:bg-stone-800"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      </div>

      {/* STATUS NOTICE FOR NON-APPROVED ACCOUNTS */}
      {!isApproved && (
        <WorkspaceNotice
          ariaLabel="Trade account verification status"
          className="mb-8"
          eyebrow="Account Verification"
          title={`Trade Account Verification: ${currentUser.tradeStatus}`}
          description={
            currentUser.tradeStatus === "PENDING"
              ? "Your trade registration is awaiting review by a MaterialHub administrator. While your account is PENDING, you have full access to browse and filter the public material catalogue, but project moodboard workspace operations remain locked until approval."
              : "Your trade workspace access is currently restricted. Please contact the specification administration team if you require account reactivation."
          }
          actions={
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-medium tracking-wider text-white uppercase hover:bg-stone-800"
            >
              <span>Browse Public Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProfileEditor user={currentUser} />
        </div>

        <div className="lg:col-span-5">
          <div className="border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <FolderKanban
                  className="h-4 w-4 text-stone-700"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold tracking-wider text-stone-900 uppercase">
                  Project Moodboards ({moodboards.length})
                </h2>
              </div>
              {isApproved && (
                <Link
                  href="/moodboards"
                  className="text-xs font-semibold tracking-wider text-stone-900 uppercase underline underline-offset-4"
                >
                  Manage All
                </Link>
              )}
            </div>

            {!isApproved ? (
              <p className="mt-4 text-xs text-stone-500">
                Moodboard workspace unlocks automatically once your trade
                account status is set to APPROVED.
              </p>
            ) : moodboards.length === 0 ? (
              <div className="mt-5 space-y-3">
                <p className="text-xs text-stone-600">
                  You have not created any material moodboards yet.
                </p>
                <Link
                  href="/moodboards"
                  className="inline-block border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-medium tracking-wider text-white uppercase"
                >
                  Create First Moodboard
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-stone-200">
                {moodboards.slice(0, 5).map((board) => (
                  <li key={board.id} className="py-3.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/moodboards/${board.id}`}
                      className="group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-stone-900 group-hover:underline">
                          {board.name}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {board.itemCount} specified materials
                        </p>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 text-stone-400 group-hover:text-stone-900"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
