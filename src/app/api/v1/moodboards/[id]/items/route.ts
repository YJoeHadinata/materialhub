import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireApprovedTradeMember } from "@/server/authorization";
import { addProductToMoodboard } from "@/server/services/moodboard.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id } = await context.params;
    const body = await request.json();
    const updated = await addProductToMoodboard(id, body, member.id);
    return apiSuccess(updated, {}, 201);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
