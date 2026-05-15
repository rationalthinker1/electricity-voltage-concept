import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import clsx from 'clsx';

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
      className={clsx(
        'p-0 border-0 bg-transparent text-text max-w-none max-h-none w-full h-full backdrop:bg-black/55 backdrop:backdrop-blur-[2px]',
        className,
      )}
      onClick={onBackdropClick}
      aria-label={typeof title === 'string' ? title : 'Drawer'}
    >
      <div
        className={clsx(
          'fixed bg-bg-elevated border border-border-2 shadow-3 flex flex-col overflow-hidden',
          side === 'right' && 'top-0 right-0 bottom-0 w-[min(420px,92vw)] border-l border-l-border-2',
          side === 'bottom' && 'left-0 right-0 bottom-0 max-h-[80vh] border-t border-t-border-2 rounded-t-6',
        )}
      >
        <header className="flex items-center justify-between py-lg px-lg border-b border-border-1 shrink-0">
          <div className="font-2 italic text-7 text-text">{title}</div>
          <button type="button" className="icon-btn border-0 text-8 py-0 px-sm" onClick={onClose} aria-label="Close drawer">×</button>
        </header>
        <div className="p-lg overflow-auto flex-1">{children}</div>
      </div>
    </dialog>
  );
}
