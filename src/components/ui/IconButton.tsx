import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

/**
 * Small icon-shaped button — close, dismiss, disclosure, etc.
 * Carries the shared focus-visible accent ring and hover text-bump;
 * sizing (padding, width/height, font-size, border) is intentionally
 * left to the caller via `className` because each call site
 * (Banner ×, Drawer ×, Sidebar toggle) wants different dimensions.
 *
 * Replaces the legacy `.icon-btn` recipe in main.css.
 */
export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={clsx(
        'text-text-dim hover:text-text focus-visible:outline-accent inline-flex cursor-pointer appearance-none items-center justify-center bg-transparent leading-none focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      {...rest}
    />
  );
});
