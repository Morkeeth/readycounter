import { useEffect, useState } from 'react';
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

function App() {
  const [tab, setTab] = useState<Tab>('shop');
  const [showHero, setShowHero] = useState(() => !hasSeenHero());
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

  const enterApp = (nextTab: Tab = 'shop') => {
    markHeroSeen();
    setShowHero(false);
    setTab(nextTab);
  };

  if (showHero) {
    return (
      <div className="app app--landing">
        <header className="app-header app-header--center">
          <h1>ReadyCounter</h1>
          <p className="tagline">Agent-ready commerce for merchants and shoppers</p>
        </header>
        <LandingHero onShop={() => enterApp('shop')} onReadiness={() => enterApp('merchant')} />
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
            Co-shop with your assistant · Readiness score for your storefront
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
        <button
          type="button"
          className={`tabs__btn${tab === 'shop' ? ' tabs__btn--active' : ''}`}
          onClick={() => setTab('shop')}
        >
          Shop
        </button>
        <button
          type="button"
          className={`tabs__btn${tab === 'merchant' ? ' tabs__btn--active' : ''}`}
          onClick={() => setTab('merchant')}
        >
          Readiness
        </button>
        <button
          type="button"
          className={`tabs__btn${tab === 'integrations' ? ' tabs__btn--active' : ''}`}
          onClick={() => setTab('integrations')}
        >
          Connect
        </button>
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
          Humans confirm payment in the browser. Shopping assistants can search, add to cart,
          and prepare checkout — never charge a card. Built on structured catalog data, not
          screen scraping.
        </p>
      </footer>
    </div>
  );
}

export default App;
