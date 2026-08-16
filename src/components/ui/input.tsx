import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl bg-surface-secondary px-3.5 py-3 text-[17px] text-foreground transition-colors placeholder:text-label/70 focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
