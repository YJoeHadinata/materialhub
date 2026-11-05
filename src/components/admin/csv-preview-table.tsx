import { CheckCircle2, XCircle } from "lucide-react";
import type { CsvPreviewReport } from "@/server/services/csv-import.service";

export function CsvPreviewTable({ preview }: { preview: CsvPreviewReport }) {
  if (!preview.headersValid) {
    return (
      <div
        role="alert"
        className="border-l-2 border-red-700 bg-stone-100 p-4 text-xs text-stone-900"
      >
        <span className="font-mono text-[10px] font-semibold text-red-700 uppercase">
          Header Error:
        </span>{" "}
        Missing required CSV headers: {preview.missingHeaders.join(", ")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-stone-200 bg-stone-50 font-semibold tracking-wider text-stone-600 uppercase">
          <tr>
            <th className="px-4 py-2.5">Row</th>
            <th className="px-4 py-2.5">Validation</th>
            <th className="px-4 py-2.5">SKU & Name</th>
            <th className="px-4 py-2.5">Taxonomy & MOQ</th>
            <th className="px-4 py-2.5">Diagnostics / Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {preview.rows.map((row) => (
            <tr key={row.rowNumber}>
              <td className="px-4 py-3 font-mono text-stone-500">
                Line {row.rowNumber}
              </td>
              <td className="px-4 py-3">
                {row.valid ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-900 uppercase">
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-stone-800"
                      aria-hidden="true"
                    />
                    <span>Valid</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-red-800 uppercase">
                    <XCircle
                      className="h-3.5 w-3.5 text-red-700"
                      aria-hidden="true"
                    />
                    <span>Invalid</span>
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="font-mono font-semibold text-stone-900">
                  {row.data?.sku ?? "N/A"}
                </div>
                <div className="text-stone-600">
                  {row.data?.name ?? "Invalid row structure"}
                </div>
              </td>
              <td className="px-4 py-3 text-stone-600">
                {row.data ? (
                  <>
                    <div>
                      {row.data.materialTypeSlugOrName} /{" "}
                      {row.data.finishSlugOrName}
                    </div>
                    <div className="font-mono text-[11px]">
                      MOQ: {row.data.moqValue} {row.data.moqUnit} ·{" "}
                      {row.data.status}
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                {row.errors.length === 0 ? (
                  <span className="text-stone-500">
                    Ready for transactional insert
                  </span>
                ) : (
                  <ul className="list-disc pl-4 text-red-800 space-y-0.5">
                    {row.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
