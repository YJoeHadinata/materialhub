import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import {
  registerTradeAccountSchema,
  tradeProfileRegistrationSchema,
} from "@/server/validators";

describe("Trade Registration Server-Side Validation (Task 4)", () => {
  describe("Zod Validation Schemas", () => {
    it("rejects javascript: scheme in companyWebsite", () => {
      const result = tradeProfileRegistrationSchema.safeParse({
        name: "Test Architect",
        companyName: "Valid Studio",
        companyWebsite: "javascript:alert(1)",
        jobTitle: "Senior Architect",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(
          /Company website must be a valid URL/i,
        );
      }
    });

    it("rejects oversized companyName (> 160 characters)", () => {
      const result = tradeProfileRegistrationSchema.safeParse({
        name: "Test Architect",
        companyName: "A".repeat(161),
        companyWebsite: "https://valid-studio.com",
        jobTitle: "Senior Architect",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/160 characters/i);
      }
    });

    it("accepts valid trade registration payload", () => {
      const result = registerTradeAccountSchema.safeParse({
        name: "Marcus Vance",
        email: "marcus@vance-atelier.com",
        password: "ValidPassword123!",
        companyName: "Vance Atelier",
        companyWebsite: "https://vance-atelier.com",
        jobTitle: "Design Principal",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Direct POST to Better Auth Sign-Up Endpoint", () => {
    it("rejects direct POST with javascript: website with 400 Bad Request", async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          name: "Attacker User",
          email: "attacker@example.com",
          password: "Password123!",
          companyName: "Evil Corp",
          companyWebsite: "javascript:alert('xss')",
          jobTitle: "Hacker",
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(400);

      const json = (await res.json()) as { message?: string };
      expect(json.message).toMatch(/Company website must be a valid URL/i);
    });

    it("rejects direct POST with oversized companyName with 400 Bad Request", async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          name: "Valid User",
          email: "valid@example.com",
          password: "Password123!",
          companyName: "X".repeat(161),
          companyWebsite: "https://valid-studio.com",
          jobTitle: "Architect",
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(400);

      const json = (await res.json()) as { message?: string };
      expect(json.message).toMatch(/160 characters/i);
    });

    it("rejects direct POST with short name (< 2 characters) with 400 Bad Request", async () => {
      const req = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          name: "A",
          email: "valid@example.com",
          password: "Password123!",
          companyName: "Valid Studio",
        }),
      });

      const res = await auth.handler(req);
      expect(res.status).toBe(400);

      const json = (await res.json()) as { message?: string };
      expect(json.message).toMatch(/Full name is required/i);
    });
  });
});
