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
