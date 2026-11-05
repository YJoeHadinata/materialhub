import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import {
  createProduct,
  listAdminProducts,
} from "@/server/services/product.service";
import type { ProductStatus } from "@/types";

export async function GET(request: Request) {
  try {
    await requireAdministrator(request.headers);
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as
      | ProductStatus
      | "ALL"
      | null;
    const result = await listAdminProducts({
      q: searchParams.get("q") ?? undefined,
      status: statusParam ?? "ALL",
      materialTypeId: searchParams.get("materialTypeId") ?? undefined,
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : undefined,
    });
    return apiSuccess(result.items, result.meta);
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdministrator(request.headers);
    const body = await request.json();
    const created = await createProduct(body, admin.id);
    return apiSuccess(created, {}, 201);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
