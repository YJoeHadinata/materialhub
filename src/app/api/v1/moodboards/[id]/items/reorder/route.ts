import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireApprovedTradeMember } from "@/server/authorization";
import { reorderMoodboardItems } from "@/server/services/moodboard.service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id } = await context.params;
    const body = await request.json();
    const updated = await reorderMoodboardItems(id, body, member.id);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
