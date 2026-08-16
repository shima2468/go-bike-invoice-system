import { companyConfig } from "@/lib/company";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0a0a0a]">
      <div className="px-4 py-5 text-center text-[13px] text-zinc-500 sm:px-6 lg:px-8 lg:text-left">
        © {year} {companyConfig.name}
        {companyConfig.city ? ` · ${companyConfig.postalCode} ${companyConfig.city}` : ""}
      </div>
    </footer>
  );
}
