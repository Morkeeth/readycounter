import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, patchRoom } from '../../../src/server/room-store';
import type { FunnelEvent, MerchantConfig, OrderState } from '../../../src/types/commerce';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const roomId = String(req.query.roomId ?? '');
  if (!roomId) {
    return res.status(400).json({ error: 'roomId required' });
  }

  if (req.method === 'GET') {
    const state = await getRoom(roomId);
    if (!state) return res.status(404).json({ error: 'Room not found' });
    return res.status(200).json({ roomId, state });
  }

  if (req.method === 'PATCH') {
    const body = req.body as {
      order?: OrderState;
      merchant?: MerchantConfig;
      funnel?: FunnelEvent[];
      storeId?: string;
    };
    const state = await patchRoom(roomId, body);
    if (!state) return res.status(404).json({ error: 'Room not found' });
    return res.status(200).json({ roomId, state });
  }

  res.setHeader('Allow', 'GET, PATCH');
  return res.status(405).json({ error: 'Method not allowed' });
}
