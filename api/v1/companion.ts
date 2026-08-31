import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFieldCompanionPayload, reviewAgainstField } from '../../src/data/field-companion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
    return res.status(200).json(
      reviewAgainstField({
        gtinPct: typeof body.gtinPct === 'number' ? body.gtinPct : undefined,
        captchaHint: body.captchaHint === true,
        catalogScore: typeof body.catalogScore === 'number' ? body.catalogScore : undefined,
        productsJsonOk: body.productsJsonOk,
        accountWall: body.accountWall === true,
        error: typeof body.error === 'string' ? body.error : undefined,
      }),
    );
  }

  const topic = typeof req.query.topic === 'string' ? req.query.topic : undefined;
  return res.status(200).json(getFieldCompanionPayload(topic));
}
