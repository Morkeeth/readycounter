/**
 * verify-score — the check that keeps the readiness score honest.
 *
 * A score is only defensible if the arithmetic on screen cannot drift away from
 * the pages it claims to come from. Six assertions, run on every `npm run verify`:
 *
 *   1  the point budget sums to exactly 100
 *   2  every sourceId a weight names exists in the source register
 *   3  every register row carries a URL, a publish date and a date read
 *   4  every register URL is quoted in research.md
 *   5  a MEASURED weight equals the figure its source publishes
 *      (26 pts <-> "26%") — this is the one that catches silent drift
 *   6  the tool manifest and registerTools.ts name the same set of tools
 *
 *   8  no component calls a store getter inside a selector (React #185)
 *
 * Run: node scripts/verify-score.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let failures = 0;
function check(label, ok, got) {
  const mark = ok ? 'ok  ' : 'FAIL';
  console.log(`${mark} ${label}${got === undefined ? '' : ` — ${got}`}`);
  if (!ok) failures += 1;
}

const sourcesSrc = read('src/data/sources.ts');
const readinessSrc = read('src/lib/readiness.ts');
const manifestSrc = read('src/webmcp/toolManifest.ts');
const toolsSrc = read('src/webmcp/registerTools.ts');
const researchMd = read('research.md');

/* ---- parse the source register without importing TypeScript ---- */

const sourceBlocks = [...sourcesSrc.matchAll(/^ {2}([a-z0-9_]+): \{([\s\S]*?)^ {2}\},$/gm)];
const sources = new Map();
for (const [, id, body] of sourceBlocks) {
  const field = (name) => {
    const m = body.match(new RegExp(`${name}:\\s*(?:\\n\\s*)?'((?:[^'\\\\]|\\\\.)*)'`));
    return m ? m[1] : null;
  };
  sources.set(id, {
    figure: field('figure'),
    publisher: field('publisher'),
    url: field('url'),
    published: field('published'),
    accessed: field('accessed'),
  });
}

/*
 * A parser that silently reads fewer rows than the file holds is a check that
 * says "no" for the wrong reason, and nobody audits a check that says no.
 * `[a-z_]+` once skipped every id with a digit in it — two sources and two
 * weight references went unverified and the run still printed all-ok. So the
 * row count is pinned to the literal count of `id:` lines in the file.
 */
const declaredIds = [...sourcesSrc.matchAll(/^ {4}id: '([a-z0-9_]+)',$/gm)].map((m) => m[1]);
check(
  'source parser reads every row the file declares',
  sources.size === declaredIds.length && declaredIds.every((id) => sources.has(id)),
  `parsed ${sources.size} of ${declaredIds.length} declared`,
);

/* ---- 1 · point budget ---- */

const weightBlocks = [...readinessSrc.matchAll(
  /id:\s*'([a-z0-9_]+)',\s*\n\s*max:\s*(\d+),\s*\n\s*basis:\s*'(measured|allocated)',\s*\n\s*sourceIds:\s*\[([^\]]*)\]/g,
)].map(([, id, max, basis, ids]) => ({
  id,
  max: Number(max),
  basis,
  sourceIds: [...ids.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]),
}));

check('weights parsed', weightBlocks.length === 5, `${weightBlocks.length} weights`);

const budget = weightBlocks.reduce((n, w) => n + w.max, 0);
check('point budget sums to 100', budget === 100, `${budget}/100`);

/* ---- 2 · every named source exists ---- */

const named = weightBlocks.flatMap((w) => w.sourceIds);
const missing = named.filter((id) => !sources.has(id));
check(
  'every weight names a source that exists',
  missing.length === 0,
  missing.length ? `missing: ${missing.join(', ')}` : `${named.length} references`,
);

/* ---- 3 · every row is fully cited ---- */

const incomplete = [...sources.entries()].filter(
  ([, s]) => !s.url || !s.published || !s.accessed || !s.publisher || !s.figure,
);
check(
  'every source row carries publisher, figure, url, published, accessed',
  incomplete.length === 0,
  incomplete.length ? `incomplete: ${incomplete.map(([id]) => id).join(', ')}` : `${sources.size}/${sources.size}`,
);

