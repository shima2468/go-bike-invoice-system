import type { Core } from '@strapi/strapi';

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'https://go-bike-invoice-system.vercel.app',
];

function allowedOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...defaultOrigins, ...fromEnv])];
}

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: (ctx: { get: (header: string) => string | undefined }) => {
        const requestOrigin = ctx.get('Origin') ?? '';
        const allowed = allowedOrigins();

        if (!requestOrigin) return true;
        if (allowed.includes(requestOrigin)) return requestOrigin;
        if (requestOrigin.endsWith('.vercel.app')) return requestOrigin;

        return false;
      },
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
