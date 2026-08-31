import { useMemo, useState } from 'react';
import { DEMO_BEATS } from '../data/launch';

function filmEnabled(): boolean {
  return new URLSearchParams(window.location.search).get('film') === '1';
}

function beatFromUrl(): number {
  const raw = new URLSearchParams(window.location.search).get('beat');
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? Math.max(0, Math.min(DEMO_BEATS.length - 1, n)) : 0;
}

export function FilmGuide() {
  const [index, setIndex] = useState(beatFromUrl);
  const [collapsed, setCollapsed] = useState(false);

  const beat = useMemo(() => DEMO_BEATS[index], [index]);

  if (!filmEnabled()) {
    return null;
  }

  const syncUrl = (next: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('film', '1');
    url.searchParams.set('beat', String(next));
    window.history.replaceState({}, '', url.toString());
    setIndex(next);
  };

  return (
    <aside className={`film-guide${collapsed ? ' film-guide--collapsed' : ''}`} aria-label="Demo script">
      <header className="film-guide__header">
        <strong>Film mode</strong>
        <span>
          {index + 1}/{DEMO_BEATS.length} · {beat.atSec}s
        </span>
        <button type="button" className="film-guide__toggle" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </header>
      {!collapsed ? (
        <>
          <p className="film-guide__action">{beat.action}</p>
          <p className="film-guide__say">
            <em>Say:</em> {beat.say}
          </p>
          <p className="film-guide__show">
            <em>Show:</em> {beat.show}
          </p>
          <div className="film-guide__nav">
            <button
              type="button"
              className="btn btn--secondary"
              disabled={index === 0}
              onClick={() => syncUrl(index - 1)}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={index >= DEMO_BEATS.length - 1}
              onClick={() => syncUrl(index + 1)}
            >
              Next →
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
}
