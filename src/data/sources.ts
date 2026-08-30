/**
 * ReadyCounter source register.
 *
 * Every number that reaches a merchant's screen resolves to one row here, and
 * every row here is quoted in `research.md` with its exact sentence. If a claim
 * has no row, it does not get printed. That is the whole rule.
 *
 * `accessed` is the date a human opened the URL and read the sentence — not the
 * date this file was edited.
 */

export interface Source {
  id: string;
  /** What this source lets ReadyCounter say, in the merchant's words. */
  claim: string;
  /** The figure itself, formatted for print. */
  figure: string;
  publisher: string;
  url: string;
  /** Publication date of the cited page, as the page states it. */
  published: string;
  /** ISO date the URL was opened and the quote copied. */
  accessed: string;
  /** Honest limit of the source. Printed next to the claim, never hidden. */
  caveat?: string;
}

export const SOURCES = {
  presenc_captcha: {
    id: 'presenc_captcha',
    claim: 'A CAPTCHA or verification wall is the cause of 24% of abandoned agent carts.',
    figure: '24%',
    publisher: 'Presenc AI',
    url: 'https://presenc.ai/research/agent-cart-abandonment-statistics-2026',
    published: '2026-06',
    accessed: '2026-08-31',
    caveat:
      'Vendor research page, not peer reviewed. Presenc states the metrics are "modeled from observed agent sessions and vendor-reported benchmarks."',
  },
  presenc_account_wall: {
    id: 'presenc_account_wall',
    claim:
      'A required account or login is the cause of 15% of abandoned agent carts — its own row in the same table, separate from the CAPTCHA.',
    figure: '15%',
    publisher: 'Presenc AI',
    url: 'https://presenc.ai/research/agent-cart-abandonment-statistics-2026',
    published: '2026-06',
    accessed: '2026-08-31',
    caveat:
      'Same modeled panel as the 24% CAPTCHA figure. ReadyCounter charged this wall 24 points until 2026-08-31, when a re-read of the cited table found the row.',
  },
  presenc_stale_feed: {
    id: 'presenc_stale_feed',
    claim: 'Stale price or stock data at checkout causes 26% of abandoned agent carts.',
    figure: '26%',
    publisher: 'Presenc AI',
    url: 'https://presenc.ai/research/agent-cart-abandonment-statistics-2026',
    published: '2026-06',
    accessed: '2026-08-31',
    caveat: 'Same modeled panel as the CAPTCHA figure; treat as an industry benchmark, not a census.',
  },
  presenc_abandon: {
    id: 'presenc_abandon',
    claim: 'Agent carts abandon at 78.6%, against a human benchmark near 70%.',
    figure: '78.6%',
    publisher: 'Presenc AI',
    url: 'https://presenc.ai/research/agent-cart-abandonment-statistics-2026',
    published: '2026-06',
    accessed: '2026-08-31',
  },
  schema_offer_gap: {
    id: 'schema_offer_gap',
    claim:
      'Of ecommerce sites that emit Product schema, only 19% include the Offer object agents read for price and availability.',
    figure: '19% carry Offer',
    publisher: 'Digital Applied — 5,000-site audit',
    url: 'https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026',
    published: '2026-04-26',
    accessed: '2026-08-30',
    caveat:
      'The 81% figure quoted in the pitch is our subtraction (100 − 19), not a headline in the audit.',
  },
  shopify_catalog_2x: {
    id: 'shopify_catalog_2x',
    claim:
      'Traffic from catalog-powered AI search converts 2× better than AI search working from scraped data.',
    figure: '2×',
    publisher: 'Shopify — Q1 2026 earnings call (Harley Finkelstein)',
    url: 'https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/',
    published: '2026-Q1',
    accessed: '2026-08-30',
  },
  shopify_ai_traffic: {
    id: 'shopify_ai_traffic',
    claim:
      'AI-referred sessions to Shopify storefronts grew more than 8× year over year; AI-referred orders nearly 13×.',
    figure: '8× / 13×',
    publisher: 'Shopify Enterprise',
    url: 'https://www.shopify.com/enterprise/blog/ai-search-insights',
    published: '2026-05-11',
    accessed: '2026-08-30',
  },
  adobe_conversion_flip: {
    id: 'adobe_conversion_flip',
    claim:
      'AI-referred traffic converted 38% worse than other traffic in March 2025 and 42% better in March 2026.',
    figure: '−38% → +42%',
    publisher: 'Adobe Digital Insights',
    url: 'https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable',
    published: '2026-04-16',
    accessed: '2026-08-30',
    caveat: 'Adobe compares AI-referred traffic to all non-AI traffic combined, not to organic search alone.',
  },
  yougov_trust_gap: {
    id: 'yougov_trust_gap',
    claim:
      '65% of US adults are comfortable letting AI compare prices; 14% are comfortable letting it place the order.',
    figure: '65% vs 14%',
    publisher: 'YouGov (US), fieldwork for Checkout.com',
    url: 'https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025',
    published: '2025-12-04',
    accessed: '2026-08-30',
    caveat: '1,287 US adults online, weighted, ±3pp. UK fieldwork gives 66% / 11%.',
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

export const SOURCE_IDS = Object.keys(SOURCES) as SourceId[];

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}

/** Print form used on the readiness tape: "Presenc AI · read 2026-08-30". */
export function sourceStamp(id: SourceId): string {
  const s = SOURCES[id];
  return `${s.publisher} · read ${s.accessed}`;
}
