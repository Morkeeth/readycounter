import { STORES, STORE_IDS } from '../data/stores';
import { SANDBOX_PROFILES } from '../data/sandbox-stores';
import { computeReadinessChecks, readinessScore } from '../lib/readiness';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';

export function SandboxShowcase() {
  const builtin = STORE_IDS.filter((id) => STORES[id]?.sandboxProfile);

  return (
    <article className="sandbox-showcase integrations__card integrations__card--wide">
      <header className="sandbox-showcase__header">
        <h3>Sandbox stores — pick a failure mode</h3>
        <p className="integrations__muted">
          Six built-in merchants, six Presenc rows. Switch in the header or tap a card — each score
          is unique on purpose.
        </p>
      </header>
      <ul className="sandbox-showcase__grid">
        {builtin.map((id) => {
          const store = STORES[id];
          const profile = store.sandboxProfile ? SANDBOX_PROFILES[store.sandboxProfile] : null;
          const score = readinessScore(
            computeReadinessChecks(store.merchant, WEBMCP_TOOL_COUNT, store.products),
          );
          return (
            <li key={id}>
              <a
                className="sandbox-showcase__card"
                href={`/?store=${encodeURIComponent(id)}&view=merchant`}
              >
                <span className="sandbox-showcase__emoji" aria-hidden>
                  {profile?.emoji ?? '🏪'}
                </span>
                <strong>{store.name}</strong>
                <span className="sandbox-showcase__score">{score}/100</span>
                <em>{profile?.hook ?? store.tagline}</em>
                <small>{profile?.presencRow}</small>
              </a>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
