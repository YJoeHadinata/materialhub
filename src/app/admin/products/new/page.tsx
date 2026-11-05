import { requireAdminPage } from "@/server/authorization";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import { ProductEditorForm } from "@/components/admin/product-editor-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const auth = await requireAdminPage();
  if (!auth.authorized) {
    return auth.response;
  }

  const taxonomies = await getAllTaxonomies();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          Create New Material Specification
        </h2>
        <p className="text-xs text-stone-600">
          All fields are validated server-side for unique SKU, unique slug, and
          calibrated dimensional metadata.
        </p>
      </div>

      <ProductEditorForm
        mode="create"
        materialTypes={taxonomies.materialTypes}
        finishes={taxonomies.finishes}
        applications={taxonomies.applications}
      />
    </div>
  );
}
