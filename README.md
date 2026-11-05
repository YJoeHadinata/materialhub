# MaterialHub — B2B Architectural Materials Catalogue & Moodboard Platform

MaterialHub is a B2B web application built with a production-style architecture, with known limitations, designed for architects, interior designers, property developers, and specification teams to discover architectural materials, inspect calibrated technical specifications, and curate project-specific moodboard palettes.

> **Portfolio Project Notice:** MaterialHub is an independent personal portfolio demonstration project designed and developed by **Yoshua Joe** to showcase the technical capabilities required for a Senior Full-Stack Web Developer role maintaining and scaling a B2B architectural materials platform. It demonstrates modern Next.js App Router architecture, strict TypeScript, PostgreSQL database design with Drizzle ORM, multi-role authentication and server-side authorization with Better Auth, parametric catalogue search, transaction-safe CSV imports, and comprehensive test coverage (Vitest & Playwright E2E). This repository is published strictly for technical evaluation and non-commercial portfolio presentation; commercial use or redistribution is not permitted. All branding, catalogue SKUs, and specifications are fictional and created independently.

It includes a complete administrative console for managing the product catalogue, material classifications, surface finishes, architectural applications, image storage, CSV bulk imports, trade account approvals, and operational audit logs.

---

## 1. Main Features

### Public Material Discovery
- **Editorial Architectural Homepage:** Featured specifications, material discipline index, application collections, and trade membership onboarding.
- **Parametric Product Catalogue (`/catalogue`):** Server-side search (`q` across name, SKU, and description), combined filtering (`material`, `finish`, `application`), sorting (`featured`, `newest`, `name_asc`, `name_desc`), and pagination (`page`, `pageSize`) synchronized with URL query parameters.
- **Technical Specification Detail (`/products/[slug]`):** Calibrated millimeter measurements (`width_mm`, `height_mm`, `thickness_mm`), minimum order quantities (`moq_value` and `moq_unit`), certified applications, interactive multi-image gallery, and related material specifications.

### Customer Trade Workspace
- **Trade Account Registration & Status Gating:** Self-service trade registration defaulting to `MEMBER` role and `PENDING` status. Server-side protection prevents client-side privilege escalation.
- **Project Moodboards (`/moodboards`):** Approved trade members create, edit, and delete private moodboards, add published materials (with database-level duplicate prevention), remove items, and reorder material sequences. Archived products remain safely referenced on existing moodboards while blocked from new additions.

### Platform Administration (`/admin/*`)
- **Operational Dashboard (`/admin/dashboard`):** Live counts of total, published, draft, and archived products, pending/approved trade accounts, total moodboards, and the immutable administrative audit trail.
- **Product CRUD & Image Management (`/admin/products`):** Create, edit, publish, draft, and archive products. Upload JPEG, PNG, and WebP images (up to 10 MB) through the storage provider abstraction, select primary images, edit alt text, and reorder gallery views.
- **Taxonomy Management (`/admin/categories`):** Create and inspect Material Types, Surface Finishes, and Architectural Applications.
- **Trade Account Governance (`/admin/trade-accounts`):** Search and filter trade accounts by status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) and execute status transitions with automatic audit logging.
- **Transactional CSV Bulk Import (`/admin/imports`):** Upload or paste CSV batches, validate headers and individual rows against taxonomy and uniqueness rules, preview row-level diagnostics, and execute atomic transactional imports.

### Application Screenshots
- [Homepage (`docs/screenshots/01-homepage.png`)](docs/screenshots/01-homepage.png)
- [Parametric Material Catalogue (`docs/screenshots/02-catalogue.png`)](docs/screenshots/02-catalogue.png)
- [Technical Specification Detail (`docs/screenshots/03-product-detail.png`)](docs/screenshots/03-product-detail.png)
- [Customer Moodboard Workspace (`docs/screenshots/04-moodboard-workspace.png`)](docs/screenshots/04-moodboard-workspace.png)
- [Administrative Operations Dashboard (`docs/screenshots/05-admin-dashboard.png`)](docs/screenshots/05-admin-dashboard.png)

---

## 2. Technology Stack

