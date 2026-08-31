import type { Product } from '../types/commerce';
import type { StoreDefinition } from '../data/stores';
import type { PolicySmokeResult, StoreAuditMeta, StoreAuditSignals } from '../types/audit';
import { importShopifyFeed, type ShopifyCatalogExport } from '../integrations/shopify-catalog';
import { assertSafeAuditUrl } from './ssrf';
import {
  offerCoverageFromJsonLdNodes,
  offerCoverageFromProducts,
} from '../lib/offer-crawl';
import { runPolicySmoke } from '../lib/policy-smoke';

const FETCH_MS = 15_000;
const MAX_BYTES = 2_500_000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export interface UrlAuditMeta {
  url: string;
  origin: string;
  method: 'json-ld' | 'shopify-products-json' | 'none';
  jsonLdBlocks: number;
  productCount: number;
  signals: StoreAuditSignals;
  policySmoke: PolicySmokeResult;
}

export type UrlAuditResult =
  | { ok: true; store: StoreDefinition; meta: UrlAuditMeta }
  | { ok: false; error: string };

function slugFromHost(hostname: string): string {
  return `audit-${hostname.replace(/\./g, '-').replace(/[^a-z0-9-]/gi, '').slice(0, 40)}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function detectSignals(html: string): Pick<StoreAuditSignals, 'captchaHints' | 'accountWallHints'> {
  const lower = html.toLowerCase();
  const captchaHints =
    lower.includes('recaptcha') ||
    lower.includes('hcaptcha') ||
    lower.includes('captcha') ||
    lower.includes('challenge-platform');
  const accountWallHints =
    /\b(sign in|log in|login required|create an account|account required)\b/i.test(html);
  return { captchaHints, accountWallHints };
}

function gtinCoverage(products: Product[]): number {
  if (products.length === 0) return 0;
  return Math.round((products.filter((p) => p.gtin).length / products.length) * 100);
}

/** Exported for verify scripts. */
export function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      /* skip malformed */
    }
  }
  return blocks;
}

function collectProductNodes(blocks: unknown[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj['@graph'])) {
      for (const child of obj['@graph']) walk(child);
    }
    const type = obj['@type'];
    const types = asArray(
      typeof type === 'string' ? type : Array.isArray(type) ? (type as string[]) : [],
    );
    if (types.some((t) => t === 'Product' || t.endsWith('Product'))) {
      out.push(obj);
    }
  };

  for (const block of blocks) walk(block);
  return out;
}

function offerPrice(offers: unknown): number {
  if (!offers || typeof offers !== 'object') return 0;
  const o = offers as Record<string, unknown>;
  const list = asArray(o.offers ?? o);
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const price = row.price ?? row.lowPrice ?? row.highPrice;
    const n = typeof price === 'string' ? parseFloat(price) : typeof price === 'number' ? price : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function jsonLdToProducts(nodes: Record<string, unknown>[]): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const name = String(node.name ?? node.title ?? '').trim();
    if (!name) continue;
    const sku = String(node.sku ?? node.productID ?? node['@id'] ?? `product-${i + 1}`);
    const price = offerPrice(node.offers);
    const gtin = String(
      node.gtin ?? node.gtin13 ?? node.gtin12 ?? node.gtin8 ?? node.isbn ?? '',
    ).trim();
    const desc = stripHtml(String(node.description ?? ''));
    products.push({
      id: sku.slice(0, 64),
      name: name.slice(0, 120),
      description: desc.slice(0, 500) || name,
      price: price || 1,
      currency: 'USD',
      tags: ['audited', 'json-ld'],
      category: 'merch',
      inStock: true,
      feedPrice: price || 1,
      ...(gtin ? { gtin } : {}),
    });
  }
  return products;
}

function shopifyProductsJsonToFeed(data: {
  products?: Array<{
    id: number;
    title: string;
    body_html?: string;
    vendor?: string;
    product_type?: string;
    tags?: string;
    variants?: Array<{
      id: number;
      sku?: string;
      price: string;
      available?: boolean;
      barcode?: string | null;
    }>;
  }>;
}): ShopifyCatalogExport | null {
  if (!data.products?.length) return null;
  return {
    exported_at: new Date().toISOString(),
    store: 'storefront',
    products: data.products.map((p) => ({
      id: String(p.id),
      title: p.title,
      body_html: p.body_html ?? '',
      vendor: p.vendor ?? '',
      product_type: p.product_type ?? '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? ''),
      variants: (p.variants ?? []).map((v) => ({
        id: String(v.id),
        sku: v.sku || String(v.id),
        price: v.price,
        inventory_quantity: v.available === false ? 0 : 100,
        ...(v.barcode ? { barcode: v.barcode } : {}),
      })),
    })),
  };
}

async function fetchText(url: string, accept = 'text/html,application/json,text/plain,*/*'): Promise<{ text: string | null; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        'User-Agent': BROWSER_UA,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) return { text: null, status: res.status };
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return { text: null, status: res.status };
    return { text: new TextDecoder('utf-8', { fatal: false }).decode(buf), status: res.status };
  } catch {
    return { text: null, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchShopifyProductsJson(origin: string): Promise<Product[] | null> {
  const all: Product[] = [];
  let page = 1;
  while (page <= 3 && all.length < 50) {
    const { text } = await fetchText(
      `${origin}/products.json?limit=50&page=${page}`,
      'application/json',
    );
    if (!text) break;
    try {
      const data = JSON.parse(text) as Parameters<typeof shopifyProductsJsonToFeed>[0];
      const feed = shopifyProductsJsonToFeed(data);
      if (!feed?.products.length) break;
      const store = importShopifyFeed(feed, { storeId: 'tmp', name: 'tmp' });
      all.push(...store.products);
      if ((data.products?.length ?? 0) < 50) break;
      page += 1;
    } catch {
      break;
    }
  }
  return all.length > 0 ? all.slice(0, 50) : null;
}

function attachAudit(
  store: StoreDefinition,
  input: string,
  origin: string,
  method: UrlAuditMeta['method'],
  _jsonLdBlocks: number,
  signals: StoreAuditSignals,
  policySmoke: PolicySmokeResult,
): StoreDefinition {
  const audit: StoreAuditMeta = {
    source: 'url-crawl',
    url: input,
    method,
    fetchedAt: new Date().toISOString(),
    productCount: store.products.length,
    signals,
    policySmoke,
  };
  return { ...store, audit, tagline: `Audited from ${origin} (${method})` };
}

export async function auditStorefrontUrl(input: string): Promise<UrlAuditResult> {
  const safe = assertSafeAuditUrl(input);
  if (!safe.ok) {
    return { ok: false, error: safe.error };
  }
  const parsed = safe.url;

  const origin = parsed.origin;
  const hostname = parsed.hostname;
  const slug = slugFromHost(hostname);
  const name = hostname.replace(/^www\./, '');

  const homepage = await fetchText(parsed.href);
  const htmlSignals = homepage.text ? detectSignals(homepage.text) : { captchaHints: false, accountWallHints: false };
  const policySmoke: PolicySmokeResult = homepage.text
    ? await runPolicySmoke(homepage.text, origin)
    : { privacyOk: null, termsOk: null, measured: false, urls: {} };

  const fromJson = await fetchShopifyProductsJson(origin);
  if (fromJson) {
    const signals: StoreAuditSignals = {
      productsJson: true,
      jsonLdBlocks: 0,
      gtinCoverage: gtinCoverage(fromJson),
      offerCoverage: offerCoverageFromProducts(fromJson),
      captchaHints: htmlSignals.captchaHints,
      accountWallHints: htmlSignals.accountWallHints,
      checkoutProbed: false,
    };
    const store = attachAudit(
      {
        id: slug,
        name,
        tagline: '',
        products: fromJson,
        categories: [...new Set(fromJson.map((p) => p.category))],
        merchant: { storeName: name, checkoutRequiresCaptcha: false, checkoutRequiresAccount: false },
      },
      input,
      origin,
      'shopify-products-json',
      0,
      signals,
      policySmoke,
    );
    return {
      ok: true,
      store,
      meta: {
        url: input,
        origin,
        method: 'shopify-products-json',
        jsonLdBlocks: 0,
        productCount: fromJson.length,
        signals,
        policySmoke,
      },
    };
  }

  if (!homepage.text) {
    return {
      ok: false,
      error: `Could not fetch storefront (HTTP ${homepage.status || 'timeout'}). Store may block server crawlers — try Shopify OAuth.`,
    };
  }

  const blocks = extractJsonLdBlocks(homepage.text);
  const nodes = collectProductNodes(blocks);
  const products = jsonLdToProducts(nodes);

  if (products.length === 0) {
    return {
      ok: false,
      error:
        'No products in JSON-LD on homepage and /products.json blocked or empty. Try Shopify OAuth for full catalog.',
    };
  }

  const signals: StoreAuditSignals = {
    productsJson: false,
    jsonLdBlocks: blocks.length,
    gtinCoverage: gtinCoverage(products),
    offerCoverage: offerCoverageFromJsonLdNodes(nodes),
    captchaHints: htmlSignals.captchaHints,
    accountWallHints: htmlSignals.accountWallHints,
    checkoutProbed: false,
  };

  const store = attachAudit(
    {
      id: slug,
      name,
      tagline: '',
      products,
      categories: [...new Set(products.map((p) => p.category))],
      merchant: { storeName: name, checkoutRequiresCaptcha: false, checkoutRequiresAccount: false },
    },
    input,
    origin,
    'json-ld',
    blocks.length,
    signals,
    policySmoke,
  );

  return {
    ok: true,
    store,
    meta: {
      url: input,
      origin,
      method: 'json-ld',
      jsonLdBlocks: blocks.length,
      productCount: products.length,
      signals,
      policySmoke,
    },
  };
}
