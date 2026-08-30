import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom } from '../../../src/server/room-store';
import { subscribeRoom } from '../../../src/server/room-events';

export const config = {
  maxDuration: 60,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const roomId = String(req.query.roomId ?? '');
  if (!roomId) {
    return res.status(400).json({ error: 'roomId required' });
  }

  const initial = getRoom(roomId);
  if (!initial) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send('snapshot', { roomId, state: initial });

  const unsubscribe = subscribeRoom(roomId, (state) => {
    send('patch', { roomId, state });
  });

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
}
