import type { OrderLine, Product } from '../types/commerce';

/**
 * The order arithmetic, in one place, used by BOTH the checkout path and the
 * readiness probe that grades it.
 *
 * That sharing is the point. The 26-point line asks "does what the agent was
 * shown survive to checkout?", and a probe that answered it with its own copy
 * of the maths would grade a checkout nobody ships — the same shape as the
 * clamp bug this repo fixed on 2026-08-31, where a weight was copied out of the
 * table into the call sites and drifted. `shopStore.getOrder` and
 * `probeCheckoutSurvival` call the functions below, not their own arithmetic.
 */

/** What checkout bills for one line. */
export function chargeForLine(line: Pick<OrderLine, 'productId' | 'quantity'>, products: Product[]): number {
  const product = products.find((p) => p.id === line.productId);
  return (product?.price ?? 0) * line.quantity;
}

/** What checkout bills for a whole order. */
export function orderSubtotal(
  lines: Pick<OrderLine, 'productId' | 'quantity'>[],
  products: Product[],
): number {
  return lines.reduce((sum, line) => sum + chargeForLine(line, products), 0);
}

/**
 * Why the store refuses to put this product in an agent's order, or null if it
 * accepts it. `addToOrder` calls this; so does the readiness probe.
 */
export function addRefusal(product: Product | undefined, quantity: number, productId: string): string | null {
  if (!product)
    return productId
      ? `Product not found: ${productId}`
      : 'Missing product id — pass product_id (or id / sku) from search_catalog.';
  if (!product.inStock) return `Out of stock: ${productId}`;
  if (quantity < 1 || quantity > 99) return 'Quantity must be 1–99';
  return null;
}

export interface SkuProbe {
  productId: string;
  /** The price the catalog record handed the agent. */
  shown: number;
  /** What the order path bills for one unit of it. */
  charged: number;
  /** The store's refusal, if it will not accept the SKU at all. */
  refusal: string | null;
  survives: boolean;
}

/**
 * Run every SKU the catalog surfaces through the real order path and report
 * which ones survive it: the store still accepts them, and the price it bills
 * is the price the agent was shown.
 *
 * The source's only prose about this row is one FAQ line, quoted verbatim:
 * "When the price or availability the agent saw differs from checkout, the
 * agent halts rather than guessing." Both halves are asserted here.
 *
 * HONEST LIMIT, and it is printed on the tape line, not hidden here: in the two
 * shipped fixtures the PRICE half cannot fail, because `getProduct` and the
 * order path read `price` off the same catalog record. The half that
 * discriminates today is availability — a SKU the search surfaces that the
 * order path then refuses. The price assertion is not decoration: it goes red
 * the moment checkout bills anything but the shown price (proved by tampering
 * `chargeForLine` to bill `feedPrice`, `node scripts/verify-stores.mjs` exit 1),
 * and it is the assertion an imported real catalog is most likely to break.
 */
export function probeCheckoutSurvival(products: Product[]): SkuProbe[] {
  return products.map((product) => {
    const shown = product.price;
    const charged = chargeForLine({ productId: product.id, quantity: 1 }, products);
    const refusal = addRefusal(product, 1, product.id);
    return {
      productId: product.id,
      shown,
      charged,
      refusal,
      survives: refusal === null && charged === shown,
    };
  });
}
