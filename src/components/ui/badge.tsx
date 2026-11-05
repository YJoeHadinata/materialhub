import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

type BadgeVariant = "neutral" | "published" | "draft" | "archived" | "pending" | "approved" | "rejected" | "suspended";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-stone-100 text-stone-800 border-stone-300",
  published: "bg-stone-900 text-white border-stone-900",
  approved: "bg-stone-900 text-white border-stone-900",
  draft: "bg-stone-100 text-stone-800 border-stone-400",
  pending: "bg-stone-100 text-stone-800 border-stone-400",
  archived: "bg-stone-200/70 text-stone-700 border-stone-300",
  rejected: "bg-stone-100 text-red-900 border-red-800/40",
  suspended: "bg-stone-100 text-red-900 border-red-800/40",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
