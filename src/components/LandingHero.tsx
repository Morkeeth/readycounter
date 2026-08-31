import { useMemo } from 'react';
import { getSource } from '../data/sources';
import {
  accountWallBecause,
  computeReadinessChecks,
  POINT_BUDGET,
  readinessScore,
  reportedLines,
} from '../lib/readiness';
import { useShopStore } from '../store/shopStore';
import { MerchantJourney } from './MerchantJourney';
import { ReadinessTape } from './ReadinessTape';
import type { JourneyStep } from '../data/journey';

const SEEN_KEY = 'readycounter-hero-seen';

export function hasSeenHero(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markHeroSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private browsing */
  }
}

interface LandingHeroProps {
  onAudit: () => void;
  onReadiness: () => void;
  onShop: () => void;
  onJourneyStep: (step: JourneyStep) => void;
  registeredToolCount: number;
}

export function LandingHero({
  onAudit,
  onReadiness,
  onShop,
  onJourneyStep,
  registeredToolCount,
}: LandingHeroProps) {
  const storeId = useShopStore((s) => s.storeId);
  const merchant = useShopStore((s) => s.merchant);
  const feedPricePatches = useShopStore((s) => s.feedPricePatches);
  const getCatalogProducts = useShopStore((s) => s.getCatalogProducts);
  const products = useMemo(
    () => getCatalogProducts(),
    [getCatalogProducts, storeId, feedPricePatches],
  );

  const checks = computeReadinessChecks(merchant, registeredToolCount, products);
  const reported = reportedLines(registeredToolCount);
  const score = readinessScore(checks);

  const captcha = getSource('presenc_captcha');
  const traffic = getSource('shopify_ai_traffic');
  const abandon = getSource('presenc_abandon');
  const catalog2x = getSource('shopify_catalog_2x');

  const block = merchant.checkoutRequiresCaptcha
    ? { kind: 'A CAPTCHA', because: captcha.claim, sourceId: 'presenc_captcha' as const }
    : merchant.checkoutRequiresAccount
      ? {
          kind: 'A forced account',
          because: accountWallBecause(),
          sourceId: 'presenc_account_wall' as const,
        }
      : null;

  return (
    <section className="landing" aria-label="ReadyCounter">
      <MerchantJourney active="bill" onStep={onJourneyStep} compact />

      <ReadinessTape
        storeName={merchant.storeName}
        storeId={storeId}
        checks={checks}
        reported={reported}
        score={score}
        block={block}
      />

      <div className="landing__copy">
        <h2>
          {score} out of {POINT_BUDGET}. Here is what costs you agent carts.
        </h2>
        <p>
          AI traffic to Shopify is up {traffic.figure}. Agent carts abandon at {abandon.figure}.
          ReadyCounter prints the store as an itemised bill — six weights from one research table,
          not a gauge we tuned. Audit your catalog, preview a fix in sandbox, co-shop the proof.
        </p>

        <ul className="landing__facts">
          <li>
            <b>{traffic.figure}</b>
            <span>AI sessions and orders — {traffic.publisher}</span>
          </li>
          <li>
            <b>{abandon.figure}</b>
            <span>agent cart abandon — {abandon.publisher}</span>
          </li>
          <li>
            <b>{catalog2x.figure}</b>
            <span>catalog AI vs scraped — {catalog2x.publisher}</span>
          </li>
        </ul>

        <div className="landing__actions">
          <button type="button" className="btn btn--primary btn--wide" onClick={onAudit}>
            Audit your storefront
          </button>
          <button type="button" className="btn btn--secondary btn--wide" onClick={onReadiness}>
            Read the bill
          </button>
          <button type="button" className="btn btn--ghost btn--wide" onClick={onShop}>
            Co-shop demo
          </button>
        </div>
        <p className="landing__hint">
          Demo store shown ({storeId}). Paste your URL on Connect — persists on Render KV.
        </p>
      </div>
    </section>
  );
}
