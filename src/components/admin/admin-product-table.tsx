"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Edit, ExternalLink, Plus, Search } from "lucide-react";
import type { PaginationMeta, ProductListItem, ProductStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";

export function AdminProductTable({
  products,
  meta,
  activeStatus,
  activeQuery,
}: {
  products: ProductListItem[];
  meta: PaginationMeta;
  activeStatus: ProductStatus | "ALL";
  activeQuery: string;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(activeQuery);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFilterChange(nextStatus: string, nextQ: string) {
    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }
    if (nextQ.trim()) {
      params.set("q", nextQ.trim());
    }
    router.push(`/admin/products?${params.toString()}`);
  }

  async function handleArchive(productId: string, sku: string) {
    if (
      !window.confirm(
        `Archive product ${sku}? Archived products are hidden from the public catalogue while preserving existing customer moodboard references.`,
      )
    ) {
      return;
    }

    setArchivingId(productId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}/archive`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to archive product.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error while archiving product.");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFilterChange(activeStatus, searchInput);
          }}
          className="flex flex-1 gap-2"
        >
          <div className="relative flex-1 max-w-md">
            <label htmlFor="admin-prod-search" className="sr-only">
              Search products by name, SKU, or slug
            </label>
            <Search
              className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-stone-400"
              aria-hidden="true"
            />
            <input
              id="admin-prod-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search SKU, name, or slug..."
              className="w-full border border-stone-300 py-2 pr-3 pl-9 text-xs text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleFilterChange(st, searchInput)}
              className={`border px-3 py-1.5 text-xs font-medium tracking-wider uppercase ${
                activeStatus === st
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-800 hover:border-stone-900"
              }`}
            >
              {st}
            </button>
          ))}

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-900"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-stone-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 font-semibold tracking-wider text-stone-600 uppercase">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Material & Finish</th>
              <th className="px-4 py-3">Dimensions & MOQ</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {products.map((prod) => {
              const badgeVariant =
                prod.status === "PUBLISHED"
                  ? "published"
                  : prod.status === "DRAFT"
                    ? "draft"
                    : "archived";
              return (
                <tr key={prod.id} className="hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono font-semibold text-stone-900">
                    {prod.sku}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-stone-900">
                      {prod.name}
                    </div>
                    <div className="font-mono text-[11px] text-stone-500">
                      /{prod.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-stone-700">
                    <div>{prod.materialType.name}</div>
                    <div className="text-stone-500">{prod.finish.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-stone-700">
                    <div>{prod.dimensionText}</div>
                    <div className="text-stone-500">
                      MOQ: {prod.moqValue} {prod.moqUnit}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <Badge variant={badgeVariant}>{prod.status}</Badge>
                    {prod.isFeatured && (
                      <span className="ml-1.5 font-mono text-[10px] font-semibold text-stone-600 uppercase">
                        [Featured]
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {prod.status === "PUBLISHED" && (
                        <Link
                          href={`/products/${prod.slug}`}
                          title="View public product page"
                          className="inline-flex items-center gap-1 border border-stone-300 px-2.5 py-1 text-stone-700 hover:border-stone-900"
                        >
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          <span>Public</span>
                        </Link>
                      )}
                      <Link
                        href={`/admin/products/${prod.id}/edit`}
                        className="inline-flex items-center gap-1 border border-stone-300 px-2.5 py-1 font-medium text-stone-900 hover:border-stone-900"
                      >
                        <Edit className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </Link>
                      {prod.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          disabled={archivingId === prod.id}
                          onClick={() => handleArchive(prod.id, prod.sku)}
                          className="inline-flex items-center gap-1 border border-stone-300 px-2.5 py-1 text-red-800 hover:border-red-800 disabled:opacity-50"
                        >
                          <Archive className="h-3 w-3" aria-hidden="true" />
                          <span>Archive</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationControls
        meta={meta}
        basePath="/admin/products"
        queryParams={{
          status: activeStatus !== "ALL" ? activeStatus : undefined,
          q: activeQuery || undefined,
        }}
      />
    </div>
  );
}
