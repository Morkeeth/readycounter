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
      setRoomMsg('Live sync is in preview on deploy — cart links work everywhere now.');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('room', created.roomId);
    url.searchParams.set('store', storeId);
    window.history.replaceState({}, '', url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setRoomMsg('Preview session started — link copied (may reset on cold start).');
    } catch {
      setRoomMsg(`Preview session: ${url.toString()}`);
    }
  };

  return (
    <div className="share-bar">
      <div>
        <strong>Share this cart</strong>
        <p>
          {roomId
            ? 'Preview live sync — prefer cart link for reliable sharing.'
            : importedStore
              ? 'Link includes your imported catalog — works in incognito, no account.'
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
          className="btn btn--secondary btn--quiet"
          onClick={() => void startLiveRoom()}
        >
          Live sync (preview)
        </button>
      </div>
      {roomMsg && <p className="share-bar__msg">{roomMsg}</p>}
    </div>
  );
}
