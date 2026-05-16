/**
 * Inline numeric value with proper sub/sup typography.
 *
 * Replaces the legacy pattern `value={pretty(x)}` (which returned an HTML
 * string and was rendered as literal text in any caller that didn't use
 * dangerouslySetInnerHTML). Now: pass the number, get proper React JSX.
 *
 * Examples:
 *   <Num value={3.2e-4} />          → 3.20×10⁻⁴   (rendered with <sup>)
 *   <Num value={5.96e7} digits={2}/> → 5.96×10⁷
 *   <Num value={1788}/>             → 1788  (in normal range, no sci)
 *   <Num value={0.03}/>             → 0.030
 */
import { Fragment } from 'react';

interface NumProps {
  value: number;
  /** Significant digits in mantissa (default 3) */
  digits?: number;
  /** Force scientific notation even in normal range */
  sci?: boolean;
  /** Prefix sign explicitly for positives (default false) */
  showSign?: boolean;
}

export function Num({ value, digits = 3, sci = false, showSign = false }: NumProps) {
  if (!Number.isFinite(value)) return <span>—</span>;
  if (value === 0) return <span>0</span>;

  const abs = Math.abs(value);
  const useSci = sci || abs < 1e-3 || abs >= 1e6;

  if (!useSci) {
    const formatted = showSign && value > 0 ? '+' + value.toFixed(digits) : value.toFixed(digits);
    return <span>{formatted}</span>;
  }

  // Scientific notation
  const exp = Math.floor(Math.log10(abs));
  const mantissa = value / Math.pow(10, exp);
  const mStr = showSign && mantissa > 0 ? '+' + mantissa.toFixed(digits) : mantissa.toFixed(digits);

  return (
    <Fragment>
      {mStr}×10<sup className="font-3 align-[.45em] text-[.7em] leading-none">{exp}</sup>
    </Fragment>
  );
}
