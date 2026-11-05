import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AuthenticatedUser, ProductListItem } from "@/types";
import { SaveToMoodboardDialog } from "@/components/moodboards/save-to-moodboard-dialog";

export function ProductCard({
  product,
  currentUser,
}: {
  product: ProductListItem;
  currentUser: AuthenticatedUser | null;
}) {
  const imageUrl =
    product.primaryImage?.imageUrl ??
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='800' height='600' fill='%23E5E1D8'/></svg>";

  const imageAlt = product.primaryImage?.altText ?? product.name;

  return (
    <article className="surface-card group flex flex-col border border-stone-200/90 bg-white">
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View specifications for ${product.name}`}
        className="relative block aspect-4/3 overflow-hidden bg-stone-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          width={product.primaryImage?.width ?? 1200}
          height={product.primaryImage?.height ?? 900}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] tracking-wider text-stone-600 uppercase">
            <span>{product.materialType.name}</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <h3 className="mt-2 text-base leading-snug font-semibold tracking-tight text-stone-950">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-stone-600"
            >
              {product.name}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
            {product.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-[11px]">
            <div>
              <dt className="text-stone-500">Finish & Format</dt>
              <dd className="mt-0.5 font-mono text-stone-800">
                {product.finish.name} · {product.dimensionText}
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-stone-500">Minimum Order</dt>
              <dd className="mt-0.5 font-mono text-stone-800">
                {product.moqValue} {product.moqUnit}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3.5">
          <Link
            href={`/products/${product.slug}`}
            aria-label={`View specifications for ${product.name}`}
            className="group/link inline-flex items-center gap-1 text-xs font-semibold text-stone-900 transition-colors hover:text-stone-600"
          >
            <span>Specifications</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>

          <SaveToMoodboardDialog
            productId={product.id}
            productName={product.name}
            currentUser={currentUser}
            variant="card"
          />
        </div>
      </div>
    </article>
  );
}
