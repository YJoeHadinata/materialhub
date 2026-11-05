/**
 * Utility functions for image rendering, variant derivation, and URL detection.
 */

/**
 * Detects if an image source represents an SVG vector image (file or data URI).
 * Next.js does not optimize SVG images by default, and passing unoptimized={true}
 * ensures secure, direct vector rendering without invoking the server image optimizer.
 */
export function isSvgImageUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  return (
    url.startsWith("data:image/svg+xml") ||
    url.endsWith(".svg") ||
    url.includes(".svg?") ||
    url.includes("/svg")
  );
}

/**
 * Derives the deterministic storage variant URL for a given target width (480, 960, 1600).
 * Storage convention: `{basePrefix}-{width}w.webp`.
 * For SVG vector assets, data URIs, or external hosts that don't match the convention,
 * returns the original URL unchanged.
 */
export function getResponsiveVariantUrl(
  url: string | null | undefined,
  targetWidth: 480 | 960 | 1600,
): string {
  if (!url || isSvgImageUrl(url)) {
    return url ?? "";
  }
  const withoutExt = url.replace(/\.(webp|jpg|jpeg|png)$/i, "");
  const basePrefix = withoutExt.replace(/-\d+w$/, "");
  return `${basePrefix}-${targetWidth}w.webp`;
}

