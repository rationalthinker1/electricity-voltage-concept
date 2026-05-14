/**
 * Demo D14.2 — p-n junction in (forward / zero / reverse) bias.
 *
 * Two halves of a silicon crystal side by side: n-type on the left
 * (electrons; pink dots) and p-type on the right (holes; blue circles).
 * Between them, a depletion region whose width is set by the applied
 * bias. The built-in potential at zero bias is V_bi ≈ 0.7 V for a
 * typical Si junction (Streetman & Banerjee §5.2); forward bias shrinks
 * the depletion width, reverse bias grows it. Arrows for the diffusion
 * and drift currents flip direction with bias.
 *
 * Visual model:
 *   depletion width  ∝ √(V_bi − V_applied)        (V_applied < V_bi)
 *                    = pinned-narrow when V_applied ≥ V_bi (just visual)
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

const V_BI = 0.7; // built-in potential, V

export function PNJunctionFormationDemo({ figure }: Props) {
  const [Vbias, setVbias] = useState(0);

  // Depletion width relative to zero-bias (W_0 = 1).
  const w_rel = Math.max(0.18, Math.sqrt(Math.max(0, V_BI - Vbias) / V_BI));

  const stateRef = useRef({ Vbias });
  useEffect(() => { stateRef.current = { Vbias }; }, [Vbias]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Carrier dots are stateful so they can drift on bias.
    type Carrier = { x: number; y: number; vx: number; kind: 'e' | 'h' };
    const carriers: Carrier[] = [];
    const N_EACH = 36;
    for (let i = 0; i < N_EACH; i++) {
      carriers.push({
        x: Math.random() * 0.45,
        y: 0.15 + Math.random() * 0.7,
        vx: 0,
        kind: 'e',
      });
      carriers.push({
        x: 0.55 + Math.random() * 0.45,
        y: 0.15 + Math.random() * 0.7,
        vx: 0,
        kind: 'h',
      });
    }

    function draw() {
      const { Vbias } = stateRef.current;
      const w_rel = Math.max(0.18, Math.sqrt(Math.max(0, V_BI - Vbias) / V_BI));

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 30, padR = 30, padT = 26, padB = 26;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // depletion centred at x = 0.5; half-width = (w_rel * 0.18)
      const dHalf = 0.18 * w_rel;
      const xL = 0.5 - dHalf;
      const xR = 0.5 + dHalf;

      // n-side (left) — soft pink wash
      ctx.fillStyle = 'rgba(255,59,110,0.06)';
      ctx.fillRect(padL, padT, plotW * xL, plotH);
      // p-side (right) — soft blue wash
      ctx.fillStyle = 'rgba(91,174,248,0.06)';
      ctx.fillRect(padL + plotW * xR, padT, plotW * (1 - xR), plotH);
      // depletion region — neutral
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(padL + plotW * xL, padT, plotW * (xR - xL), plotH);

      // depletion boundary lines
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padL + plotW * xL, padT); ctx.lineTo(padL + plotW * xL, padT + plotH);
      ctx.moveTo(padL + plotW * xR, padT); ctx.lineTo(padL + plotW * xR, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // ionised dopants inside the depletion region: negative acceptor ions on
      // the p-side half, positive donor ions on the n-side half.
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const nIons = 6;
      for (let i = 0; i < nIons; i++) {
        // p-side of depletion (negative ions)
        const xp = padL + plotW * (xL + ((i + 0.5) / nIons) * (0.5 - xL));
        const yp = padT + plotH * (0.15 + 0.7 * ((i * 0.37) % 1));
        ctx.fillStyle = colors.blue;
        ctx.fillText('−', xp, yp);
        // n-side of depletion (positive ions)
        const xn = padL + plotW * (0.5 + ((i + 0.5) / nIons) * (xR - 0.5));
        const yn = padT + plotH * (0.15 + 0.7 * ((i * 0.41 + 0.13) % 1));
        ctx.fillStyle = colors.pink;
        ctx.fillText('+', xn, yn);
      }

      // built-in field arrow inside the depletion (left ← right convention:
      // E points from + (n-side) to − (p-side) i.e. from right boundary toward left,
      // but the convention for a p-n junction is E points from n to p inside the
      // depletion. We draw it from n-side ions toward p-side ions.
      const arrowY = padT + plotH * 0.5;
      const arrowL = padL + plotW * (0.5 + dHalf * 0.3);
      const arrowR = padL + plotW * (0.5 + dHalf * 0.85);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(arrowR, arrowY); ctx.lineTo(arrowL, arrowY);
      ctx.stroke();
      // arrowhead pointing left (from n toward p means actually rightward for
      // the field; but in standard textbook diagrams E_built-in points from the
      // positive n-side dopants toward the negative p-side dopants — to the LEFT).
      ctx.beginPath();
      ctx.moveTo(arrowL, arrowY);
      ctx.lineTo(arrowL + 5, arrowY - 4);
      ctx.lineTo(arrowL + 5, arrowY + 4);
      ctx.closePath();
      ctx.fillStyle = colors.accent;
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('E_built-in', (arrowL + arrowR) / 2, arrowY - 8);

      // carrier dots — drift slightly with bias.
      // Forward bias: carriers cross the junction (left→right for electrons,
      // right→left for holes). Reverse: they get pushed away from it.
      const driftBias = (Vbias - 0) * 0.0008;
      for (const c of carriers) {
        if (c.kind === 'e') {
          c.x += driftBias + 0.0003 * (Math.random() - 0.5);
        } else {
          c.x += -driftBias + 0.0003 * (Math.random() - 0.5);
        }
        // wrap within domains (no crossing depletion for visual cleanliness)
        if (c.kind === 'e') {
          if (c.x < 0) c.x = xL - 0.02;
          if (c.x > xL) c.x = 0;
        } else {
          if (c.x > 1) c.x = xR + 0.02;
          if (c.x < xR) c.x = 1;
        }
      }
      // draw carriers
      for (const c of carriers) {
        const cx = padL + plotW * c.x;
        const cy = padT + plotH * c.y;
        if (c.kind === 'e') {
          ctx.fillStyle = colors.pink;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(91,174,248,0.85)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // labels
      ctx.fillStyle = colors.pink;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('n-type', padL + 6, padT + 4);
      ctx.fillStyle = colors.blue;
      ctx.textAlign = 'right';
      ctx.fillText('p-type', padL + plotW - 6, padT + 4);

      // depletion region label
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`depletion region   (W/W₀ = ${w_rel.toFixed(2)})`, padL + plotW * 0.5, padT + plotH - 16);

      // header
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      let mode = 'zero bias';
      if (Vbias > 0.01) mode = 'forward bias';
      else if (Vbias < -0.01) mode = 'reverse bias';
      ctx.fillText(`V_applied = ${Vbias.toFixed(2)} V   ·   ${mode}   ·   V_bi = ${V_BI.toFixed(2)} V`, padL, 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.2'}
      title="A p-n junction under bias"
      question="What happens to the depletion region when you forward-bias or reverse-bias the junction?"
      caption={<>
        Pink dots are electrons (n-type majority); blue circles are holes (p-type majority). The neutral strip
        between is the depletion region — empty of mobile carriers, populated only by ionised dopants.
        Forward bias (V {'>'} 0) narrows it; reverse bias (V {'<'} 0) widens it.
        Width scales as <em>W ∝ √(V<sub>bi</sub> − V)</em>.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_applied"
          value={Vbias} min={-3} max={0.7} step={0.01}
          format={v => v.toFixed(2) + ' V'}
          onChange={setVbias}
        />
        <MiniReadout label="V_bi" value={V_BI.toFixed(2)} unit="V" />
        <MiniReadout label="W/W₀" value={w_rel.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
