/** Banner for hackathon judges — WebMCP proof path in one screen. */
export function JudgeBanner({
  webmcpLive,
  toolCount,
  onOpenConnect,
}: {
  webmcpLive: boolean;
  toolCount: number;
  onOpenConnect: () => void;
}) {
  return (
    <aside className="judge-banner" aria-label="Judge quick path">
      <p className="judge-banner__kicker">WebMCP Challenge · judge path</p>
      <p className="judge-banner__lead">
        <strong>Humans + agents, one cart.</strong> Add an item below, then open Connect → Agent tool
        console → <code>add_to_order</code> → <code>prepare_checkout</code> (never charges).
      </p>
      <p className="judge-banner__meta">
        {webmcpLive ? (
          <>
            <span className="judge-banner__live">WebMCP live · {toolCount} tools</span>
            {' · '}
          </>
        ) : (
          <>
            Path B: tool console (no flag) ·{' '}
          </>
        )}
        <button type="button" className="judge-banner__link" onClick={onOpenConnect}>
          Open Connect →
        </button>
        {' · '}
        <a
          href="https://github.com/Morkeeth/tooltruth-webmcp/blob/main/CHATGPT-JUDGE.md"
          target="_blank"
          rel="noreferrer"
        >
          Native WebMCP (ChatGPT / Chrome)
        </a>
      </p>
    </aside>
  );
}
