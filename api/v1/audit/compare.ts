import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimitAsync, clientIp } from '../../../src/server/rate-limit';
import { assertSafeAuditUrl } from '../../../src/server/ssrf';
import { probeUcpCatalog } from '../../../src/server/ucp-probe';
import { probeAcpPolicies } from '../../../src/server/acp-probe';
import { buildAuditCompare } from '../../../src/lib/audit-compare';
import { shopifyAdminAdapter, urlCrawlAdapter } from '../../../src/server/catalog-adapter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rl = await checkRateLimitAsync(`audit-compare:${clientIp(req)}`, 15, 60 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const body = req.body as { url?: string; shop?: string };
  const url = String(body.url ?? '').trim();
  const shop = String(body.shop ?? '').trim();
  if (!url) {
    return res.status(400).json({ error: 'url required in body' });
  }

  const safe = assertSafeAuditUrl(url);
  if (!safe.ok) {
    return res.status(400).json({ error: safe.error });
  }
  const crawled = await urlCrawlAdapter.fetch(url);
  if (!crawled.ok) {
    return res.status(422).json({ error: crawled.error, mode: 'crawl' });
  }

  const ucpProbe = await probeUcpCatalog(url);
  const acpPolicy = await probeAcpPolicies(url);

  let oauthBlock: {
    shop: string;
    merchant: typeof crawled.store.merchant;
    products: typeof crawled.store.products;
    audit: NonNullable<typeof crawled.store.audit>;
  } | null = null;

  if (shop) {
    const synced = await shopifyAdminAdapter.fetch(shop);
    if (!synced.ok) {
      const partial = buildAuditCompare(
        url,
        {
          merchant: crawled.store.merchant,
          products: crawled.store.products,
          audit: crawled.meta,
        },
        null,
        ucpProbe,
        acpPolicy,
      );
      return res.status(200).json({
        ...partial,
        oauthError: synced.error,
      });
    }
    oauthBlock = {
      shop,
      merchant: synced.store.merchant,
      products: synced.store.products,
      audit: synced.meta,
    };
  }

  const result = buildAuditCompare(
    url,
    {
      merchant: crawled.store.merchant,
      products: crawled.store.products,
      audit: crawled.meta,
    },
    oauthBlock,
    ucpProbe,
    acpPolicy,
  );

  return res.status(200).json(result);
}
