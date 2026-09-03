import { useMemo } from 'react';
import type { Product } from '../types/commerce';
import type { AuditFinding } from '../lib/audit-findings';
import {
  buildBarcodeFixCsv,
  buildFixTickets,
  ticketsToMarkdown,
} from '../lib/fix-export';

/**
 * The fix, as a file the merchant can run.
 *
 * Everything above this on the page tells a merchant what is wrong. This is the
 * only thing that hands them the repair. Our own research doc scored the
 * product "help stops at advice"; this is where that stops being true.
 */

interface FixExportPanelProps {
  storeName: string;
  products: Product[];
  findings: AuditFinding[];
}

function download(name: string, body: string, mime: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function FixExportPanel({ storeName, products, findings }: FixExportPanelProps) {
  const csv = useMemo(() => buildBarcodeFixCsv(storeName, products), [storeName, products]);
  const tickets = useMemo(
    () => buildFixTickets(storeName, findings, csv),
    [storeName, findings, csv],
  );

  if (csv.rows === 0) {
    return (
      <section className="fix-export" aria-label="Fix this">
        <p className="integrations__section-label">Fix this</p>
        <h3>No handles in this crawl</h3>
        <p className="integrations__muted">
          Shopify matches an import by product <strong>Handle</strong>, and this crawl did not
          return any — usually a JSON-LD-only storefront. Connect Shopify OAuth and the fix file
          becomes available.
        </p>
      </section>
    );
  }

  return (
    <section className="fix-export" aria-label="Fix this">
      <p className="integrations__section-label">Fix this</p>
      <h3>Take the repair with you</h3>
      <p className="integrations__muted">
        <strong>{csv.missing}</strong> of {csv.rows} products expose no barcode. The file below is
        Shopify&rsquo;s own import shape, already filled with your handles — put the barcodes in the{' '}
        <code>Variant Barcode</code> column and re-import. Shopify then maps Barcode to GTIN in your
        Google Merchant Center feed, so this repairs Google Shopping too.
        {csv.skippedNoHandle > 0 ? (
          <> {csv.skippedNoHandle} product{csv.skippedNoHandle === 1 ? '' : 's'} had no handle and
          {' '}were left out rather than guessed at.</>
        ) : null}
      </p>

      <div className="fix-export__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => download(csv.filename, csv.csv, 'text/csv;charset=utf-8')}
        >
          Download the fix CSV
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={tickets.length === 0}
          onClick={() =>
            download(
              `readycounter-tickets-${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
              ticketsToMarkdown(storeName, tickets),
              'text/markdown;charset=utf-8',
            )
          }
        >
          {tickets.length} engineering ticket{tickets.length === 1 ? '' : 's'}
        </button>
      </div>

      <ol className="fix-export__steps">
        <li>Open the CSV and fill <code>Variant Barcode</code> with each variant&rsquo;s UPC / EAN / GTIN.</li>
        <li>Shopify admin → Products → Import, and upload it. Rows match on <strong>Handle</strong>.</li>
        <li>Re-audit this same URL here. We print the delta, so the fix has a receipt.</li>
      </ol>

      <p className="integrations__muted fix-export__note">
        We never ask for write access to your catalogue. The programmatic route, if you prefer it,
        is <code>productVariantsBulkUpdate</code> with the <code>write_products</code> scope — run
        it yourself.
      </p>
    </section>
  );
}
