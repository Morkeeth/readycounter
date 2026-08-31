import type { FieldReviewPayload } from '../api/client';

interface FieldReviewPanelProps {
  review: FieldReviewPayload;
  storeLabel?: string;
  compact?: boolean;
}

/** ≤3 do-this-week steps from review_against_field — audit → companion loop. */
export function FieldReviewPanel({ review, storeLabel, compact }: FieldReviewPanelProps) {
  const steps = review.nextSteps.slice(0, 3);
  const flags = review.flags.slice(0, 3);

  if (steps.length === 0 && flags.length === 0) {
    return (
      <aside className="field-review field-review--clear">
        <p className="field-review__kicker">Against the field</p>
        <p>No handbook flags from these signals — still re-check barcodes and UCP after any theme change.</p>
      </aside>
    );
  }

  return (
    <aside className={compact ? 'field-review field-review--compact' : 'field-review'} aria-label="Field review">
      <p className="field-review__kicker">Against the field</p>
      {storeLabel ? <p className="field-review__store">{storeLabel}</p> : null}
      <p className="field-review__compare">{review.comparedToField}</p>
      <ol className="field-review__steps">
        {flags.map((f, i) => (
          <li key={`${f.issueId}-${i}`}>
            <span className="field-review__rank">{f.issue.rank}</span>
            <div>
              <strong>{f.issue.title}</strong>
              <p className="field-review__note">{f.note}</p>
              <p className="field-review__do">
                <strong>Do this week.</strong> {f.issue.doThisWeek}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {steps.length > 0 && flags.length === 0 ? (
        <ol className="field-review__steps">
          {steps.map((s) => (
            <li key={s.slice(0, 40)}>
              <p className="field-review__do">{s}</p>
            </li>
          ))}
        </ol>
      ) : null}
      <p className="field-review__foot">
        <a href="/?view=integrations#against-the-field">Against the field</a>
        {' · '}
        <code>review_against_field</code>
      </p>
    </aside>
  );
}
