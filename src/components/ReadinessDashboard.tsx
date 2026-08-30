import { useMemo } from 'react';
import { getSource, SOURCE_IDS } from '../data/sources';
import type { SourceId } from '../data/sources';
import { computeReadinessChecks, pointsLost, readinessScore } from '../lib/readiness';
import { useShopStore } from '../store/shopStore';
import { AutopilotPanel } from './AutopilotPanel';
import { ReadinessTape } from './ReadinessTape';

interface ReadinessDashboardProps {
  registeredToolCount: number;
}

const FUNNEL_STEPS = [
  'catalog_search',
  'product_view',
  'add_to_order',
  'checkout_prepare',
  'checkout_blocked',
] as const;

export function ReadinessDashboard({ registeredToolCount }: ReadinessDashboardProps) {
  const merchant = useShopStore((s) => s.merchant);
  const storeId = useShopStore((s) => s.storeId);
  const setMerchantFlag = useShopStore((s) => s.setMerchantFlag);
  const funnel = useShopStore((s) => s.funnel);

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
  const checks = computeReadinessChecks(merchant, registeredToolCount, products);
  const score = readinessScore(checks);
  const lost = pointsLost(checks);

  const captchaSource = getSource('presenc_captcha');
  const accountSource = getSource('presenc_account_wall');
  const block = merchant.checkoutRequiresCaptcha
    ? {
        kind: 'A CAPTCHA',
        because: captchaSource.claim,
        sourceId: 'presenc_captcha' as SourceId,
      }
    : merchant.checkoutRequiresAccount
      ? {
          kind: 'A forced account',
          because:
            'Presenc AI gives a required account or login its own row in the same table it prices the CAPTCHA on: 15% of abandoned agent carts. ReadyCounter charges exactly 15 points. Every checkout wall on this tape costs the share its own published row states — none of it is a number we picked.',
          sourceId: 'presenc_account_wall' as SourceId,
        }
      : null;

  const counts = funnel.reduce<Record<string, number>>((acc, e) => {
    acc[e.step] = (acc[e.step] ?? 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(1, ...FUNNEL_STEPS.map((s) => counts[s] ?? 0));
  const totalEvents = funnel.length;

  return (
    <section className="readiness" aria-label="Merchant readiness">
      <div className="readiness__grid">
        <ReadinessTape
          storeName={merchant.storeName}
          storeId={storeId}
          checks={checks}
          score={score}
          block={block}
        />

        <div className="readiness__side">
          <article className="slab">
            <h3>What the {lost} lost points are</h3>
            <p className="slab__lead">
              Open any line on the tape. It prints the check, the arithmetic, the fix,
              and the page the weight came from — publisher, date published, date read.
              Nothing on the tape is a number typed into a component.
            </p>
          </article>

          <AutopilotPanel toolCount={registeredToolCount} />

          <article className="slab">
            <h3>Change the store, watch the tape</h3>
            <label className="switch">
              <input
                type="checkbox"
                checked={merchant.checkoutRequiresCaptcha}
                onChange={(e) => setMerchantFlag('checkoutRequiresCaptcha', e.target.checked)}
              />
              <span>
                CAPTCHA on checkout
                <em>worth 24 pts — Presenc AI, read {captchaSource.accessed}</em>
              </span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={merchant.checkoutRequiresAccount}
                onChange={(e) => setMerchantFlag('checkoutRequiresAccount', e.target.checked)}
              />
              <span>
                Require an account
                <em>
                  worth 15 pts — its own row in the same table, Presenc AI, read{' '}
                  {accountSource.accessed}
                </em>
              </span>
            </label>
          </article>

          <article className="slab">
            <h3>Every source this tape can cite</h3>
            <p className="slab__lead">
              {SOURCE_IDS.length} rows in <code>src/data/sources.ts</code>. A figure
              with no row here cannot be printed anywhere in the product.
            </p>
            <ul className="register">
              {SOURCE_IDS.map((id) => {
                const src = getSource(id);
                return (
                  <li key={id}>
                    <a href={src.url} target="_blank" rel="noreferrer">
                      {src.publisher}
                    </a>
                    <b>{src.figure}</b>
                    <span>
                      published {src.published} · read {src.accessed}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="slab">
            <h3>Agent funnel · {totalEvents} events this session</h3>
            {totalEvents === 0 ? (
              <p className="slab__empty">
                Nothing has happened yet. Add an item, or run a tool in the judge
                harness, and the steps below start counting.
              </p>
            ) : null}
            <ul className="funnel">
              {FUNNEL_STEPS.map((step) => {
                const count = counts[step] ?? 0;
                return (
                  <li key={step} className={count === 0 ? 'funnel__row funnel__row--zero' : 'funnel__row'}>
                    <code>{step}</code>
                    <span className="funnel__track">
                      <span
                        className="funnel__bar"
                        style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                      />
                    </span>
                    <span className="funnel__count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
