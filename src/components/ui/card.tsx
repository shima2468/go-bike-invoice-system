import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl bg-surface shadow-ios",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "px-1 text-[13px] font-semibold uppercase tracking-wide text-label",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-2 overflow-hidden rounded-2xl bg-surface", className)}>
      {children}
    </div>
  );
}
