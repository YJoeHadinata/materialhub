import type { Metadata } from "next";
import Link from "next/link";
import { queryPublicCatalogue } from "@/server/services/product.service";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import { getCurrentUser } from "@/server/authorization";
import { CatalogueFilters } from "@/components/catalogue/catalogue-filters";
import { ProductCard } from "@/components/catalogue/product-card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Architectural Material Catalogue",
  description:
    "Search and filter architectural natural stone, sintered ceramic, timber, metal panels, and structural glass specifications.",
};

export const dynamic = "force-dynamic";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const material =
    typeof params.material === "string" ? params.material : undefined;
  const finish = typeof params.finish === "string" ? params.finish : undefined;
  const application =
    typeof params.application === "string" ? params.application : undefined;
  const sort =
    typeof params.sort === "string"
      ? (params.sort as "featured" | "newest" | "name_asc" | "name_desc")
      : "featured";
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const [catalogueResult, taxonomies, currentUser] = await Promise.all([
    queryPublicCatalogue({
      q,
      material,
      finish,
      application,
      sort,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
    }),
    getAllTaxonomies(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold tracking-wider text-stone-600 uppercase">
          Technical Surface Index
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Architectural Material Catalogue
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          Filter published specifications by material category, surface finish,
          and building application. All search and filter parameters are
          preserved in the URL for collaborative project review.
        </p>
      </div>

      <CatalogueFilters
        materialTypes={taxonomies.materialTypes}
        finishes={taxonomies.finishes}
        applications={taxonomies.applications}
        activeFilters={catalogueResult.activeFilters}
        totalCount={catalogueResult.meta.totalCount}
      />

      <div className="mt-8">
        {catalogueResult.items.length === 0 ? (
          <EmptyState
            title="No architectural materials match your active filters"
            description="Try broadening your search keyword or clearing one or more material, finish, or application filters."
            action={
              <Link
                href="/catalogue"
                className="border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-medium tracking-wider text-white uppercase hover:bg-stone-800"
              >
                Reset Catalogue Filters
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalogueResult.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentUser={currentUser}
                />
              ))}
            </div>

            <PaginationControls
              meta={catalogueResult.meta}
              basePath="/catalogue"
              queryParams={{
                q: catalogueResult.activeFilters.q,
                material: catalogueResult.activeFilters.material,
                finish: catalogueResult.activeFilters.finish,
                application: catalogueResult.activeFilters.application,
                sort: catalogueResult.activeFilters.sort,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
