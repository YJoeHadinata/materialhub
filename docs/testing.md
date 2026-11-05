# Testing Strategy & Verification Guide — MaterialHub

MaterialHub employs a three-tier automated testing strategy using **Vitest 5.1.0** and **Playwright 1.64.1**.

---

## 1. Test Suites

### 1.1 Unit Tests (`tests/unit/*.test.ts`)
Covers:
- **Validators & Rules (`validators-and-rules.test.ts`):** Product schema validation, SKU format rules, kebab-case slug validation, positive MOQ requirements, catalogue query parameter bounds, RFC 4180 CSV parser diagnostics, and image upload format limits.
- **Production Auth Secret Guard (`auth-secret.test.ts`):** Verifies that `BETTER_AUTH_SECRET` is strictly enforced with at least 32 characters in production runtime, while allowing development fallbacks and production build-phase placeholders.
- **Storage Provider & Local Route (`storage.test.ts`):** Verifies fail-loud error throwing on misconfigured S3 environments, production warnings on local driver, `baseDir + path.sep` boundary containment on upload/delete, and `GET /api/v1/storage/[...key]` security rules (rejecting path traversal `../`, non-image extensions, and non-local drivers).
- **Authorization & Page Guards (`authorization-guards.test.ts`):** Verifies that `requireAdministrator`, `requireApprovedTradeMember`, `requireAuthenticatedUser`, and page-level guards (`requireAdminPage`, `requireApprovedTradeMemberPage`, `requireAuthenticatedUserPage`) reject unauthenticated, `MEMBER`, and `SUSPENDED` users, and permit `ADMIN` and `APPROVED` members.
- **Server-Side Registration Hook (`registration-hook.test.ts`):** Verifies that Better Auth server hooks reject invalid trade registration payloads (including `javascript:` URLs, oversized company names > 160 characters, and short names) with `400 Bad Request`.

### 1.2 Integration Tests (`tests/integration/services.integration.test.ts`)
Runs against a real PostgreSQL test database (`materialhub_test`):
- Public catalogue queries: search (`q`), material filter, finish filter, sorting, and pagination.
- Product CRUD lifecycle: creation, duplicate SKU rejection (`409`), update, and archiving (`status = "ARCHIVED"`).
- Moodboard lifecycle: creation, adding published products, rejecting duplicate products in the same moodboard (`409`), item reordering, cross-user ownership enforcement (`403`), item removal, and moodboard deletion.
- Transactional CSV bulk import: verifying that a batch with an invalid row rolls back/aborts without partial writes, and a valid batch commits atomically with audit logging.
- Trade account status transitions and admin dashboard metric aggregation.

### 1.3 End-to-End Tests (`tests/e2e/materialhub.spec.ts`)
Executes full browser workflows across Desktop (`1440x900`) and iPad/Tablet (`820x1180`) viewports:
1. Public visitor journeys: Homepage discovery, catalogue browsing, keyword search, material filtering, and product specification detail view.
2. Negative security journeys: Unauthenticated API access (`401`), unauthenticated `/moodboards` redirect to `/login`, and non-admin member attempting `/api/v1/admin/dashboard` (`403`).
3. Full trade lifecycle: Visitor registers a trade account (`PENDING`) -> Administrator logs in and approves the account -> Trade member logs in (`APPROVED`), creates a moodboard, adds materials, reorders materials, removes a material, and updates moodboard metadata.
4. Full administrator lifecycle: Administrator creates a new product specification and executes a CSV bulk import with preview and confirmation.

---

## 2. Running Tests Locally

```bash
# Run Unit and Integration tests against materialhub_test
DATABASE_URL="postgresql://localhost:5432/materialhub_test" npm test

# Run Playwright End-to-End tests
npm run test:e2e
```
