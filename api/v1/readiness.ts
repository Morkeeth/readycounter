import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStore } from '../../src/data/stores';
import { computeReadinessChecks, readinessScore } from '../../src/lib/readiness';
import { validateStoreCatalog } from '../../src/integrations/shopify-catalog';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const storeId = String(req.query.storeId ?? 'ember-oak');
  const toolCount = Number(req.query.tools ?? 12);
  const store = getStore(storeId);
  const merchant = store.merchant;
  const checks = computeReadinessChecks(merchant, toolCount, store.products);
  const feed = validateStoreCatalog(storeId);

  return res.status(200).json({
    storeId: store.id,
    storeName: store.name,
    score: readinessScore(checks),
    checks,
    shopify_feed: feed,
  });
}
