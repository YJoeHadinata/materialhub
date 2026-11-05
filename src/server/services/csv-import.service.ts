import { db, type Database } from "@/db";
import {
  applications,
  finishes,
  materialTypes,
  productApplications,
  products,
} from "@/db/schema";
import { MAX_CSV_IMPORT_ROWS, REQUIRED_CSV_HEADERS } from "@/lib/constants";
import { csvRowSchema } from "@/server/validators";
import { AppError } from "@/lib/utils/api-response";
import { recordAuditLog } from "./audit.service";
import crypto from "node:crypto";

export interface ParsedCsvRow {
  rowNumber: number;
  raw: Record<string, string>;
}

export interface CsvRowValidationResult {
  rowNumber: number;
  valid: boolean;
  data?: {
    sku: string;
    name: string;
    slug: string;
    description: string;
    materialTypeSlugOrName: string;
    finishSlugOrName: string;
    dimensionText: string;
    moqValue: number;
    moqUnit: string;
    applicationTokens: string[];
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  };
  errors: string[];
}

export interface CsvPreviewReport {
  headersValid: boolean;
  missingHeaders: string[];
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  rows: CsvRowValidationResult[];
}

export interface CsvImportExecutionReport {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: Array<{ rowNumber: number; sku?: string; messages: string[] }>;
}

/**
 * RFC 4180-compliant CSV parser supporting quoted fields, escaped quotes (""), and commas inside quotes.
 */
export function parseCsvString(csvContent: string): {
  headers: string[];
  rows: ParsedCsvRow[];
} {
  const normalized = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) {
    return { headers: [], rows: [] };
  }

  const records: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        records.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    records.push(currentRow);
  }

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = records[0] ?? [];
  const headers = rawHeaders.map((h) => h.toLowerCase().trim());

  const rows: ParsedCsvRow[] = [];
  for (let idx = 1; idx < records.length; idx++) {
    const values = records[idx] ?? [];
    if (values.every((v) => v.trim() === "")) {
      continue;
    }
    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rowObj[header] = values[colIdx] ?? "";
    });
    rows.push({
      rowNumber: idx + 1,
      raw: rowObj,
    });
  }

  return { headers, rows };
}

export function validateCsvHeaders(headers: string[]): {
  valid: boolean;
  missingHeaders: string[];
} {
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));
  const missingHeaders = REQUIRED_CSV_HEADERS.filter((req) => !headerSet.has(req));
  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
  };
}

