import type { MerchantConfig, PaymentMethod, Product } from '../types/commerce';

/** Distinct demo profiles — each exercises a different Presenc row. */
export type SandboxProfile =
  | 'captcha-wall'
  | 'account-wall'
  | 'feed-drift'
  | 'stale-shelf'
  | 'multi-wall'
  | 'golden-path';

const AGENT_OK: PaymentMethod[] = [
  { id: 'card_on_file', label: 'Card on file', agentCompletable: true },
];

const CHAOS_PETS: Product[] = [
  { id: 'cp-kibble', name: 'Chaos Kibble 15lb', description: 'Chicken & chaos. Vet approved-ish.', price: 48, currency: 'USD', tags: ['dog'], category: 'food', inStock: true, feedPrice: 52 },
  { id: 'cp-squeak', name: 'Squeaky Void Duck', description: 'Unreasonably loud. Agents hate it.', price: 14, currency: 'USD', tags: ['toy'], category: 'toys', inStock: true },
  { id: 'cp-bed', name: 'Memory Foam Dog Bed', description: 'XL. Removable cover.', price: 89, currency: 'USD', tags: ['bed'], category: 'beds', inStock: true, gtin: '00819999001001' },
  { id: 'cp-treat', name: 'Salmon Bites', description: 'Single ingredient. 8oz.', price: 12, currency: 'USD', tags: ['treat'], category: 'treats', inStock: true, feedPrice: 12 },
  { id: 'cp-cat', name: 'Cat Chaos Wand', description: 'Feather attachment. 3-pack.', price: 9, currency: 'USD', tags: ['cat'], category: 'toys', inStock: true },
  { id: 'cp-bandana', name: 'Agent-Proof Bandana', description: 'S/M. Machine wash.', price: 16, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true },
  { id: 'cp-sub', name: 'Monthly Treat Box', description: 'Surprise toys. Cancel anytime.', price: 29, currency: 'USD', tags: ['subscription'], category: 'subscription', inStock: true },
  { id: 'cp-oos', name: 'Limited Edition Collar', description: 'Sold out. Restock unknown.', price: 22, currency: 'USD', tags: ['collar'], category: 'merch', inStock: false },
];

const VINYL_PRODUCTS: Product[] = [
  { id: 'mv-1979', name: 'Midnight on Vinyl — 1979 Press', description: '180g remaster. Gatefold.', price: 34, currency: 'USD', tags: ['vinyl'], category: 'records', inStock: true, gtin: '00818888001001', feedPrice: 29 },
  { id: 'mv-live', name: 'Live at the Cellar', description: '2LP. Record Store Day.', price: 42, currency: 'USD', tags: ['vinyl'], category: 'records', inStock: true, gtin: '00818888001018', feedPrice: 38 },
  { id: 'mv-tee', name: 'Tour Tee — Fade Black', description: 'Unisex. Soft cotton.', price: 28, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true, gtin: '00818888001025', feedPrice: 24 },
  { id: 'mv-poster', name: 'Glow-in-Dark Poster', description: '24×36. Ships rolled.', price: 18, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true, gtin: '00818888001032', feedPrice: 15 },
  { id: 'mv-cassette', name: 'Demo Tape (Cassette)', description: 'Limited 100. Orange shell.', price: 12, currency: 'USD', tags: ['tape'], category: 'records', inStock: true, gtin: '00818888001049', feedPrice: 12 },
  { id: 'mv-bundle', name: 'LP + Tee Bundle', description: 'Save on the combo.', price: 55, currency: 'USD', tags: ['bundle'], category: 'bundles', inStock: true, gtin: '00818888001056', feedPrice: 49 },
  { id: 'mv-slipmat', name: 'Custom Slipmat', description: 'Felt. Anti-static.', price: 22, currency: 'USD', tags: ['equipment'], category: 'equipment', inStock: true, gtin: '00818888001063', feedPrice: 22 },
  { id: 'mv-sub', name: 'Record of the Month', description: 'Curated reissues.', price: 32, currency: 'USD', tags: ['subscription'], category: 'subscription', inStock: true, gtin: '00818888001070', feedPrice: 32 },
];

const PARADISE_PRODUCTS: Product[] = [
  { id: 'ap-beans', name: 'Agent-Friendly Espresso', description: 'GTIN on every bag. Guest checkout.', price: 19, currency: 'USD', tags: ['coffee'], category: 'beans', inStock: true, gtin: '00817777001001', feedPrice: 19 },
  { id: 'ap-kit', name: 'Starter Brew Kit', description: 'Everything an agent needs to quote.', price: 45, currency: 'USD', tags: ['kit'], category: 'kits', inStock: true, gtin: '00817777001018', feedPrice: 45 },
  { id: 'ap-mug', name: 'Paradise Mug', description: '12oz. Dishwasher safe.', price: 16, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true, gtin: '00817777001025', feedPrice: 16 },
  { id: 'ap-sub', name: 'Monthly Agent Box', description: 'Structured feed sync.', price: 28, currency: 'USD', tags: ['subscription'], category: 'subscription', inStock: true, gtin: '00817777001032', feedPrice: 28 },
  { id: 'ap-grinder', name: 'Quiet Burr Grinder', description: 'Agent-readable specs.', price: 79, currency: 'USD', tags: ['equipment'], category: 'equipment', inStock: true, gtin: '00817777001049', feedPrice: 79 },
  { id: 'ap-cold', name: 'Cold Brew RTD', description: 'Shelf-stable 14 days.', price: 6, currency: 'USD', tags: ['rtd'], category: 'beverages', inStock: true, gtin: '00817777001056', feedPrice: 6 },
  { id: 'ap-decaf', name: 'Swiss Water Decaf', description: 'Full barcode coverage.', price: 20, currency: 'USD', tags: ['decaf'], category: 'beans', inStock: true, gtin: '00817777001063', feedPrice: 20 },
  { id: 'ap-gift', name: 'Gift Card', description: 'Digital delivery.', price: 50, currency: 'USD', tags: ['gift'], category: 'gift', inStock: true, gtin: '00817777001070', feedPrice: 50 },
];

