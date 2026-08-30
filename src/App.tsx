import { useEffect, useState } from 'react';
import { DevToolPanel } from './components/DevToolPanel';
import { hasSeenHero, LandingHero, markHeroSeen } from './components/LandingHero';
import { OrderPanel } from './components/OrderPanel';
import { ReadinessDashboard } from './components/ReadinessDashboard';
import { ShopView } from './components/ShopView';
import { ToolActivityToast } from './components/ToolActivityToast';
import { registerWebMCPTools } from './webmcp/registerTools';
import './App.css';

type Tab = 'shop' | 'merchant';

function App() {
  const [tab, setTab] = useState<Tab>('shop');
  const [showHero, setShowHero] = useState(() => !hasSeenHero());
  const [webmcpStatus, setWebmcpStatus] = useState<{
    available: boolean;
    registered: string[];
    error: string | null;
  }>({ available: false, registered: [], error: null });

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

  const startCoShop = () => {
    markHeroSeen();
    setShowHero(false);
  };

  if (showHero) {
    return (
      <div className="app app--landing">
        <header className="app-header app-header--center">
          <h1>ReadyCounter</h1>
          <p className="tagline">Agent-ready storefront · use instantly</p>
        </header>
        <LandingHero onStart={startCoShop} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ReadyCounter</h1>
          <p className="tagline">
            Agent-ready storefront · Co-shop order · Merchant readiness
          </p>
        </div>
        <div
          className={`webmcp-badge${webmcpStatus.available ? ' webmcp-badge--live' : ''}`}
        >
          {webmcpStatus.available ? (
            <>WebMCP live · {webmcpStatus.registered.length} tools</>
          ) : (
            <>WebMCP off — use judge harness below</>
          )}
        </div>
      </header>

      <nav className="tabs" aria-label="Store views">
        <button
          type="button"
          className={`tabs__btn${tab === 'shop' ? ' tabs__btn--active' : ''}`}
          onClick={() => setTab('shop')}
        >
          Shop + order
        </button>
        <button
          type="button"
          className={`tabs__btn${tab === 'merchant' ? ' tabs__btn--active' : ''}`}
          onClick={() => setTab('merchant')}
        >
          Merchant readiness
        </button>
      </nav>

      <main className="main-layout">
        {tab === 'shop' ? (
          <>
            <ShopView />
            <OrderPanel />
          </>
        ) : (
          <ReadinessDashboard registeredToolCount={webmcpStatus.registered.length || 8} />
        )}
      </main>

      <DevToolPanel />
      <ToolActivityToast />

      <footer className="app-footer">
        <p>
          Structured WebMCP tools beat scrape. Shopify reports 2× conversion on
          Catalog vs scraped data. Toggle CAPTCHA in Merchant to see agent funnel
          drop.
        </p>
      </footer>
    </div>
  );
}

export default App;
