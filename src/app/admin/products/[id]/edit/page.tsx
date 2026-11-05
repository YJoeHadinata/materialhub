import { notFound } from "next/navigation";
import { getAdminProductById } from "@/server/services/product.service";
import { getAllTaxonomies } from "@/server/services/taxonomy.service";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { AppError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Awaited<ReturnType<typeof getAdminProductById>>;
  try {
    product = await getAdminProductById(id);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  const taxonomies = await getAllTaxonomies();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          Edit Specification: {product.name} ({product.sku})
        </h2>
        <p className="text-xs text-stone-600">
          Update technical specifications, publication state, and product image
          gallery.
        </p>
      </div>

      <ProductEditorForm
        mode="edit"
        initialProduct={product}
        materialTypes={taxonomies.materialTypes}
        finishes={taxonomies.finishes}
        applications={taxonomies.applications}
      />
    </div>
  );
}
