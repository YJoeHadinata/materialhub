import {
  AppError,
  apiSuccess,
  handleApiRouteError,
} from "@/lib/utils/api-response";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { requireAdministrator } from "@/server/authorization";
import {
  executeCsvImport,
  previewAndValidateCsv,
} from "@/server/services/csv-import.service";

export async function POST(request: Request) {
  try {
    const admin = await requireAdministrator(request.headers);
    enforceRateLimit(`csv-import:${admin.id}`, 20, 60_000);

    const body = (await request.json()) as {
      csvContent?: string;
      mode?: "preview" | "execute";
    };

    if (!body.csvContent || typeof body.csvContent !== "string") {
      throw new AppError(
        "VALIDATION_ERROR",
        "csvContent is required as a non-empty string.",
        422,
        { csvContent: ["CSV content is required."] },
      );
    }

    const mode = body.mode ?? "execute";

    if (mode === "preview") {
      const preview = await previewAndValidateCsv(body.csvContent);
      return apiSuccess(preview, { mode: "preview" });
    }

    const report = await executeCsvImport(body.csvContent, admin.id);
    const status = report.failedCount > 0 ? 422 : 201;
    return apiSuccess(report, { mode: "execute" }, status);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
