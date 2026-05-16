import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

interface AccordionContextValue {
  openIds: Set<string>;
  toggle: (id: string) => void;
  multiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  multiple?: boolean;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  children?: ReactNode;
  className?: string;
}

export function Accordion({
  multiple = false,
  value,
  defaultValue,
  onChange,
  children,
  className,
}: AccordionProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const current = value ?? internal;
  const openIds = useMemo(() => new Set(current), [current]);

  const toggle = useCallback(
    (id: string) => {
      const isOpen = openIds.has(id);
      let next: string[];
      if (multiple) {
        next = isOpen ? current.filter((x) => x !== id) : [...current, id];
      } else {
        next = isOpen ? [] : [id];
      }
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [openIds, multiple, current, value, onChange],
  );

  const ctx = useMemo(() => ({ openIds, toggle, multiple }), [openIds, toggle, multiple]);

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={clsx('gap-xs flex flex-col', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface ItemContextValue {
  id: string;
  open: boolean;
  baseId: string;
  toggle: () => void;
}

const ItemContext = createContext<ItemContextValue | null>(null);

export interface AccordionItemProps {
  id: string;
  children?: ReactNode;
  className?: string;
}

export function AccordionItem({ id, children, className }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem must be inside <Accordion>');
  const baseId = useId();
  const open = ctx.openIds.has(id);
  const value = useMemo(
    () => ({ id, open, baseId, toggle: () => ctx.toggle(id) }),
    [id, open, baseId, ctx],
  );
  return (
    <ItemContext.Provider value={value}>
      <div
        className={clsx(
          'border-border-1 rounded-5 bg-bg-card overflow-hidden border',
          open && 'border-border-2',
          className,
        )}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ children }: { children?: ReactNode }) {
  const item = useContext(ItemContext);
  if (!item) throw new Error('AccordionTrigger must be inside <AccordionItem>');
  return (
    <button
      type="button"
      className="gap-md py-lg px-lg text-text hover:bg-bg-card-hover focus-visible:outline-accent flex w-full cursor-pointer appearance-none items-center justify-between border-0 bg-transparent text-left font-[inherit] font-medium focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-expanded={item.open}
      aria-controls={`${item.baseId}-content`}
      id={`${item.baseId}-trigger`}
      onClick={item.toggle}
    >
      <span className="flex-1">{children}</span>
      <span
        className="font-3 text-7 text-text-dim w-lg text-center leading-none"
        aria-hidden="true"
      >
        {item.open ? '−' : '+'}
      </span>
    </button>
  );
}

export function AccordionContent({ children }: { children?: ReactNode }) {
  const item = useContext(ItemContext);
  if (!item) throw new Error('AccordionContent must be inside <AccordionItem>');
  if (!item.open) return null;
  return (
    <div
      role="region"
      id={`${item.baseId}-content`}
      aria-labelledby={`${item.baseId}-trigger`}
      className="py-sm px-lg pb-lg text-text-dim text-6 border-border border-t leading-5"
    >
      {children}
    </div>
  );
}
