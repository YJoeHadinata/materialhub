import { describe, expect, it, vi } from "vitest";
import {
  requireAdministrator,
  requireApprovedTradeMember,
  requireAuthenticatedUser,
  requireAdminPage,
  requireApprovedTradeMemberPage,
  requireAuthenticatedUserPage,
} from "@/server/authorization";
import type { AuthenticatedUser } from "@/types";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

describe("Authorization Guards and Page Guards", () => {
  const adminUser: AuthenticatedUser = {
    id: "admin-id",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMIN",
    tradeStatus: "APPROVED",
    companyName: "MaterialHub Ops",
    companyWebsite: "https://materialhub.local",
    jobTitle: "Platform Admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const approvedMember: AuthenticatedUser = {
    id: "member-approved-id",
    name: "Approved Member",
    email: "approved@studio.arch",
    role: "MEMBER",
    tradeStatus: "APPROVED",
    companyName: "Studio Arch",
    companyWebsite: "https://studio.arch",
    jobTitle: "Architect",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pendingMember: AuthenticatedUser = {
    id: "member-pending-id",
    name: "Pending Member",
    email: "pending@studio.arch",
    role: "MEMBER",
    tradeStatus: "PENDING",
    companyName: "Studio Arch",
    companyWebsite: "https://studio.arch",
    jobTitle: "Designer",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const suspendedMember: AuthenticatedUser = {
    id: "member-suspended-id",
    name: "Suspended Member",
    email: "suspended@studio.arch",
    role: "MEMBER",
    tradeStatus: "SUSPENDED",
    companyName: "Studio Arch",
    companyWebsite: "https://studio.arch",
    jobTitle: "Designer",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const suspendedAdmin: AuthenticatedUser = {
    ...adminUser,
    id: "suspended-admin-id",
    tradeStatus: "SUSPENDED",
  };

  describe("API and Service Authorization Guards", () => {
    describe("requireAuthenticatedUser", () => {
      it("throws 401 when user is unauthenticated", async () => {
        await expect(requireAuthenticatedUser(undefined, null)).rejects.toThrow(
          /Authentication is required/i,
        );
      });

      it("returns the user for any authenticated status", async () => {
        const result = await requireAuthenticatedUser(undefined, pendingMember);
        expect(result.id).toBe(pendingMember.id);
      });
    });

    describe("requireApprovedTradeMember", () => {
      it("throws 401 when unauthenticated", async () => {
        await expect(
          requireApprovedTradeMember(undefined, null),
        ).rejects.toThrow(/Authentication is required/i);
      });

      it("throws 403 for PENDING trade member", async () => {
        await expect(
          requireApprovedTradeMember(undefined, pendingMember),
        ).rejects.toThrow(/approved trade account is required/i);
      });

      it("throws 403 for SUSPENDED trade member", async () => {
        await expect(
          requireApprovedTradeMember(undefined, suspendedMember),
        ).rejects.toThrow(/trade account is currently suspended/i);
      });

      it("allows APPROVED trade member", async () => {
        const user = await requireApprovedTradeMember(
          undefined,
          approvedMember,
        );
        expect(user.id).toBe(approvedMember.id);
      });

      it("allows ADMIN user with approved status", async () => {
        const user = await requireApprovedTradeMember(undefined, adminUser);
        expect(user.id).toBe(adminUser.id);
      });
    });

    describe("requireAdministrator", () => {
      it("throws 401 when unauthenticated", async () => {
        await expect(requireAdministrator(undefined, null)).rejects.toThrow(
          /Authentication is required/i,
        );
      });

      it("throws 403 for MEMBER even if APPROVED", async () => {
        await expect(
          requireAdministrator(undefined, approvedMember),
        ).rejects.toThrow(/Administrator privileges are required/i);
      });

      it("throws 403 for SUSPENDED ADMIN", async () => {
        await expect(
          requireAdministrator(undefined, suspendedAdmin),
        ).rejects.toThrow(/trade account is currently suspended/i);
      });

      it("allows active ADMIN", async () => {
        const user = await requireAdministrator(undefined, adminUser);
        expect(user.id).toBe(adminUser.id);
      });
    });
  });

  describe("Server Component Page Guards", () => {
    describe("requireAuthenticatedUserPage", () => {
      it("redirects unauthenticated user to /login", async () => {
        mockRedirect.mockClear();
        await expect(
          requireAuthenticatedUserPage(undefined, null),
        ).rejects.toThrow(/NEXT_REDIRECT:\/login/);
        expect(mockRedirect).toHaveBeenCalledWith("/login");
      });

      it("returns authenticated user", async () => {
        const user = await requireAuthenticatedUserPage(
          undefined,
          approvedMember,
        );
        expect(user.id).toBe(approvedMember.id);
      });
    });

    describe("requireAdminPage", () => {
      it("redirects unauthenticated visitor to /login", async () => {
        mockRedirect.mockClear();
        await expect(requireAdminPage(undefined, null)).rejects.toThrow(
          /NEXT_REDIRECT:\/login/,
        );
        expect(mockRedirect).toHaveBeenCalledWith("/login");
      });

      it("returns 403 view response for regular MEMBER", async () => {
        const auth = await requireAdminPage(undefined, approvedMember);
        expect(auth.authorized).toBe(false);
        if (!auth.authorized) {
          expect(auth.response).toBeDefined();
        }
      });

      it("returns 403 view response for SUSPENDED ADMIN", async () => {
        const auth = await requireAdminPage(undefined, suspendedAdmin);
        expect(auth.authorized).toBe(false);
      });

      it("accepts active ADMIN user", async () => {
        const auth = await requireAdminPage(undefined, adminUser);
        expect(auth.authorized).toBe(true);
        if (auth.authorized) {
          expect(auth.user.id).toBe(adminUser.id);
        }
      });
    });

    describe("requireApprovedTradeMemberPage", () => {
      it("redirects unauthenticated visitor to /login", async () => {
        mockRedirect.mockClear();
        await expect(
          requireApprovedTradeMemberPage(undefined, null),
        ).rejects.toThrow(/NEXT_REDIRECT:\/login/);
        expect(mockRedirect).toHaveBeenCalledWith("/login");
      });

      it("returns trade-required notice for PENDING trade member", async () => {
        const auth = await requireApprovedTradeMemberPage(
          undefined,
          pendingMember,
        );
        expect(auth.authorized).toBe(false);
        if (!auth.authorized) {
          expect(auth.response).toBeDefined();
        }
      });

      it("returns trade-required notice for SUSPENDED member", async () => {
        const auth = await requireApprovedTradeMemberPage(
          undefined,
          suspendedMember,
        );
        expect(auth.authorized).toBe(false);
      });

      it("accepts APPROVED trade member", async () => {
        const auth = await requireApprovedTradeMemberPage(
          undefined,
          approvedMember,
        );
        expect(auth.authorized).toBe(true);
        if (auth.authorized) {
          expect(auth.user.id).toBe(approvedMember.id);
        }
      });

      it("accepts active ADMIN user", async () => {
        const auth = await requireApprovedTradeMemberPage(undefined, adminUser);
        expect(auth.authorized).toBe(true);
        if (auth.authorized) {
          expect(auth.user.id).toBe(adminUser.id);
        }
      });
    });
  });
});
