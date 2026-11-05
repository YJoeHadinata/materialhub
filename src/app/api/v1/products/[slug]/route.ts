import { apiSuccess, handleApiRouteError } from "@/lib/utils/api-response";
import { getPublishedProductBySlug } from "@/server/services/product.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const result = await getPublishedProductBySlug(slug);
    return apiSuccess(result.product, {
      relatedProducts: result.relatedProducts,
    });
  } catch (error) {
    return handleApiRouteError(error);
  }
}
