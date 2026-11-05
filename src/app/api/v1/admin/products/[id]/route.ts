import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import {
  getAdminProductById,
  updateProduct,
} from "@/server/services/product.service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdministrator(request.headers);
    const { id } = await context.params;
    const product = await getAdminProductById(id);
    return apiSuccess(product, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdministrator(request.headers);
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateProduct(id, body, admin.id);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
