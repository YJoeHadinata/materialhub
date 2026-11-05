import {
  AppError,
  apiSuccess,
  handleApiRouteError,
} from "@/lib/utils/api-response";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { requireAdministrator } from "@/server/authorization";
import { getStorageProvider, validateImageUploadInput } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const admin = await requireAdministrator(request.headers);
    enforceRateLimit(`upload:${admin.id}`, 30, 60_000);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "A valid image file must be provided in the 'file' field.",
        422,
        { file: ["Image file is required."] },
      );
    }

    validateImageUploadInput({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const provider = getStorageProvider();
    const stored = await provider.upload({
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      buffer,
      folder: "products",
    });

    return apiSuccess(
      {
        storageKey: stored.storageKey,
        imageUrl: stored.imageUrl,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
      {},
      201,
    );
  } catch (error) {
    return handleApiRouteError(error);
  }
}
