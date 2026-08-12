import { cn } from "@/lib/utils";

export function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block text-[13px] font-medium text-label",
        className
      )}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}
