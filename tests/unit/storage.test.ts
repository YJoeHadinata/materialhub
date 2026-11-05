import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  LocalDevelopmentStorageProvider,
  S3StorageProvider,
  getStorageProvider,
} from "@/lib/storage";
import { GET as storageGetHandler } from "@/app/api/v1/storage/[...key]/route";

describe("Storage Configuration and Route Security", () => {
  const testStorageDir = path.resolve(process.cwd(), ".local-storage", "test-fixtures");
  const testFileName = "sample-stone.jpg";
  const testFilePath = path.join(testStorageDir, testFileName);
  const testFileContent = Buffer.from("fake-jpg-image-binary-data");

  beforeAll(async () => {
    await fs.mkdir(testStorageDir, { recursive: true });
    await fs.writeFile(testFilePath, testFileContent);
  });

  afterAll(async () => {
    try {
      await fs.rm(testStorageDir, { recursive: true, force: true });
    } catch {
      // Cleanup
    }
  });

  describe("getStorageProvider fail-loud configuration", () => {
    it("throws a clear error when STORAGE_DRIVER is s3 but credentials are missing", () => {
      expect(() =>
        getStorageProvider({
          STORAGE_DRIVER: "s3",
          OBJECT_STORAGE_ACCESS_KEY: undefined,
          OBJECT_STORAGE_SECRET_KEY: undefined,
          OBJECT_STORAGE_BUCKET: undefined,
        }),
      ).toThrow(
        /S3 storage driver is configured .* but required credentials or bucket are missing/i,
      );
    });

    it("throws when only access key is provided but secret or bucket is missing", () => {
      expect(() =>
        getStorageProvider({
          STORAGE_DRIVER: "s3",
          OBJECT_STORAGE_ACCESS_KEY: "my-key",
          OBJECT_STORAGE_SECRET_KEY: undefined,
          OBJECT_STORAGE_BUCKET: "my-bucket",
        }),
      ).toThrow(/required credentials or bucket are missing/i);
    });

    it("returns S3StorageProvider when s3 driver is fully configured", () => {
      const provider = getStorageProvider({
        STORAGE_DRIVER: "s3",
        OBJECT_STORAGE_ACCESS_KEY: "my-key",
        OBJECT_STORAGE_SECRET_KEY: "my-secret",
        OBJECT_STORAGE_BUCKET: "my-bucket",
      });
      expect(provider).toBeInstanceOf(S3StorageProvider);
    });

    it("warns in production runtime when local storage driver is used", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const provider = getStorageProvider({
        STORAGE_DRIVER: "local",
        NODE_ENV: "production",
      });
      expect(provider).toBeInstanceOf(LocalDevelopmentStorageProvider);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Using local storage driver in production environment/i),
      );
      warnSpy.mockRestore();
    });
  });

  describe("LocalDevelopmentStorageProvider path traversal protection", () => {
    it("rejects path traversal in upload", async () => {
      const provider = new LocalDevelopmentStorageProvider();
      await expect(
        provider.upload({
          fileName: "../../../malicious.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 100,
          buffer: Buffer.from("test"),
          folder: "../../../escaped",
        }),
      ).rejects.toThrow();
    });

    it("safely ignores path traversal in delete", async () => {
      const provider = new LocalDevelopmentStorageProvider();
      await expect(provider.delete("../../../escaped/file.jpg")).resolves.toBeUndefined();
    });
  });

  describe("GET /api/v1/storage/[...key] route handler", () => {
    it("serves a valid image file with appropriate security and cache headers", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/storage/test-fixtures/sample-stone.jpg");
      const res = await storageGetHandler(req, {
        params: Promise.resolve({ key: ["test-fixtures", "sample-stone.jpg"] }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/jpeg");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Cache-Control")).toContain("public");
      const body = await res.arrayBuffer();
      expect(Buffer.from(body).toString()).toBe("fake-jpg-image-binary-data");
    });

    it("returns 404 for path traversal attempts with ../", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/storage/..%2F..%2Fpackage.json");
      const res = await storageGetHandler(req, {
        params: Promise.resolve({ key: ["..", "..", "package.json"] }),
      });

      expect(res.status).toBe(404);
    });

    it("returns 404 for disallowed file extensions", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/storage/test-fixtures/config.json");
      const res = await storageGetHandler(req, {
        params: Promise.resolve({ key: ["test-fixtures", "config.json"] }),
      });

      expect(res.status).toBe(404);
    });

    it("returns 404 for non-existent files", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/storage/test-fixtures/non-existent.png");
      const res = await storageGetHandler(req, {
        params: Promise.resolve({ key: ["test-fixtures", "non-existent.png"] }),
      });

      expect(res.status).toBe(404);
    });

    it("returns 404 when STORAGE_DRIVER is not local", async () => {
      const originalDriver = process.env.STORAGE_DRIVER;
      process.env.STORAGE_DRIVER = "s3";

      try {
        const req = new NextRequest("http://localhost:3000/api/v1/storage/test-fixtures/sample-stone.jpg");
        const res = await storageGetHandler(req, {
          params: Promise.resolve({ key: ["test-fixtures", "sample-stone.jpg"] }),
        });
        expect(res.status).toBe(404);
      } finally {
        if (originalDriver !== undefined) {
          process.env.STORAGE_DRIVER = originalDriver;
        } else {
          delete process.env.STORAGE_DRIVER;
        }
      }
    });
  });
});
