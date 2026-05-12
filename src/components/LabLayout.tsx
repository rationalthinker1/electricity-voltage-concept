import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  /** Override panel-title color: defaults to amber for inputs, teal for outputs */
  variant?: 'inputs' | 'outputs';
}

/** Controls or readouts panel. */
export function Panel({ title, children, variant = 'inputs' }: PanelProps) {
  return (
    <div className={variant === 'inputs' ? 'controls-panel' : 'readout-panel'}>
      <div className="panel-title">{title}</div>
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
      <div className="lab-canvas-wrap">
        {canvas}
        {legend && <div className="legend">{legend}</div>}
      </div>
      <div className="lab-grid">
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
          className={dot ? 'swatch dot' : 'swatch'}
          style={{ background: swatchColor }}
        />
      )}
      {children}
    </div>
  );
}
