import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

const TOKEN_NAME = 'nextjs-invoice-app';
const ADMIN_EMAIL = 'admin@gobike.local';
const ADMIN_PASSWORD = 'GoBike123!';

function updateEnvLocal(envPath: string, token: string) {
  const existing = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').split('\n')
    : [];

  const entries: Record<string, string> = {
    STRAPI_URL: 'http://localhost:1337',
    STRAPI_API_TOKEN: token,
  };

  const lines = [...existing];

  for (const [key, value] of Object.entries(entries)) {
    const index = lines.findIndex((line) => line.startsWith(`${key}=`));
    const line = `${key}=${value}`;
    if (index >= 0) {
      lines[index] = line;
    } else {
      lines.push(line);
    }
  }

  fs.writeFileSync(
    envPath,
    lines.filter((line) => line.trim().length > 0).join('\n') + '\n'
  );
}

async function ensureAdmin(strapi: Core.Strapi) {
  const hasAdmin = await strapi.admin.services.user.exists();

  if (!hasAdmin) {
    const superAdminRole = await strapi.admin.services.role.getSuperAdmin();

    await strapi.admin.services.user.create({
      email: ADMIN_EMAIL,
      firstname: 'GO',
      lastname: 'BIKE',
      password: ADMIN_PASSWORD,
      isActive: true,
      roles: [superAdminRole.id],
    });

    strapi.log.info(`Strapi admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }
}

async function ensurePermissions(strapi: Core.Strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  if (!role) return;

  const actions = [
    'api::customer.customer.create',
    'api::customer.customer.find',
    'api::customer.customer.findOne',
    'api::customer.customer.update',
    'api::invoice.invoice.create',
    'api::invoice.invoice.find',
    'api::invoice.invoice.findOne',
    'api::invoice.invoice.update',
  ];

  for (const action of actions) {
    const permission = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({
        where: { action, role: role.id },
      });

    if (!permission) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id, enabled: true },
      });
    } else if (!permission.enabled) {
      await strapi.db.query('plugin::users-permissions.permission').update({
        where: { id: permission.id },
        data: { enabled: true },
      });
    }
  }
}

async function ensureApiToken(strapi: Core.Strapi) {
  const envPath = path.resolve(strapi.dirs.app.root, '..', '.env.local');

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^STRAPI_API_TOKEN=(.+)$/m);
    if (match?.[1]?.trim()) {
      return;
    }
  }

  const existing = await strapi.db
    .query('admin::api-token')
    .findMany({
      where: { name: TOKEN_NAME, type: 'full-access' },
    });

  for (const token of existing) {
    await strapi.admin.services['api-token-content-api'].revoke(token.id);
  }

  const tokenService = strapi.admin.services['api-token-content-api'];
  const { accessKey } = await tokenService.create({
    name: TOKEN_NAME,
    description: 'Auto-generated for GO BIKE invoice app',
    type: 'full-access',
    lifespan: null,
  });

  updateEnvLocal(envPath, accessKey);
  strapi.log.info('STRAPI_API_TOKEN written to ../.env.local');
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureAdmin(strapi);
    await ensurePermissions(strapi);
    await ensureApiToken(strapi);
  },
};
