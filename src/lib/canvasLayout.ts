/**
 * Text + overlay layout helpers for canvas draw loops.
 *
 * These are the patterns that recur across the demo files: a single label,
 * a label-over-value stack, an UPPERCASE eyebrow stat strip, and a legend
 * block. All pure functions of (ctx, opts) — they save/restore so they
 * don't leak state into the caller's draw loop.
 *
 * Theme-correctness: every helper takes its colour as an argument (defaulted
 * to a token from getCanvasColors()) so the per-frame colour read in
 * CLAUDE.md §9 keeps working — light/dark toggles re-paint on the next frame.
 *
 * Companion to `canvasPrimitives.ts` (circuit-element glyphs) and
 * `drawPlot.ts` (axes / line charts / reference lines). When in doubt:
 *   • Drawing a *thing* (resistor, charge, arrow)  → canvasPrimitives.ts
 *   • Drawing a *chart*                            → drawPlot.ts
 *   • Drawing *text or an overlay on top*         → here
 */

import { pathRoundRect } from './canvasPrimitives';
import { getCanvasColors } from './canvasTheme';

const DEFAULT_FONT_FAMILY = '"JetBrains Mono", monospace';

interface LabelOptions {
  x: number;
  y: number;
  text: string;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Font size in px. Default 10. */
  size?: number;
  /** Default 'normal'. */
  weight?: 'normal' | 'bold';
  /** Full font override; if set, supersedes size + weight. */
  font?: string;
}

/**
 * Draw a single line of monospace text. Replaces the 4-line
 *   fillStyle = …; font = …; textAlign = …; textBaseline = …; fillText(…)
 * preamble that appears ~250 times across the demos.
 */
