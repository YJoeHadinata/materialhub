"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface StudioToastProps {
  message: string | null;
  onDismiss: () => void;
  tag?: string;
  duration?: number;
}

export function StudioToast({
  message,
  onDismiss,
  tag = "SYNCED",
  duration = 4000,
}: StudioToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed right-6 bottom-6 z-50 flex items-center gap-4 border border-stone-800 bg-stone-950 px-4 py-3 text-xs text-stone-100 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span className="h-1.5 w-1.5 shrink-0 bg-white" aria-hidden="true" />
      <span className="font-medium">{message}</span>
      <span className="border-l border-stone-800 pl-3 font-mono text-[10px] tracking-widest text-stone-400 uppercase">
        {tag}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-1 text-stone-400 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
