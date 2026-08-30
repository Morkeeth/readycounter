import { useState } from 'react';
import { buildShareUrl } from '../lib/shareSession';
import { useShopStore } from '../store/shopStore';

export function ShareCoShopBar() {
  const order = useShopStore((s) => s.order);
  const merchant = useShopStore((s) => s.merchant);
  const funnel = useShopStore((s) => s.funnel);
  const [copied, setCopied] = useState(false);

  const lineCount = order.lines.length;

  const share = async () => {
    const url = buildShareUrl({
      v: 1,
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

  return (
    <div className="share-bar">
      <div>
        <strong>Share this co-shop</strong>
        <p>Same order opens on any device — send to a friend or your agent tab.</p>
      </div>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={() => void share()}
        disabled={lineCount === 0}
      >
        {copied ? 'Link copied' : 'Copy co-shop link'}
      </button>
    </div>
  );
}
