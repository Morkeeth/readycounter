interface WhyWebMCPProps {
  webmcpLive: boolean;
  toolCount: number;
}

/**
 * How to actually run WebMCP with ReadyCounter — native flag vs tool console.
 * WebMCP is not a server you start; tools register on this page.
 */
export function WhyWebMCP({ webmcpLive, toolCount }: WhyWebMCPProps) {
  return (
    <article className="why-webmcp integrations__card integrations__card--wide" id="run-webmcp">
      <h3>How to run WebMCP</h3>
      <p className="why-webmcp__lead">
        ReadyCounter does not host a remote MCP server. This open tab registers{' '}
        <strong>{toolCount} tools</strong> on <code>document.modelContext</code>. A WebMCP-capable
        browser assistant calls them in the same session you see — one cart, one bill.
      </p>

      <p className="why-webmcp__status">
        Status now:{' '}
        {webmcpLive ? (
          <strong className="integrations__ok">WebMCP live · {toolCount} tools registered</strong>
        ) : (
          <strong className="integrations__warn">
            Flag off — use Path B (tool console) below
          </strong>
        )}
      </p>

      <div className="why-webmcp__grid">
        <div className={`why-webmcp__col${webmcpLive ? ' why-webmcp__col--accent' : ''}`}>
          <h4>Path A — native WebMCP</h4>
          <ol className="why-webmcp__steps">
            <li>
              Chrome with WebMCP → open{' '}
              <code>chrome://flags/#enable-webmcp-testing</code>
            </li>
            <li>Set to Enabled → relaunch the browser</li>
            <li>
              Reload ReadyCounter — header should read <em>WebMCP live</em>
            </li>
            <li>
              Ask the page assistant for <code>search_catalog</code>,{' '}
              <code>prepare_checkout</code>, or <code>get_field_companion</code>
            </li>
          </ol>
        </div>
        <div className={`why-webmcp__col${!webmcpLive ? ' why-webmcp__col--accent' : ''}`}>
          <h4>Path B — no flag (same tools)</h4>
          <ol className="why-webmcp__steps">
            <li>Stay on Connect — open <strong>Agent tool console</strong> at the bottom</li>
            <li>Run sample calls (search, score, journey) — same handlers as Path A</li>
            <li>
              Or hit REST: <code>GET /api/v1/tools</code> · <code>/api/v1/companion</code>
            </li>
            <li>Readiness → Agent journey proves checkout walls without WebMCP</li>
          </ol>
        </div>
      </div>

      <p className="integrations__muted">
        The bill and field audit work without WebMCP. WebMCP is the proof that an assistant can
        shop the same cart. Details: <code>WHY-WEBMCP.md</code>
      </p>
    </article>
  );
}
