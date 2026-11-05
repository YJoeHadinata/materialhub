import { listAdminProducts } from "@/server/services/product.service";
import { AdminProductTable } from "@/components/admin/admin-product-table";
import type { ProductStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status =
    typeof params.status === "string" &&
    ["PUBLISHED", "DRAFT", "ARCHIVED"].includes(params.status)
      ? (params.status as ProductStatus)
      : "ALL";
  const page = typeof params.page === "string" ? Number(params.page) : 1;

  const result = await listAdminProducts({
    q: q || undefined,
    status,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          Catalogue Product Management
        </h2>
        <p className="text-xs text-stone-600">
          Create, edit, publish, or archive architectural specifications.
        </p>
      </div>

      <AdminProductTable
        products={result.items}
        meta={result.meta}
        activeStatus={status}
        activeQuery={q}
      />
    </div>
  );
}