export async function previewAndValidateCsv(
  csvContent: string,
): Promise<CsvPreviewReport> {
  const { headers, rows } = parseCsvString(csvContent);
  const headerCheck = validateCsvHeaders(headers);

  if (!headerCheck.valid) {
    return {
      headersValid: false,
      missingHeaders: headerCheck.missingHeaders,
      totalRows: rows.length,
      validRowsCount: 0,
      invalidRowsCount: rows.length,
      rows: [],
    };
  }

  if (rows.length > MAX_CSV_IMPORT_ROWS) {
    throw new AppError(
      "CSV_ROW_LIMIT_EXCEEDED",
      `CSV import exceeds maximum synchronous limit of ${MAX_CSV_IMPORT_ROWS} rows.`,
      422,
    );
  }

  const [allMaterials, allFinishes, allApps, existingProducts] =
    await Promise.all([
      db.select().from(materialTypes),
      db.select().from(finishes),
      db.select().from(applications),
      db
        .select({ sku: products.sku, slug: products.slug })
        .from(products),
    ]);

  const materialLookup = new Map<string, string>();
  for (const m of allMaterials) {
    materialLookup.set(m.slug.toLowerCase(), m.id);
    materialLookup.set(m.name.toLowerCase(), m.id);
  }

  const finishLookup = new Map<string, string>();
  for (const f of allFinishes) {
    finishLookup.set(f.slug.toLowerCase(), f.id);
    finishLookup.set(f.name.toLowerCase(), f.id);
  }

  const appLookup = new Map<string, string>();
  for (const a of allApps) {
    appLookup.set(a.slug.toLowerCase(), a.id);
    appLookup.set(a.name.toLowerCase(), a.id);
  }

  const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));
  const existingSlugs = new Set(existingProducts.map((p) => p.slug.toLowerCase()));

  const seenSkusInFile = new Set<string>();
  const seenSlugsInFile = new Set<string>();

  const validationResults: CsvRowValidationResult[] = [];

  for (const row of rows) {
    const errors: string[] = [];
    const parsed = csvRowSchema.safeParse(row.raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
      validationResults.push({
        rowNumber: row.rowNumber,
        valid: false,
        errors,
      });
      continue;
    }

    const data = parsed.data;

    if (existingSkus.has(data.sku)) {
      errors.push(`SKU "${data.sku}" already exists in the catalogue.`);
    }
    if (seenSkusInFile.has(data.sku)) {
      errors.push(`Duplicate SKU "${data.sku}" within the uploaded CSV file.`);
    }
    seenSkusInFile.add(data.sku);

    if (existingSlugs.has(data.slug)) {
      errors.push(`Slug "${data.slug}" already exists in the catalogue.`);
    }
    if (seenSlugsInFile.has(data.slug)) {
      errors.push(`Duplicate slug "${data.slug}" within the uploaded CSV file.`);
    }
    seenSlugsInFile.add(data.slug);

    if (!materialLookup.has(data.material_type.toLowerCase())) {
      errors.push(`Unknown material_type "${data.material_type}".`);
    }

    if (!finishLookup.has(data.finish.toLowerCase())) {
      errors.push(`Unknown finish "${data.finish}".`);
    }

    const appTokens = data.applications
      .split(/[;|,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (appTokens.length === 0) {
      errors.push("At least one application must be specified.");
    } else {
      for (const token of appTokens) {
        if (!appLookup.has(token.toLowerCase())) {
          errors.push(`Unknown application "${token}".`);
        }
      }
    }

    validationResults.push({
      rowNumber: row.rowNumber,
      valid: errors.length === 0,
      data: {
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        description: data.description,
        materialTypeSlugOrName: data.material_type,
        finishSlugOrName: data.finish,
        dimensionText: data.dimension,
        moqValue: data.moq_value,
        moqUnit: data.moq_unit,
        applicationTokens: appTokens,
        status: data.status,
      },
      errors,
    });
  }

  const validRowsCount = validationResults.filter((r) => r.valid).length;
  const invalidRowsCount = validationResults.length - validRowsCount;

  return {
    headersValid: true,
    missingHeaders: [],
    totalRows: validationResults.length,
    validRowsCount,
    invalidRowsCount,
    rows: validationResults,
  };
}

export async function executeCsvImport(
  csvContent: string,
  actorUserId: string,
): Promise<CsvImportExecutionReport> {
  const preview = await previewAndValidateCsv(csvContent);

  if (!preview.headersValid) {
    throw new AppError(
      "INVALID_CSV_HEADERS",
      `Missing required CSV columns: ${preview.missingHeaders.join(", ")}`,
      422,
    );
  }

  if (preview.totalRows === 0) {
    throw new AppError("EMPTY_CSV", "The CSV file contains no product rows.", 422);
  }

  if (preview.invalidRowsCount > 0) {
    return {
      totalRows: preview.totalRows,
      importedCount: 0,
      failedCount: preview.invalidRowsCount,
      errors: preview.rows
        .filter((r) => !r.valid)
        .map((r) => ({
          rowNumber: r.rowNumber,
          sku: r.data?.sku,
          messages: r.errors,
        })),
    };
  }

  const [allMaterials, allFinishes, allApps] = await Promise.all([
    db.select().from(materialTypes),
    db.select().from(finishes),
    db.select().from(applications),
  ]);

  const materialLookup = new Map<string, string>();
  for (const m of allMaterials) {
    materialLookup.set(m.slug.toLowerCase(), m.id);
    materialLookup.set(m.name.toLowerCase(), m.id);
  }

  const finishLookup = new Map<string, string>();
  for (const f of allFinishes) {
    finishLookup.set(f.slug.toLowerCase(), f.id);
    finishLookup.set(f.name.toLowerCase(), f.id);
  }

  const appLookup = new Map<string, string>();
  for (const a of allApps) {
    appLookup.set(a.slug.toLowerCase(), a.id);
    appLookup.set(a.name.toLowerCase(), a.id);
  }

  const importBatchId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    for (const row of preview.rows) {
      if (!row.valid || !row.data) continue;

      const materialTypeId = materialLookup.get(
        row.data.materialTypeSlugOrName.toLowerCase(),
      );
      const finishId = finishLookup.get(row.data.finishSlugOrName.toLowerCase());

      if (!materialTypeId || !finishId) {
        throw new AppError(
          "IMPORT_LOOKUP_ERROR",
          `Invalid taxonomy reference on row ${row.rowNumber}.`,
          422,
        );
      }

      const [inserted] = await tx
        .insert(products)
        .values({
          name: row.data.name,
          sku: row.data.sku,
          slug: row.data.slug,
          description: row.data.description,
          materialTypeId,
          finishId,
          dimensionText: row.data.dimensionText,
          moqValue: row.data.moqValue,
          moqUnit: row.data.moqUnit,
          status: row.data.status,
          isFeatured: false,
          createdBy: actorUserId,
          updatedBy: actorUserId,
          archivedAt: row.data.status === "ARCHIVED" ? new Date() : null,
        })
        .returning();

      if (!inserted) {
        throw new AppError(
          "IMPORT_INSERT_FAILED",
          `Failed to insert row ${row.rowNumber}.`,
          500,
        );
      }

      const appIds = Array.from(
        new Set(
          row.data.applicationTokens
            .map((t) => appLookup.get(t.toLowerCase()))
            .filter((v): v is string => Boolean(v)),
        ),
      );

      if (appIds.length > 0) {
        await tx.insert(productApplications).values(
          appIds.map((applicationId) => ({
            productId: inserted.id,
            applicationId,
          })),
        );
      }
    }

    await recordAuditLog(
      {
        actorUserId,
        action: "CSV_IMPORT_COMPLETED",
        entityType: "CSV_IMPORT",
        entityId: importBatchId,
        metadata: {
          totalRows: preview.totalRows,
          importedCount: preview.validRowsCount,
        },
      },
      tx as unknown as Database,
    );
  });

  return {
    totalRows: preview.totalRows,
    importedCount: preview.validRowsCount,
    failedCount: 0,
    errors: [],
  };
}
