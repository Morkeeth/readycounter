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

export interface MerchantConfig {
  storeName: string;
  checkoutRequiresCaptcha: boolean;
  checkoutRequiresAccount: boolean;
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
   * `measured` = the weight IS a figure a named source published.
   * `allocated` = no source itemises this; the weight is ReadyCounter's call.
   */
  basis?: 'measured' | 'allocated';
  /** Rows in `src/data/sources.ts` that back this line. */
  sourceIds?: string[];
  /** Why the line is worth this many points. */
  rationale?: string;
  /** The one change that moves this line. */
  fix?: string;
}
