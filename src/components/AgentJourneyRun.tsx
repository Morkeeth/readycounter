import { useMemo, useState } from 'react';
import { simulateAgentJourney } from '../lib/agent-journey';
import { getSource } from '../data/sources';
import { useShopStore } from '../store/shopStore';

interface AgentJourneyRunProps {
  toolCount: number;
}

export function AgentJourneyRun({ toolCount }: AgentJourneyRunProps) {
  const [ran, setRan] = useState(false);
  const merchant = useShopStore((s) => s.merchant);
  const storeId = useShopStore((s) => s.storeId);
  const feedPricePatches = useShopStore((s) => s.feedPricePatches);
  const getCatalogProducts = useShopStore((s) => s.getCatalogProducts);
  const products = useMemo(
    () => getCatalogProducts(),
    [getCatalogProducts, storeId, feedPricePatches],
  );

  const journey = useMemo(
    () => (ran ? simulateAgentJourney(useShopStore.getState(), toolCount) : null),
    [ran, merchant, products, toolCount, storeId],
  );

  const captcha = getSource('presenc_captcha');

  return (
    <article className="journey-run integrations__card integrations__card--wide">
      <h3>Run agent journey</h3>
      <p>
        One click: search → add → order → <code>prepare_checkout</code>. Same path the WebMCP tools
        take — no dev console required.
      </p>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => setRan(true)}
        aria-expanded={ran}
      >
        {ran ? 'Re-run journey' : 'Run agent journey'}
      </button>

      {journey ? (
        <div className="journey-run__result" role="status">
          <p className="journey-run__score">
            Readiness <strong>{journey.readinessScore}</strong>/100 · checkout{' '}
            <strong>{journey.checkoutBlocked ? 'blocked' : 'clear'}</strong>
          </p>
          <ol className="journey-run__steps">
            {journey.steps.map((step) => (
              <li
                key={step.tool}
                className={step.ok ? 'journey-run__step--ok' : 'journey-run__step--fail'}
              >
                <code>{step.tool}</code>
                <span>{step.ok ? 'pass' : 'fail'}</span>
              </li>
            ))}
          </ol>
          <p className="journey-run__rec">{journey.recommendation}</p>
          {journey.checkoutBlocked && merchant.checkoutRequiresCaptcha ? (
            <p className="integrations__muted">
              CAPTCHA wall — {captcha.figure} of abandoned agent carts ({captcha.publisher}). Try
              Autopilot below to preview clearing it in sandbox.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
