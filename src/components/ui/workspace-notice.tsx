import type { ReactNode } from "react";

interface WorkspaceNoticeProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function WorkspaceNotice({
  eyebrow,
  title,
  description,
  actions,
  ariaLabel,
  className = "",
}: WorkspaceNoticeProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel ?? title}
      className={`border border-stone-200 border-l-4 border-l-stone-900 bg-white p-6 sm:p-8 shadow-sm ${className}`}
    >
      <p className="font-mono text-xs font-semibold tracking-widest text-stone-500 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-stone-950">
        {title}
      </h1>
      <div className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-600">
        {description}
      </div>
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
