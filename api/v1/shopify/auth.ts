import type { VercelRequest, VercelResponse } from '@vercel/node';
import { shopifyInstallUrl } from '../../../src/server/shopify';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shop = String(req.query.shop ?? '');
  if (!shop) {
    return res.status(400).json({ error: 'shop query param required (e.g. your-store.myshopify.com)' });
  }

  const url = shopifyInstallUrl(shop);
  if (!url) {
    return res.status(503).json({
      error: 'Shopify not configured — set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET on the server.',
    });
  }

  return res.redirect(302, url);
}
