import { useState, type ReactNode } from 'react';

interface TryItProps {
  /** The question text. */
  question: ReactNode;
  /** The answer — revealed when the user clicks "Show →". Can include
   *  full worked solution with <Formula/>, <strong/>, <Cite/>, etc. */
  answer: ReactNode;
  /** Optional one-line hint visible before reveal. */
  hint?: ReactNode;
  /** Optional figure-style tag (e.g., "Try 4.2"). */
  tag?: string;
}

/**
 * "Try it yourself" exercise card. Sits inline in narrative prose,
 * usually right after the relevant h2 section's demo, giving the reader
 * a concrete problem to work before reading on.
 *
 * Closed by default. Click "Show answer →" to reveal. Native button
 * + aria-expanded so keyboard / screen-reader works for free.
 */
export function TryIt({ question, answer, hint, tag }: TryItProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tryit${open ? ' open' : ''}`}>
      <div className="tryit-head">
        <span className="tryit-tag">{tag ?? 'Try it'}</span>
      </div>
      <div className="tryit-question">{question}</div>
      {hint && <div className="tryit-hint">{hint}</div>}
      <button
        type="button"
        className="tryit-reveal"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide answer ↑' : 'Show answer →'}
      </button>
      {open && <div className="tryit-answer">{answer}</div>}
    </div>
  );
}
