"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { TradeAccountRecord } from "@/server/services/trade-account.service";
import type { TradeStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { formatDate } from "@/lib/utils/format";

export function TradeAccountManager({
  accounts,
  activeStatus,
  activeQuery,
}: {
  accounts: TradeAccountRecord[];
  activeStatus: TradeStatus | "ALL";
  activeQuery: string;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(activeQuery);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyFilters(nextStatus: string, nextQ: string) {
    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }
    if (nextQ.trim()) {
      params.set("q", nextQ.trim());
    }
    router.push(`/admin/trade-accounts?${params.toString()}`);
  }

  async function handleStatusTransition(
    accountId: string,
    nextStatus: TradeStatus,
  ) {
    setUpdatingId(accountId);
    setError(null);

    try {
      const res = await fetch(
        `/api/v1/admin/trade-accounts/${accountId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to update trade account status.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error while updating trade status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(activeStatus, searchInput);
          }}
          className="flex flex-1 gap-2"
        >
          <div className="relative flex-1 max-w-md">
            <label htmlFor="trade-acc-search" className="sr-only">
              Search trade accounts by name, email, or company
            </label>
            <Search
              className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-stone-400"
              aria-hidden="true"
            />
            <input
              id="trade-acc-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search architect name, email, or studio..."
              className="w-full border border-stone-300 py-2 pr-3 pl-9 text-xs text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {(
            ["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => applyFilters(st, searchInput)}
              className={`border px-3 py-1.5 text-xs font-medium tracking-wider uppercase ${
                activeStatus === st
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-800 hover:border-stone-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && <Callout variant="error">{error}</Callout>}

      <div className="overflow-x-auto border border-stone-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 font-semibold tracking-wider text-stone-600 uppercase">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Practice / Studio</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Trade Status</th>
              <th className="px-4 py-3 text-right">Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-stone-500"
                >
                  No trade member accounts match the selected filter.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => {
                const badgeVariant =
                  acc.tradeStatus === "APPROVED"
                    ? "approved"
                    : acc.tradeStatus === "PENDING"
                      ? "pending"
                      : acc.tradeStatus === "REJECTED"
                        ? "rejected"
                        : "suspended";

                return (
                  <tr key={acc.id} className="hover:bg-stone-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-stone-900">
                        {acc.name}
                      </div>
                      <div className="text-stone-600">{acc.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-stone-900">
                        {acc.companyName || "Unspecified Practice"}
                      </div>
                      <div className="text-stone-600">
                        {acc.jobTitle || "Trade Professional"}
                        {acc.companyWebsite ? ` · ${acc.companyWebsite}` : ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-stone-600">
                      {formatDate(acc.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge variant={badgeVariant}>{acc.tradeStatus}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        {acc.tradeStatus !== "APPROVED" && (
                          <button
                            type="button"
                            disabled={updatingId === acc.id}
                            onClick={() =>
                              handleStatusTransition(acc.id, "APPROVED")
                            }
                            className="border border-stone-900 bg-stone-900 px-2.5 py-1 text-xs font-medium text-white uppercase hover:bg-stone-800 disabled:opacity-50"
                          >
                            {acc.tradeStatus === "SUSPENDED"
                              ? "Reactivate"
                              : "Approve"}
                          </button>
                        )}

                        {acc.tradeStatus === "PENDING" && (
                          <button
                            type="button"
                            disabled={updatingId === acc.id}
                            onClick={() =>
                              handleStatusTransition(acc.id, "REJECTED")
                            }
                            className="border border-red-800 px-2.5 py-1 text-xs font-medium text-red-800 uppercase hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {acc.tradeStatus === "APPROVED" && (
                          <button
                            type="button"
                            disabled={updatingId === acc.id}
                            onClick={() =>
                              handleStatusTransition(acc.id, "SUSPENDED")
                            }
                            className="border border-stone-400 px-2.5 py-1 text-xs font-medium text-stone-800 uppercase hover:border-red-800 hover:text-red-800 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
