import { requireAdminPage } from "@/server/authorization";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const auth = await requireAdminPage();
  if (!auth.authorized) {
    return auth.response;
  }

  const taxonomies = await getAllTaxonomies();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          Material Categories, Surface Finishes & Applications
        </h2>
        <p className="text-xs text-stone-600">
          Manage controlled architectural vocabularies used by catalogue filters
          and CSV import validators.
        </p>
      </div>

      <TaxonomyManager
        materialTypes={taxonomies.materialTypes}
        finishes={taxonomies.finishes}
        applications={taxonomies.applications}
      />
    </div>
  );
}
