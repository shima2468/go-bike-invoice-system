import Image from "next/image";
import { companyConfig } from "@/lib/company";
import { cn } from "@/lib/utils";

export function CompanyLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  if (!companyConfig.logoExists) {
    return (
      <div className="flex h-10 items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-600">
        Scooter Facturatie
      </div>
    );
  }

  return (
    <Image
      src={companyConfig.logoPath}
      alt={`${companyConfig.name} logo`}
      width={480}
      height={181}
      unoptimized
      priority={priority}
      className={cn("w-auto object-contain", className)}
    />
  );
}
