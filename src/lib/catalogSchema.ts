import type { Product } from '../types/commerce';

/** JSON-LD ItemList for agent-readable catalog (81% PDP gap). */
export function catalogJsonLd(storeName: string, products: Product[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${storeName} Catalog`,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.id,
        ...(product.gtin ? { gtin13: product.gtin } : {}),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };
}

/**
 * THE MACHINE-LEGIBILITY TEST, stated so it can be argued with.
 *
 * Presenc AI prices "Ambiguous page structure" at 6% of abandoned agent carts
 * and — checked at the URL on 2026-08-31, raw HTML — gives no definition of it
 * anywhere on the page. It is a bare row label. So the weight is published and
 * the TEST IS OURS, and this list is the whole of it: the fields a product
 * record has to carry before an agent can price it, check it and match it
 * without parsing prose.
 *
 * `gtin13` is on the list and that is the arguable one. A store-local `sku`
 * identifies the product inside this store; it resolves to nothing for an agent
 * that has never seen this store. A GTIN does. Digital Applied's 5,000-site
 * audit is the reason the Offer fields are here: only 19% of Product schemas
 * carried an Offer object at all.
 *
 * On 2026-08-31 an earlier wave of this repo ruled the opposite way — that a
 * GTIN check must NOT take the 6% row, because GTIN coverage is not page
 * markup. That objection was right about the check it was looking at, which
 * counted `product.gtin` on the fixture. This check reads the document the page
 * actually emits: `emittedProductRecords` walks the output of `catalogJsonLd`,
 * the same function `ShopView` writes into the page's
 * `<script type="application/ld+json">`. It is a markup test now, so the ruling
 * is superseded — see DECISIONS.md, Decision 6.
 */
export const REQUIRED_JSONLD_FIELDS = [
  'name',
  'sku',
  'gtin13',
  'offers.price',
  'offers.priceCurrency',
  'offers.availability',
] as const;

type JsonRecord = Record<string, unknown>;

function pathValue(record: JsonRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as JsonRecord)[key];
  }, record);
}

/**
 * The Product records this store actually emits into the page, read back out of
 * the emitted document rather than rebuilt from the fixture. One function, two
 * consumers: the page renders it, the score grades it.
 */
export function emittedProductRecords(storeName: string, products: Product[]): JsonRecord[] {
  const doc = catalogJsonLd(storeName, products);
  const list = (doc.itemListElement as JsonRecord[] | undefined) ?? [];
  return list
    .map((entry) => entry.item)
    .filter((item): item is JsonRecord => !!item && typeof item === 'object');
}

/** Which required fields this emitted record does not carry. */
export function missingJsonLdFields(record: JsonRecord): string[] {
  return REQUIRED_JSONLD_FIELDS.filter((path) => {
    const value = pathValue(record, path);
    return value === undefined || value === null || value === '';
  });
}

export interface LegibilityReport {
  total: number;
  legible: number;
  /** Every required field that is missing somewhere, with how many records miss it. */
  gaps: { field: string; missing: number }[];
}

export function catalogLegibility(storeName: string, products: Product[]): LegibilityReport {
  const records = emittedProductRecords(storeName, products);
  const gapCount = new Map<string, number>();
  let legible = 0;
  for (const record of records) {
    const missing = missingJsonLdFields(record);
    if (missing.length === 0) legible += 1;
    for (const field of missing) gapCount.set(field, (gapCount.get(field) ?? 0) + 1);
  }
  return {
    total: records.length,
    legible,
    gaps: [...gapCount.entries()]
      .map(([field, missing]) => ({ field, missing }))
      .sort((a, b) => b.missing - a.missing),
  };
}
