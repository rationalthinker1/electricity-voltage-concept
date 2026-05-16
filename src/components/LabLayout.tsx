import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  /** Override panel-title color: defaults to amber for inputs, teal for outputs */
  variant?: 'inputs' | 'outputs';
}

/** Controls or readouts panel. */
export function Panel({ title, children, variant = 'inputs' }: PanelProps) {
  const titleAccent =
    variant === 'inputs' ? 'text-accent before:bg-accent' : 'text-teal before:bg-teal';
  return (
    <div
      className={
        variant === 'inputs'
          ? 'bg-bg-card border-border rounded-3 p-2xl border'
          : 'bg-bg-card border-border rounded-3 p-2xl flex flex-col border'
      }
    >
      <div
        className={`font-3 text-1 tracking-4 mb-xl gap-md before:w-icon before:h-xxs flex items-center uppercase before:content-[''] ${titleAccent}`}
      >
        {title}
      </div>
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
      <div className="bg-color-canvas-bg border-border rounded-3 relative overflow-hidden border">
        {canvas}
        {legend && (
          <div className="gap-xl py-lg px-xl border-border bg-accent-soft flex flex-wrap border-t">
            {legend}
          </div>
        )}
      </div>
      <div className="gap-xl mt-2xl grid grid-cols-[1.4fr_1fr] max-xl:grid-cols-1">
        <Panel title="Inputs" variant="inputs">
          {inputs}
        </Panel>
        <Panel title="Outputs" variant="outputs">
          {outputs}
        </Panel>
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
      className="gap-sm font-3 text-1 text-color-text-dim tracking-3 flex items-center uppercase"
      style={style}
    >
      {swatchColor && (
        <span
          className={dot ? 'h-sm w-sm rounded-full' : 'h-xxs w-lg'}
          style={{ background: swatchColor }}
        />
      )}
      {children}
    </div>
  );
}
