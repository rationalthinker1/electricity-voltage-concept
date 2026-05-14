import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  side?: 'right' | 'bottom';
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  className,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      try { dlg.showModal(); } catch { /* already open */ }
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handleCancel = (e: Event) => { e.preventDefault(); onClose(); };
    const handleClose = () => { if (open) onClose(); };
    dlg.addEventListener('cancel', handleCancel);
    dlg.addEventListener('close', handleClose);
    return () => {
      dlg.removeEventListener('cancel', handleCancel);
      dlg.removeEventListener('close', handleClose);
    };
  }, [open, onClose]);

  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={['ui-drawer', `ui-drawer-${side}`, className].filter(Boolean).join(' ')}
      onClick={onBackdropClick}
      aria-label={typeof title === 'string' ? title : 'Drawer'}
    >
      <div className="ui-drawer-panel">
        <header className="ui-drawer-header">
          <div className="ui-drawer-title">{title}</div>
          <button type="button" className="ui-drawer-close" onClick={onClose} aria-label="Close drawer">×</button>
        </header>
        <div className="ui-drawer-body">{children}</div>
      </div>
    </dialog>
  );
}
