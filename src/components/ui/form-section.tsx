import { cn } from "@/lib/utils";

export function FormSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <h2 className="px-4 text-[13px] font-semibold uppercase tracking-wide text-label sm:px-1">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-ios">
        {children}
      </div>
    </section>
  );
}

export function FormGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("md:grid md:grid-cols-2 md:divide-x md:divide-separator", className)}>
      {children}
    </div>
  );
}

export function FormField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-separator px-4 py-3 last:border-b-0 sm:px-5 sm:py-4 md:[&:nth-last-child(-n+2)]:border-b-0",
        className
      )}
    >
      {children}
    </div>
  );
}
