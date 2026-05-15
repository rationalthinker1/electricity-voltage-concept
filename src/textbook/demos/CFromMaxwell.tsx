/**
 * Demo D8.5 — c from Maxwell
 *
 * Static, numerical-only demo: take ε₀ and μ₀ from CODATA, compute
 * c = 1/√(ε₀μ₀), and compare to the exact (post-1983 SI) value of the
 * speed of light. The match to 9 figures is the punchline.
 */
import { Demo, DemoControls, MiniReadout } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function CFromMaxwellDemo({ figure }: Props) {
  const cPredicted = 1 / Math.sqrt(PHYS.eps_0 * PHYS.mu_0);
  const cMeasured = PHYS.c;
  const fractionalDiff = Math.abs(cPredicted - cMeasured) / cMeasured;

  return (
    <Demo
      figure={figure ?? 'Fig. 8.5'}
      title="Light, predicted"
      question="What speed do the four equations say a wave in vacuum must travel at?"
      caption={<>
        Plug the experimentally-measured values of <strong>ε₀</strong> and <strong>μ₀</strong> into
        <em> c = 1/√(ε₀ μ₀)</em>. The result agrees with the measured speed of light to within rounding —
        and after 1983 the speed of light is <em>exact by definition</em>, so today the relation is what
        ties ε₀ to μ₀.
      </>}
    >
      <div style={{
        padding: '24px 20px',
        background: '#0d0d10',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 4,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13,
        color: 'rgba(236,235,229,0.9)',
        lineHeight: 1.9,
      }}>
        <div style={{ color: 'rgba(160,158,149,0.85)' }}>
          ε₀ = <span style={{ color: '#ff6b2a' }}>
            <Num value={PHYS.eps_0} digits={4} />
          </span> F/m
        </div>
        <div style={{ color: 'rgba(160,158,149,0.85)' }}>
          μ₀ = <span style={{ color: '#ff6b2a' }}>
            <Num value={PHYS.mu_0} digits={4} />
          </span> T·m/A
        </div>
        <div style={{ marginTop: 12, color: 'rgba(160,158,149,0.85)' }}>
          1/√(ε₀ μ₀) = <span style={{ color: '#ff6b2a', fontWeight: 500 }}>
            {cPredicted.toLocaleString('en-US', { maximumFractionDigits: 1 })}
          </span> m/s
        </div>
        <div style={{ color: 'rgba(160,158,149,0.85)' }}>
          c (1983 SI, exact) = <span style={{ color: '#6cc5c2', fontWeight: 500 }}>
            {cMeasured.toLocaleString('en-US')}
          </span> m/s
        </div>
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px dashed rgba(255,255,255,0.12)',
          color: 'rgba(236,235,229,0.75)',
        }}>
          fractional difference: <span style={{ color: '#ff6b2a' }}>
            <Num value={fractionalDiff} digits={2} />
          </span>
        </div>
      </div>
      <DemoControls>
        <MiniReadout
          label="c predicted"
          value={<Num value={cPredicted} digits={4} />}
          unit="m/s"
        />
        <MiniReadout
          label="c measured"
          value={<Num value={cMeasured} digits={4} />}
          unit="m/s"
        />
      </DemoControls>
    </Demo>
  );
}
