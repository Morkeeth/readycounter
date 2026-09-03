export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD';
  tags: string[];
  category: string;
  inStock: boolean;
  gtin?: string;
  /**
   * The storefront's own product handle, e.g. "hair-clips-gwp".
   *
   * Not cosmetic: Shopify's CSV import matches rows by Handle, so a fix file
   * without it cannot be re-imported. We were storing the SKU as `id`
   * ("Accessory-HairClipsGWP") and never capturing the handle at all.
   */
  handle?: string;
  /** Simulated feed price — mismatch triggers readiness warning */
  feedPrice?: number;
}

export interface OrderLine {
  lineId: string;
  productId: string;
  quantity: number;
  addedBy: 'human' | 'agent';
  updatedAt: number;
}

export interface OrderState {
  lines: OrderLine[];
  currency: 'USD';
}

export type FunnelStep =
  | 'catalog_search'
  | 'product_view'
  | 'add_to_order'
  | 'checkout_prepare'
  | 'checkout_blocked';

export interface FunnelEvent {
  step: FunnelStep;
  actor: 'human' | 'agent';
  timestamp: number;
  detail?: string;
}

export interface ToolActivity {
  toolName: string;
  productId?: string;
  timestamp: number;
}

/**
 * One way a shopper can pay at this store.
 *
 * `agentCompletable` is the only field the score reads, and it is a
 * CLASSIFICATION, not a published fact: Presenc AI prices "unsupported payment
 * method" at 11% of abandoned agent carts but never says which methods an agent
 * can complete. So the weight is theirs and the test is ours, and both halves
 * are printed on the line.
 *
 * The test: can a prepared agent order complete on this method with no step
 * only a human sitting at the device can take? A stored credential can. A
 * per-transaction 3-D Secure step-up, a device biometric, a redirect to another
 * site's login, or a manual invoice approval cannot.
 */
export interface PaymentMethod {
  id: string;
  label: string;
  agentCompletable: boolean;
  /** The step only a human can take. Present exactly when agentCompletable is false. */
  humanStep?: string;
}

export interface MerchantConfig {
  storeName: string;
  checkoutRequiresCaptcha: boolean;
  checkoutRequiresAccount: boolean;
  /**
   * Methods this store accepts. Optional on the type because a share link or a
   * persisted session written before 2026-08-31 does not carry it; every reader
   * must treat `undefined` as "the store declared none".
   */
  paymentMethods?: PaymentMethod[];
}

export type ReadinessStatus = 'pass' | 'warn' | 'fail';

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  stat?: string;
  /** Points this store earned on this line, out of `maxPoints`. */
  points?: number;
  /** Points this line is worth in the 100-point budget. */
  maxPoints?: number;
  /**
   * `measured` = the weight IS a figure a named source published. Since
   * 2026-08-31 every CHARGED line is measured: the six weights are the six rows
   * of Presenc AI's causes table at their published shares.
   * `reported` = ReadyCounter checks it and prints it but charges nothing for
   * it, because no published row prices it. A reported line has maxPoints 0 and
   * never moves the score.
   */
  basis?: 'measured' | 'reported';
  /** Rows in `src/data/sources.ts` that back this line. */
  sourceIds?: string[];
  /** Why the line is worth this many points. */
  rationale?: string;
  /** The one change that moves this line. */
  fix?: string;
}
