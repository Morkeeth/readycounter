import type { PolicySmoke } from '../types/audit';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const PRIVACY_RE =
  /href=["']([^"']*(?:privacy|privacypolicy|privacy-policy|data-protection)[^"']*)["']/gi;
const TERMS_RE =
  /href=["']([^"']*(?:terms(?:-of-(?:service|use))?|tos|conditions|legal)[^"']*)["']/gi;

function resolveUrl(href: string, origin: string): string | null {
  try {
    const u = new URL(href, origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

function firstMatch(re: RegExp, html: string, origin: string): string | null {
  re.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const resolved = resolveUrl(match[1]!, origin);
    if (resolved) return resolved;
  }
  return null;
}

/** Discover privacy + terms URLs from homepage HTML (footer links). */
export function discoverPolicyUrls(html: string, origin: string): {
  privacyUrl: string | null;
  termsUrl: string | null;
} {
  return {
    privacyUrl: firstMatch(PRIVACY_RE, html, origin),
    termsUrl: firstMatch(TERMS_RE, html, origin),
  };
}

async function headOk(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
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

/** HTTP smoke on discovered policy URLs — honest nulls when not found. */
export async function smokePolicyUrls(
  privacyUrl: string | null,
  termsUrl: string | null,
): Promise<PolicySmoke> {
  if (!privacyUrl && !termsUrl) {
    return {
      privacyUrl: null,
      termsUrl: null,
      privacyOk: null,
      termsOk: null,
      reason: 'No privacy or terms links found on homepage',
    };
  }
  const [privacyOk, termsOk] = await Promise.all([
    privacyUrl ? headOk(privacyUrl) : Promise.resolve(null),
    termsUrl ? headOk(termsUrl) : Promise.resolve(null),
  ]);
  return { privacyUrl, termsUrl, privacyOk, termsOk };
}
