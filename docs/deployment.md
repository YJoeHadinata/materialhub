# Deployment & Operations Guide — MaterialHub

---

## 1. Environments

MaterialHub is structured for three environments:

1. **Local Development:** Node.js, local PostgreSQL (`materialhub_dev` and `materialhub_test`), and `STORAGE_DRIVER="local"`.
2. **Preview / Staging:** GitHub Actions CI + Vercel Preview Deployments connected to a staging PostgreSQL branch.
3. **Production:** Vercel Production Deployment + Managed PostgreSQL (Neon, Supabase, or AWS RDS) + S3-Compatible Object Storage (AWS S3 or Cloudflare R2).

---

## 2. Required Production Environment Variables

Configure the following variables in Vercel Project Settings:

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/materialhub_prod?sslmode=require"
BETTER_AUTH_SECRET="<32+ byte cryptographic secret>"
BETTER_AUTH_URL="https://your-production-domain.com"
APP_URL="https://your-production-domain.com"

STORAGE_DRIVER="s3"
OBJECT_STORAGE_REGION="auto"
OBJECT_STORAGE_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
OBJECT_STORAGE_BUCKET="materialhub-assets"
OBJECT_STORAGE_ACCESS_KEY="<access-key>"
OBJECT_STORAGE_SECRET_KEY="<secret-key>"
IMAGE_PUBLIC_BASE_URL="https://cdn.your-production-domain.com"
```

---

## 3. Controlled Database Migration Process

1. Generate SQL migrations locally after any schema change:
   ```bash
   npm run db:generate
   ```
2. Review the generated SQL file in `src/db/migrations/` and commit it to Git.
3. Apply migrations during deployment before switching traffic:
   ```bash
   npm run db:migrate
   ```
4. Never run destructive reset commands against production databases.

---

## 4. Operational Architecture Boundaries & Known Limitations

- **In-Memory Rate Limiting on Serverless:** Sensitive mutation endpoints and Better Auth use in-process sliding windows. If deploying on serverless infrastructure (e.g. Vercel Functions), rate limits do not share state across cold starts or concurrent instances. A production Redis store (e.g. Upstash) is recommended for distributed protection.
- **Fail-Loud Object Storage:** Setting `STORAGE_DRIVER="s3"` without complete S3/R2 credentials immediately throws an explicit configuration error at server startup. When `STORAGE_DRIVER="local"`, files are served from `.local-storage` via `/api/v1/storage/[...key]`. If local storage is used while `NODE_ENV=production`, a prominent security warning is emitted.
- **Image Optimization & CDN Host Configuration:** Next.js dynamic image optimization in `next.config.ts` configures `image/avif` and `image/webp` formats. Hostnames for external storage are dynamically derived from `IMAGE_PUBLIC_BASE_URL` and `OBJECT_STORAGE_ENDPOINT` without wildcard hostname vulnerabilities. In local development mode, local assets are optimized through `localPatterns` matching `/api/v1/storage/**`.
- **CI vs Local Quality Gates:** The GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, strict typecheck, PostgreSQL migrations, unit/integration test suites, and production Next.js build. Full browser Playwright E2E tests are configured for local verification against the test database.
