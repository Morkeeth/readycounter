/**
 * Offer coverage — measured at the crawled object, not inferred from fixtures.
 * Benchmark: schema_offer_gap (Digital Applied 5k — 19% carry Offer).
 */

export interface OfferCoverageReport {
  total: number;
  withOffer: number;
  withCompleteOffer: number;
  offerPct: number;
  completeOfferPct: number;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function offerNodeHasPrice(offers: unknown): boolean {
  if (!offers || typeof offers !== 'object') return false;
  const o = offers as Record<string, unknown>;
  const list = asArray(o.offers ?? o);
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const price = row.price ?? row.lowPrice ?? row.highPrice;
    const n = typeof price === 'string' ? parseFloat(price) : typeof price === 'number' ? price : NaN;
    if (Number.isFinite(n) && n > 0) return true;
  }
  return false;
}

function offerNodeComplete(offers: unknown): boolean {
  if (!offers || typeof offers !== 'object') return false;
  const o = offers as Record<string, unknown>;
  const list = asArray(o.offers ?? o);
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const price = row.price ?? row.lowPrice ?? row.highPrice;
    const n = typeof price === 'string' ? parseFloat(price) : typeof price === 'number' ? price : NaN;
    const currency = row.priceCurrency ?? row.pricecurrency;
    const availability = row.availability;
    if (
      Number.isFinite(n) &&
      n > 0 &&
      typeof currency === 'string' &&
      currency.trim().length > 0 &&
      availability !== undefined &&
      availability !== null &&
      String(availability).trim().length > 0
    ) {
      return true;
    }
  }
  return false;
}

/** Grade raw JSON-LD Product nodes from homepage crawl. */
export function jsonLdOfferCoverage(nodes: Record<string, unknown>[]): OfferCoverageReport {
  const total = nodes.length;
  let withOffer = 0;
  let withCompleteOffer = 0;
  for (const node of nodes) {
    if (offerNodeHasPrice(node.offers)) withOffer += 1;
    if (offerNodeComplete(node.offers)) withCompleteOffer += 1;
  }
  return {
    total,
    withOffer,
    withCompleteOffer,
    offerPct: total === 0 ? 0 : Math.round((withOffer / total) * 100),
    completeOfferPct: total === 0 ? 0 : Math.round((withCompleteOffer / total) * 100),
  };
}

/** Grade products.json / Admin imports — variant price is the agent-visible Offer. */
export function catalogOfferCoverage(
  products: Array<{ price: number; currency?: string; inStock?: boolean }>,
): OfferCoverageReport {
  const total = products.length;
  let withOffer = 0;
  let withCompleteOffer = 0;
  for (const p of products) {
    if (p.price > 0) withOffer += 1;
    if (p.price > 0 && (p.currency?.trim().length ?? 0) > 0 && p.inStock !== undefined) {
      withCompleteOffer += 1;
    }
  }
  return {
    total,
    withOffer,
    withCompleteOffer,
    offerPct: total === 0 ? 0 : Math.round((withOffer / total) * 100),
    completeOfferPct: total === 0 ? 0 : Math.round((withCompleteOffer / total) * 100),
  };
}
