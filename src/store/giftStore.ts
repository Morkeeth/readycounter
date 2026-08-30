import { create } from 'zustand';
import { PRODUCTS, RECIPIENTS } from '../data/catalog';
import type {
  BudgetStatus,
  CartItem,
  Product,
  RecipientId,
  StagedItem,
  StagingBoard,
  ToolActivity,
} from '../types/gift';

function productPrice(productId: string): number {
  return PRODUCTS.find((p) => p.id === productId)?.price ?? 0;
}

function sumForRecipient(
  items: { productId: string; recipientId: RecipientId }[],
  recipientId: RecipientId,
): number {
  return items
    .filter((item) => item.recipientId === recipientId)
    .reduce((sum, item) => sum + productPrice(item.productId), 0);
}

export interface GiftStore {
  staged: StagedItem[];
  cart: CartItem[];
  lastToolActivity: ToolActivity | null;
  searchProducts: (filters: {
    recipient?: RecipientId;
    max_price?: number;
    tags?: string[];
  }) => Product[];
  getProduct: (id: string) => Product | null;
  stageForRecipient: (
    productId: string,
    recipientId: RecipientId,
  ) => { ok: true; stagingId: string } | { ok: false; error: string };
  getStagingBoard: () => StagingBoard;
  approveStaged: (
    stagingId: string,
  ) => { ok: true; cartId: string } | { ok: false; error: string };
  rejectStaged: (
    stagingId: string,
  ) => { ok: true } | { ok: false; error: string };
  getBudgetStatus: (recipientId?: RecipientId) => BudgetStatus[];
  recordToolActivity: (activity: Omit<ToolActivity, 'timestamp'>) => void;
  clearToolActivity: () => void;
}

export const useGiftStore = create<GiftStore>((set, get) => ({
  staged: [],
  cart: [],
  lastToolActivity: null,

  searchProducts: ({ recipient, max_price, tags }) => {
    return PRODUCTS.filter((product) => {
      if (recipient && !product.suggestedRecipients.includes(recipient)) {
        return false;
      }
      if (max_price !== undefined && product.price > max_price) {
        return false;
      }
      if (tags && tags.length > 0) {
        const hasTag = tags.some((tag) =>
          product.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())),
        );
        if (!hasTag) return false;
      }
      return true;
    });
  },

  getProduct: (id) => PRODUCTS.find((p) => p.id === id) ?? null,

  stageForRecipient: (productId, recipientId) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return { ok: false as const, error: `Product not found: ${productId}` };
    }
    if (!RECIPIENTS.some((r) => r.id === recipientId)) {
      return { ok: false as const, error: `Unknown recipient: ${recipientId}` };
    }

    const stagingId = `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: StagedItem = {
      stagingId,
      productId,
      recipientId,
      status: 'pending',
      stagedAt: Date.now(),
    };

    set((state) => ({ staged: [...state.staged, item] }));
    return { ok: true as const, stagingId };
  },

  getStagingBoard: () => ({
    recipients: RECIPIENTS,
    staged: get().staged,
    cart: get().cart,
    products: PRODUCTS,
  }),

  approveStaged: (stagingId) => {
    const item = get().staged.find((s) => s.stagingId === stagingId);
    if (!item) {
      return { ok: false as const, error: `Staging item not found: ${stagingId}` };
    }

    const cartId = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cartItem: CartItem = {
      cartId,
      productId: item.productId,
      recipientId: item.recipientId,
      approvedAt: Date.now(),
      fromStagingId: stagingId,
    };

    set((state) => ({
      staged: state.staged.filter((s) => s.stagingId !== stagingId),
      cart: [...state.cart, cartItem],
    }));

    return { ok: true as const, cartId };
  },

  rejectStaged: (stagingId) => {
    const exists = get().staged.some((s) => s.stagingId === stagingId);
    if (!exists) {
      return { ok: false as const, error: `Staging item not found: ${stagingId}` };
    }
    set((state) => ({
      staged: state.staged.filter((s) => s.stagingId !== stagingId),
    }));
    return { ok: true as const };
  },

  getBudgetStatus: (recipientId) => {
    const ids = recipientId
      ? RECIPIENTS.filter((r) => r.id === recipientId)
      : RECIPIENTS;

    const { staged, cart } = get();

    return ids.map((recipient) => {
      const cartSpent = sumForRecipient(cart, recipient.id);
      const stagedPending = sumForRecipient(staged, recipient.id);
      return {
        recipientId: recipient.id,
        name: recipient.name,
        budget: recipient.budget,
        cartSpent,
        stagedPending,
        remaining: recipient.budget - cartSpent - stagedPending,
      };
    });
  },

  recordToolActivity: (activity) => {
    set({ lastToolActivity: { ...activity, timestamp: Date.now() } });
  },

  clearToolActivity: () => set({ lastToolActivity: null }),
}));

/** Imperative accessor for WebMCP execute handlers outside React. */
export function getGiftStoreState() {
  return useGiftStore.getState();
}
