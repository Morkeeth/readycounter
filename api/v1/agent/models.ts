import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MODELS, PROMPT_VERSION } from './step';

/** The models a judge may send shopping. Whitelisted server-side. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const provider = process.env.OPENAI_API_KEY
    ? 'openai'
    : process.env.OPENROUTER_API_KEY
      ? 'openrouter'
      : null;
  res.setHeader('cache-control', 'public, s-maxage=60');
  return res.status(200).json({
    configured: provider !== null,
    provider,
    promptVersion: PROMPT_VERSION,
    models: MODELS,
  });
}
