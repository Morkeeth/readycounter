import type { Product } from '../types/commerce';
import type { AuditFinding } from './audit-findings';

/**
 * Turn a finding into something the merchant can actually run.
 *
 * The product could describe a fix but never hand one over — "help stops at
 * advice", in our own words. These two exports close that gap without asking
 * anyone for write access to their catalogue.
 *
 * The CSV is Shopify's own product import shape. Shopify matches rows by
 * **Handle**, updates `Variant Barcode` per variant, and then maps Barcode to
 * GTIN in the Google Merchant Center feed — so the same file that makes the
 * store legible to agents also repairs Google Shopping.
 * @see https://help.shopify.com/en/manual/products/import-export/using-csv
 */

/** Columns Shopify accepts for a barcode-only update, in its own order. */
const CSV_COLUMNS = [
  'Handle',
  'Title',
  'Variant SKU',
  'Variant Barcode',
] as const;

function csvCell(value: string): string {
  const v = value ?? '';
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export interface BarcodeFixCsv {
  csv: string;
  filename: string;
  rows: number;
  missing: number;
  skippedNoHandle: number;
}

/**
 * A Shopify-importable CSV, pre-filled with the merchant's real products and
 * their real handles, with `Variant Barcode` left blank where it is missing.
 *
 * Products without a handle are counted and excluded rather than emitted with a
 * guess: a row Shopify cannot match would either do nothing or, worse, match
 * something else.
 */
export function buildBarcodeFixCsv(storeName: string, products: Product[]): BarcodeFixCsv {
  const usable = products.filter((p) => Boolean(p.handle));
  const skippedNoHandle = products.length - usable.length;

  const lines = [CSV_COLUMNS.join(',')];
  let missing = 0;

  for (const p of usable) {
    const barcode = (p.gtin ?? '').trim();
    if (!barcode) missing += 1;
    lines.push(
      [
        csvCell(p.handle!),
        csvCell(p.name),
        csvCell(p.id),
        csvCell(barcode), // blank where it is missing — this is the column to fill
      ].join(','),
    );
  }

  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    csv: lines.join('\n') + '\n',
    filename: `readycounter-barcodes-${slug || 'store'}.csv`,
    rows: usable.length,
    missing,
    skippedNoHandle,
  };
}

export interface FixTicket {
  title: string;
  body: string;
}

/**
 * One engineering ticket per failing check, carrying the check, the arithmetic,
 * the fix and the citation. The readiness tape already holds all four; it just
 * never left the page.
 */
export function buildFixTickets(
  storeName: string,
  findings: AuditFinding[],
  csv?: BarcodeFixCsv,
): FixTicket[] {
  const failing = findings.filter((f) => f.status === 'fail' || f.status === 'warn');
  const tickets: FixTicket[] = [];

  if (csv && csv.missing > 0) {
    tickets.push({
      title: `Add barcodes (GTIN) to ${csv.missing} variants on ${storeName}`,
      body: [
        `${csv.missing} of ${csv.rows} products expose no barcode to an agent reading the public catalogue.`,
        '',
        '**Why it matters twice.** A shopping agent cannot match a product without',
        'an identifier. Shopify also maps the Barcode field to GTIN in the Google',
        'Merchant Center feed, so the same fix repairs Google Shopping.',
        '',
        '**How to do it, no API needed:**',
        '1. Shopify admin → Products → Export → "CSV for Excel, Numbers, or other spreadsheet programs".',
        `2. Or start from the attached \`${csv.filename}\`, which already lists every product missing one.`,
        '3. Fill the **Variant Barcode** column with the UPC/EAN/GTIN for each variant.',
        '4. Products → Import, and upload it. Shopify matches rows by **Handle**.',
        '5. Re-audit the same URL in ReadyCounter to get a delta receipt.',
        '',
        'Programmatic alternative: `productVariantsBulkUpdate` with the `barcode`',
        'field, which needs the `write_products` scope.',
      ].join('\n'),
    });
  }

  for (const f of failing) {
    const cites = (f.sourceIds ?? []).join(', ');
    tickets.push({
      title: `[${f.status.toUpperCase()}] ${f.label} — ${storeName}`,
      body: [
        f.detail ?? '',
        '',
        f.stat ? `**Measured:** ${f.stat}` : '',
        f.points !== undefined && f.maxPoints !== undefined
          ? `**Cost:** ${f.maxPoints - f.points} of ${f.maxPoints} points on the readiness bill.`
          : '',
        cites ? `**Weight comes from:** ${cites}` : '',
        '',
        f.rationale ? `<details><summary>How this is scored</summary>\n\n${f.rationale}\n\n</details>` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  return tickets;
}

/** Tickets as one markdown file, for pasting into an issue tracker. */
export function ticketsToMarkdown(storeName: string, tickets: FixTicket[]): string {
  const head = [
    `# ReadyCounter fix list — ${storeName}`,
    '',
    `${tickets.length} ticket${tickets.length === 1 ? '' : 's'}, generated ${new Date().toISOString().slice(0, 10)}.`,
    'Every line names the published source its weight comes from.',
    '',
    '---',
    '',
  ].join('\n');
  return head + tickets.map((t) => `## ${t.title}\n\n${t.body}\n`).join('\n---\n\n');
}
