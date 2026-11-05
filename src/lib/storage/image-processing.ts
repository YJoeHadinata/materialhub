import sharp, { type Metadata, type Sharp } from "sharp";
import path from "node:path";
import { AppError } from "@/lib/utils/api-response";

/**
 * Maximum allowable total input pixels (25 megapixels, e.g. ~5000x5000).
 * Protects against decompression-bomb style memory exhaustion attacks.
 */
export const MAX_INPUT_PIXELS = 25_000_000;

/**
 * Target responsive variant widths in pixels.
 * Variants will never upscale beyond the original image width.
 */
export const RESPONSIVE_VARIANT_WIDTHS = [480, 960, 1600] as const;

export type SupportedImageFormat = "jpeg" | "png" | "webp";

export interface ImageVariantOutput {
  width: number;
  height: number;
  format: "webp";
  buffer: Buffer;
  sizeBytes: number;
  suffix: string;
}

export interface ProcessedImageResult {
  primary: {
    width: number;
    height: number;
    format: "webp";
    buffer: Buffer;
    sizeBytes: number;
  };
  variants: ImageVariantOutput[];
  detectedFormat: SupportedImageFormat;
  originalWidth: number;
  originalHeight: number;
}

/**
 * Decodes and inspects an image buffer using sharp to extract verified metadata.
 * Validates actual binary format against declared MIME type and extension (magic-byte check),
 * guards against decompression bombs, auto-rotates via EXIF, strips metadata, and generates
 * deterministic responsive WebP variants.
 */
export async function processAndOptimizeImage(
  buffer: Buffer,
  declaredMimeType: string,
  fileName: string,
): Promise<ProcessedImageResult> {
  let sharpInstance: Sharp;
  try {
    sharpInstance = sharp(buffer, {
      limitInputPixels: MAX_INPUT_PIXELS,
      failOn: "warning",
    });
  } catch {
    throw new AppError(
      "CORRUPT_OR_UNSUPPORTED_IMAGE",
      "Unable to initialize image decoder for uploaded file.",
      422,
      { file: ["The uploaded file could not be parsed as an image."] },
    );
  }

  let metadata: Metadata;
  try {
    metadata = await sharpInstance.metadata();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    if (
      errorMsg.includes("pixel limit") ||
      errorMsg.includes("exceeds pixel limit")
    ) {
      throw new AppError(
        "IMAGE_DIMENSIONS_TOO_LARGE",
        "Image exceeds maximum allowable pixel dimension limits (decompression bomb protection).",
        422,
        { file: ["Image dimensions are excessively large."] },
      );
    }
    throw new AppError(
      "CORRUPT_OR_UNSUPPORTED_IMAGE",
      "Could not decode image content. The file may be corrupt or in an unsupported format.",
      422,
      { file: ["The uploaded file is not a valid decodable image."] },
    );
  }

  const rawFormat = metadata.format;
  if (!rawFormat || !["jpeg", "png", "webp"].includes(rawFormat)) {
    throw new AppError(
      "INVALID_IMAGE_FORMAT",
      `Unsupported image format: ${rawFormat ?? "unknown"}. Only JPEG, PNG, and WebP are permitted.`,
      422,
      { file: ["Image content must be JPEG, PNG, or WebP."] },
    );
  }

  const detectedFormat = rawFormat as SupportedImageFormat;

  // Verify that actual binary format matches declared MIME type
  const normalizedMime = declaredMimeType.toLowerCase().trim();
  const mimeMatches =
    (detectedFormat === "jpeg" &&
      (normalizedMime === "image/jpeg" || normalizedMime === "image/jpg")) ||
    (detectedFormat === "png" && normalizedMime === "image/png") ||
    (detectedFormat === "webp" && normalizedMime === "image/webp");

  const ext = path.extname(fileName).toLowerCase();
  const extMatches =
    (detectedFormat === "jpeg" && (ext === ".jpg" || ext === ".jpeg")) ||
    (detectedFormat === "png" && ext === ".png") ||
    (detectedFormat === "webp" && ext === ".webp");

  if (!mimeMatches || !extMatches) {
    throw new AppError(
      "MIME_TYPE_MISMATCH",
      `Image content (${detectedFormat.toUpperCase()}) contradicts declared MIME type (${declaredMimeType}) or extension (${ext}).`,
      422,
      {
        file: [
          "Actual file content does not match the declared extension or MIME type.",
        ],
      },
    );
  }

  if (!metadata.width || !metadata.height) {
    throw new AppError(
      "INVALID_IMAGE_DIMENSIONS",
      "Image dimensions could not be determined.",
      422,
      { file: ["Image must have valid non-zero dimensions."] },
    );
  }

  if (metadata.width * metadata.height > MAX_INPUT_PIXELS) {
    throw new AppError(
      "IMAGE_DIMENSIONS_TOO_LARGE",
      `Image pixel count (${metadata.width}x${metadata.height}) exceeds allowable safety threshold.`,
      422,
      { file: ["Image dimensions exceed safety limit."] },
    );
  }

  // Account for EXIF orientation when computing logical dimensions
  const isRotated90or270 =
    typeof metadata.orientation === "number" &&
    metadata.orientation >= 5 &&
    metadata.orientation <= 8;

  const logicalWidth = isRotated90or270 ? metadata.height : metadata.width;
  const logicalHeight = isRotated90or270 ? metadata.width : metadata.height;

  // Determine target variant widths (never upscale beyond original logical width)
  const candidateWidths = RESPONSIVE_VARIANT_WIDTHS.filter(
    (w) => w < logicalWidth,
  );

  // Always include the primary target width (capped at 1600 or original width if smaller)
  const primaryTargetWidth = Math.min(logicalWidth, 1600);
  const targetWidths = Array.from(
    new Set([...candidateWidths, primaryTargetWidth]),
  ).sort((a, b) => a - b);

  // Generate variants as WebP (rotate() normalizes EXIF orientation and strips EXIF/GPS by default)
  const variants: ImageVariantOutput[] = [];

  for (const targetWidth of targetWidths) {
    const variantBuffer = await sharp(buffer, {
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 4,
      })
      .toBuffer();

    const variantMeta = await sharp(variantBuffer).metadata();
    variants.push({
      width: variantMeta.width ?? targetWidth,
      height:
        variantMeta.height ??
        Math.round((logicalHeight * targetWidth) / logicalWidth),
      format: "webp",
      buffer: variantBuffer,
      sizeBytes: variantBuffer.length,
      suffix: `-${targetWidth}w`,
    });
  }

  // The primary image is the largest variant (up to 1600px, or original size if smaller)
  const primaryVariant = variants[variants.length - 1];
  if (!primaryVariant) {
    throw new AppError(
      "IMAGE_PROCESSING_FAILED",
      "Failed to produce optimized primary image variant.",
      500,
    );
  }

  return {
    primary: {
      width: primaryVariant.width,
      height: primaryVariant.height,
      format: "webp",
      buffer: primaryVariant.buffer,
      sizeBytes: primaryVariant.sizeBytes,
    },
    variants,
    detectedFormat,
    originalWidth: logicalWidth,
    originalHeight: logicalHeight,
  };
}
