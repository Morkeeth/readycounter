#!/usr/bin/env node
/**
 * Probe Render API with RENDER_API_KEY and optionally provision Key Value for ReadyCounter.
 *
 * Usage:
 *   RENDER_API_KEY=rnd_... node scripts/render-setup.mjs
 *   RENDER_API_KEY=rnd_... node scripts/render-setup.mjs --create
 *
 * Reads RENDER_API_KEY from env or .env.local (does not print the key).
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KV_NAME = 'readycounter-kv';

function loadEnvLocal() {
  const file = path.join(root, '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const apiKey = process.env.RENDER_API_KEY?.trim();
if (!apiKey) {
  console.error('Missing RENDER_API_KEY. Add it to .env.local or export it.');
  process.exit(1);
}

const create = process.argv.includes('--create');
const allowExternal = process.argv.includes('--allow-external');

async function renderFetch(pathname, init = {}) {
  const res = await fetch(`https://api.render.com/v1${pathname}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : String(body);
    throw new Error(`Render API ${res.status} ${pathname}: ${msg}`);
  }
  return body;
}

function ownerIdFromOwners(owners) {
  if (!Array.isArray(owners) || owners.length === 0) return null;
  const team = owners.find((o) => o.owner?.type === 'team');
  const user = owners.find((o) => o.owner?.type === 'user');
  return (team ?? user)?.owner?.id ?? null;
}

async function main() {
  console.log('Render API key: present (not printed)');

  const owners = await renderFetch('/owners');
  const ownerId = ownerIdFromOwners(owners);
  if (!ownerId) {
    throw new Error('No Render owner found for this API key.');
  }
  const ownerLabel = owners.find((o) => o.owner?.id === ownerId)?.owner?.name ?? ownerId;
  console.log('Owner:', ownerLabel);

  const listed = await renderFetch('/key-value?limit=50');
  const instances = Array.isArray(listed) ? listed : [];
  let match = instances.find((row) => row.keyValue?.name === KV_NAME);

  if (!match && create) {
    console.log(`Creating Key Value instance "${KV_NAME}" (free / oregon)...`);
    const created = await renderFetch('/key-value', {
      method: 'POST',
      body: JSON.stringify({
        name: KV_NAME,
        ownerId,
        plan: 'free',
        region: 'oregon',
        maxmemoryPolicy: 'allkeys_lru',
      }),
    });
    match = { keyValue: created };
    console.log('Created:', created.id, 'status:', created.status);
  }

  if (!match) {
    console.log('\nNo Key Value named', KV_NAME);
    console.log('Existing instances:', instances.map((r) => r.keyValue?.name).filter(Boolean).join(', ') || '(none)');
    console.log('\nRun with --create to provision, or create manually in Render dashboard.');
    console.log('Then set REDIS_URL in Vercel from the instance connection string.');
    return;
  }

  const kvId = match.keyValue.id;
  console.log('\nKey Value:', match.keyValue.name, `(${kvId})`, 'status:', match.keyValue.status);

  if (allowExternal) {
    console.log('Opening IP allowlist (0.0.0.0/0) for external clients (e.g. Vercel)...');
    await renderFetch(`/key-value/${kvId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ipAllowList: [{ cidrBlock: '0.0.0.0/0', description: 'Vercel and dev' }],
      }),
    });
    console.log('IP allowlist updated.');
  }

  const conn = await renderFetch(`/key-value/${kvId}/connection-info`);
  const redisUrl =
    conn?.externalConnectionString ?? conn?.internalConnectionString ?? conn?.connectionString;
  if (!redisUrl) {
    console.log('Connection info:', JSON.stringify(conn, null, 2));
    console.log('\nCould not find connection string in response. Copy REDIS_URL from Render dashboard → Connect.');
    return;
  }

  console.log('\n--- Add to Vercel env ---');
  console.log('REDIS_URL=' + redisUrl);
  console.log('\n--- Add to .env.local for local API testing ---');
  console.log('REDIS_URL=<same value>');
  console.log('\nHealth check after deploy: GET /api/v1/health → kv.backend should be "redis".');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
