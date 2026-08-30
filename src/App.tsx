import { useEffect, useState } from 'react';
import { DevToolPanel } from './components/DevToolPanel';
import { StagingBoard } from './components/StagingBoard';
import { ToolActivityToast } from './components/ToolActivityToast';
import { registerWebMCPTools } from './webmcp/registerTools';
import './App.css';

function App() {
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

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Duet</h1>
          <p className="tagline">
            Agent stages · Human approves · Same board
          </p>
        </div>
        <div
          className={`webmcp-badge${webmcpStatus.available ? ' webmcp-badge--live' : ''}`}
        >
          {webmcpStatus.available ? (
            <>
              WebMCP live · {webmcpStatus.registered.length} tools registered
            </>
          ) : (
            <>WebMCP unavailable — use dev harness below</>
          )}
          {webmcpStatus.error && (
            <span className="webmcp-badge__error">{webmcpStatus.error}</span>
          )}
        </div>
      </header>

      <main>
        <StagingBoard />
      </main>

      <DevToolPanel />
      <ToolActivityToast />

      <footer className="app-footer">
        <p>
          Tools mutate shared in-memory state. Staging tray = pending (yellow).
          Cart = human-approved (green).
        </p>
      </footer>
    </div>
  );
}

export default App;
