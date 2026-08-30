import type { FunnelEvent, MerchantConfig, OrderState } from '../types/commerce';

export interface SharePayload {
  v: 1;
  order: OrderState;
  merchant: MerchantConfig;
  funnel: FunnelEvent[];
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
    if (data.v !== 1 || !data.order || !data.merchant) return null;
    return data;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const co = encodeSharePayload(payload);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('co', co);
  return url.toString();
}

export function readShareFromLocation(): SharePayload | null {
  const co = new URLSearchParams(window.location.search).get('co');
  if (!co) return null;
  return decodeSharePayload(co);
}

export function clearShareParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('co')) return;
  url.searchParams.delete('co');
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}
