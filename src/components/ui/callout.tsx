import type { ReactNode } from "react";

interface CalloutProps {
  variant?: "error" | "info" | "warning";
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({
  variant = "error",
  title,
  children,
  className = "",
}: CalloutProps) {
  const styles = {
    error: {
      border: "border-l-2 border-red-700 bg-stone-100",
      tag: "text-red-700",
      defaultTitle: "Error",
    },
    warning: {
      border: "border-l-2 border-stone-800 bg-stone-100",
      tag: "text-stone-800",
      defaultTitle: "Notice",
    },
    info: {
      border: "border-l-2 border-stone-900 bg-stone-50",
      tag: "text-stone-700",
      defaultTitle: "Info",
    },
  }[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "region"}
      className={`${styles.border} px-3.5 py-2.5 text-xs text-stone-900 ${className}`}
    >
      <span
        className={`mr-2 font-mono text-[10px] font-semibold tracking-wider ${styles.tag} uppercase`}
      >
        {title ?? styles.defaultTitle}
      </span>
      <span>{children}</span>
    </div>
  );
}
