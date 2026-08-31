import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRenderPartnershipStatus } from '../../../src/server/render-partnership';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const status = await getRenderPartnershipStatus();
  return res.status(200).json(status);
}
