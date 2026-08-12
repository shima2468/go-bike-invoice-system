/**
 * GO BIKE company configuration.
 * Brand colors derived from logo: lime green (#76C72D) + charcoal/black.
 */
export const companyConfig = {
  name: "GO BIKE",
  tagline: "EVERYONE RIDE BIKE",
  address: "Brugsepoortstraat 37",
  postalCode: "9000",
  city: "Gent",
  country: "België",
  phone: "+32 456 883 637",
  email: "info@gobike.be",
  kvk: "",
  btw: "",
  iban: "",
  logoPath: "/go-bike-logo.png",
  logoExists: true,
} as const;

/** Brand palette derived from GO BIKE logo */
export const brandTheme = {
  primary: "#76C72D",
  primaryHover: "#65a826",
  primaryForeground: "#0f172a",
  secondary: "#1a1a1a",
  accent: "#f0f7e8",
  border: "#e2e8f0",
  muted: "#64748b",
  background: "#f8fafc",
  surface: "#ffffff",
} as const;

export function getCompanyAddressLines(): string[] {
  return [
    companyConfig.address,
    `${companyConfig.postalCode} ${companyConfig.city}`,
    companyConfig.country,
  ].filter(Boolean);
}
