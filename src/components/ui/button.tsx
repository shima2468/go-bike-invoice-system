import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-brand-primary text-brand-primary-foreground shadow-sm hover:bg-brand-primary-hover active:scale-[0.98] focus-visible:ring-brand-primary/40",
  secondary:
    "bg-surface text-foreground shadow-ios hover:bg-surface-secondary active:scale-[0.98] focus-visible:ring-brand-primary/25",
  ghost:
    "bg-transparent text-brand-primary hover:bg-brand-accent active:scale-[0.98]",
} as const;

const sizes = {
  default: "min-h-11 rounded-full px-5 py-2.5 text-[15px] font-semibold",
  lg: "min-h-[52px] rounded-2xl px-6 py-3 text-[17px] font-semibold",
  sm: "min-h-9 rounded-full px-4 py-2 text-[13px] font-semibold",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
