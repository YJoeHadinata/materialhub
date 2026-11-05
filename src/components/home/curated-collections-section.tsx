import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CuratedCollection {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  tag: string;
  metrics: string;
}

export const DEFAULT_CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    title: "Monolithic Civic Facades",
    subtitle: "Rain-Screen & Exterior Envelope",
    description:
      "Frost-resistant limestones, sintered basalts, and pre-weathered titanium-zinc panels engineered for high-span ventilated facades.",
    href: "/catalogue?application=facade",
    tag: "Exterior Envelope",
    metrics: "20–40mm Calibrated Thickness",
  },
  {
    title: "Acoustic Timber & Mineral Baffles",
    subtitle: "Sound Attenuation Assemblies",
    description:
      "Kiln-modified Nordic ash slats, micro-grooved black walnut, and perforated brass cassettes calibrated for auditoriums and workspaces.",
    href: "/catalogue?application=acoustic-ceilings",
    tag: "Interior Acoustics",
    metrics: "NRC 0.75–0.90 Rated Systems",
  },
  {
    title: "Tactile Wet-Area & Thermal Spa Surfaces",
    subtitle: "High-Grip Honed & Sandblasted",
    description:
      "Serpentinite stone, glazed celadon stoneware, and structural porcelain pavers with verified wet-pendulum slip resistance.",
    href: "/catalogue?application=wet-areas",
    tag: "Hospitality & Wellness",
    metrics: "R11 / PTV > 45 Slip Resistance",
  },
];

export function CuratedCollectionsSection({
  collections = DEFAULT_CURATED_COLLECTIONS,
}: {
  collections?: CuratedCollection[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold tracking-wider text-stone-600 uppercase">
          Application Systems
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
          Selected Architectural Collections
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {collections.map((collection) => (
          <div
            key={collection.title}
            className="surface-card flex flex-col justify-between border border-stone-200/90 bg-white p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3 text-[11px]">
                <span className="font-semibold tracking-wider text-stone-600 uppercase">
                  {collection.tag}
                </span>
                <span className="font-mono text-stone-600">
                  {collection.metrics}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-stone-950">
                {collection.title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-stone-600">
                {collection.subtitle}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">
                {collection.description}
              </p>
            </div>

            <div className="mt-6 border-t border-stone-100 pt-4">
              <Link
                href={collection.href}
                aria-label={`Filter collection: ${collection.title}`}
                className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 transition-colors hover:text-stone-600"
              >
                <span>Filter Collection</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
