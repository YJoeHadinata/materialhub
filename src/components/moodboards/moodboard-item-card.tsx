import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MoodboardDetail } from "@/server/services/moodboard.service";
import { isSvgImageUrl } from "@/lib/utils/image";

type MoodboardItem = MoodboardDetail["items"][number];

interface MoodboardItemCardProps {
  item: MoodboardItem;
  index: number;
  totalItems: number;
  disabled: boolean;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (itemId: string) => void;
}

export function MoodboardItemCard({
  item,
  index,
  totalItems,
  disabled,
  onMove,
  onRemove,
}: MoodboardItemCardProps) {
  return (
    <article className="flex flex-col sm:flex-row border border-stone-200 bg-white overflow-hidden">
      <div className="relative sm:w-44 shrink-0 bg-stone-100 aspect-4/3 sm:aspect-auto">
        {item.product.primaryImageUrl && (
          <Image
            src={item.product.primaryImageUrl}
            alt={item.product.primaryImageAlt}
            fill
            sizes="(min-width: 640px) 176px, 100vw"
            className="object-cover"
            unoptimized={isSvgImageUrl(item.product.primaryImageUrl)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-stone-500">
              #{index + 1} · {item.product.sku}
            </span>
            {item.product.status === "ARCHIVED" && (
              <Badge variant="archived">Archived Reference</Badge>
            )}
          </div>

          <h3 className="mt-1 text-base font-semibold text-stone-900">
            {item.product.status === "PUBLISHED" ? (
              <Link
                href={`/products/${item.product.slug}`}
                className="hover:underline"
              >
                {item.product.name}
              </Link>
            ) : (
              <span>{item.product.name}</span>
            )}
          </h3>

          <p className="mt-1 text-xs text-stone-600">
            {item.product.materialTypeName} · {item.product.finishName}
          </p>
          <p className="mt-0.5 font-mono text-xs text-stone-500">
            {item.product.dimensionText} · MOQ {item.product.moqValue}{" "}
            {item.product.moqUnit}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={() => onMove(index, "up")}
              aria-label={`Move ${item.product.name} earlier in sequence`}
              className="inline-flex items-center gap-1 border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:border-stone-900 disabled:opacity-40"
            >
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
              <span>Move Up</span>
            </button>
            <button
              type="button"
              disabled={disabled || index === totalItems - 1}
              onClick={() => onMove(index, "down")}
              aria-label={`Move ${item.product.name} later in sequence`}
              className="inline-flex items-center gap-1 border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:border-stone-900 disabled:opacity-40"
            >
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
              <span>Move Down</span>
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.product.name} from moodboard`}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </article>
  );
}
