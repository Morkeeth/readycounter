import type { Product } from '../types/commerce';

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function offerHasPrice(offers: unknown): boolean {
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

function offerHasAvailability(offers: unknown): boolean {
  if (!offers || typeof offers !== 'object') return false;
  const o = offers as Record<string, unknown>;
  const list = asArray(o.offers ?? o);
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const avail = row.availability ?? row.itemAvailability;
    if (typeof avail === 'string' && avail.trim().length > 0) return true;
    if (avail && typeof avail === 'object') return true;
  }
  return false;
}

/** Product JSON-LD node carries Offer with price + availability. */
export function jsonLdNodeHasCompleteOffer(node: Record<string, unknown>): boolean {
  const offers = node.offers;
  if (!offers) return false;
  return offerHasPrice(offers) && offerHasAvailability(offers);
}

/** Feed row (products.json import) — price + stock state are the agent-visible offer. */
export function feedRowHasCompleteOffer(product: Product): boolean {
  return product.price > 0 && typeof product.inStock === 'boolean';
}

export function offerCoverageFromJsonLdNodes(nodes: Record<string, unknown>[]): number {
  if (nodes.length === 0) return 0;
  const complete = nodes.filter((n) => jsonLdNodeHasCompleteOffer(n)).length;
  return Math.round((complete / nodes.length) * 100);
}

export function offerCoverageFromProducts(products: Product[]): number {
  if (products.length === 0) return 0;
  const complete = products.filter((p) => feedRowHasCompleteOffer(p)).length;
  return Math.round((complete / products.length) * 100);
}
