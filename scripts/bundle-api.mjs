#!/usr/bin/env node
/**
 * Bundle API routes for Vercel production.
 * Node ESM ("type":"module") + extensionless @vercel/node output = FUNCTION_INVOCATION_FAILED.
 * We emit ESM bundles as api .js files; .vercelignore excludes api .ts on deploy.
 * `vercel dev` still runs .ts sources directly.
 */

import * as esbuild from 'esbuild';
import { readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiRoot = path.join(root, 'api');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

const entries = walk(apiRoot);
let ok = 0;

for (const entry of entries) {
  const outFile = entry.replace(/\.ts$/, '.js');
  mkdirSync(path.dirname(outFile), { recursive: true });
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: outFile,
    sourcemap: true,
    logLevel: 'silent',
    packages: 'external',
  });
  ok += 1;
}

console.log(`Bundled ${ok} API handlers (api .js, ESM)`);
