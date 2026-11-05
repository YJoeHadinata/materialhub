import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import {
  createMaterialType,
  listMaterialTypes,
} from "@/server/services/taxonomy.service";
import { requireAdministrator } from "@/server/authorization";

export async function GET() {
  try {
    const items = await listMaterialTypes();
    return apiSuccess(items, { count: items.length });
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdministrator(request.headers);
    const body = await request.json();
    const created = await createMaterialType(body, admin.id);
    return apiSuccess(created, {}, 201);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
