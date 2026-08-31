#!/usr/bin/env node
/**
 * Render Cron entrypoint — batch-audit DTC shops and persist to Key Value.
 * Wired in render.yaml as readycounter-audit-cron.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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

const audit = spawnSync('npx', ['tsx', 'scripts/audit-shops.mjs', '--curated', '--publish'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(audit.status ?? 1);
