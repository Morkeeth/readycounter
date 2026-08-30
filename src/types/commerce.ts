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
}
