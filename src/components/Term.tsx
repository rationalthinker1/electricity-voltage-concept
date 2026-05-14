import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';

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
      className={clsx(
        'group relative cursor-help text-color-4 border-b border-dotted border-accent pb-px outline-none hover:text-accent focus:text-accent accent-brand',
        open && 'text-accent',
      )}
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
      <span
        className={clsx(
          'absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[320px] py-md px-lg bg-color-3 border border-border-2 border-l-[3px] border-l-accent rounded-2 font-1 not-italic font-normal text-[13.5px] leading-[1.5] text-color-5 tracking-normal z-[50] opacity-0 invisible transition-opacity pointer-events-none shadow-1 max-[600px]:max-w-[240px] max-[600px]:text-[12.5px] group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible',
          open && 'opacity-100 visible',
        )}
        id={id}
        role="tooltip"
      >
        {def}
      </span>
    </span>
  );
}
