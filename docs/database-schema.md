# Database Schema & Entity-Relationship Documentation

**Database Engine:** PostgreSQL 18  
**ORM & Migration Tooling:** Drizzle ORM `0.45.4` & Drizzle Kit `0.31.11`  
**Schema Source:** `src/db/schema/index.ts`  
**Committed Migrations:** `src/db/migrations/0000_reflective_darkhawk.sql`

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ SESSION : "has"
    USER ||--o{ ACCOUNT : "has"
    USER ||--o{ MOODBOARDS : "owns"
    USER ||--o{ AUDIT_LOGS : "triggers"
    MATERIAL_TYPES ||--o{ PRODUCTS : "classifies"
    FINISHES ||--o{ PRODUCTS : "finishes"
    PRODUCTS ||--o{ PRODUCT_APPLICATIONS : "supports"
    APPLICATIONS ||--o{ PRODUCT_APPLICATIONS : "applies_to"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "displays"
    MOODBOARDS ||--o{ MOODBOARD_ITEMS : "contains"
    PRODUCTS ||--o{ MOODBOARD_ITEMS : "referenced_by"

    USER {
        uuid id PK
        text name
        text email UK
        boolean email_verified
        user_role role "MEMBER | ADMIN"
        text company_name
        text company_website
        text job_title
        trade_status trade_status "PENDING | APPROVED | REJECTED | SUSPENDED"
        timestamptz created_at
        timestamptz updated_at
    }

    MATERIAL_TYPES {
        uuid id PK
        text name
        text slug UK
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    FINISHES {
        uuid id PK
        text name
        text slug UK
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    APPLICATIONS {
        uuid id PK
        text name
        text slug UK
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCTS {
        uuid id PK
        text name
        text slug UK
        text sku UK
        text description
        uuid material_type_id FK
        uuid finish_id FK
        text dimension_text
        integer width_mm
        integer height_mm
        integer thickness_mm
        integer moq_value
        text moq_unit
        product_status status "DRAFT | PUBLISHED | ARCHIVED"
        boolean is_featured
        uuid created_by FK
        uuid updated_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz archived_at
    }

    PRODUCT_APPLICATIONS {
        uuid product_id PK,FK
        uuid application_id PK,FK
    }

    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        text storage_key
        text image_url
        text alt_text
        boolean is_primary
        integer sort_order
        integer width
        integer height
        timestamptz created_at
    }

    MOODBOARDS {
        uuid id PK
        uuid user_id FK
        text name
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    MOODBOARD_ITEMS {
        uuid id PK
        uuid moodboard_id FK
        uuid product_id FK
        integer sort_order
        timestamptz created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_user_id FK
        text action
        text entity_type
        text entity_id
        jsonb metadata
        timestamptz created_at
    }
```

---

## 2. Key Relational Constraints & Indexes

1. **Primary Keys:** All application and authentication entities use PostgreSQL native `uuid` (`pg_catalog.gen_random_uuid()`).
2. **Product Uniqueness:** `products.sku` (`products_sku_idx`) and `products.slug` (`products_slug_idx`) enforce database-level uniqueness.
3. **Moodboard Deduplication:** `moodboard_items` enforces a composite unique index `moodboard_items_unique_product_idx` on `(moodboard_id, product_id)`, guaranteeing that the same product cannot be added twice to the same moodboard.
4. **Archived Product Integrity:** `moodboard_items.product_id` uses `ON DELETE RESTRICT`, while products are archived via `status = 'ARCHIVED'` and `archived_at` timestamp rather than hard-deleted, preserving historical moodboard references.
