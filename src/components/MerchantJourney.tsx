import { MERCHANT_JOURNEY, type JourneyStep } from '../data/journey';

interface MerchantJourneyProps {
  active: JourneyStep;
  onStep: (step: JourneyStep) => void;
  compact?: boolean;
}

export function MerchantJourney({ active, onStep, compact }: MerchantJourneyProps) {
  const activeIdx = MERCHANT_JOURNEY.findIndex((s) => s.id === active);

  return (
    <nav className="journey" aria-label="Merchant path">
      <ol className={`journey__steps${compact ? ' journey__steps--compact' : ''}`}>
        {MERCHANT_JOURNEY.map((step, i) => {
          const state =
            i < activeIdx ? 'done' : i === activeIdx ? 'current' : 'next';
          return (
            <li key={step.id} className={`journey__step journey__step--${state}`}>
              <button
                type="button"
                className="journey__btn"
                onClick={() => onStep(step.id)}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className="journey__label">{step.label}</span>
                {!compact ? (
                  <>
                    <span className="journey__verb">{step.verb}</span>
                    <span className="journey__detail">{step.detail}</span>
                  </>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
