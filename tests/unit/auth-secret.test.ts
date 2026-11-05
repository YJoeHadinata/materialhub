import { describe, expect, it } from "vitest";
import { getAuthSecret } from "@/lib/auth";

describe("Auth Secret Security Configuration", () => {
  it("allows development/test runtime without BETTER_AUTH_SECRET using fallback", () => {
    const secret = getAuthSecret({
      NODE_ENV: "development",
      BETTER_AUTH_SECRET: undefined,
    });
    expect(secret).toBe(
      "materialhub-local-dev-secret-key-2026-architectural-b2b-platform",
    );
  });

  it("throws in production runtime when BETTER_AUTH_SECRET is missing", () => {
    expect(() =>
      getAuthSecret({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: undefined,
        NEXT_PHASE: undefined,
      }),
    ).toThrow(/BETTER_AUTH_SECRET must be configured with at least 32 characters/i);
  });

  it("throws in production runtime when BETTER_AUTH_SECRET is shorter than 32 characters", () => {
    expect(() =>
      getAuthSecret({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: "short-secret-under-32-chars",
        NEXT_PHASE: undefined,
      }),
    ).toThrow(/BETTER_AUTH_SECRET must be configured with at least 32 characters/i);
  });

  it("returns configured BETTER_AUTH_SECRET in production when valid (>= 32 chars)", () => {
    const validSecret = "a-very-long-production-secret-with-more-than-32-characters";
    const secret = getAuthSecret({
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: validSecret,
      NEXT_PHASE: undefined,
    });
    expect(secret).toBe(validSecret);
  });

  it("does not throw during Next.js production build phase even if secret is absent", () => {
    const secret = getAuthSecret({
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: undefined,
      NEXT_PHASE: "phase-production-build",
    });
    expect(secret).toBeTruthy();
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });
});