export function drawLabel(ctx: CanvasRenderingContext2D, opts: LabelOptions): void {
  ctx.save();
  ctx.fillStyle = opts.color ?? getCanvasColors().textDim;
  ctx.font =
    opts.font ??
    `${opts.weight === 'bold' ? 'bold ' : ''}${opts.size ?? 10}px ${DEFAULT_FONT_FAMILY}`;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.baseline ?? 'alphabetic';
  ctx.fillText(opts.text, opts.x, opts.y);
  ctx.restore();
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawCaption — top-edge canvas caption.
 *
 *  Thin wrapper around drawLabel that pins the semantic intent: a short
 *  line of helper text sitting at the top of the canvas (baseline 'top',
 *  align 'left', default 10 px). Demos use this for "drag to orbit",
 *  "hold length fixed", figure subtitles, etc.
 *
 *  Default colour is `colors.textDim` (not withAlpha) because many
 *  captions are meant to be fully readable; callers can pass
 *  `withAlpha(colors.textDim, 0.75)` when they explicitly want it muted.
 * ─────────────────────────────────────────────────────────────────────── */

interface CaptionOptions {
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  align?: CanvasTextAlign;
}

export function drawCaption(ctx: CanvasRenderingContext2D, opts: CaptionOptions): void {
  const colors = getCanvasColors();
  drawLabel(ctx, {
    x: opts.x,
    y: opts.y,
    text: opts.text,
    color: opts.color ?? colors.textDim,
    size: opts.size ?? 10,
    align: opts.align ?? 'left',
    baseline: 'top',
  });
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawAnnotationBox — semi-transparent info panel with fill + stroke.
 *
 *  Replaces the recurring 10-statement pattern in KCL/KVL overlays:
 *    ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = colors.accent;
 *    ctx.fillRect(x, y, w, h); ctx.restore();
 *    ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = colors.accent;
 *    ctx.strokeRect(x, y, w, h); ctx.restore();
 * ─────────────────────────────────────────────────────────────────────── */

interface AnnotationBoxOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: string;
  fillAlpha?: number;
  strokeColor?: string;
  strokeAlpha?: number;
  radius?: number;
}

export function drawAnnotationBox(ctx: CanvasRenderingContext2D, opts: AnnotationBoxOptions): void {
  const colors = getCanvasColors();
  const x = opts.x;
  const y = opts.y;
  const w = opts.w;
  const h = opts.h;
  const fillColor = opts.fillColor ?? colors.accent;
  const fillAlpha = opts.fillAlpha ?? 0.1;
  const strokeColor = opts.strokeColor ?? colors.accent;
  const strokeAlpha = opts.strokeAlpha ?? 0.6;
  const radius = opts.radius ?? 0;

  ctx.save();
  ctx.globalAlpha = fillAlpha;
  ctx.fillStyle = fillColor;
  if (radius > 0) {
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = strokeAlpha;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.4;
  if (radius > 0) {
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
  } else {
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
}

interface LabeledValueOptions {
  x: number;
  y: number;
  /** Dim caption rendered on the top line. */
  label: string;
  /** Value string rendered on the second line. Caller formats. */
  value: string;
  /** If set, appended to value with a leading space: "1.23 mm²". */
  unit?: string;
  labelColor?: string;
  valueColor?: string;
  align?: CanvasTextAlign;
  /** Label font size. Default 9. */
  labelSize?: number;
  /** Value font size. Default 10. */
  valueSize?: number;
  /** Vertical gap between the two lines, in px. Default 12. */
  gap?: number;
  /** If true, the value line is rendered in bold. Default false. */
  valueBold?: boolean;
}

/**
 * Draw a dim label with a value line directly below it. The canonical
 * snippet from `AreaVsResistance.tsx` (and ~30 other demos):
 *
 *   drawLabeledValue(ctx, {
 *     x, y,
 *     label: 'cross-section',
 *     value: A.toFixed(2),
 *     unit: 'mm²',
 *     align: 'center',
 *   });
 *
 * `(x, y)` is the *label baseline*; the value line sits `gap` pixels below.
 */
export function drawLabeledValue(ctx: CanvasRenderingContext2D, opts: LabeledValueOptions): void {
  const colors = getCanvasColors();
  const labelSize = opts.labelSize ?? 9;
  const valueSize = opts.valueSize ?? 10;
  const gap = opts.gap ?? 12;
  const align = opts.align ?? 'left';
  const valueText = opts.unit ? `${opts.value} ${opts.unit}` : opts.value;

  drawLabel(ctx, {
    x: opts.x,
    y: opts.y,
    text: opts.label,
    color: opts.labelColor ?? colors.textDim,
    size: labelSize,
    align,
  });
  drawLabel(ctx, {
    x: opts.x,
    y: opts.y + gap,
    text: valueText,
    color: opts.valueColor ?? colors.textDim,
    size: valueSize,
    align,
    weight: opts.valueBold ? 'bold' : 'normal',
  });
}

interface EyebrowStatsOptions {
  x: number;
  y: number;
  /** Parts to join with the separator. e.g. ['COPPER', 'L = 2.3 m']. */
  parts: string[];
  color?: string;
  align?: CanvasTextAlign;
  /** Default 9. */
  size?: number;
  /** Default '  ·  ' (two spaces, middle dot, two spaces). */
  separator?: string;
  /** If true, the first part is upper-cased. Default true. */
  upperFirst?: boolean;
}

/**
 * Draw a "COPPER · L = 2.3 m" eyebrow stat strip in a single line. The
 * first part is upper-cased by default (matches the visual hierarchy of
 * the chapter eyebrows above the chart title).
 */
export function drawEyebrowStats(ctx: CanvasRenderingContext2D, opts: EyebrowStatsOptions): void {
  const colors = getCanvasColors();
  const separator = opts.separator ?? '  ·  ';
  const parts = opts.parts.slice();
  if ((opts.upperFirst ?? true) && parts.length > 0) {
    parts[0] = parts[0]!.toUpperCase();
  }
  drawLabel(ctx, {
    x: opts.x,
    y: opts.y,
    text: parts.join(separator),
    color: opts.color ?? colors.textMuted,
    size: opts.size ?? 9,
    align: opts.align ?? 'left',
  });
}

export type LegendSwatchKind = 'line' | 'dot' | 'dash' | 'text';

export interface LegendEntry {
  color: string;
  label: string;
  /** Default 'line'. */
  kind?: LegendSwatchKind;
}

interface LegendOptions {
  x: number;
  y: number;
  entries: LegendEntry[];
  /** Spacing between rows, in px. Default 14. */
  rowHeight?: number;
  /** Swatch width (line/dash) or diameter (dot), in px. Default 14. */
  swatchSize?: number;
  /** Gap between swatch and label, in px. Default 6. */
  swatchGap?: number;
  /** Label colour. Defaults to textDim. */
  textColor?: string;
  /** Label font size. Default 10. */
  size?: number;
}

/**
 * Draw a vertical legend block. Each entry is a coloured swatch followed
 * by a label. Replaces the ~30 hand-rolled blocks of the form
 *
 *   ctx.fillStyle = colors.accent;
 *   ctx.fillText('V(t)', x, y);
 *   ctx.fillStyle = colors.teal;
 *   ctx.fillText('I(t)', x, y + 14);
 *
 * For 'text'-kind entries no swatch is drawn — the label itself is
 * coloured by `entry.color`. Useful when the chart already encodes the
 * mapping through line colour alone.
 */
export function drawLegend(ctx: CanvasRenderingContext2D, opts: LegendOptions): void {
  const colors = getCanvasColors();
  const rowHeight = opts.rowHeight ?? 14;
  const swatchSize = opts.swatchSize ?? 14;
  const swatchGap = opts.swatchGap ?? 6;
  const size = opts.size ?? 10;
  const textColor = opts.textColor ?? colors.textDim;

  ctx.save();
  ctx.font = `${size}px ${DEFAULT_FONT_FAMILY}`;
  ctx.textBaseline = 'middle';

  for (let i = 0; i < opts.entries.length; i++) {
    const entry = opts.entries[i]!;
    const kind = entry.kind ?? 'line';
    const rowY = opts.y + i * rowHeight;
    let textX = opts.x;

    if (kind === 'text') {
      ctx.fillStyle = entry.color;
      ctx.textAlign = 'left';
      ctx.fillText(entry.label, opts.x, rowY);
      continue;
    }

    if (kind === 'line' || kind === 'dash') {
      ctx.strokeStyle = entry.color;
      ctx.lineWidth = 2;
      if (kind === 'dash') ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(opts.x, rowY);
      ctx.lineTo(opts.x + swatchSize, rowY);
      ctx.stroke();
      if (kind === 'dash') ctx.setLineDash([]);
      textX = opts.x + swatchSize + swatchGap;
    } else if (kind === 'dot') {
      ctx.fillStyle = entry.color;
      ctx.beginPath();
      ctx.arc(opts.x + swatchSize / 2, rowY, swatchSize / 3, 0, Math.PI * 2);
      ctx.fill();
      textX = opts.x + swatchSize + swatchGap;
    }

    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText(entry.label, textX, rowY);
  }

  ctx.restore();
}
