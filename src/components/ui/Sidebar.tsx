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
        'w-panel-sm bg-bg-elevated border-border-1 rounded-6 sticky top-0 flex max-h-screen flex-col self-start overflow-auto border transition-[width] duration-150 ease-in-out',
        side === 'right' ? 'border-l-border-2' : 'border-r-border-2',
        collapsed && 'w-3xl overflow-hidden',
        className,
      )}
      aria-label={typeof title === 'string' ? title : 'Sidebar'}
    >
      {(title !== undefined || collapsible) && (
        <header className="gap-sm py-lg px-lg border-border-1 flex items-center justify-between border-b">
          {title !== undefined && <div className="eyebrow-dim text-2 tracking-3">{title}</div>}
          {collapsible && (
            <button
              type="button"
              className="icon-btn border-border-1 rounded-3 w-icon h-icon text-5 hover:border-border-2 border p-0"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          )}
        </header>
      )}
      {!collapsed && <div className="py-lg px-lg">{children}</div>}
    </aside>
  );
}
