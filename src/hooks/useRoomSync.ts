import { useEffect, useRef } from 'react';
import { apiGetRoom, apiPatchRoom } from '../api/client';
import { useShopStore } from '../store/shopStore';

function roomIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('room');
}

/** Sync co-shop state with API room when ?room= is present (deployed / vercel dev). */
export function useRoomSync() {
  const roomId = roomIdFromUrl();
  const syncing = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const pull = async () => {
      const remote = await apiGetRoom(roomId);
      if (!remote || cancelled) return;
      syncing.current = true;
      useShopStore.setState({
        storeId: remote.storeId,
        order: remote.order,
        merchant: remote.merchant,
        funnel: remote.funnel,
      });
      syncing.current = false;
    };

    void pull();
    const interval = window.setInterval(() => void pull(), 3000);

    const unsub = useShopStore.subscribe((state) => {
      if (syncing.current || !roomId) return;
      void apiPatchRoom(roomId, {
        storeId: state.storeId,
        order: state.order,
        merchant: state.merchant,
        funnel: state.funnel,
      });
    });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      unsub();
    };
  }, [roomId]);
}
