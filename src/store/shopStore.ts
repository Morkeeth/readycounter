import { create } from 'zustand';
import { MERCHANT_DEFAULTS, PRODUCTS } from '../data/catalog';
import type {
  FunnelEvent,
  FunnelStep,
  MerchantConfig,
  OrderLine,
  OrderState,
  Product,
  ToolActivity,
} from '../types/commerce';

function lineTotal(line: OrderLine): number {
  const product = PRODUCTS.find((p) => p.id === line.productId);
  return (product?.price ?? 0) * line.quantity;
}

export interface ShopStore {
  merchant: MerchantConfig;
  order: OrderState;
  funnel: FunnelEvent[];
  lastToolActivity: ToolActivity | null;

  searchCatalog: (filters: {
    query?: string;
    category?: string;
    max_price?: number;
    in_stock_only?: boolean;
  }) => Product[];
  getProduct: (id: string) => Product | null;
  addToOrder: (
    productId: string,
    quantity: number,
    actor: 'human' | 'agent',
  ) => { ok: true; lineId: string } | { ok: false; error: string };
  updateLineQuantity: (
    lineId: string,
    quantity: number,
    actor: 'human' | 'agent',
  ) => { ok: true } | { ok: false; error: string };
  removeLine: (
    lineId: string,
    actor: 'human' | 'agent',
  ) => { ok: true } | { ok: false; error: string };
  getOrder: () => OrderState & { subtotal: number; lineCount: number };
  getDeliveryQuote: () => {
    method: string;
    price: number;
    etaDays: string;
    currency: 'USD';
  };
  prepareCheckout: (actor: 'human' | 'agent') => {
    ok: boolean;
    blocked?: boolean;
    reason?: string;
    subtotal?: number;
    lineCount?: number;
  };
  setMerchantFlag: (
    key: 'checkoutRequiresCaptcha' | 'checkoutRequiresAccount',
    value: boolean,
  ) => void;
  recordFunnel: (step: FunnelStep, actor: 'human' | 'agent', detail?: string) => void;
  recordToolActivity: (activity: Omit<ToolActivity, 'timestamp'>) => void;
  clearToolActivity: () => void;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  merchant: { ...MERCHANT_DEFAULTS },
  order: { lines: [], currency: 'USD' },
  funnel: [],
  lastToolActivity: null,

  searchCatalog: ({ query, category, max_price, in_stock_only }) => {
    return PRODUCTS.filter((product) => {
      if (category && product.category !== category) return false;
      if (max_price !== undefined && product.price > max_price) return false;
      if (in_stock_only && !product.inStock) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  },

  getProduct: (id) => PRODUCTS.find((p) => p.id === id) ?? null,

  addToOrder: (productId, quantity, actor) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return { ok: false as const, error: `Product not found: ${productId}` };
    }
    if (!product.inStock) {
      return { ok: false as const, error: `Out of stock: ${productId}` };
    }
    if (quantity < 1 || quantity > 99) {
      return { ok: false as const, error: 'Quantity must be 1–99' };
    }

    const existing = get().order.lines.find((l) => l.productId === productId);
    if (existing) {
      get().updateLineQuantity(existing.lineId, existing.quantity + quantity, actor);
      return { ok: true as const, lineId: existing.lineId };
    }

    const lineId = `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const line: OrderLine = {
      lineId,
      productId,
      quantity,
      addedBy: actor,
      updatedAt: Date.now(),
    };

    set((state) => ({
      order: { ...state.order, lines: [...state.order.lines, line] },
    }));
    get().recordFunnel('add_to_order', actor, productId);
    return { ok: true as const, lineId };
  },

  updateLineQuantity: (lineId, quantity, actor) => {
    if (quantity < 1) {
      return get().removeLine(lineId, actor);
    }
    const line = get().order.lines.find((l) => l.lineId === lineId);
    if (!line) {
      return { ok: false as const, error: `Line not found: ${lineId}` };
    }
    set((state) => ({
      order: {
        ...state.order,
        lines: state.order.lines.map((l) =>
          l.lineId === lineId
            ? { ...l, quantity, updatedAt: Date.now(), addedBy: actor }
            : l,
        ),
      },
    }));
    return { ok: true as const };
  },

  removeLine: (lineId, actor) => {
    const exists = get().order.lines.some((l) => l.lineId === lineId);
    if (!exists) {
      return { ok: false as const, error: `Line not found: ${lineId}` };
    }
    set((state) => ({
      order: {
        ...state.order,
        lines: state.order.lines.filter((l) => l.lineId !== lineId),
      },
    }));
    void actor;
    return { ok: true as const };
  },

  getOrder: () => {
    const { order } = get();
    const subtotal = order.lines.reduce((sum, line) => sum + lineTotal(line), 0);
    return {
      ...order,
      subtotal,
      lineCount: order.lines.length,
    };
  },

  getDeliveryQuote: () => ({
    method: 'standard',
    price: get().getOrder().subtotal >= 50 ? 0 : 6.5,
    etaDays: '3–5 business days',
    currency: 'USD' as const,
  }),

  prepareCheckout: (actor) => {
    const { merchant } = get();
    const order = get().getOrder();
    get().recordFunnel('checkout_prepare', actor);

    if (order.lineCount === 0) {
      return { ok: false, blocked: true, reason: 'Order is empty' };
    }
    if (merchant.checkoutRequiresCaptcha) {
      get().recordFunnel('checkout_blocked', actor, 'captcha');
      return {
        ok: false,
        blocked: true,
        reason:
          'Checkout blocked: CAPTCHA required. 24% of agent carts abandon here (Presenc AI 2026). Toggle off in Merchant → Readiness.',
      };
    }
    if (merchant.checkoutRequiresAccount) {
      get().recordFunnel('checkout_blocked', actor, 'account');
      return {
        ok: false,
        blocked: true,
        reason: 'Checkout blocked: account login required.',
      };
    }

    return {
      ok: true,
      subtotal: order.subtotal,
      lineCount: order.lineCount,
    };
  },

  setMerchantFlag: (key, value) => {
    set((state) => ({
      merchant: { ...state.merchant, [key]: value },
    }));
  },

  recordFunnel: (step, actor, detail) => {
    const event: FunnelEvent = {
      step,
      actor,
      timestamp: Date.now(),
      detail,
    };
    set((state) => ({ funnel: [...state.funnel, event] }));
  },

  recordToolActivity: (activity) => {
    set({ lastToolActivity: { ...activity, timestamp: Date.now() } });
  },

  clearToolActivity: () => set({ lastToolActivity: null }),
}));

export function getShopStoreState() {
  return useShopStore.getState();
}
