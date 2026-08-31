/**
 * Research-backed launch kit — recommendations, test cases, demo beats, impact.
 * Every figure resolves to `src/data/sources.ts` + `research.md`.
 */

import type { SourceId } from './sources';

export interface LaunchRecommendation {
  id: string;
  priority: number;
  title: string;
  merchantAction: string;
  /** Presenc row or research claim this maps to. */
  sourceIds: SourceId[];
  /** ReadyCounter weight when applicable. */
  maxPoints?: number;
  /** What we measured on real stores (2026-08-31 batch). */
  fieldEvidence: string;
}

export interface LaunchTestCase {
  id: string;
  name: string;
  kind: 'sandbox' | 'url-audit' | 'api' | 'autopilot';
  steps: string[];
  passWhen: string;
  /** Deep link or command. */
  entry?: string;
}

export interface LaunchImpact {
  id: string;
  headline: string;
  figure: string;
  sourceId: SourceId;
  /** How ReadyCounter proves it — not marketing fluff. */
  productProof: string;
}

export interface DemoBeat {
  atSec: number;
  action: string;
  say: string;
  show: string;
}

/** Ordered by Presenc abandonment share + batch audit signal strength. */
export const LAUNCH_RECOMMENDATIONS: LaunchRecommendation[] = [
  {
    id: 'gtin-every-sku',
    priority: 1,
    title: 'Publish GTIN/barcode on every SKU agents can discover',
    merchantAction:
      'Fill barcodes in Shopify Admin; expose them in products.json or JSON-LD Offer blocks.',
    sourceIds: ['shopify_catalog_2x', 'schema_offer_gap', 'presenc_page_structure'],
    maxPoints: 6,
    fieldEvidence:
      '78/148 DTC storefronts crawled (2026-08-31 v4 batch): 0% GTIN in public products.json — catalog legibility 0/24 on all.',
  },
  {
    id: 'remove-captcha',
    priority: 2,
    title: 'Remove CAPTCHA from the agent checkout path',
    merchantAction:
      'Allow bot-class traffic through checkout or offer an agent-specific flow; confirm with prepare_checkout journey.',
    sourceIds: ['presenc_captcha'],
    maxPoints: 24,
    fieldEvidence:
      'ember-oak sandbox: CAPTCHA wall costs 24 pts (70→94 when cleared). HTML captcha hints on 5/6 crawled stores.',
  },
  {
    id: 'guest-checkout',
    priority: 3,
    title: 'Allow guest checkout — no forced account',
    merchantAction: 'Enable guest checkout in Shopify; remove login wall before payment.',
    sourceIds: ['presenc_account_wall'],
    maxPoints: 15,
    fieldEvidence: 'neon-matcha sandbox: account wall costs 15 pts (65→80 when cleared).',
  },
  {
    id: 'sync-feed-prices',
    priority: 4,
    title: 'Keep agent feed prices aligned with shelf price',
    merchantAction:
      'Export a separate agent/catalog feed or OAuth-sync Admin API; mismatches fail the 18% row.',
    sourceIds: ['presenc_price_mismatch'],
    maxPoints: 18,
    fieldEvidence:
      'neon-matcha ships deliberate feed/shelf drift — autopilot sync_feed_prices clears the line.',
  },
  {
    id: 'agent-payment',
    priority: 5,
    title: 'Accept at least one agent-completable payment method',
    merchantAction: 'Declare stored-credential or tokenized methods agents can complete without a human card tap.',
    sourceIds: ['presenc_payment_method'],
    maxPoints: 11,
    fieldEvidence: 'neon-matcha: no agent-payable method → 0/11 until enable_agent_payment fix.',
  },
  {
    id: 'fresh-checkout',
    priority: 6,
    title: 'Prove price/stock at checkout matches what the agent saw',
    merchantAction: 'Connect Shopify OAuth + run agent journey; stale data is the largest Presenc row (26%).',
    sourceIds: ['presenc_stale_feed'],
    maxPoints: 26,
    fieldEvidence: 'URL crawl cannot score this line — marked NOT MEASURED until OAuth + journey.',
  },
];

