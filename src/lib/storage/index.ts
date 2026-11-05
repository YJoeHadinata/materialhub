import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants";
import { AppError } from "@/lib/utils/api-response";

export interface UploadFileInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  folder?: string;
  customKey?: string;
}

export interface StoredFileResult {
  storageKey: string;
  imageUrl: string;
}

export interface StorageProvider {
  upload(input: UploadFileInput): Promise<StoredFileResult>;
  delete(storageKey: string): Promise<void>;
  getSignedUploadUrl?(key: string, contentType: string): Promise<string>;
}

export function deriveVariantStorageKeys(storageKey: string): string[] {
  const ext = path.extname(storageKey);
  const withoutExt = storageKey.slice(0, -ext.length || undefined);
  const basePrefix = withoutExt.replace(/-\d+w$/, "");

  const keys = new Set<string>();
  keys.add(storageKey);
  keys.add(`${basePrefix}.webp`);
  for (const w of [480, 960, 1600]) {
    keys.add(`${basePrefix}-${w}w.webp`);
  }
  return Array.from(keys).sort();
}

export function validateImageUploadInput(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): void {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      input.mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new AppError(
      "INVALID_IMAGE_FORMAT",
      "Unsupported image format. Allowed formats are JPEG, PNG, and WebP.",
      422,
    );
  }

  const ext = path.extname(input.fileName).toLowerCase();
  if (
    !ALLOWED_IMAGE_EXTENSIONS.includes(
      ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number],
    )
  ) {
    throw new AppError(
      "INVALID_IMAGE_EXTENSION",
      "Unsupported file extension. Allowed extensions are .jpg, .jpeg, .png, and .webp.",
      422,
    );
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError(
      "IMAGE_TOO_LARGE",
      "Image file size must be between 1 byte and 10 MB.",
      422,
    );
  }
}

export function buildSafeStoragePrefix(
  fileName: string,
  folder = "products",
): string {
  const ext = path.extname(fileName).toLowerCase();
  const base = path
    .basename(fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  return `${folder}/${Date.now()}-${base || "asset"}-${randomSuffix}`;
}

export function buildSafeStorageKey(
  fileName: string,
  folder = "products",
): string {
  const ext = path.extname(fileName).toLowerCase() || ".webp";
  const prefix = buildSafeStoragePrefix(fileName, folder);
  return `${prefix}${ext}`;
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config?: {
    endpoint?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    publicBaseUrl?: string;
  }) {
    const endpoint = config?.endpoint ?? process.env.OBJECT_STORAGE_ENDPOINT;
    const region =
      config?.region ?? process.env.OBJECT_STORAGE_REGION ?? "auto";
    const accessKeyId =
      config?.accessKeyId ?? process.env.OBJECT_STORAGE_ACCESS_KEY ?? "";
    const secretAccessKey =
      config?.secretAccessKey ?? process.env.OBJECT_STORAGE_SECRET_KEY ?? "";
    this.bucket =
      config?.bucket ??
      process.env.OBJECT_STORAGE_BUCKET ??
      "materialhub-assets";
    this.publicBaseUrl = (
      config?.publicBaseUrl ??
      process.env.IMAGE_PUBLIC_BASE_URL ??
      ""
    ).replace(/\/$/, "");

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(input: UploadFileInput): Promise<StoredFileResult> {
    validateImageUploadInput(input);
    const storageKey =
      input.customKey ??
      buildSafeStorageKey(input.fileName, input.folder ?? "products");

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const imageUrl = this.publicBaseUrl
      ? `${this.publicBaseUrl}/${storageKey}`
      : `https://${this.bucket}.s3.amazonaws.com/${storageKey}`;

    return { storageKey, imageUrl };
  }

  async delete(storageKey: string): Promise<void> {
    const keysToDelete = deriveVariantStorageKeys(storageKey);
    await Promise.all(
      keysToDelete.map(async (key) => {
        try {
          await this.client.send(
            new DeleteObjectCommand({
              Bucket: this.bucket,
              Key: key,
            }),
          );
        } catch {
          // Ignore if variant key is not found
        }
      }),
    );
  }

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }
}

export class LocalDevelopmentStorageProvider implements StorageProvider {
  private readonly baseDir: string;
  private readonly publicBaseUrl: string;

  constructor(baseDir?: string, publicBaseUrl?: string) {
    this.baseDir = baseDir ?? path.resolve(process.cwd(), ".local-storage");
    this.publicBaseUrl = (
      publicBaseUrl ??
      process.env.IMAGE_PUBLIC_BASE_URL ??
      "http://localhost:3000/api/v1/storage"
    ).replace(/\/$/, "");
  }

  async upload(input: UploadFileInput): Promise<StoredFileResult> {
    validateImageUploadInput(input);
    const storageKey =
      input.customKey ??
      buildSafeStorageKey(input.fileName, input.folder ?? "products");
    const rootWithSep = this.baseDir.endsWith(path.sep)
      ? this.baseDir
      : `${this.baseDir}${path.sep}`;
    const targetPath = path.resolve(this.baseDir, storageKey);

    if (!targetPath.startsWith(rootWithSep)) {
      throw new AppError("INVALID_STORAGE_KEY", "Invalid storage path.", 400);
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, input.buffer);

    return {
      storageKey,
      imageUrl: `${this.publicBaseUrl}/${storageKey}`,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const rootWithSep = this.baseDir.endsWith(path.sep)
      ? this.baseDir
      : `${this.baseDir}${path.sep}`;
    const keysToDelete = deriveVariantStorageKeys(storageKey);

    await Promise.all(
      keysToDelete.map(async (key) => {
        const targetPath = path.resolve(this.baseDir, key);
        if (!targetPath.startsWith(rootWithSep)) {
          return;
        }
        try {
          await fs.unlink(targetPath);
        } catch {
          // Ignore if file already removed in local dev
        }
      }),
    );
  }
}

export function getStorageProvider(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): StorageProvider {
  const driver = env.STORAGE_DRIVER ?? "local";

  if (driver === "s3") {
    const hasS3Credentials =
      Boolean(env.OBJECT_STORAGE_ACCESS_KEY) &&
      Boolean(env.OBJECT_STORAGE_SECRET_KEY) &&
      Boolean(env.OBJECT_STORAGE_BUCKET);

    if (!hasS3Credentials) {
      throw new Error(
        "S3 storage driver is configured (STORAGE_DRIVER=s3) but required credentials or bucket are missing. " +
          "Ensure OBJECT_STORAGE_ACCESS_KEY, OBJECT_STORAGE_SECRET_KEY, and OBJECT_STORAGE_BUCKET are set.",
      );
    }

    return new S3StorageProvider({
      endpoint: env.OBJECT_STORAGE_ENDPOINT,
      region: env.OBJECT_STORAGE_REGION ?? "auto",
      accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY,
      secretAccessKey: env.OBJECT_STORAGE_SECRET_KEY,
      bucket: env.OBJECT_STORAGE_BUCKET,
      publicBaseUrl: env.IMAGE_PUBLIC_BASE_URL,
    });
  }

  if (driver === "local" && env.NODE_ENV === "production") {
    console.warn(
      "[Storage] Warning: Using local storage driver in production environment. Files will be stored on local disk (.local-storage).",
    );
  }

  return new LocalDevelopmentStorageProvider();
}
