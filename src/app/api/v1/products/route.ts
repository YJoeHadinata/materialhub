import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { queryPublicCatalogue } from "@/server/services/product.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await queryPublicCatalogue({
      q: searchParams.get("q") ?? undefined,
      material: searchParams.get("material") ?? undefined,
      finish: searchParams.get("finish") ?? undefined,
      application: searchParams.get("application") ?? undefined,
      sort:
        (searchParams.get("sort") as
          | "featured"
          | "newest"
          | "name_asc"
          | "name_desc"
          | null) ?? undefined,
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : undefined,
    });

    return apiSuccess(result.items, {
      ...result.meta,
      activeFilters: result.activeFilters,
    });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
