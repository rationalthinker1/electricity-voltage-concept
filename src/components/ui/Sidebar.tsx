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
        'sticky top-0 self-start w-panel-sm max-h-screen overflow-auto bg-bg-elevated border border-border-1 rounded-6 flex flex-col transition-[width] duration-150 ease-in-out',
        side === 'right' ? 'border-l-border-2' : 'border-r-border-2',
        collapsed && 'w-3xl overflow-hidden',
        className,
      )}
      aria-label={typeof title === 'string' ? title : 'Sidebar'}
    >
      {(title !== undefined || collapsible) && (
        <header className="flex items-center justify-between gap-sm py-lg px-lg border-b border-border-1">
          {title !== undefined && <div className="eyebrow-dim text-2 tracking-3">{title}</div>}
          {collapsible && (
            <button
              type="button"
              className="icon-btn border border-border-1 rounded-3 w-icon h-icon text-5 p-0 hover:border-border-2"
              onClick={() => setCollapsed(c => !c)}
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
