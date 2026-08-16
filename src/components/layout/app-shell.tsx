"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopNav } from "@/components/layout/app-top-nav";
import { CompanyLogo } from "@/components/layout/company-logo";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <AppSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0a0a0a]/90 px-4 py-3 ios-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-foreground hover:bg-surface-secondary"
            aria-label="Menu openen"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center">
            <CompanyLogo className="h-10" />
          </Link>
        </header>

        <AppTopNav />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <AppFooter />
      </div>
    </div>
  );
}
