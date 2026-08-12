# GO BIKE — Facturatiesysteem

Nederlands facturatiesysteem voor GO BIKE (Gent). Next.js frontend + Strapi backend.

## Functies

- Factuur aanmaken, opslaan en bekijken
- PDF downloaden
- E-mail (Resend of mail-app fallback)
- WhatsApp met klaar bericht + PDF-download
- Strapi CMS voor klanten en facturen

## Lokaal starten

```bash
# Terminal 1 — Strapi
npm run dev:strapi

# Terminal 2 — Next.js
npm run dev
```

- App: http://localhost:3000
- Strapi admin: http://localhost:1337/admin

Kopieer `.env.example` naar `.env.local` en vul de variabelen in.

## Deploy (demo voor klant)

### 1. Frontend (Vercel)

1. Push deze repo naar GitHub
2. Importeer het project op [vercel.com](https://vercel.com/new)
3. Root directory: `.` (Next.js)
4. Environment variables:

| Name | Value |
|------|--------|
| `STRAPI_URL` | URL van je Strapi (bijv. `https://xxx.up.railway.app`) |
| `STRAPI_API_TOKEN` | API token uit Strapi Admin |
| `RESEND_API_KEY` | (optioneel) |
| `RESEND_FROM_EMAIL` | (optioneel) |

### 2. Backend (Railway / Render)

Deploy de map `strapi/`:

- **Build:** `npm install && npm run build`
- **Start:** `npm run start`
- Zet env: `HOST=0.0.0.0`, `PORT`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`

Na deploy: maak in Strapi Admin een API Token (Full access) en zet die in Vercel als `STRAPI_API_TOKEN`.

## Tech

- Next.js 16 + TypeScript + Tailwind
- Strapi 5 (SQLite lokaal)
- `@react-pdf/renderer` voor PDF
