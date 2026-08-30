import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRoom, getRoom } from '../../../src/server/room-store';
import type { MerchantConfig } from '../../../src/types/commerce';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const body = req.body as { storeId?: string; merchant?: MerchantConfig };
    const storeId = body.storeId ?? 'ember-oak';
    const merchant = body.merchant ?? {
      storeName: 'Ember & Oak Coffee',
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: false,
    };
    const roomId = createRoom(storeId, merchant);
    const state = getRoom(roomId);
    return res.status(201).json({ roomId, state });
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
