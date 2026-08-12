import Link from "next/link";
import { ArrowRight, Calculator, FileText, Send } from "lucide-react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Klant & scooter",
    description: "Alle gegevens in één overzichtelijk formulier.",
  },
  {
    icon: Calculator,
    title: "Automatische BTW",
    description: "BTW en totaal worden direct berekend.",
  },
  {
    icon: Send,
    title: "PDF & verzenden",
    description: "Download, e-mail of WhatsApp na opslaan.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-primary">
            Facturatie
          </p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-foreground sm:text-[40px] lg:text-[44px]">
            Professionele facturen in enkele minuten
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]">
            Maak snel facturen voor klanten en scooters. BTW en totaal worden
            automatisch berekend.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-xl">
          <div className="overflow-hidden rounded-3xl bg-surface shadow-ios-lg">
            <div className="px-8 py-10 text-center sm:px-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary">
                <FileText className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h2 className="text-[22px] font-bold text-foreground">
                Nieuwe factuur
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
                Start direct met het invullen van klantgegevens, scootergegevens
                en prijs.
              </p>
            </div>
            <div className="border-t border-separator bg-surface-secondary/50 px-8 py-6 sm:px-10">
              <Link href="/invoices/new" className="block">
                <Button size="lg" className="w-full">
                  Factuur aanmaken
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3 sm:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-surface px-5 py-5 text-center shadow-ios sm:text-left"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-brand-primary sm:mx-0">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
