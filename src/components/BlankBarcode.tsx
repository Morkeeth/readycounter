import { useMemo } from 'react';

/**
 * The blank barcode — ReadyCounter's signature device.
 *
 * This is what a shopping agent reads off a product page. Every bar is a product
 * slot; a bar is INK only when that product actually exposes a GTIN to the scrape.
 * At 0% GTIN the whole code is grey, which is the finding: nothing to scan.
 *
 * The bar widths come from the store's own product count, so the code is a picture
 * of real data and not an ornament. Removing it loses information.
 */

interface BlankBarcodeProps {
  /** Percentage of products exposing a GTIN to the public scrape. 0 = blank. */
  gtinPct: number;
  /** How many products were read. Drives how dense the code is. */
  productCount: number;
  label?: string;
  /** Sweep the scanner beam across. Off for stills and reduced motion. */
  scanning?: boolean;
}

const MIN_BARS = 118;
const MAX_BARS = 168;

export function BlankBarcode({ gtinPct, productCount, label, scanning = true }: BlankBarcodeProps) {
  const bars = useMemo(() => {
    // One bar per product where we can, but always dense enough to read as a code.
    const n = Math.max(MIN_BARS, Math.min(MAX_BARS, (productCount || 0) * 4 || MIN_BARS));
    // Deterministic widths/heights: the same store always prints the same code.
    let seed = (productCount || 1) * 7919 + n;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const inked = Math.round((n * Math.max(0, Math.min(100, gtinPct))) / 100);
    return Array.from({ length: n }, (_, i) => ({
      w: 1 + Math.round(rnd() * 3),
      h: 56 + Math.round(rnd() * 44),
      ink: i < inked,
    }));
  }, [gtinPct, productCount]);

  const readable = gtinPct > 0;

  return (
    <figure className="barcode" aria-label={label ?? 'What an agent reads on your product page'}>
      <figcaption className="barcode__cap">
        <span>{label ?? 'What an agent reads on your product page'}</span>
        <span className={readable ? 'barcode__verdict' : 'barcode__verdict barcode__verdict--blank'}>
          {readable ? `${gtinPct}% scannable` : 'nothing to scan'}
        </span>
      </figcaption>
      <div className="barcode__strip">
        <div className="barcode__bars" aria-hidden="true">
          {bars.map((b, i) => (
            <i
              key={i}
              className={b.ink ? 'barcode__bar barcode__bar--ink' : 'barcode__bar'}
              style={{ width: `${b.w}px`, height: `${b.h}%` }}
            />
          ))}
        </div>
        {scanning ? <span className="barcode__beam" aria-hidden="true" /> : null}
      </div>
    </figure>
  );
}
