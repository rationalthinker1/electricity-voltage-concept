import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

export interface StackProps {
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Stack({ gap = 12, align = 'stretch', children, className, style }: StackProps) {
  const alignMap: Record<string, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  };
  const merged: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: alignMap[align],
    ...style,
  };
  return (
    <div className={clsx('min-w-0', className)} style={merged}>
      {children}
    </div>
  );
}
