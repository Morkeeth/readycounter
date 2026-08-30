import { getStore } from '../data/stores';
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
  onStart: () => void;
  /** Live tool count, so the tape on the landing screen is the real one. */
  registeredToolCount: number;
}

export function LandingHero({ onStart, registeredToolCount }: LandingHeroProps) {
  const storeId = useShopStore((s) => s.storeId);
  const merchant = useShopStore((s) => s.merchant);
  const products = getStore(storeId).products;

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
            'No published figure prices an account wall separately. It closes the same door as a CAPTCHA, so ReadyCounter charges it the same 24 points and says so.',
          sourceId: 'presenc_captcha' as const,
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
          Agents are shopping now and merchants cannot see why they leave.
          ReadyCounter prices the store out of 100 and prints every point as a line
          item — the check that took it, the fix that returns it, and the page the
          weight came from. Then you and your agent share one order in this tab.
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

        <button type="button" className="btn btn--primary btn--wide" onClick={onStart}>
          Open the counter
        </button>
      </div>
    </section>
  );
}
