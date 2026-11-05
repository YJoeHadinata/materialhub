# REST API Documentation — MaterialHub (`/api/v1`)

All endpoints return a consistent JSON envelope.

### Standard Success Envelope

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Standard Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "fieldErrors": {}
  }
}
```

---

## 1. Public Catalogue Endpoints

### `GET /api/v1/products`
Retrieves paginated, filtered, and sorted published products.

- **Query Parameters:**
  - `q` (string, optional): Searches product name, SKU, and description.
  - `material` (string, optional): Material type slug (e.g. `natural-stone`).
  - `finish` (string, optional): Finish slug (e.g. `honed-matte`).
  - `application` (string, optional): Application slug (e.g. `flooring`).
  - `sort` (`featured` | `newest` | `name_asc` | `name_desc`, default `featured`).
  - `page` (integer >= 1, default `1`).
  - `pageSize` (integer 1–48, default `24`).
- **Response:** `200 OK` with array of `ProductListItem` and pagination metadata.

### `GET /api/v1/products/[slug]`
Retrieves a single published product specification by slug along with up to 4 related products in `meta.relatedProducts`.
- **Responses:** `200 OK`, `404 Not Found`.

### `GET /api/v1/material-types`
Lists all material categories ordered alphabetically.

### `GET /api/v1/finishes`
Lists all surface finishes ordered alphabetically.

### `GET /api/v1/applications`
Lists all certified architectural applications ordered alphabetically.

---

## 2. Customer Moodboard & Profile Endpoints

*All `/api/v1/moodboards/*` endpoints require an authenticated session with `tradeStatus === "APPROVED"` (or `role === "ADMIN"`).*

### `GET /api/v1/account/profile` & `PATCH /api/v1/account/profile`
Retrieves or updates the authenticated user's profile (`name`, `companyName`, `companyWebsite`, `jobTitle`). Role and trade status cannot be modified by the user.

### `GET /api/v1/moodboards`
Lists all moodboards owned by the authenticated user.

### `POST /api/v1/moodboards`
Creates a new moodboard (`{ name, description }`). Returns `201 Created`.

### `GET /api/v1/moodboards/[id]`
Retrieves moodboard details and ordered items. Enforces ownership (`403 Forbidden` if owned by another user).

### `PATCH /api/v1/moodboards/[id]`
Updates moodboard `name` and/or `description`. Enforces ownership.

### `DELETE /api/v1/moodboards/[id]`
Deletes a moodboard owned by the authenticated user.

### `POST /api/v1/moodboards/[id]/items`
Adds a published product (`{ productId }`) to the moodboard.
- Returns `409 Conflict` if the product already exists in the moodboard.
- Returns `422 Unprocessable Entity` if the product is `ARCHIVED` or `DRAFT`.

### `DELETE /api/v1/moodboards/[id]/items/[itemId]`
Removes an item from the moodboard.

### `PATCH /api/v1/moodboards/[id]/items/reorder`
Reorders items within the moodboard (`{ itemIds: string[] }`).

---

## 3. Administrator Endpoints

*All `/api/v1/admin/*` endpoints require `role === "ADMIN"` (`401 Unauthenticated` or `403 Forbidden` otherwise).*

### `GET /api/v1/admin/dashboard`
Returns operational metrics (`totalProducts`, `publishedProducts`, `draftProducts`, `archivedProducts`, `pendingTradeAccounts`, `approvedTradeAccounts`, `totalMoodboards`) and recent audit log entries.

### `GET /api/v1/admin/products` & `POST /api/v1/admin/products`
Lists all products (including `DRAFT` and `ARCHIVED`) or creates a new product specification with audit logging.

### `GET /api/v1/admin/products/[id]` & `PATCH /api/v1/admin/products/[id]`
Retrieves or updates any product specification, its applications, and its image gallery.

### `POST /api/v1/admin/products/[id]/archive`
Transitions a product to `ARCHIVED` status, sets `archived_at`, and records a `PRODUCT_ARCHIVED` audit log entry.

### `GET /api/v1/admin/trade-accounts`
Lists trade member accounts with search (`q`) and status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) filtering.

### `PATCH /api/v1/admin/trade-accounts/[id]/status`
Updates a trade member's status (`{ status, reason? }`) and records an audit log event.

### `POST /api/v1/admin/products/import`
Validates (`mode: "preview"`) or transactionally imports (`mode: "execute"`) a CSV product batch (`{ csvContent, mode }`).

### `POST /api/v1/admin/uploads`
Accepts `multipart/form-data` with a `file` field (JPEG, PNG, WebP up to 10 MB) and stores it via the configured `StorageProvider`.
