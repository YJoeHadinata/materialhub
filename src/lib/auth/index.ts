import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

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
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "materialhub-local-dev-secret-key-2026-architectural-b2b-platform",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
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
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
