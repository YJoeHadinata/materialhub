"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { MoodboardDetail } from "@/server/services/moodboard.service";
import { Callout } from "@/components/ui/callout";
import { StudioToast } from "@/components/ui/studio-toast";
import { MoodboardItemCard } from "./moodboard-item-card";

export function MoodboardDetailEditor({
  initialBoard,
  availableProducts,
}: {
  initialBoard: MoodboardDetail;
  availableProducts: Array<{
    id: string;
    sku: string;
    name: string;
    materialName: string;
  }>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialBoard.name);
  const [description, setDescription] = useState(initialBoard.description);
  const [selectedProductId, setSelectedProductId] = useState(
    availableProducts[0]?.id ?? "",
  );
  const activeSelectedProductId = availableProducts.some(
    (p) => p.id === selectedProductId,
  )
    ? selectedProductId
    : (availableProducts[0]?.id ?? "");
  const [savingMeta, setSavingMeta] = useState(false);
  const [busyItemAction, setBusyItemAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleUpdateMetadata(e: React.FormEvent) {
    e.preventDefault();
    setSavingMeta(true);
    setError(null);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${initialBoard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to update moodboard details.");
      } else {
        setStatusMsg("Moodboard metadata saved.");
        router.refresh();
      }
    } catch {
      setError("Network error while updating moodboard.");
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSelectedProductId) return;
    setBusyItemAction(true);
    setError(null);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/v1/moodboards/${initialBoard.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: activeSelectedProductId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to add product to moodboard.");
      } else {
        setStatusMsg("Material added to moodboard.");
        router.refresh();
      }
    } catch {
      setError("Network error while adding product.");
    } finally {
      setBusyItemAction(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setBusyItemAction(true);
    setError(null);
    setStatusMsg(null);

    try {
      const res = await fetch(
        `/api/v1/moodboards/${initialBoard.id}/items/${itemId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to remove item.");
      } else {
        setStatusMsg("Material removed from moodboard.");
        router.refresh();
      }
    } catch {
      setError("Network error while removing item.");
    } finally {
      setBusyItemAction(false);
    }
  }

  async function handleMoveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= initialBoard.items.length) {
      return;
    }

    const nextIds = initialBoard.items.map((i) => i.id);
    const currentId = nextIds[index];
    const swapId = nextIds[targetIndex];
    if (!currentId || !swapId) return;

    nextIds[index] = swapId;
    nextIds[targetIndex] = currentId;

    setBusyItemAction(true);
    setError(null);
    setStatusMsg(null);

    try {
      const res = await fetch(
        `/api/v1/moodboards/${initialBoard.id}/items/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds: nextIds }),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to reorder items.");
      } else {
        setStatusMsg("Palette sequence updated.");
        router.refresh();
      }
    } catch {
      setError("Network error while reordering moodboard items.");
    } finally {
      setBusyItemAction(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <Callout variant="error">{error}</Callout>}

      <StudioToast
        message={statusMsg}
        onDismiss={() => setStatusMsg(null)}
        tag="Synced"
      />

      {/* METADATA & QUICK ADD PANEL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleUpdateMetadata}
          className="border border-stone-200 bg-white p-6 space-y-4 lg:col-span-7"
        >
          <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
            Moodboard Specification Details
          </h2>
          <div>
            <label
              htmlFor="edit-mb-name"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Moodboard Name
            </label>
            <input
              id="edit-mb-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
            />
          </div>
          <div>
            <label
              htmlFor="edit-mb-desc"
              className="block text-xs font-semibold text-stone-800 uppercase"
            >
              Description / Architectural Zone Notes
            </label>
            <textarea
              id="edit-mb-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm text-stone-900"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingMeta}
              className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
            >
              {savingMeta ? "Saving..." : "Update Moodboard Info"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleAddProduct}
          className="border border-stone-200 bg-white p-6 flex flex-col justify-between lg:col-span-5"
        >
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
              Add Published Material to Palette
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Select a published specification from the catalogue to append to
              this moodboard. Duplicate materials within the same moodboard are
              prevented automatically.
            </p>

            <div className="mt-4">
              <label
                htmlFor="quick-add-product"
                className="block text-xs font-semibold text-stone-800 uppercase"
              >
                Select Material Specification
              </label>
              <select
                id="quick-add-product"
                value={activeSelectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
              >
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({p.materialName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={busyItemAction || !activeSelectedProductId}
            className="mt-6 inline-flex w-full items-center justify-center gap-1.5 border border-stone-900 bg-stone-900 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Material to Moodboard</span>
          </button>
        </form>
      </div>

      {/* MOODBOARD ITEMS SEQUENCE */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-stone-900 uppercase">
            Curated Material Sequence ({initialBoard.itemCount}{" "}
            {initialBoard.itemCount === 1 ? "Specification" : "Specifications"})
          </h2>
        </div>

        {initialBoard.items.length === 0 ? (
          <div className="border border-stone-200 bg-white p-12 text-center">
            <p className="text-sm text-stone-600">
              This moodboard does not contain any architectural materials yet.
            </p>
            <Link
              href="/catalogue"
              className="mt-4 inline-block border border-stone-900 bg-stone-900 px-5 py-2.5 text-xs font-semibold tracking-wider text-white uppercase"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {initialBoard.items.map((item, idx) => (
              <MoodboardItemCard
                key={item.id}
                item={item}
                index={idx}
                totalItems={initialBoard.items.length}
                disabled={busyItemAction}
                onMove={handleMoveItem}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
