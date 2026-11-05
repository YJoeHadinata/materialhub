import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import {
  requireAuthenticatedUser,
} from "@/server/authorization";
import { updateMemberProfile } from "@/server/services/trade-account.service";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuthenticatedUser(request.headers);
    return apiSuccess(currentUser, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireAuthenticatedUser(request.headers);
    const body = await request.json();
    const updated = await updateMemberProfile(currentUser.id, body);
    return apiSuccess(updated, {});
  } catch (error) {
    return handleApiRouteError(error);
  }
}
