"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  productName,
}: {
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string;
    isPrimary: boolean;
    width: number;
    height: number;
  }>;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-4/3 border border-stone-200 bg-stone-100 flex items-center justify-center text-xs tracking-wider text-stone-600 uppercase">
        No elevation image available for {productName}
      </div>
    );
  }

  const activeImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-3.5">
      <div className="group relative aspect-4/3 overflow-hidden border border-stone-200/90 bg-stone-100">
        {activeImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeImage.imageUrl}
            alt={activeImage.altText}
            width={activeImage.width}
            height={activeImage.height}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        )}
      </div>

      {images.length > 1 && (
        <div
          className="grid grid-cols-4 gap-3 sm:grid-cols-5"
          role="list"
          aria-label="Product surface views"
        >
          {images.map((image, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View image ${idx + 1}: ${image.altText}`}
                aria-current={isSelected ? "true" : undefined}
                className={`aspect-4/3 overflow-hidden border transition-all duration-150 ${
                  isSelected
                    ? "border-stone-950 ring-2 ring-stone-950 ring-offset-1"
                    : "border-stone-200 opacity-75 hover:border-stone-400 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt={image.altText}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
