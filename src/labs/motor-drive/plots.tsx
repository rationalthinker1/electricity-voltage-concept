/**
 * Lab A.3 — Motor + Drive Sandbox: live plot components.
 *
 * Three canvas-based plots wired to the rolling scope trace:
 *   • PhaseScope   — live phase-current waveform (one trace per phase)
 *   • TorqueSpeed  — operating point on top of the motor's τ-ω envelope
 *   • EfficiencyMap — η(τ, ω) heatmap with pinned operating point
 *
 * Each is a small dedicated component so it can be sized independently in the
 * sandbox grid; each reads only the bits of state it actually plots.
 */

import { useEffect, useRef } from 'react';

import type { MotorParams, ScopeTrace, SimSnapshot } from './types';
import { getCanvasColors } from '@/lib/canvasTheme';

/* ───────────────────────── PhaseScope ───────────────────────── */

interface PhaseScopeProps {
  trace: ScopeTrace;
}

export function PhaseScope({ trace }: PhaseScopeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth || c.parentElement?.clientWidth || 320;
    const h = 160;
    c.style.height = h + 'px';
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = getCanvasColors().canvasBg;
    ctx.fillRect(0, 0, w, h);

    // Grid.
    ctx.strokeStyle = getCanvasColors().border;
    ctx.lineWidth = 1;
    for (let g = 1; g < 4; g++) {
      const y = (g / 4) * h;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Zero-current axis.
    ctx.strokeStyle = getCanvasColors().borderStrong;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (trace.t.length < 2) {
      ctx.fillStyle = getCanvasColors().textMuted;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— no current data yet —', w / 2, h / 2 - 6);
      return;
    }

    const tMin = trace.t[0]!;
    const tMax = trace.t[trace.t.length - 1]!;
    const tRange = Math.max(1e-6, tMax - tMin);
    // Auto-scale based on the bigger of |ia|, |ib|, |ic|.
    let aMax = 0.1;
    for (let i = 0; i < trace.ia.length; i++) {
      const m = Math.max(
        Math.abs(trace.ia[i]!), Math.abs(trace.ib[i]!), Math.abs(trace.ic[i]!),
      );
      if (m > aMax) aMax = m;
    }
    aMax *= 1.2;

    const phases: Array<{ key: keyof ScopeTrace; color: string }> = [
      { key: 'ia', color: '#ff6b2a' },
      { key: 'ib', color: '#5baef8' },
      { key: 'ic', color: '#6cc5c2' },
    ];
    for (const ph of phases) {
      ctx.strokeStyle = ph.color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const arr = trace[ph.key] as number[];
      for (let i = 0; i < arr.length; i++) {
        const x = ((trace.t[i]! - tMin) / tRange) * w;
        const y = h / 2 - (arr[i]! / aMax) * (h / 2 - 6);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Labels.
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`±${aMax.toFixed(1)} A    ${(tRange * 1000).toFixed(0)} ms window`, 6, 4);
    ctx.fillStyle = getCanvasColors().accent; ctx.fillText('a', w - 30, 4);
    ctx.fillStyle = getCanvasColors().blue; ctx.fillText('b', w - 20, 4);
    ctx.fillStyle = getCanvasColors().teal; ctx.fillText('c', w - 10, 4);
  }, [trace]);

  return <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />;
}

/* ───────────────────────── TorqueSpeed ───────────────────────── */

interface TorqueSpeedProps {
  motor: MotorParams;
  Vdc: number;
  snap: SimSnapshot | null;
  history: Array<{ omega: number; tau: number }>;
}

