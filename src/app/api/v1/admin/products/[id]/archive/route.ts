import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import { archiveProduct } from "@/server/services/product.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdministrator(request.headers);
    const { id } = await context.params;
    const archived = await archiveProduct(id, admin.id);
    return apiSuccess(archived, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
