"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import type {
  CsvImportExecutionReport,
  CsvPreviewReport,
} from "@/server/services/csv-import.service";
import { REQUIRED_CSV_HEADERS } from "@/lib/constants";
import { Callout } from "@/components/ui/callout";
import { CsvPreviewTable } from "./csv-preview-table";

const SAMPLE_CSV_TEMPLATE = `sku,name,slug,description,material_type,finish,dimension,moq_value,moq_unit,applications,status
MH-STN-201,Dolomitic Bianco Honed Slab,dolomitic-bianco-honed-slab,Fine-grain alpine dolomitic limestone calibrated for interior cladding and reception monoliths.,natural-stone,honed-matte,2400 x 1200 x 20 mm,20,sqm,wall-cladding;countertops,PUBLISHED
MH-CER-202,Architectural Basaltina Sintered Tile,architectural-basaltina-sintered-tile,High-density 12 mm sintered porcelain panel resistant to thermal shock and heavy foot traffic.,ceramic,sandblasted,1200 x 600 x 12 mm,35,sqm,flooring;facade,DRAFT`;

export function CsvBulkImporter() {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV_TEMPLATE);
  const [preview, setPreview] = useState<CsvPreviewReport | null>(null);
  const [executionReport, setExecutionReport] =
    useState<CsvImportExecutionReport | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileRead(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCsvContent(reader.result);
        setPreview(null);
        setExecutionReport(null);
      }
    };
    reader.readAsText(file);
  }

  async function handlePreview() {
    setLoadingPreview(true);
    setError(null);
    setExecutionReport(null);

    try {
      const res = await fetch("/api/v1/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          mode: "preview",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "CSV validation preview failed.");
      } else {
        setPreview(json.data as CsvPreviewReport);
      }
    } catch {
      setError("Network error while validating CSV.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleExecuteImport() {
    setExecuting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent,
          mode: "execute",
        }),
      });
      const json = await res.json();
      if (json.data && "totalRows" in json.data) {
        setExecutionReport(json.data as CsvImportExecutionReport);
        if (res.ok && json.success) {
          router.refresh();
        }
      } else if (!res.ok || !json.success) {
        setError(json.error?.message ?? "CSV import failed.");
      }
    } catch {
      setError("Network error while executing CSV import.");
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* STEP 1: UPLOAD OR PASTE CSV */}
      <div className="border border-stone-200 bg-white p-6 space-y-4">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
              Step 1 — Upload or Edit CSV Specification Batch
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Required headers:{" "}
              <code className="font-mono text-[11px] text-stone-800">
                {REQUIRED_CSV_HEADERS.join(", ")}
              </code>
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 border border-stone-300 bg-stone-50 px-4 py-2 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:border-stone-900">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Load .CSV File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileRead}
              className="sr-only"
            />
          </label>
        </div>

        <div>
          <label
            htmlFor="csv-textarea"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            CSV Payload (Maximum 500 rows per synchronous transaction)
          </label>
          <textarea
            id="csv-textarea"
            rows={7}
            value={csvContent}
            onChange={(e) => {
              setCsvContent(e.target.value);
              setPreview(null);
            }}
            className="mt-1.5 w-full border border-stone-300 bg-stone-50 p-3 font-mono text-xs text-stone-900"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={loadingPreview || !csvContent.trim()}
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {loadingPreview
                ? "Validating CSV..."
                : "Validate & Preview Records"}
            </span>
          </button>
        </div>
      </div>

      {error && <Callout variant="error">{error}</Callout>}

      {/* STEP 2: PREVIEW & ROW-LEVEL VALIDATION */}
      {preview && (
        <div className="border border-stone-200 bg-white p-6 space-y-5">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                Step 2 — Validation Preview & Row Diagnostics
              </h2>
              <p className="mt-1 text-xs text-stone-700">
                Total Rows: <strong className="font-mono text-stone-900">{preview.totalRows}</strong> · Valid:{" "}
                <strong className="font-mono text-stone-900">
                  {preview.validRowsCount}
                </strong>{" "}
                · Invalid:{" "}
                <strong className="font-mono text-stone-900">
                  {preview.invalidRowsCount}
                </strong>
              </p>
            </div>

            {preview.headersValid &&
              preview.totalRows > 0 &&
              preview.invalidRowsCount === 0 && (
                <button
                  type="button"
                  disabled={executing}
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-widest text-white uppercase hover:bg-stone-800 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {executing
                      ? "Importing..."
                      : `Confirm & Import ${preview.validRowsCount} Products`}
                  </span>
                </button>
              )}
          </div>

          <CsvPreviewTable preview={preview} />
        </div>
      )}

      {/* STEP 3: EXECUTION SUMMARY */}
      {executionReport && (
        <div
          role="region"
          aria-label="CSV Import Execution Summary"
          className="border border-stone-200 border-l-4 border-l-stone-900 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
              CSV Import Report
            </h3>
            <span className="font-mono text-[10px] tracking-widest text-stone-600 uppercase">
              {executionReport.failedCount === 0 ? "Completed" : "Partial"}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-700">
            Total Rows Processed:{" "}
            <strong className="font-mono text-stone-950">{executionReport.totalRows}</strong> ·
            Successfully Imported:{" "}
            <strong className="font-mono text-stone-950">{executionReport.importedCount}</strong> ·
            Failed Rows:{" "}
            <strong className="font-mono text-stone-950">{executionReport.failedCount}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
