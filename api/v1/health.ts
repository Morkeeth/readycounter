import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: 'readycounter-api',
    version: 1,
    integrations: ['shopify-catalog', 'shopify-oauth', 'coshop-rooms', 'webmcp'],
    shopify: {
      configured: !!process.env.SHOPIFY_CLIENT_ID && !!process.env.SHOPIFY_CLIENT_SECRET,
    },
  });
}
