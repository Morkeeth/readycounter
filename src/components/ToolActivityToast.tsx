import { useEffect } from 'react';
import { useGiftStore } from '../store/giftStore';

export function ToolActivityToast() {
  const activity = useGiftStore((s) => s.lastToolActivity);
  const clear = useGiftStore((s) => s.clearToolActivity);

  useEffect(() => {
    if (!activity) return;
    const timer = window.setTimeout(() => clear(), 4000);
    return () => window.clearTimeout(timer);
  }, [activity, clear]);

  if (!activity) return null;

  const detail = [
    activity.recipientId && `→ ${activity.recipientId}`,
    activity.productId && `#${activity.productId}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="tool-toast" role="status" aria-live="polite">
      <span className="tool-toast__pulse" />
      <strong>{activity.toolName}</strong>
      {detail && <span className="tool-toast__detail">{detail}</span>}
    </div>
  );
}
