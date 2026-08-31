/** Product JSON-LD Offer coverage — shared by crawl + verify scripts. */

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function hasOfferPrice(row: Record<string, unknown>): boolean {
  const price = row.price ?? row.lowPrice ?? row.highPrice;
  const n =
    typeof price === 'string' ? parseFloat(price) : typeof price === 'number' ? price : NaN;
  return Number.isFinite(n) && n > 0;
}

function hasOfferAvailability(row: Record<string, unknown>): boolean {
  const avail = row.availability;
  if (avail == null) return false;
  const s = String(avail).trim();
  return s.length > 0 && s !== 'undefined';
}

/** True when a Product node has at least one Offer with price + availability. */
export function productNodeHasOffer(node: Record<string, unknown>): boolean {
  const offers = node.offers;
  if (!offers) return false;
  const list = asArray(
    typeof offers === 'object' && offers !== null && 'offers' in (offers as object)
      ? (offers as Record<string, unknown>).offers
      : offers,
  );
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (hasOfferPrice(row) && hasOfferAvailability(row)) return true;
  }
  return false;
}

/** % of Product JSON-LD nodes with valid Offer; null when no Product nodes sampled. */
export function computeOfferPct(nodes: Record<string, unknown>[]): number | null {
  if (nodes.length === 0) return null;
  const withOffer = nodes.filter(productNodeHasOffer).length;
  return Math.round((withOffer / nodes.length) * 100);
}
