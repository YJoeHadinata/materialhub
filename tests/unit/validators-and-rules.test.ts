import { describe, expect, it } from "vitest";
import {
  addMoodboardItemSchema,
  catalogueQuerySchema,
  createMoodboardSchema,
  createProductSchema,
  csvRowSchema,
  registerTradeAccountSchema,
  reorderMoodboardItemsSchema,
  updateTradeAccountStatusSchema,
} from "@/server/validators";
import {
  parseCsvString,
  validateCsvHeaders,
} from "@/server/services/csv-import.service";
import {
  assertMoodboardOwnership,
  canAccessTradeWorkspace,
  isAdminUser,
} from "@/server/authorization";
import { resolveTradeStatusAuditAction } from "@/server/services/trade-account.service";
import { validateImageUploadInput } from "@/lib/storage";

describe("MaterialHub Unit Tests — Validation, CSV, Permissions & Business Rules", () => {
  describe("1. Product Validation & SKU/Slug Rules", () => {
    const validProductPayload = {
      name: "Jura Beige Honed Slab",
      sku: "MH-STN-900",
      slug: "jura-beige-honed-slab",
      description:
        "Dense German sedimentary limestone calibrated for high-traffic commercial floors.",
      materialTypeId: "550e8400-e29b-41d4-a716-446655440000",
      finishId: "550e8400-e29b-41d4-a716-446655440001",
      dimensionText: "2400 x 1200 x 20 mm",
      widthMm: 1200,
      heightMm: 2400,
      thicknessMm: 20,
      moqValue: 25,
      moqUnit: "sqm",
      status: "PUBLISHED" as const,
      isFeatured: true,
      applicationIds: ["550e8400-e29b-41d4-a716-446655440002"],
    };

    it("accepts a valid architectural product specification", () => {
      const parsed = createProductSchema.safeParse(validProductPayload);
      expect(parsed.success).toBe(true);
    });

    it("rejects non-kebab-case product slugs", () => {
      const parsed = createProductSchema.safeParse({
        ...validProductPayload,
        slug: "Invalid Slug With Spaces!",
      });
      expect(parsed.success).toBe(false);
    });

    it("rejects invalid SKUs with special symbols or too short length", () => {
      const parsed = createProductSchema.safeParse({
        ...validProductPayload,
        sku: "A!",
      });
      expect(parsed.success).toBe(false);
    });

    it("rejects zero or negative MOQ values", () => {
      const zeroMoq = createProductSchema.safeParse({
        ...validProductPayload,
        moqValue: 0,
      });
      const negativeMoq = createProductSchema.safeParse({
        ...validProductPayload,
        moqValue: -10,
      });
      expect(zeroMoq.success).toBe(false);
      expect(negativeMoq.success).toBe(false);
    });

    it("requires at least one application UUID", () => {
      const parsed = createProductSchema.safeParse({
        ...validProductPayload,
        applicationIds: [],
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("2. Catalogue Query Validation", () => {
    it("applies default page=1, pageSize=24, and sort=featured", () => {
      const parsed = catalogueQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(24);
      expect(parsed.sort).toBe("featured");
    });

    it("enforces maximum pageSize of 48", () => {
      const parsed = catalogueQuerySchema.safeParse({ pageSize: 100 });
      expect(parsed.success).toBe(false);
    });
  });

  describe("3. CSV Parsing & Row Validation", () => {
    it("parses RFC 4180 CSV with quoted commas and escaped quotes", () => {
      const csv = `sku,name,slug,description,material_type,finish,dimension,moq_value,moq_unit,applications,status
MH-STN-777,"Pietra Grey, Calibrated",pietra-grey-calibrated,"Dense stone, ""Grade A"" architectural slab.",natural-stone,honed-matte,2400 x 1200 x 20 mm,30,sqm,flooring;facade,PUBLISHED`;

      const { headers, rows } = parseCsvString(csv);
      expect(validateCsvHeaders(headers).valid).toBe(true);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.raw.name).toBe("Pietra Grey, Calibrated");
      expect(rows[0]?.raw.description).toBe(
        'Dense stone, "Grade A" architectural slab.',
      );

      const rowValidation = csvRowSchema.safeParse(rows[0]?.raw);
      expect(rowValidation.success).toBe(true);
    });

    it("reports missing required CSV headers", () => {
      const headerCheck = validateCsvHeaders(["sku", "name", "slug"]);
      expect(headerCheck.valid).toBe(false);
      expect(headerCheck.missingHeaders).toContain("material_type");
      expect(headerCheck.missingHeaders).toContain("moq_value");
    });

    it("rejects invalid CSV row with negative MOQ or invalid status", () => {
      const badRow = csvRowSchema.safeParse({
        sku: "MH-STN-888",
        name: "Test Stone",
        slug: "test-stone",
        description: "Valid length description for stone.",
        material_type: "natural-stone",
        finish: "honed-matte",
        dimension: "1200 x 600 mm",
        moq_value: "-5",
        moq_unit: "sqm",
        applications: "flooring",
        status: "INVALID_STATUS",
      });
      expect(badRow.success).toBe(false);
    });
  });

  describe("4. Moodboard Business Rule Validators & Ownership", () => {
    it("validates moodboard creation and item reorder payloads", () => {
      expect(
        createMoodboardSchema.safeParse({
          name: "Atrium Stone Palette",
          description: "Level 1 lobby surfaces",
        }).success,
      ).toBe(true);

      expect(
        addMoodboardItemSchema.safeParse({
          productId: "550e8400-e29b-41d4-a716-446655440000",
        }).success,
      ).toBe(true);

      expect(
        reorderMoodboardItemsSchema.safeParse({
          itemIds: ["550e8400-e29b-41d4-a716-446655440000"],
        }).success,
      ).toBe(true);
    });

    it("enforces moodboard ownership and throws 403 when user IDs differ", () => {
      expect(() =>
        assertMoodboardOwnership("user-owner-1", "user-owner-1"),
      ).not.toThrow();

      expect(() =>
        assertMoodboardOwnership("user-owner-1", "user-intruder-2"),
      ).toThrowError(/permission/i);
    });
  });

  describe("5. Trade Account Status Transitions & Permission Checks", () => {
    it("permits only APPROVED members and ADMIN users into the trade workspace", () => {
      expect(
        canAccessTradeWorkspace({ role: "MEMBER", tradeStatus: "PENDING" }),
      ).toBe(false);
      expect(
        canAccessTradeWorkspace({ role: "MEMBER", tradeStatus: "REJECTED" }),
      ).toBe(false);
      expect(
        canAccessTradeWorkspace({ role: "MEMBER", tradeStatus: "SUSPENDED" }),
      ).toBe(false);
      expect(
        canAccessTradeWorkspace({ role: "MEMBER", tradeStatus: "APPROVED" }),
      ).toBe(true);
      expect(
        canAccessTradeWorkspace({ role: "ADMIN", tradeStatus: "APPROVED" }),
      ).toBe(true);
    });

    it("distinguishes ADMIN role from MEMBER role", () => {
      expect(isAdminUser({ role: "ADMIN" })).toBe(true);
      expect(isAdminUser({ role: "MEMBER" })).toBe(false);
    });

    it("maps trade status transitions to accurate audit actions", () => {
      expect(resolveTradeStatusAuditAction("PENDING", "APPROVED")).toBe(
        "TRADE_ACCOUNT_APPROVED",
      );
      expect(resolveTradeStatusAuditAction("PENDING", "REJECTED")).toBe(
        "TRADE_ACCOUNT_REJECTED",
      );
      expect(resolveTradeStatusAuditAction("APPROVED", "SUSPENDED")).toBe(
        "TRADE_ACCOUNT_SUSPENDED",
      );
      expect(resolveTradeStatusAuditAction("SUSPENDED", "APPROVED")).toBe(
        "TRADE_ACCOUNT_REACTIVATED",
      );
    });

    it("validates trade registration and status update inputs", () => {
      expect(
        registerTradeAccountSchema.safeParse({
          name: "Clara Lindholm",
          email: "clara@studio.arch",
          password: "SecurePassword123!",
          companyName: "Lindholm Architects",
          companyWebsite: "https://studio.arch",
          jobTitle: "Principal Architect",
        }).success,
      ).toBe(true);

      expect(
        updateTradeAccountStatusSchema.safeParse({
          status: "APPROVED",
        }).success,
      ).toBe(true);
    });
  });

  describe("6. Image Upload Format & Size Validation", () => {
    it("accepts JPEG, PNG, and WebP under 10 MB", () => {
      expect(() =>
        validateImageUploadInput({
          fileName: "limestone-slab.webp",
          mimeType: "image/webp",
          sizeBytes: 2 * 1024 * 1024,
        }),
      ).not.toThrow();
    });

    it("rejects unsupported MIME types or oversized files (>10 MB)", () => {
      expect(() =>
        validateImageUploadInput({
          fileName: "malicious.svg",
          mimeType: "image/svg+xml",
          sizeBytes: 1024,
        }),
      ).toThrowError(/Unsupported image format/i);

      expect(() =>
        validateImageUploadInput({
          fileName: "huge-photo.jpg",
          mimeType: "image/jpeg",
          sizeBytes: 12 * 1024 * 1024,
        }),
      ).toThrowError(/10 MB/i);
    });
  });
});
