/**
 * Theme-aware canvas color system.
 *
 * Reads CSS custom properties from :root so every canvas rendering
 * automatically respects the current light / dark mode.  Cached until
 * the data-theme attribute changes.
 *
 * Usage in a draw loop:
 *   const colors = getCanvasColors();
 *   ctx.fillStyle = colors.bg;
 *
 * When using AutoResizeCanvas, colors are already provided on CanvasInfo:
 *   setup({ w, h, ctx, dpr, canvas, colors }) { … }
 */

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  cardBg: string;
  cardBgHover: string;
  text: string;
  textDim: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  teal: string;
  tealSoft: string;
  pink: string;
  blue: string;
  yellow: string;
  overlay: string;
  border: string;
  borderStrong: string;
  canvasBg: string;
}

let cached: ThemeColors | null = null;

export function getCanvasColors(): ThemeColors {
  if (cached) return cached;
  const root = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => root.getPropertyValue(name).trim() || fallback;

  cached = {
    bg: get('--color-bg-elevated', '#121215'),
    surface: get('--color-surface', '#16161a'),
    surfaceHover: get('--color-surface-hover', '#1c1c22'),
    cardBg: get('--color-card-bg', '#16161a'),
    cardBgHover: get('--color-card-bg-hover', '#1c1c22'),
    text: get('--color-text', '#ecebe5'),
    textDim: get('--color-text-dim', '#a09e95'),
    textMuted: get('--color-text-muted', '#5b5953'),
    accent: get('--color-accent', '#ff6b2a'),
    accentSoft: get('--color-accent-soft', 'rgba(255,107,42,.15)'),
    accentGlow: get('--color-accent-glow', 'rgba(255,107,42,.45)'),
    teal: get('--color-teal', '#6cc5c2'),
    tealSoft: get('--color-teal-soft', 'rgba(108,197,194,.18)'),
    pink: get('--color-pink', '#ff3b6e'),
    blue: get('--color-blue', '#5baef8'),
    yellow: get('--color-yellow', '#ffcc55'),
    overlay: get('--color-overlay', '#3c3c44'),
    border: get('--color-border', 'rgba(255,255,255,.07)'),
    borderStrong: get('--color-border-strong', 'rgba(255,255,255,.14)'),
    canvasBg: get('--color-canvas-bg', '#0d0d10'),
  };
  return cached;
}

/** Drop the cache so the next call re-reads from the DOM. */
export function invalidateCanvasColors() {
  cached = null;
}

/**
 * Parse a hex or rgb() colour string into numeric [r, g, b] components.
 * Falls back to [128, 128, 128] for unrecognised formats.
 */
export function hexToRgb(hex: string): [number, number, number] {
  if (hex.startsWith('#') && hex.length === 7) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }
  const m = hex.match(/rgba?\((\d+),(\d+),(\d+)/);
  if (m) return [parseInt(m[1]!, 10), parseInt(m[2]!, 10), parseInt(m[3]!, 10)];
  return [128, 128, 128];
}

/**
 * Linearly interpolate between two CSS colour strings in RGB space.
 * Both colours are parsed with `hexToRgb`; `t` in [0, 1].
 */
export function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, bl1] = hexToRgb(a);
  const [r2, g2, bl2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(bl1 + (bl2 - bl1) * t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * Return `color` with its alpha channel replaced by `alpha`.
 * Accepts hex (#rrggbb / #rgb) or rgb()/rgba() strings; passes anything else
 * through untouched. Lets draw loops derive translucency from a theme token
 * instead of baking literal rgba values.
 */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let r: number;
    let g: number;
    let b: number;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      r = parseInt(color[1]! + color[1]!, 16);
      g = parseInt(color[2]! + color[2]!, 16);
      b = parseInt(color[3]! + color[3]!, 16);
    } else {
      return color;
    }
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1]!.split(',').map((s) => s.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha.toFixed(3)})`;
  }
  return color;
}

/* Auto-invalidate when the theme attribute changes. */
if (typeof window !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'data-theme') {
        cached = null;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });
}
