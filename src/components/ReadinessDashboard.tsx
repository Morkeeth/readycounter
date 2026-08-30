import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { useShopStore } from '../store/shopStore';

interface ReadinessDashboardProps {
  registeredToolCount: number;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = circumference - progress * circumference;
  const tone = score >= 70 ? 'ok' : score >= 50 ? 'mid' : 'low';

  return (
    <div className="score-ring" data-tone={tone} aria-label={`Readiness score ${score} out of 100`}>
      <svg className="score-ring__svg" viewBox="0 0 120 120" role="img">
        <circle
          className="score-ring__track"
          cx="60"
          cy="60"
          r={normalizedRadius}
          strokeWidth={stroke}
        />
        <circle
          className="score-ring__fill"
          cx="60"
          cy="60"
          r={normalizedRadius}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="score-ring__center">
        <span className="score-ring__value">{score}</span>
        <span className="score-ring__label">/ 100</span>
        <span className="score-ring__caption">agent ready</span>
      </div>
    </div>
  );
}

export function ReadinessDashboard({
  registeredToolCount,
}: ReadinessDashboardProps) {
  const merchant = useShopStore((s) => s.merchant);
  const setMerchantFlag = useShopStore((s) => s.setMerchantFlag);
  const funnel = useShopStore((s) => s.funnel);

  const checks = computeReadinessChecks(merchant, registeredToolCount);
  const score = readinessScore(checks);

  const funnelSteps = [
    'catalog_search',
    'product_view',
    'add_to_order',
    'checkout_prepare',
    'checkout_blocked',
  ] as const;

  const funnelCounts = funnel.reduce(
    (acc, e) => {
      acc[e.step] = (acc[e.step] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const maxFunnel = Math.max(1, ...funnelSteps.map((s) => funnelCounts[s] ?? 0));

  return (
    <section className="readiness" aria-label="Merchant readiness dashboard">
      <header className="readiness__header">
        <div>
          <h2>Agent readiness</h2>
          <p>{merchant.storeName} — merchant view</p>
        </div>
        <ScoreRing score={score} />
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
        <ul className="funnel-strip">
          {funnelSteps.map((step) => {
            const count = funnelCounts[step] ?? 0;
            const width = Math.round((count / maxFunnel) * 100);
            return (
              <li key={step} className="funnel-strip__row">
                <code className="funnel-strip__step">{step}</code>
                <div className="funnel-strip__bar-wrap">
                  <div
                    className="funnel-strip__bar"
                    style={{ width: count === 0 ? '4%' : `${Math.max(width, 8)}%` }}
                  />
                </div>
                <span className="funnel-strip__count">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <blockquote className="readiness__cite">
        Shopify: Catalog-powered AI searches convert <strong>2×</strong> vs scraped
        data. Adobe: AI traffic went from 38% worse to 42% better conversion when
        stores became agent-ready (Mar 2025 → Mar 2026). See repo{' '}
        <code>research.md</code>.
      </blockquote>
    </section>
  );
}
