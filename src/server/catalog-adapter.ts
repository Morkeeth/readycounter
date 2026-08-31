import type { StoreDefinition } from '../data/stores';
import type { StoreAuditMeta } from '../types/audit';
import { auditStorefrontUrl } from './url-audit';
import { syncShopifyStore } from './shopify';

/** G1 — seam for catalog ingestion. Weights stay in `sources.ts` / `readiness.ts`. */
export type CatalogAdapterId = 'url-crawl' | 'shopify-admin';

export type CatalogAdapterResult =
  | { ok: true; store: StoreDefinition; meta: StoreAuditMeta }
  | { ok: false; error: string };

export interface CatalogAdapter {
  id: CatalogAdapterId;
  label: string;
  fetch(input: string): Promise<CatalogAdapterResult>;
}

function urlMetaFromAudit(
  _store: StoreDefinition,
  url: string,
  method: StoreAuditMeta['method'],
  signals: StoreAuditMeta['signals'],
  productCount: number,
  policySmoke?: StoreAuditMeta['policySmoke'],
): StoreAuditMeta {
  return {
    source: 'url-crawl',
    url,
    method,
    fetchedAt: new Date().toISOString(),
    productCount,
    signals,
    ...(policySmoke ? { policySmoke } : {}),
  };
}

export const urlCrawlAdapter: CatalogAdapter = {
  id: 'url-crawl',
  label: 'Public storefront crawl',
  async fetch(url: string): Promise<CatalogAdapterResult> {
    const result = await auditStorefrontUrl(url);
    if (!result.ok) return result;
    const meta =
      result.store.audit ??
      urlMetaFromAudit(
        result.store,
        result.meta.url,
        result.meta.method,
        result.meta.signals,
        result.meta.productCount,
        result.meta.policySmoke,
      );
    return { ok: true, store: result.store, meta };
  },
};

export const shopifyAdminAdapter: CatalogAdapter = {
  id: 'shopify-admin',
  label: 'Shopify Admin API',
  async fetch(shop: string): Promise<CatalogAdapterResult> {
    const result = await syncShopifyStore(shop);
    if (!result.ok) return result;
    const meta = result.store.audit;
    if (!meta) {
      return { ok: false, error: 'Shopify sync returned no audit metadata.' };
    }
    return { ok: true, store: result.store, meta };
  },
};

export function getCatalogAdapter(id: CatalogAdapterId): CatalogAdapter {
  return id === 'shopify-admin' ? shopifyAdminAdapter : urlCrawlAdapter;
}

export const CATALOG_ADAPTERS: CatalogAdapter[] = [urlCrawlAdapter, shopifyAdminAdapter];
