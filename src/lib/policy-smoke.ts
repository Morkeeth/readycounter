const FETCH_MS = 10_000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export interface PolicySmokeResult {
  /** true = HTTP 2xx, false = found but failed, null = URL not discovered */
  privacyOk: boolean | null;
  termsOk: boolean | null;
  /** false when no policy URLs could be discovered from crawl */
  measured: boolean;
  urls: { privacy?: string; terms?: string };
}

const PRIVACY_RE =
  /(?:privacy(?:-policy)?|data-privacy|personal-information|cookie-policy)/i;
const TERMS_RE = /(?:terms(?:-of-(?:service|use))?|tos|conditions-of-use|legal-notice)/i;

function resolveHref(href: string, origin: string): string | null {
  try {
    if (href.startsWith('//')) return new URL(`https:${href}`).href;
    if (href.startsWith('/')) return new URL(href, origin).href;
    if (/^https?:\/\//i.test(href)) return new URL(href).href;
    return new URL(href, origin).href;
  } catch {
    return null;
  }
}

/** Discover privacy + terms links from homepage HTML (footer/nav anchors). */
export function discoverPolicyUrls(html: string, origin: string): { privacy?: string; terms?: string } {
  const found: { privacy?: string; terms?: string } = {};
  const anchorRe = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) !== null) {
    const href = match[1]?.trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:'))
      continue;
    const text = match[2]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
    const combined = `${href} ${text}`;
    const resolved = resolveHref(href, origin);
    if (!resolved) continue;
    if (!found.privacy && PRIVACY_RE.test(combined)) found.privacy = resolved;
    if (!found.terms && TERMS_RE.test(combined)) found.terms = resolved;
    if (found.privacy && found.terms) break;
  }

  // JSON-LD Organization / WebSite may declare policy URLs
  const jsonLdRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = jsonLdRe.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const data = JSON.parse(raw) as unknown;
      walkJsonLdForPolicies(data, found, origin);
    } catch {
      /* skip */
    }
  }

  return found;
}

function walkJsonLdForPolicies(node: unknown, found: { privacy?: string; terms?: string }, origin: string) {
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj['@graph'])) {
    for (const child of obj['@graph']) walkJsonLdForPolicies(child, found, origin);
  }
  const privacy = obj.privacyPolicy ?? obj.privacy;
  const terms = obj.termsOfService ?? obj.termsOfUse;
  if (!found.privacy && typeof privacy === 'string') {
    const r = resolveHref(privacy, origin);
    if (r) found.privacy = r;
  }
  if (!found.terms && typeof terms === 'string') {
    const r = resolveHref(terms, origin);
    if (r) found.terms = r;
  }
}

async function urlRespondsOk(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** HTTP smoke for discovered policy URLs. Honest nulls when not found. */
export async function runPolicySmoke(html: string, origin: string): Promise<PolicySmokeResult> {
  const urls = discoverPolicyUrls(html, origin);
  const measured = Boolean(urls.privacy || urls.terms);

  let privacyOk: boolean | null = null;
  let termsOk: boolean | null = null;

  if (urls.privacy) privacyOk = await urlRespondsOk(urls.privacy);
  if (urls.terms) termsOk = await urlRespondsOk(urls.terms);

  return { privacyOk, termsOk, measured, urls };
}
