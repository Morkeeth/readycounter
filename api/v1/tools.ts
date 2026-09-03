import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TOOL_MANIFEST_WITH_SCHEMAS, WEBMCP_TOOL_COUNT } from '../../src/webmcp/toolManifest';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    version: '1',
    toolCount: WEBMCP_TOOL_COUNT,
    openapi: '/openapi.yaml',
    tools: TOOL_MANIFEST_WITH_SCHEMAS,
  });
}
