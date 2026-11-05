import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import { getAdminDashboardMetrics } from "@/server/services/trade-account.service";
import { listRecentAuditLogs } from "@/server/services/audit.service";

export async function GET(request: Request) {
  try {
    await requireAdministrator(request.headers);
    const [metrics, recentAuditLogs] = await Promise.all([
      getAdminDashboardMetrics(),
      listRecentAuditLogs(20),
    ]);
    return apiSuccess(
      {
        metrics,
        recentAuditLogs,
      },
      {},
    );
  } catch (error) {
    return handleApiRouteError(error);
  }
}
