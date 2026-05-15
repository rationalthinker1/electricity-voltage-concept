import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  /** Override panel-title color: defaults to amber for inputs, teal for outputs */
  variant?: 'inputs' | 'outputs';
}

/** Controls or readouts panel. */
export function Panel({ title, children, variant = 'inputs' }: PanelProps) {
  const titleAccent = variant === 'inputs' ? 'text-accent before:bg-accent' : 'text-teal before:bg-teal';
  return (
    <div className={
      variant === 'inputs'
        ? 'bg-bg-card border border-border rounded-3 p-2xl'
        : 'bg-bg-card border border-border rounded-3 p-2xl flex flex-col'
    }>
      <div className={`font-3 text-1 uppercase tracking-4 mb-xl flex items-center gap-md before:content-[''] before:w-icon before:h-xxs ${titleAccent}`}>{title}</div>
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
      <div className="bg-color-canvas-bg border border-border rounded-3 overflow-hidden relative">
        {canvas}
        {legend && (
          <div className="flex gap-xl flex-wrap py-lg px-xl border-t border-border bg-accent-soft">
            {legend}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-xl mt-2xl max-xl:grid-cols-1">
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
    <div
      className="flex items-center gap-sm font-3 text-1 text-color-text-dim uppercase tracking-3"
      style={style}
    >
      {swatchColor && (
        <span
          className={dot ? 'w-sm h-sm rounded-full' : 'w-lg h-xxs'}
          style={{ background: swatchColor }}
        />
      )}
      {children}
    </div>
  );
}
