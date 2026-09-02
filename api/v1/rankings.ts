import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRankingsResponse } from '../../src/lib/rankings';
import { loadAuditBatchFromKv } from '../../src/server/render-partnership';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const batch = await loadAuditBatchFromKv();
  // CDN + browser: rankings change only when a batch is republished.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(buildRankingsResponse(batch));
}
