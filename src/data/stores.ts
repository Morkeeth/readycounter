import type { MerchantConfig, PaymentMethod, Product } from '../types/commerce';
import type { StoreAuditMeta } from '../types/audit';
import type { SandboxProfile } from './sandbox-stores';
import { SANDBOX_STORES } from './sandbox-stores';

export interface StoreDefinition {
  id: string;
  name: string;
  tagline: string;
  products: Product[];
  merchant: MerchantConfig;
  categories: string[];
  audit?: StoreAuditMeta;
  sandboxProfile?: SandboxProfile;
}

const EMBER_OAK_PRODUCTS: Product[] = [
  {
    id: 'sku-espresso',
    name: 'House Espresso Blend',
    description: '12oz bag. Notes of dark chocolate and orange zest. Whole bean.',
    price: 18,
    currency: 'USD',
    tags: ['coffee', 'espresso', 'whole-bean'],
    category: 'beans',
    inStock: true,
    gtin: '00812345001001',
    feedPrice: 18,
  },
  {
    id: 'sku-pour-over',
    name: 'Single-Origin Pour Over Kit',
    description: 'Ceramic dripper, filters (100), and 8oz sample of Ethiopian Yirgacheffe.',
    price: 42,
    currency: 'USD',
    tags: ['coffee', 'gift', 'brewing'],
    category: 'kits',
    inStock: true,
    gtin: '00812345001018',
    feedPrice: 42,
  },
  {
    id: 'sku-grinder',
    name: 'Burr Grinder Mini',
    description: '38mm conical burrs. 15 grind settings. USB-C rechargeable.',
    price: 89,
    currency: 'USD',
    tags: ['equipment', 'grinder'],
    category: 'equipment',
    inStock: true,
    gtin: '00812345001025',
    feedPrice: 89,
  },
  {
    id: 'sku-cold-brew',
    name: 'Cold Brew Concentrate',
    description: '32oz bottle. 1:4 dilution. Shelf-stable 14 days refrigerated.',
    price: 14,
    currency: 'USD',
    tags: ['coffee', 'cold-brew', 'ready-to-drink'],
    category: 'beverages',
    inStock: true,
    gtin: '00812345001032',
    feedPrice: 14,
  },
  {
    id: 'sku-mug',
    name: 'Stoneware Diner Mug',
    description: '10oz. Dishwasher safe. Ember & Oak logo.',
    price: 22,
    currency: 'USD',
    tags: ['merch', 'gift'],
    category: 'merch',
    inStock: true,
    gtin: '00812345001049',
    feedPrice: 22,
  },
  {
    id: 'sku-subscription',
    name: 'Monthly Bean Club',
    description: 'Rotating single-origin. Ships first Monday. Cancel anytime.',
    price: 24,
    currency: 'USD',
    tags: ['subscription', 'coffee'],
    category: 'subscription',
    inStock: true,
    feedPrice: 24,
  },
  {
    id: 'sku-decaf',
    name: 'Swiss Water Decaf',
    description: '12oz bag. Colombia sugar-cane process. Whole bean.',
    price: 19,
    currency: 'USD',
    tags: ['coffee', 'decaf'],
    category: 'beans',
    inStock: false,
    gtin: '00812345001056',
    feedPrice: 19,
  },
  {
    id: 'sku-scale',
    name: 'Brew Scale',
    description: '0.1g precision. Auto-timer for pour-over.',
    price: 35,
    currency: 'USD',
    tags: ['equipment'],
    category: 'equipment',
    inStock: true,
    gtin: '00812345001063',
    feedPrice: 29,
  },
];

const NEON_MATCHA_PRODUCTS: Product[] = [
  {
    id: 'nm-ceremonial',
    name: 'Ceremonial Grade Matcha',
    description: '30g tin. Uji, Kyoto. Stone-ground. First harvest.',
    price: 38,
    currency: 'USD',
    tags: ['matcha', 'ceremonial'],
    category: 'powder',
    inStock: true,
    gtin: '00812346001001',
    feedPrice: 38,
  },
  {
    id: 'nm-latte',
    name: 'Barista Latte Blend',
    description: '100g pouch. Optimized for oat milk lattes.',
    price: 26,
    currency: 'USD',
    tags: ['matcha', 'latte'],
    category: 'powder',
    inStock: true,
    feedPrice: 26,
  },
  {
    id: 'nm-whisk',
    name: 'Bamboo Chasen Whisk',
    description: '80-prong traditional whisk. Hand-cut.',
    price: 24,
    currency: 'USD',
    tags: ['equipment', 'ceremony'],
    category: 'equipment',
    inStock: true,
    feedPrice: 24,
  },
  {
    id: 'nm-bowl',
    name: 'Chawan Tea Bowl',
    description: '400ml ceramic. Matte glaze. Dishwasher safe.',
    price: 45,
    currency: 'USD',
    tags: ['equipment', 'ceremony'],
    category: 'equipment',
    inStock: true,
    feedPrice: 45,
  },
  {
    id: 'nm-rtd',
    name: 'Ready-to-Drink Matcha',
    description: '12oz can. Unsweetened. Shelf-stable.',
    price: 5,
    currency: 'USD',
    tags: ['rtd', 'ready-to-drink'],
    category: 'beverages',
    inStock: true,
    feedPrice: 5,
  },
  {
    id: 'nm-sub',
    name: 'Matcha Monthly',
    description: 'Rotating regional matcha. Pause anytime.',
    price: 32,
    currency: 'USD',
    tags: ['subscription'],
    category: 'subscription',
    inStock: true,
    feedPrice: 32,
  },
  {
    id: 'nm-soldout',
    name: 'Limited Hojicha Powder',
    description: 'Seasonal roast. 50g.',
    price: 28,
    currency: 'USD',
    tags: ['hojicha'],
    category: 'powder',
    inStock: false,
    gtin: '00812346001018',
    feedPrice: 28,
  },
  {
    id: 'nm-set',
    name: 'Starter Ceremony Set',
    description: 'Whisk, bowl, scoop, and 20g ceremonial sample.',
    price: 72,
    currency: 'USD',
    tags: ['kit', 'gift'],
    category: 'kits',
    inStock: true,
    feedPrice: 65,
  },
];

