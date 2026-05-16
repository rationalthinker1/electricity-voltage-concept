/**
 * Demo D9.4 — The electromagnetic field tensor F^μν
 *
 * Display the antisymmetric 4×4 matrix
 *
 *           [  0    -E_x/c  -E_y/c  -E_z/c ]
 *   F^μν =  [ E_x/c    0     -B_z    B_y   ]
 *           [ E_y/c   B_z      0    -B_x   ]
 *           [ E_z/c  -B_y     B_x     0    ]
 *
 * Start from a particular pure-E configuration (E_x = E₀, others 0). Boost
 * along +x with β. The tensor's components transform as a rank-2 tensor;
 * specifically, for a boost in x:
 *   E_x' = E_x
 *   E_y' = γ(E_y - v·B_z)
 *   E_z' = γ(E_z + v·B_y)
 *   B_x' = B_x
 *   B_y' = γ(B_y + v·E_z/c²)
 *   B_z' = γ(B_z - v·E_y/c²)
 *
 * The reader picks the starting field (pure E along x, or pure E along y,
 * or a mixed example) and the boost β. The matrix cells light up live;
 * cells with appreciable magnitude get a warm tint, zero cells stay dim.
 * The point is purely structural: as β changes, the components
 * redistribute among themselves — they're one tensor, not two vectors.
 */
import { useEffect, useMemo, useState } from 'react';

import { Demo, DemoControls, MiniSlider, MiniToggle } from '@/components/Demo';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

type StartMode = 'Ex' | 'Ey' | 'mixed';

