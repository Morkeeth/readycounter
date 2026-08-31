import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRankingsResponse } from '../../src/lib/rankings';
import { loadAuditBatchFromKv } from '../../src/server/render-partnership';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const batch = await loadAuditBatchFromKv();
  return res.status(200).json(buildRankingsResponse(batch));
}
