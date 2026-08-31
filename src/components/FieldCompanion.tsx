import { useEffect, useState } from 'react';
import {
  COMPANION_THESIS,
  FIELD_RECEIPT,
  MERCHANT_CHECKLIST,
  PRESSING_ISSUES,
  PROTOCOL_CHEATSHEET,
  RESEARCH_BRIEFS,
} from '../data/field-companion';
import { apiRankings } from '../api/client';

type Lane = 'issues' | 'checklist' | 'research' | 'protocols';

export function FieldCompanion() {
  const [lane, setLane] = useState<Lane>('issues');
  const [openRank, setOpenRank] = useState<number | null>(1);
  const [live, setLive] = useState<{
    shopCount: number;
    succeeded: number;
    avgGtinPct: number;
    at: string | null;
  } | null>(null);

  useEffect(() => {
    void apiRankings().then((data) => {
      if (!data?.shopCount) return;
      setLive({
        shopCount: data.shopCount,
        succeeded: data.succeeded,
        avgGtinPct: data.avgGtinPct,
        at: data.at,
      });
    });
  }, []);

  const attempted = live?.shopCount ?? FIELD_RECEIPT.attempted;
  const crawled = live?.succeeded ?? FIELD_RECEIPT.crawled;
  const gtin = live?.avgGtinPct ?? FIELD_RECEIPT.gtinPctOnCrawled;
  const asOf = live?.at ? new Date(live.at).toLocaleDateString() : FIELD_RECEIPT.updated;

  return (
    <article className="companion integrations__card integrations__card--wide" id="against-the-field">
      <header className="companion__header">
        <p className="companion__kicker">2 · Against the field</p>
        <h3>Pressing issues · guidelines · research</h3>
        <p className="companion__thesis">{COMPANION_THESIS}</p>
        <p className="companion__receipt">
          Field receipt · {crawled}/{attempted} crawled · <strong>{gtin}% GTIN</strong> scrape ·{' '}
          {FIELD_RECEIPT.catalogScoreOnCrawled} catalog
          {FIELD_RECEIPT.ucpGtinWhereCrawlZero
            ? ` · ${FIELD_RECEIPT.ucpGtinWhereCrawlZero} brands with UCP GTIN where scrape is ${FIELD_RECEIPT.gtinPctOnCrawled}%`
            : ''}{' '}
          · as of {asOf}
          {live ? ' · live' : ''}
        </p>
      </header>

      <div className="companion__lanes" role="tablist" aria-label="Companion sections">
        {(
          [
            ['issues', 'Pressing issues'],
            ['checklist', 'Guidelines'],
            ['research', 'Research'],
            ['protocols', 'Protocols'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={lane === id}
            className={lane === id ? 'companion__lane companion__lane--on' : 'companion__lane'}
            onClick={() => setLane(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {lane === 'issues' ? (
        <ol className="companion__issues">
          {PRESSING_ISSUES.map((issue) => {
            const open = openRank === issue.rank;
            return (
              <li key={issue.id} className={open ? 'companion__issue companion__issue--open' : 'companion__issue'}>
                <button
                  type="button"
                  className="companion__issue-btn"
                  aria-expanded={open}
                  onClick={() => setOpenRank(open ? null : issue.rank)}
                >
                  <span className="companion__rank">{issue.rank}</span>
                  <span className="companion__issue-title">{issue.title}</span>
                </button>
                {open ? (
                  <div className="companion__issue-body">
                    <p>
                      <strong>Why.</strong> {issue.why}
                    </p>
                    <p>
                      <strong>Fails.</strong> {issue.fails}
                    </p>
                    <p className="companion__fix">
                      <strong>Do this week.</strong> {issue.doThisWeek}
                    </p>
                    <p className="integrations__muted">{issue.evidence}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      {lane === 'checklist' ? (
        <ul className="companion__check">
          {MERCHANT_CHECKLIST.map((item) => (
            <li key={item.id}>
              <span className="companion__check-mark" aria-hidden>
                □
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}

      {lane === 'research' ? (
        <div className="companion__research">
          <p className="companion__headline">
            {live
              ? `${crawled}/${attempted} crawled DTC stores: ${gtin}% avg GTIN in public feeds.`
              : FIELD_RECEIPT.headline}
          </p>
          <ul className="companion__briefs">
            {RESEARCH_BRIEFS.map((b) => (
              <li key={b.id}>
                <span className="companion__rid">{b.id}</span>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.finding}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lane === 'protocols' ? (
        <table className="companion__proto">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Role</th>
              <th>Merchant surface</th>
            </tr>
          </thead>
          <tbody>
            {PROTOCOL_CHEATSHEET.map((row) => (
              <tr key={row.layer}>
                <td>
                  <code>{row.layer}</code>
                </td>
                <td>{row.role}</td>
                <td>{row.surface}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <footer className="companion__foot">
        <p className="integrations__muted">
          Agents: <code>get_field_companion</code> · <code>review_against_field</code> ·{' '}
          <code>GET /api/v1/companion</code>
        </p>
        <p className="integrations__muted">
          How to run tools: <a href="#run-webmcp">Path A / Path B</a> · handbook{' '}
          <code>research/HANDBOOK.md</code>
        </p>
      </footer>
    </article>
  );
}
