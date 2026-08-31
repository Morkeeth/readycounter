import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';
import { kvGet, kvSet } from './kv';
import { publishRoom } from './room-events';

export interface RoomState {
  storeId: string;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
  updatedAt: number;
}

const memory = new Map<string, RoomState>();
const ROOM_PREFIX = 'rc:room:';

function randomId(): string {
  return `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persistRoom(roomId: string, state: RoomState): Promise<void> {
  memory.set(roomId, state);
  await kvSet(`${ROOM_PREFIX}${roomId}`, JSON.stringify(state));
}

async function loadRoom(roomId: string): Promise<RoomState | undefined> {
  const cached = memory.get(roomId);
  if (cached) return cached;
  const raw = await kvGet(`${ROOM_PREFIX}${roomId}`);
  if (!raw) return undefined;
  try {
    const state = JSON.parse(raw) as RoomState;
    memory.set(roomId, state);
    return state;
  } catch {
    return undefined;
  }
}

export async function createRoom(storeId: string, merchant: MerchantConfig): Promise<string> {
  const id = randomId();
  const state: RoomState = {
    storeId,
    order: { lines: [], currency: 'USD' },
    merchant: { ...merchant },
    funnel: [],
    updatedAt: Date.now(),
  };
  await persistRoom(id, state);
  return id;
}

export async function getRoom(roomId: string): Promise<RoomState | undefined> {
  return loadRoom(roomId);
}

export async function patchRoom(
  roomId: string,
  patch: Partial<Pick<RoomState, 'order' | 'merchant' | 'funnel' | 'storeId'>>,
): Promise<RoomState | undefined> {
  const existing = await loadRoom(roomId);
  if (!existing) return undefined;
  const next: RoomState = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await persistRoom(roomId, next);
  publishRoom(roomId, next);
  return next;
}

export function clearAllRooms(): void {
  memory.clear();
}

/** Sync helpers for verify scripts (memory-only). */
export function createRoomSync(storeId: string, merchant: MerchantConfig): string {
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

export function getRoomSync(roomId: string): RoomState | undefined {
  return memory.get(roomId);
}

export function patchRoomSync(
  roomId: string,
  patch: Partial<Pick<RoomState, 'order' | 'merchant' | 'funnel' | 'storeId'>>,
): RoomState | undefined {
  const existing = memory.get(roomId);
  if (!existing) return undefined;
  const next = { ...existing, ...patch, updatedAt: Date.now() };
  memory.set(roomId, next);
  publishRoom(roomId, next);
  return next;
}
