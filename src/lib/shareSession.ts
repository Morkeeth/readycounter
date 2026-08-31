import type { StoreDefinition } from '../data/stores';
import { getStore, isBuiltinStore, registerCustomStore } from '../data/stores';
import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';

export interface SharePayload {
  v: 1 | 2;
  storeId: string;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
  /** v2: embedded catalog for imported/custom stores (incognito strangers) */
  store?: StoreDefinition;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return toBase64Url(new TextEncoder().encode(json));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const data = JSON.parse(json) as SharePayload;
    if ((data.v !== 1 && data.v !== 2) || !data.order || !data.merchant) return null;
    if (!data.storeId) data.storeId = 'ember-oak';
    /*
     * A link built before 2026-08-31 encodes a merchant with no
     * `paymentMethods`, because the field did not exist. Left alone, the
     * recipient would see a store that accepts a card on file score 0/11 on the
     * payment line and be told, on a judge-facing screen, that it has no route
     * an agent can complete. Backfill from the store definition for a built-in
     * store; a custom store that genuinely declares none still scores 0, which
     * is the true answer for it.
     */
    if (!data.merchant.paymentMethods && isBuiltinStore(data.storeId)) {
      data.merchant = {
        ...data.merchant,
        paymentMethods: getStore(data.storeId).merchant.paymentMethods,
      };
    }
    return data;
  } catch {
    return null;
  }
}

/** Build share payload — embeds full store for custom/imported catalogs. */
export function buildSharePayload(input: {
  storeId: string;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
}): SharePayload {
  const payload: SharePayload = {
    v: 2,
    storeId: input.storeId,
    order: input.order,
    merchant: input.merchant,
    funnel: input.funnel,
  };
  if (!isBuiltinStore(input.storeId)) {
    payload.store = getStore(input.storeId);
  }
  return payload;
}

export function applySharePayload(payload: SharePayload): void {
  if (payload.store) {
    registerCustomStore(payload.store);
  }
}

export function buildShareUrl(input: {
  storeId: string;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
}): string {
  const payload = buildSharePayload(input);
  const co = encodeSharePayload(payload);
  const url = new URL(window.location.href);
  url.searchParams.set('store', payload.storeId);
  url.searchParams.set('co', co);
  return url.toString();
}

export function hydrateShareAtBoot(): SharePayload | null {
  if (typeof window === 'undefined') return null;
  const co = new URLSearchParams(window.location.search).get('co');
  if (!co) return null;
  const payload = decodeSharePayload(co);
  if (!payload) return null;
  applySharePayload(payload);
  return payload;
}

export function readShareFromLocation(): SharePayload | null {
  const co = new URLSearchParams(window.location.search).get('co');
  if (!co) return null;
  const payload = decodeSharePayload(co);
  if (payload) applySharePayload(payload);
  return payload;
}

export function clearShareParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('co')) return;
  url.searchParams.delete('co');
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}
