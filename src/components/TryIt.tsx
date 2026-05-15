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
    <div className="my-[32px] py-[20px] px-[24px] bg-bg-elevated border border-border-strong border-l-[3px] border-l-teal rounded-2 relative">
      <div className="mb-[12px]">
        <span className="font-3 text-[10px] text-teal tracking-[.22em] uppercase py-[2px] px-[8px] bg-teal-soft rounded-1">{tag ?? 'Try it'}</span>
      </div>
      <div className="font-2 italic font-light text-[19px] leading-[1.4] text-text mb-[8px]">{question}</div>
      {hint && <div className="text-[13px] text-text-muted mb-[12px] italic">{hint}</div>}
      <button
        type="button"
        className="bg-transparent border border-accent text-accent py-[6px] px-[14px] font-3 text-[11px] tracking-[.15em] uppercase cursor-pointer rounded-2 transition-all duration-150 mt-[4px] hover:bg-accent hover:text-bg"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide answer ↑' : 'Show answer →'}
      </button>
      {open && (
        <div className="mt-[16px] pt-[16px] border-t border-dotted border-border-strong text-[15px] leading-[1.65] text-text-dim [&_strong]:text-text [&_strong]:font-medium [&_em]:text-text [&_em]:italic [&_p]:mb-[.9em] [&_p:last-child]:mb-0 [&_.formula-block]:my-[14px] [&_.formula-block]:py-[10px] [&_.formula-block]:px-[16px] [&_.formula-content]:text-[20px] [&_.cite]:inline-block [&_.cite]:font-3 [&_.cite]:text-[10px] [&_.cite]:align-super [&_.cite]:leading-none [&_.cite]:text-accent [&_.cite]:bg-accent-soft [&_.cite]:py-px [&_.cite]:px-[5px] [&_.cite]:mx-px [&_.cite]:rounded-2 [&_.cite]:no-underline hover:[&_.cite]:bg-accent hover:[&_.cite]:text-bg">
          {answer}
        </div>
      )}
    </div>
  );
}
