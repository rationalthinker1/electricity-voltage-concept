import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  title: string;
  children: ReactNode;
  /** Override panel-title color: defaults to amber for inputs, teal for outputs */
  variant?: 'inputs' | 'outputs';
}

/** Controls or readouts panel. */
export function Panel({ title, children, variant = 'inputs' }: PanelProps) {
  return (
    <div className={clsx('card-panel', variant === 'inputs' ? 'text-color-accent' : 'text-color-teal')}>
      <div className="title-panel">{title}</div>
      {children}
    </div>
  );
}

interface LabGridProps {
  /** Canvas (passed via AutoResizeCanvas) */
  canvas: ReactNode;
  /** Legend at the bottom of the canvas */
  legend?: ReactNode;
  /** Inputs panel content */
  inputs: ReactNode;
  /** Outputs panel content */
  outputs: ReactNode;
}

/**
 * Reusable interactive-lab body: canvas + legend on top, then a 2-column
 * grid (controls left, readouts right). Every lab uses this exact shape.
 */
export function LabGrid({ canvas, legend, inputs, outputs }: LabGridProps) {
  return (
    <>
      <div className="canvas-panel">
        {canvas}
        {legend && <div className="legend-base text-color-accent">{legend}</div>}
      </div>
      <div className="grid-lab">
        <Panel title="Inputs" variant="inputs">{inputs}</Panel>
        <Panel title="Outputs" variant="outputs">{outputs}</Panel>
      </div>
    </>
  );
}

interface LegendItemProps {
  swatchColor?: string;
  dot?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}
export function LegendItem({ swatchColor, dot, children, style }: LegendItemProps) {
  return (
    <div className="legend-item" style={style}>
      {swatchColor && (
        <span
          className={clsx('swatch-base', dot && 'swatch-dot')}
          style={{ background: swatchColor }}
        />
      )}
      {children}
    </div>
  );
}

