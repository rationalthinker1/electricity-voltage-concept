import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

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
    <div className={clsx('my-[32px] mx-0 py-[20px] px-[24px] bg-color-2 border border-border-2 border-l-[3px] border-l-teal rounded-2 relative max-[600px]:py-lg max-[600px]:px-[18px] accent-teal', open && 'is-open')}>
      <div className="header-compact-1">
        <span className="chip chip-teal chip-sm">{tag ?? 'Try it'}</span>
      </div>
      <div className="question-2">{question}</div>
      {hint && <div className="hint-1">{hint}</div>}
      <button
        type="button"
        className="button-outline-1 accent-brand"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide answer ↑' : 'Show answer →'}
      </button>
      {open && <div className="richtext-answer-1">{answer}</div>}
    </div>
  );
}
