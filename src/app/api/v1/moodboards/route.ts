import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireApprovedTradeMember } from "@/server/authorization";
import {
  createMoodboard,
  listUserMoodboards,
} from "@/server/services/moodboard.service";

export async function GET(request: Request) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const items = await listUserMoodboards(member.id);
    return apiSuccess(items, { count: items.length });
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const member = await requireApprovedTradeMember(request.headers);
    const body = await request.json();
    const created = await createMoodboard(body, member.id);
    return apiSuccess(created, {}, 201);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
