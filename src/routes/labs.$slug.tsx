import { createFileRoute, notFound } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getLab } from '@/labs/data/manifest';

// Lazy-load each lab's content so visiting the TOC doesn't ship all 16.
const LAB_MODULES: Record<string, ReturnType<typeof lazy>> = {
  'coulomb':        lazy(() => import('@/labs/CoulombLab')),
  'e-field':        lazy(() => import('@/labs/EFieldLab')),
  'gauss':          lazy(() => import('@/labs/GaussLab')),
  'potential':      lazy(() => import('@/labs/PotentialLab')),
  'biot-savart':    lazy(() => import('@/labs/BiotSavartLab')),
  'ampere':         lazy(() => import('@/labs/AmpereLab')),
  'lorentz':        lazy(() => import('@/labs/LorentzLab')),
  'faraday':        lazy(() => import('@/labs/FaradayLab')),
  'ohms-law':       lazy(() => import('@/labs/OhmsLawLab')),
  'resistance':     lazy(() => import('@/labs/ResistanceLab')),
  'drift':          lazy(() => import('@/labs/DriftLab')),
  'joule':          lazy(() => import('@/labs/JouleLab')),
  'capacitance':    lazy(() => import('@/labs/CapacitanceLab')),
  'inductance':     lazy(() => import('@/labs/InductanceLab')),
  'energy-density': lazy(() => import('@/labs/EnergyDensityLab')),
  'poynting':       lazy(() => import('@/labs/PoyntingLab')),
};

export const Route = createFileRoute('/labs/$slug')({
  beforeLoad: ({ params }) => {
    if (!getLab(params.slug)) throw notFound();
  },
  component: LabRoute,
});

function LabRoute() {
  const { slug } = Route.useParams();
  const Lab = LAB_MODULES[slug];
  if (!Lab) {
    return <div style={{ padding: 80 }}>Lab not found: {slug}</div>;
  }
  return (
    <Suspense fallback={<div style={{ padding: 120 }}>Loading…</div>}>
      <Lab />
    </Suspense>
  );
}
