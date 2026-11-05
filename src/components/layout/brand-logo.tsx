interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export function BrandLogo({
  className = "",
  showWordmark = true,
  size = "md",
  inverted = false,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: "h-6 w-6", text: "text-xs tracking-widest", sub: "text-[9px]" },
    md: { icon: "h-7 w-7", text: "text-sm tracking-wider", sub: "text-[10px]" },
    lg: { icon: "h-9 w-9", text: "text-base tracking-wider", sub: "text-xs" },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ARCHITECTURAL SPECIMEN STACK EMBLEM */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap.icon} shrink-0`}
        aria-hidden="true"
      >
        {/* Background container */}
        <rect
          width="32"
          height="32"
          rx="4"
          fill={inverted ? "#ffffff" : "#0c0a09"}
        />

        {/* Top slab: Polished surface layer */}
        <path
          d="M16 6L25.5 11.2L16 16.4L6.5 11.2L16 6Z"
          fill={inverted ? "#0c0a09" : "#ffffff"}
        />

        {/* Middle slab: Calibrated reveal layer */}
        <path
          d="M6.5 14L16 19.2L25.5 14V16.8L16 22L6.5 16.8V14Z"
          fill={inverted ? "#44403c" : "#d6d3d1"}
        />

        {/* Bottom slab: Foundation structural substrate */}
        <path
          d="M6.5 19.6L16 24.8L25.5 19.6V22.4L16 27.6L6.5 22.4V19.6Z"
          fill={inverted ? "#78716c" : "#a8a29e"}
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-semibold uppercase leading-none ${sizeMap.text} ${
              inverted ? "text-white" : "text-stone-950"
            }`}
          >
            MaterialHub
          </span>
          <span
            className={`mt-0.5 font-mono tracking-wider uppercase leading-none ${sizeMap.sub} ${
              inverted ? "text-stone-400" : "text-stone-500"
            }`}
          >
            Specification Library
          </span>
        </div>
      )}
    </div>
  );
}
