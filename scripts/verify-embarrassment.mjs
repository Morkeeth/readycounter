#!/usr/bin/env node
/**
 * verify-embarrassment — judge-facing copy must not claim stale UI or tool counts.
 * Skips lines that explicitly warn against the stale phrase (Do NOT claim, ❌, etc.).
 */

import { readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PATTERNS = [
  { re: /\b16 tools\b/i, label: '16 tools (current: 18)' },
  { re: /\b16 connected\b/i, label: '16 connected (current: 18)' },
  { re: /Start shopping/i, label: 'Start shopping (removed — use Co-shop tab)' },
  { re: /Start live session/i, label: 'Start live session (removed — Copy cart link)' },
];

const FILES = [
  'README.md',
  'DEVPOST.md',
  'submission/DEVPOST-PASTE.md',
  'submission/SUBMIT-READY.md',
  'submission/JUDGES.md',
  'JUDGE-60s.md',
  'DEPLOY.md',
  'DEMO-SCRIPT.md',
  'FILM-CUES.md',
  'FILM-READY.md',
  'LAUNCH.md',
  'DEMO.md',
  'src/App.tsx',
  'src/components',
];

const SKIP_LINE =
  /do not claim|don't claim|not claim|❌|stale|removed|it's \*\*18\*\*|16 tools \(it's|wrong|NIGHTRUN|hack\.md|LOG|historical/i;

function listFiles(rel) {
  const abs = path.join(root, rel);
  try {
    const stat = statSync(abs);
    if (!stat.isDirectory()) return [abs];
    const out = [];
    for (const name of readdirSync(abs, { withFileTypes: true })) {
      const child = path.join(abs, name.name);
      if (name.isDirectory()) out.push(...listFiles(path.relative(root, child)));
      else if (/\.(tsx?|md)$/.test(name.name)) out.push(child);
    }
    return out;
  } catch {
    return [];
  }
}

let fails = 0;

for (const rel of FILES) {
  for (const file of listFiles(rel)) {
    const text = readFileSync(file, 'utf8');
    const relFile = path.relative(root, file);
    text.split('\n').forEach((line, i) => {
      if (SKIP_LINE.test(line)) return;
      for (const { re, label } of PATTERNS) {
        if (re.test(line)) {
          console.log(`FAIL ${relFile}:${i + 1} — ${label}`);
          console.log(`     ${line.trim().slice(0, 120)}`);
          fails += 1;
        }
      }
    });
  }
}

if (fails > 0) {
  console.log(`\nverify-embarrassment: ${fails} failure(s)`);
  process.exit(1);
}
console.log('verify-embarrassment: no stale judge-facing copy');