const GHOST_PRODUCTS: Product[] = [
  { id: 'gg-lamp', name: 'Haunted Desk Lamp', description: 'Dims when agents approach.', price: 44, currency: 'USD', tags: ['home'], category: 'home', inStock: false, gtin: '00816666001001', feedPrice: 44 },
  { id: 'gg-candle', name: 'Spectral Candle', description: 'Smells like checkout errors.', price: 18, currency: 'USD', tags: ['home'], category: 'home', inStock: false, gtin: '00816666001018', feedPrice: 18 },
  { id: 'gg-mirror', name: 'Mirror (Sold Out)', description: 'Reflects your cart abandon rate.', price: 120, currency: 'USD', tags: ['home'], category: 'home', inStock: false, gtin: '00816666001025', feedPrice: 120 },
  { id: 'gg-pillow', name: 'Ghost Pillow', description: 'Soft. In stock.', price: 32, currency: 'USD', tags: ['home'], category: 'home', inStock: true, gtin: '00816666001032', feedPrice: 32 },
  { id: 'gg-blanket', name: 'Weighted Blanket', description: 'Heavy like stale feeds.', price: 89, currency: 'USD', tags: ['home'], category: 'home', inStock: true, gtin: '00816666001049', feedPrice: 89 },
  { id: 'gg-mug', name: '404 Mug', description: 'Not found (in warehouse).', price: 14, currency: 'USD', tags: ['merch'], category: 'merch', inStock: false, gtin: '00816666001056', feedPrice: 14 },
  { id: 'gg-poster', name: 'Abandonment Poster', description: '78.6% edition.', price: 22, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true, gtin: '00816666001063', feedPrice: 22 },
  { id: 'gg-sticker', name: 'Sticker Pack', description: 'Five ghosts. In stock.', price: 8, currency: 'USD', tags: ['merch'], category: 'merch', inStock: true, gtin: '00816666001070', feedPrice: 8 },
];

function def(
  id: string,
  name: string,
  tagline: string,
  products: Product[],
  merchant: MerchantConfig,
  categories: string[],
  sandboxProfile: SandboxProfile,
) {
  return { id, name, tagline, products, merchant, categories, sandboxProfile };
}

export const SANDBOX_STORES = {
  'chaos-pets': def(
    'chaos-pets',
    'Chaos Pets Supply',
    'Everything an agent could want · none of it reachable',
    CHAOS_PETS,
    {
      storeName: 'Chaos Pets Supply',
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: true,
      paymentMethods: [],
    },
    ['food', 'toys', 'treats', 'beds', 'merch', 'subscription'],
    'multi-wall',
  ),
  'midnight-vinyl': def(
    'midnight-vinyl',
    'Midnight Vinyl Club',
    'Feed says $29 · shelf says $34 · agents bail',
    VINYL_PRODUCTS,
    {
      storeName: 'Midnight Vinyl Club',
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK,
    },
    ['records', 'merch', 'bundles', 'equipment', 'subscription'],
    'feed-drift',
  ),
  'agent-paradise': def(
    'agent-paradise',
    'Agent Paradise Co.',
    'The control group — every line green',
    PARADISE_PRODUCTS,
    {
      storeName: 'Agent Paradise Co.',
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK,
    },
    ['beans', 'kits', 'merch', 'subscription', 'equipment', 'beverages', 'gift'],
    'golden-path',
  ),
  'ghost-goods': def(
    'ghost-goods',
    'Ghost Goods',
    'Catalog full · shelf empty · stale at checkout',
    GHOST_PRODUCTS,
    {
      storeName: 'Ghost Goods',
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK,
    },
    ['home', 'merch'],
    'stale-shelf',
  ),
};

export const SANDBOX_PROFILES: Record<SandboxProfile, { emoji: string; hook: string; presencRow: string }> = {
  'captcha-wall': { emoji: '🧱', hook: 'CAPTCHA on checkout', presencRow: '24% verification wall' },
  'account-wall': { emoji: '🔐', hook: 'Forced account login', presencRow: '15% account wall' },
  'feed-drift': { emoji: '📡', hook: 'Feed ≠ shelf price', presencRow: '18% price mismatch' },
  'stale-shelf': { emoji: '👻', hook: 'Out of stock at checkout', presencRow: '26% stale data' },
  'multi-wall': { emoji: '💥', hook: 'CAPTCHA + account + no payment', presencRow: 'compound failure' },
  'golden-path': { emoji: '✨', hook: 'Every line passes', presencRow: 'what good looks like' },
};
