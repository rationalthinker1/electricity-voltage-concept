import { getCanvasColors, withAlpha } from './canvasTheme';

export interface PlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AxisOptions {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  /** Number of evenly-spaced ticks, or an explicit array of data-space positions. */
  xTicks?: number | number[];
  /** Number of evenly-spaced ticks, or an explicit array of data-space positions. */
  yTicks?: number | number[];
  axisColor?: string;
  gridColor?: string;
  textColor?: string;
  font?: string;
  /** Custom formatter for x-axis tick labels. Receives the data-space value. */
  xTickFormat?: (v: number) => string;
  /** Custom formatter for y-axis tick labels. Receives the data-space value. */
  yTickFormat?: (v: number) => string;
  /** Suppress grid lines while keeping the frame + tick labels. */
  noGrid?: boolean;
}

export interface LinePlotOptions {
  color?: string;
  lineWidth?: number;
  fill?: boolean;
  fillColor?: string;
}

export interface GridLinesOptions {
  /** Stroke colour for the grid. Defaults to a low-contrast textMuted alpha. */
  color?: string;
  /** Line width. Default 0.5. */
  lineWidth?: number;
  /** Dash pattern. Default [2, 4]. Pass `null` for a solid line. */
  dash?: number[] | null;
  /** Data-space x extents — used to map xTicks values into pixels. */
  xMin?: number;
  xMax?: number;
  /** Data-space y extents — used to map yTicks values into pixels. */
  yMin?: number;
  yMax?: number;
  /**
   * If false, omit the boundary tick lines that would overlap the axis
   * frame (xMin / xMax / yMin / yMax). Default true.
   */
  skipBoundary?: boolean;
}

export interface BarChartOptions {
  colors?: string[];
  barColors?: string[];
  barWidth?: number;
  gap?: number;
  labels?: string[];
  labelColor?: string;
  /** If true, don't draw a bar for values at yMin (useful for sparse spectra). */
  skipZero?: boolean;
}

export interface ReferenceLineOptions {
  color?: string;
  lineWidth?: number;
  dash?: number[];
  alpha?: number;
  /** Optional annotation drawn alongside the line (e.g. "τ", "63%", "V₀"). */
  label?: string;
  /**
   * Where the label sits along the line. For hLine: 'start' = left edge,
   * 'end' = right edge (default), 'center' = midpoint. For vLine: 'start'
   * = top, 'end' = bottom (default), 'center' = midpoint.
   */
  labelAlign?: 'start' | 'end' | 'center';
  /** Label colour. Defaults to the line colour. */
  labelColor?: string;
  /** Label font size in px. Default 9. */
  labelSize?: number;
}

/**
 * Build data-space → pixel-space mappers for a given plot rect and ranges.
 *
 *   const { xOf, yOf } = makePlotMappers(rect, 0, 10, -1, 1);
 *   const px = xOf(5);   // centre of the rect horizontally
 *   const py = yOf(0);   // baseline of the rect vertically
 */
export function makePlotMappers(
  rect: PlotRect,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) {
  const xScale = rect.w / (xMax - xMin);
  const yScale = rect.h / (yMax - yMin);
  return {
    xOf: (v: number) => rect.x + (v - xMin) * xScale,
    yOf: (v: number) => rect.y + rect.h - (v - yMin) * yScale,
  };
}

/**
 * Draw a framed plot area with optional grid lines and axis labels.
 * The frame is drawn inside the supplied rect; padding for labels is
 * left to the caller (reduce rect.w / rect.h accordingly).
 *
 * When xTicks or yTicks are arrays, grid lines and labels are placed at
 * exactly those data-space positions (clipped to the visible range).
 */
