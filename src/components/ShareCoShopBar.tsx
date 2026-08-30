import { useState } from 'react';
import { apiCreateRoom } from '../api/client';
import { buildShareUrl } from '../lib/shareSession';
import { useShopStore } from '../store/shopStore';

export function ShareCoShopBar() {
  const order = useShopStore((s) => s.order);
  const storeId = useShopStore((s) => s.storeId);
  const merchant = useShopStore((s) => s.merchant);
  const funnel = useShopStore((s) => s.funnel);
  const [copied, setCopied] = useState(false);
  const [roomMsg, setRoomMsg] = useState<string | null>(null);

  const lineCount = order.lines.length;
  const roomId = new URLSearchParams(window.location.search).get('room');

  const share = async () => {
    const url = buildShareUrl({
      v: 1,
      storeId,
      order,
      merchant,
      funnel,
    });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy co-shop link:', url);
    }
  };

  const startLiveRoom = async () => {
    const created = await apiCreateRoom(storeId, merchant);
    if (!created) {
      setRoomMsg('API offline — use static link (local dev) or deploy to Vercel.');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('room', created.roomId);
    url.searchParams.set('store', storeId);
    window.history.replaceState({}, '', url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setRoomMsg(`Live room ${created.roomId} — link copied`);
    } catch {
      setRoomMsg(`Live room: ${url.toString()}`);
    }
  };

  return (
    <div className="share-bar">
      <div>
        <strong>Share this co-shop</strong>
        <p>
          {roomId
            ? `Live API room · ${roomId} — polling sync`
            : 'Static link (encoded) or live API room on Vercel.'}
        </p>
      </div>
      <div className="share-bar__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void startLiveRoom()}
        >
          Start live room
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => void share()}
          disabled={lineCount === 0}
        >
          {copied ? 'Link copied' : 'Copy static link'}
        </button>
      </div>
      {roomMsg && <p className="share-bar__msg">{roomMsg}</p>}
    </div>
  );
}
