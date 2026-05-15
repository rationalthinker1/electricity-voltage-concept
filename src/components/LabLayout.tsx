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
        ? 'bg-bg-card border border-border rounded-[4px] p-[28px]'
        : 'bg-bg-card border border-border rounded-[4px] p-[28px] flex flex-col'
    }>
      <div className={`font-3 text-[10px] uppercase tracking-[.25em] mb-[24px] flex items-center gap-[10px] before:content-[''] before:w-[22px] before:h-[1px] ${titleAccent}`}>{title}</div>
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
      <div className="bg-color-canvas-bg border border-border rounded-[4px] overflow-hidden relative [&_canvas]:block [&_canvas]:w-full">
        {canvas}
        {legend && (
          <div className="flex gap-[22px] flex-wrap py-[14px] px-[24px] border-t border-border bg-accent-soft">
            {legend}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-[30px] mt-[30px] max-[1100px]:grid-cols-1">
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
      className="flex items-center gap-[8px] font-3 text-[10px] text-color-text-dim uppercase tracking-[.12em]"
      style={style}
    >
      {swatchColor && (
        <span
          className={dot ? 'w-[8px] h-[8px] rounded-full' : 'w-[14px] h-[2px]'}
          style={{ background: swatchColor }}
        />
      )}
      {children}
    </div>
  );
}
