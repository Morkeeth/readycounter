import { useMemo } from 'react';
import { getSource } from '../data/sources';
import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { useShopStore } from '../store/shopStore';
import { ReadinessTape } from './ReadinessTape';

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
  /** Straight to the catalog. */
  onShop: () => void;
  /** Straight to the merchant tape. */
  onReadiness: () => void;
  /** Live tool count, so the tape on the landing screen is the real one. */
  registeredToolCount: number;
}

export function LandingHero({ onShop, onReadiness, registeredToolCount }: LandingHeroProps) {
  const storeId = useShopStore((s) => s.storeId);
  const merchant = useShopStore((s) => s.merchant);
  /*
   * `useShopStore((s) => s.getCatalogProducts())` returns a NEW array on every
   * call, so useSyncExternalStore sees a new snapshot each pass and React tears
   * the tab down with error #185. Subscribe to the state the catalog is derived
   * from, and call the getter during render instead.
   */
  const feedPricePatches = useShopStore((s) => s.feedPricePatches);
  const getCatalogProducts = useShopStore((s) => s.getCatalogProducts);
  const products = useMemo(
    () => getCatalogProducts(),
    [getCatalogProducts, storeId, feedPricePatches],
  );

  // The landing tape is not a mock. It is this store, scored right now.
  const checks = computeReadinessChecks(merchant, registeredToolCount, products);
  const score = readinessScore(checks);

  const captcha = getSource('presenc_captcha');
  const traffic = getSource('shopify_ai_traffic');
  const abandon = getSource('presenc_abandon');
  const trust = getSource('yougov_trust_gap');

  const block = merchant.checkoutRequiresCaptcha
    ? { kind: 'A CAPTCHA', because: captcha.claim, sourceId: 'presenc_captcha' as const }
    : merchant.checkoutRequiresAccount
      ? {
          kind: 'A forced account',
          because:
            'Presenc AI gives a required account or login its own row in the same table it prices the CAPTCHA on: 15% of abandoned agent carts. ReadyCounter charges exactly 15 points. Every checkout wall on this tape costs the share its own published row states — none of it is a number we picked.',
          sourceId: 'presenc_account_wall' as const,
        }
      : null;

  return (
    <section className="landing" aria-label="ReadyCounter">
      <ReadinessTape
        storeName={merchant.storeName}
        storeId={storeId}
        checks={checks}
        score={score}
        block={block}
      />

      <div className="landing__copy">
        <h2>Your store scores {score} to an agent. Here is the bill.</h2>
        <p>
          Assistants are shopping now and merchants cannot see why they leave.
          ReadyCounter prices the store out of 100 and prints every point as a line
          item — the check that took it, the fix that returns it, and the page the
          weight came from. Then you and your assistant share one order in this tab.
        </p>

        <ul className="landing__facts">
          <li>
            <b>{traffic.figure}</b>
            <span>{traffic.claim} — {traffic.publisher}</span>
          </li>
          <li>
            <b>{abandon.figure}</b>
            <span>{abandon.claim} — {abandon.publisher}</span>
          </li>
          <li>
            <b>{trust.figure}</b>
            <span>{trust.claim} — {trust.publisher}</span>
          </li>
        </ul>

        <div className="landing__actions">
          <button type="button" className="btn btn--primary btn--wide" onClick={onShop}>
            Start shopping
          </button>
          <button type="button" className="btn btn--secondary btn--wide" onClick={onReadiness}>
            Open the readiness bill
          </button>
        </div>
      </div>
    </section>
  );
}
