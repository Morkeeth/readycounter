const FETCH_MS = 10_000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export interface PolicySmokeResult {
  /** False when no privacy or terms URLs were discoverable from the crawl. */
  measurable: boolean;
  /** HTTP 2xx/3xx when URL found; null when not discovered. */
  privacyOk: boolean | null;
  termsOk: boolean | null;
  urls: {
    privacy?: string;
    terms?: string;
  };
  note?: string;
}

const PRIVACY_HREF = /\/(?:policies\/)?(?:privacy(?:-policy|-notice)?|legal\/privacy|pages\/privacy)/i;
const TERMS_HREF =
  /\/(?:policies\/)?(?:terms(?:-of-(?:service|use|sale))?|legal\/terms|pages\/terms|tos)/i;
const PRIVACY_TEXT = /\bprivacy(?:\s+policy|\s+notice)?\b/i;
const TERMS_TEXT = /\bterms(?:\s+of\s+(?:service|use|sale))?|\bterms\s*&\s*conditions\b/i;

function resolveHref(href: string, origin: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('javascript:') || trimmed.startsWith('mailto:')) {
    return null;
  }
  try {
    return new URL(trimmed, origin).href;
  } catch {
    return null;
  }
}

/** Discover privacy + terms URLs from homepage HTML (footer/nav anchors). Exported for verify. */
export function discoverPolicyUrls(html: string, origin: string): { privacy?: string; terms?: string } {
  const found: { privacy?: string; terms?: string } = {};
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const href = match[1] ?? '';
    const text = stripTags(match[2] ?? '');
    const resolved = resolveHref(href, origin);
    if (!resolved) continue;

    if (!found.privacy && (PRIVACY_HREF.test(href) || PRIVACY_TEXT.test(text))) {
      found.privacy = resolved;
    }
    if (!found.terms && (TERMS_HREF.test(href) || TERMS_TEXT.test(text))) {
      found.terms = resolved;
    }
    if (found.privacy && found.terms) break;
  }

  // Shopify often omits footer on first paint — scan raw hrefs without anchor text
  if (!found.privacy || !found.terms) {
    const hrefRe = /\bhref=["']([^"']+)["']/gi;
    while ((match = hrefRe.exec(html)) !== null) {
      const href = match[1] ?? '';
      const resolved = resolveHref(href, origin);
      if (!resolved) continue;
      if (!found.privacy && PRIVACY_HREF.test(href)) found.privacy = resolved;
      if (!found.terms && TERMS_HREF.test(href)) found.terms = resolved;
    }
  }

  return found;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function probeUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** HTTP GET smoke for discovered policy URLs. Honest when none found. */
export async function runPolicySmoke(html: string, origin: string): Promise<PolicySmokeResult> {
  const urls = discoverPolicyUrls(html, origin);
  const hasPrivacy = Boolean(urls.privacy);
  const hasTerms = Boolean(urls.terms);

  if (!hasPrivacy && !hasTerms) {
    return {
      measurable: false,
      privacyOk: null,
      termsOk: null,
      urls: {},
      note: 'not measurable — no privacy or terms URLs found in crawled HTML',
    };
  }

  const [privacyOk, termsOk] = await Promise.all([
    hasPrivacy ? probeUrl(urls.privacy!) : Promise.resolve(null),
    hasTerms ? probeUrl(urls.terms!) : Promise.resolve(null),
  ]);

  return {
    measurable: true,
    privacyOk,
    termsOk,
    urls,
    note:
      privacyOk === false || termsOk === false
        ? 'policy URL discovered but HTTP check failed'
        : undefined,
  };
}
