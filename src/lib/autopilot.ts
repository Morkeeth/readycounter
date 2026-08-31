import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';
import { agentPayableMethods, computeReadinessChecks, readinessScore, weightFor } from './readiness';
import { STORED_CREDENTIAL_METHOD } from '../data/stores';

export type AutopilotFix =
  | 'disable_captcha'
  | 'disable_account_wall'
  | 'sync_feed_prices'
  | 'enable_agent_payment';

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
      impact: `Clears the feed-mismatch row (${weightFor('feed_price_match')}% of abandoned agent carts, Presenc AI 2026)`,
    });
  }
  if (agentPayableMethods(merchant).length === 0) {
    suggestions.push({
      id: 'enable_agent_payment',
      label: 'Accept a stored-credential method',
      impact: `Clears the unsupported-payment row (${weightFor('payment_method')}% of agent carts, Presenc AI 2026)`,
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
    case 'enable_agent_payment':
      return {
        merchant: {
          ...merchant,
          paymentMethods: [
            STORED_CREDENTIAL_METHOD,
            ...(merchant.paymentMethods ?? []).filter((m) => !m.agentCompletable),
          ],
        },
        products,
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
