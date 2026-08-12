# GO BIKE — Facturatiesysteem

Nederlands facturatiesysteem voor GO BIKE (Gent).

## Functies

- Factuur aanmaken, opslaan en bekijken
- PDF downloaden
- E-mail (Resend of mail-app fallback)
- WhatsApp met klaar bericht + PDF-download
- SQLite-database (lokaal) / Turso (productie)

## Lokaal starten

```bash
npm install
npm run dev
```

App: http://localhost:3000

Database wordt automatisch aangemaakt in `data/invoices.db`.

## Deploy (Vercel)

1. Push naar GitHub
2. Deploy op [vercel.com](https://vercel.com)
3. Voor permanente opslag op Vercel: maak een gratis [Turso](https://turso.tech) database en zet:

| Name | Value |
|------|--------|
| `TURSO_DATABASE_URL` | `libsql://...` |
| `TURSO_AUTH_TOKEN` | token |

## Tech

- Next.js 16 + TypeScript + Tailwind
- Drizzle ORM + libSQL / SQLite
- `@react-pdf/renderer` voor PDF