All versions were verified against the live npm registry on **2026-11-04** and pinned in `package.json` (see [`docs/technology-version-audit.md`](docs/technology-version-audit.md)):

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | `16.4.5` |
| UI Library | React & React DOM | `19.3.1` |
| Language | TypeScript (Strict Mode) | `6.0.3` |
| Styling | Tailwind CSS & `@tailwindcss/postcss` | `4.3.4` |
| Icons | Lucide React (SVG icons, zero emojis) | `1.67.0` |
| Database | PostgreSQL | `18.6` (`pg@8.23.1`) |
| ORM & Migrations | Drizzle ORM & Drizzle Kit | `0.45.4` / `0.31.11` |
| Authentication | Better Auth (PostgreSQL Drizzle Adapter) | `1.7.15` |
| Validation | Zod | `4.6.7` |
| Object Storage | AWS SDK v3 S3 Client & Presigner | `3.1161.0` |
| Image Processing | Sharp | `0.35.5` |
| Unit & Integration Testing | Vitest | `5.1.0` |
| End-to-End Testing | Playwright | `1.64.1` |
| Linting | ESLint & `eslint-config-next` | `9.39.5` / `16.4.5` |

---

## 3. Architecture & Project Structure

MaterialHub uses a clean **Modular Monolith** architecture separating presentation, API route handlers, centralized authorization, Zod validation, domain services, and Drizzle ORM persistence:

```text
src/
├── app/
│   ├── (public)/               # Homepage, Catalogue, and Product Detail pages
│   ├── (auth)/                 # Trade Login and Registration pages
│   ├── (customer)/             # Trade Account Profile and Moodboards workspace
│   ├── admin/                  # Admin Dashboard, Products, Categories, Trade Accounts, CSV Import
│   └── api/
│       ├── auth/[...all]/      # Better Auth handler
│       └── v1/                 # REST API endpoints (/products, /moodboards, /admin/*, /storage/*)
├── components/
│   ├── ui/                     # Reusable Badges, Pagination, Empty States
│   ├── layout/                 # Responsive SiteHeader and SiteFooter
│   ├── catalogue/              # ProductCard and CatalogueFilters
│   ├── products/               # Interactive ProductGallery
│   ├── moodboards/             # Moodboard dialogs, workspace list, and sequence editor
│   └── admin/                  # Admin product table, editor form, taxonomy, trade & CSV tools
├── server/
│   ├── authorization/          # Centralized server-side session, role, tradeStatus & ownership guards
│   ├── validators/             # Zod 4 validation schemas
│   └── services/               # Product, Moodboard, TradeAccount, Taxonomy, CSV Import & Audit services
├── db/
│   ├── schema/                 # Drizzle PostgreSQL schema (13 tables + enums + relations)
│   ├── migrations/             # Committed SQL migrations
│   ├── seed/                   # Idempotent seed script (5 materials, 8 finishes, 8 apps, 41 products)
│   ├── index.ts                # PostgreSQL connection pool
│   └── migrate.ts              # Programmatic migration runner
└── lib/
    ├── auth/                   # Better Auth server & React client configuration
    ├── storage/                # StorageProvider interface (S3 + Local dev adapter)
    ├── constants/              # Catalogue defaults, upload limits, CSV headers
    └── utils/                  # API response helpers, rate limiter, formatting utilities
```

