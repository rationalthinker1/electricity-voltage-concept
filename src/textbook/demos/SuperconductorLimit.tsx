/**
 * Demo D6.5 — The superconductor limit
 *
 * Same wire visualization as PoyntingInflow, but with a toggle:
 *
 *   "Normal conductor"  — axial E inside the wire is non-zero (V/L);
 *      Poynting vector points radially inward; energy is absorbed
 *      (turned into heat) at the wire's surface.
 *
 *   "Superconductor"    — σ → ∞, so the axial E inside collapses to
 *      zero; |S| inside also collapses; the energy keeps streaming
 *      *parallel* to the wire in the surrounding space, never touching
 *      the metal. The wire is just a guide for the field.
 *
 * The lesson: resistance is what couples the field to the lattice.
 * Without it, the energy slides past untouched.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

interface InflowParticle {
  theta: number;
  t: number;
  r: number;
}
interface ParallelParticle {
  // axial fraction, 0 → left end, 1 → right end
  x: number;
  // angular position around the wire, theta
  theta: number;
  // radial distance fraction (1 → far, 0 → at wire)
  rFrac: number;
}

export function SuperconductorLimitDemo({ figure }: Props) {
  const [supercon, setSupercon] = useState(false);
  // Fixed circuit. In normal mode V is the resistive drop; in supercon mode the
  // axial E inside is zero so we still drive a current with the same external
  // emf, but no voltage is dropped across the (perfect) conductor itself.
  const I = 5;          // A
  const V_emf = 12;     // V — the emf supplied externally (kept the same for comparison)
  const a_mm = 1.5;
  const L = 1.0;

  // Computed values depend on the toggle.
  // Normal: E_in = V/L  →  S_in = E·B/μ₀, absorbed.
  // Super:  E_in = 0    →  S_in = 0;  energy travels parallel to the wire instead.
  const a_m = a_mm * 1e-3;
  const B_surf = (PHYS.mu_0 * I) / (2 * Math.PI * a_m);
  const E_in = supercon ? 0 : V_emf / L;
  const S_in = (E_in * B_surf) / PHYS.mu_0;
  const P_dissipated = supercon ? 0 : V_emf * I;

  const stateRef = useRef({ supercon, S_in, B_surf, E_in });
  useEffect(() => {
    stateRef.current = { supercon, S_in, B_surf, E_in };
  }, [supercon, S_in, B_surf, E_in]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    const inflow: InflowParticle[] = [];
    const parallel: ParallelParticle[] = [];
    const MAX_INFLOW = 140;
    const MAX_PARALLEL = 90;

    function getWireGeom() {
      const margin = 80;
      const wireXL = margin;
      const wireXR = W - margin;
      const wireCY = H * 0.55;
      const r_px = Math.max(24, Math.min(60, Math.min(W, H) * 0.10));
      return { wireXL, wireXR, wireCY, r: r_px };
    }

    function spawnInflow(S: number) {
      const rate = Math.min(6, Math.max(0.3, Math.log10(S + 10) - 1));
      for (let k = 0; k < rate; k++) {
        if (inflow.length >= MAX_INFLOW) break;
        inflow.push({ theta: Math.random() * Math.PI * 2, t: Math.random(), r: 1.0 });
      }
    }
    function spawnParallel() {
      while (parallel.length < MAX_PARALLEL) {
        parallel.push({
          x: Math.random(),
          theta: Math.random() * Math.PI * 2,
          rFrac: 0.4 + Math.random() * 0.6,
        });
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const g = getWireGeom();
      const r = g.r;
      const ellipseRatio = 0.35;
      const er = r * ellipseRatio;

      // BACK-half B-field ellipses (always shown — Ampère doesn't care about σ)
      ctx.strokeStyle = 'rgba(108,197,194,0.32)';
      ctx.lineWidth = 1.1;
      const nB = 7;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      if (!s.supercon) {
        // ── Inflow particles (energy absorbed)
        spawnInflow(s.S_in);
        for (let i = inflow.length - 1; i >= 0; i--) {
          const p = inflow[i]!;
          p.r -= 0.01;
          if (p.r <= 0.02) { inflow.splice(i, 1); continue; }
          const cx = g.wireXL + p.t * (g.wireXR - g.wireXL);
          const distFromAxis = r + p.r * r * 4;
          const xOff = Math.sin(p.theta) * distFromAxis * ellipseRatio;
          const yOff = -Math.cos(p.theta) * distFromAxis;
          const px = cx + xOff;
          const py = g.wireCY + yOff;
          const back = p.theta > Math.PI;
          const alpha = (back ? 0.4 : 0.95) * (1 - p.r * 0.3);
          const innerR = r + (p.r - 0.05) * r * 4;
          const tx = cx + Math.sin(p.theta) * innerR * ellipseRatio;
          const ty = g.wireCY - Math.cos(p.theta) * innerR;
          ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.fillStyle = `rgba(255,107,42,${alpha})`;
          ctx.beginPath(); ctx.arc(tx, ty, 1.7, 0, Math.PI * 2); ctx.fill();
        }
        // empty the parallel pool so toggling is clean
        parallel.length = 0;
      } else {
        // ── Parallel-flowing energy outside the wire
        spawnParallel();
        for (const p of parallel) {
          // Drift to the right (axial direction of energy flow in the surrounding
          // space — it still goes from + terminal end to − terminal end overall)
          p.x += 0.006;
          if (p.x > 1) p.x -= 1;

          const cx = g.wireXL + p.x * (g.wireXR - g.wireXL);
          const distFromAxis = r + p.rFrac * r * 4;
          const xOff = Math.sin(p.theta) * distFromAxis * ellipseRatio;
          const yOff = -Math.cos(p.theta) * distFromAxis;
          const px = cx + xOff;
          const py = g.wireCY + yOff;
          const back = p.theta > Math.PI;
          const alpha = back ? 0.35 : 0.85;
          ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
          ctx.lineWidth = 1.3;
          // small horizontal arrow
          ctx.beginPath();
          ctx.moveTo(px - 6, py);
          ctx.lineTo(px + 6, py);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,107,42,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(px + 6, py);
          ctx.lineTo(px + 2, py - 3);
          ctx.lineTo(px + 2, py + 3);
          ctx.closePath(); ctx.fill();
        }
        inflow.length = 0;
      }

      // ── Wire body
      const sideGrd = ctx.createLinearGradient(0, g.wireCY - r, 0, g.wireCY + r);
      const tint = s.supercon ? '108,197,194' : '255,107,42';
      sideGrd.addColorStop(0, `rgba(${tint},0.10)`);
      sideGrd.addColorStop(0.5, `rgba(${tint},0.28)`);
      sideGrd.addColorStop(1, `rgba(${tint},0.10)`);
      ctx.fillStyle = sideGrd;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(g.wireXL, g.wireCY + r);
      ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = `rgba(${tint},0.6)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.moveTo(g.wireXL, g.wireCY + r);
      ctx.lineTo(g.wireXR, g.wireCY + r);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, 0, Math.PI * 2); ctx.stroke();

      // ── E axial arrows — drawn only if non-zero
      if (!s.supercon) {
        const nE = 5;
        ctx.strokeStyle = 'rgba(255,59,110,0.95)';
        ctx.fillStyle = 'rgba(255,59,110,0.95)';
        ctx.lineWidth = 2;
        const arrLen = 50;
        for (let i = 0; i < nE; i++) {
          const t = (i + 0.5) / nE;
          const cx = g.wireXL + t * (g.wireXR - g.wireXL) - arrLen / 2;
          const cy = g.wireCY;
          ctx.beginPath();
          ctx.moveTo(cx, cy); ctx.lineTo(cx + arrLen, cy); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + arrLen, cy);
          ctx.lineTo(cx + arrLen - 8, cy - 5);
          ctx.lineTo(cx + arrLen - 8, cy + 5);
          ctx.closePath(); ctx.fill();
        }
      } else {
        // Show "E_inside = 0" label inside the wire
        ctx.fillStyle = 'rgba(108,197,194,0.85)';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('E_inside = 0', (g.wireXL + g.wireXR) / 2, g.wireCY);
      }

      // FRONT-half B ellipses
      ctx.strokeStyle = 'rgba(108,197,194,0.85)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, 0, Math.PI);
        ctx.stroke();
        const ax = cx + er * 1.6;
        const ay = g.wireCY;
        ctx.fillStyle = 'rgba(108,197,194,0.95)';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 6, ay - 4);
        ctx.lineTo(ax - 6, ay + 4);
        ctx.closePath(); ctx.fill();
      }

      // Numerics overlay
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = s.supercon ? '#6cc5c2' : '#ff6b2a';
      ctx.fillText(s.supercon ? 'Mode: superconductor (σ → ∞)' : 'Mode: normal conductor', 18, 14);

      ctx.fillStyle = '#ff3b6e';
      ctx.fillText(`E_inside = ${pretty(s.E_in)} V/m`, 18, 30);
      ctx.fillStyle = '#6cc5c2';
      ctx.fillText(`B_surface = ${pretty(s.B_surf)} T`, 18, 46);
      ctx.fillStyle = '#ff6b2a';
      ctx.fillText(`|S|_inside = ${pretty(s.S_in)} W/m²`, 18, 62);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.fillText(`I = ${I.toFixed(1)} A   a = ${a_mm.toFixed(2)} mm`, W - 18, 14);
      ctx.fillStyle = s.supercon ? '#6cc5c2' : '#ff6b2a';
      ctx.fillText(s.supercon
        ? 'Energy passes parallel — never absorbed'
        : 'Energy absorbed at surface = V·I', W - 18, 30);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 6.5'}
      title="The superconductor limit"
      question="What changes when σ → ∞?"
      caption={<>
        In a normal conductor, the resistive axial <strong>E</strong> inside the wire is what couples the field to the lattice — it's why
        the inward Poynting flow gets absorbed as heat. In a perfect conductor, <strong>E</strong> inside collapses to zero, so does
        |<strong>S</strong>| inside, and the field's energy keeps sliding past <em>parallel to the wire</em>, never touching it. <strong>Resistance is the coupling.</strong>
      </>}
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={supercon ? 'Superconductor (σ → ∞)' : 'Normal conductor'}
          checked={supercon}
          onChange={setSupercon}
        />
        <MiniReadout label="E inside" value={<Num value={E_in} />} unit="V/m" />
        <MiniReadout label="|S| inside" value={<Num value={S_in} />} unit="W/m²" />
        <MiniReadout label="P dissipated" value={<Num value={P_dissipated} />} unit="W" />
      </DemoControls>
    </Demo>
  );
}
