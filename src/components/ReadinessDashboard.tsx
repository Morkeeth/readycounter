import { useMemo } from 'react';
import { getSource, SOURCE_IDS } from '../data/sources';
import type { SourceId } from '../data/sources';
import {
  accountWallBecause,
  agentPayableMethods,
  computeReadinessChecks,
  pointsLost,
  readinessScore,
  reportedLines,
  weightFor,
} from '../lib/readiness';
import { computeAuditFindings } from '../lib/audit-findings';
import { reviewAgainstField } from '../data/field-companion';
import { getStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import { AutopilotPanel } from './AutopilotPanel';
import { AgentJourneyRun } from './AgentJourneyRun';
import { CrawlVsOAuthPanel } from './CrawlVsOAuthPanel';
import { FieldReviewPanel } from './FieldReviewPanel';
import { ReadinessTape } from './ReadinessTape';
import { StorefrontAuditForm } from './StorefrontAuditForm';

interface ReadinessDashboardProps {
  registeredToolCount: number;
  onGoShop?: () => void;
}

const FUNNEL_STEPS = [
  'catalog_search',
  'product_view',
  'add_to_order',
  'checkout_prepare',
  'checkout_blocked',
] as const;

export function ReadinessDashboard({ registeredToolCount, onGoShop }: ReadinessDashboardProps) {
  const merchant = useShopStore((s) => s.merchant);
  const storeId = useShopStore((s) => s.storeId);
  const setMerchantFlag = useShopStore((s) => s.setMerchantFlag);
  const setAgentPayable = useShopStore((s) => s.setAgentPayable);
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
  const storeAudit = getStore(storeId).audit;
  const auditResult = useMemo(
    () =>
      storeAudit
        ? computeAuditFindings(merchant, products, storeAudit, registeredToolCount)
        : null,
    [storeAudit, merchant, products, registeredToolCount, storeId],
  );
  const fieldReview = useMemo(() => {
    if (!storeAudit || !auditResult) return null;
    return reviewAgainstField({
      gtinPct: storeAudit.signals.gtinCoverage,
      captchaHint: storeAudit.signals.captchaHints,
      catalogScore: auditResult.summary.catalogScore,
      productsJsonOk: storeAudit.signals.productsJson || storeAudit.productCount > 0,
      accountWall: storeAudit.signals.accountWallHints || merchant.checkoutRequiresAccount,
    });
  }, [storeAudit, auditResult, merchant.checkoutRequiresAccount]);
  const checks = auditResult
    ? auditResult.findings.filter((f) => (f.maxPoints ?? 0) > 0)
    : computeReadinessChecks(merchant, registeredToolCount, products);
  const reported = auditResult
    ? auditResult.findings.filter((f) => (f.maxPoints ?? 0) === 0)
    : reportedLines(registeredToolCount);
  const score = auditResult ? auditResult.summary.catalogScore : readinessScore(checks);
  const lost = pointsLost(checks);

  const captchaSource = getSource('presenc_captcha');
  const accountSource = getSource('presenc_account_wall');
  const paymentSource = getSource('presenc_payment_method');
  const agentPayable = agentPayableMethods(merchant).length > 0;
  const block = merchant.checkoutRequiresCaptcha
    ? {
        kind: 'A CAPTCHA',
        because: captchaSource.claim,
        sourceId: 'presenc_captcha' as SourceId,
      }
    : merchant.checkoutRequiresAccount
      ? {
          kind: 'A forced account',
          because: accountWallBecause(),
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
      <aside className="readiness__next" aria-label="Next steps">
        <p>
          <strong>Preview</strong> — use Autopilot below to see score deltas (sandbox only).{' '}
          <strong>Prove</strong> —{' '}
          {onGoShop ? (
            <button type="button" className="readiness__next-link" onClick={onGoShop}>
              co-shop with tools on the Shop tab
            </button>
          ) : (
            'co-shop on the Shop tab'
          )}
          .
        </p>
      </aside>
      <article className="integrations__card integrations__card--wide" style={{ marginBottom: '1rem' }}>
        <h3>Audit another storefront</h3>
        <StorefrontAuditForm onSuccess={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      </article>
      {auditResult && auditResult.summary.unmeasuredLineIds.length > 0 ? (
        <p className="integrations__muted" style={{ marginBottom: '1rem' }}>
          Catalog score <strong>{auditResult.summary.catalogScore}</strong> /{' '}
          {auditResult.summary.catalogBudget} pts measured from crawl.{' '}
          {auditResult.summary.unmeasuredLineIds.length} checkout lines need Shopify OAuth or agent
          journey — sandbox score {auditResult.summary.fullScore}/100 would overstate readiness.
        </p>
      ) : null}
      {fieldReview ? (
        <div style={{ marginBottom: '1rem' }}>
          <FieldReviewPanel review={fieldReview} storeLabel={merchant.storeName} />
        </div>
      ) : null}
      <AgentJourneyRun toolCount={registeredToolCount} />
      <CrawlVsOAuthPanel />
      <div className="readiness__grid">
        <ReadinessTape
          storeName={merchant.storeName}
          storeId={storeId}
          checks={checks}
          reported={reported}
          score={score}
          block={block}
        />

        <div className="readiness__side">
          <article className="slab">
            <h3>What the {lost} lost points are</h3>
            <p className="slab__lead">
              Open any line on the tape. It prints the check, the arithmetic, the fix,
              and the page the weight came from — publisher, date published, date read.
              Every weight is a published share; every test behind it is ours and
              stated on the line. Nothing on the tape is a number typed into a
              component.
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
                <em>
                  worth {weightFor('agent_checkout_path')} pts — Presenc AI, read{' '}
                  {captchaSource.accessed}
                </em>
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
                  worth {weightFor('account_wall')} pts — its own row in the same table,
                  Presenc AI, read {accountSource.accessed}
                </em>
              </span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={agentPayable}
                onChange={(e) => setAgentPayable(e.target.checked)}
              />
              <span>
                Accept a method an agent can complete
                <em>
                  worth {weightFor('payment_method')} pts — its own row, Presenc AI,
                  read {paymentSource.accessed}
                </em>
              </span>
            </label>
          </article>

          <article className="slab">
            <h3>Every source this tape can cite</h3>
            <p className="slab__lead">
              {SOURCE_IDS.length} rows in <code>src/data/sources.ts</code>. A figure
              this product <em>cites</em> — a share, a multiple, a survey result —
              cannot be printed without a row here. The figures it measures off your
              catalog are computed live and cite nothing.
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