export function drawAxes(ctx: CanvasRenderingContext2D, rect: PlotRect, opts: AxisOptions) {
  const colors = getCanvasColors();
  const axisColor = opts.axisColor ?? colors.border;
  const gridColor = opts.gridColor ?? withAlpha(colors.textMuted, 0.25);
  const textColor = opts.textColor ?? colors.textDim;
  const font = opts.font ?? '10px "JetBrains Mono", monospace';

  ctx.save();
  ctx.translate(rect.x, rect.y);

  // Frame
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, rect.w, rect.h);

  // Resolve ticks
  const xTickCount = typeof opts.xTicks === 'number' ? opts.xTicks : 5;
  const yTickCount = typeof opts.yTicks === 'number' ? opts.yTicks : 5;
  const xTickArray = Array.isArray(opts.xTicks)
    ? opts.xTicks.filter((v) => v >= opts.xMin && v <= opts.xMax)
    : Array.from(
        { length: xTickCount + 1 },
        (_, i) => opts.xMin + (i / xTickCount) * (opts.xMax - opts.xMin),
      );
  const yTickArray = Array.isArray(opts.yTicks)
    ? opts.yTicks.filter((v) => v >= opts.yMin && v <= opts.yMax)
    : Array.from(
        { length: yTickCount + 1 },
        (_, i) => opts.yMin + (i / yTickCount) * (opts.yMax - opts.yMin),
      );

  // Grid lines
  if (!opts.noGrid) {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);

    for (const v of xTickArray) {
      if (v === opts.xMin || v === opts.xMax) continue;
      const x = ((v - opts.xMin) / (opts.xMax - opts.xMin)) * rect.w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.h);
      ctx.stroke();
    }

    for (const v of yTickArray) {
      if (v === opts.yMin || v === opts.yMax) continue;
      const y = rect.h - ((v - opts.yMin) / (opts.yMax - opts.yMin)) * rect.h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.w, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  // Tick labels
  ctx.fillStyle = textColor;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const xFmt = opts.xTickFormat ?? fmtTick;
  const yFmt = opts.yTickFormat ?? fmtTick;
  for (const v of xTickArray) {
    const x = ((v - opts.xMin) / (opts.xMax - opts.xMin)) * rect.w;
    ctx.fillText(xFmt(v), x, rect.h + 4);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const v of yTickArray) {
    const y = rect.h - ((v - opts.yMin) / (opts.yMax - opts.yMin)) * rect.h;
    ctx.fillText(yFmt(v), -4, y);
  }

  // Axis labels
  if (opts.xLabel) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = textColor;
    ctx.fillText(opts.xLabel, rect.w / 2, rect.h + 18);
  }

  if (opts.yLabel) {
    ctx.save();
    ctx.translate(-28, rect.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = textColor;
    ctx.fillText(opts.yLabel, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw just the grid lines (no frame, no labels) at the given data-space
 * tick positions. Useful when a demo wants the frame and tick labels in a
 * non-standard place but still wants the grid raster behind its curves.
 *
 *   drawGridLines(ctx, rect, [0, 5, 10, 15], [-1, 0, 1], {
 *     xMin: 0, xMax: 20, yMin: -1, yMax: 1,
 *   });
 *
 * When `xMin`/`xMax` (or `yMin`/`yMax`) are omitted, the tick arrays are
 * treated as already-pixel-space positions inside the rect — equivalent to
 * `xMin = 0` and `xMax = rect.w`.
 */
export function drawGridLines(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  xTicks: number[],
  yTicks: number[],
  opts: GridLinesOptions = {},
) {
  const colors = getCanvasColors();
  const gridColor = opts.color ?? withAlpha(colors.textMuted, 0.25);
  const lineWidth = opts.lineWidth ?? 0.5;
  const dash = opts.dash === undefined ? [2, 4] : opts.dash;
  const skipBoundary = opts.skipBoundary ?? true;

  const xMin = opts.xMin ?? 0;
  const xMax = opts.xMax ?? rect.w;
  const yMin = opts.yMin ?? 0;
  const yMax = opts.yMax ?? rect.h;

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineWidth;
  if (dash) ctx.setLineDash(dash);

  for (const v of xTicks) {
    if (skipBoundary && (v === xMin || v === xMax)) continue;
    const x = rect.x + ((v - xMin) / (xMax - xMin)) * rect.w;
    ctx.beginPath();
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x, rect.y + rect.h);
    ctx.stroke();
  }
  for (const v of yTicks) {
    if (skipBoundary && (v === yMin || v === yMax)) continue;
    const y = rect.y + rect.h - ((v - yMin) / (yMax - yMin)) * rect.h;
    ctx.beginPath();
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.w, y);
    ctx.stroke();
  }

  if (dash) ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw a horizontal reference line at a given data-space y value.
 */
export function drawHLine(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  yValue: number,
  yMin: number,
  yMax: number,
  opts: ReferenceLineOptions = {},
) {
  const colors = getCanvasColors();
  const lineColor = opts.color ?? colors.accent;
  const y = rect.y + rect.h - ((yValue - yMin) / (yMax - yMin)) * rect.h;
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 0.45;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = opts.lineWidth ?? 1;
  if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath();
  ctx.moveTo(rect.x, y);
  ctx.lineTo(rect.x + rect.w, y);
  ctx.stroke();
  if (opts.dash) ctx.setLineDash([]);
  if (opts.label) {
    const align = opts.labelAlign ?? 'end';
    const labelX =
      align === 'start'
        ? rect.x + 4
        : align === 'center'
          ? rect.x + rect.w / 2
          : rect.x + rect.w - 4;
    ctx.globalAlpha = 1;
    ctx.fillStyle = opts.labelColor ?? lineColor;
    ctx.font = `${opts.labelSize ?? 9}px "JetBrains Mono", monospace`;
    ctx.textAlign = align === 'start' ? 'left' : align === 'center' ? 'center' : 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.label, labelX, y - 2);
  }
  ctx.restore();
}

/**
 * Draw a vertical reference line at a given data-space x value.
 */
export function drawVLine(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  xValue: number,
  xMin: number,
  xMax: number,
  opts: ReferenceLineOptions = {},
) {
  const colors = getCanvasColors();
  const lineColor = opts.color ?? colors.accent;
  const x = rect.x + ((xValue - xMin) / (xMax - xMin)) * rect.w;
  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 0.45;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = opts.lineWidth ?? 1;
  if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath();
  ctx.moveTo(x, rect.y);
  ctx.lineTo(x, rect.y + rect.h);
  ctx.stroke();
  if (opts.dash) ctx.setLineDash([]);
  if (opts.label) {
    const align = opts.labelAlign ?? 'end';
    const labelY =
      align === 'start'
        ? rect.y + 4
        : align === 'center'
          ? rect.y + rect.h / 2
          : rect.y + rect.h - 4;
    ctx.globalAlpha = 1;
    ctx.fillStyle = opts.labelColor ?? lineColor;
    ctx.font = `${opts.labelSize ?? 9}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = align === 'start' ? 'top' : align === 'center' ? 'middle' : 'bottom';
    ctx.fillText(opts.label, x + 4, labelY);
  }
  ctx.restore();
}

/**
 * Stroke a line plot through normalized points.
 * Points are in data-space; they are mapped into the rect using the
 * supplied x/y ranges.
 */
export function drawLinePlot(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  points: Array<{ x: number; y: number }>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  opts: LinePlotOptions = {},
) {
  if (points.length < 2) return;
  const colors = getCanvasColors();
  const color = opts.color ?? colors.accent;

  const { xOf, yOf } = makePlotMappers(rect, xMin, xMax, yMin, yMax);

  ctx.save();
  ctx.beginPath();
  let started = false;
  for (const p of points) {
    const px = xOf(p.x);
    const py = yOf(p.y);
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }

  if (opts.fill) {
    const last = points[points.length - 1]!;
    const first = points[0]!;
    ctx.lineTo(xOf(last.x), rect.y + rect.h);
    ctx.lineTo(xOf(first.x), rect.y + rect.h);
    ctx.closePath();
    ctx.fillStyle = opts.fillColor ?? withAlpha(color, 0.15);
    ctx.fill();
    // Re-stroke the line on top
    ctx.beginPath();
    started = false;
    for (const p of points) {
      const px = xOf(p.x);
      const py = yOf(p.y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = opts.lineWidth ?? 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a bar chart inside the supplied rect.
 * Values are in data-space; each bar is clipped to the rect height.
 *
 * Bars are distributed evenly across the full width of the rect.
 * Use `labels` for x-axis category labels and `barColors` for per-bar colours.
 */
export function drawBarChart(
  ctx: CanvasRenderingContext2D,
  rect: PlotRect,
  bars: Array<{ value: number; label?: string }>,
  yMin: number,
  yMax: number,
  opts: BarChartOptions = {},
) {
  if (bars.length === 0) return;
  const colors = getCanvasColors();
  const palette = opts.colors ?? [colors.pink, colors.teal, colors.accent, colors.blue];
  const barColors = opts.barColors;
  const gap = opts.gap ?? 4;
  const totalGap = gap * (bars.length + 1);
  const barW = Math.min(opts.barWidth ?? 48, (rect.w - totalGap) / bars.length);
  const totalBarW = barW * bars.length + gap * (bars.length - 1);
  const startX = rect.x + (rect.w - totalBarW) / 2;

  ctx.save();
  ctx.font = '10px "JetBrains Mono", monospace';

  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    if (opts.skipZero && b.value <= yMin) continue;

    const bx = startX + i * (barW + gap);
    const t = (b.value - yMin) / (yMax - yMin);
    const bh = Math.max(0, Math.min(1, t)) * rect.h;
    const by = rect.y + rect.h - bh;

    ctx.fillStyle = barColors?.[i] ?? palette[i % palette.length]!;
    ctx.fillRect(bx, by, barW, bh);

    // Value label above bar
    if (b.value > yMin) {
      ctx.fillStyle = opts.labelColor ?? colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(fmtTick(b.value), bx + barW / 2, by - 2);
    }

    // Optional category label below bar
    if (b.label || (opts.labels && opts.labels[i])) {
      ctx.fillStyle = opts.labelColor ?? colors.textDim;
      ctx.textBaseline = 'top';
      ctx.fillText(b.label ?? opts.labels![i]!, bx + barW / 2, rect.y + rect.h + 4);
    }
  }

  ctx.restore();
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawPlotTitle — centred title at the top of a plot area.
 *
 *  Replaces the recurring 4-line preamble:
 *    ctx.font = '10px ...'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
 *    ctx.fillText(title, w / 2, 8);
 * ─────────────────────────────────────────────────────────────────────── */

interface PlotTitleOptions {
  x: number;
  y?: number;
  title: string;
  color?: string;
  size?: number;
}

export function drawPlotTitle(ctx: CanvasRenderingContext2D, options: PlotTitleOptions): void {
  const colors = getCanvasColors();
  ctx.save();
  ctx.fillStyle = options.color ?? colors.textDim;
  ctx.font = `${options.size ?? 10}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(options.title, options.x, options.y ?? 8);
  ctx.restore();
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawPlotLegend — inline legend with coloured swatches inside a plot rect.
 *
 *  Replaces hand-rolled legend blocks that pair a small coloured rectangle
 *  with a label (e.g. DiodeCharacteristic, VoltageDrivesFlow).
 *
 *  Entries are stacked vertically starting at (x, y).
 * ─────────────────────────────────────────────────────────────────────── */

export interface PlotLegendEntry {
  color: string;
  label: string;
}

interface PlotLegendOptions {
  x: number;
  y: number;
  entries: PlotLegendEntry[];
  swatchWidth?: number;
  swatchHeight?: number;
  swatchGap?: number;
  rowHeight?: number;
  textColor?: string;
  textSize?: number;
}

export function drawPlotLegend(ctx: CanvasRenderingContext2D, options: PlotLegendOptions): void {
  const colors = getCanvasColors();
  const swatchW = options.swatchWidth ?? 10;
  const swatchH = options.swatchHeight ?? 2;
  const swatchGap = options.swatchGap ?? 6;
  const rowHeight = options.rowHeight ?? 14;
  const textSize = options.textSize ?? 10;
  const textColor = options.textColor ?? colors.text;

  ctx.save();
  ctx.font = `${textSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < options.entries.length; i++) {
    const entry = options.entries[i]!;
    const rowY = options.y + i * rowHeight;

    ctx.fillStyle = entry.color;
    ctx.fillRect(options.x, rowY - swatchH / 2, swatchW, swatchH);

    ctx.fillStyle = textColor;
    ctx.fillText(entry.label, options.x + swatchW + swatchGap, rowY);
  }

  ctx.restore();
}

function fmtTick(v: number): string {
  if (Math.abs(v) >= 10000) return v.toExponential(1);
  if (Math.abs(v) >= 1) return v.toFixed(1).replace(/\.0$/, '');
  if (Math.abs(v) >= 0.01) return v.toFixed(2);
  return v.toExponential(1);
}
