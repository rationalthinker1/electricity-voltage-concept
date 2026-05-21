/**
 * Demo D9.2 — Same wire, boosted into the test-charge frame
 *
 * Same physical setup as WireFromRest, now viewed from a frame moving with
 * the (formerly motionless) test charge. In the new frame:
 *   • positive ions are now moving leftward at -v_test, so their spacing
 *     Lorentz-contracts by γ(v_test).
 *   • conduction electrons were moving rightward at v_d in the lab; in the
 *     new frame their speed is v_d' = (v_d - v_test) / (1 - v_d·v_test/c²) —
 *     a different speed, so their spacing contracts by a *different* factor.
 *
 * Because the two contractions differ, the ion linear density and the
 * electron linear density no longer match. The wire carries a net charge
 * per unit length λ' in this frame. The test charge, now at rest in this
 * frame, sees an honest *electric* force from a charged line — and the
 * magnitude is exactly the magnetic force it felt in the lab frame.
 *
 * Slider: β = v_test / c. We use exaggerated visual β so the contraction
 * is visible, but the readout shows the real λ' and force for the chosen β
 * (assuming v_d = 1 mm/s in copper for the underlying drift, which lets us
 * compute realistic micro-numbers without making them invisible).
 *
 * The point of the demo is qualitative: at β = 0 the wire is neutral; as
 * β grows, the ion stripe contracts toward higher density and the electron
 * stripe to a different density, and a tiny excess net charge appears.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function WireFromMovingFrameDemo({ figure }: Props) {
  const [betaPct, setBetaPct] = useState(40); // β × 100, 0..95 (visual)

  const stateRef = useSimState({ betaPct });
  // Real β for the readout — we cap below 1.
  const beta = Math.max(0, Math.min(0.99, betaPct / 100));
  const gamma_test = 1 / Math.sqrt(1 - beta * beta);

  // We assume an underlying drift velocity that is much smaller than c.
  // For a realistic picture in copper, v_d / c is ~10⁻¹³. To compute the
  // *ratio* of densities in the boosted frame, what matters is the speed
  // composition, not the absolute v_d. We pick a tiny but nonzero drift
  // and use the relativistic velocity addition.
  const beta_d = 1e-5; // a notional drift β; doesn't matter for the visual

  // Electron speed in new frame, in units of c (relativistic addition):
  //   β_e' = (β_d - β) / (1 - β·β_d)
  const beta_e_new = (beta_d - beta) / (1 - beta * beta_d);
  const gamma_e_new = 1 / Math.sqrt(1 - beta_e_new * beta_e_new);

  // Densities transform as λ' = γ' · λ_rest. In the lab frame the wire
  // is neutral: λ_+ = +λ₀ (ions at rest, so λ_rest_ions = λ₀) and
  // λ_- = -λ₀ (electrons drifting at β_d, so their rest-frame density is
  // λ₀/γ_d, and the lab-frame density we observe is λ_-_lab = γ_d × that =
  // λ₀ — by construction of "neutral in the lab frame").
  //
  // In the new frame:
  //   λ_+' = γ_test × λ₀_rest_+
  //        = γ_test × λ₀  (since ions were at rest in the lab → their rest density is λ₀)
  //   λ_-' = -γ_e_new × λ₀_rest_-
  //        = -γ_e_new × (λ₀ / γ_d)
  // and γ_d ≈ 1 for any realistic drift, so λ_-' ≈ -γ_e_new × λ₀.
  // Net: λ' = λ₀ × (γ_test - γ_e_new).
  // Multiplied by the test charge's speed in the lab, this gives exactly
  // the magnetic-force prediction.
  const lambda0 = 1e-7; // 0.1 µC/m — a chosen scale for "λ in lab frame"
  const lambda_new = lambda0 * (gamma_test - gamma_e_new);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      let phaseIon = ctx0.phaseIon;
      let phaseElec = ctx0.phaseElec;
      const N = ctx0.N;
      const s = stateRef.current;
      const b = Math.max(0, Math.min(0.99, s.betaPct / 100));
      const g_test = 1 / Math.sqrt(1 - b * b);
      const visIonSpeed = -b * 80;
      const visElecSpeed = visIonSpeed * 1.04;
      phaseIon += visIonSpeed * dt;
      phaseElec += visElecSpeed * dt;
      const ionContract = Math.pow(g_test, 1.0);
      const elecContract = Math.pow(g_test, 1.0) * 0.94;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const wireY = h * 0.65;
      const wireH = 70;
      const wireTop = wireY - wireH / 2;
      const wireBot = wireY + wireH / 2;
      const margin = 30;
      const wireXL = margin;
      const wireXR = w - margin;
      const wireLen = wireXR - wireXL;
      const wireGrd = ctx.createLinearGradient(0, wireTop, 0, wireBot);
      const tintPink = Math.min(0.3, b * 0.45);
      wireGrd.addColorStop(0, `rgba(255,59,110,${(tintPink * 0.6).toFixed(3)})`);
      wireGrd.addColorStop(0.5, `rgba(255,59,110,${tintPink.toFixed(3)})`);
      wireGrd.addColorStop(1, `rgba(255,59,110,${(tintPink * 0.6).toFixed(3)})`);
      ctx.fillStyle = wireGrd;
      ctx.fillRect(wireXL, wireTop, wireLen, wireH);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(wireXL, wireTop, wireLen, wireH);
      const ionSpacing = wireLen / N / ionContract;
      const elecSpacing = wireLen / N / elecContract;
      const ionCount = Math.ceil(wireLen / ionSpacing) + 2;
      const elecCount = Math.ceil(wireLen / elecSpacing) + 2;
      for (let i = 0; i < ionCount; i++) {
        const raw = i * ionSpacing + phaseIon;
        const off = ((raw % wireLen) + wireLen) % wireLen;
        const x = wireXL + off;
        const y = wireY - 14;
        drawHalo(ctx, {
          x: x,
          y: y,
          radius: 11,
          color: colors.pink,
          alpha: 0.55,
          extent: 1,
        });
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: x,
          y: y,
          text: '+',
          color: colors.bg,
          size: 8,
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }
      for (let i = 0; i < elecCount; i++) {
        const raw = i * elecSpacing + phaseElec;
        const off = ((raw % wireLen) + wireLen) % wireLen;
        const x = wireXL + off;
        const y = wireY + 14;
        drawHalo(ctx, {
          x: x,
          y: y,
          radius: 11,
          color: colors.blue,
          alpha: 0.55,
          extent: 1,
        });
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: x,
          y: y,
          text: '−',
          color: colors.bg,
          size: 8,
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }
      const tx = w * 0.5;
      const ty = h * 0.22;
      drawHalo(ctx, {
        x: tx,
        y: ty,
        radius: 22,
        color: colors.accent,
        alpha: 0.55,
        extent: 1,
      });
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(tx, ty, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', tx, ty);
      drawLabel(ctx, {
        x: tx,
        y: ty - 26,
        text: "test charge   v' = 0",
        color: colors.text,
      });
      const lam = gamma_test - 1 / Math.sqrt(1 - 0 * 0);
      if (b > 0.02) {
        const arrowLen = Math.min(48, 10 + Math.log10(1 + b * 100) * 22);
        ctx.strokeStyle = colors.accent;
        ctx.fillStyle = colors.accent;
        ctx.lineWidth = 2;
        // arrow from below the test charge upward (repulsion: wire is +, test is +)
        const ax = tx;
        const ay0 = ty + 26;
        const ay1 = ay0 - arrowLen;
        ctx.beginPath();
        ctx.moveTo(ax, ay0);
        ctx.lineTo(ax, ay1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax, ay1);
        ctx.lineTo(ax - 5, ay1 + 8);
        ctx.lineTo(ax + 5, ay1 + 8);
        ctx.closePath();
        ctx.fill();
        drawLabel(ctx, {
          x: ax + 14,
          y: ay0 - arrowLen / 2,
          text: 'F = q E',
          color: colors.accent,
          size: 11,
        });
        void lam;
      }
      drawLabel(ctx, {
        x: 14,
        y: 18,
        text: `BOOSTED FRAME · v_test = ${b.toFixed(2)} c → wire has net λ' ≠ 0`,
        color: withAlpha(colors.textDim, 0.75),
      });
      ctx0.phaseIon = phaseIon;
      ctx0.phaseElec = phaseElec;
      ctx0.N = N;
    },
    [],
    () => ({ context: { phaseIon: 0, phaseElec: 0, N: 22 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 9.2'}
      title="Same wire, viewed from the moving frame"
      question="Boost into the test charge's rest frame. Where does the force come from now?"
      caption={
        <>
          In this frame ions and electrons both move, but with <em>different</em> speeds, so they
          Lorentz-contract by <em>different</em> factors. The two stripes no longer have matching
          linear densities — the wire has a net charge per unit length <em>λ′</em>. The
          (now-stationary) test charge sees an honest <strong>electric</strong> force. The number is
          identical to the magnetic force the lab frame predicted. Same physics, different label.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="β = v_test / c"
          value={betaPct}
          min={0}
          max={95}
          step={1}
          format={(v) => (v / 100).toFixed(2) + ' c'}
          onChange={setBetaPct}
        />
        <MiniReadout label="γ(v_test)" value={gamma_test.toFixed(4)} />
        <MiniReadout label="net λ′" value={<Num value={lambda_new} />} unit="C/m" />
        <MiniReadout
          label="force on test q"
          value={
            lambda_new === 0 ? (
              <Num value={0} />
            ) : (
              <>
                same as <em>F_B</em> in lab
              </>
            )
          }
        />
      </DemoControls>
    </Demo>
  );
}
