import { useState, type ReactNode } from 'react';

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
  const classes = [
    'ui-sidebar',
    `ui-sidebar-${side}`,
    collapsed ? 'ui-sidebar-collapsed' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <aside className={classes} aria-label={typeof title === 'string' ? title : 'Sidebar'}>
      {(title !== undefined || collapsible) && (
        <header className="ui-sidebar-header">
          {title !== undefined && <div className="ui-sidebar-title">{title}</div>}
          {collapsible && (
            <button
              type="button"
              className="ui-sidebar-toggle"
              onClick={() => setCollapsed(c => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          )}
        </header>
      )}
      {!collapsed && <div className="ui-sidebar-body">{children}</div>}
    </aside>
  );
}
