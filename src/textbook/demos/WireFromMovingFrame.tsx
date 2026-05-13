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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function WireFromMovingFrameDemo({ figure }: Props) {
  const [betaPct, setBetaPct] = useState(40);   // β × 100, 0..95 (visual)

  const stateRef = useRef({ betaPct });
  useEffect(() => { stateRef.current = { betaPct }; }, [betaPct]);

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
  const lambda0 = 1e-7;  // 0.1 µC/m — a chosen scale for "λ in lab frame"
  const lambda_new = lambda0 * (gamma_test - gamma_e_new);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let last = performance.now();
    let phaseIon = 0;
    let phaseElec = 0;

    const N = 22;

    function draw() {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      const b = Math.max(0, Math.min(0.99, s.betaPct / 100));
      const g_test = 1 / Math.sqrt(1 - b * b);

      // The new-frame electron velocity for visual purposes — we want the
      // electrons to drift in some visible direction relative to the now-
      // moving ions. In the new frame: ions move left at -β·c, electrons
      // move slightly faster left (since the new-frame electron velocity
      // ≈ -β·c when β >> β_d). We exaggerate the difference for visibility.
      const visIonSpeed = -b * 80;            // px/s, leftward
      const visElecSpeed = visIonSpeed * 1.04; // a touch faster left

      phaseIon += visIonSpeed * dt;
      phaseElec += visElecSpeed * dt;

      // Spacing factors (visually exaggerated):
      // Real Lorentz factor at β=0.4 is γ ≈ 1.09 — too small to see.
      // Apply a cosmetic exponent to make spacing changes more visible.
      const ionContract = Math.pow(g_test, 1.0);
      const elecContract = Math.pow(g_test, 1.0) * 0.94;  // small differential

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const wireY = h * 0.65;
      const wireH = 70;
      const wireTop = wireY - wireH / 2;
      const wireBot = wireY + wireH / 2;
      const margin = 30;
      const wireXL = margin;
      const wireXR = w - margin;
      const wireLen = wireXR - wireXL;

      // Wire body
      const wireGrd = ctx.createLinearGradient(0, wireTop, 0, wireBot);
      // tint the wire faintly toward pink as λ' grows positive (more ions)
      const tintPink = Math.min(0.3, b * 0.45);
      wireGrd.addColorStop(0, `rgba(255,59,110,${(tintPink * 0.6).toFixed(3)})`);
      wireGrd.addColorStop(0.5, `rgba(255,59,110,${tintPink.toFixed(3)})`);
      wireGrd.addColorStop(1, `rgba(255,59,110,${(tintPink * 0.6).toFixed(3)})`);
      ctx.fillStyle = wireGrd;
      ctx.fillRect(wireXL, wireTop, wireLen, wireH);
      ctx.strokeStyle = 'rgba(255,107,42,0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(wireXL, wireTop, wireLen, wireH);

      // Ions, with contracted spacing — fit more of them in the same window
      const ionSpacing = (wireLen / N) / ionContract;
      const elecSpacing = (wireLen / N) / elecContract;

      const ionCount = Math.ceil(wireLen / ionSpacing) + 2;
      const elecCount = Math.ceil(wireLen / elecSpacing) + 2;

      // Ions (pink, moving left)
      for (let i = 0; i < ionCount; i++) {
        const raw = i * ionSpacing + phaseIon;
        const off = ((raw % wireLen) + wireLen) % wireLen;
        const x = wireXL + off;
        const y = wireY - 14;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 11);
        halo.addColorStop(0, 'rgba(255,59,110,0.55)');
        halo.addColorStop(1, 'rgba(255,59,110,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff3b6e';
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0b';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('+', x, y);
      }

      // Electrons (blue, moving slightly faster left)
      for (let i = 0; i < elecCount; i++) {
        const raw = i * elecSpacing + phaseElec;
        const off = ((raw % wireLen) + wireLen) % wireLen;
        const x = wireXL + off;
        const y = wireY + 14;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 11);
        halo.addColorStop(0, 'rgba(91,174,248,0.55)');
        halo.addColorStop(1, 'rgba(91,174,248,0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5baef8';
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0b';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('−', x, y);
      }

      // Test charge — at rest in this frame
      const tx = w * 0.5;
      const ty = h * 0.22;
      const halo = ctx.createRadialGradient(tx, ty, 0, tx, ty, 22);
      halo.addColorStop(0, 'rgba(255,107,42,0.55)');
      halo.addColorStop(1, 'rgba(255,107,42,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(tx, ty, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff6b2a';
      ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0a0b';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', tx, ty);

      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText("test charge   v' = 0", tx, ty - 26);

      // E-field arrow pointing from wire toward (or away from) test charge,
      // depending on sign of λ_new (positive net charge → repels +test).
      const lam = (gamma_test - 1 / Math.sqrt(1 - 0 * 0)); // simplified for sign
      if (b > 0.02) {
        const arrowLen = Math.min(48, 10 + Math.log10(1 + b * 100) * 22);
        ctx.strokeStyle = 'rgba(255,107,42,0.95)';
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.lineWidth = 2;
        // arrow from below the test charge upward (repulsion: wire is +, test is +)
        const ax = tx;
        const ay0 = ty + 26;
        const ay1 = ay0 - arrowLen;
        ctx.beginPath();
        ctx.moveTo(ax, ay0); ctx.lineTo(ax, ay1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax, ay1);
        ctx.lineTo(ax - 5, ay1 + 8);
        ctx.lineTo(ax + 5, ay1 + 8);
        ctx.closePath(); ctx.fill();
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,107,42,0.9)';
        ctx.textAlign = 'left';
        ctx.fillText('F = q E', ax + 14, ay0 - arrowLen / 2);
        void lam;
      }

      // Frame label
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`BOOSTED FRAME · v_test = ${(b).toFixed(2)} c → wire has net λ' ≠ 0`, 14, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 9.2'}
      title="Same wire, viewed from the moving frame"
      question="Boost into the test charge's rest frame. Where does the force come from now?"
      caption={<>
        In this frame ions and electrons both move, but with <em>different</em> speeds, so they
        Lorentz-contract by <em>different</em> factors. The two stripes no longer have matching linear
        densities — the wire has a net charge per unit length <em>λ′</em>. The (now-stationary) test
        charge sees an honest <strong>electric</strong> force. The number is identical to the magnetic
        force the lab frame predicted. Same physics, different label.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="β = v_test / c"
          value={betaPct} min={0} max={95} step={1}
          format={v => (v / 100).toFixed(2) + ' c'}
          onChange={setBetaPct}
        />
        <MiniReadout label="γ(v_test)" value={gamma_test.toFixed(4)} />
        <MiniReadout label="net λ′" value={<Num value={lambda_new} />} unit="C/m" />
        <MiniReadout
          label="force on test q"
          value={lambda_new === 0 ? <Num value={0} /> : <>same as <em>F_B</em> in lab</>}
        />
      </DemoControls>
    </Demo>
  );
}
