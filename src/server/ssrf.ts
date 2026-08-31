/**
 * SSRF guard for storefront URL audits.
 * Blocks non-https, localhost, private/link-local/metadata addresses, and suspicious hosts.
 */

const BLOCKED_HOSTS = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.google',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

function isIpv4(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const inRange = (start: string, end: string) => n >= ipv4ToInt(start) && n <= ipv4ToInt(end);
  return (
    inRange('0.0.0.0', '0.255.255.255') ||
    inRange('10.0.0.0', '10.255.255.255') ||
    inRange('127.0.0.0', '127.255.255.255') ||
    inRange('169.254.0.0', '169.254.255.255') ||
    inRange('172.16.0.0', '172.31.255.255') ||
    inRange('192.168.0.0', '192.168.255.255') ||
    inRange('100.64.0.0', '100.127.255.255') // CGNAT
  );
}

function isBlockedHostname(hostname: string): string | null {
  const host = hostname.replace(/\.$/, '').toLowerCase();
  if (!host) return 'Empty hostname.';
  if (BLOCKED_HOSTS.has(host)) return `Blocked host: ${host}`;
  if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return `Blocked host suffix: ${host}`;
  }
  if (host === '::1' || host === '[::1]') return 'Blocked loopback.';
  if (isIpv4(host) && isPrivateIpv4(host)) return `Blocked private IP: ${host}`;
  // IPv6 literals — reject non-public-looking for safety
  if (host.includes(':')) return 'Raw IPv6 targets are not allowed for audits.';
  return null;
}

export type SafeUrlResult = { ok: true; url: URL } | { ok: false; error: string };

/** Public https storefront URLs only — used before any server-side fetch. */
export function assertSafeAuditUrl(input: string): SafeUrlResult {
  let url: URL;
  try {
    url = new URL(String(input ?? '').trim());
  } catch {
    return { ok: false, error: 'Invalid URL.' };
  }
  if (url.protocol !== 'https:') {
    return { ok: false, error: 'Only https URLs are allowed for storefront audits.' };
  }
  if (url.username || url.password) {
    return { ok: false, error: 'URLs with credentials are not allowed.' };
  }
  const blocked = isBlockedHostname(url.hostname);
  if (blocked) return { ok: false, error: blocked };
  return { ok: true, url };
}