/* ---- 4 · research.md quotes every URL ---- */

const unquoted = [...sources.entries()].filter(([, s]) => !researchMd.includes(s.url));
check(
  'every source URL appears in research.md',
  unquoted.length === 0,
  unquoted.length ? `not in research.md: ${unquoted.map(([id]) => id).join(', ')}` : `${sources.size}/${sources.size}`,
);

/* ---- 5 · a measured weight equals its published figure ---- */

for (const w of weightBlocks.filter((x) => x.basis === 'measured')) {
  const src = sources.get(w.sourceIds[0]);
  const pct = src?.figure?.match(/^(\d+(?:\.\d+)?)%$/);
  check(
    `measured weight ${w.id} equals its published figure`,
    Boolean(pct) && Number(pct[1]) === w.max,
    `weight ${w.max} vs ${src?.publisher} ${src?.figure}`,
  );
}

/* ---- 6 · the manifest matches the tools that actually register ---- */

const registered = new Set(
  [...toolsSrc.matchAll(/name:\s*'([a-z0-9_]+)'/g)].map((m) => m[1]),
);
const manifestNames = new Set(
  [...(manifestSrc.match(/WEBMCP_TOOL_NAMES = \[([\s\S]*?)\]/)?.[1] ?? '').matchAll(
    /'([a-z0-9_]+)'/g,
  )].map((m) => m[1]),
);
const declaredCount = Number(manifestSrc.match(/WEBMCP_TOOL_COUNT = (\d+);/)?.[1]);

check(
  'the manifest count equals the names it lists',
  declaredCount === manifestNames.size,
  `WEBMCP_TOOL_COUNT ${declaredCount} vs ${manifestNames.size} names`,
);

const notRegistered = [...manifestNames].filter((n) => !registered.has(n));
const notListed = [...registered].filter((n) => !manifestNames.has(n));
check(
  'every tool in the manifest actually registers, and vice versa',
  notRegistered.length === 0 && notListed.length === 0,
  notRegistered.length || notListed.length
    ? `manifest-only: ${notRegistered.join(', ') || 'none'} · code-only: ${notListed.join(', ') || 'none'}`
    : `${registered.size} tools match`,
);

/* ---- 7 · no score literal hardcoded into a component ---- */

const landing = read('src/components/LandingHero.tsx');
check(
  'landing screen scores the live store, not a literal',
  landing.includes('readinessScore(checks)') && !/landing-hero__score/.test(landing),
  'computed at render',
);

/* ---- 8 · no store getter called inside a selector ---- */

/*
 * This bug has now shipped twice, from two different authors, and both times it
 * white-screened a whole tab while every test stayed green — the verify scripts
 * drive the store directly and never render a component.
 *
 *   useShopStore((s) => s.getOrder())
 *   useShopStore((s) => s.getCatalogProducts())
 *
 * Each call builds a fresh object, so useSyncExternalStore sees a new snapshot
 * every pass and React throws #185 (maximum update depth). Select the getter,
 * call it during render. This check makes the pattern un-mergeable.
 */
const componentFiles = readdirSync(join(root, 'src/components')).filter((f) => f.endsWith('.tsx'));
const offenders = [];
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

for (const f of componentFiles) {
  // Comments describing the bug are not the bug.
  const src = stripComments(read(`src/components/${f}`));
  for (const m of src.matchAll(/useShopStore\(\s*\(\s*\w+\s*\)\s*=>\s*\w+\.(\w+)\(/g)) {
    offenders.push(`${f}: ${m[1]}()`);
  }
}
check(
  'no component calls a store getter inside a selector (React #185)',
  offenders.length === 0,
  offenders.length ? offenders.join(' · ') : `${componentFiles.length} components clean`,
);

console.log(
  failures === 0
    ? `\nverify-score: ${sources.size} sources, ${weightBlocks.length} weights, ${budget} pts — all checks pass`
    : `\nverify-score: ${failures} check(s) failed`,
);
process.exit(failures === 0 ? 0 : 1);
