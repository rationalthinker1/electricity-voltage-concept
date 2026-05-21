#!/usr/bin/env node
/**
 * One-off cleanup: remove the named imports left over by refactor-demos.ts
 * from the specific files listed below. Source of truth is the user-provided
 * eslint output (the `REMOVALS` table). For each file we:
 *
 *   1. Remove every named-import specifier whose local name is in the list.
 *   2. If the import declaration has no specifiers (named / default /
 *      namespace) left after that, remove the whole declaration.
 *
 * Run from repo root:
 *   node scripts/strip-unused-imports.mjs           # dry run
 *   node scripts/strip-unused-imports.mjs --write   # apply
 */

import { Project } from 'ts-morph';
import * as path from 'node:path';
import * as url from 'node:url';

const SCRIPT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEMOS_DIR = path.join(REPO_ROOT, 'src/textbook/demos');
const TSCONFIG = path.join(REPO_ROOT, 'tsconfig.json');

const WRITE_MODE = process.argv.includes('--write');

const REMOVALS = {
  'BuildACapacitor.tsx': ['useCallback', 'CanvasInfo', 'getCanvasColors'],
  'BuildAResistor.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'ChemistryComparison.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'CoreLosses.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'CouplingCoefficient.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'Cyclotron.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'DaniellCell.tsx': ['useCallback', 'useRef', 'CanvasInfo'],
  'DielectricBetweenPlates.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'DiffractionGrating.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'DiodeCharacteristic.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'DipoleRadiationPattern.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'Dispersion.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'DotConvention.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'DoubleSlit.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'EAxialField.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'EBTransform.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'EnergyInTheGap.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'ExcitationControl.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'FFTAlgorithmAnimation.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'FiberAttenuation.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'FiberLinkBudget.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'FiberOptic.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'FieldOrientedControl.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'FlybackConverter.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'FriisLinkBudget.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'FuelCell.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'GaussBLaw.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'GaussELaw.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'GridSync.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'GridTieInverter.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'HBridgeInverter.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'HalfWaveDipoleResonance.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'HighFrequencyTransformer.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'Impedance.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'ImpedanceReflection.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'InRushCurrent.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'InductionMotorSlip.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'InertialResponse.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'LeadAcidCell.tsx': ['useCallback', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'LensFocusing.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'LeydenJarReplay.tsx': ['useCallback', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'LiIonIntercalation.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'LoadFollowing.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'LoadLineAnalysis.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'MOSFETOperation.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'MaxPowerTransfer.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'MotorEfficiencyMap.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'MutualInductanceTwoCoils.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'NearFarFieldTransition.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'NernstEquation.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'OpAmpFollower.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'OpAmpIntegrator.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'OpAmpInverting.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'OscillatingDipole.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PWMInverterOutput.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'PatchAntenna.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PhasedArraySteering.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PlaneWave.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PlateGeometry.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'Polarization.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PolarizationLossPenalty.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PolarizationMalusLaw.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PowerDerating.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'PowerFactor.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'RCFilterBode.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'RLCBandpass.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'RLCResonance.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'ReflectedImpedance.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'RvsTemperature.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SallenKeyFilter.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SeriesCoupledMeasureM.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SmithChartBasics.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SnellsLaw.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'Solenoid.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SpeedOfLight.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SquareThroughLPF.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'StandingWavesOnLine.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'StanleyDemo.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'StepperMotor.tsx': ['useCallback', 'useRef', 'CanvasInfo'],
  'Supercapacitor.tsx': ['useCallback', 'CanvasInfo', 'getCanvasColors'],
  'Superposition.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'Susceptibility.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'SynchronousMotor.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'THDAndDistortion.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'ThinFilm.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'ThreePhase.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TorqueSpeedCurve.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'Transformer.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TransformerDesigner.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TransmissionLineReflection.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TurnsRatio.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TwoCoilTransformer.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'TwoParallelWires.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'VariableResistors.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'VoltaicPile.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'WhyHarderEachCharge.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'WhyWaterPolarizes.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'WiedemannFranz.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
  'WireFromMovingFrame.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'WireFromRest.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'YDeltaTransform.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo'],
  'YagiArrayFactor.tsx': ['useCallback', 'useEffect', 'useRef', 'CanvasInfo', 'getCanvasColors'],
};

const project = new Project({ tsConfigFilePath: TSCONFIG });

let totalRemoved = 0;
let totalImportDecls = 0;
let filesTouched = 0;
const reports = [];

for (const [filename, names] of Object.entries(REMOVALS)) {
  const filepath = path.join(DEMOS_DIR, filename);
  const sf = project.getSourceFile(filepath);
  if (!sf) {
    reports.push(`MISS  ${filename}: not in TS project`);
    continue;
  }

  const namesSet = new Set(names);
  let removedHere = 0;
  let declsRemovedHere = 0;

  for (const importDecl of sf.getImportDeclarations()) {
    for (const named of importDecl.getNamedImports()) {
      if (namesSet.has(named.getName())) {
        named.remove();
        removedHere++;
      }
    }

    const stillHasNamed = importDecl.getNamedImports().length > 0;
    const stillHasDefault = !!importDecl.getDefaultImport();
    const stillHasNamespace = !!importDecl.getNamespaceImport();
    if (!stillHasNamed && !stillHasDefault && !stillHasNamespace) {
      importDecl.remove();
      declsRemovedHere++;
    }
  }

  if (removedHere > 0 || declsRemovedHere > 0) {
    filesTouched++;
    totalRemoved += removedHere;
    totalImportDecls += declsRemovedHere;
    reports.push(`OK    ${filename}  (${removedHere} specifier${removedHere === 1 ? '' : 's'}, ${declsRemovedHere} decl${declsRemovedHere === 1 ? '' : 's'})`);
    if (WRITE_MODE) sf.saveSync();
  } else {
    reports.push(`SKIP  ${filename}: nothing to remove`);
  }
}

console.log(reports.join('\n'));
console.log('\n────────────────────────────────────────');
console.log(`Files touched: ${filesTouched} / ${Object.keys(REMOVALS).length}`);
console.log(`Specifiers removed: ${totalRemoved}`);
console.log(`Import declarations removed: ${totalImportDecls}`);
if (!WRITE_MODE) console.log('\nThis was a dry run. Pass --write to apply.');
