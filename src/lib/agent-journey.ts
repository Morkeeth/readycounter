import type { ShopStore } from '../store/shopStore';
import { computeReadinessChecks, readinessScore } from './readiness';

export interface JourneyStep {
  tool: string;
  ok: boolean;
  detail: unknown;
}

export function simulateAgentJourney(
  store: Pick<
    ShopStore,
    | 'storeId'
    | 'merchant'
    | 'searchCatalog'
    | 'getProduct'
    | 'addToOrder'
    | 'getOrder'
    | 'prepareCheckout'
    | 'getCatalogProducts'
  >,
  toolCount: number,
): {
  storeId: string;
  steps: JourneyStep[];
  readinessScore: number;
  checkoutBlocked: boolean;
  recommendation: string;
} {
  const products = store.getCatalogProducts();
  const steps: JourneyStep[] = [];

  const search = store.searchCatalog({ in_stock_only: true });
  steps.push({ tool: 'search_catalog', ok: search.length > 0, detail: { count: search.length } });

  const first = search[0];
  if (!first) {
    return {
      storeId: store.storeId,
      steps,
      readinessScore: readinessScore(
        computeReadinessChecks(store.merchant, toolCount, products),
      ),
      checkoutBlocked: true,
      recommendation: 'Catalog empty — agents cannot discover products.',
    };
  }

  const product = store.getProduct(first.id);
  steps.push({
    tool: 'get_product',
    ok: !!product,
    detail: { id: first.id },
  });

  const add = store.addToOrder(first.id, 1, 'agent');
  steps.push({ tool: 'add_to_order', ok: add.ok, detail: add });

  const order = store.getOrder();
  steps.push({
    tool: 'get_order',
    ok: order.lineCount > 0,
    detail: { lineCount: order.lineCount, subtotal: order.subtotal },
  });

  const checkout = store.prepareCheckout('agent');
  steps.push({ tool: 'prepare_checkout', ok: checkout.ok, detail: checkout });

  const score = readinessScore(
    computeReadinessChecks(store.merchant, toolCount, products),
  );

  let recommendation = 'Agent path clear — human confirms payment in tab.';
  if (checkout.blocked) {
    recommendation =
      checkout.reason ??
      'Checkout blocked — run readiness autopilot or toggle merchant flags.';
  } else if (score < 70) {
    recommendation = 'Checkout may succeed but catalog/readiness still below 70 — fix feed/schema.';
  }

  return {
    storeId: store.storeId,
    steps,
    readinessScore: score,
    checkoutBlocked: !!checkout.blocked,
    recommendation,
  };
}
