import { requireAdminPage } from "@/server/authorization";
import { CsvBulkImporter } from "@/components/admin/csv-bulk-importer";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const auth = await requireAdminPage();
  if (!auth.authorized) {
    return auth.response;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          CSV Bulk Catalogue Import
        </h2>
        <p className="text-xs text-stone-600">
          Upload, validate, preview, and transactionally import architectural
          material specifications. Invalid rows are reported and never silently
          ignored.
        </p>
      </div>

      <CsvBulkImporter />
    </div>
  );
}
