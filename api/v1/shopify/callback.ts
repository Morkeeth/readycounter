import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exchangeOAuthCode, getShopifyConfig, syncShopifyStore } from '../../../src/server/shopify';
import { registerServerCustomStore } from '../../../src/server/custom-stores';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = getShopifyConfig();
  if (!config) {
    return res.status(503).send('Shopify not configured on server.');
  }

  const shop = String(req.query.shop ?? req.query.state ?? '');
  const code = String(req.query.code ?? '');

  if (!shop || !code) {
    return res.status(400).send('Missing shop or code from Shopify OAuth callback.');
  }

  const token = await exchangeOAuthCode(shop, code);
  if (!token) {
    return res.status(502).send('OAuth token exchange failed. Check app credentials and redirect URL.');
  }

  const synced = await syncShopifyStore(shop);
  if (!synced.ok) {
    return res.status(502).send(synced.error);
  }

  await registerServerCustomStore(synced.store);

  const app = new URL('/', config.appUrl);
  app.searchParams.set('store', synced.store.id);
  app.searchParams.set('view', 'merchant');
  app.searchParams.set('shopify', 'connected');
  return res.redirect(302, app.toString());
}
