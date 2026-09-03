import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRankingsResponse, rankingsCacheControl } from '../../src/lib/rankings';
import { loadAuditBatchFromKv } from '../../src/server/render-partnership';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const batch = await loadAuditBatchFromKv();
  // CDN: rankings change only when a batch is republished; the empty fallback is never cacheable.
  res.setHeader('Cache-Control', rankingsCacheControl(batch));
  return res.status(200).json(buildRankingsResponse(batch));
}
