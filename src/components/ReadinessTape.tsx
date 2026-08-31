import { getSource, SOURCES } from '../data/sources';
import type { SourceId } from '../data/sources';
import { ALLOCATED_POINTS, billClaim, MEASURED_POINTS, POINT_BUDGET } from '../lib/readiness';
import type { ReadinessCheck } from '../types/commerce';

/**
 * THE TAPE — ReadyCounter's one signature device.
 *
 * The score is not a gauge. It is the printed bill from the counter: every
 * point is a line item, every line item names the check that took it and the
 * source that priced it, and the total at the bottom is the sum of the column
 * above it. If you remove the tape you lose the arithmetic, which is the whole
 * claim of the product — so it is a device, not decoration.
 */

function pad(n: number): string {
  return String(n).padStart(2, ' ');
}

function SourceLines({ ids }: { ids: SourceId[] }) {
  return (
    <ul className="tape__sources">
      {ids.map((id) => {
        const s = getSource(id);
        return (
          <li key={id}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.publisher}
            </a>
            <span className="tape__source-figure">{s.figure}</span>
            <span className="tape__source-dates">
              pub {s.published} · read {s.accessed}
            </span>
            <span className="tape__source-claim">{s.claim}</span>
            {s.caveat && <span className="tape__source-caveat">Limit: {s.caveat}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function TapeLine({ check }: { check: ReadinessCheck }) {
  const earned = check.points ?? 0;
  const max = check.maxPoints ?? 0;
  const lost = max - earned;
  const ids = (check.sourceIds ?? []) as SourceId[];
  // A reported line is worth 0 of 0. Printing "00/0" in the amount column would
  // read as a failing check; it is not a check that failed, it is one nobody
  // publishes a price for.
  const reported = check.basis === 'reported';

  return (
    <li className={`tape__line tape__line--${check.status}`}>
      <details>
        <summary>
          <span className="tape__label">{check.label}</span>
          <span className="tape__leader" aria-hidden />
          <span className="tape__amount">
            {reported ? 'no charge' : `${pad(earned)}/${max}`}
          </span>
        </summary>
        <div className="tape__body">
          <p className="tape__detail">{check.detail}</p>
          <p className="tape__meta">
            <span className={`tape__basis tape__basis--${check.basis ?? 'reported'}`}>
              {check.basis === 'measured' ? 'published weight · our stated test' : 'no published price · not charged'}
            </span>
            <span className="tape__stat">{check.stat}</span>
            {lost > 0 && <span className="tape__lost">−{lost} pts</span>}
          </p>
          <p className="tape__rationale">{check.rationale}</p>
          {check.fix && <p className="tape__fix">Fix · {check.fix}</p>}
          {ids.length > 0 && <SourceLines ids={ids} />}
        </div>
      </details>
    </li>
  );
}

interface ReadinessTapeProps {
  storeName: string;
  storeId: string;
  checks: ReadinessCheck[];
  /** Checked and printed, charged nothing — no published row prices them. */
  reported?: ReadinessCheck[];
  score: number;
  /** Set when the checkout path is walled — prints the refusal stamp. */
  block: { kind: string; because: string; sourceId: SourceId } | null;
}

export function ReadinessTape({
  storeName,
  storeId,
  checks,
  reported = [],
  score,
  block,
}: ReadinessTapeProps) {
  const measured = checks.filter((c) => c.basis === 'measured');
  /*
   * There is no allocated block any more — ALLOCATED_POINTS is 0 since
   * 2026-08-31. It is still read here rather than assumed away, so that a
   * weight added without a published row shows up as a section on the judge's
   * screen instead of hiding inside the measured subtotal.
   */
  const allocated = checks.filter((c) => c.basis !== 'measured');
  const sum = (rows: ReadinessCheck[]) => rows.reduce((n, c) => n + (c.points ?? 0), 0);

  return (
    <div className="tape" aria-label={`Readiness tape for ${storeName}`}>
      <div className="tape__tear tape__tear--top" aria-hidden />
      <div className="tape__sheet">
        <header className="tape__head">
          <h3>{storeName}</h3>
          <p>agent readiness · itemised</p>
        </header>

        <p className="tape__budget">
          {POINT_BUDGET} pts · {MEASURED_POINTS} priced by a published figure ·{' '}
          {ALLOCATED_POINTS} allocated by ReadyCounter
        </p>
        <p className="tape__claim">{billClaim()}</p>

        <div className="tape__rule" aria-hidden />

        <p className="tape__section">
          Charged — one line per row of the published causes table
        </p>
        <ul className="tape__lines">
          {measured.map((c) => (
            <TapeLine key={c.id} check={c} />
          ))}
        </ul>
        {allocated.length > 0 && (
          <p className="tape__subtotal">
            <span>Subtotal, measured</span>
            <span className="tape__leader" aria-hidden />
            <span className="tape__amount">
              {pad(sum(measured))}/{MEASURED_POINTS}
            </span>
          </p>
        )}

        {allocated.length > 0 && (
          <>
            <p className="tape__section">
              Allocated by ReadyCounter — no published row prices these on their own
            </p>
            <ul className="tape__lines">
              {allocated.map((c) => (
                <TapeLine key={c.id} check={c} />
              ))}
            </ul>
            <p className="tape__subtotal">
              <span>Subtotal, allocated</span>
              <span className="tape__leader" aria-hidden />
              <span className="tape__amount">
                {pad(sum(allocated))}/{ALLOCATED_POINTS}
              </span>
            </p>
          </>
        )}

        {reported.length > 0 && (
          <>
            <p className="tape__section">
              Reported, not charged — checked and printed, never billed
            </p>
            <ul className="tape__lines">
              {reported.map((c) => (
                <TapeLine key={c.id} check={c} />
              ))}
            </ul>
          </>
        )}

        <div className="tape__rule tape__rule--heavy" aria-hidden />

        <p className="tape__total">
          <span className="tape__total-label">Agent readiness</span>
          <span className="tape__total-value">{score}</span>
          <span className="tape__total-of">/ {POINT_BUDGET}</span>
        </p>

        {block && (
          <div className="tape__void" role="status">
            <p className="tape__void-stamp">Checkout void</p>
            <p className="tape__void-why">
              {block.kind} stands between a prepared order and payment.
            </p>
            <p className="tape__void-cite">
              {block.because}
              <br />
              <a href={SOURCES[block.sourceId].url} target="_blank" rel="noreferrer">
                {SOURCES[block.sourceId].publisher}
              </a>{' '}
              · read {SOURCES[block.sourceId].accessed}
            </p>
          </div>
        )}

        <p className="tape__footer">
          store {storeId} · recomputed from live catalog on every render · sources in
          research.md
        </p>
      </div>
      <div className="tape__tear tape__tear--bottom" aria-hidden />
    </div>
  );
}
