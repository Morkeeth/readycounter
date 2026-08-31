import type { ShopifyCatalogExport } from '../integrations/shopify-catalog';
import { importShopifyFeed } from '../integrations/shopify-catalog';
import type { StoreDefinition } from '../data/stores';

export interface ShopifyConfig {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  scopes: string;
  devShop: string | null;
}

export function getShopifyConfig(): ShopifyConfig | null {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  const appUrl = (process.env.SHOPIFY_APP_URL ?? 'https://tooltruth-webmcp.vercel.app').replace(
    /\/$/,
    '',
  );
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    appUrl,
    scopes: process.env.SHOPIFY_SCOPES ?? 'read_products,read_product_listings',
    devShop: process.env.SHOPIFY_DEV_SHOP?.trim() ?? null,
  };
}

export function shopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

function normalizeShop(shop: string): string {
  const trimmed = shop.trim().toLowerCase();
  if (trimmed.endsWith('.myshopify.com')) return trimmed;
  return `${trimmed}.myshopify.com`;
}

export function shopifyInstallUrl(shop: string): string | null {
  const config = getShopifyConfig();
  if (!config) return null;
  const domain = normalizeShop(shop);
  const redirect = `${config.appUrl}/api/v1/shopify/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: config.scopes,
    redirect_uri: redirect,
    state: domain,
  });
  return `https://${domain}/admin/oauth/authorize?${params.toString()}`;
}

interface TokenCacheEntry {
  accessToken: string;
  expiresAt: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();

/** Client credentials — dev stores in same Partner org only. */
export async function getClientCredentialsToken(shop: string): Promise<string | null> {
  const config = getShopifyConfig();
  if (!config) return null;
  const domain = normalizeShop(shop);
  const cached = tokenCache.get(`cc:${domain}`);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.accessToken;
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  const expiresIn = data.expires_in ?? 86_400;
  tokenCache.set(`cc:${domain}`, {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  });
  return data.access_token;
}

export async function exchangeOAuthCode(
  shop: string,
  code: string,
): Promise<string | null> {
  const config = getShopifyConfig();
  if (!config) return null;
  const domain = normalizeShop(shop);

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string };
  tokenCache.set(`oauth:${domain}`, {
    accessToken: data.access_token,
    expiresAt: Date.now() + 86_400 * 1000,
  });
  return data.access_token;
}

function getCachedOAuthToken(shop: string): string | null {
  const entry = tokenCache.get(`oauth:${normalizeShop(shop)}`);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry.accessToken;
}

interface ShopifyAdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    id: number;
    sku: string;
    price: string;
    inventory_quantity: number;
    barcode?: string | null;
  }>;
}

export async function fetchAdminProducts(
  shop: string,
  accessToken: string,
): Promise<ShopifyAdminProduct[]> {
  const domain = normalizeShop(shop);
  const products: ShopifyAdminProduct[] = [];
  let nextUrl: string | null =
    `https://${domain}/admin/api/2025-01/products.json?limit=50&fields=id,title,body_html,vendor,product_type,tags,variants`;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    if (!res.ok) break;
    const data = (await res.json()) as { products: ShopifyAdminProduct[] };
    products.push(...data.products);
    const link: string | null = res.headers.get('link');
    const next: string | undefined = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    nextUrl = next ?? null;
  }

  return products;
}

function adminToCatalogExport(
  shop: string,
  products: ShopifyAdminProduct[],
): ShopifyCatalogExport {
  return {
    exported_at: new Date().toISOString(),
    store: shop.replace('.myshopify.com', ''),
    products: products.map((p) => ({
      id: String(p.id),
      title: p.title,
      body_html: p.body_html ?? '',
      vendor: p.vendor ?? '',
      product_type: p.product_type ?? '',
      tags: p.tags ?? '',
      variants: (p.variants ?? []).map((v) => ({
        id: String(v.id),
        sku: v.sku || String(v.id),
        price: v.price,
        inventory_quantity: v.inventory_quantity ?? 0,
        ...(v.barcode ? { barcode: v.barcode } : {}),
      })),
    })),
  };
}

export async function syncShopifyStore(shop: string): Promise<{
  ok: true;
  store: StoreDefinition;
} | {
  ok: false;
  error: string;
}> {
  const domain = normalizeShop(shop);
  let token = getCachedOAuthToken(domain);
  if (!token) {
    token = await getClientCredentialsToken(domain);
  }
  if (!token) {
    return {
      ok: false,
      error:
        'No access token — install the app on this shop (OAuth) or use a dev store in your Partner org (client credentials).',
    };
  }

  const products = await fetchAdminProducts(domain, token);
  if (products.length === 0) {
    return { ok: false, error: 'No products returned from Shopify Admin API.' };
  }

  const feed = adminToCatalogExport(domain, products);
  const store = importShopifyFeed(feed, {
    storeId: domain.replace('.myshopify.com', ''),
    name: feed.store,
  });
  store.audit = {
    source: 'shopify-admin',
    url: `https://${domain}`,
    method: 'shopify-products-json',
    fetchedAt: new Date().toISOString(),
    productCount: store.products.length,
    signals: {
      productsJson: true,
      jsonLdBlocks: 0,
      gtinCoverage: Math.round(
        (store.products.filter((p) => p.gtin).length / Math.max(1, store.products.length)) * 100,
      ),
      captchaHints: false,
      accountWallHints: false,
      checkoutProbed: false,
    },
  };

  return { ok: true, store };
}
