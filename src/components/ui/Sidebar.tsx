import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

export interface SidebarProps {
  title?: ReactNode;
  children?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  side?: 'left' | 'right';
  className?: string;
}

export function Sidebar({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  side = 'left',
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={clsx(
        'sticky top-0 self-start w-[260px] max-h-screen overflow-auto bg-color-2 border border-border-1 rounded-6 flex flex-col transition-[width] duration-150 ease-in-out',
        side === 'right' ? 'border-l-border-2' : 'border-r-border-2',
        collapsed && 'w-[56px] overflow-hidden',
        className,
      )}
      aria-label={typeof title === 'string' ? title : 'Sidebar'}
    >
      {(title !== undefined || collapsible) && (
        <header className="flex items-center justify-between gap-sm py-[12px] px-[14px] border-b border-border-1">
          {title !== undefined && <div className="font-3 text-[11px] tracking-[.1em] uppercase text-color-5">{title}</div>}
          {collapsible && (
            <button
              type="button"
              className="appearance-none bg-transparent border border-border-1 rounded-3 text-color-5 cursor-pointer w-[22px] h-[22px] text-[14px] leading-none p-0 hover:text-color-4 hover:border-border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_4px_var(--accent-soft)]"
              onClick={() => setCollapsed(c => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          )}
        </header>
      )}
      {!collapsed && <div className="py-[12px] px-[14px]">{children}</div>}
    </aside>
  );
}