Detailed documentation is available in [`docs/`](docs/):
- [`docs/product-requirements.md`](docs/product-requirements.md)
- [`docs/technology-version-audit.md`](docs/technology-version-audit.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/database-schema.md`](docs/database-schema.md) (includes Mermaid ERD)
- [`docs/api-documentation.md`](docs/api-documentation.md)
- [`docs/security.md`](docs/security.md)
- [`docs/deployment.md`](docs/deployment.md)
- [`docs/testing.md`](docs/testing.md)
- [`docs/implementation-status.md`](docs/implementation-status.md)

---

## 4. Local Development Setup

### Prerequisites
- Node.js `>= 20.9.0` (verified on `v26.12.1`)
- npm `>= 10.0.0` (verified on `11.20.0`)
- PostgreSQL `>= 15` running locally on port `5432` (verified on PostgreSQL `18.6`)

### Step 1: Clone & Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the local development and test databases exist:
```bash
psql -h localhost -p 5432 -d postgres -c "CREATE DATABASE materialhub_dev;"
psql -h localhost -p 5432 -d postgres -c "CREATE DATABASE materialhub_test;"
```

### Step 3: Run Database Migrations
```bash
npm run db:migrate
DATABASE_URL="postgresql://localhost:5432/materialhub_test" npm run db:migrate
```

### Step 4: Seed Sample Architectural Data & Demo Accounts
```bash
npm run db:seed
```
The seed script is idempotent and provisions:
- **5 Material Types:** Natural Stone, Ceramic, Timber, Metal Panels, Glass
- **8 Finishes:** Honed Matte, Brushed Textured, Fluted Ribbed, Polished Specular, Sandblasted, Anodized Satin, Natural Unsealed, Patinated Oxide
- **8 Applications:** Flooring, Wall Cladding, Facade, Countertops, Acoustic Ceilings, Interior Partitions, Wet Areas, Bespoke Joinery
- **41 Architectural Products** with calibrated millimeter dimensions, MOQ values, and multi-angle SVG architectural swatches
- **3 Sample Project Moodboards**

### Step 5: Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000`.

---

## 5. Demo Accounts (Development Environment Only)

| Role | Trade Status | Email | Password | Capabilities |
|---|---|---|---|---|
| **Administrator** | `APPROVED` | `admin@materialhub.arch` | `AdminPassword123!` | Full admin console, product CRUD, taxonomy CRUD, CSV import, trade approvals, audit logs |
| **Trade Member 1** | `APPROVED` | `architect@atelier-nord.arch` | `TradePassword123!` | Full moodboard workspace, item sequencing, profile editing |
| **Trade Member 2** | `APPROVED` | `studio@kengo-interiors.arch` | `TradePassword123!` | Full moodboard workspace (isolated from Member 1's moodboards) |
| **Pending Member** | `PENDING` | `pending@veritas-build.arch` | `TradePassword123!` | Public catalogue access; moodboard workspace locked until admin approval |

---

## 6. Testing & Quality Gates

```bash
# Run ESLint
npm run lint

# Run TypeScript strict type checking
npm run typecheck

# Run Vitest unit & PostgreSQL integration tests
DATABASE_URL="postgresql://localhost:5432/materialhub_test" npm test

# Build production bundle
npm run build

# Run Playwright End-to-End tests (Desktop 1440px & iPad 820px)
npm run test:e2e
```

---

## 7. Known Limitations & Architecture Boundaries

MaterialHub is engineered with a production-style architecture, with known limitations documented transparently:

1. **In-Memory Rate Limiting:** Rate limiting on sensitive endpoints (`/api/v1/admin/products/import`, `/api/v1/admin/uploads`, and Better Auth auth endpoints) is implemented in-memory using an in-process sliding window (`src/lib/utils/rate-limit.ts`). This is scoped per process instance and is not distributed across serverless instances or multi-region workers. Production serverless deployments require an external key-value store such as Redis or Upstash.
2. **No Password Reset or Email Verification Flow:** Better Auth is configured for direct email and password authentication. No self-service password reset flow, reset token dispatch, or email verification flows are implemented in the UI or backend services. User onboarding relies on direct trade registration and administrator status approval.
3. **Object Storage Provider in Local Mode:** When S3 credentials (`OBJECT_STORAGE_ACCESS_KEY`, `OBJECT_STORAGE_SECRET_KEY`, `OBJECT_STORAGE_ENDPOINT`) are not set, `STORAGE_DRIVER="local"` uses `LocalDevelopmentStorageProvider` and serves uploaded images via `/api/v1/storage/[...key]`. If `STORAGE_DRIVER="s3"` is configured with missing credentials, initialization fails immediately with an explicit error. In production, set `STORAGE_DRIVER="s3"` with managed S3 or Cloudflare R2 bucket credentials.
4. **Synchronous CSV Import Limit:** Bulk CSV import processes up to 500 rows per synchronous transaction (`MAX_CSV_IMPORT_ROWS = 500`), covering standard B2B architectural batches without external background workers. Larger catalogues require an asynchronous job queue (e.g. BullMQ or AWS SQS).
5. **Continuous Integration Scope:** The GitHub Actions pipeline (`.github/workflows/ci.yml`) executes ESLint, TypeScript strict typechecking, database migrations against PostgreSQL 18, Vitest unit and integration suites, and the production Next.js build. Full Playwright E2E suites are run locally against the test database with browser engines installed.

---

## 8. License & Commercial Use Restrictions

This project is authored by **Yoshua Joe** solely as a personal engineering portfolio demonstration.

- **Non-Commercial & Evaluation Only:** Viewing, inspecting, building, and running this project locally for technical evaluation, hiring review, or recruitment purposes is permitted.
- **Commercial Use Prohibited:** Commercial exploitation, hosting as a commercial service or SaaS, redistribution, resale, or sublicensing of this codebase (in whole or in part) is strictly prohibited without prior written consent from the author.

Copyright (c) 2026 Yoshua Joe. All rights reserved. See [LICENSE](LICENSE) for full details.

All architectural sample specifications, SKUs, and material descriptions are fictional and created independently for portfolio demonstration purposes.
