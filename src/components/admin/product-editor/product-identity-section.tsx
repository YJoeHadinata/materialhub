import { slugify } from "@/lib/utils/format";

interface ProductIdentitySectionProps {
  mode: "create" | "edit";
  name: string;
  setName: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export function ProductIdentitySection({
  mode,
  name,
  setName,
  sku,
  setSku,
  slug,
  setSlug,
  description,
  setDescription,
}: ProductIdentitySectionProps) {
  return (
    <div className="border border-stone-200 bg-white p-6 space-y-5">
      <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
        1. Product Identity & Specification Description
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="prod-name"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Product Name *
          </label>
          <input
            id="prod-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (mode === "create" && !slug) {
                setSlug(slugify(e.target.value));
              }
            }}
            placeholder="e.g. Honed Limestone Rain-Screen Slab"
            className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prod-sku"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Unique SKU *
          </label>
          <input
            id="prod-sku"
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="MH-STN-050"
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900 uppercase"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="prod-slug"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              URL Slug *
            </label>
            <button
              type="button"
              onClick={() => setSlug(slugify(name))}
              className="text-[11px] font-medium text-stone-600 underline"
            >
              Generate from Name
            </button>
          </div>
          <input
            id="prod-slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="honed-limestone-rain-screen-slab"
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="prod-description"
          className="block text-xs font-semibold text-stone-800 uppercase"
        >
          Technical Description *
        </label>
        <textarea
          id="prod-description"
          rows={3}
          required
          minLength={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe mineral composition, performance ratings, and architectural use cases..."
          className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
        />
      </div>
    </div>
  );
}
