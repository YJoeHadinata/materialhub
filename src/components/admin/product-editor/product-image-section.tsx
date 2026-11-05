import Image from "next/image";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import type { EditableImage } from "./types";
import { isSvgImageUrl } from "@/lib/utils/image";

interface ProductImageSectionProps {
  images: EditableImage[];
  setImages: React.Dispatch<React.SetStateAction<EditableImage[]>>;
  newImageAlt: string;
  setNewImageAlt: (val: string) => void;
  uploadingImage: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function ProductImageSection({
  images,
  setImages,
  newImageAlt,
  setNewImageAlt,
  uploadingImage,
  onFileUpload,
}: ProductImageSectionProps) {
  function handleSetPrimaryImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        const first = filtered[0];
        if (first) {
          first.isPrimary = true;
        }
      }
      return filtered.map((img, idx) => ({ ...img, sortOrder: idx }));
    });
  }

  function handleMoveImage(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const current = copy[index];
      const swap = copy[target];
      if (!current || !swap) return prev;
      copy[index] = swap;
      copy[target] = current;
      return copy.map((img, idx) => ({ ...img, sortOrder: idx }));
    });
  }

  return (
    <div className="border border-stone-200 bg-white p-6 space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
            3. Product Image Gallery & Object Storage Upload
          </h2>
          <p className="mt-1 text-xs text-stone-600">
            Supported formats: JPEG, PNG, WebP (Max 10 MB per image). Select
            one primary image and order gallery views.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end bg-stone-50 p-4 border border-stone-200">
        <div className="sm:col-span-6">
          <label
            htmlFor="upload-img-alt"
            className="block text-xs font-semibold text-stone-800 uppercase"
          >
            Image Accessibility Alt Text
          </label>
          <input
            id="upload-img-alt"
            type="text"
            value={newImageAlt}
            onChange={(e) => setNewImageAlt(e.target.value)}
            placeholder="e.g. Honed limestone slab macro surface texture"
            className="mt-1 w-full border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-stone-900 bg-stone-900 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {uploadingImage
                ? "Uploading to Storage..."
                : "Upload JPEG / PNG / WebP Image"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingImage}
              onChange={onFileUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-stone-500">
          No images attached yet. Upload an image above to populate the
          product gallery.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div
              key={`${img.storageKey}-${idx}`}
              className="border border-stone-200 bg-stone-50 p-3 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden border border-stone-200 bg-white">
                  <Image
                    src={img.imageUrl}
                    alt={img.altText}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized={isSvgImageUrl(img.imageUrl)}
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={img.altText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImages((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, altText: val } : item,
                        ),
                      );
                    }}
                    className="mt-0.5 w-full border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSetPrimaryImage(idx)}
                  className={`inline-flex items-center gap-1 px-2 py-1 font-medium ${
                    img.isPrimary
                      ? "bg-stone-900 text-white"
                      : "border border-stone-300 bg-white text-stone-700"
                  }`}
                >
                  <Star className="h-3 w-3" aria-hidden="true" />
                  <span>{img.isPrimary ? "Primary" : "Set Primary"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveImage(idx, "up")}
                    aria-label="Move image earlier"
                    className="border border-stone-300 bg-white p-1 disabled:opacity-40"
                  >
                    <ArrowUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMoveImage(idx, "down")}
                    aria-label="Move image later"
                    className="border border-stone-300 bg-white p-1 disabled:opacity-40"
                  >
                    <ArrowDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label="Remove image"
                    className="border border-stone-300 bg-white p-1 text-red-700"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
