import { useState } from 'react';
import { buildShareUrl } from '../lib/shareSession';
import { isBuiltinStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';

export function ShareCoShopBar() {
  const order = useShopStore((s) => s.order);
  const storeId = useShopStore((s) => s.storeId);
  const merchant = useShopStore((s) => s.merchant);
  const funnel = useShopStore((s) => s.funnel);
  const [copied, setCopied] = useState(false);

  const lineCount = order.lines.length;
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
    const next = new URL(url);
    window.history.replaceState({}, '', next.pathname + next.search + next.hash);
  };

  return (
    <div className="share-bar">
      <div>
        <strong>Share this cart</strong>
        <p>
          {importedStore
            ? 'Link embeds your catalog — works in incognito for judges.'
            : 'Anyone with the link sees this cart on the same demo store.'}
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
      </div>
    </div>
  );
}
