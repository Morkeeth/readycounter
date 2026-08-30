import type { RoomState } from './room-store';

type RoomListener = (state: RoomState) => void;

const listeners = new Map<string, Set<RoomListener>>();

export function subscribeRoom(roomId: string, listener: RoomListener): () => void {
  let set = listeners.get(roomId);
  if (!set) {
    set = new Set();
    listeners.set(roomId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) listeners.delete(roomId);
  };
}

export function publishRoom(roomId: string, state: RoomState): void {
  listeners.get(roomId)?.forEach((listener) => listener(state));
}
