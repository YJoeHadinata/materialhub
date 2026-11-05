# System Architecture — MaterialHub

**Architecture Style:** Modular Monolith (Next.js App Router + Service Layer + Drizzle DAL + PostgreSQL)

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    Client["Browser / iPad / Desktop Client"]
    NextApp["Next.js 16.4.5 App Router"]
    Pages["Server Components: Public, Customer & Admin Pages"]
    APIRoutes["REST API Route Handlers (/api/v1/* & /api/auth/*)"]
    AuthGuard["Authorization Guard (src/server/authorization)"]
    Validators["Zod 4 Input Validators (src/server/validators)"]
    Services["Domain Services (Product, Moodboard, TradeAccount, CSV, Taxonomy, Audit)"]
    Storage["Storage Abstraction (S3StorageProvider / LocalDevelopmentStorageProvider)"]
    Drizzle["Drizzle ORM 0.45.4 Data Access Layer"]
    Postgres[("PostgreSQL 18 Database")]

    Client --> NextApp
    NextApp --> Pages
    NextApp --> APIRoutes
    Pages --> AuthGuard
    APIRoutes --> AuthGuard
    APIRoutes --> Validators
    AuthGuard --> Services
    Validators --> Services
    Services --> Storage
    Services --> Drizzle
    Drizzle --> Postgres
```

---

## 2. Layered Responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Presentation Layer | `src/app/`, `src/components/` | Editorial UI rendering, URL state synchronization, accessible forms, responsive desktop/iPad/mobile layouts. |
| API & Route Layer | `src/app/api/v1/` | HTTP request parsing, rate limiting, standardized JSON envelope formatting (`{ success, data, meta }` / `{ success, error }`). |
| Authorization Layer | `src/server/authorization/index.ts` | Centralized server-side session resolution via Better Auth, role checks (`MEMBER` vs `ADMIN`), trade status checks (`APPROVED`), and moodboard ownership verification. |
| Validation Layer | `src/server/validators/index.ts` | Strict Zod 4 schemas for products, SKUs, slugs, pagination parameters, moodboards, trade account transitions, and CSV rows. |
| Service Layer | `src/server/services/*.service.ts` | Transactional business workflows, duplicate SKU/slug detection, CSV batch atomicity, and automatic audit log generation. |
| Storage Layer | `src/lib/storage/index.ts` | `StorageProvider` interface decoupling product image uploads from the underlying storage engine (`S3StorageProvider` vs `LocalDevelopmentStorageProvider`). |
| Data Access & Persistence | `src/db/schema/index.ts`, `src/db/index.ts` | Strongly typed PostgreSQL schema, foreign keys, composite unique indexes, and connection pooling. |
