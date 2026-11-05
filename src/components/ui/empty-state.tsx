import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-stone-200 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-medium tracking-tight text-stone-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