/*
 * PAYMENT METHODS ON THE DEMO STORES.
 *
 * The rule these fixtures are written under, and it is the same rule the
 * CAPTCHA flag is written under: each fixture is chosen to EXERCISE a check —
 * one store passes the line, one fails it — never to land a target score. The
 * score is whatever falls out, and on 2026-08-31 it fell out at 70 and 65.
 *
 * `agentCompletable` is our classification, not a published fact. Presenc AI
 * prices "unsupported payment method" at 11% and never says which methods an
 * agent can complete, so the test is stated on the line: can a prepared agent
 * order go through with no step only a human at the device can take?
 */
const EMBER_OAK_PAYMENT: PaymentMethod[] = [
  {
    id: 'card_on_file',
    label: 'Card on file',
    agentCompletable: true,
  },
  {
    id: 'apple_pay',
    label: 'Apple Pay',
    agentCompletable: false,
    humanStep: 'device biometric on the handset',
  },
  {
    id: 'invoice_net30',
    label: 'Invoice, net 30',
    agentCompletable: false,
    humanStep: 'manual approval by the wholesale desk',
  },
];

const NEON_MATCHA_PAYMENT: PaymentMethod[] = [
  {
    id: 'card_3ds',
    label: 'Card with 3-D Secure',
    agentCompletable: false,
    humanStep: '3-D Secure step-up on every transaction',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    agentCompletable: false,
    humanStep: 'redirect to a PayPal login',
  },
  {
    id: 'bank_transfer',
    label: 'Bank transfer',
    agentCompletable: false,
    humanStep: 'the shopper moves the money by hand',
  },
];

/** The method autopilot adds when a store has no agent-payable route. */
export const STORED_CREDENTIAL_METHOD: PaymentMethod = {
  id: 'card_on_file',
  label: 'Card on file',
  agentCompletable: true,
};

export const STORES: Record<string, StoreDefinition> = {
  'ember-oak': {
    id: 'ember-oak',
    name: 'Ember & Oak Coffee',
    tagline: 'Small-batch coffee · shipped fresh weekly',
    products: EMBER_OAK_PRODUCTS,
    merchant: {
      storeName: 'Ember & Oak Coffee',
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: false,
      paymentMethods: EMBER_OAK_PAYMENT,
    },
    categories: ['beans', 'kits', 'equipment', 'beverages', 'merch', 'subscription'],
    sandboxProfile: 'captcha-wall',
  },
  'neon-matcha': {
    id: 'neon-matcha',
    name: 'Neon Matcha Lab',
    tagline: 'Ceremonial matcha from Uji · barista blends',
    products: NEON_MATCHA_PRODUCTS,
    merchant: {
      storeName: 'Neon Matcha Lab',
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: true,
      paymentMethods: NEON_MATCHA_PAYMENT,
    },
    categories: ['powder', 'kits', 'equipment', 'beverages', 'subscription'],
    sandboxProfile: 'account-wall',
  },
  ...SANDBOX_STORES,
};

export const DEFAULT_STORE_ID = 'ember-oak';
export const STORE_IDS = Object.keys(STORES);

const CUSTOM_STORAGE_KEY = 'readycounter-custom-stores';

function loadCustomStores(): Record<string, StoreDefinition> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoreDefinition>) : {};
  } catch {
    return {};
  }
}

let customStores: Record<string, StoreDefinition> = loadCustomStores();

function persistCustomStores(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customStores));
}

export function registerCustomStore(def: StoreDefinition): void {
  customStores[def.id] = def;
  persistCustomStores();
}

export function listStoreIds(): string[] {
  return [...STORE_IDS, ...Object.keys(customStores)];
}

export function getStore(id?: string | null): StoreDefinition {
  const key = id ?? DEFAULT_STORE_ID;
  if (STORES[key]) return STORES[key];
  if (customStores[key]) return customStores[key];
  return STORES[DEFAULT_STORE_ID];
}

export function storeIdFromLocation(): string | null {
  const id = new URLSearchParams(window.location.search).get('store');
  if (!id) return null;
  return STORES[id] || customStores[id] ? id : null;
}

export function isBuiltinStore(id: string): boolean {
  return id in STORES;
}

/** Legacy exports for scripts importing catalog.ts */
export const PRODUCTS = EMBER_OAK_PRODUCTS;
export const MERCHANT_DEFAULTS = STORES[DEFAULT_STORE_ID].merchant;
