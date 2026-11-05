import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { getAllTaxonomies } from "@/server/services/taxonomy.service";

interface CategoryTaxonomySectionProps {
  materialTypes: Awaited<ReturnType<typeof getAllTaxonomies>>["materialTypes"];
}

export function CategoryTaxonomySection({
  materialTypes,
}: CategoryTaxonomySectionProps) {
  return (
    <section className="border-y border-stone-200/90 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-stone-600 uppercase">
            Material Taxonomy
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
            Browse by Architectural Material Class
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Every material record is indexed with calibrated dimensions in
            millimeters, surface finish classifications, and verified minimum
            order quantities.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {materialTypes.map((material, idx) => (
            <Link
              key={material.id}
              href={`/catalogue?material=${material.slug}`}
              aria-label={`Browse ${material.name} material class`}
              className="surface-card group flex flex-col justify-between border border-stone-200/90 bg-stone-50/40 p-5 hover:bg-white"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-stone-600">
                    0{idx + 1}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-stone-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-950"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3 text-base font-semibold tracking-tight text-stone-950">
                  {material.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                  {material.description}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 border-t border-stone-200/70 pt-3 text-xs font-semibold text-stone-900">
                <span>Inspect Category</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
