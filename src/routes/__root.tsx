import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

import { TopNav } from '@/components/TopNav';

function RootLayout() {
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
      <div className="progress" id="progress" />
      <TopNav />
      <Outlet />
    </>
  );
}

export const Route = createRootRoute({ component: RootLayout });
