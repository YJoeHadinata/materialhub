"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ProductListItem, ProductStatus } from "@/types";
import { Callout } from "@/components/ui/callout";
import { ProductIdentitySection } from "./product-editor/product-identity-section";
import { ProductClassificationSection } from "./product-editor/product-classification-section";
import { ProductImageSection } from "./product-editor/product-image-section";
import type { EditableImage, TaxonomyOption } from "./product-editor/types";

export function ProductEditorForm({
  mode,
  initialProduct,
  materialTypes,
  finishes,
  applications,
}: {
  mode: "create" | "edit";
  initialProduct?: ProductListItem;
  materialTypes: TaxonomyOption[];
  finishes: TaxonomyOption[];
  applications: TaxonomyOption[];
}) {
  const router = useRouter();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [materialTypeId, setMaterialTypeId] = useState(
    initialProduct?.materialType.id ?? materialTypes[0]?.id ?? "",
  );
  const [finishId, setFinishId] = useState(
    initialProduct?.finish.id ?? finishes[0]?.id ?? "",
  );
  const [dimensionText, setDimensionText] = useState(
    initialProduct?.dimensionText ?? "2400 x 1200 x 20 mm",
  );
  const [widthMm, setWidthMm] = useState<string>(
    initialProduct?.widthMm ? String(initialProduct.widthMm) : "",
  );
  const [heightMm, setHeightMm] = useState<string>(
    initialProduct?.heightMm ? String(initialProduct.heightMm) : "",
  );
  const [thicknessMm, _setThicknessMm] = useState<string>(
    initialProduct?.thicknessMm ? String(initialProduct.thicknessMm) : "",
  );
  const [moqValue, setMoqValue] = useState<string>(
    initialProduct ? String(initialProduct.moqValue) : "25",
  );
  const [moqUnit, setMoqUnit] = useState(initialProduct?.moqUnit ?? "sqm");
  const [status, setStatus] = useState<ProductStatus>(
    initialProduct?.status ?? "PUBLISHED",
  );
  const [isFeatured, setIsFeatured] = useState(
    initialProduct?.isFeatured ?? false,
  );
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(
    initialProduct?.applications.map((a) => a.id) ??
      (applications[0] ? [applications[0].id] : []),
  );
  const [images, setImages] = useState<EditableImage[]>(
    initialProduct?.images.map((img, i) => ({
      storageKey: img.storageKey,
      imageUrl: img.imageUrl,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: i,
      width: img.width,
      height: img.height,
    })) ?? [],
  );

  const [newImageAlt, setNewImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleApplication(appId: string) {
    setSelectedAppIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Image upload failed.");
      } else {
        const alt =
          newImageAlt.trim() || `${name || "Architectural material"} surface view`;
        setImages((prev) => [
          ...prev,
          {
            storageKey: json.data.storageKey,
            imageUrl: json.data.imageUrl,
            altText: alt,
            isPrimary: prev.length === 0,
            sortOrder: prev.length,
            width: typeof json.data.width === "number" ? json.data.width : 1200,
            height: typeof json.data.height === "number" ? json.data.height : 900,
          },
        ]);
        setNewImageAlt("");
      }
    } catch {
      setError("Network error while uploading image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      materialTypeId,
      finishId,
      dimensionText: dimensionText.trim(),
      widthMm: widthMm ? Number(widthMm) : null,
      heightMm: heightMm ? Number(heightMm) : null,
      thicknessMm: thicknessMm ? Number(thicknessMm) : null,
      moqValue: Number(moqValue),
      moqUnit: moqUnit.trim(),
      status,
      isFeatured,
      applicationIds: selectedAppIds,
      images: images.map((img, idx) => ({
        ...img,
        sortOrder: idx,
      })),
    };

    try {
      const endpoint =
        mode === "create"
          ? "/api/v1/admin/products"
          : `/api/v1/admin/products/${initialProduct?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to save product specification.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error while saving product.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <Callout variant="error">{error}</Callout>}

      <ProductIdentitySection
        mode={mode}
        name={name}
        setName={setName}
        sku={sku}
        setSku={setSku}
        slug={slug}
        setSlug={setSlug}
        description={description}
        setDescription={setDescription}
      />

      <ProductClassificationSection
        materialTypes={materialTypes}
        materialTypeId={materialTypeId}
        setMaterialTypeId={setMaterialTypeId}
        finishes={finishes}
        finishId={finishId}
        setFinishId={setFinishId}
        status={status}
        setStatus={setStatus}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
        dimensionText={dimensionText}
        setDimensionText={setDimensionText}
        heightMm={heightMm}
        setHeightMm={setHeightMm}
        widthMm={widthMm}
        setWidthMm={setWidthMm}
        moqValue={moqValue}
        setMoqValue={setMoqValue}
        moqUnit={moqUnit}
        setMoqUnit={setMoqUnit}
        applications={applications}
        selectedAppIds={selectedAppIds}
        toggleApplication={toggleApplication}
      />

      <ProductImageSection
        images={images}
        setImages={setImages}
        newImageAlt={newImageAlt}
        setNewImageAlt={setNewImageAlt}
        uploadingImage={uploadingImage}
        onFileUpload={handleFileUpload}
      />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold tracking-wider text-stone-800 uppercase hover:border-stone-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 border border-stone-900 bg-stone-900 px-6 py-2.5 text-xs font-semibold tracking-widest text-white uppercase hover:bg-stone-800 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {saving
              ? "Saving Specification..."
              : mode === "create"
                ? "Create Product Specification"
                : "Save Product Changes"}
          </span>
        </button>
      </div>
    </form>
  );
}
