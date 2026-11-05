/**
 * Utility functions for image rendering and URL detection.
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
