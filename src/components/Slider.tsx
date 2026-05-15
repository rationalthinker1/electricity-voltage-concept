import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface SliderProps {
  /** Label shown as <span class="slider-label"><span class="sym">…</span>…</span> */
  label: string;
  /** Greek letter / variable shown in amber italic before label.
   *  JSX, e.g. `sym={<>ε<sub>r</sub></>}`. */
  sym: ReactNode;
  /** Current value */
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Format function for the displayed value (right side of slider head) */
  format: (v: number) => string;
  /** Tick labels at left/right ends of the slider track */
  metaLeft?: ReactNode;
  metaRight?: ReactNode;
  onChange: (v: number) => void;
}

/**
 * Slider component: paints the gradient track via a CSS var (--pct) computed
 * from min/max/value, like the original vanilla Field.bindSlider helper.
 */
export function Slider({
  label, sym, value, min, max, step = 0.01,
  format, metaLeft, metaRight, onChange,
}: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const pct = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--pct', pct + '%');
  }, [value, min, max]);

  return (
    <div className="slider-group">
      <div className="slider-head">
        <span className="slider-label">
          <span className="sym">{sym}</span>
          {label}
        </span>
        <span className="slider-value" id={labelId}>
          {format(value)}
        </span>
      </div>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
      {(metaLeft || metaRight) && (
        <div className="flex justify-between mt-sm font-3 text-1 text-text-muted tracking-3">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      )}
    </div>
  );
}
