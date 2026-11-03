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

function buildSafeStorageKey(fileName: string, folder = "products"): string {
  const ext = path.extname(fileName).toLowerCase() || ".jpg";
  const base = path
    .basename(fileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  return `${folder}/${Date.now()}-${base || "asset"}-${randomSuffix}${ext}`;
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
    const region = process.env.OBJECT_STORAGE_REGION ?? "auto";
    const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY ?? "";
    const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_KEY ?? "";
    this.bucket = process.env.OBJECT_STORAGE_BUCKET ?? "materialhub-assets";
    this.publicBaseUrl = (
      process.env.IMAGE_PUBLIC_BASE_URL ?? ""
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
    const storageKey = buildSafeStorageKey(
      input.fileName,
      input.folder ?? "products",
    );

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
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
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

  constructor() {
    this.baseDir = path.resolve(process.cwd(), ".local-storage");
    this.publicBaseUrl = (
      process.env.IMAGE_PUBLIC_BASE_URL ??
      "http://localhost:3000/api/v1/storage"
    ).replace(/\/$/, "");
  }

  async upload(input: UploadFileInput): Promise<StoredFileResult> {
    validateImageUploadInput(input);
    const storageKey = buildSafeStorageKey(
      input.fileName,
      input.folder ?? "products",
    );
    const targetPath = path.resolve(this.baseDir, storageKey);

    if (!targetPath.startsWith(this.baseDir)) {
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
    const targetPath = path.resolve(this.baseDir, storageKey);
    if (!targetPath.startsWith(this.baseDir)) {
      return;
    }
    try {
      await fs.unlink(targetPath);
    } catch {
      // Ignore if file already removed in local dev
    }
  }
}

export function getStorageProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  const hasS3Credentials =
    Boolean(process.env.OBJECT_STORAGE_ACCESS_KEY) &&
    Boolean(process.env.OBJECT_STORAGE_SECRET_KEY) &&
    Boolean(process.env.OBJECT_STORAGE_BUCKET);

  if (driver === "s3" && hasS3Credentials) {
    return new S3StorageProvider();
  }

  return new LocalDevelopmentStorageProvider();
}
