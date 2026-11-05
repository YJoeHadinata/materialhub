import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  registerTradeAccountSchema,
  tradeProfileRegistrationSchema,
} from "@/server/validators";

export function getAuthSecret(env: Partial<NodeJS.ProcessEnv> = process.env): string {
  const secret = env.BETTER_AUTH_SECRET;
  const isProduction = env.NODE_ENV === "production";
  const isBuildPhase = env.NEXT_PHASE === "phase-production-build";

  if (isProduction && !isBuildPhase) {
    if (!secret || secret.trim().length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET must be configured with at least 32 characters in production runtime.",
      );
    }
    return secret;
  }

  if (isProduction && isBuildPhase && (!secret || secret.trim().length < 32)) {
    return secret || "build-phase-placeholder-secret-at-least-32-chars-long";
  }

  return (
    secret ||
    "materialhub-local-dev-secret-key-2026-architectural-b2b-platform"
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: getAuthSecret(),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 40,
      },
      "/sign-up/email": {
        window: 60,
        max: 40,
      },
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "MEMBER",
        input: false,
      },
      companyName: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
      companyWebsite: {
        type: "string",
        required: false,
        input: true,
      },
      jobTitle: {
        type: "string",
        required: false,
        input: true,
      },
      tradeStatus: {
        type: "string",
        required: false,
        defaultValue: "PENDING",
        input: false,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as Record<string, unknown> | undefined;
        if (!body || typeof body !== "object") {
          throw new APIError("BAD_REQUEST", {
            message: "Registration payload is required.",
          });
        }

        const profileResult = tradeProfileRegistrationSchema.safeParse(body);
        if (!profileResult.success) {
          throw new APIError("BAD_REQUEST", {
            message:
              profileResult.error.issues[0]?.message ??
              "Invalid trade account profile.",
          });
        }

        if ("email" in body || "password" in body) {
          const fullResult = registerTradeAccountSchema.safeParse(body);
          if (!fullResult.success) {
            throw new APIError("BAD_REQUEST", {
              message:
                fullResult.error.issues[0]?.message ??
                "Invalid registration details.",
            });
          }
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const profileResult = tradeProfileRegistrationSchema.safeParse(user);
          if (!profileResult.success) {
            throw new APIError("BAD_REQUEST", {
              message:
                profileResult.error.issues[0]?.message ??
                "Invalid trade account profile.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
