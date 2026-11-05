import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireApprovedTradeMember } from "@/server/authorization";
import { removeMoodboardItem } from "@/server/services/moodboard.service";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id, itemId } = await context.params;
    const updated = await removeMoodboardItem(id, itemId, member.id);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