export const LAUNCH_TEST_CASES: LaunchTestCase[] = [
  {
    id: 'tc-sandbox-captcha',
    name: 'CAPTCHA wall prices at Presenc 24%',
    kind: 'sandbox',
    entry: '/?store=ember-oak&view=merchant',
    steps: [
      'Open ember-oak readiness tape',
      'Find agent_checkout_path line — should be 0/24',
      'Open Autopilot → Remove CAPTCHA',
      'Confirm score rises 70 → 94',
    ],
    passWhen: 'CAPTCHA line clears and delta equals weightFor(agent_checkout_path) = 24',
  },
  {
    id: 'tc-sandbox-account',
    name: 'Account wall prices at Presenc 15%',
    kind: 'sandbox',
    entry: '/?store=neon-matcha&view=merchant',
    steps: [
      'Open neon-matcha readiness tape',
      'Find account_wall line — should be 0/15',
      'Autopilot → Remove forced account login',
      'Confirm score rises 65 → 80',
    ],
    passWhen: 'Account line clears and delta equals 15, distinct from CAPTCHA delta',
  },
  {
    id: 'tc-url-audit-gtin',
    name: 'Real storefront crawl — GTIN gap',
    kind: 'url-audit',
    entry: 'POST /api/v1/audit/url { "url": "https://colourpop.com" }',
    steps: [
      'Audit colourpop.com (or Connect tab paste)',
      'Read catalogScore vs fullScore — crawl must not inflate checkout lines',
      'page_structure line cites 0% GTIN from products.json',
    ],
    passWhen: 'catalogScore reflects scraped legibility only; checkout lines show NOT MEASURED',
  },
  {
    id: 'tc-url-blocked',
    name: 'Blocked crawl → OAuth fallback',
    kind: 'url-audit',
    entry: 'POST /api/v1/audit/url { "url": "https://www.gymshark.com" }',
    steps: ['Attempt gymshark.com audit', 'Expect 422 — products.json blocked'],
    passWhen: 'Error message recommends Shopify OAuth for full catalog',
  },
  {
    id: 'tc-sandbox-chaos',
    name: 'Multi-wall disaster — chaos-pets',
    kind: 'sandbox',
    entry: '/?store=chaos-pets&view=merchant',
    steps: [
      'Open chaos-pets — CAPTCHA + account + no agent payment',
      'Run agent journey — fails at checkout',
      'Score should be lowest in the roster',
    ],
    passWhen: 'CAPTCHA 0/24 · account 0/15 · payment 0/11 · score unique vs other stores',
  },
  {
    id: 'tc-sandbox-paradise',
    name: 'Golden path — agent-paradise',
    kind: 'sandbox',
    entry: '/?store=agent-paradise&view=merchant',
    steps: [
      'Open agent-paradise readiness tape',
      'Every charged line should pass',
      'Run agent journey — checkout clear',
    ],
    passWhen: 'Score 100/100 · journey checkoutBlocked false',
  },
  {
    id: 'tc-sandbox-feed-drift',
    name: 'Feed drift — midnight-vinyl',
    kind: 'sandbox',
    entry: '/?store=midnight-vinyl&view=merchant',
    steps: [
      'Find feed_price_match line partial (4 SKUs drift)',
      'Autopilot → Sync feed prices',
      'Score rises when drift cleared',
    ],
    passWhen: 'feed_price_match < 18/18 before sync · full after autopilot',
  },
  {
    id: 'tc-sandbox-stale-shelf',
    name: 'Stale shelf — ghost-goods',
    kind: 'sandbox',
    entry: '/?store=ghost-goods&view=merchant',
    steps: [
      '5/8 SKUs out of stock',
      'checkout_freshness line partial — Presenc 26% row',
    ],
    passWhen: 'checkout_freshness below 26/26 · unique score vs ember/neon',
  },
  {
    id: 'tc-ucp-compare',
    name: 'Three discovery paths — crawl vs UCP vs Admin',
    kind: 'url-audit',
    entry: 'POST /api/v1/audit/compare { "url": "https://colourpop.com" }',
    steps: ['Compare returns crawl + ucp rows', 'Headline mentions GTIN or UCP'],
    passWhen: 'ucp.available true on colourpop · crawl gtinPct defined',
  },
  {
    id: 'tc-rankings-batch',
    name: 'Field rankings batch live',
    kind: 'api',
    entry: 'GET /api/v1/rankings',
    steps: ['shopCount >= 50 attempted', 'succeeded >= 30'],
    passWhen: 'rows array populated from Render KV',
  },
  {
    id: 'tc-api-production',
    name: 'Production stack healthy',
    kind: 'api',
    entry: 'npm run test:e2e',
    steps: [
      'GET /api/v1/health — kv.backend redis, shopify configured',
      'GET /api/v1/tools — 18 tools',
      'GET /api/v1/companion — handbook payload',
      'GET /api/v1/render/status — KV connected + audit batch',
    ],
    passWhen: 'All Playwright smoke tests green on production URL',
  },
  {
    id: 'tc-autopilot-impact',
    name: 'Autopilot cites research on every fix',
    kind: 'autopilot',
    entry: '/?store=ember-oak — Autopilot tab',
    steps: [
      'Each fix card impact string quotes Presenc % for its row',
      'Apply fix updates sandbox only — live Shopify unchanged',
    ],
    passWhen: 'Impact strings match weightFor() and source figures',
  },
];

