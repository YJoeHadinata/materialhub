import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AuthenticatedUser, ProductListItem } from "@/types";
import { ProductCard } from "@/components/catalogue/product-card";

interface FeaturedSectionProps {
  products: ProductListItem[];
  currentUser: AuthenticatedUser | null;
}

export function FeaturedSection({
  products,
  currentUser,
}: FeaturedSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wider text-stone-600 uppercase">
            Curated Specifications
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
            Featured Architectural Materials
          </h2>
        </div>
        <Link
          href="/catalogue"
          aria-label="View complete architectural material catalogue"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 transition-colors hover:text-stone-600"
        >
          <span>View Complete Catalogue</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentUser={currentUser}
          />
        ))}
      </div>
    </section>
  );
}
