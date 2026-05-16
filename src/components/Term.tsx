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
      className={`group/term text-text border-accent italic-inherit hover:text-accent focus:text-accent relative cursor-help border-b border-dotted pb-px outline-none ${open ? 'text-accent' : ''}`}
      onClick={() => setOpen((o) => !o)}
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
      <span
        className={`max-w-panel py-lg px-lg bg-bg-card border-border-strong border-l-accent rounded-2 font-1 text-4 text-text-dim duration-fast after:border-t-bg-card max-sm:max-w-panel-sm max-sm:text-3 pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max -translate-x-1/2 border border-l-3 leading-4 font-normal tracking-normal not-italic shadow-[0_4px_16px_var(--shadow-strong)] transition-[opacity,visibility] after:absolute after:top-full after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:border-t-6 after:border-r-6 after:border-l-6 after:border-r-transparent after:border-l-transparent after:content-[''] ${open ? 'visible opacity-100' : 'invisible opacity-0 group-hover/term:visible group-hover/term:opacity-100 group-focus/term:visible group-focus/term:opacity-100'}`}
        id={id}
        role="tooltip"
      >
        {def}
      </span>
    </span>
  );
}
