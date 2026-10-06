#!/usr/bin/env node
/**
 * check-embarrassment — judge/demo/submit paths must not ship stale UI claims.
 * Historical LOG/research files may still mention old figures; they are excluded.
 * A warning line ("do not claim 16 tools") is allowed; a how-to that says
 * "Start shopping" is not.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Files a stranger/judge is likely to open. */
const JUDGE_PATH = [
  'JUDGE-60s.md',
  'CHATGPT-JUDGE.md',
  'DEVPOST.md',
  'DEPLOY.md',
  'DEMO-SCRIPT.md',
  'FILM-CUES.md',
  'FILM-READY.md',
  'DEMO.md',
  'ONBOARDING.md',
  'README.md',
  'LAUNCH.md',
  'submission/DEVPOST-PASTE.md',
  'submission/SUBMIT-READY.md',
  'submission/README.md',
  'submission/JUDGES.md',
  'demo/PITCH-TOMORROW.md',
  'demo/FILM-AND-SUBMIT.md',
];

const FORBIDDEN = [
  {
    re: /film \+ Devpost submit remain/i,
    why: 'Film v2 is on disk; Oscar owns YouTube+Devpost only — reword the Oscar note',
  },
  {
    re: /Assistant tools active · 16 connected/i,
    why: 'Live badge is WebMCP live · 18 tools (or Tools ready · Connect to test)',
  },
  {
    re: /\b16 connected\b/i,
    why: 'Tool count is 18 — do not print 16 connected',
  },
];

/** "Start shopping" as an instruction (not a negation / Do-NOT list). */
function isBadStartShopping(line) {
  if (!/Start shopping/i.test(line)) return false;
  if (
    /no .*Start shopping|not .*Start shopping|Do NOT|❌|Removed|there is no|“Start shopping”|\"Start shopping\"/i.test(
      line,
    )
  ) {
    return false;
  }
  return true;
}

function isBadStartLive(line) {
  if (!/Start live session/i.test(line)) return false;
  if (
    /overpromises|Removed|Do NOT|❌|removes|no .*Start live|“Start live|\"Start live/i.test(line)
  ) {
    return false;
  }
  return true;
}

/** Claiming current tool surface is 16 (not historical "when we had 16"). */
function isBadSixteenToolsClaim(line) {
  if (!/\b16 tools\b/i.test(line)) return false;
  if (
    /stale|❌|Do NOT|it'?s \*\*18\*\*|it is \*\*18\*\*|now \*\*18\*\*|→\s*18|vs scraped|old|when the tree had|\(it is \*\*18\*\*\)/i.test(
      line,
    )
  ) {
    return false;
  }
  // Allow explicit contrast tables: "| 18 WebMCP tools | 16 tools |"
  if (/\|\s*18\b/.test(line) && /16 tools/i.test(line)) return false;
  return true;
}

function isBadThirtyFour(line) {
  if (!/34\/58/.test(line)) return false;
  if (/stale|❌|Do NOT|Earlier|old|v2 34\/58|from 34\/58/i.test(line)) return false;
  return true;
}

let fails = 0;

for (const rel of JUDGE_PATH) {
  const file = path.join(root, rel);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  text.split('\n').forEach((line, i) => {
    for (const rule of FORBIDDEN) {
      if (rule.re.test(line)) {
        console.log(`FAIL ${rel}:${i + 1} — ${rule.why}\n  ${line.trim()}`);
        fails += 1;
      }
    }
    if (isBadStartShopping(line)) {
      console.log(`FAIL ${rel}:${i + 1} — instruct Co-shop / ?view=shop, not Start shopping\n  ${line.trim()}`);
      fails += 1;
    }
    if (isBadStartLive(line)) {
      console.log(`FAIL ${rel}:${i + 1} — Start live session removed; use Copy cart link\n  ${line.trim()}`);
      fails += 1;
    }
    if (isBadSixteenToolsClaim(line)) {
      console.log(`FAIL ${rel}:${i + 1} — claim 18 tools, not 16\n  ${line.trim()}`);
      fails += 1;
    }
    if (isBadThirtyFour(line)) {
      console.log(`FAIL ${rel}:${i + 1} — claim 78/148, not 34/58\n  ${line.trim()}`);
      fails += 1;
    }
  });
}

if (fails > 0) {
  console.log(`\ncheck-embarrassment: ${fails} failure(s)`);
  process.exit(1);
}
console.log('check-embarrassment: judge-path docs clean of stale Start shopping / 16 tools / 34/58 claims');
