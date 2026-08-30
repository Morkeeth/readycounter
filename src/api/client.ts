import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';
import type { RoomState } from '../server/room-store';

const API = '/api/v1';

export interface ApiRoomResponse {
  roomId: string;
  state: RoomState;
}

export async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiCreateRoom(
  storeId: string,
  merchant: MerchantConfig,
): Promise<ApiRoomResponse | null> {
  try {
    const res = await fetch(`${API}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, merchant }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiRoomResponse;
  } catch {
    return null;
  }
}

export async function apiGetRoom(roomId: string): Promise<RoomState | null> {
  try {
    const res = await fetch(`${API}/rooms/${encodeURIComponent(roomId)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { state: RoomState };
    return data.state;
  } catch {
    return null;
  }
}

export async function apiPatchRoom(
  roomId: string,
  patch: {
    order?: OrderState;
    merchant?: MerchantConfig;
    funnel?: FunnelEvent[];
    storeId?: string;
  },
): Promise<RoomState | null> {
  try {
    const res = await fetch(`${API}/rooms/${encodeURIComponent(roomId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { state: RoomState };
    return data.state;
  } catch {
    return null;
  }
}