export function TorqueSpeed({ motor, Vdc, snap, history }: TorqueSpeedProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth || c.parentElement?.clientWidth || 320;
    const h = 200;
    c.style.height = h + 'px';
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = getCanvasColors().canvasBg;
    ctx.fillRect(0, 0, w, h);

    const padL = 36, padR = 12, padT = 12, padB = 28;
    const omegaMax = motor.omega_rated * 1.8;
    const tauMax = motor.tau_rated * 1.4;

    const x = (omega: number) => padL + (omega / omegaMax) * (w - padL - padR);
    const y = (tau: number) => h - padB - (tau / tauMax) * (h - padT - padB);

    // Axes.
    ctx.strokeStyle = getCanvasColors().borderStrong;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    // Axis labels.
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(`${tauMax.toFixed(1)} N·m`, padL - 4, padT + 6);
    ctx.fillText('0', padL - 4, h - padB);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('ω (rad/s)', (padL + w - padR) / 2, h - padB + 14);
    ctx.fillText('0', padL, h - padB + 4);
    ctx.fillText(`${omegaMax.toFixed(0)}`, w - padR, h - padB + 4);
    ctx.save();
    ctx.translate(10, (padT + h - padB) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('τ (N·m)', 0, 0);
    ctx.restore();

    // Constant-torque region (flat at tau_rated up to omega_base).
    const omega_base = motor.omega_rated;
    ctx.strokeStyle = 'rgba(108,197,194,0.45)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x(0), y(motor.tau_rated));
    ctx.lineTo(x(omega_base), y(motor.tau_rated));
    // Constant-power region: τ ω = const above base speed.
    const P_base = motor.tau_rated * omega_base;
    const N = 40;
    for (let i = 1; i <= N; i++) {
      const om = omega_base + (i / N) * (omegaMax - omega_base);
      ctx.lineTo(x(om), y(Math.min(tauMax, P_base / om)));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Voltage-limited boundary, very rough: τ_max ∝ (V_dc/√3 − R_s i_s) / (ψ_m ω_e)
    // — sketched as informational only.
    const k = Vdc / (motor.V_rated || Vdc);
    ctx.strokeStyle = 'rgba(255,107,42,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const om = (i / N) * omegaMax;
      const tau_lim = Math.min(motor.tau_rated * 1.3, k * P_base / Math.max(0.01 * omegaMax, om));
      if (i === 0) ctx.moveTo(x(om), y(tau_lim));
      else ctx.lineTo(x(om), y(tau_lim));
    }
    ctx.stroke();

    // History trail (faded).
    if (history.length > 1) {
      ctx.strokeStyle = 'rgba(236,235,229,0.32)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const p = history[i]!;
        const px = x(Math.max(0, Math.abs(p.omega)));
        const py = y(Math.max(0, Math.abs(p.tau)));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Operating point.
    if (snap) {
      const om = Math.abs(snap.omega_m);
      const tau = Math.abs(snap.tau_e);
      const px = x(Math.min(omegaMax, om));
      const py = y(Math.min(tauMax, tau));
      ctx.fillStyle = getCanvasColors().accent;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Legend.
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = getCanvasColors().teal;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('— rated envelope', padL + 4, padT + 2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = getCanvasColors().accent;
    ctx.fillText('— voltage limit', padL + 4, padT + 13);
    ctx.restore();
  }, [motor, Vdc, snap, history]);

  return <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />;
}

/* ───────────────────────── EfficiencyMap ───────────────────────── */

interface EfficiencyMapProps {
  map: { tauMax: number; omegaMax: number; data: number[][] };
  snap: SimSnapshot | null;
}

export function EfficiencyMap({ map, snap }: EfficiencyMapProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth || c.parentElement?.clientWidth || 320;
    const h = 200;
    c.style.height = h + 'px';
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = getCanvasColors().canvasBg;
    ctx.fillRect(0, 0, w, h);

    const padL = 36, padR = 12, padT = 12, padB = 28;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const nTau = map.data.length;
    const nOm = map.data[0]?.length ?? 0;
    if (nTau === 0 || nOm === 0) return;

    // Build the heatmap with a teal→amber ramp.
    const cellW = plotW / nOm;
    const cellH = plotH / nTau;
    for (let i = 0; i < nTau; i++) {
      for (let j = 0; j < nOm; j++) {
        const eta = map.data[i]![j]!;
        // Map η in [0, 1] to a colour. 0 → dark, 0.5 → teal, 0.9+ → amber-bright.
        const t = Math.max(0, Math.min(1, eta));
        const r = Math.round(20 + t * 235);
        const g = Math.round(20 + t * 130);
        const b = Math.round(30 + (1 - t) * 110);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // Lower τ values are at the bottom of the plot ⇒ invert i.
        const py = padT + plotH - (i + 1) * cellH;
        const px = padL + j * cellW;
        ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
      }
    }

    // Axes.
    ctx.strokeStyle = getCanvasColors().borderStrong;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(`${map.tauMax.toFixed(1)}`, padL - 4, padT + 6);
    ctx.fillText('0', padL - 4, h - padB);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('ω (rad/s)', (padL + w - padR) / 2, h - padB + 14);
    ctx.fillText(`${map.omegaMax.toFixed(0)}`, w - padR, h - padB + 4);
    ctx.save();
    ctx.translate(10, (padT + h - padB) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('τ (N·m)', 0, 0);
    ctx.restore();

    // Operating point.
    if (snap) {
      const om = Math.min(map.omegaMax, Math.abs(snap.omega_m));
      const tau = Math.min(map.tauMax, Math.abs(snap.tau_e));
      const px = padL + (om / map.omegaMax) * plotW;
      const py = padT + plotH - (tau / map.tauMax) * plotH;
      ctx.strokeStyle = getCanvasColors().text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();
      // Cross-hairs.
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = getCanvasColors().text;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 9, py); ctx.lineTo(px - 6, py);
      ctx.moveTo(px + 6, py); ctx.lineTo(px + 9, py);
      ctx.moveTo(px, py - 9); ctx.lineTo(px, py - 6);
      ctx.moveTo(px, py + 6); ctx.lineTo(px, py + 9);
      ctx.stroke();
      ctx.restore();
      // Numeric eta readout.
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`η ≈ ${(snap.eta * 100).toFixed(0)}%`, px + 10, py - 8);
    }

    // Colourbar legend.
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('η:', padL + 4, padT + 2);
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const r = Math.round(20 + t * 235);
      const g = Math.round(20 + t * 130);
      const b = Math.round(30 + (1 - t) * 110);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(padL + 16 + i * 7, padT + 2, 7, 8);
    }
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.fillText('low', padL + 16, padT + 12);
    ctx.fillText('high', padL + 16 + 9 * 7 - 14, padT + 12);
  }, [map, snap]);

  return <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />;
}
