import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AuthenticatedUser, ProductListItem } from "@/types";

interface HeroSectionProps {
  heroSwatches: ProductListItem[];
  materialTypesCount: number;
  finishesCount: number;
  currentUser: AuthenticatedUser | null;
}

export function HeroSection({
  heroSwatches,
  materialTypesCount,
  finishesCount,
  currentUser,
}: HeroSectionProps) {
  return (
    <section className="border-b border-stone-200/90 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:pt-2">
            <p className="text-xs font-semibold tracking-widest text-stone-600 uppercase">
              Architectural Surface & Specification Library
            </p>

            <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Technical material discovery for architectural specification.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600">
              MaterialHub connects architects, interior designers, and property
              developers with verified technical specifications across natural
              stone, sintered ceramics, FSC-certified timber, anodized metals,
              and structural glass.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/catalogue"
                className="group inline-flex items-center gap-2 border border-stone-900 bg-stone-900 px-5 py-3 text-xs font-semibold tracking-wider text-white uppercase transition-colors duration-150 hover:bg-stone-800"
              >
                <span>Explore Material Catalogue</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              {!currentUser ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 border border-stone-300 bg-white px-5 py-3 text-xs font-semibold tracking-wider text-stone-900 uppercase transition-colors duration-150 hover:border-stone-900"
                >
                  <span>Request Trade Account</span>
                </Link>
              ) : (
                <Link
                  href="/moodboards"
                  className="inline-flex items-center gap-2 border border-stone-300 bg-white px-5 py-3 text-xs font-semibold tracking-wider text-stone-900 uppercase transition-colors duration-150 hover:border-stone-900"
                >
                  <span>Open Project Moodboards</span>
                </Link>
              )}
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-stone-200 pt-7">
              <div>
                <dt className="text-xs font-medium text-stone-600">
                  Material Families
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                  {materialTypesCount} Core Classes
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-stone-600">
                  Surface Finishes
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                  {finishesCount} Finishes
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-stone-600">
                  Specification Data
                </dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                  Format & MOQ
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="mb-3 flex items-baseline justify-between border-b border-stone-200 pb-2.5">
              <span className="text-xs font-semibold tracking-wider text-stone-800 uppercase">
                Selected Surface Specimens
              </span>
              <span className="font-mono text-xs text-stone-600">
                Index 01–04
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {heroSwatches.map((swatch) => (
                <Link
                  key={swatch.id}
                  href={`/products/${swatch.slug}`}
                  aria-label={`Inspect specimen ${swatch.name}`}
                  className="surface-card group flex flex-col border border-stone-200/90 bg-white"
                >
                  <div className="aspect-16/10 overflow-hidden bg-stone-100">
                    {swatch.primaryImage && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={swatch.primaryImage.imageUrl}
                        alt={swatch.primaryImage.altText}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-stone-600">
                        <span className="uppercase">{swatch.materialType.name}</span>
                        <span className="font-mono">{swatch.sku}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-stone-950">
                        {swatch.name}
                      </p>
                    </div>
                    <p className="mt-2 border-t border-stone-100 pt-2 font-mono text-[11px] text-stone-600">
                      {swatch.finish.name} · {swatch.dimensionText}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
