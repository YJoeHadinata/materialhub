# Security Architecture & Controls — MaterialHub

---

## 1. Authentication & Session Security

- **Authentication Engine:** Better Auth `1.7.15` backed by PostgreSQL (`user`, `session`, `account`, `verification` tables) via Drizzle ORM.
- **Role Assignment Protection:** In `src/lib/auth/index.ts`, the `role` and `tradeStatus` user fields are configured with `input: false`, preventing any client registration request from self-assigning `ADMIN` role or `APPROVED` trade status. Every newly registered user receives `role = "MEMBER"` and `tradeStatus = "PENDING"`.
- **Cookie Security:** Configured with HTTP-only session cookies and `useSecureCookies` enabled in production.

---

## 2. Server-Side Authorization & IDOR Prevention

All authorization checks are centralized in `src/server/authorization/index.ts`:

- `requireAuthenticatedUser()`: Verifies active session and blocks `SUSPENDED` accounts (`403 ACCOUNT_SUSPENDED`).
- `requireApprovedTradeMember()`: Enforces `tradeStatus === "APPROVED"` (or `ADMIN`) on all moodboard endpoints.
- `requireAdministrator()`: Enforces `role === "ADMIN"` on all `/api/v1/admin/*` endpoints, taxonomy mutations, and `/admin/*` server layouts.
- `assertMoodboardOwnership(moodboardUserId, actorUserId)`: Prevents Insecure Direct Object Reference (IDOR) across moodboard `GET`, `PATCH`, `DELETE`, item addition, item removal, and item reordering operations.

---

## 3. Input Validation & Upload Hardening

- **Zod Validation:** Every API payload and query parameter is validated with Zod schemas in `src/server/validators/index.ts`.
- **Upload Validation:** `validateImageUploadInput()` strictly allow-lists MIME types (`image/jpeg`, `image/png`, `image/webp`) and file extensions (`.jpg`, `.jpeg`, `.png`, `.webp`), and enforces a 10 MB maximum file size. Storage keys are sanitized and suffixed with cryptographic random bytes (`crypto.randomBytes(8)`), preventing path traversal.
- **Rate Limiting:** Sensitive endpoints (`/api/v1/admin/products/import` and `/api/v1/admin/uploads`) enforce per-actor rate limits via `enforceRateLimit()`.
- **Audit Log Sanitization:** `recordAuditLog()` strips any sensitive keys (`password`, `token`, `secret`, `accessToken`, `refreshToken`, `authorization`) before persisting JSONB metadata.
- **HTTP Security Headers:** Configured in `next.config.ts` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
