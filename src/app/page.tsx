import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileCheck,
  FileText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { DashboardSalesChart } from "@/components/dashboard/sales-chart";
import { getSalesDashboard } from "@/lib/db/sales";
import {
  formatCurrency,
  formatDate,
  formatWeekdayShort,
} from "@/lib/invoice-formatting";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SOURCE_LABELS = {
  manual: "Notitie",
  invoice: "Factuur",
  receipt: "Bon",
} as const;

const quickActions = [
  { href: "/sales", icon: ShoppingBag, label: "Verkoop noteren" },
  { href: "/invoices/new", icon: FileText, label: "Nieuwe factuur" },
  { href: "/receipts/new", icon: FileCheck, label: "Nieuwe bon" },
];

export default async function HomePage() {
  const dashboard = await getSalesDashboard();
  const chartData = dashboard.daily.map((day) => ({
    date: day.date,
    label: formatWeekdayShort(day.date),
    total: day.total,
  }));
  const topMax = Math.max(...dashboard.topItems.map((item) => item.total), 1);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Dashboard
          </p>
          <h1 className="mt-2 text-[30px] font-bold tracking-tight text-white sm:text-[36px]">
            Verkoopoverzicht
          </h1>
          <p className="mt-2 text-[15px] text-zinc-400">
            {dashboard.allCount === 0
              ? "Nog geen verkopen. Noteer een verkoop of maak een factuur."
              : `Live cijfers van ${formatDate(dashboard.today)} — facturen, bonnen en notities.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-[13px] font-semibold text-white transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/10"
            >
              <action.icon className="h-4 w-4 text-brand-primary" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Vandaag"
          value={formatCurrency(dashboard.todayTotal)}
          hint={`${dashboard.todayCount} verkoop${dashboard.todayCount === 1 ? "" : "en"}`}
        />
        <StatCard
          icon={Wallet}
          label="Deze maand"
          value={formatCurrency(dashboard.monthTotal)}
          hint={`${dashboard.monthCount} verkoop${dashboard.monthCount === 1 ? "" : "en"}`}
          accent
        />
        <StatCard
          icon={ShoppingBag}
          label="Totaal omzet"
          value={formatCurrency(dashboard.allTotal)}
          hint={`${dashboard.allCount} records`}
        />
          <StatCard
          icon={FileText}
          label="Documenten"
          value={`${dashboard.invoiceCount + dashboard.receiptCount}`}
          hint={`${dashboard.invoiceCount} facturen · ${dashboard.receiptCount} bonnen`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Laatste 7 dagen"
            subtitle="Omzet per dag"
          />
          <DashboardSalesChart data={chartData} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Meest verkocht"
            subtitle="Deze maand, gesorteerd op omzet"
          />
          {dashboard.topItems.length === 0 ? (
            <p className="text-[14px] text-zinc-500">Nog niets verkocht deze maand.</p>
          ) : (
            <ol className="space-y-4">
              {dashboard.topItems.map((item, index) => (
                <li key={item.item}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary/15 text-[12px] font-bold text-brand-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-white">
                          {item.item}
                        </p>
                        <p className="text-[12px] text-zinc-500">{item.count}× verkocht</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-[14px] font-semibold tabular-nums text-white">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-primary"
                      style={{ width: `${Math.max((item.total / topMax) * 100, 6)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel className="mt-5 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-white">Recente verkopen</h2>
            <p className="text-[13px] text-zinc-500">Nieuwste eerst</p>
          </div>
          <Link
            href="/sales"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-primary hover:text-brand-primary-hover"
          >
            Alles bekijken
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {dashboard.recent.length === 0 ? (
          <p className="px-6 py-12 text-center text-[15px] text-zinc-500">
            Nog geen recente verkopen.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Datum</th>
                  <th className="px-6 py-3 font-medium">Verkocht</th>
                  <th className="px-6 py-3 font-medium">Klant</th>
                  <th className="px-6 py-3 font-medium">Bron</th>
                  <th className="px-6 py-3 text-right font-medium">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent.map((entry) => (
                  <tr
                    key={entry.key}
                    className="border-t border-white/10 transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-3.5 text-zinc-400">
                      {formatDate(entry.soldOn)}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-white">
                      {entry.href ? (
                        <Link href={entry.href} className="hover:text-brand-primary">
                          {entry.item}
                        </Link>
                      ) : (
                        entry.item
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-400">
                      {entry.customerName || "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[12px] text-zinc-300">
                        {SOURCE_LABELS[entry.source]}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-brand-primary">
                      {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </main>
  );
}

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-[#111111] p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[16px] font-semibold text-white">{title}</h2>
      <p className="mt-0.5 text-[13px] text-zinc-500">{subtitle}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#111111] p-5",
        accent && "border-brand-primary/25 bg-brand-primary/8"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-[26px] font-bold tracking-tight tabular-nums text-white">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-zinc-500">{hint}</p>
    </div>
  );
}
