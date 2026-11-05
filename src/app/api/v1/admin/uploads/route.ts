import path from "node:path";
import {
  AppError,
  apiSuccess,
  handleApiRouteError,
} from "@/lib/utils/api-response";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { requireAdministrator } from "@/server/authorization";
import {
  buildSafeStoragePrefix,
  getStorageProvider,
  validateImageUploadInput,
} from "@/lib/storage";
import { processAndOptimizeImage } from "@/lib/storage/image-processing";

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

    // Decode and validate binary content via sharp, strip EXIF, and generate responsive variants
    const processed = await processAndOptimizeImage(
      buffer,
      file.type,
      file.name,
    );

    const provider = getStorageProvider();
    const basePrefix = buildSafeStoragePrefix(file.name, "products");
    const rawBaseName = path.basename(file.name, path.extname(file.name));

    // Upload primary WebP image
    const primaryStored = await provider.upload({
      fileName: `${rawBaseName}.webp`,
      mimeType: "image/webp",
      sizeBytes: processed.primary.sizeBytes,
      buffer: processed.primary.buffer,
      folder: "products",
      customKey: `${basePrefix}.webp`,
    });

    // Upload deterministic responsive WebP variants
    const storedVariants = await Promise.all(
      processed.variants.map(async (v) => {
        const variantKey = `${basePrefix}-${v.width}w.webp`;
        const stored = await provider.upload({
          fileName: `${rawBaseName}-${v.width}w.webp`,
          mimeType: "image/webp",
          sizeBytes: v.sizeBytes,
          buffer: v.buffer,
          folder: "products",
          customKey: variantKey,
        });

        return {
          width: v.width,
          height: v.height,
          format: "webp" as const,
          storageKey: stored.storageKey,
          imageUrl: stored.imageUrl,
          sizeBytes: v.sizeBytes,
        };
      }),
    );

    return apiSuccess(
      {
        storageKey: primaryStored.storageKey,
        imageUrl: primaryStored.imageUrl,
        fileName: `${rawBaseName}.webp`,
        mimeType: "image/webp",
        sizeBytes: processed.primary.sizeBytes,
        width: processed.primary.width,
        height: processed.primary.height,
        variants: storedVariants,
      },
      {},
      201,
    );
  } catch (error) {
    return handleApiRouteError(error);
  }
}
