import fs from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver !== "local") {
    return new Response("Not Found", { status: 404 });
  }

  const { key } = await context.params;
  if (!key || !Array.isArray(key) || key.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  const relativePath = key.join(path.sep);
  const ext = path.extname(relativePath).toLowerCase();
  const contentType = MIME_MAP[ext];
  if (!contentType) {
    return new Response("Not Found", { status: 404 });
  }

  const baseDir = path.resolve(process.cwd(), ".local-storage");
  const rootWithSep = baseDir.endsWith(path.sep)
    ? baseDir
    : `${baseDir}${path.sep}`;
  const targetPath = path.resolve(baseDir, relativePath);

  if (!targetPath.startsWith(rootWithSep)) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(targetPath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
