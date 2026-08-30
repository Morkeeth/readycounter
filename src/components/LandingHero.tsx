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
  onShop: () => void;
  onReadiness: () => void;
}

export function LandingHero({ onShop, onReadiness }: LandingHeroProps) {
  return (
    <section className="landing-hero" aria-label="Welcome">
      <div className="landing-hero__ring" aria-hidden>
        <span className="landing-hero__score">72</span>
        <span className="landing-hero__label">agent readiness</span>
      </div>
      <div className="landing-hero__copy">
        <h2>Shop with your AI assistant. You stay in control.</h2>
        <p>
          ReadyCounter scores how agent-ready your storefront is, then lets humans and
          assistants build the same cart in one tab. No signup to start. You confirm
          payment — agents never charge a card.
        </p>
        <div className="landing-hero__actions">
          <button type="button" className="btn btn--primary btn--wide" onClick={onShop}>
            Start shopping
          </button>
          <button type="button" className="btn btn--secondary btn--wide" onClick={onReadiness}>
            Check store readiness
          </button>
        </div>
      </div>
    </section>
  );
}
