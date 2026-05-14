import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

  const toggle = useCallback((id: string) => {
    const isOpen = openIds.has(id);
    let next: string[];
    if (multiple) {
      next = isOpen ? current.filter(x => x !== id) : [...current, id];
    } else {
      next = isOpen ? [] : [id];
    }
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }, [openIds, multiple, current, value, onChange]);

  const ctx = useMemo(() => ({ openIds, toggle, multiple }), [openIds, toggle, multiple]);

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={['ui-accordion', className].filter(Boolean).join(' ')}>{children}</div>
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
    [id, open, baseId, ctx]
  );
  return (
    <ItemContext.Provider value={value}>
      <div className={['ui-accordion-item', open ? 'ui-accordion-item-open' : '', className].filter(Boolean).join(' ')}>
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
      className="ui-accordion-trigger"
      aria-expanded={item.open}
      aria-controls={`${item.baseId}-content`}
      id={`${item.baseId}-trigger`}
      onClick={item.toggle}
    >
      <span className="ui-accordion-trigger-label">{children}</span>
      <span className="ui-accordion-trigger-chev" aria-hidden="true">{item.open ? '−' : '+'}</span>
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
      className="ui-accordion-content"
    >
      {children}
    </div>
  );
}
