import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveStore } from '../../../src/server/resolve-store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const storeId = String(req.query.storeId ?? '');
  if (!storeId) {
    return res.status(400).json({ error: 'storeId required' });
  }

  const store = await resolveStore(storeId);
  return res.status(200).json({
    storeId: store.id,
    name: store.name,
    productCount: store.products.length,
    store,
  });
}
