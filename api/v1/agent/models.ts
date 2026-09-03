import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MODELS } from './step';

/** The models a judge may send shopping. Whitelisted server-side. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('cache-control', 'public, s-maxage=300');
  return res.status(200).json({
    configured: Boolean(process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY),
    models: MODELS,
  });
}
