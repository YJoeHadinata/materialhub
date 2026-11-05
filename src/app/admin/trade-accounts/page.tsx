import { listTradeAccounts } from "@/server/services/trade-account.service";
import { TradeAccountManager } from "@/components/admin/trade-account-manager";
import type { TradeStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminTradeAccountsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status =
    typeof params.status === "string" &&
    ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(params.status)
      ? (params.status as TradeStatus)
      : "ALL";

  const accounts = await listTradeAccounts({
    q: q || undefined,
    status,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          Trade Account Applications & Governance
        </h2>
        <p className="text-xs text-stone-600">
          Review pending architectural practices, approve trade access, or
          suspend accounts. Every status transition is recorded in the audit
          trail.
        </p>
      </div>

      <TradeAccountManager
        accounts={accounts}
        activeStatus={status}
        activeQuery={q}
      />
    </div>
  );
}
