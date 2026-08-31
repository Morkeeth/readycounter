import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getShopifyConfig, syncShopifyStore } from '../../../src/server/shopify';
import { registerServerCustomStore } from '../../../src/server/custom-stores';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = getShopifyConfig();
  if (!config) {
    return res.status(503).json({ error: 'Shopify not configured on server.' });
  }

  const body = req.body as { shop?: string };
  const shop = String(body.shop ?? config.devShop ?? '');
  if (!shop) {
    return res.status(400).json({ error: 'shop required in body or set SHOPIFY_DEV_SHOP' });
  }

  const synced = await syncShopifyStore(shop);
  if (!synced.ok) {
    return res.status(502).json({ error: synced.error });
  }

  await registerServerCustomStore(synced.store);
  return res.status(200).json({
    ok: true,
    storeId: synced.store.id,
    name: synced.store.name,
    productCount: synced.store.products.length,
  });
}