export function FieldTensorDemo({ figure }: Props) {
  const [betaPct, setBetaPct] = useState(40);
  const [mode, setMode] = useState<StartMode>('Ey');

  const beta = Math.max(-0.99, Math.min(0.99, betaPct / 100));
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const v = beta * PHYS.c;

  // Starting (rest-frame) E and B in some natural units.
  // We normalize so the largest |E| starts at 1, |B| starts at 0.
  const E0 = 1.0; // arbitrary "natural" units
  // eslint-disable-next-line prefer-const -- multi-binding; Ex/Ey/Bz reassigned, others stable
  let Ex = 0, Ey = 0, Ez = 0;
  // eslint-disable-next-line prefer-const -- multi-binding; Bz reassigned, others stable
  let Bx = 0, By = 0, Bz = 0;
  if (mode === 'Ex') { Ex = E0; }
  else if (mode === 'Ey') { Ey = E0; }
  else if (mode === 'mixed') { Ex = E0 * 0.6; Ey = E0 * 0.8; Bz = E0 * 0.3 / PHYS.c; }

  // Boost along +x:
  const Exp = Ex;
  const Eyp = gamma * (Ey - v * Bz);
  const Ezp = gamma * (Ez + v * By);
  const Bxp = Bx;
  const Byp = gamma * (By + v * Ez / (PHYS.c * PHYS.c));
  const Bzp = gamma * (Bz - v * Ey / (PHYS.c * PHYS.c));

  // Express F^μν entries in dimensionless form: use E/c (so units cancel) and B in (E0/c) units.
  // We display E_i/c (units of B) and B_i.
  const cell = useMemo(() => {
    // index [row][col]
    const F: number[][] = [
      [0,        -Exp / PHYS.c, -Eyp / PHYS.c, -Ezp / PHYS.c],
      [Exp / PHYS.c, 0,         -Bzp,           Byp],
      [Eyp / PHYS.c, Bzp,        0,            -Bxp],
      [Ezp / PHYS.c, -Byp,       Bxp,           0],
    ];
    return F;
  }, [Exp, Eyp, Ezp, Bxp, Byp, Bzp]);

  // Normalize for the visual tint — find the maximum |cell| and tint relative to it.
  let maxAbs = 0;
  for (const row of cell) for (const v of row) if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
  if (maxAbs === 0) maxAbs = 1;

  // Re-render on β / mode change is automatic via state.
  useEffect(() => { /* no side effects */ }, [betaPct, mode]);

  const labels = ['t', 'x', 'y', 'z'];

  // Friendly label for each component
  function compLabel(i: number, j: number): string {
    if (i === j) return '0';
    // pull labels from the standard form
    if (i === 0 && j === 1) return '−E_x/c';
    if (i === 0 && j === 2) return '−E_y/c';
    if (i === 0 && j === 3) return '−E_z/c';
    if (i === 1 && j === 0) return ' E_x/c';
    if (i === 2 && j === 0) return ' E_y/c';
    if (i === 3 && j === 0) return ' E_z/c';
    if (i === 1 && j === 2) return '−B_z';
    if (i === 1 && j === 3) return ' B_y';
    if (i === 2 && j === 1) return ' B_z';
    if (i === 2 && j === 3) return '−B_x';
    if (i === 3 && j === 1) return '−B_y';
    if (i === 3 && j === 2) return ' B_x';
    return '';
  }

  // Choose color: amber for E-components, teal for B-components, dim grey for 0.
  function isEComponent(i: number, j: number): boolean {
    return (i === 0 && j !== 0) || (j === 0 && i !== 0);
  }

  return (
    <Demo
      figure={figure ?? 'Fig. 9.4'}
      title="One tensor, six components"
      question="What's the relationship between E and B? They're entries in the same matrix."
      caption={<>
        The electromagnetic field tensor <em>F<sup>μν</sup></em> packs all six components of <strong>E</strong> and
        <strong> B</strong> into one antisymmetric 4×4 matrix. A Lorentz boost reshuffles those components among
        themselves the way a rotation reshuffles the components of an ordinary vector. Start with a pure
        <em> E_y</em>, slide β, and watch the off-diagonal "B" entries fill in. There were never two fields. There
        is one tensor and you've been looking at slices of it.
      </>}
    >
      <div style={{ padding: '18px 24px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto repeat(4, 1fr)',
            gridTemplateRows: 'auto repeat(4, 1fr)',
            gap: '4px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            color: 'rgba(236,235,229,0.9)',
          }}
        >
          {/* Top-left corner */}
          <div style={{ padding: '8px 4px', color: 'rgba(160,158,149,0.6)', textAlign: 'center', fontSize: 11 }}>
            μ ＼ ν
          </div>
          {/* Column headers */}
          {labels.map(l => (
            <div key={'col-' + l} style={{
              padding: '8px 4px', textAlign: 'center', fontSize: 11,
              color: 'rgba(160,158,149,0.8)',
            }}>{l}</div>
          ))}
          {/* Rows */}
          {labels.map((rl, i) => (
            <>
              <div key={'row-' + rl} style={{
                padding: '6px 4px', textAlign: 'center', fontSize: 11,
                color: 'rgba(160,158,149,0.8)',
                alignSelf: 'center',
              }}>{rl}</div>
              {labels.map((_, j) => {
                const val = cell[i][j];
                const abs = Math.abs(val);
                const tint = abs / maxAbs;
                const isE = isEComponent(i, j);
                const isZero = i === j;
                const bg = isZero
                  ? 'rgba(255,255,255,0.02)'
                  : isE
                    ? `rgba(255,107,42,${(0.05 + 0.30 * tint).toFixed(3)})`
                    : `rgba(108,197,194,${(0.05 + 0.30 * tint).toFixed(3)})`;
                const fg = isZero
                  ? 'rgba(160,158,149,0.45)'
                  : isE
                    ? `rgba(255,107,42,${(0.55 + 0.45 * tint).toFixed(3)})`
                    : `rgba(108,197,194,${(0.55 + 0.45 * tint).toFixed(3)})`;
                return (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      padding: '14px 6px 12px',
                      textAlign: 'center',
                      background: bg,
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background-color 120ms linear',
                    }}
                  >
                    <div style={{ fontSize: 11, color: fg, marginBottom: 4 }}>
                      {compLabel(i, j)}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(236,235,229,0.92)' }}>
                      {isZero ? '0' : val.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: 'rgba(160,158,149,0.7)',
          fontFamily: '"JetBrains Mono", monospace',
        }}>
          Components shown in natural units (E in units of E₀; B in units of E₀/c). The matrix is antisymmetric:
          F<sup>μν</sup> = −F<sup>νμ</sup>.
        </div>
      </div>
      <DemoControls>
        <MiniToggle
          label={mode === 'Ex' ? 'start: E_x' : mode === 'Ey' ? 'start: E_y' : 'start: mixed'}
          checked={mode !== 'Ex'}
          onChange={() => setMode(m => m === 'Ex' ? 'Ey' : m === 'Ey' ? 'mixed' : 'Ex')}
        />
        <MiniSlider
          label="β (boost in x)"
          value={betaPct} min={-95} max={95} step={1}
          format={v => (v / 100).toFixed(2)}
          onChange={setBetaPct}
        />
      </DemoControls>
    </Demo>
  );
}
