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
    <div className="my-2xl py-lg px-xl bg-bg-elevated border border-border-strong border-l-3 border-l-teal rounded-2 relative">
      <div className="mb-lg">
        <span className="font-3 text-1 text-teal tracking-4 uppercase py-xxs px-md bg-teal-soft rounded-1">{tag ?? 'Try it'}</span>
      </div>
      <div className="title-display font-light text-7 leading-3 mb-md">{question}</div>
      {hint && <div className="text-4 text-text-muted mb-lg italic">{hint}</div>}
      <button
        type="button"
        className="bg-transparent border border-accent text-accent py-sm px-lg font-3 text-2 tracking-3 uppercase cursor-pointer rounded-2 transition-all duration-150 mt-sm hover:bg-accent hover:text-bg"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide answer ↑' : 'Show answer →'}
      </button>
      {open && (
        <div className="mt-lg pt-lg border-t border-dotted border-border-strong text-6 leading-5 text-text-dim [&_strong]:text-text [&_strong]:font-medium [&_em]:text-text [&_em]:italic [&_p]:mb-prose-1 [&_p:last-child]:mb-0 [&_.formula-block]:my-lg [&_.formula-block]:py-md [&_.formula-block]:px-lg [&_.formula-content]:text-7 [&_.cite]:inline-block [&_.cite]:font-3 [&_.cite]:text-1 [&_.cite]:align-super [&_.cite]:leading-none [&_.cite]:text-accent [&_.cite]:bg-accent-soft [&_.cite]:py-px [&_.cite]:px-sm [&_.cite]:mx-px [&_.cite]:rounded-2 [&_.cite]:no-underline hover:[&_.cite]:bg-accent hover:[&_.cite]:text-bg">
          {answer}
        </div>
      )}
    </div>
  );
}
