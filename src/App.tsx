import { useEffect, useState } from 'react';
import type { JourneyStep } from './data/journey';
import { tabForStep } from './data/journey';
import { IntegrationsPanel } from './components/IntegrationsPanel';
import { hasSeenHero, LandingHero, markHeroSeen } from './components/LandingHero';
import { MerchantJourney } from './components/MerchantJourney';
import { OrderPanel } from './components/OrderPanel';
import { ReadinessDashboard } from './components/ReadinessDashboard';
import { ShopView } from './components/ShopView';
import { StoreSwitcher } from './components/StoreSwitcher';
import { ToolActivityToast } from './components/ToolActivityToast';
import { FilmGuide } from './components/FilmGuide';
import { useRoomSync } from './hooks/useRoomSync';
import { registerCustomStore } from './data/stores';
import { apiFetchServerStore } from './api/client';
import { useShopStore } from './store/shopStore';
import { registerWebMCPTools } from './webmcp/registerTools';
import { WEBMCP_TOOL_COUNT } from './webmcp/toolManifest';
import './App.css';

type Tab = 'shop' | 'merchant' | 'integrations';

const TABS: { id: Tab; label: string; journey: JourneyStep }[] = [
  { id: 'integrations', label: 'Connect', journey: 'connect' },
  { id: 'merchant', label: 'Readiness', journey: 'bill' },
  { id: 'shop', label: 'Co-shop', journey: 'prove' },
];

function initialTab(): Tab {
  const v = new URLSearchParams(window.location.search).get('view');
  return TABS.some((t) => t.id === v) ? (v as Tab) : 'integrations';
}

function hasViewParam(): boolean {
  return new URLSearchParams(window.location.search).has('view');
}

function journeyForTab(tab: Tab): JourneyStep {
  if (tab === 'shop') return 'prove';
  if (tab === 'merchant') return 'bill';
  return 'connect';
}

function App() {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showHero, setShowHero] = useState(
    () => !hasSeenHero() && !hasViewParam() && new URLSearchParams(window.location.search).get('film') !== '1',
  );
  const [webmcpStatus, setWebmcpStatus] = useState<{
    available: boolean;
    registered: string[];
    error: string | null;
  }>({ available: false, registered: [], error: null });

  useRoomSync();

  useEffect(() => {
    const onPop = () => {
      const v = new URLSearchParams(window.location.search).get('view');
      if (v && TABS.some((t) => t.id === v)) setTab(v as Tab);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify') !== 'connected') return;
    const storeId = params.get('store');
    if (!storeId) return;
    void apiFetchServerStore(storeId).then((store) => {
      if (!store) return;
      registerCustomStore(store);
      useShopStore.getState().switchStore(store.id);
      params.delete('shopify');
      const clean = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, '', clean.replace(/\?$/, ''));
    });
  }, []);

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

  const goJourney = (step: JourneyStep) => {
    markHeroSeen();
    setShowHero(false);
    openTab(tabForStep(step));
  };

  const enterApp = (nextTab: Tab = 'integrations') => {
    markHeroSeen();
    setShowHero(false);
    openTab(nextTab);
  };

  if (showHero) {
    return (
      <div className="app app--landing">
        <header className="app-header app-header--center">
          <h1>ReadyCounter</h1>
          <p className="tagline">itemised agent abandonment · cited line by line</p>
        </header>
        <LandingHero
          onAudit={() => enterApp('integrations')}
          onReadiness={() => enterApp('merchant')}
          onShop={() => enterApp('shop')}
          onJourneyStep={goJourney}
          registeredToolCount={webmcpStatus.registered.length || WEBMCP_TOOL_COUNT}
        />
      </div>
    );
  }

  const toolCount = webmcpStatus.registered.length || WEBMCP_TOOL_COUNT;
  const journeyStep = journeyForTab(tab);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ReadyCounter</h1>
          <p className="tagline">audit · bill · preview · prove</p>
        </div>
        <div
          className={`webmcp-badge${webmcpStatus.available ? ' webmcp-badge--live' : ''}`}
          title={webmcpStatus.available ? 'WebMCP tools registered in this tab' : 'Test tools under Connect'}
        >
          {webmcpStatus.available ? (
            <>WebMCP live · {toolCount} tools</>
          ) : (
            <>Tools ready · Connect to test</>
          )}
        </div>
        <StoreSwitcher />
      </header>

      <MerchantJourney active={journeyStep} onStep={goJourney} />

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
          <ReadinessDashboard registeredToolCount={toolCount} onGoShop={() => openTab('shop')} />
        ) : (
          <IntegrationsPanel
            navigateToBill
            onOpenBill={() => openTab('merchant')}
            webmcpLive={webmcpStatus.available}
            toolCount={toolCount}
          />
        )}
      </main>

      <ToolActivityToast />
      <FilmGuide />

      <footer className="app-footer">
        <details className="app-footer__details">
          <summary>How the score is sourced</summary>
          <p>
            Cited figures resolve to <code>src/data/sources.ts</code> and{' '}
            <code>research.md</code>. Measured counts (SKUs, GTIN coverage, points earned) are
            computed live from this catalog. Six weights = Presenc AI causes table (26+24+18+15+11+6
            = 100). Tool surface is reported at zero. <code>prepare_checkout</code> never charges a
            card.
          </p>
        </details>
      </footer>
    </div>
  );
}

export default App;
