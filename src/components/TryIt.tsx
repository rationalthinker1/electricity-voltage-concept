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
    <div className="my-2xl py-lg px-xl bg-bg-elevated border-border-strong border-l-teal rounded-2 relative border border-l-3">
      <div className="mb-lg">
        <span className="font-3 text-1 text-teal tracking-4 py-xxs px-md bg-teal-soft rounded-1 uppercase">
          {tag ?? 'Try it'}
        </span>
      </div>
      <div className="title-display text-7 mb-md leading-3 font-light">{question}</div>
      {hint && <div className="text-4 text-text-muted mb-lg italic">{hint}</div>}
      <button
        type="button"
        className="border-accent text-accent py-sm px-lg font-3 text-2 tracking-3 rounded-2 mt-sm hover:bg-accent hover:text-bg cursor-pointer border bg-transparent uppercase transition-all duration-150"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide answer ↑' : 'Show answer →'}
      </button>
      {open && (
        <div className="mt-lg pt-lg border-border-strong text-6 text-text-dim [&_.formula-block]:my-lg [&_.formula-block]:py-md [&_.formula-block]:px-lg [&_.formula-content]:text-7 border-t border-dotted leading-5">
          {answer}
        </div>
      )}
    </div>
  );
}
