import { useEffect, useState } from 'react';
import { apiRankings } from '../api/client';
import { getSource } from '../data/sources';
import { FIELD_RECEIPT } from '../data/field-companion';

interface ConnectLighthouseHeroProps {
  onCompare?: () => void;
}

export function ConnectLighthouseHero({ onCompare }: ConnectLighthouseHeroProps) {
  const abandon = getSource('presenc_abandon');
  const [live, setLive] = useState<{
    shopCount: number;
    succeeded: number;
    avgGtinPct: number;
    ucpGap: number;
  } | null>(null);

  useEffect(() => {
    void apiRankings().then((data) => {
      if (!data?.shopCount) return;
      setLive({
        shopCount: data.shopCount,
        succeeded: data.succeeded,
        avgGtinPct: data.avgGtinPct,
        ucpGap: data.ucp?.gtinWhereCrawlZero ?? FIELD_RECEIPT.ucpGtinWhereCrawlZero,
      });
    });
  }, []);

  const parsed = live?.shopCount ?? FIELD_RECEIPT.curatedMapped;
  const crawled = live?.succeeded ?? FIELD_RECEIPT.crawled;
  const gtin = live?.avgGtinPct ?? FIELD_RECEIPT.gtinPctOnCrawled;
  const ucpGap = live?.ucpGap ?? FIELD_RECEIPT.ucpGtinWhereCrawlZero;

  const scrollToAudit = () => {
    document.getElementById('audit-storefront')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    onCompare?.();
  };

  return (
    <header className="lighthouse-hero" aria-label="Lighthouse for agentic commerce">
      <p className="lighthouse-hero__kicker">Lighthouse · not Shopify rails</p>
      <h2 className="lighthouse-hero__title">
        {parsed} stores parsed · compare your shop · paste URL
      </h2>
      <p className="lighthouse-hero__lead">
        Agents abandon {abandon.figure} of carts ({abandon.publisher}). You cannot see the leak until
        something measures what they retrieve. ReadyCounter already crawled{' '}
        <strong>
          {crawled}/{parsed}
        </strong>{' '}
        DTC brands — scrape GTIN <strong>{gtin}%</strong>
        {ucpGap ? (
          <>
            {' '}
            · <strong>{ucpGap}</strong> with UCP GTIN where scrape is empty
          </>
        ) : null}
        .
      </p>
      <div className="lighthouse-hero__stats" aria-label="Field batch width">
        <div className="lighthouse-hero__stat">
          <span className="lighthouse-hero__num">{parsed}</span>
          <span className="lighthouse-hero__lbl">curated DTC</span>
        </div>
        <div className="lighthouse-hero__stat">
          <span className="lighthouse-hero__num">
            {crawled}/{parsed}
          </span>
          <span className="lighthouse-hero__lbl">crawled</span>
        </div>
        <div className="lighthouse-hero__stat">
          <span className="lighthouse-hero__num">{gtin}%</span>
          <span className="lighthouse-hero__lbl">scrape GTIN</span>
        </div>
        {ucpGap ? (
          <div className="lighthouse-hero__stat lighthouse-hero__stat--gap">
            <span className="lighthouse-hero__num">{ucpGap}</span>
            <span className="lighthouse-hero__lbl">UCP gaps</span>
          </div>
        ) : null}
      </div>
      <div className="lighthouse-hero__actions">
        <button type="button" className="btn btn--primary" onClick={scrollToAudit}>
          Compare your storefront
        </button>
        <a className="btn btn--secondary" href="#rankings-panel">
          See field rankings
        </a>
      </div>
      <p className="lighthouse-hero__cite integrations__muted">
        {abandon.figure} agent abandon — {abandon.publisher} · field counts live from{' '}
        <code>GET /api/v1/rankings</code>
      </p>
    </header>
  );
}
