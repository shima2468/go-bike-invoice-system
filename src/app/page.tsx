import Link from "next/link";
import { ArrowRight, FileCheck, FileText, ShoppingBag } from "lucide-react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const documents = [
  {
    href: "/sales",
    listHref: "/sales",
    icon: ShoppingBag,
    label: "Verkoop",
    title: "Wat is er verkocht",
    description:
      "Bewaar per datum wat u verkocht heeft. Bijvoorbeeld: vandaag deze scooter.",
    cta: "Verkoop noteren",
  },
  {
    href: "/invoices/new",
    listHref: "/invoices",
    icon: FileText,
    label: "Factuur",
    title: "Nieuwe factuur",
    description:
      "Maak een professionele factuur voor klanten en scooters, met automatische BTW.",
    cta: "Factuur aanmaken",
  },
  {
    href: "/receipts/new",
    listHref: "/receipts",
    icon: FileCheck,
    label: "Bon",
    title: "Nieuwe bon",
    description:
      "Maak een betalingsbewijs nadat de klant heeft betaald. Inclusief PDF en verzenden.",
    cta: "Bon aanmaken",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Documenten
          </p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-foreground sm:text-[40px] lg:text-[44px]">
            Facturen en bonnen in enkele minuten
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
            Kies het document dat u nodig heeft. BTW en totaal worden automatisch
            berekend.
          </p>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-5 sm:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.href}
              className="overflow-hidden rounded-3xl bg-surface shadow-ios-lg"
            >
              <div className="px-7 py-8 sm:px-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary">
                  <document.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-brand-primary">
                  {document.label}
                </p>
                <h2 className="mt-1 text-[22px] font-bold text-foreground">
                  {document.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {document.description}
                </p>
                <Link href={document.listHref} className="mt-3 inline-block text-[14px] font-semibold text-brand-primary hover:underline">
                  Overzicht bekijken
                </Link>
              </div>
              <div className="border-t border-separator bg-surface-secondary/50 px-7 py-5 sm:px-8">
                <Link href={document.href} className="block">
                  <Button size="lg" className="w-full">
                    {document.cta}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
