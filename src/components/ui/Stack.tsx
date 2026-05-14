import type { CSSProperties, ReactNode } from 'react';

export interface StackProps {
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Stack({
  gap = 12,
  align = 'stretch',
  children,
  className,
  style,
}: StackProps) {
  const alignMap: Record<string, string> = {
    'start': 'flex-start', 'end': 'flex-end',
    'center': 'center', 'stretch': 'stretch',
  };
  const merged: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: alignMap[align],
    ...style,
  };
  return <div className={['ui-stack', className].filter(Boolean).join(' ')} style={merged}>{children}</div>;
}
