import { useMemo, useState } from 'react';

import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';

interface Props {
  figure: string;
}

const GAUGES = [
  { awg: 14, area: 2.08, ampacity: 15, rPerM: 8.45e-3 },
  { awg: 12, area: 3.31, ampacity: 20, rPerM: 5.31e-3 },
  { awg: 10, area: 5.26, ampacity: 30, rPerM: 3.34e-3 },
  { awg: 8, area: 8.37, ampacity: 40, rPerM: 2.1e-3 },
  { awg: 6, area: 13.3, ampacity: 55, rPerM: 1.32e-3 },
];

export function BranchCircuitSizingDemo({ figure }: Props) {
  const [gaugeIndex, setGaugeIndex] = useState(1);
  const [breaker, setBreaker] = useState(20);
  const [load, setLoad] = useState(16);
  const [length, setLength] = useState(25);

  const gauge = GAUGES[gaugeIndex]!;
  const computed = useMemo(() => {
    const breakerOk = breaker <= gauge.ampacity;
    const loadOk = load <= breaker;
    const continuousOk = load <= breaker * 0.8;
    const drop = 2 * load * gauge.rPerM * length;
    const dropPct = (drop / 120) * 100;
    return { breakerOk, loadOk, continuousOk, drop, dropPct };
  }, [breaker, gauge, load, length]);

  const verdict = !computed.breakerOk
    ? 'breaker too large'
    : !computed.loadOk
      ? 'load trips breaker'
      : computed.dropPct > 3
        ? 'voltage drop high'
        : computed.continuousOk
          ? 'code-shaped'
          : 'short-duration only';

  return (
    <Demo
      figure={figure}
      title="Size the branch circuit as a chain"
      question="The breaker protects the wire; the wire and run length set the voltage drop."
      caption={
        <>
          Pick a wire gauge, breaker, load current, and one-way run length. A safe branch circuit has
          the breaker no larger than the conductor ampacity, the load no larger than the breaker, and
          a voltage drop low enough for the equipment at the far end.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <div className="px-xl py-lg grid gap-lg bg-canvas-bg md:grid-cols-[1fr_1fr]">
        <div className="rounded-2 border-border bg-bg-elevated border p-4">
          <div className="font-3 text-1 text-text-muted tracking-3 mb-2 uppercase">Conductor</div>
          <div className="font-1 text-7 text-text">{gauge.awg} AWG copper</div>
          <p className="text-3 text-text-muted mt-2">
            Area {gauge.area.toFixed(2)} mm²; ampacity {gauge.ampacity} A; warm resistance{' '}
            {(gauge.rPerM * 1000).toFixed(2)} mΩ/m.
          </p>
        </div>
        <div className="rounded-2 border-border bg-bg-elevated border p-4">
          <div className="font-3 text-1 text-text-muted tracking-3 mb-2 uppercase">Verdict</div>
          <div className={computed.breakerOk && computed.loadOk ? 'text-teal text-7' : 'text-pink text-7'}>
            {verdict}
          </div>
          <p className="text-3 text-text-muted mt-2">
            Round-trip drop is {computed.drop.toFixed(2)} V ({computed.dropPct.toFixed(1)}% of
            120 V). Continuous-load headroom is {computed.continuousOk ? 'present' : 'not present'}.
          </p>
        </div>
      </div>
      <DemoControls>
        <MiniSlider
          label="gauge"
          value={gaugeIndex}
          min={0}
          max={GAUGES.length - 1}
          step={1}
          format={(v) => `${GAUGES[Math.round(v)]!.awg} AWG`}
          onChange={(v) => setGaugeIndex(Math.round(v))}
        />
        <MiniSlider
          label="breaker"
          value={breaker}
          min={15}
          max={70}
          step={5}
          format={(v) => `${v.toFixed(0)} A`}
          onChange={setBreaker}
        />
        <MiniSlider
          label="load"
          value={load}
          min={1}
          max={60}
          step={1}
          format={(v) => `${v.toFixed(0)} A`}
          onChange={setLoad}
        />
        <MiniSlider
          label="one-way length"
          value={length}
          min={3}
          max={60}
          step={1}
          format={(v) => `${v.toFixed(0)} m`}
          onChange={setLength}
        />
        <MiniReadout label="ampacity" value={gauge.ampacity} unit="A" />
        <MiniReadout label="drop" value={<Num value={computed.drop} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Branch drop"
        left={<InlineMath tex="\\Delta V = 2 I R_{\\text{per m}} L" />}
        rightLabel="Current setting"
        right={
          <InlineMath
            tex={`\\Delta V = 2(${load.toFixed(0)})(${gauge.rPerM.toFixed(4)})(${length.toFixed(0)}) = ${computed.drop.toFixed(2)}\\,\\text{V}`}
          />
        }
      />
    </Demo>
  );
}
