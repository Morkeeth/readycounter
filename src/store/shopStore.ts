import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_STORE_ID, getStore, storeIdFromLocation } from '../data/stores';
import { applySharePayload, clearShareParam, decodeSharePayload, hydrateShareAtBoot } from '../lib/shareSession';
import type { AutopilotFix } from '../lib/autopilot';
import { applyAutopilotFix, previewFixImpact } from '../lib/autopilot';
import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';
import type {
  FunnelEvent,
  FunnelStep,
  MerchantConfig,
  OrderLine,
  OrderState,
  Product,
  ToolActivity,
} from '../types/commerce';

function lineTotal(line: OrderLine, products: Product[]): number {
  const product = products.find((p) => p.id === line.productId);
  return (product?.price ?? 0) * line.quantity;
}

function catalogProducts(
  storeId: string,
  feedPricePatches: Record<string, number>,
): Product[] {
  return getStore(storeId).products.map((product) =>
    feedPricePatches[product.id] !== undefined
      ? { ...product, feedPrice: feedPricePatches[product.id] }
      : product,
  );
}

function productsFor(storeId: string, feedPricePatches: Record<string, number>): Product[] {
  return catalogProducts(storeId, feedPricePatches);
}

export interface ShopStore {
  storeId: string;
  merchant: MerchantConfig;
  order: OrderState;
  funnel: FunnelEvent[];
  lastToolActivity: ToolActivity | null;
  feedPricePatches: Record<string, number>;

  switchStore: (storeId: string) => void;
  getCatalogProducts: () => Product[];
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
  applyReadinessFix: (fixId: AutopilotFix) => {
    ok: true;
    fixId: AutopilotFix;
    scoreBefore: number;
    scoreAfter: number;
  };
  recordFunnel: (step: FunnelStep, actor: 'human' | 'agent', detail?: string) => void;
  recordToolActivity: (activity: Omit<ToolActivity, 'timestamp'>) => void;
  clearToolActivity: () => void;
}

const bootShare = typeof window !== 'undefined' ? hydrateShareAtBoot() : null;
const initialStoreId =
  bootShare?.storeId ??
  (typeof window !== 'undefined' ? (storeIdFromLocation() ?? DEFAULT_STORE_ID) : DEFAULT_STORE_ID);
const initialStore = getStore(initialStoreId);

const storeLogic = (
  set: (fn: (state: ShopStore) => Partial<ShopStore>) => void,
  get: () => ShopStore,
): ShopStore => ({
  storeId: initialStoreId,
  merchant: bootShare ? { ...bootShare.merchant } : { ...initialStore.merchant },
  order: bootShare?.order ?? { lines: [], currency: 'USD' },
  funnel: bootShare?.funnel ?? [],
  lastToolActivity: null,
  feedPricePatches: {},

  getCatalogProducts: () => catalogProducts(get().storeId, get().feedPricePatches),

  switchStore: (storeId) => {
    const def = getStore(storeId);
    set(() => ({
      storeId: def.id,
      merchant: { ...def.merchant },
      order: { lines: [], currency: 'USD' },
      funnel: [],
      lastToolActivity: null,
      feedPricePatches: {},
    }));
    const url = new URL(window.location.href);
    url.searchParams.set('store', def.id);
    url.searchParams.delete('co');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  },

  searchCatalog: ({ query, category, max_price, in_stock_only }) => {
    const products = productsFor(get().storeId, get().feedPricePatches);
    return products.filter((product) => {
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

  getProduct: (id) =>
    productsFor(get().storeId, get().feedPricePatches).find((p) => p.id === id) ?? null,

  addToOrder: (productId, quantity, actor) => {
    const products = productsFor(get().storeId, get().feedPricePatches);
    const product = products.find((p) => p.id === productId);
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
    const { order, storeId, feedPricePatches } = get();
    const products = productsFor(storeId, feedPricePatches);
    const subtotal = order.lines.reduce((sum, line) => sum + lineTotal(line, products), 0);
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

  applyReadinessFix: (fixId) => {
    const state = get();
    const products = catalogProducts(state.storeId, state.feedPricePatches);
    const impact = previewFixImpact(
      fixId,
      state.merchant,
      products,
      WEBMCP_TOOL_COUNT,
    );

    if (fixId === 'disable_captcha') {
      set((s) => ({
        merchant: { ...s.merchant, checkoutRequiresCaptcha: false },
      }));
    } else if (fixId === 'disable_account_wall') {
      set((s) => ({
        merchant: { ...s.merchant, checkoutRequiresAccount: false },
      }));
    } else if (fixId === 'sync_feed_prices') {
      const patches = { ...state.feedPricePatches };
      for (const product of products) {
        if (product.feedPrice !== undefined && product.feedPrice !== product.price) {
          patches[product.id] = product.price;
        }
      }
      set(() => ({ feedPricePatches: patches }));
    }

    const afterState = get();
    const afterProducts = catalogProducts(afterState.storeId, afterState.feedPricePatches);
    const applied = applyAutopilotFix(fixId, afterState.merchant, afterProducts);
    const scoreAfter = readinessScore(
      computeReadinessChecks(applied.merchant, WEBMCP_TOOL_COUNT, afterProducts),
    );

    return {
      ok: true as const,
      fixId,
      scoreBefore: impact.before,
      scoreAfter,
    };
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
    set(() => ({ lastToolActivity: { ...activity, timestamp: Date.now() } }));
  },

  clearToolActivity: () => set(() => ({ lastToolActivity: null })),
});

export const useShopStore = create<ShopStore>()(
  persist(storeLogic, {
    name: 'readycounter-v2',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      storeId: state.storeId,
      merchant: state.merchant,
      order: state.order,
      funnel: state.funnel,
      feedPricePatches: state.feedPricePatches,
    }),
    onRehydrateStorage: () => (state) => {
      const co =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('co')
          : null;
      if (!co || !state) return;
      const shared = decodeSharePayload(co);
      if (!shared) return;
      applySharePayload(shared);
      state.storeId = shared.storeId;
      state.merchant = shared.merchant;
      state.order = shared.order;
      state.funnel = shared.funnel;
      state.feedPricePatches = {};
      clearShareParam();
    },
  }),
);

export function getShopStoreState() {
  return useShopStore.getState();
}
