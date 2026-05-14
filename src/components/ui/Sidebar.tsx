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
        'sidebar-1',
        side === 'right' ? 'sidebar-right-1' : 'sidebar-left-1',
        collapsed && 'is-collapsed',
        className,
      )}
      aria-label={typeof title === 'string' ? title : 'Sidebar'}
    >
      {(title !== undefined || collapsible) && (
        <header className="sidebar-header-1">
          {title !== undefined && <div className="label-mono-1">{title}</div>}
          {collapsible && (
            <button
              type="button"
              className="button-icon-bordered-1"
              onClick={() => setCollapsed(c => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          )}
        </header>
      )}
      {!collapsed && <div className="sidebar-body-1">{children}</div>}
    </aside>
  );
}
