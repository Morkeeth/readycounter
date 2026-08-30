import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';

export function computeReadinessChecks(
  config: MerchantConfig,
  registeredToolCount: number,
  products: Product[],
): ReadinessCheck[] {
  const withGtin = products.filter((p) => p.gtin).length;
  const gtinPct = Math.round((withGtin / products.length) * 100);

  const priceMismatches = products.filter(
    (p) => p.feedPrice !== undefined && p.feedPrice !== p.price,
  );

  const outOfStock = products.filter((p) => !p.inStock).length;

  const checks: ReadinessCheck[] = [
    {
      id: 'catalog_schema',
      label: 'Catalog schema completeness',
      status: gtinPct >= 90 ? 'pass' : gtinPct >= 70 ? 'warn' : 'fail',
      detail: `${withGtin}/${products.length} products have GTIN identifiers for agent discovery.`,
      stat: `${gtinPct}%`,
    },
    {
      id: 'price_consistency',
      label: 'Price feed consistency',
      status: priceMismatches.length === 0 ? 'pass' : 'fail',
      detail:
        priceMismatches.length === 0
          ? 'Live price matches catalog feed on all SKUs.'
          : `Stale feed on: ${priceMismatches.map((p) => p.name).join(', ')}. Agents abandon ~26% of carts here (Presenc AI 2026).`,
      stat: priceMismatches.length === 0 ? '0 mismatches' : `${priceMismatches.length} mismatches`,
    },
    {
      id: 'agent_checkout_path',
      label: 'Agent checkout path',
      status:
        config.checkoutRequiresCaptcha || config.checkoutRequiresAccount
          ? 'fail'
          : 'pass',
      detail: config.checkoutRequiresCaptcha
        ? 'CAPTCHA on checkout blocks ~24% of agent sessions (Presenc AI 2026).'
        : config.checkoutRequiresAccount
          ? 'Forced account creation blocks ~22% of agent checkouts.'
          : 'Checkout path is agent-accessible.',
      stat: config.checkoutRequiresCaptcha ? 'CAPTCHA ON' : 'CLEAR',
    },
    {
      id: 'webmcp_tools',
      label: 'WebMCP tool surface',
      status: registeredToolCount >= 6 ? 'pass' : 'fail',
      detail: `${registeredToolCount} tools registered. Structured tools beat scrape — Shopify reports 2× conversion on Catalog vs scraped data.`,
      stat: `${registeredToolCount} tools`,
    },
    {
      id: 'stock_signals',
      label: 'Availability signals',
      status: outOfStock <= 1 ? 'pass' : 'warn',
      detail: `${outOfStock} SKU(s) out of stock with explicit availability flags for agents.`,
      stat: `${products.length - outOfStock} in stock`,
    },
  ];

  return checks;
}

export function readinessScore(checks: ReadinessCheck[]): number {
  const weights = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((sum, c) => sum + weights[c.status], 0);
  return Math.round((total / checks.length) * 100);
}
