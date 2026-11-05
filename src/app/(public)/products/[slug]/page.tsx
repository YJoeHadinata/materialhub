import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Ruler, ShieldCheck } from "lucide-react";
import { getPublishedProductBySlug } from "@/server/services/product.service";
import { getCurrentUser } from "@/server/authorization";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductCard } from "@/components/catalogue/product-card";
import { SaveToMoodboardDialog } from "@/components/moodboards/save-to-moodboard-dialog";
import { AppError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await getPublishedProductBySlug(slug);
    return {
      title: `${product.name} (${product.sku})`,
      description: `${product.name} — ${product.materialType.name}, ${product.finish.name}. Dimensions: ${product.dimensionText}. MOQ: ${product.moqValue} ${product.moqUnit}.`,
    };
  } catch {
    return {
      title: "Material Specification Not Found",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let productData: Awaited<ReturnType<typeof getPublishedProductBySlug>>;
  try {
    productData = await getPublishedProductBySlug(slug);
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  const { product, relatedProducts } = productData;
  const currentUser = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/catalogue"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-stone-600 uppercase transition-colors hover:text-stone-950"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
          <span>Back to Material Catalogue</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: PRODUCT GALLERY */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* RIGHT COLUMN: TECHNICAL SPECIFICATIONS */}
        <div className="lg:col-span-5">
          <div className="border border-stone-200/90 bg-white p-6 lg:sticky lg:top-24 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4 text-xs">
              <span className="font-mono font-semibold tracking-wider text-stone-600 uppercase">
                SKU: {product.sku}
              </span>
              <Link
                href={`/catalogue?material=${product.materialType.slug}`}
                className="font-medium tracking-wider text-stone-600 uppercase transition-colors hover:text-stone-950 hover:underline"
              >
                {product.materialType.name}
              </Link>
            </div>

            <h1 className="mt-5 text-2xl leading-snug font-semibold tracking-tight text-stone-950 sm:text-3xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-stone-700">
              {product.description}
            </p>

            {/* TECHNICAL DATA TABLE */}
            <div className="mt-6 border-t border-stone-200 pt-6">
              <h2 className="text-xs font-semibold tracking-widest text-stone-600 uppercase">
                Technical Specification Data
              </h2>

              <dl className="mt-4 divide-y divide-stone-200 border-y border-stone-200 text-xs">
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-stone-600 uppercase">
                    Material Class
                  </dt>
                  <dd className="font-semibold text-stone-900">
                    <Link
                      href={`/catalogue?material=${product.materialType.slug}`}
                      className="hover:underline"
                    >
                      {product.materialType.name}
                    </Link>
                  </dd>
                </div>

                <div className="flex justify-between py-3">
                  <dt className="font-medium text-stone-600 uppercase">
                    Surface Finish
                  </dt>
                  <dd className="font-semibold text-stone-900">
                    <Link
                      href={`/catalogue?finish=${product.finish.slug}`}
                      className="hover:underline"
                    >
                      {product.finish.name}
                    </Link>
                  </dd>
                </div>

                <div className="flex justify-between py-3">
                  <dt className="font-medium text-stone-600 uppercase">
                    Nominal Format
                  </dt>
                  <dd className="font-mono font-semibold text-stone-900">
                    {product.dimensionText}
                  </dd>
                </div>

                {(product.widthMm || product.heightMm || product.thicknessMm) && (
                  <div className="flex justify-between py-3">
                    <dt className="font-medium text-stone-600 uppercase">
                      Calibrated Millimeters
                    </dt>
                    <dd className="font-mono text-stone-800">
                      {[
                        product.heightMm ? `L ${product.heightMm}mm` : null,
                        product.widthMm ? `W ${product.widthMm}mm` : null,
                        product.thicknessMm ? `T ${product.thicknessMm}mm` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between py-3">
                  <dt className="font-medium text-stone-600 uppercase">
                    Minimum Order Quantity (MOQ)
                  </dt>
                  <dd className="font-mono font-semibold text-stone-900">
                    {product.moqValue} {product.moqUnit}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-3">
                  <dt className="shrink-0 font-medium text-stone-600 uppercase">
                    Certified Applications
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {product.applications.map((app, index) => (
                      <span key={app.id}>
                        {index > 0 && <span className="mx-1.5 text-stone-400">/</span>}
                        <Link
                          href={`/catalogue?application=${app.slug}`}
                          className="hover:underline"
                        >
                          {app.name}
                        </Link>
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* MOODBOARD CTA */}
            <div className="mt-8">
              <SaveToMoodboardDialog
                productId={product.id}
                productName={product.name}
                currentUser={currentUser}
                variant="detail"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-stone-700" aria-hidden="true" />
                <span>Calibrated architectural tolerances</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  className="h-3.5 w-3.5 text-stone-700"
                  aria-hidden="true"
                />
                <span>B2B specification verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-stone-200 pt-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
                Complementary Specifications
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
                Related {product.materialType.name} Surfaces
              </h2>
            </div>
            <Link
              href={`/catalogue?material=${product.materialType.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-stone-900 uppercase hover:underline"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View All {product.materialType.name}</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                currentUser={currentUser}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
