import type { StoreDefinition } from '../data/stores';
import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';
import type { RoomState } from '../server/room-store';

const API = '/api/v1';

export interface ApiRoomResponse {
  roomId: string;
  state: RoomState;
}

export interface ShopifyStatus {
  configured: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  devShop: string | null;
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

export async function apiShopifyStatus(): Promise<ShopifyStatus | null> {
  try {
    const res = await fetch(`${API}/shopify/status`);
    if (!res.ok) return null;
    return (await res.json()) as ShopifyStatus;
  } catch {
    return null;
  }
}

export async function apiShopifySync(shop: string): Promise<{
  ok: true;
  storeId: string;
  name: string;
  productCount: number;
} | null> {
  try {
    const res = await fetch(`${API}/shopify/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop }),
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      ok: true;
      storeId: string;
      name: string;
      productCount: number;
    };
  } catch {
    return null;
  }
}

export async function apiFetchServerStore(storeId: string): Promise<StoreDefinition | null> {
  try {
    const res = await fetch(`${API}/stores/${encodeURIComponent(storeId)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { store: StoreDefinition };
    return data.store;
  } catch {
    return null;
  }
}

export interface FieldReviewPayload {
  ok: true;
  comparedToField: string;
  flagCount: number;
  flags: Array<{
    issueId: string;
    severity: 'high' | 'medium';
    note: string;
    issue: {
      rank: number;
      id: string;
      title: string;
      why: string;
      fails: string;
      doThisWeek: string;
      evidence: string;
    };
  }>;
  nextSteps: string[];
  companionTool: string;
}

export interface UrlAuditResponse {
  ok: true;
  storeId: string;
  name: string;
  productCount: number;
  score: number;
  scoreNote?: string;
  summary?: {
    catalogScore: number;
    catalogBudget: number;
    fullScore: number;
    unmeasuredLineIds: string[];
  };
  meta?: {
    url: string;
    method: string;
    source?: string;
    gtinPct?: number;
    captchaHint?: boolean;
    offerPct?: number | null;
    policySmoke?: {
      privacyUrl: string | null;
      termsUrl: string | null;
      privacyOk: boolean | null;
      termsOk: boolean | null;
      reason?: string;
    };
  };
  fieldReview?: FieldReviewPayload;
  bookmark: string;
  nextSteps?: string[];
}

export type UrlAuditClientResult =
  | { ok: true; data: UrlAuditResponse }
  | { ok: false; error: string; fieldReview?: FieldReviewPayload };

export async function apiAuditUrl(url: string): Promise<UrlAuditClientResult> {
  try {
    const res = await fetch(`${API}/audit/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const body = (await res.json()) as UrlAuditResponse & {
      error?: string;
      fieldReview?: FieldReviewPayload;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: body.error ?? `Audit failed (${res.status})`,
        fieldReview: body.fieldReview,
      };
    }
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: 'Network error — could not reach audit API' };
  }
}

export interface RenderPartnershipStatus {
  partner: 'render';
  tagline: string;
  kv: {
    provider: 'render' | 'other' | 'memory';
    hostname: string | null;
    region: string | null;
    connected: boolean;
  };
  lastAuditBatch: {
    at: string;
    shopCount: number;
    succeeded: number;
    avgCatalogScore: number;
    avgGtinPct: number;
  } | null;
  cron: { available: boolean; schedule: string; command: string };
  blueprint: string;
}

export interface RankingsResponse {
  ok: true;
  at: string | null;
  shopCount: number;
  succeeded: number;
  avgCatalogScore: number;
  avgGtinPct: number;
  avgOfferPct?: number | null;
  note: string;
  verticals?: string[];
  ucp?: {
    at: string;
    available: number;
    withGtin: number;
    gtinWhereCrawlZero: number;
  };
  rows: Array<{
    url: string;
    storeId?: string;
    catalogScore?: number;
    catalogBudget?: number;
    gtinPct?: number;
    offerPct?: number | null;
    captchaHint?: boolean;
    vertical?: string;
    error?: string;
    ucpAvailable?: boolean | null;
    ucpGtinPct?: number | null;
    ucpProducts?: number | null;
    ucpGtinWhereCrawlZero?: boolean;
  }>;
}

export async function apiRankings(): Promise<RankingsResponse | null> {
  try {
    const res = await fetch(`${API}/rankings`);
    if (!res.ok) return null;
    return (await res.json()) as RankingsResponse;
  } catch {
    return null;
  }
}

export async function apiRenderStatus(): Promise<RenderPartnershipStatus | null> {
  try {
    const res = await fetch(`${API}/render/status`);
    if (!res.ok) return null;
    return (await res.json()) as RenderPartnershipStatus;
  } catch {
    return null;
  }
}

export interface AuditCompareResponse {
  ok: true;
  url: string;
  shop?: string;
  headline: string;
  oauthError?: string;
  crawl: {
    label: string;
    productCount: number;
    gtinPct: number;
    catalogScore: number;
    catalogBudget: number;
  };
  oauth?: {
    label: string;
    productCount: number;
    gtinPct: number;
    catalogScore: number;
    catalogBudget: number;
  };
  ucp?: {
    label: string;
    available: boolean;
    productCount: number;
    gtinPct: number;
    tools: string[];
    error?: string;
  };
  delta?: {
    catalogScore: number;
    gtinPct: number;
    productCount: number;
  };
}

export async function apiAuditCompare(
  url: string,
  shop?: string,
): Promise<AuditCompareResponse | null> {
  try {
    const res = await fetch(`${API}/audit/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, shop }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AuditCompareResponse;
  } catch {
    return null;
  }
}

