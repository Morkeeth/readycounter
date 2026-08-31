import { LAUNCH_IMPACT, LAUNCH_RECOMMENDATIONS, LAUNCH_TEST_CASES } from '../data/launch';
import { getSource } from '../data/sources';

export function LaunchBrief() {
  return (
    <section className="launch-brief" aria-label="Research-based launch kit">
      <header className="launch-brief__header">
        <h2>Launch kit — research, tests, demo, impact</h2>
        <p className="launch-brief__lead">
          Every recommendation maps to a cited source. Test cases are runnable today. See{' '}
          <code>LAUNCH.md</code> and <code>DEMO.md</code> for the full brief and 90s script.
        </p>
      </header>

      <div className="launch-brief__grid">
        <article className="launch-brief__card launch-brief__card--wide">
          <h3>Impact</h3>
          <ul className="launch-brief__impact">
            {LAUNCH_IMPACT.map((row) => {
              const src = getSource(row.sourceId);
              return (
                <li key={row.id}>
                  <strong>{row.figure}</strong>
                  <span>{row.headline}</span>
                  <em>{row.productProof}</em>
                  <small>
                    {src.publisher} · {src.figure}
                  </small>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="launch-brief__card launch-brief__card--wide">
          <h3>Recommendations (field-backed)</h3>
          <ol className="launch-brief__recs">
            {LAUNCH_RECOMMENDATIONS.map((rec) => (
              <li key={rec.id}>
                <strong>{rec.title}</strong>
                <p>{rec.merchantAction}</p>
                <p className="launch-brief__evidence">{rec.fieldEvidence}</p>
                {rec.maxPoints ? (
                  <small>Up to {rec.maxPoints} pts on readiness tape</small>
                ) : null}
              </li>
            ))}
          </ol>
        </article>

        <article className="launch-brief__card launch-brief__card--wide">
          <h3>Test cases</h3>
          <ul className="launch-brief__tests">
            {LAUNCH_TEST_CASES.map((tc) => (
              <li key={tc.id}>
                <code>{tc.id}</code>
                <strong>{tc.name}</strong>
                {tc.entry ? (
                  <p className="launch-brief__entry">
                    Entry: <code>{tc.entry}</code>
                  </p>
                ) : null}
                <ol>
                  {tc.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="launch-brief__pass">
                  Pass: <em>{tc.passWhen}</em>
                </p>
              </li>
            ))}
          </ul>
          <p className="launch-brief__run">
            Run: <code>npm run test:e2e</code> · <code>npm run verify</code> ·{' '}
            <code>npm run verify:launch</code>
          </p>
        </article>
      </div>
    </section>
  );
}
