/**
 * Vertical tags for DTC field rankings.
 * Keep in sync with audits/curated-dtc.json (scripts load the JSON; UI/API use this module).
 */

import curated from './curated-dtc.json' with { type: 'json' };

export type CuratedVertical = string;

function normUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/^http:/, 'https:');
}

function hostnameOf(url: string): string {
  try {
    return new URL(normUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return normUrl(url);
  }
}

/** Prefer first vertical in file order; headless-suspects is a secondary tag only. */
const PRIMARY_ORDER = [
  'beauty',
  'apparel',
  'home',
  'food',
  'wellness',
  'pet',
  'accessories',
  'fun',
  'outdoor',
  'kids',
] as const;

const byHost = new Map<string, string>();
const byUrl = new Map<string, string>();

for (const key of PRIMARY_ORDER) {
  const list = (curated.verticals as Record<string, string[]>)[key] ?? [];
  for (const u of list) {
    const n = normUrl(u);
    if (!byUrl.has(n)) byUrl.set(n, key);
    const h = hostnameOf(u);
    if (!byHost.has(h)) byHost.set(h, key);
  }
}

/** Secondary tags (e.g. headless-suspects) — do not overwrite primary. */
for (const [vertical, urls] of Object.entries(curated.verticals as Record<string, string[]>)) {
  if ((PRIMARY_ORDER as readonly string[]).includes(vertical)) continue;
  for (const u of urls) {
    const n = normUrl(u);
    if (!byUrl.has(n)) byUrl.set(n, vertical);
    const h = hostnameOf(u);
    if (!byHost.has(h)) byHost.set(h, vertical);
  }
}

export function verticalForUrl(url: string): string {
  const n = normUrl(url);
  return byUrl.get(n) ?? byHost.get(hostnameOf(url)) ?? 'unknown';
}

export function listCuratedVerticals(): string[] {
  const counts = new Map<string, number>();
  for (const v of byHost.values()) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([v]) => v);
}

export function curatedHostCount(): number {
  return byHost.size;
}
