import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import { updateTradeAccountStatus } from "@/server/services/trade-account.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdministrator(request.headers);
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateTradeAccountStatus(id, body, admin.id);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
