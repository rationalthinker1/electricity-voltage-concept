import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

interface TabsContextValue {
  activeId: string;
  setActive: (id: string) => void;
  baseId: string;
  registerTab: (id: string, el: HTMLButtonElement | null) => void;
  focusByOffset: (currentId: string, offset: number) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
}

export function Tabs({ value, defaultValue, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const activeId = value ?? internal;
  const baseId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderRef = useRef<string[]>([]);

  const setActive = useCallback((id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }, [value, onChange]);

  const registerTab = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(id, el);
      if (!orderRef.current.includes(id)) orderRef.current.push(id);
    } else {
      tabRefs.current.delete(id);
      orderRef.current = orderRef.current.filter(x => x !== id);
    }
  }, []);

  const focusByOffset = useCallback((currentId: string, offset: number) => {
    const order = orderRef.current;
    const idx = order.indexOf(currentId);
    if (idx === -1) return;
    const next = order[(idx + offset + order.length) % order.length];
    const el = tabRefs.current.get(next);
    if (el) {
      el.focus();
      setActive(next);
    }
  }, [setActive]);

  const ctx = useMemo(
    () => ({ activeId, setActive, baseId, registerTab, focusByOffset }),
    [activeId, setActive, baseId, registerTab, focusByOffset]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={clsx('flex flex-col gap-md', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={clsx('flex gap-xs border-b border-border-1', className)}>
      {children}
    </div>
  );
}

export interface TabProps {
  id: string;
  children?: ReactNode;
  disabled?: boolean;
}

export function Tab({ id, children, disabled }: TabProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be used inside <Tabs>');
  const selected = ctx.activeId === id;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ctx.focusByOffset(id, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ctx.focusByOffset(id, -1); }
    else if (e.key === 'Home') { e.preventDefault(); ctx.focusByOffset(id, -9999); }
    else if (e.key === 'End') { e.preventDefault(); ctx.focusByOffset(id, 9999); }
  };

  return (
    <button
      type="button"
      role="tab"
      ref={el => ctx.registerTab(id, el)}
      id={`${ctx.baseId}-tab-${id}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${id}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.setActive(id)}
      onKeyDown={onKeyDown}
      className={clsx(
        'appearance-none bg-transparent border-0 eyebrow-dim text-3 tracking-2 py-md px-lg cursor-pointer border-b-2 border-transparent -mb-px transition-colors duration-fast ease-in-out hover:not-disabled:text-text disabled:opacity-45 disabled:cursor-not-allowed',
        selected && 'text-accent border-b-accent',
      )}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  id: string;
  children?: ReactNode;
}

export function TabPanel({ id, children }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabPanel must be used inside <Tabs>');
  const selected = ctx.activeId === id;
  if (!selected) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${id}`}
      aria-labelledby={`${ctx.baseId}-tab-${id}`}
      className="text-text"
    >
      {children}
    </div>
  );
}
