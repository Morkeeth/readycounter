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
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section className="landing-hero" aria-label="Welcome">
      <div className="landing-hero__ring" aria-hidden>
        <span className="landing-hero__score">72</span>
        <span className="landing-hero__label">agent readiness</span>
      </div>
      <div className="landing-hero__copy">
        <h2>Co-shop in one tab</h2>
        <p>
          Two demo merchants, one platform. Open a link, add items with your agent
          or your hands, share the same order — no account. Switch stores to see
          CAPTCHA vs account walls kill agent checkout.
        </p>
        <button type="button" className="btn btn--primary btn--wide" onClick={onStart}>
          Start co-shopping
        </button>
      </div>
    </section>
  );
}
