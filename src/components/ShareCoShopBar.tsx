import { useState } from 'react';
import { apiCreateRoom } from '../api/client';
import { buildShareUrl } from '../lib/shareSession';
import { isBuiltinStore } from '../data/stores';
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
  const importedStore = !isBuiltinStore(storeId);

  const share = async () => {
    const url = buildShareUrl({ storeId, order, merchant, funnel });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy link to share this cart:', url);
    }
  };

  const startLiveRoom = async () => {
    const created = await apiCreateRoom(storeId, merchant);
    if (!created) {
      setRoomMsg('Could not create room — API may be offline.');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('room', created.roomId);
    url.searchParams.set('store', storeId);
    window.history.replaceState({}, '', url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setRoomMsg('Live session started — link copied. Synced via Render KV.');
    } catch {
      setRoomMsg(`Live session: ${url.toString()}`);
    }
  };

  return (
    <div className="share-bar">
      <div>
        <strong>Share this cart</strong>
        <p>
          {roomId
            ? 'Live sync active — cart updates across tabs (Render KV).'
            : importedStore
              ? 'Link includes your catalog — works in incognito.'
              : 'Anyone with the link sees this cart and can keep shopping.'}
        </p>
      </div>
      <div className="share-bar__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void share()}
          disabled={lineCount === 0}
        >
          {copied ? 'Link copied' : 'Copy cart link'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => void startLiveRoom()}
          disabled={lineCount === 0}
        >
          Start live session
        </button>
      </div>
      {roomMsg && <p className="share-bar__msg">{roomMsg}</p>}
    </div>
  );
}
