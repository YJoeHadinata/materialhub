import type { NextConfig } from "next";

function getRemotePatterns() {
  const patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "http",
      hostname: "localhost",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
    },
  ];

  const imagePublicBaseUrl = process.env.IMAGE_PUBLIC_BASE_URL;
  if (imagePublicBaseUrl) {
    try {
      const parsed = new URL(imagePublicBaseUrl);
      const protocol = parsed.protocol.replace(":", "") as "http" | "https";
      patterns.push({
        protocol,
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        pathname: parsed.pathname ? `${parsed.pathname.replace(/\/$/, "")}/**` : "/**",
      });
    } catch {
      // Ignore invalid URL format
    }
  }

  const s3Endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
  if (s3Endpoint) {
    try {
      const parsed = new URL(s3Endpoint);
      const protocol = parsed.protocol.replace(":", "") as "http" | "https";
      patterns.push({
        protocol,
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        pathname: parsed.pathname ? `${parsed.pathname.replace(/\/$/, "")}/**` : "/**",
      });
    } catch {
      // Ignore invalid URL format
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: getRemotePatterns(),
    localPatterns: [
      {
        pathname: "/api/v1/storage/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