export const LAUNCH_IMPACT: LaunchImpact[] = [
  {
    id: 'ai-traffic-up',
    headline: 'AI traffic is already here',
    figure: '8× sessions · ~13× orders YoY',
    sourceId: 'shopify_ai_traffic',
    productProof: 'Landing hero + readiness tape — merchants audit before the wave hits checkout.',
  },
  {
    id: 'agent-abandon',
    headline: 'Agents abandon more than humans',
    figure: '78.6% agent cart abandon',
    sourceId: 'presenc_abandon',
    productProof: 'Six-line bill maps 100 pts to Presenc causes table — no invented weights.',
  },
  {
    id: 'catalog-beats-scrape',
    headline: 'Structured catalog wins',
    figure: '2× conversion vs scraped AI search',
    sourceId: 'shopify_catalog_2x',
    productProof: 'URL audit + OAuth pull real catalog; batch showed 0% GTIN on public feeds.',
  },
  {
    id: 'trust-gap',
    headline: 'Shoppers trust compare, not auto-buy',
    figure: '65% compare · 14% auto-order',
    sourceId: 'yougov_trust_gap',
    productProof: 'Co-shop keeps human in tab; prepare_checkout never charges a card.',
  },
  {
    id: 'batch-gtin-gap',
    headline: 'Field audit — DTC GTIN gap',
    figure: '0% GTIN on 34/34 crawled Shopify feeds',
    sourceId: 'schema_offer_gap',
    productProof: 'research/HANDBOOK.md — 10 pressing issues + ReadyCounter 0% GTIN field receipt',
  },
  {
    id: 'fix-captcha-recovery',
    headline: 'One wall, measurable recovery',
    figure: '+24 pts when CAPTCHA cleared',
    sourceId: 'presenc_captcha',
    productProof: 'ember-oak autopilot: 70 → 94 in sandbox; verify-readiness asserts delta.',
  },
];

/** ~90s demo script for Devpost / outbound video. */
export const DEMO_BEATS: DemoBeat[] = [
  {
    atSec: 0,
    action: 'Open live URL — default ember-oak landing tape',
    say: 'Agents are shopping your store right now. This is the bill — seventy out of one hundred.',
    show: 'Readiness tape with CAPTCHA line at 0/24 citing Presenc AI',
  },
  {
    atSec: 15,
    action: 'Click Open the readiness bill',
    say: 'Every point maps to a published abandonment share — twenty-four percent for CAPTCHA alone.',
    show: 'Expanded tape + source stamps',
  },
  {
    atSec: 30,
    action: 'Connect tab → paste colourpop.com → Audit',
    say: 'Paste any Shopify URL — we crawl products.json and score what agents can actually read.',
    show: 'Catalog score honest vs checkout NOT MEASURED',
  },
  {
    atSec: 45,
    action: 'Connect → DTC rankings table + scroll batch stats',
    say: 'We batch-audited fifty-eight DTC stores. Thirty-four crawled; zero percent had barcodes in the public feed agents read.',
    show: 'Rankings panel + GET /api/v1/render/status',
  },
  {
    atSec: 52,
    action: 'Readiness → Run agent journey on ember-oak',
    say: 'One click walks the agent path — search, add, checkout. Blocked at CAPTCHA — twenty-four percent of abandoned carts.',
    show: 'AgentJourneyRun step list + CHECKOUT VOID stamp',
  },
  {
    atSec: 58,
    action: 'After URL audit → Three discovery paths compare',
    say: 'Public crawl versus Shopify UCP versus Admin OAuth — same bill, three ways agents discover catalog.',
    show: 'CrawlVsOAuthPanel three-row table',
  },
  {
    atSec: 65,
    action: 'Autopilot → Remove CAPTCHA on ember-oak',
    say: 'Preview the fix in sandbox — ninety-four. Your live Shopify is untouched until you act.',
    show: 'Score animation 70 → 94',
  },
  {
    atSec: 72,
    action: 'Shop tab → add SKU → copy co-shop link',
    say: 'Co-shop proves the agent path — sixteen WebMCP tools; human stays in the tab, no card charged.',
    show: '?co= share link · WebMCP badge if flag on',
  },
  {
    atSec: 82,
    action: 'Connect → Render partnership card',
    say: 'Catalog and sessions persist on Render Key Value — the audit link works tomorrow.',
    show: 'GET /api/v1/render/status',
  },
  {
    atSec: 90,
    action: 'Close on landing research facts',
    say: 'Shopify says catalog-powered AI converts two-x. ReadyCounter shows what is blocking yours.',
    show: '8× traffic · 78.6% abandon · Shopify 2× stat',
  },
];

export const LAUNCH_ONE_LINER =
  'Research-priced agent abandonment bill + real catalog audit + co-shop proof — Shopify catalog in, Render persistence out.';
