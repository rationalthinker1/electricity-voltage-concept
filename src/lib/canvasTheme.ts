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
