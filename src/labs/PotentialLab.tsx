/**
 * Lab 1.4 — Potential Difference
 *
 *   V_ab = V_b − V_a = −∫_a^b E · dℓ
 *
 * Two charges build a 2D potential field; two draggable probes A, B report
 * the potential difference. Equipotential heatmap, contour bands, animated
 * field-line streaming, A→B integration path.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'potential';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

const PX_PER_M = 1000; // 1 px = 1 mm

interface Pt { x: number; y: number }

export default function PotentialLab() {
  const [q1NC, setQ1NC] = useState(+5);
  const [q2NC, setQ2NC] = useState(-5);
  const [er, setEr] = useState(1.0);

  const [q1, setQ1] = useState<Pt>({ x: 0.30, y: 0.5 });
  const [q2, setQ2] = useState<Pt>({ x: 0.70, y: 0.5 });
  const [pA, setPA] = useState<Pt>({ x: 0.45, y: 0.30 });
  const [pB, setPB] = useState<Pt>({ x: 0.55, y: 0.70 });

  const [sizePx, setSizePx] = useState({ W: 800, H: 520 });

  const stateRef = useRef({ q1NC, q2NC, er, q1, q2, pA, pB, sizePx });
  useEffect(() => {
    stateRef.current = { q1NC, q2NC, er, q1, q2, pA, pB, sizePx };
  }, [q1NC, q2NC, er, q1, q2, pA, pB, sizePx]);

  // Compute potentials at the probes (W,H matter for px-to-meter conversion).
  const computed = useMemo(() => {
    const { W, H } = sizePx;
    function potentialAt(ux: number, uy: number) {
      let v = 0;
      for (const c of [{ x: q1.x, y: q1.y, q: q1NC * 1e-9 }, { x: q2.x, y: q2.y, q: q2NC * 1e-9 }]) {
        const dxPx = (ux - c.x) * W;
        const dyPx = (uy - c.y) * H;
        const r_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
        v += (PHYS.k * c.q) / Math.max(r_m, 0.001);
      }
      return v / er;
    }
    function fieldAt(ux: number, uy: number) {
      let Ex = 0, Ey = 0;
      for (const c of [{ x: q1.x, y: q1.y, q: q1NC * 1e-9 }, { x: q2.x, y: q2.y, q: q2NC * 1e-9 }]) {
        const dxPx = (ux - c.x) * W;
        const dyPx = (uy - c.y) * H;
        const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-3);
        const r2 = r_m * r_m;
        const ux_v = (dxPx / PX_PER_M) / r_m;
        const uy_v = (dyPx / PX_PER_M) / r_m;
        const E = (PHYS.k * c.q) / r2;
        Ex += E * ux_v;
        Ey += E * uy_v;
      }
      Ex /= er; Ey /= er;
      return { Ex, Ey, mag: Math.hypot(Ex, Ey) };
    }
    const VA = potentialAt(pA.x, pA.y);
    const VB = potentialAt(pB.x, pB.y);
    const dV = VB - VA;
    const Eat = fieldAt(pA.x, pA.y);
    const dxPx = (pB.x - pA.x) * W;
    const dyPx = (pB.y - pA.y) * H;
    const distance_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
    const work = 1 * dV; // 1 C test charge moved A → B
    return { VA, VB, dV, EmagA: Eat.mag, distance_m, work };
  }, [q1NC, q2NC, er, q1, q2, pA, pB, sizePx]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    setSizePx({ W: w, H: h });
    let raf = 0;
    let dragging: 'q1' | 'q2' | 'pA' | 'pB' | null = null;
    let phase = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearest(mx: number, my: number) {
      const st = stateRef.current;
      let best: typeof dragging = null;
      let bestD = 22;
      for (const key of ['q1', 'q2', 'pA', 'pB'] as const) {
        const p = st[key];
        const d = Math.hypot(mx - p.x * w, my - p.y * h);
        if (d < bestD) { bestD = d; best = key; }
      }
      return best;
    }
    function clamp01(p: number) { return Math.max(0.04, Math.min(0.96, p)); }
    function clampY(p: number) { return Math.max(0.08, Math.min(0.92, p)); }
    function applyDrag(target: NonNullable<typeof dragging>, mx: number, my: number) {
      const np = { x: clamp01(mx / w), y: clampY(my / h) };
      if (target === 'q1') setQ1(np);
      else if (target === 'q2') setQ2(np);
      else if (target === 'pA') setPA(np);
      else setPB(np);
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        applyDrag(dragging, mx, my);
      } else {
        canvas.style.cursor = nearest(mx, my) ? 'grab' : 'default';
      }
    }
    function onMouseUp() { dragging = null; canvas.style.cursor = 'default'; }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const [mx, my] = getMouse(e);
      applyDrag(dragging, mx, my);
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function chargesAsList() {
      const st = stateRef.current;
      return [
        { x: st.q1.x, y: st.q1.y, q: st.q1NC * 1e-9 },
        { x: st.q2.x, y: st.q2.y, q: st.q2NC * 1e-9 },
      ];
    }
    function potentialAt(ux: number, uy: number) {
      const er = stateRef.current.er;
      let v = 0;
      for (const c of chargesAsList()) {
        const dxPx = (ux - c.x) * w;
        const dyPx = (uy - c.y) * h;
        const r_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
        v += (PHYS.k * c.q) / Math.max(r_m, 0.001);
      }
      return v / er;
    }
    function fieldAt(ux: number, uy: number) {
      const er = stateRef.current.er;
      let Ex = 0, Ey = 0;
      for (const c of chargesAsList()) {
        const dxPx = (ux - c.x) * w;
        const dyPx = (uy - c.y) * h;
        const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-3);
        const r2 = r_m * r_m;
        const ux_v = (dxPx / PX_PER_M) / r_m;
        const uy_v = (dyPx / PX_PER_M) / r_m;
        const E = (PHYS.k * c.q) / r2;
        Ex += E * ux_v;
        Ey += E * uy_v;
      }
      Ex /= er; Ey /= er;
      return { Ex, Ey, mag: Math.hypot(Ex, Ey) };
    }

    function draw() {
      const st = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Equipotential heatmap (subtle)
      const cellSize = 8;
      for (let py = 0; py < h; py += cellSize) {
        for (let px = 0; px < w; px += cellSize) {
          const v = potentialAt(px / w, py / h);
          if (Math.abs(v) < 1) continue;
          const t = Math.tanh(v / 200);
          if (t > 0) ctx.fillStyle = `rgba(255,59,110,${Math.abs(t) * 0.10})`;
          else        ctx.fillStyle = `rgba(91,174,248,${Math.abs(t) * 0.10})`;
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }

      // Equipotential contour bands
      const levels = [-1000, -500, -200, -100, -50, -20, 20, 50, 100, 200, 500, 1000];
      const step = 5;
      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const v = potentialAt(px / w, py / h);
          for (const L of levels) {
            if (Math.abs(v - L) < Math.abs(L) * 0.04 + 1.5) {
              ctx.fillStyle = 'rgba(108,197,194,0.18)';
              ctx.fillRect(px, py, 2, 2);
            }
          }
        }
      }

      // Streaming field lines from each charge
      phase += 0.6;
      for (const src of [st.q1, st.q2]) {
        const srcQ = src === st.q1 ? st.q1NC : st.q2NC;
        const lines = 18;
        for (let i = 0; i < lines; i++) {
          const a = (i / lines) * Math.PI * 2;
          let x = src.x + Math.cos(a) * 0.03;
          let y = src.y + Math.sin(a) * 0.03;
          const path: Array<[number, number]> = [];
          const sign = srcQ > 0 ? +1 : -1;
          for (let s = 0; s < 350; s++) {
            const { Ex, Ey, mag } = fieldAt(x, y);
            if (mag < 1e-3) break;
            const stepDX = (Ex / mag) * 0.004 * sign;
            const stepDY = (Ey / mag) * 0.004 * sign;
            x += stepDX; y += stepDY;
            if (x < 0 || x > 1 || y < 0 || y > 1) break;
            let hit = false;
            for (const c of chargesAsList()) {
              const dd = Math.hypot((x - c.x) * w, (y - c.y) * h);
              if (dd < 12) { hit = true; break; }
            }
            path.push([x, y]);
            if (hit) break;
          }
          if (path.length > 2) {
            ctx.strokeStyle = 'rgba(255,107,42,0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(path[0][0] * w, path[0][1] * h);
            for (const [px, py] of path) ctx.lineTo(px * w, py * h);
            ctx.stroke();
            const tIdx = Math.floor((phase + i * 17 + (src === st.q1 ? 0 : 50)) % path.length);
            const t = path[tIdx];
            if (t) {
              ctx.beginPath();
              ctx.arc(t[0] * w, t[1] * h, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255,107,42,0.95)';
              ctx.shadowColor = 'rgba(255,107,42,.6)';
              ctx.shadowBlur = 5;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // A → B integration path
      const ax = st.pA.x * w, ay = st.pA.y * h;
      const bx = st.pB.x * w, by = st.pB.y * h;
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(by - ay, bx - ax);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 8 * Math.cos(angle - 0.4), by - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(bx - 8 * Math.cos(angle + 0.4), by - 8 * Math.sin(angle + 0.4));
      ctx.fill();

      // Charges
      drawCharge(ctx, st.q1.x * w, st.q1.y * h, '#ff3b6e', st.q1NC >= 0 ? '+' : '−', 'Q₁', Math.abs(st.q1NC));
      drawCharge(ctx, st.q2.x * w, st.q2.y * h, '#5baef8', st.q2NC >= 0 ? '+' : '−', 'Q₂', Math.abs(st.q2NC));

      // Probes
      drawProbe(ctx, ax, ay, 'A');
      drawProbe(ctx, bx, by, 'B');

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={520} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Charge Q₁</LegendItem>
          <LegendItem swatchColor="var(--blue)" dot>Charge Q₂</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Probe A / B</LegendItem>
          <LegendItem swatchColor="var(--accent)">E field lines</LegendItem>
          <LegendItem swatchColor="var(--teal)" style={{ opacity: 0.7 }}>Equipotentials</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag charges &amp; probes</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q₁" label="Charge 1"
            value={q1NC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ1NC}
          />
          <Slider
            sym="Q₂" label="Charge 2"
            value={q2NC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ2NC}
          />
          <Slider
            sym="ε<sub>r</sub>" label="Rel. permittivity"
            value={er} min={1} max={80} step={0.1}
            format={v => v.toFixed(1)}
            metaLeft="1 (vacuum)" metaRight="80 (water)"
            onChange={setEr}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym={<>V<sub>A</sub></>} label="Potential at A"
            valueHTML={pretty(computed.VA)}
            unit="V"
          />
          <Readout
            sym={<>V<sub>B</sub></>} label="Potential at B"
            valueHTML={pretty(computed.VB)}
            unit="V"
          />
          <Readout
            sym="ΔV" label="Voltage A → B"
            valueHTML={pretty(computed.dV)}
            unit="V"
            highlight
          />
          <Readout
            sym={<>|E|<sub>A</sub></>} label="Field strength at A"
            valueHTML={pretty(computed.EmagA)}
            unit="V/m"
          />
          <Readout
            sym="d" label="Distance A → B"
            value={computed.distance_m.toFixed(3)}
            unit="m"
          />
          <Readout
            sym="W" label="Work to move +1 C, A → B"
            valueHTML={pretty(computed.work)}
            unit="J"
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>The intuition first</h3>
      <p>
        Forget wires for a second. Imagine standing on a hillside. Pick two points. The <strong>height difference</strong> between them tells you
        how much energy gravity will give you if you walk from the high one to the low one, or take from you if you walk uphill. That's the
        whole idea of potential.
      </p>
      <p>
        Voltage is the same thing for charge. Pick two points. The voltage between them is the energy the electric field will hand to a unit
        of positive charge as it moves from one to the other. <strong>A volt is a joule per coulomb.</strong> Move one coulomb between two points
        that differ by one volt and you've traded one joule of energy with the field<Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>
      <Pullout>
        Voltage is not a property of a place. It is a property of the <em>path between two places</em> in a field.
      </Pullout>

      <h3>The math, said out loud</h3>
      <p>
        Start with the electric field <strong>E</strong>. It points in the direction a positive test charge would accelerate — in newtons per
        coulomb. If you walk a tiny distance <strong>dℓ</strong> in the direction of the field, the force on a unit positive charge does work
        equal to <strong>E · dℓ</strong>. The dot product is the right object here: only the component of <strong>E</strong> along your direction
        of motion counts<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Walk from point <strong>a</strong> to point <strong>b</strong> and add up <strong>E · dℓ</strong> along every step. That line integral
        is the total work the field does on a unit positive charge. The voltage from a to b is defined to be the <em>negative</em> of that:
      </p>
      <MathBlock>V<sub>ab</sub> = V<sub>b</sub> − V<sub>a</sub> = −∫<sub>a</sub><sup>b</sup> E · dℓ</MathBlock>
      <p>
        Why the minus sign? Because <strong>V</strong> is defined to be high where positive charges <em>want to leave</em>. A positive charge gains
        kinetic energy moving from high V to low V. The field does positive work on it; V drops along <strong>E</strong>. The minus sign keeps
        the bookkeeping straight<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Why the path doesn't matter</h3>
      <p>
        The line integral above gives the same answer no matter what path you take from <strong>a</strong> to <strong>b</strong>. Straight line,
        spiral, around the moon — same number.
      </p>
      <p>
        This is because the electrostatic field is <strong>conservative</strong>: its curl is zero. That means you can write it as the gradient
        of a single scalar function, the electric potential <strong>V(x, y, z)</strong><Cite id="feynman-II-2" in={SOURCES} />. Once such a function
        exists, the integral between any two points depends only on the endpoints, like climbing a hill — the elevation change between two cities
        doesn't depend on the route you drove.
      </p>
      <p>
        For a single point charge <strong>Q</strong> at the origin, integrating <strong>E = kQ/r²</strong> from infinity inward gives
      </p>
      <MathBlock>V(r) = kQ / r</MathBlock>
      <p>
        For many charges, the field is the vector sum of each contribution, so the potential is the scalar sum — much easier to compute.
        That's the formula running in the lab above: V at any point is the algebraic sum of <strong>kQ₁/r₁</strong> and
        <strong> kQ₂/r₂</strong>, and the colored bands on the canvas are loci of constant V<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>The hard part: why this is "voltage"</h3>
      <p>
        In a circuit, "there's 9 volts across this battery" means: between the two terminals, the field has organized itself such that one joule
        is delivered per coulomb travelling from + to −. That field doesn't live inside the battery. The chemical reactions inside the battery
        <em> maintain</em> a charge separation; the resulting field fills the space around the circuit<Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>
      <p>
        When you measure 9 V at a wall outlet, you're really dragging a test charge through space from one terminal to the other and counting
        the work. The voltmeter does this electronically; the physical content is the same line integral the lab is drawing between probes
        <strong> A</strong> and <strong>B</strong>. The wire just defines where the integration path most naturally lies.
      </p>

      <h4>What the ε<sub>r</sub> slider does</h4>
      <p>
        In a dielectric (water, glass, plastic), the molecules polarize in the presence of an external field. Their dipoles align and produce
        a counter-field that reduces the net field everywhere. Both <strong>E</strong> and <strong>V</strong> get divided by
        <strong> ε<sub>r</sub></strong>, the relative permittivity<Cite id="griffiths-2017" in={SOURCES} />. Slide the permittivity up and watch
        the voltage between A and B drop by the same factor.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Two-Charge Potential Field"
      labId="potential-1.4 / V = −∫ E·dℓ"
      labContent={labContent}
      prose={prose}
    />
  );
}

function drawCharge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string,
  sign: string, label: string, magnitude: number,
) {
  const radius = 12 + Math.min(8, magnitude * 0.8);
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0a0b';
  ctx.font = `bold ${radius}px JetBrains Mono`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, cx, cy);
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(label, cx, cy + radius + 14);
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, label: string,
) {
  ctx.strokeStyle = '#ff6b2a';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10,10,11,.9)';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}
