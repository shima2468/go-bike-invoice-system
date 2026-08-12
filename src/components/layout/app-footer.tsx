import Link from "next/link";
import { companyConfig } from "@/lib/company";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-separator bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="text-center lg:text-left">
          <p className="text-[15px] font-semibold text-foreground">
            {companyConfig.name}
          </p>
          {companyConfig.tagline && (
            <p className="mt-1 text-[13px] uppercase tracking-wide text-brand-primary">
              {companyConfig.tagline}
            </p>
          )}
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted lg:justify-end">
          <Link
            href="/invoices/new"
            className="transition-colors hover:text-brand-primary"
          >
            Nieuwe factuur
          </Link>
          <span className="hidden text-separator sm:inline">·</span>
          <span>{companyConfig.city ? `${companyConfig.postalCode} ${companyConfig.city}` : companyConfig.country}</span>
          <span className="hidden text-separator sm:inline">·</span>
          <span>© {year} {companyConfig.name}</span>
        </nav>
      </div>
    </footer>
  );
}
