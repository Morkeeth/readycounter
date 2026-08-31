import type { VercelRequest, VercelResponse } from '@vercel/node';
import { reviewAgainstField } from '../../../src/data/field-companion';
import { computeAuditFindings } from '../../../src/lib/audit-findings';
import { registerServerCustomStore } from '../../../src/server/custom-stores';
import { urlCrawlAdapter } from '../../../src/server/catalog-adapter';
import { checkRateLimit, clientIp } from '../../../src/server/rate-limit';
import { WEBMCP_TOOL_COUNT } from '../../../src/webmcp/toolManifest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rl = checkRateLimit(`audit-url:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec ?? 60));
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const body = req.body as { url?: string };
  const url = String(body.url ?? '').trim();
  if (!url) {
    return res.status(400).json({ error: 'url required in body' });
  }

  const audited = await urlCrawlAdapter.fetch(url);
  if (!audited.ok) {
    const fieldReview = reviewAgainstField({
      productsJsonOk: false,
      error: audited.error,
    });
    return res.status(422).json({
      error: audited.error,
      fieldReview,
      nextSteps: fieldReview.nextSteps.slice(0, 3),
    });
  }

  await registerServerCustomStore(audited.store);
  const { findings, summary } = computeAuditFindings(
    audited.store.merchant,
    audited.store.products,
    audited.meta,
    WEBMCP_TOOL_COUNT,
  );

  const fieldReview = reviewAgainstField({
    gtinPct: audited.meta.signals.gtinCoverage,
    captchaHint: audited.meta.signals.captchaHints,
    catalogScore: summary.catalogScore,
    productsJsonOk: audited.meta.signals.productsJson || audited.meta.productCount > 0,
    accountWall: audited.meta.signals.accountWallHints,
  });

  return res.status(201).json({
    ok: true,
    storeId: audited.store.id,
    name: audited.store.name,
    productCount: audited.store.products.length,
    score: summary.catalogScore,
    scoreNote: `Catalog-only score (${summary.catalogBudget} pt budget). ${summary.unmeasuredLineIds.length} checkout lines need OAuth or agent journey.`,
    summary,
    findings,
    meta: {
      url: audited.meta.url,
      method: audited.meta.method,
      source: audited.meta.source,
      gtinPct: audited.meta.signals.gtinCoverage,
      captchaHint: audited.meta.signals.captchaHints,
    },
    fieldReview,
    bookmark: `/?store=${encodeURIComponent(audited.store.id)}&view=merchant`,
    nextSteps: fieldReview.nextSteps.slice(0, 3),
  });
}
