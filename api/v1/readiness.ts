import type { VercelRequest, VercelResponse } from '@vercel/node';
import { computeReadinessChecks, readinessScore } from '../../src/lib/readiness';
import { validateStoreCatalog } from '../../src/integrations/shopify-catalog';
import { resolveStore } from '../../src/server/resolve-store';
import { WEBMCP_TOOL_COUNT } from '../../src/webmcp/toolManifest';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const storeId = String(req.query.storeId ?? 'ember-oak');
  const toolCount = Number(req.query.tools ?? WEBMCP_TOOL_COUNT);
  const store = resolveStore(storeId);
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
