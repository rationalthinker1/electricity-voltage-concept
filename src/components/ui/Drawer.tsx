import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

/** Drawer side dial — controls anchor + radius + border edge. */
const drawerVariants = tv({
  variants: {
    side: {
      right: 'border-l-border-2 top-0 right-0 bottom-0 w-[min(420px,92vw)] border-l',
      bottom: 'border-t-border-2 rounded-t-6 right-0 bottom-0 left-0 max-h-[80vh] border-t',
    },
  },
  defaultVariants: { side: 'right' },
});

type DrawerVariantProps = VariantProps<typeof drawerVariants>;

export interface DrawerProps extends DrawerVariantProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, children, side, className }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      try {
        dlg.showModal();
      } catch {
        /* already open */
      }
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const handleClose = () => {
      if (open) onClose();
    };
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
        'text-text h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/55 backdrop:backdrop-blur-[2px]',
        className,
      )}
      onClick={onBackdropClick}
      aria-label={typeof title === 'string' ? title : 'Drawer'}
    >
      <div
        className={clsx(
          'bg-bg-elevated border-border-2 shadow-3 fixed flex flex-col overflow-hidden border',
          drawerVariants({ side }),
        )}
      >
        <header className="py-lg px-lg border-border-1 flex shrink-0 items-center justify-between border-b">
          <div className="font-2 text-7 text-text italic">{title}</div>
          <button
            type="button"
            className="icon-btn text-8 px-sm border-0 py-0"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </header>
        <div className="p-lg flex-1 overflow-auto">{children}</div>
      </div>
    </dialog>
  );
}
