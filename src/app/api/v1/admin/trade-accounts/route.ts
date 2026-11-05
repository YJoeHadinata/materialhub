import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { requireAdministrator } from "@/server/authorization";
import { listTradeAccounts } from "@/server/services/trade-account.service";
import type { TradeStatus } from "@/types";

export async function GET(request: Request) {
  try {
    await requireAdministrator(request.headers);
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as
      | TradeStatus
      | "ALL"
      | null;
    const accounts = await listTradeAccounts({
      q: searchParams.get("q") ?? undefined,
      status: statusParam ?? "ALL",
    });
    return apiSuccess(accounts, { count: accounts.length });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
