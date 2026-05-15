import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { TopNav } from '@/components/TopNav';

type ThemeMode = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'field-theory-theme';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return 'system';
  }
  return isThemeMode(stored) ? stored : 'system';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function RootLayout() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredThemeMode()));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');

    function applyTheme() {
      const nextTheme = themeMode === 'system' ? (media.matches ? 'light' : 'dark') : themeMode;
      setResolvedTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.dataset.themeMode = themeMode;
      document.documentElement.style.colorScheme = nextTheme;
      try {
        if (themeMode === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
        else window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
      } catch {
        // Theme still applies for the current session if storage is blocked.
      }
    }

    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [themeMode]);

  function cycleThemeMode() {
    setThemeMode(current => (
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'
    ));
  }

  // Progress bar tracks scroll across all routes.
  useEffect(() => {
    const bar = document.getElementById('progress');
    if (!bar) return;
    function update() {
      const h = document.documentElement;
      const pct = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100;
      bar!.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 h-xxs w-0 bg-accent z-[999] shadow-[0_0_12px_var(--accent-glow)] transition-[width] duration-100 ease-linear" id="progress" />
      <TopNav
        themeMode={themeMode}
        resolvedTheme={resolvedTheme}
        onCycleTheme={cycleThemeMode}
      />
      <Outlet />
    </>
  );
}

export const Route = createRootRoute({ component: RootLayout });
