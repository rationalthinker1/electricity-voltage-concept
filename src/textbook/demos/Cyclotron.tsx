/**
 * Demo D4.3 — Charged particle in a uniform B field
 *
 * Background: scattered × marks indicate B pointing into the page.
 * A charged particle is launched at the left moving right; magnetic force
 * F = q v × B is perpendicular to v → the particle traces a circle of
 * radius r = m v / (q B). Period T = 2π m / (q B) is independent of v.
 *
 * Sliders: v (speed, m/s), B (field strength, T). Toggles: charge sign,
 * particle species (electron vs proton).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

// Visual scaling: 1 m of physical orbit radius → PX_PER_M screen pixels.
// The numbers are tiny (electron in B=0.001 T at v=1e6 m/s → r ≈ 5.7 mm,
// quite reasonable). For a wide range we map the radius logarithmically
// for the visualization but the readout always shows the real value.

export function CyclotronDemo({ figure }: Props) {
  const [vLog, setVLog] = useState(6);          // log10(v in m/s) → 10^6 m/s default
  const [B, setB] = useState(0.005);            // tesla
  const [positive, setPositive] = useState(false); // electron default → negative
  const [proton, setProton] = useState(false);  // false = electron

  const stateRef = useRef({ vLog, B, positive, proton });
  useEffect(() => { stateRef.current = { vLog, B, positive, proton }; }, [vLog, B, positive, proton]);

  // Real values
  const v = Math.pow(10, vLog);
  const m = proton ? PHYS.mp : PHYS.me;
  const q = PHYS.e; // magnitude
  const r_real = (m * v) / (q * B);
  const T_real = (2 * Math.PI * m) / (q * B);
  const f_real = 1 / T_real;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let lastT = performance.now();

    // Particle state — angle around the orbit (radians).
    let theta = 0;

    function draw() {
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;

      const { vLog, B, positive, proton } = stateRef.current;
      const v = Math.pow(10, vLog);
      const m = proton ? PHYS.mp : PHYS.me;
      const q = PHYS.e;
      const r_phys = (m * v) / (q * B);  // meters
      const omega = (q * B) / m;         // rad/s
      // Direction of rotation: for B into page (+z̃ inward, but in screen y-flipped
      // coords B_screen = -ẑ when "into page"; v×B for positive q gives the sign.
      // We use: positive charge in B into page → CCW on screen; negative → CW.
      const sign = positive ? +1 : -1;

      // Visual orbit radius — log-scaled so it fits on screen across many orders.
      // r_phys can range from ~10⁻⁹ m to several meters. Map to a pixel radius
      // between ~25 px and (h*0.42) px.
      const rMin_m = 1e-10, rMax_m = 1e2;
      const rPxMin = 28, rPxMax = Math.min(w, h) * 0.40;
      const ll = Math.log10(Math.max(rMin_m, Math.min(rMax_m, r_phys)));
      const t = (ll - Math.log10(rMin_m)) / (Math.log10(rMax_m) - Math.log10(rMin_m));
      const rPx = rPxMin + t * (rPxMax - rPxMin);

      // Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // × marks for B into page.
      ctx.strokeStyle = 'rgba(108,197,194,0.28)';
      ctx.lineWidth = 1;
      const spacing = 38;
      for (let y = spacing / 2; y < h; y += spacing) {
        for (let x = spacing / 2; x < w; x += spacing) {
          const k = 3.5;
          ctx.beginPath();
          ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k);
          ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(108,197,194,.55)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`B = ${pretty(B, 3)} T  (into page)`, 14, 18);

      // Center the orbit horizontally; the particle was "launched at the left
      // moving right", so the orbit's center is offset by the radius vertically.
      // For a positive charge curving CCW, center is below the launch point;
      // for negative (CW), center is above. We pick the orbit center so the
      // motion stays visually centered.
      const cx0 = w / 2;
      const cy0 = h / 2 + sign * 0; // keep centered

      // Advance angle. Visualize at a slowed-down rate, but use real ω so
      // higher B and lower mass spin visibly faster.
      const visScale = Math.min(1, 5 / (omega + 1e-6)) * Math.min(50, omega) / Math.max(1, omega);
      // Simpler: cap visual angular speed at 4 rad/s, otherwise scale linearly.
      const omegaVis = Math.min(4, Math.log10(omega + 1) * 0.6 + 1.0);
      void visScale;
      theta += sign * omegaVis * dt;

      // Orbit ring (faint)
      ctx.strokeStyle = 'rgba(255,107,42,0.30)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx0, cy0, rPx, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Particle position
      const px = cx0 + rPx * Math.cos(theta);
      const py = cy0 + rPx * Math.sin(theta);

      // Velocity tangent (for arrow)
      const tx = -Math.sin(theta) * sign;
      const ty =  Math.cos(theta) * sign;

      // Trail
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const trailLen = 1.2;
      ctx.arc(cx0, cy0, rPx, theta - sign * trailLen, theta, sign < 0);
      ctx.stroke();

      // Particle
      const color = positive ? '#ff3b6e' : '#5baef8';
      const grd = ctx.createRadialGradient(px, py, 0, px, py, 22);
      grd.addColorStop(0, color); grd.addColorStop(1, color + '00');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(positive ? '+' : '−', px, py);

      // Velocity arrow
      ctx.strokeStyle = '#ff6b2a';
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 1.5;
      const aLen = 22;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + tx * aLen, py + ty * aLen);
      ctx.stroke();
      ctx.beginPath();
      const hx = px + tx * aLen, hy = py + ty * aLen;
      const nx = -ty, ny = tx;
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - tx * 5 + nx * 3, hy - ty * 5 + ny * 3);
      ctx.lineTo(hx - tx * 5 - nx * 3, hy - ty * 5 - ny * 3);
      ctx.closePath();
      ctx.fill();
      ctx.textBaseline = 'alphabetic';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('v', hx + tx * 8, hy + ty * 8);

      // Real radius label
      ctx.fillStyle = 'rgba(236,235,229,.85)';
      ctx.textAlign = 'right';
      ctx.fillText(`r (real) = ${pretty(r_phys, 2)} m`, w - 14, 18);
      ctx.fillStyle = 'rgba(160,158,149,.6)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('orbit drawn at log-scaled radius', w - 14, 32);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.3'}
      title="Magnetic force only steers"
      question="A charge in a B field never speeds up. So what does it do?"
      caption={<>
        Background <strong>×</strong> marks: <strong>B</strong> points into the page. The Lorentz force
        <em> F = q v × B</em> is perpendicular to <strong>v</strong>, so the particle's speed never
        changes — only its direction. The orbit radius is <em>r = m v / (qB)</em>; the period
        <em> T = 2π m / (qB)</em> is independent of speed (the cyclotron principle).
      </>}
      deeperLab={{ slug: 'lorentz', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={positive ? 'charge +' : 'charge −'}
          checked={positive}
          onChange={setPositive}
        />
        <MiniToggle
          label={proton ? 'proton' : 'electron'}
          checked={proton}
          onChange={setProton}
        />
        <MiniSlider
          label="v (log)"
          value={vLog} min={3} max={7.4} step={0.05}
          format={v => `10^${v.toFixed(1)} m/s`}
          onChange={setVLog}
        />
        <MiniSlider
          label="B"
          value={B} min={0.0001} max={1} step={0.0001}
          format={v => pretty(v, 2) + ' T'}
          onChange={setB}
        />
        <MiniReadout label="radius" value={<Num value={r_real} digits={3} />} unit="m" />
        <MiniReadout label="period" value={<Num value={T_real} digits={3} />} unit="s" />
        <MiniReadout label="frequency" value={<Num value={f_real} digits={3} />} unit="Hz" />
      </DemoControls>
    </Demo>
  );
}
