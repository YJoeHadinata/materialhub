"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Callout } from "@/components/ui/callout";
import { slugify } from "@/lib/utils/format";

interface TaxonomyRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function TaxonomyManager({
  materialTypes,
  finishes,
  applications,
}: {
  materialTypes: TaxonomyRecord[];
  finishes: TaxonomyRecord[];
  applications: TaxonomyRecord[];
}) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<
    "material-types" | "finishes" | "applications"
  >("material-types");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/${targetType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to create taxonomy record.");
      } else {
        setName("");
        setSlug("");
        setDescription("");
        router.refresh();
      }
    } catch {
      setError("Network error while creating taxonomy entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="border border-stone-200 bg-white p-6 space-y-4"
      >
        <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
          Add Classification Entry
        </h2>

        {error && <Callout variant="error">{error}</Callout>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              htmlFor="tax-type"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Taxonomy Group
            </label>
            <select
              id="tax-type"
              value={targetType}
              onChange={(e) =>
                setTargetType(
                  e.target.value as
                    | "material-types"
                    | "finishes"
                    | "applications",
                )
              }
              className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
            >
              <option value="material-types">Material Category</option>
              <option value="finishes">Surface Finish</option>
              <option value="applications">Architectural Application</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tax-name"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Display Name *
            </label>
            <input
              id="tax-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Cast Terrazzo"
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-xs text-stone-900"
            />
          </div>

          <div>
            <label
              htmlFor="tax-slug"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Slug *
            </label>
            <input
              id="tax-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="cast-terrazzo"
              className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-xs text-stone-900"
            />
          </div>

          <div>
            <label
              htmlFor="tax-desc"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Technical Summary
            </label>
            <input
              id="tax-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-xs text-stone-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{saving ? "Adding..." : "Add Classification"}</span>
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-stone-200 bg-white p-5">
          <h3 className="border-b border-stone-200 pb-3 text-xs font-semibold tracking-widest text-stone-900 uppercase">
            Material Types ({materialTypes.length})
          </h3>
          <ul className="mt-3 divide-y divide-stone-100 text-xs">
            {materialTypes.map((m) => (
              <li key={m.id} className="py-2.5">
                <div className="flex items-center justify-between font-semibold text-stone-900">
                  <span>{m.name}</span>
                  <span className="font-mono text-[11px] text-stone-500">
                    {m.slug}
                  </span>
                </div>
                {m.description && (
                  <p className="mt-0.5 text-stone-600">{m.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-stone-200 bg-white p-5">
          <h3 className="border-b border-stone-200 pb-3 text-xs font-semibold tracking-widest text-stone-900 uppercase">
            Surface Finishes ({finishes.length})
          </h3>
          <ul className="mt-3 divide-y divide-stone-100 text-xs">
            {finishes.map((f) => (
              <li key={f.id} className="py-2.5">
                <div className="flex items-center justify-between font-semibold text-stone-900">
                  <span>{f.name}</span>
                  <span className="font-mono text-[11px] text-stone-500">
                    {f.slug}
                  </span>
                </div>
                {f.description && (
                  <p className="mt-0.5 text-stone-600">{f.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-stone-200 bg-white p-5">
          <h3 className="border-b border-stone-200 pb-3 text-xs font-semibold tracking-widest text-stone-900 uppercase">
            Applications ({applications.length})
          </h3>
          <ul className="mt-3 divide-y divide-stone-100 text-xs">
            {applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-2.5 font-semibold text-stone-900"
              >
                <span>{a.name}</span>
                <span className="font-mono text-[11px] text-stone-500">
                  {a.slug}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
