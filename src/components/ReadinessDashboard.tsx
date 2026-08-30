import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { useShopStore } from '../store/shopStore';

interface ReadinessDashboardProps {
  registeredToolCount: number;
}

export function ReadinessDashboard({
  registeredToolCount,
}: ReadinessDashboardProps) {
  const merchant = useShopStore((s) => s.merchant);
  const setMerchantFlag = useShopStore((s) => s.setMerchantFlag);
  const funnel = useShopStore((s) => s.funnel);

  const checks = computeReadinessChecks(merchant, registeredToolCount);
  const score = readinessScore(checks);

  const funnelCounts = funnel.reduce(
    (acc, e) => {
      acc[e.step] = (acc[e.step] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <section className="readiness" aria-label="Merchant readiness dashboard">
      <header className="readiness__header">
        <div>
          <h2>Agent readiness</h2>
          <p>{merchant.storeName} — merchant view</p>
        </div>
        <div className="readiness__score" data-score={score >= 70 ? 'ok' : 'low'}>
          <span className="readiness__score-value">{score}</span>
          <span className="readiness__score-label">/ 100</span>
        </div>
      </header>

      <ul className="readiness__checks">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`readiness__check readiness__check--${check.status}`}
          >
            <div>
              <strong>{check.label}</strong>
              {check.stat && <span className="readiness__stat">{check.stat}</span>}
            </div>
            <p>{check.detail}</p>
          </li>
        ))}
      </ul>

      <div className="readiness__toggles">
        <h3>Fix agent path (demo)</h3>
        <label className="toggle">
          <input
            type="checkbox"
            checked={merchant.checkoutRequiresCaptcha}
            onChange={(e) =>
              setMerchantFlag('checkoutRequiresCaptcha', e.target.checked)
            }
          />
          CAPTCHA on checkout (blocks ~24% of agents)
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={merchant.checkoutRequiresAccount}
            onChange={(e) =>
              setMerchantFlag('checkoutRequiresAccount', e.target.checked)
            }
          />
          Require account login
        </label>
      </div>

      <div className="readiness__funnel">
        <h3>Agent funnel (this session)</h3>
        <ul>
          {['catalog_search', 'product_view', 'add_to_order', 'checkout_prepare', 'checkout_blocked'].map(
            (step) => (
              <li key={step}>
                <code>{step}</code>
                <span>{funnelCounts[step] ?? 0}</span>
              </li>
            ),
          )}
        </ul>
      </div>

      <blockquote className="readiness__cite">
        Shopify: Catalog-powered AI searches convert <strong>2×</strong> vs scraped
        data. Adobe: AI traffic went from 38% worse to 42% better conversion when
        stores became agent-ready (Mar 2025 → Mar 2026).
      </blockquote>
    </section>
  );
}
