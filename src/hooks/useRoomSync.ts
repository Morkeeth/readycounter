import { useEffect, useRef } from 'react';
import { apiGetRoom, apiPatchRoom } from '../api/client';
import type { RoomState } from '../server/room-store';
import { useShopStore } from '../store/shopStore';

function roomIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('room');
}

/** Sync co-shop state with API room when ?room= is present (deployed / vercel dev). */
export function useRoomSync() {
  const roomId = roomIdFromUrl();
  const syncing = useRef(false);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    let pollInterval: number | null = null;

    const applyRemote = (remote: RoomState) => {
      syncing.current = true;
      useShopStore.setState({
        storeId: remote.storeId,
        order: remote.order,
        merchant: remote.merchant,
        funnel: remote.funnel,
      });
      syncing.current = false;
    };

    const pull = async () => {
      const remote = await apiGetRoom(roomId);
      if (!remote || cancelled) return;
      applyRemote(remote);
    };

    const startPolling = () => {
      if (pollInterval !== null) return;
      pollInterval = window.setInterval(() => void pull(), 3000);
    };

    const eventsUrl = `/api/v1/rooms/${encodeURIComponent(roomId)}/events`;

    try {
      const es = new EventSource(eventsUrl);
      sseRef.current = es;
      es.addEventListener('snapshot', (ev) => {
        const data = JSON.parse((ev as MessageEvent).data) as { state: RoomState };
        if (!cancelled) applyRemote(data.state);
      });
      es.addEventListener('patch', (ev) => {
        const data = JSON.parse((ev as MessageEvent).data) as { state: RoomState };
        if (!cancelled) applyRemote(data.state);
      });
      es.onerror = () => {
        es.close();
        startPolling();
      };
    } catch {
      startPolling();
    }

    void pull();

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
      sseRef.current?.close();
      if (pollInterval !== null) window.clearInterval(pollInterval);
      unsub();
    };
  }, [roomId]);
}
