import Link from "next/link";
import { FileCheck, FileText, Plus, ShoppingBag } from "lucide-react";
import { CompanyLogo } from "@/components/layout/company-logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-separator/80 bg-surface/90 ios-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <CompanyLogo className="h-14 sm:h-16" priority />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sales"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-separator bg-surface px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-secondary sm:px-4 sm:text-[14px]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Verkoop</span>
          </Link>
          <Link
            href="/invoices"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-separator bg-surface px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-secondary sm:px-4 sm:text-[14px]"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Facturen</span>
          </Link>
          <Link
            href="/receipts"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-separator bg-surface px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-secondary sm:px-4 sm:text-[14px]"
          >
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Bonnen</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-4 py-2 text-[13px] font-semibold text-brand-primary-foreground shadow-sm transition-all hover:bg-brand-primary-hover active:scale-[0.98] sm:px-5 sm:text-[14px]"
          >
            <Plus className="h-4 w-4" />
            Nieuw
          </Link>
        </nav>
      </div>
    </header>
  );
}
