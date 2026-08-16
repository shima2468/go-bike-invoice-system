"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck,
  FilePlus,
  FileText,
  LayoutDashboard,
  MapPin,
  Plus,
  Receipt,
  ShoppingBag,
  X,
} from "lucide-react";
import { CompanyLogo } from "@/components/layout/company-logo";
import { companyConfig } from "@/lib/company";
import { cn } from "@/lib/utils";

const navSections = [
  {
    title: "Overzicht",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/sales", label: "Verkoop", icon: ShoppingBag },
    ],
  },
  {
    title: "Facturen",
    items: [
      { href: "/invoices", label: "Alle facturen", icon: FileText },
      { href: "/invoices/new", label: "Nieuwe factuur", icon: FilePlus },
    ],
  },
  {
    title: "Bonnen",
    items: [
      { href: "/receipts", label: "Alle bonnen", icon: FileCheck },
      { href: "/receipts/new", label: "Nieuwe bon", icon: Receipt },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.endsWith("/new")) return pathname === href;
  if (pathname.endsWith("/new")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Menu sluiten"
        className={cn(
          "fixed inset-0 z-40 bg-black/70 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[272px] shrink-0 flex-col border-r border-white/10 bg-[#070707] transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative overflow-hidden border-b border-white/10 px-4 pb-4 pt-5">
          <div className="pointer-events-none absolute -left-10 -top-16 h-36 w-36 rounded-full bg-brand-primary/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex min-w-0 items-center">
              <CompanyLogo className="h-11" priority />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[13px] font-semibold text-white">{companyConfig.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-zinc-400">
              <MapPin className="h-3 w-3 text-brand-primary" />
              {companyConfig.city} · {companyConfig.country}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-2 py-2 text-[14px] font-medium transition-all",
                          active
                            ? "bg-brand-primary text-black shadow-[0_0_24px_rgba(118,199,45,0.25)]"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            active ? "bg-black/10" : "bg-white/5 text-brand-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/sales"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-[14px] font-semibold text-black shadow-[0_0_24px_rgba(118,199,45,0.2)] hover:bg-brand-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Eerste verkoop
          </Link>
        </div>
      </aside>
    </>
  );
}
