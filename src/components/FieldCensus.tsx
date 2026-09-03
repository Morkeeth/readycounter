import { useEffect, useMemo, useState } from 'react';
import { apiRankings } from '../api/client';

/**
 * The census wall — 148 tiles, one per real storefront we asked.
 *
 * Every class is DERIVED from GET /api/v1/rankings, never hardcoded:
 *   no feed          catalogScore === null   (we asked, nothing came back)
 *   feed, no barcode catalogScore !== null   (a feed, zero GTIN)
 *   barcode on UCP   ucpGtinWhereCrawlZero   (Catalog MCP has it, the scrape does not)
 *
 * The emptiness is the argument, so an empty tile stays empty.
 */

/**
 * Four classes, not three.
 *
 * "Asked, no feed" was hiding two different facts behind one grey tile. Probed
 * 2026-09-03: of the 70 non-answering stores, 22 refuse the request outright
 * (403/429) — and a real Chrome browser recovers 0 of them, so the block is
 * IP reputation and we genuinely cannot see whether they are ready. Painting
 * "we could not look" the same as "you have no data" is the exact error this
 * product exists to catch in other people's dashboards.
 */
type Klass = 'blocked' | 'none' | 'feed' | 'ucp';

interface Row {
  url: string;
  catalogScore: number | null;
  ucpGtinWhereCrawlZero?: boolean;
  error?: string;
}

export interface Census {
  tiles: Klass[];
  counts: { total: number; blocked: number; none: number; feed: number; ucp: number };
  ucpBrands: string[];
  at: string | null;
}

/** Storefront hosts are not brand names. Spell the ones we print. */
const BRAND_NAMES: Record<string, string> = {
  aloyoga: 'Alo Yoga',
  dagnedover: 'Dagne Dover',
  unitedbyblue: 'United By Blue',
  awaytravel: 'Away',
  brooklinen: 'Brooklinen',
  kyliecosmetics: 'Kylie Cosmetics',
  jeffreestarcosmetics: 'Jeffree Star',
  fentybeauty: 'Fenty Beauty',
  rarebeauty: 'Rare Beauty',
  colourpop: 'ColourPop',
};

function brandOf(url: string): string {
  const host = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const stem = host.split('.')[0];
  return BRAND_NAMES[stem] ?? stem.charAt(0).toUpperCase() + stem.slice(1);
}

/** A refusal, not an empty answer: the store never let us ask. */
const REFUSED = /\b(403|429|401|timeout)\b/i;

function classify(rows: Row[]): Klass[] {
  return rows.map((r) => {
    if (r.ucpGtinWhereCrawlZero) return 'ucp';
    if (r.catalogScore === null || r.catalogScore === undefined) {
      return r.error && REFUSED.test(r.error) ? 'blocked' : 'none';
    }
    return 'feed';
  });
}

/** Fixed shuffle: the wall must look scattered, and it must look the same on every load. */
function scatter<T>(input: T[]): T[] {
  const a = [...input];
  let seed = 20260902;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useCensus(): Census | null {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [at, setAt] = useState<string | null>(null);

  useEffect(() => {
    void apiRankings().then((data) => {
      const r = (data as { rows?: Row[] } | null)?.rows;
      if (!Array.isArray(r) || r.length === 0) return;
      setRows(r);
      setAt((data as { at?: string }).at ?? null);
    });
  }, []);

  return useMemo(() => {
    if (!rows) return null;
    const klasses = classify(rows);
    const counts = {
      total: klasses.length,
      blocked: klasses.filter((k) => k === 'blocked').length,
      none: klasses.filter((k) => k === 'none').length,
      feed: klasses.filter((k) => k === 'feed').length,
      ucp: klasses.filter((k) => k === 'ucp').length,
    };
    const ucpBrands = rows.filter((r) => r.ucpGtinWhereCrawlZero).map((r) => brandOf(r.url));
    return { tiles: scatter(klasses), counts, ucpBrands, at };
  }, [rows, at]);
}

interface FieldCensusProps {
  census: Census;
  /** Set once the visitor's own store has been audited — their tile joins the wall. */
  yourTile?: { label: string; klass: Klass } | null;
}

export function FieldCensus({ census, yourTile }: FieldCensusProps) {
  const { tiles, counts, ucpBrands } = census;
  const read = census.at
    ? new Date(census.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="census" aria-label={`The field: ${counts.total} storefronts asked`}>
      <div className="census__cap">
        <span className="census__lbl">The field · {counts.total} storefronts</span>
        <span className="census__lbl">{read ? `read ${read}` : 'live'}</span>
      </div>

      <ol className="census__tiles" role="list">
        {tiles.map((k, i) => (
          <li
            key={i}
            className={`census__tile census__tile--${k}`}
            aria-label={
              k === 'blocked'
                ? 'refused the request — unmeasured, not failing'
                : k === 'none'
                  ? 'answered, but sent no catalogue'
                  : k === 'feed'
                    ? 'a feed, with no barcode in it'
                    : 'barcode on Catalog MCP, empty on scrape'
            }
          />
        ))}
        <li
          className={`census__tile census__tile--you${yourTile ? ` census__tile--${yourTile.klass}` : ''}`}
          aria-label={yourTile ? `your store: ${yourTile.label}` : 'your store joins here'}
        />
      </ol>

      <dl className="census__key">
        <div>
          <dt className="census__swatch census__swatch--none" />
          <dd>
            <b>{counts.none}</b> answered, no catalogue
          </dd>
        </div>
        <div>
          <dt className="census__swatch census__swatch--blocked" />
          <dd>
            <b>{counts.blocked}</b> refused us — unmeasured
          </dd>
        </div>
        <div>
          <dt className="census__swatch census__swatch--feed" />
          <dd>
            <b>{counts.feed}</b> a feed, no barcode
          </dd>
        </div>
        <div>
          <dt className="census__swatch census__swatch--ucp" />
          <dd>
            <b>{counts.ucp}</b> barcode on Catalog MCP only
          </dd>
        </div>
      </dl>

      {counts.blocked > 0 ? (
        <p className="census__caveat">
          <b>{counts.blocked}</b> of these storefronts refuse an automated request outright. We
          re-probed every one with a real browser on 2026-09-03 and recovered none, so the block is
          IP reputation rather than anything we send. They are <strong>unmeasured, not failing</strong> —
          we will not score a store we could not read.
        </p>
      ) : null}

      {ucpBrands.length > 0 ? (
        <p className="census__brands">
          <span className="census__lbl">Have it and hide it</span>
          {ucpBrands.map((b) => (
            <span key={b} className="census__brand">
              {b}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
