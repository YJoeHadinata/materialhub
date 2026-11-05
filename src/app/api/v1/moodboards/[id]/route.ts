import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireApprovedTradeMember } from "@/server/authorization";
import {
  deleteMoodboard,
  getMoodboardByIdForUser,
  updateMoodboard,
} from "@/server/services/moodboard.service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id } = await context.params;
    const detail = await getMoodboardByIdForUser(id, member.id);
    return apiSuccess(detail, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id } = await context.params;
    const body = await request.json();
    const updated = await updateMoodboard(id, body, member.id);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const { id } = await context.params;
    await deleteMoodboard(id, member.id);
    return apiSuccess({ deleted: true, id }, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
