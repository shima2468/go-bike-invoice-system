"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays } from "lucide-react";
import { companyConfig } from "@/lib/company";

const titles: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "Overzicht", title: "Dashboard" },
  "/sales": { eyebrow: "Verkoop", title: "Verkoop noteren" },
  "/invoices": { eyebrow: "Facturen", title: "Alle facturen" },
  "/invoices/new": { eyebrow: "Facturen", title: "Nieuwe factuur" },
  "/receipts": { eyebrow: "Bonnen", title: "Alle bonnen" },
  "/receipts/new": { eyebrow: "Bonnen", title: "Nieuwe bon" },
};

function resolveTitle(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/invoices/")) {
    return { eyebrow: "Facturen", title: "Factuur" };
  }
  if (pathname.startsWith("/receipts/")) {
    return { eyebrow: "Bonnen", title: "Bon" };
  }
  return { eyebrow: "GO BIKE", title: "Workspace" };
}

export function AppTopNav() {
  const pathname = usePathname();
  const { eyebrow, title } = resolveTitle(pathname);
  const today = new Date().toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-[#0a0a0a]/80 px-6 py-3.5 ios-blur lg:flex lg:items-center lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
          {eyebrow}
        </p>
        <p className="text-[15px] font-semibold text-white">{title}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-zinc-300">
          <CalendarDays className="h-3.5 w-3.5 text-brand-primary" />
          {today}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-3 py-1.5 text-[12px] font-medium text-brand-primary">
          Live
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300"
          aria-label="Meldingen"
        >
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/"
          className="flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[12px] font-semibold text-white"
        >
          {companyConfig.city}
        </Link>
      </div>
    </header>
  );
}
