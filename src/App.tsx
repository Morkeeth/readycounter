import { useEffect, useState } from 'react';
import { getSource } from './data/sources';
import { IntegrationsPanel } from './components/IntegrationsPanel';
import { hasSeenHero, LandingHero, markHeroSeen } from './components/LandingHero';
import { OrderPanel } from './components/OrderPanel';
import { ReadinessDashboard } from './components/ReadinessDashboard';
import { ShopView } from './components/ShopView';
import { StoreSwitcher } from './components/StoreSwitcher';
import { ToolActivityToast } from './components/ToolActivityToast';
import { useRoomSync } from './hooks/useRoomSync';
import { registerWebMCPTools } from './webmcp/registerTools';
import { WEBMCP_TOOL_COUNT } from './webmcp/toolManifest';
import './App.css';

type Tab = 'shop' | 'merchant' | 'integrations';

const TABS: { id: Tab; label: string }[] = [
  { id: 'shop', label: 'Shop' },
  { id: 'merchant', label: 'Readiness' },
  { id: 'integrations', label: 'Connect' },
];

/**
 * `?view=merchant` opens straight on a tab. A shared co-shop link should land
 * where the sender was looking, and the film can cut to a view without a click.
 */
function initialTab(): Tab {
  const v = new URLSearchParams(window.location.search).get('view');
  return TABS.some((t) => t.id === v) ? (v as Tab) : 'shop';
}

function hasViewParam(): boolean {
  return new URLSearchParams(window.location.search).has('view');
}

function App() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showHero, setShowHero] = useState(() => !hasSeenHero() && !hasViewParam());
  const [webmcpStatus, setWebmcpStatus] = useState<{
    available: boolean;
    registered: string[];
    error: string | null;
  }>({ available: false, registered: [], error: null });

  useRoomSync();

  useEffect(() => {
    const controller = new AbortController();
    registerWebMCPTools(controller.signal).then((result) => {
      setWebmcpStatus({
        available: result.webmcpAvailable,
        registered: result.registered,
        error: result.error,
      });
    });
    return () => controller.abort();
  }, []);

  const openTab = (next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('view', next);
    window.history.replaceState({}, '', url.toString());
  };

  const enterApp = (nextTab: Tab = 'shop') => {
    markHeroSeen();
    setShowHero(false);
    openTab(nextTab);
  };

  if (showHero) {
    return (
      <div className="app app--landing">
        <header className="app-header app-header--center">
          <h1>ReadyCounter</h1>
          <p className="tagline">an itemised readiness bill for agent shoppers</p>
        </header>
        <LandingHero
          onShop={() => enterApp('shop')}
          onReadiness={() => enterApp('merchant')}
          registeredToolCount={webmcpStatus.registered.length || WEBMCP_TOOL_COUNT}
        />
      </div>
    );
  }

  const toolCount = webmcpStatus.registered.length || WEBMCP_TOOL_COUNT;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ReadyCounter</h1>
          <p className="tagline">
            the counter prints the score · co-shop stays in your tab
          </p>
        </div>
        <div
          className={`webmcp-badge${webmcpStatus.available ? ' webmcp-badge--live' : ''}`}
        >
          {webmcpStatus.available ? (
            <>Assistant tools active · {toolCount} connected</>
          ) : (
            <>Assistant tools ready · open Connect to test</>
          )}
        </div>
        <StoreSwitcher />
      </header>

      <nav className="tabs" aria-label="Main navigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabs__btn${tab === t.id ? ' tabs__btn--active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => openTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main-layout">
        {tab === 'shop' ? (
          <>
            <ShopView />
            <OrderPanel />
          </>
        ) : tab === 'merchant' ? (
          <ReadinessDashboard registeredToolCount={toolCount} />
        ) : (
          <IntegrationsPanel />
        )}
      </main>

      <ToolActivityToast />

      <footer className="app-footer">
        <p>
          Every figure ReadyCounter <em>cites</em> resolves to a row in{' '}
          <code>src/data/sources.ts</code> and a quoted sentence in{' '}
          <code>research.md</code>. The numbers it <em>measures</em> off this store —
          SKU counts, GTIN coverage, points earned — are computed live from the
          catalog and cite nothing, because they are not claims about the world.
 All six weights are a published share of
          abandoned agent carts, one line per row of Presenc AI&rsquo;s causes table
          ({getSource('presenc_stale_feed').figure} stale data at checkout,{' '}
          {getSource('presenc_captcha').figure} CAPTCHA,{' '}
          {getSource('presenc_price_mismatch').figure} feed mismatch,{' '}
          {getSource('presenc_account_wall').figure} required account,{' '}
          {getSource('presenc_payment_method').figure} unsupported payment,{' '}
          {getSource('presenc_page_structure').figure} ambiguous page structure —{' '}
          {getSource('presenc_page_structure').publisher}, read{' '}
          {getSource('presenc_page_structure').accessed}); the six sum to 100 on that
          page and to 100 here, and all six rows are reproduced in{' '}
          <code>research.md</code>. What is <em>not</em> published is the test behind
          each line: the source names six causes and defines none of them, so every
          test is ours and every line prints it. Checks with no published price — the
          tool surface — are reported at zero rather than given a weight we made up.
        </p>
        <p>
          Humans confirm payment in the browser. Shopping assistants search, add to
          the order and prepare checkout — <code>prepare_checkout</code> never
          charges a card.
        </p>
      </footer>
    </div>
  );
}

export default App;
