import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getShopifyConfig, shopifyConfigured } from '../../../src/server/shopify';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const config = getShopifyConfig();
  res.status(200).json({
    configured: shopifyConfigured(),
    hasClientId: !!config?.clientId,
    hasClientSecret: !!config?.clientSecret,
    devShop: config?.devShop ?? null,
    appUrl: config?.appUrl ?? null,
    scopes: config?.scopes ?? null,
    installPath: '/api/v1/shopify/auth?shop=YOUR-STORE.myshopify.com',
    callbackPath: '/api/v1/shopify/callback',
  });
}
