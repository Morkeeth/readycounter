import { getStore, type StoreDefinition } from '../data/stores';
import type { Product } from '../types/commerce';

export interface ShopifyCatalogProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    id: string;
    sku: string;
    price: string;
    inventory_quantity: number;
    barcode?: string;
  }>;
}

export interface ShopifyCatalogExport {
  exported_at: string;
  store: string;
  products: ShopifyCatalogProduct[];
}

export function toShopifyCatalog(storeId: string): ShopifyCatalogExport {
  const store = getStore(storeId);
  return {
    exported_at: new Date().toISOString(),
    store: store.name,
    products: store.products.map((p) => productToShopify(p, store.name)),
  };
}

function productToShopify(p: Product, vendor: string): ShopifyCatalogProduct {
  return {
    id: p.id,
    title: p.name,
    body_html: `<p>${p.description}</p>`,
    vendor,
    product_type: p.category,
    tags: p.tags.join(', '),
    variants: [
      {
        id: `${p.id}-v1`,
        sku: p.id,
        price: p.price.toFixed(2),
        inventory_quantity: p.inStock ? 100 : 0,
        ...(p.gtin ? { barcode: p.gtin } : {}),
      },
    ],
  };
}

export interface FeedValidationIssue {
  productId: string;
  field: string;
  message: string;
  severity: 'error' | 'warn';
}

export function validateShopifyCatalog(feed: ShopifyCatalogExport): {
  ok: boolean;
  issues: FeedValidationIssue[];
} {
  const issues: FeedValidationIssue[] = [];

  for (const product of feed.products) {
    if (!product.title?.trim()) {
      issues.push({
        productId: product.id,
        field: 'title',
        message: 'Missing product title',
        severity: 'error',
      });
    }
    const variant = product.variants[0];
    if (!variant) {
      issues.push({
        productId: product.id,
        field: 'variants',
        message: 'No variants — agents cannot resolve price/Offer',
        severity: 'error',
      });
      continue;
    }
    if (!variant.barcode) {
      issues.push({
        productId: product.id,
        field: 'barcode',
        message: 'Missing GTIN/barcode — hurts agent discovery',
        severity: 'warn',
      });
    }
    const price = parseFloat(variant.price);
    if (Number.isNaN(price) || price <= 0) {
      issues.push({
        productId: product.id,
        field: 'price',
        message: 'Invalid variant price',
        severity: 'error',
      });
    }
  }

  return { ok: issues.filter((i) => i.severity === 'error').length === 0, issues };
}

export function validateStoreCatalog(storeId: string): {
  ok: boolean;
  issues: FeedValidationIssue[];
} {
  return validateShopifyCatalog(toShopifyCatalog(storeId));
}

function normalizeTags(tags: string | string[] | undefined): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function shopifyToProduct(row: ShopifyCatalogProduct): Product {
  const variant = row.variants[0];
  const price = variant ? parseFloat(variant.price) : 0;
  const category = (row.product_type || 'merch') as Product['category'];
  const tagsRaw = row.tags as string | string[] | undefined;
  return {
    id: variant?.sku ?? row.id,
    name: row.title,
    description: row.body_html.replace(/<[^>]+>/g, ' ').trim(),
    price: Number.isFinite(price) ? price : 0,
    currency: 'USD',
    tags: normalizeTags(tagsRaw),
    category,
    inStock: (variant?.inventory_quantity ?? 0) > 0,
    ...(variant?.barcode ? { gtin: variant.barcode } : {}),
    feedPrice: price,
  };
}

export function importShopifyFeed(
  feed: ShopifyCatalogExport,
  opts?: { storeId?: string; name?: string },
): StoreDefinition {
  const slug =
    opts?.storeId ??
    `import-${feed.store.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;
  const products = feed.products.map(shopifyToProduct);
  const categories = [...new Set(products.map((p) => p.category))];
  const name = opts?.name ?? feed.store;

  return {
    id: slug,
    name,
    tagline: 'Imported Shopify catalog — agent-ready feed',
    products,
    merchant: {
      storeName: name,
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
    },
    categories,
  };
}
