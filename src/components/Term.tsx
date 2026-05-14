import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface TermProps {
  /** Short definition that appears in the popover. */
  def: ReactNode;
  /** The term itself (inline text, usually a single word or phrase). */
  children: ReactNode;
}

/**
 * Inline glossary term. The visible text gets a dotted underline; hover
 * or tap reveals a popover with the definition. Pure-CSS would work for
 * hover but not for keyboard + touch; this uses a small controlled
 * state for click-to-pin behaviour on touch devices, plus focus/blur for
 * keyboard.
 */
export function Term({ def, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Close on outside click (touch devices treat this as "tap to pin").
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`term${open ? ' open' : ''}`}
      onClick={() => setOpen(o => !o)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-expanded={open}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <span className="term-popover" id={id} role="tooltip">
        {def}
      </span>
    </span>
  );
}
