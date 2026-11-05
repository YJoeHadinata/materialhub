import Link from "next/link";
import { ArrowRight, Plus, Upload } from "lucide-react";
import { requireAdminPage } from "@/server/authorization";
import { getAdminDashboardMetrics } from "@/server/services/trade-account.service";
import { listRecentAuditLogs } from "@/server/services/audit.service";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const auth = await requireAdminPage();
  if (!auth.authorized) {
    return auth.response;
  }

  const [metrics, auditLogs] = await Promise.all([
    getAdminDashboardMetrics(),
    listRecentAuditLogs(25),
  ]);

  const statCards = [
    {
      label: "Total Products",
      value: metrics.totalProducts,
      sub: "All catalogue SKUs",
      href: "/admin/products",
    },
    {
      label: "Published Products",
      value: metrics.publishedProducts,
      sub: "Visible in public catalogue",
      href: "/admin/products?status=PUBLISHED",
    },
    {
      label: "Draft Products",
      value: metrics.draftProducts,
      sub: "Awaiting specification review",
      href: "/admin/products?status=DRAFT",
    },
    {
      label: "Archived Products",
      value: metrics.archivedProducts,
      sub: "Preserved for historical moodboards",
      href: "/admin/products?status=ARCHIVED",
    },
    {
      label: "Pending Trade Accounts",
      value: metrics.pendingTradeAccounts,
      sub: "Awaiting approval decision",
      href: "/admin/trade-accounts?status=PENDING",
    },
    {
      label: "Approved Trade Accounts",
      value: metrics.approvedTradeAccounts,
      sub: "Active customer workspaces",
      href: "/admin/trade-accounts?status=APPROVED",
    },
    {
      label: "Total Moodboards",
      value: metrics.totalMoodboards,
      sub: "Customer specification palettes",
      href: "/admin/trade-accounts",
    },
  ];

  return (
    <div className="space-y-10">
      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-stone-200 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-stone-900 uppercase">
            Operational Overview
          </h2>
          <p className="mt-0.5 text-xs text-stone-600">
            Real-time catalogue counts, trade account queues, and administrative
            audit records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Product Specification</span>
          </Link>
          <Link
            href="/admin/imports"
            className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-4 py-2 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:border-stone-900"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Bulk CSV Import</span>
          </Link>
        </div>
      </div>

      {/* OPERATIONAL METRICS GRID */}
      <section aria-label="Operational Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group flex flex-col justify-between border border-stone-200 bg-white p-5 transition-colors hover:border-stone-900"
            >
              <div>
                <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                  {card.label}
                </p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-stone-950">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-stone-500">{card.sub}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold tracking-wider text-stone-800 uppercase group-hover:underline">
                <span>Inspect</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ADMINISTRATIVE AUDIT LOG */}
      <section
        aria-label="Administrative Audit Logs"
        className="border border-stone-200 bg-white"
      >
        <div className="border-b border-stone-200 px-6 py-4">
          <h2 className="text-sm font-semibold tracking-wider text-stone-900 uppercase">
            Administrative Audit Trail
          </h2>
          <p className="mt-0.5 text-xs text-stone-600">
            Immutable log of product creations, status changes, trade account
            decisions, and CSV imports.
          </p>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No administrative audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 font-semibold tracking-wider text-stone-600 uppercase">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Entity</th>
                  <th className="px-6 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-stone-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono font-semibold text-stone-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-3.5 text-stone-700">
                      {log.actorName ?? "System"} ({log.actorEmail ?? "N/A"})
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-stone-600">
                      {log.entityType} / {log.entityId.slice(0, 8)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-stone-600">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
