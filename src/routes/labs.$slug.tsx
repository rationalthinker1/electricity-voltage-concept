import { createFileRoute, notFound } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { getLab } from '@/labs/data/manifest';

// Lazy-load each lab's content so visiting the TOC doesn't ship all 16.
const LAB_MODULES: Record<string, ReturnType<typeof lazy>> = {
  coulomb: lazy(() => import('@/labs/CoulombLab')),
  'e-field': lazy(() => import('@/labs/EFieldLab')),
  gauss: lazy(() => import('@/labs/GaussLab')),
  potential: lazy(() => import('@/labs/PotentialLab')),
  'coulomb-phet': lazy(() => import('@/labs/CoulombPhetLab')),
  'faraday-cage': lazy(() => import('@/labs/FaradayCageLab')),
  'biot-savart': lazy(() => import('@/labs/BiotSavartLab')),
  ampere: lazy(() => import('@/labs/AmpereLab')),
  lorentz: lazy(() => import('@/labs/LorentzLab')),
  faraday: lazy(() => import('@/labs/FaradayLab')),
  'ohms-law': lazy(() => import('@/labs/OhmsLawLab')),
  resistance: lazy(() => import('@/labs/ResistanceLab')),
  drift: lazy(() => import('@/labs/DriftLab')),
  joule: lazy(() => import('@/labs/JouleLab')),
  'ac-impedance': lazy(() => import('@/labs/ACImpedanceLab')),
  capacitance: lazy(() => import('@/labs/CapacitanceLab')),
  inductance: lazy(() => import('@/labs/InductanceLab')),
  'energy-density': lazy(() => import('@/labs/EnergyDensityLab')),
  poynting: lazy(() => import('@/labs/PoyntingLab')),
  'em-waves': lazy(() => import('@/labs/EMWavesLab')),
  'maxwell-synthesis': lazy(() => import('@/labs/MaxwellSynthesisLab')),
  'relativistic-em': lazy(() => import('@/labs/RelativisticEMLab')),
  'motor-torque-speed': lazy(() => import('@/labs/MotorTorqueSpeedLab')),
  'synchronous-machine': lazy(() => import('@/labs/SynchronousMachineLab')),
  'network-analysis': lazy(() => import('@/labs/NetworkAnalysisLab')),
  'pn-junction': lazy(() => import('@/labs/PNJunctionLab')),
  'transistor-iv': lazy(() => import('@/labs/TransistorIVLab')),
  'fourier-series': lazy(() => import('@/labs/FourierSeriesLab')),
  'bode-filter': lazy(() => import('@/labs/BodeFilterLab')),
  'op-amp': lazy(() => import('@/labs/OpAmpLab')),
  'rectifier': lazy(() => import('@/labs/RectifierLab')),
  'dc-dc-converter': lazy(() => import('@/labs/DCDCConverterLab')),
  'pwm-inverter': lazy(() => import('@/labs/PWMInverterLab')),
  'cell-emf': lazy(() => import('@/labs/CellEMFLab')),
  'li-ion-cycling': lazy(() => import('@/labs/LiIonCyclingLab')),
  transformer: lazy(() => import('@/labs/TransformerEquationLab')),
  'transmission-line': lazy(() => import('@/labs/TransmissionLineLab')),
  'polarization-susceptibility': lazy(() => import('@/labs/PolarizationSusceptibilityLab')),
  'snell-fresnel': lazy(() => import('@/labs/SnellFresnelLab')),
  'diffraction-interference': lazy(() => import('@/labs/DiffractionInterferenceLab')),
  'antenna-radiation': lazy(() => import('@/labs/AntennaRadiationLab')),
  'fiber-link': lazy(() => import('@/labs/FiberLinkLab')),
  'circuit-builder': lazy(() => import('@/labs/CircuitBuilderLab')),
  'house-wiring': lazy(() => import('@/labs/HouseWiringLab')),
  'motor-drive': lazy(() => import('@/labs/MotorDriveLab')),
  'ev-bench': lazy(() => import('@/labs/EVBenchLab')),
  'power-grid': lazy(() => import('@/labs/PowerGridLab')),
  'rf-link': lazy(() => import('@/labs/RFLinkLab')),
  'power-supply': lazy(() => import('@/labs/PowerSupplyLab')),
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
