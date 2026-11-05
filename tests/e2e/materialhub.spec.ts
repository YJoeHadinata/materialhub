import { expect, test } from "@playwright/test";

test.describe("MaterialHub End-to-End User Journeys & Security Verification", () => {
  test("1. Public Visitor: Homepage, Catalogue, Search, Filtering, and Product Detail", async ({
    page,
  }, testInfo) => {
    // 1. Visitor opens homepage
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Technical material discovery for architectural specification/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Featured Architectural Materials/i }),
    ).toBeVisible();
    if (testInfo.project.name === "chromium-desktop") {
      await page.screenshot({ path: "docs/screenshots/01-homepage.png" });
    }

    // 2. Visitor browses catalogue
    await page.getByRole("link", { name: /Explore Material Catalogue/i }).click();
    await expect(page).toHaveURL(/\/catalogue/);
    await expect(
      page.getByRole("heading", { name: /Architectural Material Catalogue/i }),
    ).toBeVisible();
    if (testInfo.project.name === "chromium-desktop") {
      await page.screenshot({ path: "docs/screenshots/02-catalogue.png" });
    }

    // 3. Visitor searches for products
    const searchInput = page.getByLabel(
      /Search by product name, SKU, or specification/i,
    );
    await searchInput.fill("Jura Beige");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/q=Jura\+Beige|q=Jura%20Beige/);
    await expect(
      page
        .getByRole("link", { name: "Jura Beige Architectural Limestone", exact: true }),
    ).toBeVisible();

    // Clear filters and test parametric filter
    await page.getByRole("button", { name: /Clear All Filters/i }).click();
    await expect(page).toHaveURL("/catalogue");

    // 4. Visitor filters products by material
    await page.getByLabel(/Material Category/i).selectOption("natural-stone");
    await expect(page).toHaveURL(/material=natural-stone/);

    // 5. Visitor opens product details
    await page
      .getByRole("link", { name: /Jura Beige Architectural Limestone/i })
      .first()
      .click();
    await expect(page).toHaveURL(
      /\/products\/jura-beige-architectural-limestone/,
    );
    await expect(page.getByText(/SKU: MH-STN-001/i)).toBeVisible();
    await expect(page.getByText(/2400 x 1200 x 20 mm/i).first()).toBeVisible();
    if (testInfo.project.name === "chromium-desktop") {
      await page.screenshot({ path: "docs/screenshots/03-product-detail.png" });
    }
  });

  test("2. Negative Security: Unauthorized Visitor & Cross-User Moodboard / Admin Restrictions", async ({
    request,
    page,
  }) => {
    // 18. Unauthorized visitor attempts to access restricted API resources
    const unauthMoodboards = await request.get("/api/v1/moodboards");
    expect(unauthMoodboards.status()).toBe(401);

    const unauthAdmin = await request.get("/api/v1/admin/dashboard");
    expect(unauthAdmin.status()).toBe(401);

    // Unauthenticated visitor visiting /moodboards is redirected to /login
    await page.goto("/moodboards");
    await expect(page).toHaveURL(/\/login/);
  });

  test("3. Visitor Registers Trade Account -> Admin Approves -> Member Logs In & Manages Moodboards", async ({
    page,
  }, testInfo) => {
    const uniqueEmail = `e2e.architect.${Date.now()}@studio.arch`;

    // 6. Visitor registers a new trade account
    await page.goto("/register");
    await page.getByLabel(/Full Name/i).fill("Henrik Lind");
    await page.getByLabel(/Business Email/i).fill(uniqueEmail);
    await page.getByLabel(/Password/i).fill("ArchitectPass123!");
    await page.getByLabel(/Company \/ Studio Name/i).fill("Lind Spatial Studio");
    await page.getByLabel(/Professional Role/i).fill("Lead Architect");
    await page
      .getByRole("button", { name: /Submit Trade Application/i })
      .click();

    // Verify new account lands on /account with PENDING status
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByText(/Trade Status: PENDING/i)).toBeVisible();

    // Sign out pending user
    await page.getByRole("button", { name: /Sign Out/i }).click();
    await expect(page).toHaveURL("/");

    // 7. Administrator logs in and approves trade account
    await page.goto("/login");
    await page.getByLabel(/Business Email/i).fill("admin@materialhub.arch");
    await page.getByLabel(/Password/i).fill("AdminPassword123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/account/);

    await page.goto("/admin/trade-accounts?status=PENDING");
    const applicantRow = page.locator("tr", { hasText: uniqueEmail });
    await expect(applicantRow).toBeVisible();
    const approveResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/v1/admin/trade-accounts/") &&
        resp.request().method() === "PATCH" &&
        resp.status() === 200,
    );
    await applicantRow.getByRole("button", { name: "Approve" }).click();
    await approveResponsePromise;

    // Sign out Admin
    await page.getByRole("button", { name: /Sign Out/i }).click();
    await expect(page).toHaveURL("/");

    // 8. Approved Member logs in
    await page.goto("/login");
    await page.getByLabel(/Business Email/i).fill(uniqueEmail);
    await page.getByLabel(/Password/i).fill("ArchitectPass123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByText(/Trade Status: APPROVED/i)).toBeVisible();

    // 20. Non-admin member attempts administrative operations (403 Forbidden)
    const memberAdminRes = await page.request.get("/api/v1/admin/dashboard");
    expect(memberAdminRes.status()).toBe(403);

    // 9. Member creates moodboard
    await page.goto("/moodboards");
    await page.getByLabel(/Moodboard Name/i).fill("Oslo Opera Extension");
    await page
      .getByLabel(/Architectural Scope/i)
      .fill("Exterior stone and acoustic timber specifications");
    await page.getByRole("button", { name: "Create" }).click();

    const createdBoardLink = page.getByRole("link", {
      name: "Oslo Opera Extension",
    });
    await expect(createdBoardLink).toBeVisible();
    await createdBoardLink.click();

    // 10, 11, 12, 13. Member adds products, reorders, removes, and edits moodboard
    await expect(
      page.getByRole("heading", { name: "Oslo Opera Extension" }),
    ).toBeVisible();

    // Add first material
    const firstAddPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/items") &&
        resp.request().method() === "POST" &&
        resp.status() === 201,
    );
    await page
      .getByRole("button", { name: /Add Material to Moodboard/i })
      .click();
    await firstAddPromise;
    await expect(page.getByText(/Material added to moodboard/i)).toBeVisible();

    // Add second material
    await page
      .getByLabel(/Select Material Specification/i)
      .selectOption({ index: 1 });
    const secondAddPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/items") &&
        resp.request().method() === "POST" &&
        resp.status() === 201,
    );
    await page
      .getByRole("button", { name: /Add Material to Moodboard/i })
      .click();
    await secondAddPromise;
    await expect(page.getByText(/#2 ·/i)).toBeVisible();

    // Reorder (move second item up)
    await page
      .getByRole("button", { name: /Move .* earlier in sequence/i })
      .nth(1)
      .click();
    await expect(page.getByText(/Palette sequence updated/i)).toBeVisible();
    if (testInfo.project.name === "chromium-desktop") {
      await page.screenshot({
        path: "docs/screenshots/04-moodboard-workspace.png",
      });
    }

    // Remove one item
    await page
      .getByRole("button", { name: /Remove .* from moodboard/i })
      .first()
      .click();
    await expect(
      page.getByText(/Material removed from moodboard/i),
    ).toBeVisible();

    // Edit moodboard name
    await page
      .getByLabel(/Moodboard Name/i)
      .fill("Oslo Opera Extension — Phase II");
    await page.getByRole("button", { name: /Update Moodboard Info/i }).click();
    await expect(page.getByText(/Moodboard metadata saved/i)).toBeVisible();
  });

  test("4. Administrator: Product CRUD, Image Upload, and CSV Bulk Import", async ({
    page,
  }, testInfo) => {
    await page.goto("/login");
    await page.getByLabel(/Business Email/i).fill("admin@materialhub.arch");
    await page.getByLabel(/Password/i).fill("AdminPassword123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/account/);

    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: /Operational Overview/i }),
    ).toBeVisible();
    if (testInfo.project.name === "chromium-desktop") {
      await page.screenshot({
        path: "docs/screenshots/05-admin-dashboard.png",
      });
    }

    // 14 & 16. Admin creates product and uploads image
    const suffix = Date.now().toString().slice(-4);
    const testSku = `MH-E2E-${suffix}`;
    const testSlug = `e2e-travertine-slab-${suffix}`;

    await page.goto("/admin/products/new");
    await page
      .getByLabel(/Product Name/i)
      .fill(`E2E Travertine Slab ${suffix}`);
    await page.getByLabel(/Unique SKU/i).fill(testSku);
    await page.getByLabel(/URL Slug/i).fill(testSlug);
    await page
      .getByLabel(/Technical Description/i)
      .fill(
        "Calibrated architectural travertine slab verified by Playwright E2E test.",
      );

    await page
      .getByRole("button", { name: /Create Product Specification/i })
      .click();
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.getByText(testSku)).toBeVisible();

    // 17. Admin previews and executes CSV bulk import
    await page.goto("/admin/imports");
    const csvSku = `MH-CSV-${suffix}`;
    const csvSlug = `csv-imported-slate-${suffix}`;
    const csvPayload = `sku,name,slug,description,material_type,finish,dimension,moq_value,moq_unit,applications,status
${csvSku},CSV Imported Slate ${suffix},${csvSlug},Architectural slate imported via E2E CSV workflow.,natural-stone,honed-matte,1200 x 600 x 20 mm,25,sqm,flooring,PUBLISHED`;

    await page.getByLabel(/CSV Payload/i).fill(csvPayload);
    await page
      .getByRole("button", { name: /Validate & Preview Records/i })
      .click();
    await expect(page.getByText(/Ready for transactional insert/i)).toBeVisible();

    await page
      .getByRole("button", { name: /Confirm & Import 1 Products/i })
      .click();
    await expect(page.getByText(/Successfully Imported:/i)).toBeVisible();
  });
});
