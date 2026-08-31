import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';
import { computeReadinessChecks, readinessScore, weightFor } from './readiness';

export type AutopilotFix =
  | 'disable_captcha'
  | 'disable_account_wall'
  | 'sync_feed_prices';

export interface FixSuggestion {
  id: AutopilotFix;
  label: string;
  impact: string;
}

export function suggestFixes(
  checks: ReadinessCheck[],
  merchant: MerchantConfig,
  products: Product[],
): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  if (merchant.checkoutRequiresCaptcha) {
    suggestions.push({
      id: 'disable_captcha',
      label: 'Remove CAPTCHA on checkout',
      impact: `Clears the wall behind ~${weightFor('agent_checkout_path')}% of abandoned agent carts (Presenc AI 2026)`,
    });
  }
  if (merchant.checkoutRequiresAccount) {
    suggestions.push({
      id: 'disable_account_wall',
      label: 'Remove forced account login',
      impact: `Clears account-wall agent path (~${weightFor('account_wall')}% of agent carts, Presenc AI 2026)`,
    });
  }
  const mismatches = products.filter(
    (p) => p.feedPrice !== undefined && p.feedPrice !== p.price,
  );
  if (mismatches.length > 0) {
    suggestions.push({
      id: 'sync_feed_prices',
      label: `Sync feed prices (${mismatches.length} SKU)`,
      impact: `Fixes stale-price abandon risk (~${weightFor('price_consistency')}%)`,
    });
  }

  void checks;

  return suggestions;
}

export function applyAutopilotFix(
  fixId: AutopilotFix,
  merchant: MerchantConfig,
  products: Product[],
): { merchant: MerchantConfig; products: Product[] } {
  switch (fixId) {
    case 'disable_captcha':
      return {
        merchant: { ...merchant, checkoutRequiresCaptcha: false },
        products,
      };
    case 'disable_account_wall':
      return {
        merchant: { ...merchant, checkoutRequiresAccount: false },
        products,
      };
    case 'sync_feed_prices':
      return {
        merchant,
        products: products.map((p) => ({
          ...p,
          feedPrice: p.price,
        })),
      };
    default:
      return { merchant, products };
  }
}

export function scoreAfterFix(
  merchant: MerchantConfig,
  products: Product[],
  toolCount: number,
): number {
  const checks = computeReadinessChecks(merchant, toolCount, products);
  return readinessScore(checks);
}

export function previewFixImpact(
  fixId: AutopilotFix,
  merchant: MerchantConfig,
  products: Product[],
  toolCount: number,
): { before: number; after: number } {
  const before = scoreAfterFix(merchant, products, toolCount);
  const applied = applyAutopilotFix(fixId, merchant, products);
  const after = scoreAfterFix(applied.merchant, applied.products, toolCount);
  return { before, after };
}
