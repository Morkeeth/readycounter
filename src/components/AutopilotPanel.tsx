import { useMemo } from 'react';
import { suggestFixes } from '../lib/autopilot';
import { simulateAgentJourney } from '../lib/agent-journey';
import { useShopStore } from '../store/shopStore';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';

export function AutopilotPanel({ toolCount }: { toolCount: number }) {
  const merchant = useShopStore((s) => s.merchant);
  const products = useShopStore((s) => s.getCatalogProducts());
  const applyReadinessFix = useShopStore((s) => s.applyReadinessFix);

  const suggestions = useMemo(
    () => suggestFixes([], merchant, products),
    [merchant, products],
  );

  const journey = useMemo(
    () => simulateAgentJourney(useShopStore.getState(), toolCount || WEBMCP_TOOL_COUNT),
    [merchant, products, toolCount],
  );

  if (suggestions.length === 0 && !journey.checkoutBlocked) {
    return (
      <div className="autopilot autopilot--clear">
        <h3>Readiness autopilot</h3>
        <p className="autopilot__sandbox">
          Sandbox only — previews fixes on this ReadyCounter store, not your live checkout.
        </p>
        <p>Checkout path clear. Score {journey.readinessScore}/100.</p>
      </div>
    );
  }

  return (
    <div className="autopilot">
      <h3>Readiness autopilot</h3>
      <p className="autopilot__lead">
        Sandbox fixes for blockers shopping assistants hit here — CAPTCHA, login walls,
        stale catalog prices. Export the checklist from Connect; apply on your live store separately.
      </p>

      {suggestions.length > 0 ? (
        <ul className="autopilot__fixes">
          {suggestions.map((fix) => (
            <li key={fix.id} className="autopilot__fix">
              <div>
                <strong>{fix.label}</strong>
                <span className="autopilot__impact">{fix.impact}</span>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => applyReadinessFix(fix.id)}
              >
                Apply fix
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="autopilot__journey">
        <h4>Assistant journey preview</h4>
        <ul>
          {journey.steps.map((step) => (
            <li key={step.tool} className={step.ok ? 'autopilot__step--ok' : 'autopilot__step--fail'}>
              <code>{step.tool}</code> — {step.ok ? 'pass' : 'fail'}
            </li>
          ))}
        </ul>
        <p className="autopilot__rec">{journey.recommendation}</p>
      </div>
    </div>
  );
}
