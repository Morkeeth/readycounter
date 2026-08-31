/**
 * ACP Instant Checkout policy smoke — privacy + ToS URLs must be live.
 * @see field-companion issue acp-eligibility (handbook #8)
 */

const FETCH_MS = 8_000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const PRIVACY_PATHS = [
  '/policies/privacy-policy',
  '/pages/privacy-policy',
  '/privacy',
  '/privacy-policy',
];

const TERMS_PATHS = [
  '/policies/terms-of-service',
  '/pages/terms-of-service',
  '/terms',
  '/terms-of-service',
];

export interface AcpPolicyProbe {
  privacyUrl: string | null;
  termsUrl: string | null;
  privacyOk: boolean;
  termsOk: boolean;
  /** Both policy URLs responded 2xx — minimum for ACP checkout eligibility. */
  policyReady: boolean;
  checkedAt: string;
  issueId: 'acp-eligibility';
}

async function urlResponds(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA },
      redirect: 'follow',
    });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 403) {
      const getRes = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' },
        redirect: 'follow',
      });
      return getRes.ok;
    }
    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function firstLive(origin: string, paths: string[]): Promise<string | null> {
  for (const p of paths) {
    const url = `${origin}${p}`;
    if (await urlResponds(url)) return url;
  }
  return null;
}

/** Probe Shopify-style policy URLs on a storefront origin. */
export async function probeAcpPolicies(storeUrl: string): Promise<AcpPolicyProbe> {
  let origin: string;
  try {
    origin = new URL(storeUrl.trim()).origin;
  } catch {
    return {
      privacyUrl: null,
      termsUrl: null,
      privacyOk: false,
      termsOk: false,
      policyReady: false,
      checkedAt: new Date().toISOString(),
      issueId: 'acp-eligibility',
    };
  }

  const [privacyUrl, termsUrl] = await Promise.all([
    firstLive(origin, PRIVACY_PATHS),
    firstLive(origin, TERMS_PATHS),
  ]);

  return {
    privacyUrl,
    termsUrl,
    privacyOk: privacyUrl !== null,
    termsOk: termsUrl !== null,
    policyReady: privacyUrl !== null && termsUrl !== null,
    checkedAt: new Date().toISOString(),
    issueId: 'acp-eligibility',
  };
}
