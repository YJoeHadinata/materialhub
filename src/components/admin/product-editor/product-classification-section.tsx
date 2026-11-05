import type { ProductStatus } from "@/types";
import type { TaxonomyOption } from "./types";

interface ProductClassificationSectionProps {
  materialTypes: TaxonomyOption[];
  materialTypeId: string;
  setMaterialTypeId: (val: string) => void;
  finishes: TaxonomyOption[];
  finishId: string;
  setFinishId: (val: string) => void;
  status: ProductStatus;
  setStatus: (val: ProductStatus) => void;
  isFeatured: boolean;
  setIsFeatured: (val: boolean) => void;
  dimensionText: string;
  setDimensionText: (val: string) => void;
  heightMm: string;
  setHeightMm: (val: string) => void;
  widthMm: string;
  setWidthMm: (val: string) => void;
  moqValue: string;
  setMoqValue: (val: string) => void;
  moqUnit: string;
  setMoqUnit: (val: string) => void;
  applications: TaxonomyOption[];
  selectedAppIds: string[];
  toggleApplication: (id: string) => void;
}

export function ProductClassificationSection({
  materialTypes,
  materialTypeId,
  setMaterialTypeId,
  finishes,
  finishId,
  setFinishId,
  status,
  setStatus,
  isFeatured,
  setIsFeatured,
  dimensionText,
  setDimensionText,
  heightMm,
  setHeightMm,
  widthMm,
  setWidthMm,
  moqValue,
  setMoqValue,
  moqUnit,
  setMoqUnit,
  applications,
  selectedAppIds,
  toggleApplication,
}: ProductClassificationSectionProps) {
  return (
    <div className="border border-stone-200 bg-white p-6 space-y-5">
      <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
        2. Classification, Dimensions & Minimum Order Quantity
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <label
            htmlFor="prod-material"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Material Type *
          </label>
          <select
            id="prod-material"
            value={materialTypeId}
            onChange={(e) => setMaterialTypeId(e.target.value)}
            className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          >
            {materialTypes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="prod-finish"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Surface Finish *
          </label>
          <select
            id="prod-finish"
            value={finishId}
            onChange={(e) => setFinishId(e.target.value)}
            className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          >
            {finishes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="prod-status"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Publication Status *
          </label>
          <select
            id="prod-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
          >
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-800 uppercase cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 border-stone-300"
            />
            <span>Feature on Homepage</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
        <div className="md:col-span-2">
          <label
            htmlFor="prod-dim-text"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Dimension Display Text *
          </label>
          <input
            id="prod-dim-text"
            type="text"
            required
            value={dimensionText}
            onChange={(e) => setDimensionText(e.target.value)}
            placeholder="2400 x 1200 x 20 mm"
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prod-height"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Length/Height (mm)
          </label>
          <input
            id="prod-height"
            type="number"
            min={1}
            value={heightMm}
            onChange={(e) => setHeightMm(e.target.value)}
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prod-width"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Width (mm)
          </label>
          <input
            id="prod-width"
            type="number"
            min={1}
            value={widthMm}
            onChange={(e) => setWidthMm(e.target.value)}
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prod-moq-val"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            MOQ Value *
          </label>
          <input
            id="prod-moq-val"
            type="number"
            required
            min={1}
            value={moqValue}
            onChange={(e) => setMoqValue(e.target.value)}
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="prod-moq-unit"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            MOQ Unit *
          </label>
          <input
            id="prod-moq-unit"
            type="text"
            required
            value={moqUnit}
            onChange={(e) => setMoqUnit(e.target.value)}
            placeholder="sqm / panels"
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm text-stone-900"
          />
        </div>
      </div>

      <div>
        <span className="block text-xs font-semibold text-stone-800 uppercase">
          Certified Architectural Applications (Select at least one) *
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {applications.map((app) => {
            const checked = selectedAppIds.includes(app.id);
            return (
              <label
                key={app.id}
                className={`flex items-center gap-2 border px-3 py-2 text-xs font-medium cursor-pointer ${
                  checked
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 bg-stone-50 text-stone-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleApplication(app.id)}
                  className="sr-only"
                />
                <span>{app.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
