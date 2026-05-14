import type { CSSProperties, ReactNode } from 'react';

export interface InlineProps {
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Inline({
  gap = 12,
  align = 'center',
  justify = 'start',
  wrap = true,
  children,
  className,
  style,
}: InlineProps) {
  const justifyMap: Record<string, string> = {
    'start': 'flex-start', 'end': 'flex-end', 'center': 'center',
    'space-between': 'space-between', 'space-around': 'space-around',
  };
  const alignMap: Record<string, string> = {
    'start': 'flex-start', 'end': 'flex-end',
    'center': 'center', 'baseline': 'baseline', 'stretch': 'stretch',
  };
  const merged: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    ...style,
  };
  return <div className={['inline-box-1', className].filter(Boolean).join(' ')} style={merged}>{children}</div>;
}
