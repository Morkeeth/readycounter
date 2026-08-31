import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { StoreDefinition } from '../../../src/data/stores';
import { importShopifyFeed, type ShopifyCatalogExport } from '../../../src/integrations/shopify-catalog';
import { registerServerCustomStore } from '../../../src/server/custom-stores';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const body = req.body as {
      feed?: ShopifyCatalogExport;
      store?: StoreDefinition;
      storeId?: string;
      storeName?: string;
    };

    if (body.store) {
      await registerServerCustomStore(body.store);
      return res.status(201).json({ ok: true, storeId: body.store.id });
    }

    if (body.feed) {
      const def = importShopifyFeed(body.feed, {
        storeId: body.storeId,
        name: body.storeName,
      });
      await registerServerCustomStore(def);
      return res.status(201).json({
        ok: true,
        storeId: def.id,
        name: def.name,
        productCount: def.products.length,
      });
    }

    return res.status(400).json({ error: 'Provide feed or store in body' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      hint: 'POST Shopify feed JSON or full StoreDefinition to register a custom store for API reads.',
    });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
