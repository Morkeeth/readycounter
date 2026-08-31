import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvBackend, kvPing } from '../../src/server/kv';
import { getRenderKvInfo, loadAuditBatchFromKv } from '../../src/server/render-partnership';
import { shopifyConfigured } from '../../src/server/shopify';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const backend = await kvBackend();
  const redisOk = backend === 'redis' ? await kvPing() : false;
  const renderKv = await getRenderKvInfo();
  const lastAuditBatch = await loadAuditBatchFromKv();

  res.status(200).json({
    ok: true,
    service: 'readycounter-api',
    version: 1,
    integrations: [
      'shopify-catalog',
      'shopify-oauth',
      'coshop-rooms',
      'webmcp',
      'render-kv',
      'url-audit',
      'render-cron',
    ],
    useCase: 'shopify-oauth + render-kv — connect catalog, persist audit, live co-shop',
    kv: { backend, redisOk },
    shopify: { configured: shopifyConfigured() },
    render: {
      partner: true,
      kv: renderKv,
      lastAuditBatchAt: lastAuditBatch?.at ?? null,
      cronBlueprint: 'render.yaml',
      statusEndpoint: '/api/v1/render/status',
    },
  });
}
