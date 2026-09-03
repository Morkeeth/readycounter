import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvGet } from '../../../src/server/kv';
import type { AgentTrialReceipt } from '../../../src/types/agent-trial';

const TRIAL_KEY = 'rc:agent-trial:';
const RECENT_KEY = 'rc:agent-trials:recent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('cache-control', 'no-store');
  const requested = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (requested) {
    if (!/^[0-9a-f-]{36}$/i.test(requested)) return res.status(400).json({ error: 'invalid_trial_id' });
    const raw = await kvGet(`${TRIAL_KEY}${requested}`);
    if (!raw) return res.status(404).json({ error: 'trial_not_found' });
    try {
      const session = JSON.parse(raw) as { receipt: AgentTrialReceipt };
      return res.status(200).json({ trial: session.receipt });
    } catch {
      return res.status(500).json({ error: 'trial_unreadable' });
    }
  }

  const raw = await kvGet(RECENT_KEY);
  if (!raw) return res.status(200).json({ trials: [] });
  try {
    return res.status(200).json({ trials: JSON.parse(raw) as AgentTrialReceipt[] });
  } catch {
    return res.status(200).json({ trials: [] });
  }
}
