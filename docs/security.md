# Security Architecture & Controls — MaterialHub

---

## 1. Authentication & Session Security

- **Authentication Engine:** Better Auth `1.7.15` backed by PostgreSQL (`user`, `session`, `account`, `verification` tables) via Drizzle ORM.
- **Role Assignment Protection:** In `src/lib/auth/index.ts`, the `role` and `tradeStatus` user fields are configured with `input: false`, preventing any client registration request from self-assigning `ADMIN` role or `APPROVED` trade status. Every newly registered user receives `role = "MEMBER"` and `tradeStatus = "PENDING"`.
- **Cookie Security:** Configured with HTTP-only session cookies and `useSecureCookies` enabled in production.

---

## 2. Server-Side Authorization & IDOR Prevention

All authorization checks are centralized in `src/server/authorization/index.ts` and `src/server/authorization/page-guards.tsx`:

- `requireAuthenticatedUser()` & `requireAuthenticatedUserPage()`: Verifies active session, redirects unauthenticated page visits to `/login`, and blocks `SUSPENDED` accounts (`403 ACCOUNT_SUSPENDED`).
- `requireApprovedTradeMember()` & `requireApprovedTradeMemberPage()`: Enforces `tradeStatus === "APPROVED"` (or `ADMIN`) on all customer moodboard endpoints and server component pages. Non-approved users receive a dedicated status review notice.
- `requireAdministrator()` & `requireAdminPage()`: Enforces `role === "ADMIN"` and active trade status on all `/api/v1/admin/*` endpoints and at the top of every administrative page (`/admin/*`). Admin layouts serve presentation navigation only and are not treated as a security boundary.
- `assertMoodboardOwnership(moodboardUserId, actorUserId)`: Prevents Insecure Direct Object Reference (IDOR) across moodboard `GET`, `PATCH`, `DELETE`, item addition, item removal, and item reordering operations.

---

## 3. Input Validation & Upload Hardening

- **Zod Validation:** Every API payload and query parameter is validated with Zod schemas in `src/server/validators/index.ts`.
- **Server Registration Hook:** Better Auth request and database hooks (`hooks.before` and `databaseHooks.user.create.before`) validate all trade application fields (`name`, `companyName` max 160, `companyWebsite` http/https only, `jobTitle` max 120) server-side and reject invalid payloads with `400 Bad Request`.
- **Upload Validation & Content Inspection (Magic Bytes):** Uploaded files are inspected end-to-end via `processAndOptimizeImage()` using `sharp`. The actual binary header is decoded to identify the real image format (`jpeg`, `png`, `webp`). Uploads that fail binary decoding, contain disguised non-image payloads (e.g. text/scripts renamed to `.png`), or contradict the declared MIME type or extension are rejected immediately with a `422 Unprocessable Entity` `AppError`.
- **Decompression Bomb Defense:** Sharp decoders enforce `limitInputPixels: 25_000_000` (25 megapixels) and explicit total pixel validations to guard against malicious memory exhaustion payloads.
- **Privacy & EXIF Stripping:** Uploaded image outputs are auto-rotated based on EXIF orientation tags and stripped of all sensitive EXIF, GPS location, camera model, and timestamp metadata before storage.
- **Storage Isolation:** Both S3 and local storage providers enforce directory boundary confinement (`baseDir + path.sep`), rejecting `../` path traversal. The local file serving route (`/api/v1/storage/[...key]`) is active only when `STORAGE_DRIVER === "local"` and enforces `X-Content-Type-Options: nosniff`.
- **Rate Limiting:** Sensitive endpoints (`/api/v1/admin/products/import` and `/api/v1/admin/uploads`) enforce per-actor rate limits via `enforceRateLimit()`.
- **Audit Log Sanitization:** `recordAuditLog()` strips any sensitive keys (`password`, `token`, `secret`, `accessToken`, `refreshToken`, `authorization`) before persisting JSONB metadata.
- **HTTP Security Headers:** Configured in `next.config.ts` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).

---

## 4. Known Security Limitations & Architecture Boundaries

1. **In-Memory Rate Limiting:** Sliding-window rate limiters (`src/lib/utils/rate-limit.ts` and Better Auth rate limiting) use in-process memory stores. They are per-instance and do not synchronize across distributed serverless functions. A production multi-region or serverless deployment requires a shared Redis or Upstash KV instance.
2. **No Password Reset or Email Verification Flow:** Better Auth is configured for direct password authentication. The application contains no password reset token generation/dispatch flow, password recovery routes, or email verification flows. Trade accounts are reviewed and approved directly by platform administrators.
3. **Production Auth Secret:** `getAuthSecret()` mandates a minimum 32-character `BETTER_AUTH_SECRET` in production runtime, while allowing development fallbacks outside production.
