export type UserRole = "MEMBER" | "ADMIN";

export type TradeStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  companyWebsite?: string | null;
  jobTitle?: string | null;
  tradeStatus: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiSuccessResponse<T, M = Record<string, unknown>> {
  success: true;
  data: T;
  meta: M;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export type ApiResponse<T, M = Record<string, unknown>> =
  | ApiSuccessResponse<T, M>
  | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  dimensionText: string;
  widthMm: number | null;
  heightMm: number | null;
  thicknessMm: number | null;
  moqValue: number;
  moqUnit: string;
  status: ProductStatus;
  isFeatured: boolean;
  materialType: {
    id: string;
    name: string;
    slug: string;
  };
  finish: {
    id: string;
    name: string;
    slug: string;
  };
  applications: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  primaryImage: {
    id: string;
    imageUrl: string;
    altText: string;
    width: number;
    height: number;
  } | null;
  images: Array<{
    id: string;
    storageKey: string;
    imageUrl: string;
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
    width: number;
    height: number;
  }>;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}
