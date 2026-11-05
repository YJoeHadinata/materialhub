import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types";

export function PaginationControls({
  meta,
  basePath = "/catalogue",
  queryParams,
}: {
  meta: PaginationMeta;
  basePath?: string;
  queryParams: Record<string, string | undefined>;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  function buildPageHref(targetPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Catalogue pagination"
      className="mt-10 flex items-center justify-between border-t border-stone-200 pt-6"
    >
      <div className="text-xs text-stone-600">
        Page <strong className="text-stone-900">{meta.page}</strong> of{" "}
        <strong className="text-stone-900">{meta.totalPages}</strong> (
        {meta.totalCount} total specifications)
      </div>

      <div className="flex items-center gap-1.5">
        {meta.page > 1 ? (
          <Link
            href={buildPageHref(meta.page - 1)}
            className="inline-flex items-center gap-1 border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 hover:border-stone-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Previous</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-400">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Previous</span>
          </span>
        )}

        <div className="hidden sm:flex sm:items-center sm:gap-1">
          {pages.map((p) => (
            <Link
              key={p}
              href={buildPageHref(p)}
              aria-current={p === meta.page ? "page" : undefined}
              className={`px-3 py-1.5 text-xs font-medium border ${
                p === meta.page
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-800 hover:border-stone-900"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>

        {meta.page < meta.totalPages ? (
          <Link
            href={buildPageHref(meta.page + 1)}
            className="inline-flex items-center gap-1 border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 hover:border-stone-900"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-400">
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
