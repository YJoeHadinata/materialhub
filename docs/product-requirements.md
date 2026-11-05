# Product Requirements Summary — MaterialHub

**Version:** 1.0  
**Status:** Implemented  
**Source of Truth:** Adapted from root `PRD.md`

---

## 1. Product Vision

MaterialHub is a B2B architectural materials catalogue and specification moodboard platform built for architects, interior designers, property developers, and material specification managers.

### Core Capabilities

1. **Public Material Discovery:** Parametric search and filtering across Natural Stone, Ceramic, Timber, Metal Panels, and Glass with shareable URL query state (`/catalogue?material=natural-stone&finish=honed-matte&application=flooring&page=1`).
2. **Technical Specification Detail:** Calibrated millimeter dimensions (`width_mm`, `height_mm`, `thickness_mm`), minimum order quantities (`moq_value` and `moq_unit`), surface finishes, applications, multi-image galleries, and related specifications.
3. **Trade Account Governance:** Self-service trade registration defaulting to `MEMBER` role and `PENDING` trade status. Administrators review, approve, reject, suspend, and reactivate trade accounts with full audit logging.
4. **Customer Moodboard Workspace:** Approved trade members create private project moodboards, add published materials (preventing duplicates), reorder material sequences, and maintain historical references even if a product is later archived.
5. **Catalogue Administration & CSV Import:** Full product CRUD, taxonomy management (materials, finishes, applications), S3/local storage image upload abstraction, and transactional RFC 4180 CSV bulk import with row-level preview and validation.
