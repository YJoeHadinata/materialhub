import { describe, expect, it } from "vitest";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  processAndOptimizeImage,
  RESPONSIVE_VARIANT_WIDTHS,
} from "@/lib/storage/image-processing";
import {
  LocalDevelopmentStorageProvider,
  deriveVariantStorageKeys,
} from "@/lib/storage";
import {
  getResponsiveVariantUrl,
  isSvgImageUrl,
} from "@/lib/utils/image";
import { AppError } from "@/lib/utils/api-response";

describe("Image Optimization & Processing Pipeline (Step 2)", () => {
  describe("1. Real Content & Magic-Byte Validation", () => {
    it("accepts valid JPEG, PNG, and WebP buffers", async () => {
      const jpegBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 200, g: 150, b: 100 },
        },
      })
        .jpeg()
        .toBuffer();

      const jpegResult = await processAndOptimizeImage(
        jpegBuffer,
        "image/jpeg",
        "stone.jpg",
      );
      expect(jpegResult.detectedFormat).toBe("jpeg");
      expect(jpegResult.primary.format).toBe("webp");
      expect(jpegResult.primary.width).toBe(800);
      expect(jpegResult.primary.height).toBe(600);

      const pngBuffer = await sharp({
        create: {
          width: 500,
          height: 400,
          channels: 4,
          background: { r: 50, g: 100, b: 150, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const pngResult = await processAndOptimizeImage(
        pngBuffer,
        "image/png",
        "texture.png",
      );
      expect(pngResult.detectedFormat).toBe("png");
      expect(pngResult.primary.format).toBe("webp");

      const webpBuffer = await sharp({
        create: {
          width: 640,
          height: 480,
          channels: 3,
          background: { r: 80, g: 180, b: 80 },
        },
      })
        .webp()
        .toBuffer();

      const webpResult = await processAndOptimizeImage(
        webpBuffer,
        "image/webp",
        "timber.webp",
      );
      expect(webpResult.detectedFormat).toBe("webp");
      expect(webpResult.primary.format).toBe("webp");
    });

    it("rejects non-image text files disguised with an image extension", async () => {
      const fakeImageBuffer = Buffer.from(
        "This is a plaintext malicious payload disguised as an architectural photo.",
        "utf-8",
      );

      await expect(
        processAndOptimizeImage(fakeImageBuffer, "image/png", "elevation.png"),
      ).rejects.toThrowError(AppError);

      try {
        await processAndOptimizeImage(
          fakeImageBuffer,
          "image/png",
          "elevation.png",
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appErr = error as AppError;
        expect(appErr.statusCode).toBe(422);
        expect(appErr.code).toMatch(/CORRUPT_OR_UNSUPPORTED_IMAGE/);
      }
    });

    it("rejects MIME type / extension contradiction against real binary content", async () => {
      // Create a valid JPEG file but claim it is a PNG
      const jpegBuffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 100, g: 100, b: 100 },
        },
      })
        .jpeg()
        .toBuffer();

      await expect(
        processAndOptimizeImage(jpegBuffer, "image/png", "deceptive.png"),
      ).rejects.toThrowError(/contradicts declared MIME type/i);
    });
  });

  describe("2. EXIF Metadata Stripping & Orientation Correction", () => {
    it("strips EXIF metadata from processed outputs", async () => {
      // Create JPEG with custom EXIF metadata
      const rawWithExif = await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 240, g: 240, b: 240 },
        },
      })
        .jpeg()
        .withMetadata({
          exif: {
            IFD0: {
              Artist: "Architect Studio",
              Copyright: "Confidential 2026",
            },
          },
        })
        .toBuffer();

      const processed = await processAndOptimizeImage(
        rawWithExif,
        "image/jpeg",
        "sample.jpg",
      );

      // Verify output buffer has no EXIF metadata
      const outMeta = await sharp(processed.primary.buffer).metadata();
      expect(outMeta.exif).toBeUndefined();
    });

    it("normalizes EXIF orientation to top-left", async () => {
      // Orientation 6: Top-Right (90 degrees CW rotation)
      // Original buffer is 300w x 150h, but orientation 6 means logical view is 150w x 300h
      const orientedBuffer = await sharp({
        create: {
          width: 300,
          height: 150,
          channels: 3,
          background: { r: 120, g: 120, b: 200 },
        },
      })
        .jpeg()
        .withMetadata({ orientation: 6 })
        .toBuffer();

      const processed = await processAndOptimizeImage(
        orientedBuffer,
        "image/jpeg",
        "rotated.jpg",
      );

      expect(processed.originalWidth).toBe(150);
      expect(processed.originalHeight).toBe(300);

      const outMeta = await sharp(processed.primary.buffer).metadata();
      expect(outMeta.width).toBe(150);
      expect(outMeta.height).toBe(300);
      expect(outMeta.orientation).toBeUndefined();
    });
  });

  describe("3. Responsive Variant Generation & Upscaling Safeguards", () => {
    it("generates WebP variants and never upscales beyond original width", async () => {
      // Image with width 800px (less than 960 and 1600 targets)
      const buffer800 = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 200, g: 200, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      const processed = await processAndOptimizeImage(
        buffer800,
        "image/jpeg",
        "facade.jpg",
      );

      // Candidate target widths [480, 960, 1600]: 480 < 800, 960 and 1600 should not upscale
      expect(processed.variants.every((v) => v.width <= 800)).toBe(true);
      expect(processed.variants.some((v) => v.width === 480)).toBe(true);
      expect(processed.primary.width).toBe(800);
      expect(processed.primary.height).toBe(600);
      expect(processed.primary.format).toBe("webp");
    });

    it("generates full set of responsive variants for large images", async () => {
      const buffer2000 = await sharp({
        create: {
          width: 2000,
          height: 1500,
          channels: 3,
          background: { r: 150, g: 180, b: 210 },
        },
      })
        .png()
        .toBuffer();

      const processed = await processAndOptimizeImage(
        buffer2000,
        "image/png",
        "large-slab.png",
      );

      // Primary is capped at 1600px width
      expect(processed.primary.width).toBe(1600);
      expect(processed.primary.height).toBe(1200);

      const widths = processed.variants.map((v) => v.width);
      for (const target of RESPONSIVE_VARIANT_WIDTHS) {
        expect(widths).toContain(target);
      }
    });

    it("rejects decompression bomb images that exceed allowable pixel limits", async () => {
      // Create an image that exceeds MAX_INPUT_PIXELS threshold
      // 5100 * 5000 = 25,500,000 pixels > MAX_INPUT_PIXELS (25,000,000)
      const oversizedBuffer = await sharp({
        create: {
          width: 5100,
          height: 5000,
          channels: 3,
          background: { r: 128, g: 128, b: 128 },
        },
      })
        .png()
        .toBuffer();

      await expect(
        processAndOptimizeImage(
          oversizedBuffer,
          "image/png",
          "decompression-bomb.png",
        ),
      ).rejects.toThrowError(AppError);
    });
  });

  describe("4. Deterministic Variant Key Derivation & Multi-Variant Deletion", () => {
    it("derives deterministic variant storage keys", () => {
      const keys = deriveVariantStorageKeys("products/123-marble-photo.webp");
      expect(keys).toContain("products/123-marble-photo.webp");
      expect(keys).toContain("products/123-marble-photo-480w.webp");
      expect(keys).toContain("products/123-marble-photo-960w.webp");
      expect(keys).toContain("products/123-marble-photo-1600w.webp");

      // Derivation from a variant key itself maps back to the same base set
      const fromVariant = deriveVariantStorageKeys(
        "products/123-marble-photo-480w.webp",
      );
      expect(fromVariant).toEqual(keys);
    });

    it("deletes all variants of a base storage key from storage", async () => {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mh-storage-test-"));
      const provider = new LocalDevelopmentStorageProvider(
        tempDir,
        "http://localhost:3000/api/v1/storage",
      );

      const basePrefix = "products/test-asset-123";
      const sampleBuf = Buffer.from("dummy-webp-content");

      // Upload primary and variants
      await provider.upload({
        fileName: "test-asset.webp",
        mimeType: "image/webp",
        sizeBytes: sampleBuf.length,
        buffer: sampleBuf,
        customKey: `${basePrefix}.webp`,
      });

      for (const w of RESPONSIVE_VARIANT_WIDTHS) {
        await provider.upload({
          fileName: `test-asset-${w}w.webp`,
          mimeType: "image/webp",
          sizeBytes: sampleBuf.length,
          buffer: sampleBuf,
          customKey: `${basePrefix}-${w}w.webp`,
        });
      }

      // Verify files exist
      const primaryPath = path.join(tempDir, `${basePrefix}.webp`);
      expect(await fs.stat(primaryPath)).toBeDefined();

      for (const w of RESPONSIVE_VARIANT_WIDTHS) {
        const variantPath = path.join(tempDir, `${basePrefix}-${w}w.webp`);
        expect(await fs.stat(variantPath)).toBeDefined();
      }

      // Delete via primary storage key
      await provider.delete(`${basePrefix}.webp`);

      // Verify all files were cleaned up
      await expect(fs.stat(primaryPath)).rejects.toThrow();
      for (const w of RESPONSIVE_VARIANT_WIDTHS) {
        const variantPath = path.join(tempDir, `${basePrefix}-${w}w.webp`);
        await expect(fs.stat(variantPath)).rejects.toThrow();
      }

      await fs.rm(tempDir, { recursive: true, force: true });
    });
  });

  describe("5. Image Utility Helpers", () => {
    it("identifies SVG data URIs and file extensions correctly", () => {
      expect(isSvgImageUrl("data:image/svg+xml;utf8,<svg></svg>")).toBe(true);
      expect(isSvgImageUrl("/icons/logo.svg")).toBe(true);
      expect(isSvgImageUrl("https://cdn.example.com/vector.svg?v=1")).toBe(true);
      expect(isSvgImageUrl("https://cdn.example.com/photo.webp")).toBe(false);
      expect(isSvgImageUrl(null)).toBe(false);
      expect(isSvgImageUrl(undefined)).toBe(false);
    });

    it("derives responsive variant URLs from primary image URLs", () => {
      const primaryUrl =
        "http://localhost:3000/api/v1/storage/products/123-granite.webp";
      expect(getResponsiveVariantUrl(primaryUrl, 480)).toBe(
        "http://localhost:3000/api/v1/storage/products/123-granite-480w.webp",
      );
      expect(getResponsiveVariantUrl(primaryUrl, 960)).toBe(
        "http://localhost:3000/api/v1/storage/products/123-granite-960w.webp",
      );
      expect(getResponsiveVariantUrl(primaryUrl, 1600)).toBe(
        "http://localhost:3000/api/v1/storage/products/123-granite-1600w.webp",
      );

      // Leaves SVGs and data URIs untouched
      const svgUrl = "data:image/svg+xml;utf8,<svg></svg>";
      expect(getResponsiveVariantUrl(svgUrl, 480)).toBe(svgUrl);
    });
  });
});
