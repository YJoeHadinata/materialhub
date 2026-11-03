# Technology Version Audit & Compatibility Report

**Project:** MaterialHub — B2B Architectural Materials Platform  
**Verification Date:** 2026-11-04  
**Method:** Live npm registry inspection (`npm view`) and peer-dependency graph analysis

---

## 1. Local Development Environment

| Component | Detected Value | Status |
|---|---|---|
| Operating System | macOS Darwin 27.0.0 (`arm64` / Apple Silicon) | Supported |
| CPU Architecture | ARM64 (`RELEASE_ARM64_T8132`) | Supported |
| Node.js Runtime | `v26.12.1` | Supported (`next@16.4.5` requires `>=20.9.0`) |
| Package Manager | `npm 11.20.0` | Selected and pinned via `package-lock.json` |
| Git Version | `git version 2.56.0` | Supported |
| PostgreSQL Engine | `psql (PostgreSQL) 18.6 (Homebrew)` | Running on `localhost:5432` |

---

## 2. Verified Package Versions

All direct dependencies were inspected against the live npm registry on **2026-11-04**. Exact versions are pinned in `package.json` without floating ranges (`^` or `~`).

| Package | Selected Version | Latest Stable Verified | Official Source | Verification Date |
|---|---|---|---|---|
| `next` | `16.4.5` | `16.4.5` | https://nextjs.org/docs & npm registry | 2026-11-04 |
| `react` | `19.3.1` | `19.3.1` | https://react.dev & npm registry | 2026-11-04 |
| `react-dom` | `19.3.1` | `19.3.1` | https://react.dev & npm registry | 2026-11-04 |
| `typescript` | `6.0.3` | `7.0.2` (see Section 3) | https://www.typescriptlang.org/docs & npm registry | 2026-11-04 |
| `tailwindcss` | `4.3.4` | `4.3.4` | https://tailwindcss.com/docs & npm registry | 2026-11-04 |
| `@tailwindcss/postcss` | `4.3.4` | `4.3.4` | https://tailwindcss.com/docs & npm registry | 2026-11-04 |
| `pg` | `8.23.1` | `8.23.1` | https://node-postgres.com & npm registry | 2026-11-04 |
| `drizzle-orm` | `0.45.4` | `0.45.4` | https://orm.drizzle.team/docs/overview & npm registry | 2026-11-04 |
| `drizzle-kit` | `0.31.11` | `0.31.11` | https://orm.drizzle.team/docs/kit-overview & npm registry | 2026-11-04 |
| `better-auth` | `1.7.15` | `1.7.15` | https://www.better-auth.com/docs & npm registry | 2026-11-04 |
| `zod` | `4.6.7` | `4.6.7` | https://zod.dev & npm registry | 2026-11-04 |
| `lucide-react` | `1.67.0` | `1.67.0` | https://lucide.dev/guide/packages/lucide-react & npm registry | 2026-11-04 |
| `@aws-sdk/client-s3` | `3.1161.0` | `3.1161.0` | https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/ & npm registry | 2026-11-04 |
| `@aws-sdk/s3-request-presigner` | `3.1161.0` | `3.1161.0` | https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/ & npm registry | 2026-11-04 |
| `vitest` | `5.1.0` | `5.1.0` | https://vitest.dev/guide/ & npm registry | 2026-11-04 |
| `@playwright/test` | `1.64.1` | `1.64.1` | https://playwright.dev/docs/intro & npm registry | 2026-11-04 |
| `eslint` | `9.39.5` | `10.14.0` (see Section 3) | https://eslint.org/docs/latest/ & npm registry | 2026-11-04 |
| `eslint-config-next` | `16.4.5` | `16.4.5` | https://nextjs.org/docs/app/api-reference/config/eslint & npm registry | 2026-11-04 |
| `@eslint/eslintrc` | `3.3.7` | `3.3.7` | https://eslint.org & npm registry | 2026-11-04 |
| `dotenv` | `18.0.9` | `18.0.9` | https://github.com/motdotla/dotenv & npm registry | 2026-11-04 |
| `tsx` | `4.23.15` | `4.23.15` | https://tsx.is & npm registry | 2026-11-04 |
| `@types/node` | `26.6.6` | `26.6.6` | npm registry | 2026-11-04 |
| `@types/react` | `19.3.0` | `19.3.0` | npm registry | 2026-11-04 |
| `@types/react-dom` | `19.3.0` | `19.3.0` | npm registry | 2026-11-04 |
| `@types/pg` | `8.23.1` | `8.23.1` | npm registry | 2026-11-04 |

---

## 3. Compatibility Decisions & Intentional Pinning

### 3.1 TypeScript (`6.0.3` selected instead of `7.0.2`)

- **Finding:** While `typescript@7.0.2` is published on npm, `eslint-config-next@16.4.5` depends on `typescript-eslint@^8.56.0` (currently `8.72.1`). Inspection of `typescript-eslint@8.72.1` peer dependencies shows:
  ```json
  {
    "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
    "typescript": ">=4.8.4 <6.1.0"
  }
  ```
- **Decision:** Selecting `typescript@6.0.3` (the latest stable 6.0.x release) satisfies `typescript-eslint` peer dependency constraints (`<6.1.0`), `next@16.4.5`, and `drizzle-orm@0.45.4` without requiring `--legacy-peer-deps` or triggering AST parser mismatches during ESLint checks.

### 3.2 ESLint (`9.39.5` selected instead of `10.14.0`)

- **Finding:** While `eslint@10.14.0` is published, `eslint-config-next@16.4.5` bundles `eslint-plugin-react@^7.37.0`, `eslint-plugin-import@^2.32.0`, and `eslint-plugin-jsx-a11y@^6.10.0`. Live inspection of those three plugins shows their peer dependencies cap at `eslint: "^9"`:
  - `eslint-plugin-react@7.37.5`: `eslint: '^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7'`
  - `eslint-plugin-import@2.32.0`: `eslint: '^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9'`
  - `eslint-plugin-jsx-a11y@6.10.2`: `eslint: '^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9'`
- **Decision:** Selecting `eslint@9.39.5` (the latest stable ESLint 9 release) guarantees 100% peer-dependency compatibility with `eslint-config-next@16.4.5` while supporting flat configuration (`eslint.config.mjs`).

### 3.3 Better Auth + Drizzle ORM + Zod 4 Compatibility

- **Finding:** `better-auth@1.7.15` declares direct support for:
  - `next`: `^14.0.0 || ^15.0.0 || ^16.0.0`
  - `react`: `^18.0.0 || ^19.0.0`
  - `drizzle-orm`: `^0.45.2 || >=1.0.0-rc.1 <2.0.0`
  - `drizzle-kit`: `>=0.31.4 || >=1.0.0-beta.1`
  - `pg`: `^8.0.0`
  - `vitest`: `^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0`
  - And bundles `zod@^4.5.4` internally.
- **Decision:** Combining `better-auth@1.7.15`, `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, `pg@8.23.1`, and `zod@4.6.7` provides a zero-conflict, stable, non-prerelease stack.

### 3.4 Tailwind CSS v4 (`4.3.4`)

- **Finding:** Tailwind CSS v4 uses `@tailwindcss/postcss@4.3.4` and CSS-first configuration (`@import "tailwindcss";` and `@theme` directives in CSS) rather than legacy `tailwind.config.js` files.
- **Decision:** We follow the official Tailwind CSS v4 PostCSS setup with `postcss.config.mjs` and CSS design tokens in `src/app/globals.css`.
