import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';

export interface RoomState {
  storeId: string;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
  updatedAt: number;
}

const memory = new Map<string, RoomState>();

function randomId(): string {
  return `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createRoom(storeId: string, merchant: MerchantConfig): string {
  const id = randomId();
  memory.set(id, {
    storeId,
    order: { lines: [], currency: 'USD' },
    merchant: { ...merchant },
    funnel: [],
    updatedAt: Date.now(),
  });
  return id;
}

export function getRoom(roomId: string): RoomState | undefined {
  return memory.get(roomId);
}

export function patchRoom(
  roomId: string,
  patch: Partial<Pick<RoomState, 'order' | 'merchant' | 'funnel' | 'storeId'>>,
): RoomState | undefined {
  const existing = memory.get(roomId);
  if (!existing) return undefined;
  const next: RoomState = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  memory.set(roomId, next);
  return next;
}

export function clearAllRooms(): void {
  memory.clear();
}
