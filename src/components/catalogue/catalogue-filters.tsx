"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATALOGUE_DEFAULTS } from "@/lib/constants";

interface TaxonomyOption {
  id: string;
  name: string;
  slug: string;
}

export function CatalogueFilters({
  materialTypes,
  finishes,
  applications,
  activeFilters,
  totalCount,
}: {
  materialTypes: TaxonomyOption[];
  finishes: TaxonomyOption[];
  applications: TaxonomyOption[];
  activeFilters: {
    q?: string;
    material?: string;
    finish?: string;
    application?: string;
    sort: string;
  };
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(activeFilters.q ?? "");

  function updateQueryParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!("page" in updates)) {
      params.set("page", "1");
    }
    router.push(`/catalogue?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQueryParams({ q: searchInput.trim() || undefined });
  }

  function handleClearAll() {
    setSearchInput("");
    router.push("/catalogue");
  }

  const hasActiveFilters = Boolean(
    activeFilters.q ||
      activeFilters.material ||
      activeFilters.finish ||
      activeFilters.application ||
      (activeFilters.sort && activeFilters.sort !== "featured"),
  );

  return (
    <section
      aria-label="Catalogue search and technical filters"
      className="border border-stone-200/90 bg-white p-5"
    >
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="catalogue-search" className="sr-only">
              Search by product name, SKU, or specification
            </label>
            <Search
              className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-stone-400"
              aria-hidden="true"
            />
            <input
              id="catalogue-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by material name, SKU (e.g. MH-STN-001), finish, or technical specification..."
              className="w-full border border-stone-300 bg-stone-50/70 py-2 pr-3.5 pl-10 text-sm text-stone-900 placeholder:text-stone-500 transition-colors focus:border-stone-900 focus:bg-white focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 border border-stone-900 bg-stone-900 px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-stone-800"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-material"
              className="block text-[11px] font-medium text-stone-600"
            >
              Material Category
            </label>
            <select
              id="filter-material"
              value={activeFilters.material ?? ""}
              onChange={(e) =>
                updateQueryParams({ material: e.target.value || undefined })
              }
              className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 transition-colors focus:border-stone-900 focus:outline-hidden"
            >
              <option value="">All Materials</option>
              {materialTypes.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-finish"
              className="block text-[11px] font-medium text-stone-600"
            >
              Surface Finish
            </label>
            <select
              id="filter-finish"
              value={activeFilters.finish ?? ""}
              onChange={(e) =>
                updateQueryParams({ finish: e.target.value || undefined })
              }
              className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 transition-colors focus:border-stone-900 focus:outline-hidden"
            >
              <option value="">All Finishes</option>
              {finishes.map((f) => (
                <option key={f.id} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-application"
              className="block text-[11px] font-medium text-stone-600"
            >
              Application
            </label>
            <select
              id="filter-application"
              value={activeFilters.application ?? ""}
              onChange={(e) =>
                updateQueryParams({ application: e.target.value || undefined })
              }
              className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 transition-colors focus:border-stone-900 focus:outline-hidden"
            >
              <option value="">All Applications</option>
              {applications.map((a) => (
                <option key={a.id} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-sort"
              className="block text-[11px] font-medium text-stone-600"
            >
              Sort Order
            </label>
            <select
              id="filter-sort"
              value={activeFilters.sort ?? "featured"}
              onChange={(e) =>
                updateQueryParams({ sort: e.target.value || "featured" })
              }
              className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 transition-colors focus:border-stone-900 focus:outline-hidden"
            >
              {CATALOGUE_DEFAULTS.SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Showing <strong className="text-stone-950">{totalCount}</strong>{" "}
              published architectural specifications
            </span>
          </span>

          {activeFilters.q && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateQueryParams({ q: undefined });
              }}
              className="inline-flex items-center gap-1 border border-stone-300 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-800 transition-colors hover:border-stone-900"
            >
              <span>Query: {activeFilters.q}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}

          {activeFilters.material && (
            <button
              type="button"
              onClick={() => updateQueryParams({ material: undefined })}
              className="inline-flex items-center gap-1 border border-stone-300 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-800 transition-colors hover:border-stone-900"
            >
              <span>Material: {activeFilters.material}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}

          {activeFilters.finish && (
            <button
              type="button"
              onClick={() => updateQueryParams({ finish: undefined })}
              className="inline-flex items-center gap-1 border border-stone-300 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-800 transition-colors hover:border-stone-900"
            >
              <span>Finish: {activeFilters.finish}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}

          {activeFilters.application && (
            <button
              type="button"
              onClick={() => updateQueryParams({ application: undefined })}
              className="inline-flex items-center gap-1 border border-stone-300 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-800 transition-colors hover:border-stone-900"
            >
              <span>Application: {activeFilters.application}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-950"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </section>
  );
}
