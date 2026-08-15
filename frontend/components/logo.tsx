import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "dark" | "light";
}

export function Logo({
  className,
  showWordmark = true,
  variant = "dark",
}: LogoProps) {
  const markClass = variant === "light" ? "fill-white" : "fill-zinc-900";
  const barClass = variant === "light" ? "fill-indigo-600" : "fill-white";
  const textClass = variant === "light" ? "text-white" : "text-zinc-900";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 shrink-0"
        role="img"
        aria-label="Logora logo"
      >
        <rect width="32" height="32" rx="8" className={markClass} />
        <rect x="8" y="16" width="4" height="8" rx="1" className={barClass} />
        <rect x="14" y="12" width="4" height="12" rx="1" className={barClass} />
        <rect x="20" y="8" width="4" height="16" rx="1" className={barClass} />
      </svg>

      {showWordmark ? (
        <span className={cn("text-lg font-semibold tracking-tight", textClass)}>
          Logora
        </span>
      ) : null}
    </span>
  );
}
