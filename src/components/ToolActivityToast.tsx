import { useEffect } from 'react';
import { useShopStore } from '../store/shopStore';

export function ToolActivityToast() {
  const activity = useShopStore((s) => s.lastToolActivity);
  const clear = useShopStore((s) => s.clearToolActivity);

  useEffect(() => {
    if (!activity) return;
    const timer = window.setTimeout(() => clear(), 4000);
    return () => window.clearTimeout(timer);
  }, [activity, clear]);

  if (!activity) return null;

  return (
    <div className="tool-toast" role="status" aria-live="polite">
      <span className="tool-toast__mark" aria-hidden>&gt;</span>
      <strong>{activity.toolName}</strong>
      {activity.productId && (
        <span className="tool-toast__detail">{activity.productId}</span>
      )}
    </div>
  );
}
